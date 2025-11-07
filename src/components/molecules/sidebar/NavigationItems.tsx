import { Home, Users, Dumbbell, Utensils, UserCircle, ListTodo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import NotificationIcon from "@/components/atoms/NotificationIcon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import FollowList from "@/components/molecules/profile/FollowList";
import { useQuery } from "@tanstack/react-query";
import { SocialService } from "@/services/socialService.ts";
import {toast} from "sonner";

const NavigationItems = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
  const [showFriends, setShowFriends] = useState(false);
  const [friendsPage, setFriendsPage] = useState(1);
  const [friendsPerPage, setFriendsPerPage] = useState("10");

  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ['friends', userId, friendsPage, friendsPerPage],
    queryFn: () => SocialService.listFriends(userId!, friendsPage, Number(friendsPerPage)),
    enabled: showFriends,
  });

  const handleFriendsPageChange = (page: number) => {
    setFriendsPage(page);
  };

  const handleFriendsRowsChange = (rows: string) => {
    setFriendsPerPage(rows);
    setFriendsPage(1);
  };

  const items = [
    { icon: Home, label: "Início", onClick: () => navigate('/index') },
    { icon: Users, label: "Amigos", onClick: () => setShowFriends(true) },
    { icon: Dumbbell, label: "Treinos", onClick: () => navigate('/training') },
    { icon: Utensils, label: "Nutrição", onClick: () => navigate('/nutrition') },
    { icon: UserCircle, label: "Perfil", onClick: () => navigate(`/profile/${userId}`) },
    { icon: ListTodo, label: "Planos", onClick: () => navigate('/hub') },
  ];

  return (
    <div className="flex flex-col items-center space-y-6 mt-8">
      {items.map((item) => (
        <SidebarItem key={item.label} {...item} />
      ))}
      <NotificationIcon />

      <Dialog open={showFriends} onOpenChange={setShowFriends}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amigos</DialogTitle>
          </DialogHeader>
          <FollowList
            users={friends}
            isLoading={isLoadingFriends}
            title="Amigos"
            currentPage={friendsPage}
            onPageChange={handleFriendsPageChange}
            onRowsChange={handleFriendsRowsChange}
            totalUsers={friends?.length || 0}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NavigationItems;