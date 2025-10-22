import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatSession } from '../../entities/chat-session.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { GeneralChatService } from './services/general-chat.service';
import { RagChatService } from './services/rag-chat.service';
import { SessionWithLastMessage } from '../../common/interfaces/chat.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
    private readonly generalChatService: GeneralChatService,
    private readonly ragChatService: RagChatService,
  ) {}

  /**
   * Send a general chat message
   * 
   * TODO: Implement general chat message handling
   * 1. Create or get active chat session
   * 2. Save user message to database
   * 3. Get response from OpenAI (general chat)
   * 4. Save AI response to database
   * 5. Return chat response
   */
  async sendGeneralMessage(message: string, userId: number, sessionId?: string): Promise<{ response: string; sessionId: number }> {
    // Get or create session
    let session;
    if (sessionId) {
      // Try to get existing session
      session = await this.sessionRepository.findOne({
        where: { id: parseInt(sessionId), user_id: userId, chat_type: 'general' }
      });
    }
    
    if (!session) {
      // Create new session with first 30 characters of user message as name
      const sessionName = message.length > 30 ? message.substring(0, 30) + '...' : message;
      session = await this.createSession(userId, 'general', sessionName);
    }

    // TODO: Save user message
    const userMessage = this.messageRepository.create({
      content: message,
      role: 'user',
      session_id: session.id,
      user_id: userId,
    })
    await this.messageRepository.save(userMessage);
    // const userMessage = this.messageRepository.create({
    //   content: message,
    //   role: 'user',
    //   session_id: session.id,
    //   user_id: userId,
    // });
    // await this.messageRepository.save(userMessage);

    // TODO: Get response from general chat service
    const response = await this.generalChatService.getResponse(message);
    // const response = await this.generalChatService.getResponse(message);

    // TODO: Save AI response
    const aiMessage = this.messageRepository.create({
      content: response,
      role: 'assistant',
      session_id: session.id,
      user_id: userId,
    });
    await this.messageRepository.save(aiMessage);
    // const aiMessage = this.messageRepository.create({
    //   content: response,
    //   role: 'assistant',
    //   session_id: session.id,
    //   user_id: userId,
    // });
    // await this.messageRepository.save(aiMessage);

    // TODO: Return response and session ID
    return {
      response,
      sessionId: session.id
    };
  }

  /**
   * Send a RAG chat message
   * 
   * TODO: Implement RAG chat message handling
   * 1. Create or get active chat session
   * 2. Save user message to database
   * 3. Search for relevant document chunks
   * 4. Get response from OpenAI with context
   * 5. Save AI response with sources
   * 6. Return chat response with sources
   */
  async sendRagMessage(message: string, userId: number, sessionId?: string): Promise<{ response: string; sources: any[]; sessionId: number }> {
    // Get or create session
    let session;
    if (sessionId) {
      // Try to get existing session
      session = await this.sessionRepository.findOne({
        where: { id: parseInt(sessionId), user_id: userId, chat_type: 'custom' }
      });
    }
    
    if (!session) {
      // Create new session with first 30 characters of user message as name
      const sessionName = message.length > 30 ? message.substring(0, 30) + '...' : message;
      session = await this.createSession(userId, 'custom', sessionName);
    }
    // let session = await this.getActiveSession(userId);
    // if (!session) {
    //   session = await this.createSession(userId);
    // }

    // TODO: Save user message
    const userMessage = this.messageRepository.create({
      content: message,
      role: 'user',
      session_id: session.id,
      user_id: userId
    });
    await this.messageRepository.save(userMessage);
    // const userMessage = this.messageRepository.create({
    //   content: message,
    //   role: 'user',
    //   session_id: session.id,
    //   user_id: userId,
    // });
    // await this.messageRepository.save(userMessage);

    // TODO: Get response from RAG chat service
    const ragResponse = await this.ragChatService.getResponse(message, userId);
    // const ragResponse = await this.ragChatService.getResponse(message, userId);

    // TODO: Save AI response with sources
    const aiMessage = this.messageRepository.create({
      content: ragResponse.response,
      role: 'assistant',
      session_id: session.id,
      user_id: userId,
      metadata: { sources: ragResponse.sources}
    });
    await this.messageRepository.save(aiMessage);
    // const aiMessage = this.messageRepository.create({
    //   content: ragResponse.response,
    //   role: 'assistant',
    //   session_id: session.id,
    //   user_id: userId,
    //   metadata: { sources: ragResponse.sources }
    // });
    // await this.messageRepository.save(aiMessage);

    // TODO: Return response with sources
    return {
      response: ragResponse.response,
      sources: ragResponse.sources,
      sessionId: session.id
    };
  }

  /**
   * Get chat history for a session
   * 
   * TODO: Implement get chat history
   * 1. Verify session belongs to user
   * 2. Get all messages for the session
   * 3. Return messages with metadata
   */
  async getChatHistory(sessionId: number, userId: number): Promise<ChatMessage[]> {
    // TODO: Verify session belongs to user
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user_id: userId}
    })
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    // const session = await this.sessionRepository.findOne({
    //   where: { id: sessionId, user_id: userId }
    // });
    // if (!session) {
    //   throw new NotFoundException('Session not found');
    // }

    // TODO: Get all messages for the session
    const messages = await this.messageRepository.find({
      where: { session_id: sessionId},
      order: { created_at: 'ASC'}
    });
    // const messages = await this.messageRepository.find({
    //   where: { session_id: sessionId },
    //   order: { created_at: 'ASC' }
    // });

    // Return messages
    return messages;
  }

  /**
   * Get all chat sessions for user
   * 
   * TODO: Implement get user sessions
   * 1. Get all sessions for the user
   * 2. Include last message preview
   * 3. Return session list with metadata
   */
  async getUserSessions(userId: number): Promise<SessionWithLastMessage[]> {
    // Get all sessions for the user
    const sessions = await this.sessionRepository.find({
      where: { user_id: userId },
      order: { updated_at: 'DESC' }
    });

    // Get sessions with their last messages
    const sessionsWithLastMessage = await Promise.all(
      sessions.map(async (session) => {
        const lastMessage = await this.messageRepository.findOne({
          where: { session_id: session.id },
          order: { created_at: 'DESC' }
        });

        return {
          ...session,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            content: lastMessage.content,
            role: lastMessage.role,
            created_at: lastMessage.created_at
          } : null
        };
      })
    );

    // Return sessions with last message
    return sessionsWithLastMessage;
  }

  /**
   * Create a new chat session
   * 
   * TODO: Implement create session
   * 1. Create new session for user
   * 2. Set default session name
   * 3. Return session details
   */
  async createSession(userId: number, chatType: 'general' | 'custom' = 'general', sessionName?: string): Promise<ChatSession> {
    // Create new session with custom name or default name
    const defaultName = `${chatType === 'general' ? 'General' : 'Document RAG'} Chat`;
    const session = this.sessionRepository.create({
      session_name: sessionName || defaultName,
      user_id: userId,
      chat_type: chatType
    });

    // Save session
    const savedSession = await this.sessionRepository.save(session);

    // Return session
    return savedSession;
  }

  /**
   * Get active session for user
   * 
   * TODO: Implement get active session
   * 1. Find active session for user
   * 2. Return session or null
   */
  private async getActiveSession(userId: number): Promise<ChatSession | null> {
    // Find active session (using most recent session as active)
    const session = await this.sessionRepository.findOne({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });

    // Return session or null
    return session;
  }

  /**
   * Delete a chat session
   * 
   * TODO: Implement delete session
   * 1. Verify session belongs to user
   * 2. Delete all messages in session
   * 3. Delete session
   * 4. Return success message
   */
  async deleteSession(sessionId: number, userId: number): Promise<{ message: string }> {
    // Verify session belongs to user
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user_id: userId }
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Delete all messages in session
    await this.messageRepository.delete({ session_id: sessionId });

    // Delete session
    await this.sessionRepository.delete(sessionId);

    // Return success message
    return { message: 'Session deleted successfully' };
  }
}
