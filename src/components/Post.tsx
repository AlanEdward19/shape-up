import { useState } from "react";
import { MessageCircle, Heart, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostProps {
  author: string;
  content: string;
  likes: number;
  image?: string;
}

const reactions = [
  { name: "Like", emoji: "👍" },
  { name: "Dislike", emoji: "👎" },
  { name: "Love", emoji: "❤️" },
  { name: "Haha", emoji: "😄" },
  { name: "Wow", emoji: "😮" },
  { name: "Sad", emoji: "😢" },
  { name: "Angry", emoji: "😠" },
  { name: "Care", emoji: "🤗" },
  { name: "Support", emoji: "💪" },
  { name: "Celebrate", emoji: "🎉" },
];

const Post = ({ author, content, likes, image }: PostProps) => {
  const [currentReaction, setCurrentReaction] = useState({ name: "Like", emoji: "👍" });
  const [reactionCount, setReactionCount] = useState(likes);

  const handleReaction = (reaction: typeof reactions[0]) => {
    if (currentReaction.name === reaction.name) {
      setCurrentReaction({ name: "Like", emoji: "👍" });
      setReactionCount(prev => prev - 1);
    } else {
      setCurrentReaction(reaction);
      setReactionCount(prev => prev + 1);
    }
  };

  return (
    <div className="bg-secondary rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20"></div>
        <div className="flex-1">
          <h3 className="font-medium">{author}</h3>
          <p className="text-sm text-muted-foreground">há 2 horas</p>
        </div>
      </div>
      
      <p className="text-left mb-4">{content}</p>
      
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={image} alt="Post content" className="w-full h-auto" />
        </div>
      )}
      
      <div className="flex justify-between items-center text-muted-foreground">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:text-primary transition-colors">
              <span className="text-xl">{currentReaction.emoji}</span>
              <span>{reactionCount}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="grid grid-cols-5 gap-2 p-2">
              {reactions.map((reaction) => (
                <DropdownMenuItem
                  key={reaction.name}
                  onClick={() => handleReaction(reaction)}
                  className="cursor-pointer text-xl text-center hover:bg-primary/20"
                >
                  {reaction.emoji}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>Comentar</span>
        </button>
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Compartilhar</span>
        </button>
      </div>
    </div>
  );
};

export default Post;