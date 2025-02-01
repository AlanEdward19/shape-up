import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface ChatDateSeparatorProps {
  date: Date;
}

const ChatDateSeparator = ({ date }: ChatDateSeparatorProps) => {
  return (
    <div className="flex items-center gap-4 my-6">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </span>
      <Separator className="flex-1" />
    </div>
  );
};

export default ChatDateSeparator;