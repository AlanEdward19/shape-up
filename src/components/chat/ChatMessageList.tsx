import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "@/services/chatService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";
import ChatDateSeparator from "./ChatDateSeparator";
import * as signalR from "@microsoft/signalr";
import { getAuthToken } from "@/utils/auth";
import { SERVICES } from "@/config/services";
import { format, parseISO } from "date-fns";

interface ChatMessageListProps {
  profileId: string;
}

interface GroupedMessages {
  date: Date;
  messages: any[];
}

const ChatMessageList = ({ profileId }: ChatMessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["messages", profileId],
    queryFn: async ({ pageParam = 1 }) => {
      return ChatService.getMessages(profileId, pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 0 ? undefined : allPages.length + 1;
    },
    initialPageParam: 1,
    meta: {
      onError: () => {
        toast.error("Falha ao carregar mensagens");
      }
    }
  });

  useEffect(() => {
    const startConnection = async () => {
      // Limpa conexão anterior se existir
      if (connectionRef.current) {
        await connectionRef.current.stop();
        connectionRef.current = null;
      }

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${SERVICES.CHAT.baseUrl}/chat?ProfileId=${profileId}`, {
          accessTokenFactory: () => getAuthToken() || ''
        })
        .withAutomaticReconnect()
        .build();

      connectionRef.current = connection;

      connection.on("ReceiveMessage", (message) => {
        queryClient.setQueryData(
          ["messages", profileId],
          (oldData: any) => {
            if (!oldData) return { pages: [[message]], pageParams: [1] };
            
            const newPages = [...oldData.pages];
            const lastPageIndex = newPages.length - 1;
            newPages[lastPageIndex] = [...newPages[lastPageIndex], message];
            
            return {
              ...oldData,
              pages: newPages
            };
          }
        );

        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      });

      try {
        await connection.start();
        console.log("SignalR Connected");
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
        toast.error("Falha ao conectar ao serviço de mensagens em tempo real");
      }
    };

    startConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [profileId, queryClient]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (scrollRef.current && data?.pages[0]?.length > 0) {
      scrollRef.current.scrollIntoView();
    }
  }, [data?.pages]);

  const groupMessagesByDate = (messages: any[]): GroupedMessages[] => {
    const groups: { [key: string]: any[] } = {};
    
    messages.forEach(message => {
      const date = parseISO(message.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(message);
    });
    
    const groupedMessages = Object.entries(groups).map(([dateStr, messages]) => ({
      date: parseISO(dateStr),
      messages: messages.sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime())
    }));

    return groupedMessages.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const allMessages = data?.pages.flatMap(page => page) || [];
  const groupedMessages = groupMessagesByDate(allMessages);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {groupedMessages.map((group) => (
          <div key={format(group.date, 'yyyy-MM-dd')}>
            <ChatDateSeparator date={group.date} />
            {group.messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                senderId={message.senderId}
                message={message.encryptedMessage}
                timestamp={format(parseISO(message.timestamp), 'HH:mm')}
              />
            ))}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessageList;