import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as cheerio from 'cheerio';
import * as natural from 'natural';
import nlp from 'compromise';
import { Disease } from 'src/diseases/entities/disease.entity';
import {
  POSSIBLE_SYMPTOMS,
  POSSIBLE_SYMPTOMS_NEPALI,
} from 'src/constants/symptoms';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { STOP_WORDS } from 'src/constants/StopWords';
import { LlmService } from 'src/llm/llm.service';
import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { parse } from 'path';
import { StructuredQuery } from 'src/interfaces/search.interface';
// Define the interface for the LLM's parsed query

@Injectable()
export class SearchService {
  private tokenizer = new natural.WordTokenizer();
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
    // extract text and symptoms from your HTML/article
    const { plainText } = this.extractDataFromHtml(disease.html);
    const articlePlainText = plainText;
    const structuredData: StructuredQuery =
      await this.llmService.generateComplexDiseaseJson(articlePlainText);

    // // 2. Generate the "general" embedding from the full text
    // const embedding_general =
    //   await this.llmService.getEmbedding(articlePlainText);

    // 3. Build the rich symptom text for the symptom embedding
    const symptomText = this.llmService.buildSymptomEmbeddingText(
      structuredData.symptoms_structured,
    );

    // 4. Generate the "symptom-specific" embedding
    const embedding_symptoms = await this.llmService.getEmbedding(symptomText);

    // 5. Create a simple keyword list for basic filtering
    const symptoms_keywords = structuredData.symptoms_structured.map(
      (s: any) => s.name,
    );

    // 6. Build the final Elasticsearch document body
    const documentBody = {
      ...structuredData,
      plain_text: articlePlainText,
      // embedding_general,
      embedding_symptoms,
      symptoms_keywords,
    };

    // 7. Index the document
    return await this.elasticsearchService.index({
      index: 'diseases',
      id: disease.id,
      body: documentBody,
    });
  }
  public async searchDiseasesBySymptomsD(
    paginationDto: PaginationDto,
  ): Promise<any> {
    const parsedQuery = await this.llmService.parseSymptomQuery(
      paginationDto.query,
    );

    console.log('Parsed Query:', JSON.stringify(parsedQuery, null, 2));

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

    console.log('Positive symptoms:', positiveSymptoms);
    console.log('Negative symptoms:', negativeSymptoms);
    console.log('Uncertain symptoms:', uncertainSymptoms);

    // High-specificity symptoms that should heavily penalize diseases if missing
    const highSpecificitySymptoms = new Set([
      // Jaundice-related
      'jaundice',
      'yellow_skin_and_eyes',
      'yellowing',
      'yellow_eyes',
      'yellow_skin',
      'icterus',
      'scleral_icterus',
      'dark_colored_urine',
      'dark_urine',
      'pale_colored_stool',
      'pale_stool',
      'clay_colored_stool',

      // Respiratory-specific
      'hemoptysis',
      'coughing_up_blood',
      'blood_in_sputum',

      // Neurological-specific
      'loss_of_smell',
      'loss_of_taste',
      'anosmia',
      'ageusia',

      // Skin-specific (when related to liver)
      'pruritus',
      'itchy_skin',
      'itching',
      'severe_itching',
    ]);

    // -------------------------------
    // 2️⃣ Build Elasticsearch query (simpler, no complex script)
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
          should: [...positiveClauses, ...uncertainClauses],
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

      // Helper function to check if symptom matches
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

      // Score positive symptoms
      for (const querySymptom of positiveSymptoms) {
        let found = false;
        let matchDetails = null;
        // @ts-ignore

        for (const symptom of disease.symptoms_structured || []) {
          if (checkSymptomMatch(symptom, querySymptom)) {
            found = true;
            matchedSymptoms.add(querySymptom);

            const weight = symptom.weight || 5;
            const frequency = symptom.frequency_percent || 50;

            let specificity = 1.0;
            if (symptom.specificity === 'high') specificity = 10.0;
            else if (symptom.specificity === 'medium') specificity = 5.0;

            let intensityFactor = 1.0;
            if (parsedQuery.intensity && parsedQuery.intensity[querySymptom]) {
              const intensity = parsedQuery.intensity[querySymptom];
              if (intensity === 'severe') intensityFactor = 3.0;
              else if (intensity === 'moderate') intensityFactor = 1.5;
              else if (intensity === 'mild') intensityFactor = 0.7;
            }

            let durationFactor = 1.0;
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

            break;
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
        // @ts-ignore

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

      const finalScore = Math.max(0, score - penalty);

      return {
        ...hit,
        _score: finalScore,
        _debug: {
          // @ts-ignore
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
        `   Score: ${result._debug.final_score} (positive: ${result._debug.positive_score}, penalty: ${result._debug.penalty})`,
      );
      console.log(`   Matched: ${result._debug.matched_symptoms.join(', ')}`);
      console.log(`   Missed: ${result._debug.missed_symptoms.join(', ')}`);
    });

    // Clean up results
    const data = sortedResults.map((item) => {
      if (item._source) {
        //@ts-ignore
        item._source.plain_text = 'none';
        //@ts-ignore
        item._source.embedding_symptoms = 'none';
      }
      return item;
    });

    return data;
  }
}
