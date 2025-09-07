import Sidebar from "@/components/organisms/Sidebar";
import Chat from "@/components/organisms/Chat";
import SearchBar from "../molecules/SearchBar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSidebar from "@/components/organisms/MobileSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  if (isMobile === undefined) {
    // Prevent layout flash on initial load
    return null;
  }
  if (isMobile) {
    return (
      <div className="min-h-screen w-full text-[#e8ecf8] bg-[#161b28] relative">
        <div className="pb-16">{/* Add bottom padding for mobile sidebar */}
          {children}
        </div>
        <div className="fixed bottom-0 left-0 w-full h-14 bg-[#222737] flex items-center justify-around border-t border-[#161b28] z-50">
          <MobileSidebar />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full text-[#e8ecf8]" style={{
      background: "radial-gradient(1200px 600px at 10% -10%, #1b2437 0, transparent 60%), #0f1420"
    }}>
      <Sidebar />
      <div className="flex-1 ml-20">
        <div className="fixed top-0 left-20 right-0 bg-[#0f1420]/95 backdrop-blur-md border-b border-[#222737] z-20">
          <div className="flex items-center justify-between h-16">
            <div className="flex-1 hidden sm:block" />
            <div className="flex-1 w-full sm:max-w-xl px-4">
              <SearchBar />
            </div>
            <div className="flex-1 hidden sm:block" />
          </div>
        </div>
        <main className="p-4 sm:p-6 mt-16">
          {children}
        </main>
      </div>
      <Chat />
    </div>
  );
};

export default MainLayout;
