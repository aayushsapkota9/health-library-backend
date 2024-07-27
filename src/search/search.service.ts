import { BadRequestException, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as cheerio from 'cheerio';
import * as natural from 'natural';
import nlp from 'compromise';
import { Disease } from 'src/diseases/entities/disease.entity';
import { POSSIBLE_SYMPTOMS } from 'src/constants/symptoms';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { STOP_WORDS } from 'src/constants/StopWords';

@Injectable()
export class SearchService {
  private tokenizer = new natural.WordTokenizer();
  private stemmer = natural.PorterStemmer;

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexDisease(disease: Disease) {
    const extractedData = this.extractDataFromHtml(disease.html);
    return this.elasticsearchService.index({
      index: 'diseases',
      id: disease.id,
      body: {
        ...disease,
        symptoms: extractedData.symptoms,
        plain_text: extractedData.plainText,
      },
    });
  }
  async delete(disease: Disease) {
    return this.elasticsearchService.delete({
      index: 'diseases',
      id: disease.id,
    });
  }

  async editDisease(disease: Disease) {
    const extractedData = this.extractDataFromHtml(disease.html);
    const { plainText, symptoms, ...others } = extractedData;

    return this.elasticsearchService.update({
      index: 'diseases',
      id: disease.id,
      body: {
        doc: {
          ...others,
          symptoms: symptoms ?? undefined,
          plain_text: plainText ?? undefined,
          ...disease,
        },
        doc_as_upsert: true,
      },
    });
  }

  extractDataFromHtml(html: string) {
    const $ = cheerio.load(html);
    const plainText = $.text();
    const symptoms = this.extractSymptoms(plainText);
    return { plainText, symptoms };
  }

  extractSymptoms(text) {
    //preprocess text: convert to lowercase, remove punctuation, and normalize spaces
    const lowerText = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s{2,}/g, ' ');

    const doc = nlp(lowerText);
    const symptoms = new Set();
    const possibleSymptoms = POSSIBLE_SYMPTOMS.map((symptom) =>
      symptom.toLowerCase(),
    );

    // Directly match multi-word symptoms
    possibleSymptoms.forEach((symptom) => {
      if (lowerText.includes(symptom)) {
        symptoms.add(symptom);
      }
    });

    //to find potential symptoms
    doc.match(possibleSymptoms.join('|')).forEach((match) => {
      const symptom = match.text().toLowerCase();
      symptoms.add(symptom);
    });

    //additional noun and adjective extraction
    doc.nouns().forEach((noun) => {
      const symptom = noun.text().toLowerCase();
      if (possibleSymptoms.includes(symptom)) {
        symptoms.add(symptom);
      }
    });

    doc.adjectives().forEach((adj) => {
      const symptom = adj.text().toLowerCase();
      if (possibleSymptoms.includes(symptom)) {
        symptoms.add(symptom);
      }
    });

    if (symptoms.size === 0) {
      throw new BadRequestException(`Out system couldn't detect any symptoms.`);
    }

    return Array.from(symptoms).join(', ');
  }
  async searchDisease(paginationDto: PaginationDto) {
    const { query, page, limit } = paginationDto;

    const tokens = this.tokenizer.tokenize(query);

    const filteredTokens = tokens.filter(
      (token) => !STOP_WORDS.includes(token.toLowerCase()),
    );

    const stemmedTokens = filteredTokens.map((token) =>
      this.stemmer.stem(token),
    );

    const processedQuery = stemmedTokens.join(' ');
    const body = await this.elasticsearchService.search({
      index: 'diseases',
      body: {
        query: {
          bool: {
            should: [
              {
                match: {
                  name: {
                    query: processedQuery,
                    boost: 2, // Higher priority for name matches
                  },
                },
              },
              {
                multi_match: {
                  query: processedQuery,
                  fields: ['symptoms', 'plain_text'],
                },
              },
            ],
          },
        },
        size: limit,
        from: (page - 1) * limit,
      },
    });

    return body.hits.hits.map((hit) => hit._source);
  }
}
