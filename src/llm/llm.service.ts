import { Injectable } from '@nestjs/common';
import { CreateLlmDto } from './dto/create-llm.dto';
import { UpdateLlmDto } from './dto/update-llm.dto';
import fetch from 'node-fetch';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class LlmService {
  async create(createLlmDto: CreateLlmDto) {
    console.log(createLlmDto);
    const API_URL =
      'https://v44k8w3oesknu89c.us-east-1.aws.endpoints.huggingface.cloud';
    const TOKEN = process.env.HF_TOKEN;

    async function generate(prompt) {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { max_new_tokens: 50 },
        }),
      });
      const data = await res.json();
      return data;
    }

    const data = await generate('Do you understand nepali? ');
    const translated = await this.translate(
      'Explain how AI works in few words',
    );

    return {
      data,
      translated,
    };
  }

  async translate(text: string) {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
    });
    return response;
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
}
