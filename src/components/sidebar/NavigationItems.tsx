import { Home, Users, Dumbbell, Utensils, UserCircle, ListTodo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";

const NavigationItems = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

  const items = [
    { icon: Home, label: "Início", onClick: () => navigate('/index') },
    { icon: Users, label: "Amigos" },
    { icon: Dumbbell, label: "Treinos" },
    { icon: Utensils, label: "Nutrição" },
    { icon: UserCircle, label: "Perfil", onClick: () => navigate(`/profile/${userId}`) },
    { icon: ListTodo, label: "Planos" },
  ];

  return (
    <div className="flex flex-col items-center space-y-6">
      {items.map((item) => (
        <SidebarItem key={item.label} {...item} />
      ))}
    </div>
  );
};

export default NavigationItems;