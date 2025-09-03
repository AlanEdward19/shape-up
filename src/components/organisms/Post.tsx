import { useState, useEffect } from "react";
import { MessageCircle, Share2, X, Edit2, Image, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Post as PostType, PostReaction, PostComment } from "@/types/socialService.ts";
import { SocialService } from "@/services/socialService.ts";
import { getUserId } from "@/services/authService.ts";
import { toast } from "sonner";
import PostReactions from "@/components/molecules/PostReactions";
import PostMedia from "@/components/molecules/PostMedia";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface PostProps {
    post: PostType;
    expandComments?: boolean;
    onImageClick?: (post: PostType) => void;
}

const Post = ({ post, expandComments = false, onImageClick }: PostProps) => {
    const [showComments, setShowComments] = useState(expandComments);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [reactions, setReactions] = useState<PostReaction[]>([]);
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const userId = getUserId();
    const navigate = useNavigate();

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/profile/${post.publisherId}`);
    };

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

    useEffect(() => {
        if (expandComments) {
            fetchComments();
        }
    }, [expandComments]);

    const handlePostClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        // Only open modal if clicking directly on an image
        const isClickingImage = target.tagName === 'IMG';

        // Check if clicking on interactive elements that shouldn't trigger modal
        const isClickingInteractive = target.tagName === 'BUTTON' ||
            target.closest('button') !== null ||
            target.closest('.reactions-section') !== null ||
            target.closest('.hover-card-content') !== null ||
            target.closest('.hover-card-trigger') !== null ||
            target.closest('.hover-card') !== null ||
            target.closest('.comments-section') !== null;

        // Only open modal if clicking directly on an image and not on interactive elements
        if (!isClickingInteractive && isClickingImage) {
            onImageClick?.(post);
        }
    };

    return (
        <div className="bg-secondary rounded-lg p-4 mb-4" onClick={handlePostClick}>
            <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden rounded-full flex items-center justify-center" onClick={handleProfileClick}>
                    <AvatarImage
                        src={post.publisherImageUrl}
                        alt={`${post.publisherFirstName} ${post.publisherLastName}`}
                        // srcSet and sizes can be passed here if available from backend
                    />
                    <AvatarFallback>{(post.publisherFirstName?.[0] || '') + (post.publisherLastName?.[0] || 'U')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h3
                        className="font-medium cursor-pointer hover:underline"
                        onClick={handleProfileClick}
                    >
                        {`${post.publisherFirstName} ${post.publisherLastName}`}
                    </h3>
                </div>
            </div>

            <p className="text-left mb-4">{post.content}</p>

            {post.images && post.images.length > 0 && (
                <div className="post-image-container">
                    <PostMedia media={post.images} />
                </div>
            )}

            <div className="flex justify-between items-center text-muted-foreground reactions-section">
                <PostReactions
                    reactions={reactions}
                    userReaction={reactions.find(r => r.profileId === userId)}
                    onReact={handleReaction}
                />

                <button
                    className="flex items-center gap-2 hover:text-primary transition-colors comments-section"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowComments(!showComments);
                    }}
                >
                    <MessageCircle className="w-5 h-5" />
                    <span>Comentar ({comments.length})</span>
                </button>

                <button
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
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
                            <div key={comment.id} className="flex items-start gap-3 p-3 rounded-lg bg-background">
                                <div
                                    className="flex items-center gap-2 cursor-pointer group"
                                    onClick={() => navigate(`/profile/${comment.profileId}`)}
                                    title={`Ver perfil de ${comment.profileFirstName} ${comment.profileLastName}`}
                                >
                                    <Avatar className="w-8 h-8 group-hover:ring-2 group-hover:ring-primary transition">
                                        <AvatarImage src={comment.profileImageUrl} alt={`${comment.profileFirstName} ${comment.profileLastName}`} />
                                        <AvatarFallback>{(comment.profileFirstName?.[0] || '') + (comment.profileLastName?.[0] || 'U')}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium text-sm mb-1 group-hover:text-primary transition">
                                        {`${comment.profileFirstName} ${comment.profileLastName}`}
                                    </div>
                                </div>

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
                                        <div className="flex items-center gap-2">
                                            <p>{comment.content}</p>
                                        </div>
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
