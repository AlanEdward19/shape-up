
import Sidebar from "@/components/organisms/Sidebar";
import Chat from "@/components/organisms/Chat";
import SearchBar from "@/components/SearchBar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-20">
        <div className="fixed top-0 left-20 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20 border-b flex items-center justify-center px-4">
          <SearchBar />
        </div>
        <main className="p-6 mt-16">
          {children}
        </main>
      </div>
      <Chat />
    </div>
  );
};

export default MainLayout;
