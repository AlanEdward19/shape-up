import { Camera, Video, Apple, Dumbbell, Star, Globe2, Users, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SocialService } from "@/services/socialService.ts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentAction, setCurrentAction] = useState<string>("");
  
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userId ? SocialService.viewProfile(userId) : null,
    enabled: !!userId,
  });

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
      setSelectedFiles(Array.from(files));
      toast.success(`${files.length} arquivo(s) selecionado(s)`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("O conteúdo do post não pode estar vazio");
      return;
    }

    setIsSubmitting(true);
    try {
      const postResponse = await SocialService.createPost({
        content,
        visibility: parseInt(visibility)
      });

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        await SocialService.uploadPostImages(postResponse.id, formData);
      }

      setContent("");
      setSelectedFiles([]);
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
        <Avatar className="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center">
          <AvatarImage
            src={profile?.imageUrl}
            alt="Profile picture"
            // srcSet and sizes can be passed here if available from backend
          />
          <AvatarFallback>{(profile?.firstName?.[0] || '') + (profile?.lastName?.[0] || 'U')}</AvatarFallback>
        </Avatar>
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
        <button
          type="button"
          className="ml-2 px-6 py-2 bg-primary text-white rounded-full shadow-sm hover:bg-primary/90 transition disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
        >
          Postar
        </button>
      </div>

      {/* Preview Section */}
      {selectedFiles.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {selectedFiles.map((file, idx) => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            const url = URL.createObjectURL(file);
            return (
              <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border bg-muted flex items-center justify-center">
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center z-10"
                  onClick={() => handleRemoveFile(idx)}
                  aria-label="Remover arquivo"
                  disabled={isSubmitting}
                >
                  ×
                </button>
                {isImage && <img src={url} alt={file.name} className="object-cover w-full h-full" />}
                {isVideo && (
                  <video src={url} className="object-cover w-full h-full" controls />
                )}
              </div>
            );
          })}
        </div>
      )}

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
