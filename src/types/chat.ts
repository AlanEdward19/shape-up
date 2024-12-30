export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  encryptedMessage: string;
  timestamp: string;
}

export interface SimplifiedProfile {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}