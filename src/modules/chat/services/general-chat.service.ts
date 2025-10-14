import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class GeneralChatService {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
  }

  /**
   * Get response from OpenAI for general chat
   * 
   * TODO: Implement general chat response
   * 1. Call OpenAI Chat Completions API
   * 2. Use gpt-4o-mini model for cost efficiency
   * 3. Return AI response
   */
  async getResponse(message: string): Promise<string> {
    // Call OpenAI Chat Completions API
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Return AI response
    return response.choices[0].message.content || '';
  }

  /**
   * Get response with conversation history
   * 
   * TODO: Implement chat with history
   * 1. Format conversation history
   * 2. Call OpenAI with full context
   * 3. Return AI response
   */
  async getResponseWithHistory(messages: Array<{ role: string; content: string }>): Promise<string> {
    // Format messages for OpenAI
    const formattedMessages = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content
    }));

    // Add system message
    formattedMessages.unshift({
      role: 'system',
      content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
    });

    // Call OpenAI with history
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Return AI response
    return response.choices[0].message.content || '';
  }

  /**
   * Get response with custom system prompt
   * 
   * TODO: Implement custom system prompt
   * 1. Use custom system message
   * 2. Call OpenAI with custom context
   * 3. Return AI response
   */
  async getResponseWithCustomPrompt(message: string, systemPrompt: string): Promise<string> {
    // Call OpenAI with custom system prompt
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

    // Return AI response
    return response.choices[0].message.content || '';
  }

  /**
   * Stream response for real-time chat
   * 
   * TODO: Implement streaming response
   * 1. Use streaming API
   * 2. Return async generator for chunks
   * 3. Handle streaming errors
   */
  async *getStreamingResponse(message: string): AsyncGenerator<string, void, unknown> {
    // Call OpenAI with streaming
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      stream: true,
    });

    // Yield chunks as they arrive
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
