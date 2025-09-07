import { Home, Users, Dumbbell, Utensils, UserCircle, ListTodo, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAuthData } from "@/services/authService.ts";
import { toast } from "sonner";
import { notificationService } from "@/services/notificationService";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SocialService } from "@/services/socialService.ts";
import FollowList from "@/components/profile/FollowList";

const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');

const MobileSidebar = () => {
  const navigate = useNavigate();
  const [showFriends, setShowFriends] = useState(false);
  const [friendsPage, setFriendsPage] = useState(1);
  const [friendsPerPage, setFriendsPerPage] = useState(10);

  const handleLogout = async () => {
    await notificationService.stopConnection();
    clearAuthData();
    toast.success("Logout realizado com sucesso!");
    navigate("/login");
  };

  const navItems = [
    { icon: Home, label: "Início", path: "/index" },
    { icon: Users, label: "Amigos", onClick: () => setShowFriends(true) },
    { icon: Dumbbell, label: "Treinos", path: "/training" },
    { icon: Utensils, label: "Nutrição", onClick: () => toast("Em breve!") },
    { icon: UserCircle, label: "Perfil", path: `/profile/${userId}` },
    { icon: ListTodo, label: "Planos", path: "/hub" },
    { icon: LogOut, label: "Sair", onClick: handleLogout },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["friends", userId, friendsPage, friendsPerPage],
    queryFn: () => SocialService.listFriends(userId, friendsPage, friendsPerPage),
    enabled: showFriends,
  });

  return (
    <>
      <nav className="flex justify-around items-center w-full h-14 bg-[#222737] border-t border-[#161b28]">
        {navItems.map(({ icon: Icon, label, path, onClick }) => (
          <button
            key={label}
            className="flex flex-col items-center justify-center text-[#e8ecf8] focus:outline-none px-2 py-1"
            onClick={onClick ? onClick : () => path && navigate(path)}
            aria-label={label}
          >
            <Icon size={24} />
          </button>
        ))}
      </nav>
      <Dialog open={showFriends} onOpenChange={setShowFriends}>
        <DialogContent>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Amigos</h2>
          </div>
          <FollowList
            users={data ?? []}
            isLoading={isLoading}
            title="Amigos"
            currentPage={friendsPage}
            onPageChange={setFriendsPage}
            onRowsChange={setFriendsPerPage}
            totalUsers={data?.length ?? 0}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileSidebar;
