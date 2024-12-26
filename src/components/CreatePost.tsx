import { Camera, Video, Apple, Dumbbell, Star, Globe2, Users, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SocialService } from "@/services/api";

const actions = [
  { icon: Camera, label: "Foto", accept: "image/*" },
  { icon: Video, label: "Video", accept: "video/*" },
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
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [currentAction, setCurrentAction] = useState<string>("");

  const handleFileSelect = (actionType: string, accept: string) => {
    setCurrentAction(actionType);
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      toast.success(`${files.length} arquivo(s) selecionado(s)`);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("O conteúdo do post não pode estar vazio");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create post
      const postResponse = await SocialService.createPost({
        content,
        visibility: parseInt(visibility)
      });

      // Upload files if any were selected
      if (selectedFiles && selectedFiles.length > 0) {
        const formData = new FormData();
        Array.from(selectedFiles).forEach(file => {
          formData.append('files', file);
        });

        await SocialService.uploadPostImages(postResponse.id, formData);
      }

      // Reset form
      setContent("");
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Post criado com sucesso!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Erro ao criar o post. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-secondary rounded-lg p-4 mb-6">
      <div className="flex gap-4 items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20"></div>
        <Input
          placeholder="No que está pensando?"
          className="flex-1 bg-muted border-none text-foreground"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
          {actions.map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => action.accept && handleFileSelect(action.label, action.accept)}
              disabled={isSubmitting}
            >
              <action.icon className="w-5 h-5" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
        
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger className="w-[180px] bg-muted border-none text-foreground">
            <SelectValue placeholder="Visibilidade" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-muted">
            {visibilityOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="hover:bg-muted focus:bg-muted"
              >
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