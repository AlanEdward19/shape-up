import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ChatInput = () => {
  return (
    <div className="p-4 border-t flex gap-2">
      <Input placeholder="Digite sua mensagem..." className="flex-1" />
      <Button size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatInput;