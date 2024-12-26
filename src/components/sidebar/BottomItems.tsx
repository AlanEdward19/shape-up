import { Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAuthConfig } from "@/utils/auth";
import { toast } from "sonner";
import SidebarItem from "./SidebarItem";

const BottomItems = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthConfig();
    toast.success("Logout realizado com sucesso!");
    navigate("/login");
  };

  const items = [
    { icon: Settings, label: "Opções" },
    { icon: LogOut, label: "Sair", onClick: handleLogout },
  ];

  return (
    <div className="flex flex-col items-center space-y-6">
      {items.map((item) => (
        <SidebarItem key={item.label} {...item} />
      ))}
    </div>
  );
};

export default BottomItems;