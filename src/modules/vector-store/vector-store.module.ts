import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { VectorStoreService } from './vector-store.service';
import { EmbeddingService } from './services/embedding.service';
import { VectorSearchService } from './services/vector-search.service';
import { DocumentChunk } from '../../entities/document-chunk.entity';

@Module({
  imports: [
    // Import TypeORM for DocumentChunk entity
    TypeOrmModule.forFeature([DocumentChunk]),
    // Import ConfigModule for OpenAI configuration
    ConfigModule,
  ],
  controllers: [],
  providers: [
    VectorStoreService,
    EmbeddingService,
    VectorSearchService,
  ],
  exports: [
    VectorStoreService,
    EmbeddingService,
    VectorSearchService,
  ], // Export services for use in other modules
})
export class VectorStoreModule {}
