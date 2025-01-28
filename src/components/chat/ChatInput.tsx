import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from 'date-fns';
import { ChatService, decryptMessage, encryptMessage } from "@/services/chatService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/utils/auth";

interface ChatInputProps {
  profileId: string;
}

const ChatInput = ({ profileId }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const date = new Date();
      const timestamp = date.toISOString();
      const messageWithTimestamp = `${message} ${format(date, 'dd/MM/yyyy HH:mm:ss')}`;
      const encryptedMessage = encryptMessage(messageWithTimestamp);
      
      await ChatService.sendMessage(profileId, message);
      setMessage("");

      // Add the sent message to the messages cache
      queryClient.setQueryData(
        ["messages", profileId],
        (oldData: any) => {
          if (!oldData) return { pages: [[]], pageParams: [1] };
          
          const newMessage = {
            id: `temp-${Date.now()}`,
            senderId: getUserId(),
            receiverId: profileId,
            encryptedMessage: encryptedMessage,
            timestamp: timestamp
          };

          // Check if message already exists
          const messageExists = oldData.pages.some((page: any[]) => 
            page.some((msg: any) => 
              msg.encryptedMessage === encryptedMessage && 
              msg.timestamp === timestamp
            )
          );
          
          if (messageExists) return oldData;

          const newPages = [...oldData.pages];
          const lastPageIndex = newPages.length - 1;
          newPages[lastPageIndex] = [...newPages[lastPageIndex], newMessage];
          
          return {
            ...oldData,
            pages: newPages
          };
        }
      );
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t flex gap-2">
      <Input 
        placeholder="Digite sua mensagem..." 
        className="flex-1"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isSending}
      />
      <Button 
        size="icon" 
        onClick={handleSend}
        disabled={isSending || !message.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatInput;