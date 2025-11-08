import { BadRequestException, Injectable } from '@nestjs/common';
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

    const plainTextNepali = `
सामान्य चिसो (Common Cold)

सामान्य चिसो भनेको तपाईंको नाक, साइनस, घाँटी र श्वास नलीमा हुने संक्रमण हो। चिसो सजिलै फैलिन्छ, विशेष गरी घर, कक्षा र कार्यालयमा। २० भन्दा बढी भिन्न भाइरसहरूले चिसो निम्त्याउन सक्छन्। सामान्य चिसोको लागि ठ्याक्कै उपचार छैन, तर प्रायः एक हप्तादेखि १० दिन भित्र निको हुन्छ। यदि १० दिनसम्म स्वास्थ्य सुधार हुँदैन भने स्वास्थ्यकर्मीलाई देखाउनुहोस्।

लक्षणहरू

सामान्य लक्षणहरूमा ज्वरो, खोकी, घाँटी दुख, टाउको दुख, थकान, सास फेर्न गाह्रो, हात दुखाइ, पिठ्यु दुखाइ, पेट दुखाइ, वाकवाकी, पखाला, मांसपेशी दुखाइ, र्‍याश, नाक बन्द हुनु, नाकबाट पानी आउनु, स्वाद गुम्नु, गन्ध गुम्नु आदि पर्न सक्छन्। केही व्यक्तिहरूले झुक्किनु, कम्जोरी, सुई–सुई महसुस, छालामा चिलाउने, वा निन्द्रा नलाग्ने अनुभव गर्न सक्छन्।

उपचार र सावधानी

धेरैजसो अवस्थामा आराम, पानी प्रशस्त पिउनु, र आवश्यक परेमा घरेलु औषधिहरू पर्याप्त हुन्छन्। हात धुने, मास्क लगाउने, र भीडभाड कम गर्ने जस्ता सावधानीहरूले संक्रमण फैलिनबाट बचाउँछ।
`;
    console.log(this.extractSymptomsNep(plainTextNepali));

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

  extractSymptomsNep(text: string): string {
    function normalize(text: string): string {
      return text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .toLowerCase();
    }

    // Create root forms of symptoms for flexible matching
    const symptomRoots = POSSIBLE_SYMPTOMS_NEPALI.map((symptom) => {
      const words = normalize(symptom).split(' ');
      const rootWords = words.map((word) =>
        word.replace(/एको|एको|ए|आई|यो|छ/g, ''),
      ); // remove common Nepali suffixes
      return rootWords.join(' ');
    });

    const lowerText = normalize(text);
    const symptoms = new Set<string>();
    const possibleSymptoms = POSSIBLE_SYMPTOMS_NEPALI.map((symptom) =>
      symptom.toLowerCase(),
    );

    // Direct match of symptoms
    possibleSymptoms.forEach((symptom, index) => {
      const root = symptomRoots[index];
      if (lowerText.includes(root)) {
        symptoms.add(symptom);
      }
    });

    // Optional: token-level match for multi-word phrases
    const words = lowerText.split(' ');
    possibleSymptoms.forEach((symptom, index) => {
      const root = symptomRoots[index];
      const rootWords = root.split(' ');
      const found = rootWords.every((rw) => words.some((w) => w.includes(rw)));
      if (found) symptoms.add(symptom);
    });

    if (symptoms.size === 0) {
      throw new BadRequestException(
        `हाम्रो सिस्टमले कुनै लक्षण पत्ता लगाउन सकेन।`,
      );
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
