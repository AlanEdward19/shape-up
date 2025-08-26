import { create } from "zustand";

interface OpenChat {
  profileId: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  isProfessionalChat: boolean;
}

interface ChatStore {
  openChats: OpenChat[];
  addChat: (chat: OpenChat) => void;
  removeChat: (profileId: string, isProfessionalChat?: boolean) => void;
  isProfileChatOpen: (profileId: string, isProfessionalChat: boolean) => boolean;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  openChats: [],
  addChat: (chat) => {
    set((state) => {
      if (!state.openChats.some((c) => c.profileId === chat.profileId && c.isProfessionalChat === chat.isProfessionalChat)) {
        return { openChats: [...state.openChats, chat] };
      }
      return state;
    });
  },
  removeChat: (profileId, isProfessionalChat) =>
    set((state) => ({
      openChats: state.openChats.filter((chat) =>
        chat.profileId !== profileId || (isProfessionalChat !== undefined && chat.isProfessionalChat !== isProfessionalChat)
      ),
    })),
  isProfileChatOpen: (profileId, isProfessionalChat) =>
    get().openChats.some((chat) => chat.profileId === profileId && chat.isProfessionalChat === isProfessionalChat),
}));
