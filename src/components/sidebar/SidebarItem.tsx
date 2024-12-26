import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, onClick }: SidebarItemProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className="flex flex-col items-center gap-1 h-auto p-2 w-full hover:bg-secondary-foreground/10"
        >
          <Icon className="h-10 w-10 text-primary" />
          <span className="text-xs text-primary">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};

export default SidebarItem;