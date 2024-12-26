import { MessageCircle, Heart, Share2 } from "lucide-react";

const Post = ({ author, content, likes }: { author: string; content: string; likes: number }) => {
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
      
      <div className="flex justify-between items-center text-muted-foreground">
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <Heart className="w-5 h-5" />
          <span>{likes}</span>
        </button>
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