import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as cheerio from 'cheerio';
import * as natural from 'natural';
import { Disease } from 'src/diseases/entities/disease.entity';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { LlmService } from 'src/llm/llm.service';
import { StructuredQuery } from 'src/interfaces/search.interface';
import { json } from 'stream/consumers';
// Define the interface for the LLM's parsed query

@Injectable()
export class SearchService {
  private stemmer = natural.PorterStemmer;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly llmService: LlmService,
  ) {}

  private _normalizeTerm(term: string): string {
    return this.stemmer.stem(term.toLowerCase());
  }

  async delete(disease: Disease) {
    return this.elasticsearchService.delete({
      index: 'diseases',
      id: disease.id,
    });
  }

  extractDataFromHtml(html: string) {
    const $ = cheerio.load(html);
    const plainText = $.text();

    return { plainText };
  }
  async indexDisease(disease: Disease) {
    // 1. Extract text
    const { plainText } = this.extractDataFromHtml(disease.html);
    const articlePlainText = plainText;
    const structuredData: any =
      await this.llmService.generateComplexDiseaseJson(articlePlainText);

    // 2. Build and get symptom embedding
    const symptomText = this.llmService.buildSymptomEmbeddingText(
      structuredData.symptoms_structured,
    );
    const embedding_symptoms = await this.llmService.getEmbedding(symptomText);

    // 3. Get raw keywords
    const symptoms_keywords_raw = structuredData.symptoms_structured.map(
      (s: any) => s.name,
    );

    // 4. Get NORMALIZED keywords using the new service
    const symptoms_normalized = await this.llmService.getNormalizedTermsList(
      symptoms_keywords_raw,
    );

    // 5. Build the final Elasticsearch document body
    const documentBody = {
      ...structuredData,
      plain_text: articlePlainText,
      embedding_symptoms,
      symptoms_keywords_raw, // e.g., ["Fever", "Tiredness"]
      symptoms_normalized, // e.g., ["fever", "fatigue"]
    };

    // 6. Index the document
    return await this.elasticsearchService.index({
      index: 'diseases',
      body: documentBody,
      id: disease.id,
    });
  }
  public async searchDiseasesBySymptomsD(
    paginationDto: PaginationDto,
  ): Promise<any> {
    let parsedPayload: any = {};

    try {
      // Handle cases where 'json' might be double-encoded
      const raw = paginationDto.json;
      if (typeof raw === 'string') {
        const onceParsed = JSON.parse(raw);
        parsedPayload =
          typeof onceParsed === 'string' ? JSON.parse(onceParsed) : onceParsed;
      }
    } catch (e) {
      parsedPayload = {};
    }

    const symptoms = Array.isArray(parsedPayload.symptoms)
      ? parsedPayload.symptoms
      : [];
    const bodyParts = Array.isArray(parsedPayload.bodyParts)
      ? parsedPayload.bodyParts
      : [];
    const patientDescription = paginationDto.query || '';

    const parsedQuery = await this.llmService.parseSymptomQuery({
      symptoms,
      bodyParts,
      patientDescription,
    });

    console.log('Parsed Query:', JSON.stringify(parsedQuery, null, 2));
    const aiSuggestion = await this.llmService.riskAndAIInsightsGoogle({
      symptoms,
      bodyParts,
      patientDescription,
    });
    return aiSuggestion;
    // -------------------------------
    // 1️⃣ Prepare symptom lists
    const positiveSymptoms = (parsedQuery.positive || []).map((t) =>
      this._normalizeTerm(t),
    );
    const negativeSymptoms = (parsedQuery.negative || []).map((t) =>
      this._normalizeTerm(t),
    );
    const uncertainSymptoms = (parsedQuery.uncertain || []).map((t) =>
      this._normalizeTerm(t),
    );

    // FIX: Define highSpecificitySymptoms Set to prevent ReferenceError.
    // Populate this set with terms that indicate a severe or highly specific condition.
    const highSpecificitySymptoms = new Set<string>([]);

    console.log('Positive symptoms:', positiveSymptoms);
    console.log('Negative symptoms:', negativeSymptoms);
    console.log('Uncertain symptoms:', uncertainSymptoms);

    // -------------------------------
    // 2️⃣ Build Elasticsearch query (incorporate location for better filtering)
    const locationClauses = [];

    // FIX: Process location-specific symptoms and build MUST clauses
    for (const symptom in parsedQuery.location) {
      if (parsedQuery.location.hasOwnProperty(symptom)) {
        const locations = parsedQuery.location[symptom];
        const normalizedSymptom = this._normalizeTerm(symptom);

        for (const location of locations) {
          const normalizedLocation = this._normalizeTerm(location);

          // Clause that MUST match both the symptom AND the location
          locationClauses.push({
            bool: {
              must: [
                {
                  multi_match: {
                    query: normalizedSymptom,
                    // fields: [
                    //   'symptoms_keywords^4',
                    //   'symptoms_structured.name^3',
                    // ],
                    fuzziness: 'AUTO',
                    boost: 2, // Boost the score for linked symptom+location
                  },
                },
                {
                  multi_match: {
                    query: normalizedLocation,
                    // fields: ['symptoms_keywords', 'body_locations_keywords'],
                    fuzziness: 'AUTO',
                    boost: 1.5,
                  },
                },
              ],
            },
          });

          // Remove the location-aware symptom from the general positive list
          // to prevent double-counting
          const indexToRemove = positiveSymptoms.indexOf(normalizedSymptom);
          if (indexToRemove > -1) {
            positiveSymptoms.splice(indexToRemove, 1);
          }
        }
      }
    }

    // Clauses for general positive symptoms (those remaining without a specified location)
    const positiveClauses = positiveSymptoms.map((symptom) => ({
      multi_match: {
        query: symptom,
        fields: [
          'symptoms_keywords^3',
          'symptoms_structured.name^2',
          'symptoms_structured.synonyms^2',
        ],
        fuzziness: 'AUTO',
      },
    }));

    const negativeClauses = negativeSymptoms.map((symptom) => ({
      multi_match: {
        query: symptom,
        fields: ['symptoms_keywords', 'symptoms_structured.synonyms'],
        fuzziness: 'AUTO',
      },
    }));

    const uncertainClauses = uncertainSymptoms.map((symptom) => ({
      multi_match: {
        query: symptom,
        fields: ['symptoms_keywords^0.3', 'symptoms_structured.synonyms^0.3'],
        fuzziness: 'AUTO',
      },
    }));

    const esQuery = {
      query: {
        bool: {
          // Include location clauses in the 'should' array for scoring
          should: [...positiveClauses, ...uncertainClauses, ...locationClauses],
          must_not: negativeClauses,
          minimum_should_match: 1,
        },
      },
      size: Math.min(paginationDto.limit * 5, 50), // Fetch more candidates
    };
    // -------------------------------
    // 3️⃣ Execute search
    const results = await this.elasticsearchService.search({
      index: 'diseases',
      ...esQuery,
    });

    console.log(`Found ${results.hits.hits.length} candidate diseases`);

    // -------------------------------
    // 4️⃣ Re-score results in application code
    const scoredResults = results.hits.hits.map((hit) => {
      const disease = hit._source;
      let score = 0;
      let penalty = 0;
      const matchedSymptoms = new Set<string>();
      const missedSymptoms = new Set<string>();
      const scoreBreakdown = [];

      // Helper function to check if symptom matches (unchanged)
      const checkSymptomMatch = (
        symptom: any,
        querySymptom: string,
      ): boolean => {
        if (!symptom || !symptom.name) return false;

        const symName = symptom.name.toLowerCase();
        const qSym = querySymptom.toLowerCase();

        // Check exact match
        if (symName === qSym) return true;

        // Check partial match
        if (symName.includes(qSym) || qSym.includes(symName)) return true;

        // Check synonyms
        if (symptom.synonyms && Array.isArray(symptom.synonyms)) {
          for (const synonym of symptom.synonyms) {
            const synLower = synonym.toLowerCase();
            if (
              synLower === qSym ||
              synLower.includes(qSym) ||
              qSym.includes(synLower)
            ) {
              return true;
            }
          }
        }

        return false;
      };

      // Score positive symptoms (including those that were location-aware)
      for (const querySymptom of [
        ...positiveSymptoms,
        ...Object.keys(parsedQuery.location || {}),
      ].map((t) => this._normalizeTerm(t))) {
        let found = false;
        let matchDetails = null;
        // @ts-expect-error type error

        for (const symptom of disease.symptoms_structured || []) {
          if (checkSymptomMatch(symptom, querySymptom)) {
            found = true;
            matchedSymptoms.add(querySymptom);

            // Use the structured data from the disease document for scoring
            const weight = symptom.weight || 5;
            const frequency = symptom.frequency_percent || 50;

            let specificity = 1.0;
            if (symptom.specificity === 'high') specificity = 10.0;
            else if (symptom.specificity === 'medium') specificity = 5.0;

            let intensityFactor = 1.0;
            // Use intensity from LLM if available
            if (parsedQuery.intensity && parsedQuery.intensity[querySymptom]) {
              const intensity = parsedQuery.intensity[querySymptom];
              if (intensity === 'severe') intensityFactor = 3.0;
              else if (intensity === 'moderate') intensityFactor = 1.5;
              else if (intensity === 'mild') intensityFactor = 0.7;
            }

            let durationFactor = 1.0;
            // Use duration from LLM if available
            if (parsedQuery.duration && parsedQuery.duration[querySymptom]) {
              if (parsedQuery.duration[querySymptom] === 'chronic') {
                durationFactor = frequency > 50 ? 4.0 : 2.0;
              }
            }

            const symptomScore =
              weight *
              specificity *
              (frequency / 100) *
              intensityFactor *
              durationFactor;
            score += symptomScore;

            matchDetails = {
              query: querySymptom,
              matched: symptom.name,
              score: symptomScore,
              breakdown: {
                weight,
                specificity,
                frequency,
                intensityFactor,
                durationFactor,
              },
            };

            break; // Stop searching structured symptoms once a match is found
          }
        }

        if (matchDetails) {
          scoreBreakdown.push(matchDetails);
        }

        // Penalize for missing symptoms
        if (!found) {
          missedSymptoms.add(querySymptom);

          if (highSpecificitySymptoms.has(querySymptom)) {
            penalty += 500; // MASSIVE penalty for missing signature symptoms
            scoreBreakdown.push({
              query: querySymptom,
              matched: null,
              penalty: 500,
              reason: 'HIGH-SPECIFICITY SYMPTOM MISSING',
            });
          } else {
            penalty += 30; // Moderate penalty for missing any symptom
            scoreBreakdown.push({
              query: querySymptom,
              matched: null,
              penalty: 30,
              reason: 'symptom missing',
            });
          }
        }
      }

      // Small bonus for matching uncertain symptoms
      for (const uncertainSymptom of uncertainSymptoms) {
        // @ts-expect-error for a reason

        for (const symptom of disease.symptoms_structured || []) {
          if (checkSymptomMatch(symptom, uncertainSymptom)) {
            score += 2;
            scoreBreakdown.push({
              query: uncertainSymptom,
              matched: symptom.name,
              score: 2,
              note: 'uncertain symptom bonus',
            });
            break;
          }
        }
      }

      // Penalty for negative symptoms being present
      for (const negativeSymptom of negativeSymptoms) {
        // @ts-expect-error
        for (const symptom of disease.symptoms_structured || []) {
          if (checkSymptomMatch(symptom, negativeSymptom)) {
            penalty += 100; // Large penalty for having a symptom the user negated
            scoreBreakdown.push({
              query: negativeSymptom,
              matched: symptom.name,
              penalty: 100,
              reason: 'Negative symptom present',
            });
            break;
          }
        }
      }

      const finalScore = Math.max(0, score - penalty);

      return {
        ...hit,
        _score: finalScore,
        _debug: {
          // @ts-expect-error some mismatch property
          disease_name: disease?.name,
          positive_score: Math.round(score * 100) / 100,
          penalty: Math.round(penalty * 100) / 100,
          final_score: Math.round(finalScore * 100) / 100,
          matched_symptoms: Array.from(matchedSymptoms),
          missed_symptoms: Array.from(missedSymptoms),
          score_breakdown: scoreBreakdown,
        },
      };
    });

    // -------------------------------
    // 5️⃣ Sort by custom score and limit results
    const sortedResults = scoredResults
      .filter((result) => result._score > 0) // Remove zero-score results
      .sort((a, b) => b._score - a._score)
      .slice(0, paginationDto.limit);

    console.log('\n=== TOP RESULTS ===');
    sortedResults.forEach((result, idx) => {
      console.log(`\n${idx + 1}. ${result._debug.disease_name}`);
      console.log(
        `   Score: ${result._debug.final_score} (positive: ${result._debug.positive_score}, penalty: ${result._debug.penalty})`,
      );
      console.log(`   Matched: ${result._debug.matched_symptoms.join(', ')}`);
      console.log(`   Missed: ${result._debug.missed_symptoms.join(', ')}`);
    });

    // Clean up results
    const data = sortedResults.map((item) => {
      if (item._source) {
        //@ts-expect-error no idea
        item._source.plain_text = 'none';
        //@ts-expect-error no idea
        item._source.embedding_symptoms = 'none';
      }
      return item;
    });

    return { data, aiSuggestion };
  }
}
