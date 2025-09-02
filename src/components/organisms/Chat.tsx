import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationType } from "@/types/notifications";
import { useQuery } from "@tanstack/react-query";
import { ChatService, decryptMessage } from "@/services/chatService";
import { format } from "date-fns";
import { toast } from "sonner";
import { getUserId } from "@/services/authService.ts";
import ChatWindow from "@/components/molecules/chat/ChatWindow";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import {SocialService} from "@/services/socialService.ts";

const Chat = () => {
  const { unreadMessages, markAllAsRead } = useNotificationStore();
  const [showRecentMessages, setShowRecentMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<'Pessoal' | 'Profissional'>('Pessoal');
  const { openChats, addChat, removeChat } = useChatStore();

  const { data: personalMessages = [] } = useQuery({
    queryKey: ["recentMessages"],
    queryFn: ChatService.getRecentMessages,
    enabled: showRecentMessages,
    meta: {
      onError: () => {
        toast.error("Falha ao carregar mensagens recentes");
      },
    },
  });

  const { data: professionalMessages = [] } = useQuery({
    queryKey: ["professionalRecentMessages"],
    queryFn: ChatService.getProfessionalRecentMessages,
    enabled: showRecentMessages,
    meta: {
      onError: () => {
        toast.error("Falha ao carregar mensagens profissionais recentes");
      },
    },
  });

  const { data: personalProfiles = {} } = useQuery({
    queryKey: ["chatProfiles", personalMessages],
    queryFn: async () => {
      const profileId = getUserId();
      const uniqueProfileIds = [
        ...new Set(
          personalMessages
            .map((m) => m.senderId)
            .concat(personalMessages.map((m) => m.receiverId))
            .filter((id) => id !== profileId)
        ),
      ];
      const profiles: Record<string, { firstName: string; lastName: string; imageUrl: string }> = {};
      await Promise.all(
        uniqueProfileIds.map(async (id) => {
          const profile = await SocialService.viewProfileSimplified(id);
          profiles[id] = profile;
        })
      );
      return profiles;
    },
    enabled: showRecentMessages && personalMessages.length > 0,
    meta: {
      onError: () => {
        toast.error("Falha ao carregar informações dos perfis pessoais");
      },
    },
  });

  const { data: professionalProfiles = {} } = useQuery({
    queryKey: ["professionalChatProfiles", professionalMessages],
    queryFn: async () => {
      const profileId = getUserId();
      const uniqueProfileIds = [
        ...new Set(
          professionalMessages
            .map((m) => m.senderId)
            .concat(professionalMessages.map((m) => m.receiverId))
            .filter((id) => id !== profileId)
        ),
      ];
      const profiles: Record<string, { firstName: string; lastName: string; imageUrl: string }> = {};
      await Promise.all(
        uniqueProfileIds.map(async (id) => {
          const profile = await SocialService.viewProfileSimplified(id);
          profiles[id] = profile;
        })
      );
      return profiles;
    },
    enabled: showRecentMessages && professionalMessages.length > 0,
    meta: {
      onError: () => {
        toast.error("Falha ao carregar informações dos perfis profissionais");
      },
    },
  });

  // Merge and sort messages
  const mergedMessages = [
    ...personalMessages.map((msg) => ({ ...msg, _type: "Pessoal" })),
    ...professionalMessages.map((msg) => ({ ...msg, _type: "Profissional" }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Merge profiles
  const allProfiles = { ...personalProfiles, ...professionalProfiles };

  return (
    <>
      {openChats.map((chat) => (
        <ChatWindow
          key={chat.profileId + '-' + chat.isProfessionalChat}
          profileId={chat.profileId}
          firstName={chat.firstName}
          lastName={chat.lastName}
          imageUrl={chat.imageUrl}
          isProfessionalChat={chat.isProfessionalChat}
          onClose={() => removeChat(chat.profileId, chat.isProfessionalChat)}
        />
      ))}

      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="secondary"
          className="rounded-full p-3 relative"
          onClick={() => {
            setShowRecentMessages(!showRecentMessages);
            if (!showRecentMessages) {
              markAllAsRead(NotificationType.Message);
            }
          }}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadMessages > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadMessages}
            </div>
          )}
        </Button>

        {showRecentMessages && (
          <div className="absolute bottom-16 right-0 w-80 bg-background border border-border rounded-lg shadow-lg">
            <div className="p-4 space-y-4">
              <h2 className="text-lg font-semibold">Conversas Recentes</h2>
              {/* Tabs */}
              <div className="flex gap-6 mb-2 border-b border-border">
                <button
                  className={`pb-2 transition-colors text-sm font-medium ${activeTab === 'Pessoal' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-muted-foreground'}`}
                  style={{ background: 'none', border: 'none', outline: 'none' }}
                  onClick={() => setActiveTab('Pessoal')}
                >Pessoal</button>
                <button
                  className={`pb-2 transition-colors text-sm font-medium ${activeTab === 'Profissional' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-muted-foreground'}`}
                  style={{ background: 'none', border: 'none', outline: 'none' }}
                  onClick={() => setActiveTab('Profissional')}
                >Profissional</button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Procurar Mensagens"
                  className="pl-10 bg-secondary border-none"
                />
              </div>
              <ScrollArea className="h-[400px] space-y-2">
                {activeTab === 'Pessoal' && (
                  <>
                    {personalMessages.length === 0 && <div className="text-xs text-muted-foreground">Nenhuma conversa pessoal encontrada.</div>}
                    {personalMessages.map((msg) => {
                      const chatId = msg.receiverId === getUserId() ? msg.senderId : msg.receiverId;
                      const profile = personalProfiles[chatId];
                      return (
                        <div
                          key={msg.id}
                          className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg cursor-pointer"
                          onClick={() => {
                            if (profile) {
                              addChat({
                                profileId: chatId,
                                firstName: profile.firstName,
                                lastName: profile.lastName,
                                imageUrl: profile.imageUrl,
                                isProfessionalChat: false
                              });
                              setShowRecentMessages(false);
                            }
                          }}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={profile?.imageUrl} alt={profile ? `${profile.firstName} ${profile.lastName}` : ""} />
                            <AvatarFallback>{profile ? profile.firstName[0] + profile.lastName[0] : ""}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{profile ? `${profile.firstName} ${profile.lastName}` : "Carregando..."}</h4>
                            <p className="text-sm text-muted-foreground">{decryptMessage(msg.encryptedMessage)}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{format(new Date(msg.timestamp), "HH:mm")}</span>
                        </div>
                      );
                    })}
                  </>
                )}
                {activeTab === 'Profissional' && (
                  <>
                    {professionalMessages.length === 0 && <div className="text-xs text-muted-foreground">Nenhuma conversa profissional encontrada.</div>}
                    {professionalMessages.map((msg) => {
                      const chatId = msg.receiverId === getUserId() ? msg.senderId : msg.receiverId;
                      const profile = professionalProfiles[chatId];
                      return (
                        <div
                          key={msg.id}
                          className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg cursor-pointer"
                          onClick={() => {
                            if (profile) {
                              addChat({
                                profileId: chatId,
                                firstName: profile.firstName,
                                lastName: profile.lastName,
                                imageUrl: profile.imageUrl,
                                isProfessionalChat: true
                              });
                              setShowRecentMessages(false);
                            }
                          }}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={profile?.imageUrl} alt={profile ? `${profile.firstName} ${profile.lastName}` : ""} />
                            <AvatarFallback>{profile ? profile.firstName[0] + profile.lastName[0] : ""}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{profile ? `${profile.firstName} ${profile.lastName}` : "Carregando..."}</h4>
                            <p className="text-sm text-muted-foreground">{decryptMessage(msg.encryptedMessage)}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{format(new Date(msg.timestamp), "HH:mm")}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
