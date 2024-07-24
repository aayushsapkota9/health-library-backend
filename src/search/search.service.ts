import { BadRequestException, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as cheerio from 'cheerio';
import * as natural from 'natural';
import nlp from 'compromise';
import { Disease } from 'src/diseases/entities/disease.entity';
import { POSSIBLE_SYMPTOMS } from 'src/constants/symptoms';

@Injectable()
export class SearchService {
  private tokenizer = new natural.WordTokenizer();
  private stemmer = natural.PorterStemmer;

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexDisease(disease: Disease) {
    const extractedData = this.extractDataFromHtml(disease.html);
    console.log(extractedData);
    return this.elasticsearchService.index({
      index: 'diseases',
      body: {
        ...disease,
        symptoms: extractedData.symptoms,
        plain_text: extractedData.plainText,
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
    // Preprocess text: convert to lowercase, remove punctuation, and normalize spaces
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

    // Use compromise to find potential symptoms
    doc.match(possibleSymptoms.join('|')).forEach((match) => {
      const symptom = match.text().toLowerCase();
      symptoms.add(symptom);
    });

    // Additional noun and adjective extraction
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
  async searchDisease(query: string) {
    const tokens = this.tokenizer.tokenize(query);
    const stemmedTokens = tokens.map((token) => this.stemmer.stem(token));
    const processedQuery = stemmedTokens.join(' ');
    const body = await this.elasticsearchService.search({
      index: 'diseases',
      body: {
        query: {
          multi_match: {
            query: processedQuery,
            fields: ['name^2', 'symptoms', 'plain_text', 'description_html'],
          },
        },
      },
    });
    console.log(body);
    return body.hits.hits.map((hit) => hit._source);
  }
}
