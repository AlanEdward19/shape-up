import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CreatePost from "@/components/CreatePost";
import Stories from "@/components/Stories";
import Suggestions from "@/components/Suggestions";
import Post from "@/components/Post";
import Chat from "@/components/Chat";
import Sidebar from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SocialService } from "@/services/api";
import { setAuthData } from "@/utils/auth";
import { toast } from "sonner";
import { notificationService } from "@/services/notificationService";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

    // Cleanup on component unmount
    return () => {
      notificationService.stopConnection();
    };
  }, []); // Empty dependency array means this runs once when component mounts

  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('#id_token=')) {
      const token = hash.split('#id_token=')[1];
      if (token) {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        setAuthData(token, rememberMe);
        navigate('/index', { replace: true });
        toast.success('Login realizado com sucesso!');
      }
    }
  }, [location, navigate]);

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
                  <Post key={post.id} post={post} />
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

      <Chat />
    </div>
  );
};

export default Index;