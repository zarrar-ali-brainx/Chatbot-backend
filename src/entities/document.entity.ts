import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { DocumentChunk } from './document-chunk.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  filename: string;

  @Column()
  original_name: string;

  @Column()
  file_type: string;

  @Column()
  file_size: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.documents)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => DocumentChunk, chunk => chunk.document)
  chunks: DocumentChunk[];
}
