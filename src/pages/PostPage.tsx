import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SocialService } from "@/services/api";
import Post from "@/components/Post";
import { toast } from "sonner";
import { Post as PostType } from "@/types/api";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const postFromState = location.state?.post as PostType;

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => SocialService.getPost(id!),
    enabled: !postFromState && !!id,
    initialData: postFromState,
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!post) {
    return <div>Post não encontrado</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Post post={post} expandComments={true} />
    </div>
  );
};

export default PostPage;