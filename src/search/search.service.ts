import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as cheerio from 'cheerio';
import * as natural from 'natural';
import nlp from 'compromise';

@Injectable()
export class SearchService {
  private tokenizer = new natural.WordTokenizer();
  private stemmer = natural.PorterStemmer;

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexDisease(disease: any) {
    const extractedData = this.extractDataFromHtml(disease.description_html);

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

  extractSymptoms(text: string): string {
    const doc = nlp(text);
    const symptoms = new Set<string>();

    const possibleSymptoms = [
      'fever',
      'cough',
      'headache',
      'fatigue',
      'sore throat',
      'nausea',
      'vomiting',
      'diarrhea',
      'chills',
      'shortness of breath',
      'muscle aches',
      'runny nose',
      'congestion',
      'loss of taste',
      'loss of smell',
    ];

    // Look for symptom-related words using part-of-speech tagging and known symptoms
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

    // Enhance detection by looking at verb-adjective or noun-adjective pairs
    doc.match('#Verb #Adjective').forEach((match) => {
      const symptom = match.out('normal').toLowerCase();
      if (possibleSymptoms.some((s) => symptom.includes(s))) {
        symptoms.add(symptom);
      }
    });

    doc.match('#Noun #Adjective').forEach((match) => {
      const symptom = match.out('normal').toLowerCase();
      if (possibleSymptoms.some((s) => symptom.includes(s))) {
        symptoms.add(symptom);
      }
    });

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
    return body.hits.hits.map((hit) => hit._source);
  }
}
