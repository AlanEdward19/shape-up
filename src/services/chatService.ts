import { SERVICES } from "@/config/services";
import { ChatMessage, SimplifiedProfile } from "@/types/chat";
import { createHeaders } from "./api";

export const decryptMessage = (encryptedMessage: string): string => {
  // This will be implemented later
  return encryptedMessage;
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
  }
};