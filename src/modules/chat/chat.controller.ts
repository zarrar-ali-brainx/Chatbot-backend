import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard) // All chat endpoints require authentication
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Send a general chat message (ChatGPT-like)
   * POST /chat/general
   * 
   * - Validate input data using ChatRequestDto
   * - Create or get chat session
   * - Send message to OpenAI for general response
   * - Save message and response to database
   * - Return chat response
   */
  @Post('general')
  async sendGeneralMessage(
    @Body() chatRequestDto: ChatRequestDto,
    @Request() req,
  ) {
    // Call chatService.sendGeneralMessage() with message and user ID
    const userId = req.user.id;
    return this.chatService.sendGeneralMessage(chatRequestDto.message, userId, chatRequestDto.sessionId);
  }

  /**
   * Send a RAG chat message (document-based)
   * POST /chat/rag
   * 
   * - Validate input data using ChatRequestDto
   * - Create or get chat session
   * - Search for relevant document chunks
   * - Send message with context to OpenAI
   * - Save message and response to database
   * - Return chat response with sources
   */
  @Post('rag')
  async sendRagMessage(
    @Body() chatRequestDto: ChatRequestDto,
    @Request() req,
  ) {
    // Call chatService.sendRagMessage() with message and user ID
    const userId = req.user.id;
    return this.chatService.sendRagMessage(chatRequestDto.message, userId, chatRequestDto.sessionId);
  }

  /**
   * Get chat history for a session
   * GET /chat/sessions/:sessionId
   * 
   * - Verify session belongs to user
   * - Return all messages in the session
   * - Include message metadata (timestamp, type, etc.)
   */
  @Get('sessions/:sessionId')
  async getChatHistory(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    // Call chatService.getChatHistory() with session ID and user ID
    const userId = req.user.id;
    return this.chatService.getChatHistory(sessionId, userId);
  }

  /**
   * Get all chat sessions for user
   * GET /chat/sessions
   * 
   * - Get all chat sessions for the user
   * - Return session list with metadata
   * - Include last message preview
   */
  @Get('sessions')
  async getUserSessions(@Request() req) {
    // Call chatService.getUserSessions() with user ID
    const userId = req.user.id;
    return this.chatService.getUserSessions(userId);
  }

  /**
   * Create a new chat session
   * POST /chat/sessions
   * 
   * - Create new chat session for user
   * - Return session details
   * - Set default session name
   */
  @Post('sessions')
  async createSession(@Request() req) {
    // Call chatService.createSession() with user ID
    const userId = req.user.id;
    return this.chatService.createSession(userId);
  }

  /**
   * Delete a chat session
   * DELETE /chat/sessions/:sessionId
   * 
   * - Verify session belongs to user
   * - Delete session and all messages
   * - Return success message
   */
  @Delete('sessions/:sessionId')
  async deleteSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    // Call chatService.deleteSession() with session ID and user ID
    const userId = req.user.id;
    return this.chatService.deleteSession(sessionId, userId);
  }
}
