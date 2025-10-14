import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Request,
  ParseIntPipe 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('docs')
@UseGuards(JwtAuthGuard) // All document endpoints require authentication
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Upload a document
   * POST /docs/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Handle file upload
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.documentsService.uploadDocument(file, userId);
  }

  /**
   * Get all documents for current user
   * GET /docs
   */
  @Get()
  async getUserDocuments(@Request() req) {
    const userId = req.user.id;
    return this.documentsService.findByUserId(userId);
  }

  /**
   * Get document by ID
   * GET /docs/:id
   */
  @Get(':id')
  async getDocument(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.documentsService.findById(id, userId);

  }

  /**
   * Delete document by ID
   * DELETE /docs/:id
   */
  @Delete(':id')
  async deleteDocument(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {

    const userId = req.user.id;
    return this.documentsService.remove(id, userId);

  }

  /**
   * Get document chunks for vector search
   * GET /docs/:id/chunks
   */
  @Get(':id/chunks')
  async getDocumentChunks(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.documentsService.getChunks(id, userId);
  }
}
