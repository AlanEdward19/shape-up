import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { format } from 'date-fns';
import { ChatService, decryptMessage, encryptMessage } from "@/services/chatService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/services/authService.ts";

interface ChatInputProps {
  profileId: string;
  isProfessionalChat?: boolean;
}

const ChatInput = ({ profileId, isProfessionalChat = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when message is cleared and not sending
  useEffect(() => {
    if (message === "" && !isSending) {
      inputRef.current?.focus();
    }
  }, [message, isSending]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await ChatService.sendMessage(isProfessionalChat, profileId, message);
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
        ref={inputRef}
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
