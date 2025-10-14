export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  sessionId?: number;
  chatType: 'general' | 'custom';
}

export interface ChatResponse {
  message: string;
  sessionId: number;
  metadata?: Record<string, any>;
}

export interface DocumentUploadResponse {
  id: number;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  chunksCreated: number;
}

export interface SessionWithLastMessage {
  id: number;
  user_id: number;
  session_name: string;
  chat_type: 'general' | 'custom';
  created_at: Date;
  updated_at: Date;
  lastMessage: {
    id: number;
    content: string;
    role: string;
    created_at: Date;
  } | null;
}
