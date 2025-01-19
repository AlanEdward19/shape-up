import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Post from "@/components/Post";
import { ProfileService } from "@/services/profileService";
import { toast } from "sonner";

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
    <div className="space-y-4">
      {data.pages.map((group, i) => (
        <div key={i}>
          {group.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      ))}
      
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