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
import { SocialService, getTimeDifference, getImageUrl } from "@/services/api";
import { toast } from "sonner";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extrair o ID do token da URL após o redirecionamento do Azure AD B2C
    const hash = location.hash;
    if (hash && hash.includes('#id_token=')) {
      const token = hash.split('#id_token=')[1];
      if (token) {
        // Salvar o ID do usuário no localStorage ou sessionStorage
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (rememberMe) {
          localStorage.setItem('userId', token);
        } else {
          sessionStorage.setItem('userId', token);
        }

        // Limpar a URL após salvar o ID
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
              ) : (
                posts?.map((post, index) => (
                  <Post
                    key={index}
                    author="Usuário" // This should come from the API
                    content={post.content}
                    likes={0} // This should come from the API
                    image={post.images?.[0] ? getImageUrl(post.images[0]) : undefined}
                  />
                ))
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