import Sidebar from "@/components/organisms/Sidebar";
import Chat from "@/components/organisms/Chat";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-20 p-6">
        {children}
      </main>
      <Chat />
    </div>
  );
};

export default MainLayout;