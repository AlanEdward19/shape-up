import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ProfileService } from "@/services/profileService";
import { SocialService } from "@/services/api";
import { toast } from "sonner";
import { MessageCircle, Heart } from "lucide-react";
import { Post, PostReaction, PostComment } from "@/types/api";
import PostModal from "@/components/organisms/PostModal.tsx";

interface ProfilePostsProps {
  profileId: string;
}

const ProfilePosts = ({ profileId }: ProfilePostsProps) => {
  const { ref, inView } = useInView();
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, PostReaction[]>>({});
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['profilePosts', profileId],
    queryFn: ({ pageParam = 1 }) => ProfileService.getPosts(profileId, pageParam),
    getNextPageParam: (lastPage: Post[], allPages: Post[][]) => {
      return lastPage.length === 0 ? undefined : allPages.length + 1;
    },
    initialPageParam: 1,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch profile posts:', error);
        toast.error("Falha ao carregar posts. Tente novamente mais tarde.");
      }
    }
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePostHover = async (postId: string) => {
    if (!reactions[postId] || !comments[postId]) {
      try {
        const [postReactions, postComments] = await Promise.all([
          SocialService.getPostReactions(postId),
          SocialService.getComments(postId)
        ]);
        
        setReactions(prev => ({ ...prev, [postId]: postReactions }));
        setComments(prev => ({ ...prev, [postId]: postComments }));
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    }
    setHoveredPostId(postId);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  if (status === "pending") return <div>Carregando posts...</div>;
  if (status === "error") return null;

  return (
    <div>
      <div className="grid grid-cols-3 gap-1">
        {data?.pages.map((group, i) => (
          <div key={i} className="contents">
            {group.map((post) => (
              <div 
                key={post.id} 
                className="aspect-square relative group overflow-hidden bg-secondary cursor-pointer"
                onMouseEnter={() => handlePostHover(post.id)}
                onMouseLeave={() => setHoveredPostId(null)}
                onClick={() => handlePostClick(post)}
              >
                {post.images && post.images.length > 0 ? (
                  <>
                    <img
                      src={post.images[0]}
                      alt="Post thumbnail"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 group-hover:opacity-50"
                    />
                    {hoveredPostId === post.id && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity bg-black/40">
                        <div className="flex gap-6 text-white">
                          <div className="flex items-center gap-2">
                            <Heart className="w-6 h-6 fill-white" />
                            <span className="font-semibold">{reactions[post.id]?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-6 h-6" />
                            <span className="font-semibold">{comments[post.id]?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground p-4 text-sm group-hover:bg-secondary/80">
                    {post.content.slice(0, 100)}{post.content.length > 100 ? '...' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div ref={ref} className="h-10">
        {isFetchingNextPage && <div>Carregando mais posts...</div>}
      </div>

      {data?.pages[0].length === 0 && (
        <div className="text-center text-muted-foreground">
          Nenhum post encontrado
        </div>
      )}

      <PostModal 
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPost(null);
        }}
      />
    </div>
  );
};

export default ProfilePosts;