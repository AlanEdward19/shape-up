import { Home, Search, Bell, MessageCircle, UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-secondary flex flex-col items-center justify-between py-4">
      <div className="space-y-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Home className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Início</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Search className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Pesquisar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Bell className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Notificações</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Mensagens</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserCircle className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Perfil</TooltipContent>
        </Tooltip>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Sair</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default Sidebar;