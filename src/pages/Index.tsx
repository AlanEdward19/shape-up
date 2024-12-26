import Sidebar from "@/components/Sidebar";
import CreatePost from "@/components/CreatePost";
import Stories from "@/components/Stories";
import Suggestions from "@/components/Suggestions";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="ml-20 flex gap-6 p-6">
        <div className="flex-1 max-w-2xl mx-auto">
          <Stories />
          <CreatePost />
          <div className="space-y-6">
            {/* Posts will be added here in future iterations */}
          </div>
        </div>
        
        <div className="w-80 hidden lg:block">
          <Suggestions />
        </div>
      </main>
    </div>
  );
};

export default Index;