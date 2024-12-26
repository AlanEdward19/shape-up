import { Users, Dumbbell, Utensils, UserCircle, ListTodo, Home, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-secondary flex flex-col items-center justify-between py-6">
      <div className="flex flex-col items-center space-y-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 h-auto p-2">
              <Home className="h-10 w-10 text-primary" />
              <span className="text-xs text-primary">Início</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Início</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 h-auto p-2">
              <Users className="h-10 w-10 text-primary" />
              <span className="text-xs text-primary">Amigos</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Amigos</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 h-auto p-2">
              <Dumbbell className="h-10 w-10 text-primary" />
              <span className="text-xs text-primary">Treinos</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Treinos</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 h-auto p-2">
              <Utensils className="h-10 w-10 text-primary" />
              <span className="text-xs text-primary">Nutrição</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Nutrição</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 h-auto p-2">
              <UserCircle className="h-10 w-10 text-primary" />
              <span className="text-xs text-primary">Perfil</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Perfil</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 h-auto p-2">
              <ListTodo className="h-10 w-10 text-primary" />
              <span className="text-xs text-primary">Planos</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Planos</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 h-auto p-2">
              <Settings className="h-10 w-10 text-primary" />
              <span className="text-xs text-primary">Opções</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Opções</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 h-auto p-2"
            >
              <LogOut className="h-10 w-10 text-primary" />
              <span className="text-xs text-primary">Sair</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Sair</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default Sidebar;