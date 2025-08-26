export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  encryptedMessage: string;
  timestamp: string;
}