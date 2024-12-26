import CreatePost from "@/components/CreatePost";
import Stories from "@/components/Stories";
import Suggestions from "@/components/Suggestions";
import Post from "@/components/Post";
import Chat from "@/components/Chat";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockPosts = [
  {
    id: 1,
    author: "João Silva",
    content: "Hoje foi dia de treino pesado! 💪 Superando limites a cada dia.",
    likes: 24,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    author: "Maria Santos",
    content: "Compartilhando minha nova dieta low carb! Quem mais está nessa jornada? 🥗",
    likes: 15,
  },
  {
    id: 3,
    author: "Pedro Costa",
    content: "Novo recorde pessoal no supino! 🏋️‍♂️ A consistência é a chave do sucesso.",
    likes: 32,
    image: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?q=80&w=1000&auto=format&fit=crop"
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="ml-20 flex gap-6 p-6">
        <div className="flex-1 max-w-2xl mx-auto">
          <CreatePost />
          <Stories />
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6">
              {mockPosts.map((post) => (
                <Post
                  key={post.id}
                  author={post.author}
                  content={post.content}
                  likes={post.likes}
                  image={post.image}
                />
              ))}
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