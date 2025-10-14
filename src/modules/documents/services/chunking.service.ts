import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkingService {
  private readonly CHUNK_SIZE = 1000; // Characters per chunk
  private readonly CHUNK_OVERLAP = 200; // Overlap between chunks

  /**
   * Split text into chunks for vector storage
   */
  async chunkText(text: string): Promise<string[]> {

    // Example implementation:
    const sentences = this.splitIntoSentences(text);
    const chunks = this.createChunks(sentences);
    return chunks;
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    const sentenceRegex = /[.!?]+/;
    return text.split(sentenceRegex).filter(sentence => sentence.trim().length > 0);
  }

  /**
   * Create chunks from sentences with overlap
   */
  private createChunks(sentences: string[]): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    let currentSize = 0;
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceSize = sentence.length;

      if (currentSize + sentenceSize > this.CHUNK_SIZE && currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence;
        currentSize = sentenceSize;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
        currentSize += sentenceSize;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }

    return chunks;
  }

  /**
   * Calculate chunk overlap for better context
   */
  private calculateOverlap(chunk: string): string {
    if (chunk.length <= this.CHUNK_OVERLAP) {
      return chunk;
    }
    return chunk.slice(-this.CHUNK_OVERLAP);
  }
}
