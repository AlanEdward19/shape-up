import { Camera, Video, Apple, Dumbbell, Star, Globe2, Users, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const actions = [
  { icon: Camera, label: "Foto" },
  { icon: Video, label: "Video" },
  { icon: Apple, label: "Dieta" },
  { icon: Dumbbell, label: "Treino" },
  { icon: Star, label: "Evolução" },
];

const visibilityOptions = [
  { value: "0", label: "Público", icon: Globe2 },
  { value: "1", label: "Somente Amigos", icon: Users },
  { value: "2", label: "Privado", icon: Lock },
];

const CreatePost = () => {
  const [visibility, setVisibility] = useState("0");

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
        <div className="flex gap-4">
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
        
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Visibilidade" />
          </SelectTrigger>
          <SelectContent>
            {visibilityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CreatePost;