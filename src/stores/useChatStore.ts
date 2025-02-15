
import { create } from "zustand";

interface OpenChat {
  profileId: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

interface ChatStore {
  openChats: OpenChat[];
  addChat: (chat: OpenChat) => void;
  removeChat: (profileId: string) => void;
  isProfileChatOpen: (profileId: string) => boolean;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  openChats: [],
  addChat: (chat) => {
    set((state) => {
      if (!state.openChats.some((c) => c.profileId === chat.profileId)) {
        return { openChats: [...state.openChats, chat] };
      }
      return state;
    });
  },
  removeChat: (profileId) =>
    set((state) => ({
      openChats: state.openChats.filter((chat) => chat.profileId !== profileId),
    })),
  isProfileChatOpen: (profileId) =>
    get().openChats.some((chat) => chat.profileId === profileId),
}));
