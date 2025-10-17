import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { FileParserService } from './services/file-parser.service';
import { ChunkingService } from './services/chunking.service';
import { Document } from '../../entities/document.entity';
import { DocumentChunk } from '../../entities/document-chunk.entity';
import { VectorStoreModule } from '../vector-store/vector-store.module';

@Module({
  imports: [
    // Import TypeORM for Document and DocumentChunk entities
    TypeOrmModule.forFeature([Document, DocumentChunk]),
    // Import VectorStoreModule for embedding generation
    VectorStoreModule,
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    FileParserService,
    ChunkingService,
  ],
  exports: [DocumentsService], // Export DocumentsService for use in other modules
})
export class DocumentsModule {}
