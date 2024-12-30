import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChatService, decryptMessage } from "@/services/chatService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";

interface ChatMessageListProps {
  profileId: string;
}

const ChatMessageList = ({ profileId }: ChatMessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["messages", profileId],
    queryFn: async ({ pageParam = 1 }) => {
      return ChatService.getMessages(profileId, pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 0 ? undefined : allPages.length + 1;
    },
    initialPageParam: 1,
    refetchInterval: 1000, // Refetch every 3 seconds
    meta: {
      onError: () => {
        toast.error("Falha ao carregar mensagens");
      }
    }
  });

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

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {data?.pages.map((page, i) => (
          <div key={i}>
            {page.map((message) => (
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