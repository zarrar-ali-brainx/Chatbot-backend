import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { VectorStoreService } from '../../vector-store/vector-store.service';
import { DocumentChunk } from '../../../entities/document-chunk.entity';

@Injectable()
export class RagChatService {
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly vectorStoreService: VectorStoreService,
  ) {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('app.openai.apiKey'),
    });
  }

  /**
   * Get RAG response with document context
   * 
   * TODO: Implement RAG chat response
   * 1. Search for relevant document chunks
   * 2. Format context from chunks
   * 3. Send message with context to OpenAI
   * 4. Return response with sources
   */
  async getResponse(message: string, userId: number): Promise<{ response: string; sources: any[] }> {
    // Search for relevant chunks
    const relevantChunks = await this.vectorStoreService.searchSimilarChunks(
      message,
      userId,
      5 // Get top 5 most relevant chunks
    );

    // Format context from chunks
    const context = this.formatContextFromChunks(relevantChunks);

    // Create system prompt with context
    const systemPrompt = this.createRagSystemPrompt(context);

    // Call OpenAI with context
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Format sources
    const sources = this.formatSources(relevantChunks);

    // Return response with sources
    return {
      response: response.choices[0].message.content || '',
      sources
    };
  }

  /**
   * Format context from document chunks
   * 
   * TODO: Implement context formatting
   * 1. Combine chunk contents
   * 2. Add chunk metadata
   * 3. Format for AI consumption
   */
  private formatContextFromChunks(chunks: DocumentChunk[]): string {
    // Format chunks into context
    const contextParts = chunks.map((chunk, index) => {
      return `[Source ${index + 1}]\n${chunk.content}\n`;
    });

    // Join context parts
    return contextParts.join('\n');
  }

  /**
   * Create system prompt for RAG
   * 
   * TODO: Implement RAG system prompt
   * 1. Create prompt with context
   * 2. Add instructions for using context
   * 3. Return formatted prompt
   */
  private createRagSystemPrompt(context: string): string {
    // Create RAG system prompt
    return `You are a helpful AI assistant with access to the following documents:

${context}

Please answer the user's question based on the information provided in the documents above. 
If the answer is not found in the documents, please say so and provide a general response if possible.
Always cite which source(s) you used for your answer.`;
  }

  /**
   * Format sources for response
   * 
   * TODO: Implement source formatting
   * 1. Extract source information from chunks
   * 2. Format for frontend display
   * 3. Return formatted sources
   */
  private formatSources(chunks: DocumentChunk[]): any[] {
    // Format sources
    return chunks.map((chunk, index) => ({
      id: chunk.id,
      content: chunk.content.substring(0, 200) + '...', // Preview
      documentId: chunk.document_id,
      chunkIndex: chunk.chunk_index,
      relevance: 0 // Similarity score not available in entity
    }));
  }

  /**
   * Get RAG response with specific document
   * 
   * TODO: Implement document-specific RAG
   * 1. Search within specific document
   * 2. Get response with document context
   * 3. Return response with sources
   */
  async getResponseForDocument(
    message: string,
    documentId: number,
    userId: number
  ): Promise<{ response: string; sources: any[] }> {
    // Search within specific document
    const relevantChunks = await this.vectorStoreService.searchSimilarChunks(
      message,
      userId,
      5
    );

    // Format context and get response
    const context = this.formatContextFromChunks(relevantChunks);
    const systemPrompt = this.createRagSystemPrompt(context);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const sources = this.formatSources(relevantChunks);

    return {
      response: response.choices[0].message.content || '',
      sources
    };
  }

  /**
   * Get RAG response with conversation history
   * 
   * TODO: Implement RAG with history
   * 1. Search for relevant chunks
   * 2. Include conversation history
   * 3. Get response with context and history
   */
  async getResponseWithHistory(
    message: string,
    userId: number,
    history: Array<{ role: string; content: string }>
  ): Promise<{ response: string; sources: any[] }> {
    // Search for relevant chunks
    const relevantChunks = await this.vectorStoreService.searchSimilarChunks(
      message,
      userId,
      5
    );

    // Format context
    const context = this.formatContextFromChunks(relevantChunks);
    const systemPrompt = this.createRagSystemPrompt(context);

    // Include conversation history
    const formattedMessages = history.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content
    }));

    // Add system prompt and user message
    formattedMessages.unshift({
      role: 'system',
      content: systemPrompt
    });
    formattedMessages.push({
      role: 'user',
      content: message
    });

    // Get response with both context and history
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const sources = this.formatSources(relevantChunks);

    return {
      response: response.choices[0].message.content || '',
      sources
    };
  }
}
