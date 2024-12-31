import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChatService } from "@/services/chatService";
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
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      const response = await ChatService.sendMessage(profileId, message);
      setMessage("");
      toast.success("Mensagem enviada");

      // Add the sent message to the messages cache
      queryClient.setQueryData(
        ["messages", profileId],
        (oldData: any) => {
          if (!oldData) return { pages: [[]], pageParams: [1] };
          
          const newMessage = {
            id: Date.now().toString(), // Temporary ID until we receive the real one from SignalR
            senderId: getUserId(),
            receiverId: profileId,
            encryptedMessage: message,
            timestamp: new Date().toISOString()
          };

          // Add the new message to the first page at the end
          const newPages = [...oldData.pages];
          newPages[0] = [...newPages[0], newMessage];
          
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