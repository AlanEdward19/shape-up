
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

      // Atualiza o cache manualmente
      queryClient.setQueryData(["messages", profileId], (oldData: any) => {
        if (!oldData) {
          return { pages: [[{ id: Date.now(), senderId: getUserId(), encryptedMessage, timestamp }]], pageParams: [1] };
        }

        const newPages = [...oldData.pages];
        if (newPages.length === 0) {
          newPages.push([{ id: Date.now(), senderId: getUserId(), encryptedMessage, timestamp }]);
        } else {
          const lastPageIndex = newPages.length - 1;
          newPages[lastPageIndex] = [
            ...newPages[lastPageIndex],
            { id: Date.now(), senderId: getUserId(), encryptedMessage, timestamp }
          ];
        }

        return { ...oldData, pages: newPages };
      });

      // Envia a mensagem para o servidor
      await ChatService.sendMessage(profileId, message);
      setMessage("");
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
