import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UpdateLlmDto } from './dto/update-llm.dto';
import fetch from 'node-fetch';
import { GoogleGenAI } from '@google/genai';
import {
  EXTRACT_COMPLEX_DISEASE_DATA_PROMPT,
  NORMALIZE_SYMPTOMS_PROMPT,
  PARSE_SYMPTOM_QUERY_PROMPT,
  RISK_AND_AI_INSIGHTS_PROMPT,
} from './const/customPrompt';
import { IParsedQuery } from 'src/interfaces/search.interface';
interface SearchQueries {
  symptoms: Array<string>;
  bodyParts: Array<string>;
  patientDescription: string;
}
@Injectable()
export class LlmService {
  //this fn extracts symptoms from articles
  async generateComplexDiseaseJson(plainText: string): Promise<any> {
    const prompt = EXTRACT_COMPLEX_DISEASE_DATA_PROMPT.replace(
      '{{plainText}}',
      plainText,
    );

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
    // Note: 'gemini-2.5-flash' is not a public model name.
    // I'll use 'gemini-1.5-flash' which is standard.
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',

        contents: prompt,
      });

      let text = res.candidates[0]?.content?.parts[0]?.text;

      // // Clean up potential markdown formatting from the AI
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');

      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON from Gemini:', text);
        throw new Error('Unexpected response format from AI');
      }
    } catch (error) {
      console.log(error);
      throw new ServiceUnavailableException(
        "google llm not avilable. Can't parse to json",
      );
    }
  }
  //get embedding during indexing
  async getEmbedding(text: string): Promise<number[]> {
    const API_URL = process.env.EMBEDDING_GEMMA_MEDICAL_300M_URL;
    const TOKEN = process.env.HF_TOKEN;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    });

    const data = await res.json();
    // Handle different successful response structures
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0]; // HuggingFace sentence-transformers format
    }
    if (Array.isArray(data) && typeof data[0] === 'number') {
      return data; // Simple array format
    }
    if (data?.embeddings && Array.isArray(data.embeddings[0])) {
      return data.embeddings[0]; // Another common format
    }
    if (data?.error) {
      throw new BadRequestException('Unexpected error with HF api');
    }

    throw new Error('Unexpected embedding response: ' + JSON.stringify(data));
  }
  //individual symptom embedding
  buildSymptomEmbeddingText(
    symptoms: {
      name: string;
      weight: number;
      specificity: string;
    }[],
  ): string {
    if (!symptoms || symptoms.length === 0) {
      return '';
    }

    const symptomStrings = symptoms.map(
      (s) =>
        `${s.name.replace(/_/g, ' ')} (importance ${s.weight}, specificity ${
          s.specificity
        })`,
    );

    return `Key symptoms include: ${symptomStrings.join('; ')}.`;
  }
  findAll() {
    return `This action returns all llm`;
  }

  findOne(id: number) {
    return `This action returns a #${id} llm`;
  }

  update(id: number, updateLlmDto: UpdateLlmDto) {
    console.log(updateLlmDto);
    return `This action updates a #${id} llm`;
  }

  remove(id: number) {
    return `This action removes a #${id} llm`;
  }

  /**
   * NEW FUNCTION: Parses a user's natural language query into
   * structured positive and negative symptoms.
   */
  async parseSymptomQuery({
    symptoms,
    bodyParts,
    patientDescription,
  }: SearchQueries): Promise<IParsedQuery> {
    const prompt = PARSE_SYMPTOM_QUERY_PROMPT.replace(
      '{{symptoms}}',
      JSON.stringify(symptoms || []),
    )
      .replace('{{bodyParts}}', JSON.stringify(bodyParts || []))
      .replace('{{patientDescription}}', patientDescription || '');

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
      });
      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',

        contents: prompt,
      });
      const text = res.candidates[0]?.content?.parts[0]?.text;

      if (!text) {
        throw new Error('No text response from AI');
      }

      // Clean up potential markdown formatting from the AI
      const cleanedText = text
        .replace(/^```json\n?/, '')
        .replace(/\n?```$/, '');

      try {
        return JSON.parse(cleanedText);
      } catch (e) {
        console.error('Failed to parse JSON from Gemini (Query):', cleanedText);
        throw new Error('Unexpected response format from AI');
      }
    } catch (error) {
      console.error('Error calling Google AI (Query):', error.message);
      throw new ServiceUnavailableException(
        "Google LLM not available. Can't parse query.",
      );
    }
  }

  async getNormalizedSymptomMap(
    symptoms: string[],
  ): Promise<Record<string, string>> {
    if (!symptoms || symptoms.length === 0) {
      return {};
    }
    const uniqueSymptoms = [...new Set(symptoms)];
    const prompt = [
      {
        parts: [
          {
            text: NORMALIZE_SYMPTOMS_PROMPT.replace(
              '{{plainText}}',
              JSON.stringify(uniqueSymptoms),
            ),
          },
        ],
      },
    ];
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash',

      contents: prompt,
    });
    let text = res.candidates[0]?.content?.parts[0]?.text;
    if (!text) {
      throw new Error('Unexpected response format from AI');
    }
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    try {
      return JSON.parse(text) as Record<string, string>;
    } catch (e) {
      throw new Error('Unexpected response format from AI');
    }
  }

  async getNormalizedTermsList(symptoms: string[]): Promise<string[]> {
    const symptomMap = await this.getNormalizedSymptomMap(symptoms);
    const normalizedTerms = Object.values(symptomMap);
    return [...new Set(normalizedTerms)]; // Return unique normalized terms
  }
  async riskAndAIInsightsHG({
    symptoms,
    bodyParts,
    patientDescription,
  }: SearchQueries) {
    const API_URL = process.env.MEDGEMMA_ASSIST_4B_URL;
    const TOKEN = process.env.HF_TOKEN;
    const text = RISK_AND_AI_INSIGHTS_PROMPT.replace(
      '{{symptoms}}',
      JSON.stringify(symptoms),
    )
      .replace('{{bodyParts}}', JSON.stringify(bodyParts))
      .replace('{{patientDescription}}', patientDescription);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    });

    const data = await res.json();
    return data;
  }
  async riskAndAIInsightsGoogle({
    symptoms,
    bodyParts,
    patientDescription,
  }: SearchQueries) {
    const prompt = RISK_AND_AI_INSIGHTS_PROMPT.replace(
      '{{symptoms}}',
      JSON.stringify(symptoms),
    )
      .replace('{{bodyParts}}', JSON.stringify(bodyParts))
      .replace('{{patientDescription}}', patientDescription);

    let text: string | undefined;

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
      });

      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      text = res.candidates[0]?.content?.parts[0]?.text;

      if (!text) {
        throw new Error('No text response from AI');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('Failed to get AI insights');
    }

    const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    try {
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error(
        'Failed to parse JSON from Gemini (Query):',
        cleanedText,
        e,
      );
      throw new Error('Unexpected response format from AI');
    }
  }
}
