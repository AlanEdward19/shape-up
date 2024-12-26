import { Home, Users, Dumbbell, Leaf, User, CreditCard, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", href: "/" },
  { icon: Users, label: "Amigos", href: "/friends" },
  { icon: Dumbbell, label: "Treinos", href: "/workouts" },
  { icon: Leaf, label: "Nutrição", href: "/nutrition" },
  { icon: User, label: "Perfil", href: "/profile" },
  { icon: CreditCard, label: "Planos", href: "/plans" },
];

const bottomItems = [
  { icon: Settings, label: "Opções", href: "/settings" },
  { icon: LogOut, label: "Sair", href: "/logout" },
];

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-secondary flex flex-col items-center py-6">
      <div className="text-xl font-bold text-primary mb-8">SU</div>
      
      <nav className="flex-1 flex flex-col items-center gap-6">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-muted-foreground hover:text-primary transition-colors group"
          >
            <div className="flex flex-col items-center gap-1">
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </div>
          </a>
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-6">
        {bottomItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <div className="flex flex-col items-center gap-1">
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;