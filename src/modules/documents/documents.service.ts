import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Document } from '../../entities/document.entity';
import { DocumentChunk } from '../../entities/document-chunk.entity';
import { FileParserService } from './services/file-parser.service';
import { ChunkingService } from './services/chunking.service';
import { VectorStoreService } from '../vector-store/vector-store.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    private readonly fileParserService: FileParserService,
    private readonly chunkingService: ChunkingService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  /**
   * Upload and process a document
   */
  async uploadDocument(file: Express.Multer.File, userId: number): Promise<Document> {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'text/plain'];
    if(!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if(file.size > maxSize) {
      throw new BadRequestException('File size too large');
    }

    const content = await this.fileParserService.parseFile(file);

    const chunks = await this.chunkingService.chunkText(content);

    const document = this.documentRepository.create({
      filename: file.originalname, // Use originalname as filename
      original_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size,
      content: content,
      user_id: userId,
    });
    const savedDocument = await this.documentRepository.save(document);

    const chunkEntities = chunks.map((chunk, index) => 
      this.chunkRepository.create({
        content: chunk,
        chunk_index: index,
        document_id: savedDocument.id,
        user_id: userId,
      })
    );

    await this.chunkRepository.save(chunkEntities);

    // Generate embeddings for the chunks
    await this.vectorStoreService.generateEmbeddingsForDocument(savedDocument.id, userId);

    return savedDocument;
  }

  /**
   * Find documents by user ID
   */
  async findByUserId(userId: number): Promise<Document[]> {
    return this.documentRepository.find({ 
      where: { user_id: userId }, 
      order: { created_at: 'DESC' } 
    });
  }

  /**
   * Find document by ID and user ID
   */
  async findById(id: number, userId: number): Promise<Document> {
    const document = await this.documentRepository.findOne({ 
      where: { id, user_id: userId } 
    });
    if(!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  /**
   * Get document chunks
   */
  async getChunks(id: number, userId: number): Promise<DocumentChunk[]> {
    const document = await this.findById(id, userId);
    if(document.user_id !== userId) {
      throw new ForbiddenException('You are not authorized to access this document');
    }
    return this.chunkRepository.find({
      where: { document_id: id},
      order: { chunk_index: 'ASC'}
    });
  }

  /**
   * Delete document and all related chunks
   */
  async remove(id: number, userId: number): Promise<{ message: string }> {
    const document = await this.findById(id, userId);

    // Delete all chunks for this document
    await this.chunkRepository.delete({ document_id: id, user_id: userId });

    // Delete the document
    await this.documentRepository.delete(document.id);

    return { message: 'Document deleted successfully' };
  }
}
