import Stories from "@/components/organisms/Stories";
import Suggestions from "@/components/organisms/Suggestions";
import CreatePost from "@/components/organisms/CreatePost";
import Post from "@/components/organisms/Post";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { SocialService } from "@/services/socialService.ts";
import { useState } from "react";
import PostModal from "@/components/organisms/PostModal";
import { Post as PostType } from "@/types/socialService.ts";
import MobileSidebar from "@/components/organisms/MobileSidebar";
import SearchBar from "@/components/molecules/SearchBar";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileMainPage = () => {
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["activityFeed"],
    queryFn: SocialService.getActivityFeed,
  });
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#161b28]">
      {/* Top bar with SearchBar, Stories and Suggestions */}
      <div className="px-2 pt-2 flex flex-col space-y-2">
        <div className="mb-4">
            <SearchBar />
        </div>
        <Stories />
        {!isMobile && (
          <div className="mb-2">
            <Suggestions />
          </div>
        )}
      </div>
      {/* Create Post */}
      <div className="px-2 mb-1 mt-5">
        <CreatePost />
      </div>
      {/* Posts */}
      <ScrollArea className="flex-1 px-2 pb-28">
        {isLoading ? (
          <div>Carregando...</div>
        ) : error ? (
          <div>Erro ao carregar posts</div>
        ) : (
          posts?.map((post: PostType) => (
            <Post
              key={post.id}
              post={post}
              onImageClick={setSelectedPost}
            />
          ))
        )}
      </ScrollArea>
      {/* Mobile Sidebar/Navbar */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <MobileSidebar />
      </div>
    </div>
  );
};

export default MobileMainPage;
