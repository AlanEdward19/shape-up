
import { useState } from "react";
import { X } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  profileId: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  onClose: () => void;
}

const ChatWindow = ({ profileId, firstName, lastName, imageUrl, onClose }: ChatWindowProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    if (isDragging && e.clientX !== 0 && e.clientY !== 0) {
      const chat = e.currentTarget;
      chat.style.left = `${e.clientX - position.x}px`;
      chat.style.top = `${e.clientY - position.y}px`;
    }
  };

  return (
    <div
      className="fixed bottom-0 right-0 w-80 bg-background border border-border rounded-t-lg shadow-lg flex flex-col"
      style={{ height: "500px", transform: "translateX(-20px)" }}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={() => setIsDragging(false)}
    >
      <div className="flex justify-between items-center p-2 border-b cursor-move">
        <div className="flex-1">
          <ChatHeader
            profileId={profileId}
            firstName={firstName}
            lastName={lastName}
            imageUrl={imageUrl}
          />
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ChatMessageList profileId={profileId} />
      <ChatInput profileId={profileId} />
    </div>
  );
};

export default ChatWindow;
