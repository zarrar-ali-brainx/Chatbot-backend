import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { DocumentChunk } from '../../entities/document-chunk.entity';
import { EmbeddingService } from './services/embedding.service';
import { VectorSearchService } from './services/vector-search.service';

@Injectable()
export class VectorStoreService {
  constructor(
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorSearchService: VectorSearchService,
  ) {}

  /**
   * Generate embeddings for document chunks and store them
   */
  async generateEmbeddingsForDocument(documentId: number, userId: number): Promise<{ message: string; processedChunks: number }> {
    const chunks = await this.chunkRepository.find({
      where: {document_id: documentId, user_id: userId},
      order: {chunk_index: 'ASC'}
    });

    const chunksWithEmbeddings: DocumentChunk[] = [];
    for (const chunk of chunks) {
      const embedding = await this.embeddingService.generateEmbedding(chunk.content);
      chunksWithEmbeddings.push({
        ...chunk,
        embedding: JSON.stringify(embedding) // Convert to JSON string
      })
    }
    
    for (const chunk of chunksWithEmbeddings) {
      await this.chunkRepository.update(chunk.id, {
        embedding: chunk.embedding
      })
    }

    return {
      message: 'Embeddings generated successfully',
      processedChunks: chunksWithEmbeddings.length
    };
  }

  /**
   * Search for similar chunks using vector similarity
   */
  async searchSimilarChunks(query: string, userId: number, limit: number = 5): Promise<DocumentChunk[]> {
    const queryEmbedding = await this.embeddingService.generateEmbeddings([query]);

    const similarChunks = await this.vectorSearchService.findSimilarChunks(
      queryEmbedding[0],
      userId,
      limit
    )

    return similarChunks;
  }

  /**
   * Get chunks with embeddings for a specific document
   */
  async getChunksWithEmbeddings(documentId: number, userId: number): Promise<DocumentChunk[]> {
    
    const chunks = await this.chunkRepository.find({
      where: {
        document_id: documentId,
        user_id: userId,
        embedding: Not(IsNull())
      },
      order: { chunk_index: 'ASC' }
    });
    
    return chunks;
  }

  /**
   * Delete embeddings for a document (when document is deleted)
   */
  async deleteEmbeddingsForDocument(documentId: number, userId: number): Promise<{ message: string }> {
    const chunks = await this.chunkRepository.find({
      where: { document_id: documentId, user_id: userId}
    });

    for (const chunk of chunks) {
      await this.chunkRepository.update(chunk.id, {
        embedding: null
      });
    }
    
    return { message: "Embeddings deleted successfully" };

  }
}
