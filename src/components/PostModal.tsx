import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Post as PostType } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SocialService } from "@/services/api";
import { toast } from "sonner";
import { getUserId } from "@/utils/auth";
import PostReactions from "./PostReactions";
import PostMedia from "./PostMedia";

interface PostModalProps {
  post: PostType | null;
  isOpen: boolean;
  onClose: () => void;
}

const PostModal = ({ post, isOpen, onClose }: PostModalProps) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);
  const userId = getUserId();

  const fetchPostData = async () => {
    if (!post) return;
    try {
      const [postReactions, postComments] = await Promise.all([
        SocialService.getPostReactions(post.id),
        SocialService.getComments(post.id)
      ]);
      setReactions(postReactions);
      setComments(postComments);
    } catch (error) {
      console.error("Error fetching post data:", error);
      toast.error("Erro ao carregar dados do post");
    }
  };

  useEffect(() => {
    if (isOpen && post) {
      fetchPostData();
    }
  }, [isOpen, post]);

  const handleComment = async () => {
    if (!post || !newComment.trim()) return;

    try {
      await SocialService.commentOnPost(post.id, newComment);
      setNewComment("");
      await fetchPostData();
      toast.success("Comentário adicionado");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Erro ao adicionar comentário");
    }
  };

  const handleReaction = async (reactionType: number) => {
    if (!post) return;

    try {
      const userReaction = reactions.find(r => r.profileId === userId);
      
      if (userReaction) {
        if (reactionType.toString() === 'NaN') {
          await SocialService.deleteReaction(post.id);
        } else {
          await SocialService.reactToPost(post.id, reactionType);
        }
      } else {
        await SocialService.reactToPost(post.id, reactionType);
      }
      
      await fetchPostData();
      toast.success("Reação atualizada");
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast.error("Erro ao reagir ao post");
    }
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 bg-background border-none grid grid-cols-[1fr,400px] overflow-hidden">
        <div className="aspect-square bg-black flex items-center justify-center">
          <PostMedia media={post.images} />
        </div>
        
        <div className="flex flex-col h-full w-[400px]">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.publisherImageUrl} />
                <AvatarFallback>{post.publisherFirstName[0]}{post.publisherLastName[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{post.publisherFirstName} {post.publisherLastName}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{post.content}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.profileImageUrl} />
                  <AvatarFallback>{comment.profileFirstName[0]}{comment.profileLastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium">{comment.profileFirstName} {comment.profileLastName}</span>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-background">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <PostReactions
                  reactions={reactions}
                  userReaction={reactions.find(r => r.profileId === userId)}
                  onReact={handleReaction}
                  defaultOpen={false}
                />
                <button className="hover:text-primary transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
                className="min-w-0"
              />
              <Button onClick={handleComment} className="whitespace-nowrap">
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;