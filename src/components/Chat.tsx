import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatMessage {
  id: number;
  profileName: string;
  message: string;
  time: string;
}

const messages: ChatMessage[] = [
  { id: 1, profileName: "Perfil 1", message: "Mensagem", time: "Ago 1" },
  { id: 2, profileName: "Perfil 2", message: "Mensagem", time: "Ago 1" },
  { id: 3, profileName: "Perfil 3", message: "Mensagem", time: "Ago 1" },
  { id: 4, profileName: "Perfil 4", message: "Mensagem", time: "Ago 1" },
];

const Chat = () => {
  return (
    <Popover>
      <PopoverTrigger className="fixed bottom-4 right-4 bg-secondary p-3 rounded-full hover:bg-primary/20 transition-colors">
        <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0" />
        <div className="w-10 h-10 rounded-full bg-primary/20" />
      </PopoverTrigger>
      <PopoverContent className="w-80 h-[500px] p-0 bg-background border border-border" side="top" align="end">
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Conversando</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Procurar Mensagens"
              className="pl-10 bg-secondary border-none"
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20" />
                  <div className="flex-1">
                    <h4 className="font-medium">{msg.profileName}</h4>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Chat;