import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { User } from './user.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  session_id: number;

  @Column()
  user_id: number;

  @Column()
  role: 'user' | 'assistant';

  @Column('text')
  content: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => ChatSession, session => session.messages)
  @JoinColumn({ name: 'session_id' })
  session: ChatSession;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
