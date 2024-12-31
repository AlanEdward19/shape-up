import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ChatService, decryptMessage } from "@/services/chatService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";
import * as signalR from "@microsoft/signalr";
import { getAuthToken, getUserId } from "@/utils/auth";
import { SERVICES } from "@/config/services";

interface ChatMessageListProps {
  profileId: string;
}

const ChatMessageList = ({ profileId }: ChatMessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
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
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${SERVICES.CHAT.baseUrl}/chat`, {
        accessTokenFactory: () => getAuthToken() || ''
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveMessage", (message) => {
      queryClient.setQueryData(
        ["messages", profileId],
        (oldData: any) => {
          if (!oldData) return { pages: [[message]], pageParams: [1] };
          
          // Add new message to the end of the first page
          const newPages = [...oldData.pages];
          newPages[0] = [...newPages[0], message];
          
          return {
            ...oldData,
            pages: newPages
          };
        }
      );

      // Scroll to bottom when receiving new message
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    });

    const startConnection = async () => {
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
      connection.stop();
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

  // Scroll to bottom on initial load
  useEffect(() => {
    if (scrollRef.current && data?.pages[0]?.length > 0) {
      scrollRef.current.scrollIntoView();
    }
  }, [data?.pages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {data?.pages.map((page, i) => (
          <div key={i}>
            {[...page].reverse().map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                senderId={message.senderId}
                message={decryptMessage(message.encryptedMessage)}
                timestamp={message.timestamp}
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