
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
        <div className="fixed top-0 left-20 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20">
          <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex-1 hidden sm:block" />
            <div className="flex-1 w-full sm:max-w-xl px-2 sm:px-0">
              <SearchBar />
            </div>
            <div className="flex-1 hidden sm:block" />
          </div>
        </div>
        <main className="px-4 sm:px-6 lg:px-8 mt-16">
          {children}
        </main>
      </div>
      <Chat />
    </div>
  );
};

export default MainLayout;
