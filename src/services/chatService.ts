import { SERVICES } from "@/config/services";
import { ChatMessage, SimplifiedProfile } from "@/types/chat";
import { createHeaders } from "./api";
import CryptoJS from 'crypto-js';

const _encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || '';
const InitializationVector = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');

export const decryptMessage = (encryptedMessage: string): string => {
  const key = CryptoJS.SHA256(_encryptionKey);

  const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key, {
    iv: InitializationVector,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
  const decryptedArray = decryptedString.split(' ').slice(0, -2);

  return decryptedArray.join(' ');
};

export const encryptMessage = (plainText: string): string => {
  const key = CryptoJS.SHA256(_encryptionKey);

  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plainText), key, {
    iv: InitializationVector,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString(CryptoJS.format.Base64);
};

export const ChatService = {
  getRecentMessages: async (): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(
        `${SERVICES.CHAT.baseUrl}${SERVICES.CHAT.endpoints.getRecentMessages}`,
        { headers: createHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch recent messages");
      return response.json();
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      throw error;
    }
  },

  getMessages: async (profileId: string, page: number = 1): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(
        `${SERVICES.CHAT.baseUrl}/Chat/v1/messages/getMessages/${profileId}?page=${page}`,
        { headers: createHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  getProfileSimplified: async (profileId: string): Promise<SimplifiedProfile> => {
    try {
      const response = await fetch(
        `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.viewProfileSimplified.replace('id', profileId)}`,
        { headers: createHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  sendMessage: async (receiverId: string, message: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.CHAT.baseUrl}${SERVICES.CHAT.endpoints.sendMessage}`,
      {
        method: 'POST',
        headers: createHeaders(),
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