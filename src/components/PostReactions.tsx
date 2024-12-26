import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PostReaction } from "@/types/api";
import { ReactionType, reactionEmojis, getReactionEmoji } from "@/types/reactions";

interface PostReactionsProps {
  reactions: PostReaction[];
  userReaction?: PostReaction;
  onReact: (reactionType: number) => void;
}

const PostReactions = ({ reactions, userReaction, onReact }: PostReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (reactionType: number) => {
    onReact(reactionType);
    setIsOpen(false);
  };

  const groupedReactions = reactions.reduce((acc, reaction) => {
    const count = acc[reaction.reactionType] || 0;
    acc[reaction.reactionType] = count + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedReactions = Object.entries(groupedReactions)
    .sort(([, a], [, b]) => b - a);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <span className="text-xl">
            {userReaction ? getReactionEmoji(userReaction.reactionType) : "👍"}
          </span>
          <span>{reactions.length}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-secondary border border-muted">
        <div className="grid grid-cols-5 gap-2 p-2">
          {Object.entries(reactionEmojis).map(([type, emoji]) => (
            <DropdownMenuItem
              key={type}
              onClick={() => handleReaction(Number(type))}
              className="cursor-pointer text-xl text-center hover:bg-primary/20"
            >
              {emoji}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostReactions;