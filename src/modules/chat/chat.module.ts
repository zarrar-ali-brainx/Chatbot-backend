import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GeneralChatService } from './services/general-chat.service';
import { RagChatService } from './services/rag-chat.service';
import { ChatSession } from '../../entities/chat-session.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { VectorStoreModule } from '../vector-store/vector-store.module';

@Module({
  imports: [
    // Import TypeORM for Chat entities
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    // Import ConfigModule for OpenAI configuration
    ConfigModule,
    // Import VectorStoreModule for RAG functionality
    VectorStoreModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    GeneralChatService,
    RagChatService,
  ],
  exports: [ChatService], // Export ChatService for use in other modules
})
export class ChatModule {}
