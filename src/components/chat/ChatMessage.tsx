import { format } from "date-fns";
import { getUserId } from "@/utils/auth";

interface ChatMessageProps {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
}

const ChatMessage = ({ senderId, message, timestamp }: ChatMessageProps) => {
  const currentUserId = getUserId();
  const isSender = senderId === currentUserId;

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isSender
            ? 'bg-primary text-primary-foreground ml-auto'
            : 'bg-secondary'
        }`}
      >
        <p className="break-words">{message}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {format(new Date(timestamp), "HH:mm")}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;