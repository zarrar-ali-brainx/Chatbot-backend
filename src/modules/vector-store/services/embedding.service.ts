import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    })
  }

  /**
   * Generate embedding for a text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    return response.data[0].embedding;

  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })

    return response.data.map(item => item.embedding);

  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    let dotProduct = 0;
    for (let i =0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
    }

    const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (magnitude1 * magnitude2)

  }

  /**
   * Validate embedding vector
   */
  validateEmbedding(embedding: any): boolean {
    if (!Array.isArray(embedding)) {
      return false;
    }

    if (!embedding.every(val => typeof val === 'number')) {
      return false;
    }

    if (embedding.length != 1536) {
      return false;
    }
    
    return true;

  }
}
