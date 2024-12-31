import { format } from "date-fns";
import { getUserId } from "@/utils/auth";
import { decryptMessage } from "@/services/chatService";

interface ChatMessageProps {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  isLocalMessage?: boolean;
}

const ChatMessage = ({ senderId, message, timestamp, isLocalMessage }: ChatMessageProps) => {
  const currentUserId = getUserId();
  const isSender = senderId === currentUserId;
  
  // Only decrypt messages from API, not locally sent messages
  const displayMessage = isLocalMessage ? message : decryptMessage(message);

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isSender
            ? 'bg-primary text-primary-foreground ml-auto'
            : 'bg-secondary'
        }`}
      >
        <p className="break-words">{displayMessage}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {format(new Date(timestamp), "HH:mm")}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;