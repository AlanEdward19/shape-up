import { useState, useEffect } from "react";
import { MessageCircle, Share2, X, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Post as PostType, PostReaction, PostComment } from "@/types/api";
import { SocialService } from "@/services/api";
import { getUserId } from "@/utils/auth";
import { toast } from "sonner";
import PostReactions from "./PostReactions";

const Post = ({ post }: { post: PostType }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [reactions, setReactions] = useState<PostReaction[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const userId = getUserId();

  const fetchReactions = async () => {
    try {
      const data = await SocialService.getPostReactions(post.id);
      setReactions(data);
    } catch (error) {
      console.error("Error fetching reactions:", error);
      toast.error("Erro ao carregar reações");
    }
  };

  const fetchComments = async () => {
    try {
      const data = await SocialService.getComments(post.id);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Erro ao carregar comentários");
    }
  };

  useEffect(() => {
    fetchReactions();
    fetchComments();
  }, [post.id]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, post.id]);

  const handleReaction = async (reactionType: number) => {
    try {
      const userReaction = reactions.find(r => r.profileId === userId);

      console.log("userReaction", userReaction);
      
      if (userReaction) {
        if (reactionType.toString() === 'NaN') {
          await SocialService.deleteReaction(post.id);
        } else {
          await SocialService.reactToPost(post.id, reactionType);
        }
      } else {
        await SocialService.reactToPost(post.id, reactionType);
      }
      
      await fetchReactions();
      toast.success("Reação atualizada");
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast.error("Erro ao reagir ao post");
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      await SocialService.commentOnPost(post.id, newComment);
      setNewComment("");
      await fetchComments();
      toast.success("Comentário adicionado");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Erro ao adicionar comentário");
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await SocialService.editComment(commentId, editContent);
      setEditingComment(null);
      setEditContent("");
      await fetchComments();
      toast.success("Comentário editado");
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Erro ao editar comentário");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await SocialService.deleteComment(commentId);
      await fetchComments();
      toast.success("Comentário removido");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erro ao remover comentário");
    }
  };

  return (
    <div className="bg-secondary rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20"></div>
        <div className="flex-1">
          <h3 className="font-medium">{`${post.publisherFirstName} ${post.publisherLastName}`}</h3>
        </div>
      </div>
      
      <p className="text-left mb-4">{post.content}</p>
      
      {post.images?.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={post.images[0]} 
            alt="Post content" 
            className="w-full h-auto" 
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
      )}
      
      <div className="flex justify-between items-center text-muted-foreground">
        <PostReactions
          reactions={reactions}
          userReaction={reactions.find(r => r.profileId === userId)}
          onReact={handleReaction}
        />

        <button 
          className="flex items-center gap-2 hover:text-primary transition-colors"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comentar ({comments.length})</span>
        </button>

        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Compartilhar</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
            />
            <Button onClick={handleComment}>Comentar</Button>
          </div>

          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2 p-2 rounded-lg bg-background">
                <div className="flex-1">
                  {editingComment === comment.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Edite seu comentário..."
                      />
                      <Button onClick={() => handleEditComment(comment.id)}>Salvar</Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setEditingComment(null);
                          setEditContent("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <p>{comment.content}</p>
                  )}
                </div>
                
                {comment.profileId === userId && !editingComment && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;