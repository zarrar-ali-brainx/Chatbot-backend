import { Injectable, BadRequestException } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class FileParserService {
  /**
   * Parse uploaded file and extract text content
   */
  async parseFile(file: Express.Multer.File): Promise<string> {
    try {
      switch (file.mimetype) {
        case 'application/pdf':
          return await this.parsePdf(file);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.parseDocx(file);
        
        case 'text/csv':
          return await this.parseCsv(file);
        
        case 'text/plain':
          return await this.parseTxt(file);
        
        default:
          throw new BadRequestException('Unsupported file type');
      }
    } catch (error) {
      throw new BadRequestException(`Failed to parse file: ${error.message}`);
    }
  }

  /**
   * Parse PDF file
   */
  private async parsePdf(file: Express.Multer.File): Promise<string> {
    const buffer = file.buffer;
    const data = await pdfParse.default(buffer);
    return data.text;

  }

  /**
   * Parse DOCX file
   */
  private async parseDocx(file: Express.Multer.File): Promise<string> {
    const buffer = file.buffer;
    const data = await mammoth.extractRawText({ buffer });
    return data.value;

  
  }

  /**
   * Parse CSV file
   */
  private async parseCsv(file: Express.Multer.File): Promise<string> {
    const buffer = file.buffer;
    const stream = Readable.from(buffer);
    const results: any[] = [];

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (data: any) => results.push(data))
        .on('end', () => {
          const text = results.map(row => 
            Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ')
          ).join('\n');
          resolve(text);
        })
          .on('error', reject)
    });
    
  }

  /**
   * Parse TXT file
   */
  private async parseTxt(file: Express.Multer.File): Promise<string> {
    const buffer = file.buffer;
    return buffer.toString('utf-8');

  }
}
