import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Post as PostType } from "@/types/socialService.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, X, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SocialService } from "@/services/socialService.ts";
import { toast } from "sonner";
import { getUserId } from "@/services/authService.ts";
import PostReactions from "@/components/molecules/PostReactions.tsx";
import PostMedia from "../molecules/PostMedia";
import { useNavigate } from "react-router-dom";

interface PostModalProps {
    post: PostType | null;
    isOpen: boolean;
    onClose: () => void;
}

const PostModal = ({ post, isOpen, onClose }: PostModalProps) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);
    const [reactions, setReactions] = useState([]);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const userId = getUserId();
    const navigate = useNavigate();

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

    const handleEditComment = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            await SocialService.editComment(commentId, editContent);
            setEditingComment(null);
            setEditContent("");
            await fetchPostData();
            toast.success("Comentário editado");
        } catch (error) {
            console.error("Error editing comment:", error);
            toast.error("Erro ao editar comentário");
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await SocialService.deleteComment(commentId);
            await fetchPostData();
            toast.success("Comentário removido");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Erro ao remover comentário");
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
            <DialogContent className={`${post.images && post.images.length > 0 ? 'max-w-4xl max-h-[90vh] grid-cols-[2fr,400px]' : 'max-w-2xl max-h-[90vh] grid-cols-1'} p-0 bg-background border-none grid overflow-hidden`}>
                {post.images && post.images.length > 0 && (
                    <div className="flex items-center justify-center pl-4 pt-4">
                        <div className="w-full">
                            <PostMedia media={post.images} />
                        </div>
                    </div>
                )}
                <div className={`flex flex-col h-full ${post.images && post.images.length > 0 ? 'w-[400px]' : 'w-full items-center justify-center'}`}>
                    <div className="p-4 border-b w-full">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={post.publisherImageUrl} />
                                <AvatarFallback>{post.publisherFirstName[0]}{post.publisherLastName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{post.publisherFirstName} {post.publisherLastName}</span>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{post.content}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 items-start">
                                <div
                                    className="flex items-center gap-2 cursor-pointer group"
                                    onClick={() => navigate(`/profile/${comment.profileId}`)}
                                    title={`Ver perfil de ${comment.profileFirstName} ${comment.profileLastName}`}
                                    style={{ minWidth: 0 }}
                                >
                                    <Avatar className="w-8 h-8 group-hover:ring-2 group-hover:ring-primary transition">
                                        <AvatarImage src={comment.profileImageUrl} />
                                        <AvatarFallback>{comment.profileFirstName[0]}{comment.profileLastName[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium group-hover:text-primary transition truncate">
                                        {comment.profileFirstName} {comment.profileLastName}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    {editingComment === comment.id ? (
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                placeholder="Edite seu comentário..."
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleEditComment(comment.id);
                                                    }
                                                }}
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
                                        <p className="text-sm mt-1 break-words">{comment.content}</p>
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

                    <div className="p-4 border-t bg-background w-full">
                        <div className={`flex mb-4 ${post.images && post.images.length > 0 ? 'justify-between items-center' : 'justify-end items-center'}`}>
                            <div className={`flex gap-4 ${post.images && post.images.length > 0 ? '' : 'ml-auto'}`}>
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