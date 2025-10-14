import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadDocumentDto {
  /**
   * Optional description for the document
   * Used for better organization and search
   */
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  /**
   * Optional tags for the document
   * Used for categorization and filtering
   */
  @IsOptional()
  @IsString({ message: 'Tags must be a string' })
  @MaxLength(200, { message: 'Tags must not exceed 200 characters' })
  tags?: string;

  // Note: File validation is handled by multer and file type checking
  // This DTO is for additional metadata that can be sent with the file
}
