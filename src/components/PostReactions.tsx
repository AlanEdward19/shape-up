import { useState } from "react";
import { PostReaction } from "@/types/api";
import { ReactionType, reactionEmojis, getReactionEmoji } from "@/types/reactions";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface PostReactionsProps {
  reactions: PostReaction[];
  userReaction?: PostReaction;
  onReact: (reactionType: number) => void;
}

const PostReactions = ({ reactions, userReaction, onReact }: PostReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReactionClick = (reactionType: number) => {
    if (userReaction) {
      if (userReaction.reactionType === reactionType.toString()) {
        // If clicking the same reaction, delete it
        onReact(reactionType);
      } else {
        // If clicking a different reaction, update it
        onReact(reactionType);
      }
    } else {
      // If no reaction exists, create new one
      onReact(reactionType);
    }
    setIsOpen(false);
  };

  const handleMainReactionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (userReaction) {
      // If already reacted, clicking the main button removes the reaction
      onReact(Number(userReaction.reactionType));
    }
  };

  // Group reactions by type and count them
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const count = acc[reaction.reactionType] || 0;
    acc[reaction.reactionType] = count + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort reactions by count (descending)
  const sortedReactions = Object.entries(groupedReactions)
    .sort(([, a], [, b]) => b - a)
    .map(([type]) => type);

  // Get total reactions count
  const totalReactions = reactions.length;

  return (
    <HoverCard openDelay={0} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button 
          className="flex items-center gap-2 hover:text-primary transition-colors"
          onClick={handleMainReactionClick}
        >
          <div className="flex -space-x-3">
            {sortedReactions.map((type, index) => (
              <span 
                key={type} 
                className="text-xl relative hover:z-10 transition-transform hover:scale-110" 
                style={{ 
                  zIndex: sortedReactions.length - index,
                  transform: `translateX(${index * 2}px)`
                }}
              >
                {getReactionEmoji(type)}
              </span>
            ))}
          </div>
          <span>{totalReactions}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-2 bg-secondary border border-muted">
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(reactionEmojis).map(([type, emoji]) => (
            <button
              key={type}
              onClick={() => handleReactionClick(Number(type))}
              className="text-xl p-2 hover:bg-primary/20 rounded cursor-pointer transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default PostReactions;