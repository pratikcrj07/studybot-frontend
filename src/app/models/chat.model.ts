export interface ChatMessage {
  id?: number;
  userEmail?: string;
  message: string;
  fromBot: boolean;
  createdAt?: string;
}

export interface ChatRequest {
  message: string;
}