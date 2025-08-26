import { SERVICES } from "@/config/services";
import { ChatMessage } from "@/types/chat";
import CryptoJS from 'crypto-js';
import {createHeaders} from "@/services/utils/serviceUtils.ts";

const _encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || '';
const InitializationVector = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');

const getKey = (): CryptoJS.lib.WordArray => {
  return CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(_encryptionKey));
}

export const decryptMessage = (encryptedMessage: string): string => {
  const key = getKey();

  const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key, {
    iv: InitializationVector,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const decryptedArray = decrypted.toString(CryptoJS.enc.Utf8).split(' ').slice(0, -2);

  return decryptedArray.join(' ');
};

export const encryptMessage = (plainText: string): string => {
  const key = getKey();

  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plainText), key, {
    iv: InitializationVector,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(CryptoJS.format.Base64);
};

export const ChatService = {
  getRecentMessages: async (): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(
        `${SERVICES.CHAT.baseUrl}${ SERVICES.CHAT.endpoints.getRecentMessages}`,
        { headers: await createHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch recent messages");
      return response.json();
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      throw error;
    }
  },

  getProfessionalRecentMessages: async (): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(
          `${SERVICES.CHAT.baseUrl}${SERVICES.CHAT.endpoints.getProfessionalRecentMessages}`,
          { headers: await createHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch recent messages");
      return response.json();
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      throw error;
    }
  },

  getMessages: async (isProfessionalChat:boolean, profileId: string, page: number = 1): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(
        `${SERVICES.CHAT.baseUrl}${(isProfessionalChat ? SERVICES.CHAT.endpoints.getProfessionalMessages : SERVICES.CHAT.endpoints.getMessages).replace('id', profileId)}?page=${page}`,
        { headers: await createHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  sendMessage: async (isProfessionalChat:boolean, receiverId: string, message: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.CHAT.baseUrl}${(isProfessionalChat ? SERVICES.CHAT.endpoints.sendProfessionalMessage : SERVICES.CHAT.endpoints.sendMessage)}`,
      {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify({
          receiverId,
          message
        })
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to send message");
    }
  }
};