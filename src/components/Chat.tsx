import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationType } from "@/types/notifications";
import { useQuery } from "@tanstack/react-query";
import { ChatService, decryptMessage } from "@/services/chatService";
import { format } from "date-fns";
import { toast } from "sonner";
import { getUserId } from "@/utils/auth";
import { useState } from "react";
import ChatConversation from "./chat/ChatConversation";

const Chat = () => {
  const { unreadMessages, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["recentMessages"],
    queryFn: ChatService.getRecentMessages,
    enabled: isOpen,
    meta: {
      onError: () => {
        toast.error("Falha ao carregar mensagens recentes");
      }
    }
  });

  const { data: profiles = {} } = useQuery({
    queryKey: ["chatProfiles", messages],
    queryFn: async () => {
      const profileId = getUserId();
      const uniqueProfileIds = [...new Set(messages.map(m => m.senderId).concat(messages.map(m => m.receiverId)).filter(id => id !== profileId))];
      
      const profiles: Record<string, { firstName: string; lastName: string }> = {};
      
      await Promise.all(
        uniqueProfileIds.map(async (id) => {
          const profile = await ChatService.getProfileSimplified(id);
          profiles[id] = profile;
        })
      );
      
      return profiles;
    },
    enabled: isOpen && messages.length > 0,
    meta: {
      onError: () => {
        toast.error("Falha ao carregar informações dos perfis");
      }
    }
  });

  const handleOpen = () => {
    setIsOpen(true);
    markAllAsRead(NotificationType.Message);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedChat(null);
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      if (open) handleOpen();
      else handleClose();
    }}>
      <PopoverTrigger className="fixed bottom-4 right-4 bg-secondary p-3 rounded-full hover:bg-primary/20 transition-colors">
        <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0" />
        {unreadMessages > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadMessages}
          </div>
        )}
        <div className="w-10 h-10 rounded-full bg-primary/20" />
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 h-[500px] p-0 bg-background border border-border" 
        side="top" 
        align="end"
      >
        {selectedChat ? (
          <ChatConversation
            profileId={selectedChat}
            firstName={profiles[selectedChat]?.firstName || ""}
            lastName={profiles[selectedChat]?.lastName || ""}
          />
        ) : (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Conversando</h2>
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
                  const chatId = msg.receiverId === getUserId() ? msg.senderId : msg.receiverId;
                  const profile = profiles[chatId];
                  
                  return (
                    <div
                      key={msg.id}
                      className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg cursor-pointer"
                      onClick={() => setSelectedChat(chatId)}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20" />
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {profile ? `${profile.firstName} ${profile.lastName}` : "Carregando..."}
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
        )}
      </PopoverContent>
    </Popover>
  );
};

export default Chat;