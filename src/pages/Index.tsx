import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePost from "@/components/organisms/CreatePost";
import Stories from "@/components/organisms/Stories";
import Suggestions from "@/components/organisms/Suggestions";
import Post from "@/components/organisms/Post";
import Sidebar from "@/components/organisms/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SocialService } from "@/services/api";
import { toast } from "sonner";
import { notificationService } from "@/services/notificationService";
import PostModal from "@/components/organisms/PostModal";
import { Post as PostType } from "@/types/api";

const Index = () => {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.startConnection();
      } catch (error) {
        console.error("Failed to connect to SignalR:", error);
        toast.error("Falha ao conectar ao serviço de notificações");
      }
    };

    initializeNotifications();

    return () => {
      notificationService.stopConnection();
    };
  }, []);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['activityFeed'],
    queryFn: SocialService.getActivityFeed,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch posts:', error);
        toast.error("Falha ao carregar os posts. Tente novamente mais tarde.");
      }
    }
  });

  const handlePostClick = (post: PostType) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="ml-20 flex gap-6 p-6">
        <div className="flex-1 max-w-2xl mx-auto">
          <CreatePost />
          <Stories />
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center">Carregando posts...</div>
              ) : error ? (
                <div className="text-center text-red-500">Erro ao carregar posts</div>
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id}>
                    <Post 
                      post={post} 
                      onImageClick={handlePostClick}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center">Nenhum post encontrado</div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="w-80 hidden lg:block">
          <Suggestions />
        </div>
      </main>

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

export default Index;
