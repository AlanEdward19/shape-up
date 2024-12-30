import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChatService } from "@/services/chatService";
import { toast } from "sonner";

interface ChatInputProps {
  profileId: string;
}

const ChatInput = ({ profileId }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      await ChatService.sendMessage(profileId, message);
      setMessage("");
      toast.success("Mensagem enviada");
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