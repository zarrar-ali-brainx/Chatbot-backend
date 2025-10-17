import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Document } from './document.entity';
import { User } from './user.entity';

@Entity('document_chunks')
@Index(['user_id'])
@Index(['document_id'])
export class DocumentChunk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  document_id: number;

  @Column()
  user_id: number;

  @Column()
  chunk_index: number;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  embedding: string | null; // Store as JSON string, will be parsed when needed

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Document, document => document.chunks)
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
