import { IsString, IsNotEmpty, MaxLength, IsOptional, IsIn } from 'class-validator';

export class ChatRequestDto {
  /**
   * The message content to send to the chatbot
   * Must be a non-empty string with maximum 4000 characters
   */
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(4000, { message: 'Message must not exceed 4000 characters' })
  message: string;

  /**
   * Type of chat - either 'general' or 'custom' (RAG)
   */
  @IsString({ message: 'Chat type must be a string' })
  @IsIn(['general', 'custom'], { message: 'Chat type must be either "general" or "custom"' })
  chatType: string;

  /**
   * Optional session ID to continue an existing conversation
   * If not provided, a new session will be created
   */
  @IsOptional()
  @IsString({ message: 'Session ID must be a string' })
  sessionId?: string;

  /**
   * Optional context for the conversation
   * Can be used to provide additional context to the AI
   */
  @IsOptional()
  @IsString({ message: 'Context must be a string' })
  @MaxLength(1000, { message: 'Context must not exceed 1000 characters' })
  context?: string;
}
