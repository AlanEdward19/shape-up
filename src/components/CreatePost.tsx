import { Camera, Video, Apple, Dumbbell, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

const actions = [
  { icon: Camera, label: "Foto" },
  { icon: Video, label: "Video" },
  { icon: Apple, label: "Dieta" },
  { icon: Dumbbell, label: "Treino" },
  { icon: Star, label: "Evolução" },
];

const CreatePost = () => {
  return (
    <div className="bg-secondary rounded-lg p-4 mb-6">
      <div className="flex gap-4 items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20"></div>
        <Input
          placeholder="No que está pensando?"
          className="flex-1 bg-muted border-none text-foreground"
        />
      </div>
      
      <div className="flex justify-between items-center">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <action.icon className="w-5 h-5" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CreatePost;