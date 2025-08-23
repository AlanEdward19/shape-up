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

const Chat = () => {
  const { unreadMessages, markAllAsRead } = useNotificationStore();
  const [showRecentMessages, setShowRecentMessages] = useState(false);
  const { openChats, addChat, removeChat } = useChatStore();

  const { data: messages = [] } = useQuery({
    queryKey: ["recentMessages"],
    queryFn: ChatService.getRecentMessages,
    enabled: showRecentMessages,
    meta: {
      onError: () => {
        toast.error("Falha ao carregar mensagens recentes");
      },
    },
  });

  const { data: profiles = {} } = useQuery({
    queryKey: ["chatProfiles", messages],
    queryFn: async () => {
      const profileId = getUserId();
      const uniqueProfileIds = [
        ...new Set(
          messages
            .map((m) => m.senderId)
            .concat(messages.map((m) => m.receiverId))
            .filter((id) => id !== profileId)
        ),
      ];

      const profiles: Record<
        string,
        { firstName: string; lastName: string; imageUrl: string }
      > = {};

      await Promise.all(
        uniqueProfileIds.map(async (id) => {
          const profile = await ChatService.getProfileSimplified(id);
          profiles[id] = profile;
        })
      );

      return profiles;
    },
    enabled: showRecentMessages && messages.length > 0,
    meta: {
      onError: () => {
        toast.error("Falha ao carregar informações dos perfis");
      },
    },
  });

  return (
    <>
      {openChats.map((chat) => (
        <ChatWindow
          key={chat.profileId}
          profileId={chat.profileId}
          firstName={chat.firstName}
          lastName={chat.lastName}
          imageUrl={chat.imageUrl}
          onClose={() => removeChat(chat.profileId)}
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Procurar Mensagens"
                  className="pl-10 bg-secondary border-none"
                />
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {messages.map((msg) => {
                    const chatId =
                      msg.receiverId === getUserId()
                        ? msg.senderId
                        : msg.receiverId;
                    const profile = profiles[chatId];

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
                            });
                            setShowRecentMessages(false);
                          }
                        }}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={profile?.imageUrl}
                            alt={profile ? `${profile.firstName} ${profile.lastName}` : ""}
                          />
                          <AvatarFallback>
                            {profile ? profile.firstName[0] + profile.lastName[0] : ""}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <h4 className="font-medium">
                            {profile
                              ? `${profile.firstName} ${profile.lastName}`
                              : "Carregando..."}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {decryptMessage(msg.encryptedMessage)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.timestamp), "HH:mm")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
