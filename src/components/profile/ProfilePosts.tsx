import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ProfileService } from "@/services/profileService";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { MessageCircle, Heart } from "lucide-react";

interface ProfilePostsProps {
  profileId: string;
}

const ProfilePosts = ({ profileId }: ProfilePostsProps) => {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['profilePosts', profileId],
    queryFn: async ({ pageParam = 1 }) => {
      const posts = await ProfileService.getPosts(profileId, pageParam);
      return posts;
    },
    getNextPageParam: (lastPage, allPages) => {
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

  if (status === 'pending') return <div>Carregando posts...</div>;
  if (status === 'error') return null;

  return (
    <div>
      <div className="grid grid-cols-3 gap-1">
        {data.pages.map((group, i) => (
          <div key={i} className="contents">
            {group.map((post) => (
              <Link 
                to={`/post/${post.id}`} 
                key={post.id} 
                className="aspect-square relative group overflow-hidden bg-secondary cursor-pointer"
              >
                {post.images && post.images.length > 0 ? (
                  <>
                    <img
                      src={post.images[0]}
                      alt="Post thumbnail"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 group-hover:opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="flex gap-6 text-white">
                        <div className="flex items-center gap-2">
                          <Heart className="w-6 h-6 fill-white" />
                          <span className="font-semibold">0</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-6 h-6" />
                          <span className="font-semibold">0</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground p-4 text-sm group-hover:bg-secondary/80">
                    {post.content.slice(0, 100)}{post.content.length > 100 ? '...' : ''}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
      
      <div ref={ref} className="h-10">
        {isFetchingNextPage && <div>Carregando mais posts...</div>}
      </div>

      {data.pages[0].length === 0 && (
        <div className="text-center text-muted-foreground">
          Nenhum post encontrado
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;