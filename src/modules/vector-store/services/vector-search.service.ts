import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { DocumentChunk } from '../../../entities/document-chunk.entity';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class VectorSearchService {
  constructor(
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Find similar chunks using vector similarity search
   */
  async findSimilarChunks(
    queryEmbedding: number[],
    userId: number,
    limit: number = 5,
    threshold: number = 0.3
  ): Promise<DocumentChunk[]> {
    const chunks = await this.chunkRepository.find({
      where: {
        user_id: userId,
        embedding: Not(IsNull())
      }
    });

    const chunksWithSimilarity = chunks.map(chunk => {
      const embedding = chunk.embedding ? JSON.parse(chunk.embedding) : []; // Parse JSON string to number array
      const similarity = this.embeddingService.calculateSimilarity(
        queryEmbedding,
        embedding
      );
      return {
        ...chunk,
        similarity
      };
    });

    const similarChunks = chunksWithSimilarity
      .filter(chunk => chunk.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarChunks.map(({ similarity, ...chunk }) => chunk)

  }

  /**
   * Find similar chunks for a specific document
   */
  async findSimilarChunksInDocument(
    queryEmbedding: number[],
    documentId: number,
    userId: number,
    limit: number = 5,
    threshold: number = 0.3
  ): Promise<DocumentChunk[]> {
    const chunks = await this.chunkRepository.find({
      where: {
        document_id: documentId,
        user_id: userId,
        embedding: Not(IsNull())
      }
    });
  
    const chunksWithSimilarity = chunks.map( chunk => {
      const embedding = chunk.embedding ? JSON.parse(chunk.embedding) : []; // Parse JSON string to number array
      const similarity = this.embeddingService.calculateSimilarity(
        queryEmbedding,
        embedding
      );
      return {
        ...chunk,
        similarity
      }
    }) 

    const similarChunks = chunksWithSimilarity
      .filter(chunk => chunk.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    return similarChunks.map(({ similarity, ...chunk }) => chunk)
  }

  /**
   * Get chunks by similarity range
   */
  async findChunksBySimilarityRange(
    queryEmbedding: number[],
    userId: number,
    minSimilarity: number,
    maxSimilarity: number,
    limit: number = 10
  ): Promise<DocumentChunk[]> {
    const chunks = await this.chunkRepository.find({
      where: {
        user_id: userId,
        embedding: Not(IsNull())
      }
    });

    const chunksWithSimilarity = chunks.map( chunk => {
      const embedding = chunk.embedding ? JSON.parse(chunk.embedding) : []; // Parse JSON string to number array
      const similarity = this.embeddingService.calculateSimilarity(
        queryEmbedding,
        embedding
      );
      return {
        ...chunk,
        similarity
      }
    })
    const similarChunks = chunksWithSimilarity
      .filter(chunk => chunk.similarity >= minSimilarity && chunk.similarity <= maxSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    return similarChunks.map(({ similarity, ...chunk }) => chunk)

  }

  /**
   * Get most similar chunk for a query
   */
  async findMostSimilarChunk(
    queryEmbedding: number[],
    userId: number
  ): Promise<DocumentChunk | null> {

    const chunks = await this.chunkRepository.find({
      where: {
        user_id: userId,
        embedding: Not(IsNull())
      }
    });
    const chunksWithSimilarity = chunks.map( chunk => {
      const embedding = chunk.embedding ? JSON.parse(chunk.embedding) : []; // Parse JSON string to number array
      const similarity = this.embeddingService.calculateSimilarity(
        queryEmbedding,
        embedding
      );
      return {
        ...chunk,
        similarity
      }
    })
    const mostSimilar = chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity)[0];
    return mostSimilar ? (({ similarity, ...chunk }) => chunk)(mostSimilar) : null;  }

  /**
   * Search chunks by text content and similarity
   */
  async hybridSearch(
    query: string,
    queryEmbedding: number[],
    userId: number,
    limit: number = 5,
    threshold: number = 0.3
  ): Promise<DocumentChunk[]> {
    const textResults = await this.chunkRepository
      .createQueryBuilder('chunk')
      .where('chunk.user_id = :userId', { userId })
      .andWhere('chunk.content ILIKE :query', { query: `%${query}%` })
      .getMany();

    const textResultsWithSimilarity = textResults.map(chunk => {
      const embedding = chunk.embedding ? JSON.parse(chunk.embedding) : []; // Parse JSON string to number array
      const similarity = this.embeddingService.calculateSimilarity(
        queryEmbedding,
        embedding
      );
      return {
        ...chunk,
        similarity
      }
    })
    const hybridResults = textResultsWithSimilarity
      .filter(chunk => chunk.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    return hybridResults.map(({ similarity, ...chunk }) => chunk)
  }
}