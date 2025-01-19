import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "react-router-dom";
import { SocialService } from "@/services/api";
import Post from "@/components/Post";
import { toast } from "sonner";
import { Post as PostType } from "@/types/api";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const postFromState = location.state?.post as PostType;

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => SocialService.getPost(id!),
    initialData: postFromState,
    enabled: !postFromState,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch post:', error);
        toast.error("Falha ao carregar o post. Tente novamente mais tarde.");
      }
    }
  });

  if (isLoading) return <div className="p-4">Carregando post...</div>;
  if (error || !post) return <div className="p-4">Post não encontrado</div>;

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <Post post={post} expandComments />
    </div>
  );
};

export default PostPage;