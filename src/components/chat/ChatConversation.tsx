import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChatService, decryptMessage } from "@/services/chatService";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { getUserId } from "@/utils/auth";

interface ChatConversationProps {
  profileId: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

const ChatConversation = ({ profileId, firstName, lastName, imageUrl }: ChatConversationProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUserId = getUserId();

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
    <div className="flex flex-col h-[500px]">
      <div 
        className="p-4 border-b flex items-center gap-3 cursor-pointer hover:bg-secondary/50"
        onClick={() => navigate(`/profile/${profileId}`)}
      >
        <div className="w-10 h-10 rounded-full bg-primary/20">
          {imageUrl && <img src={imageUrl} alt={firstName} className="w-full h-full rounded-full object-cover" />}
        </div>
        <span className="font-medium">{`${firstName} ${lastName}`}</span>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {data?.pages.map((page, i) => (
            <div key={i}>
              {page.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderId === currentUserId
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-secondary'
                    }`}
                  >
                    <p className="break-words">{decryptMessage(message.encryptedMessage)}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {format(new Date(message.timestamp), "HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex gap-2">
        <Input placeholder="Digite sua mensagem..." className="flex-1" />
        <Button size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatConversation;