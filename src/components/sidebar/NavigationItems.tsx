import { Home, Users, Dumbbell, Utensils, UserCircle, ListTodo } from "lucide-react";
import SidebarItem from "./SidebarItem";

const NavigationItems = () => {
  const items = [
    { icon: Home, label: "Início" },
    { icon: Users, label: "Amigos" },
    { icon: Dumbbell, label: "Treinos" },
    { icon: Utensils, label: "Nutrição" },
    { icon: UserCircle, label: "Perfil" },
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