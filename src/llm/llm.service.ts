import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateLlmDto } from './dto/create-llm.dto';
import { UpdateLlmDto } from './dto/update-llm.dto';
import fetch from 'node-fetch';
import { GoogleGenAI } from '@google/genai';
import { response } from 'express';
import {
  EXTRACT_COMPLEX_DISEASE_DATA_PROMPT,
  PARSE_SYMPTOM_QUERY_PROMPT,
} from './const/customPrompt';
import { IParsedQuery } from 'src/interfaces/search.interface';

@Injectable()
export class LlmService {
  // This is the new, powerful function
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
  // embedding.service.ts

  /**
   * A generic function to get an embedding for ANY text.
   * This replaces your 'getEmbeddingFromSymptoms'
   */
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

  /**
   * This helper builds the rich text string for symptom embedding
   * from your new 'symptoms_structured' array.
   * This replaces your old 'buildEmbeddingText'.
   */
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
  async parseSymptomQuery(queryText: string): Promise<IParsedQuery> {
    const prompt = PARSE_SYMPTOM_QUERY_PROMPT.replace(
      '{{queryText}}',
      queryText,
    );

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
      });
      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',

        contents: prompt,
      });
      let text = res.candidates[0]?.content?.parts[0]?.text;

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
}
