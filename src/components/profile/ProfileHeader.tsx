import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ViewProfileResponse, Gender } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/api";
import { toast } from "sonner";
import { useState } from "react";

interface ProfileHeaderProps {
  profile: ViewProfileResponse;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollowAction: () => void;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  followActionPending: boolean;
}

interface EditProfileForm {
  gender: string;
  birthDate: string;
  bio: string;
}

const ProfileHeader = ({
  profile,
  isOwnProfile,
  isFollowing,
  onFollowAction,
  onShowFollowers,
  onShowFollowing,
  followActionPending,
}: ProfileHeaderProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<EditProfileForm>({
    defaultValues: {
      gender: profile.gender.toString(),
      birthDate: profile.birthDate.split('T')[0],
      bio: profile.bio || "",
    },
  });

  const editProfileMutation = useMutation({
    mutationFn: async (data: Partial<EditProfileForm>) => {
      const payload: any = {};
      
      if (data.gender !== profile.gender.toString()) {
        payload.gender = parseInt(data.gender);
      }
      if (data.birthDate !== profile.birthDate.split('T')[0]) {
        payload.birthDate = data.birthDate;
      }
      if (data.bio !== profile.bio) {
        payload.bio = data.bio;
      }

      if (Object.keys(payload).length === 0) {
        throw new Error("Nenhuma alteração foi feita");
      }

      await SocialService.editProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success("Perfil atualizado com sucesso!");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    },
  });

  const onSubmit = (data: EditProfileForm) => {
    editProfileMutation.mutate(data);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
      <Avatar className="w-32 h-32 md:w-40 md:h-40">
        <AvatarImage src={profile.imageUrl} alt={`${profile.firstName} ${profile.lastName}`} />
        <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              {profile.firstName} {profile.lastName}
            </h1>
            {isOwnProfile && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gênero</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione seu gênero" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">Homem</SelectItem>
                                <SelectItem value="1">Mulher</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={editProfileMutation.isPending}>
                        Salvar
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {!isOwnProfile && (
            <Button
              onClick={onFollowAction}
              variant={isFollowing ? "destructive" : "default"}
              disabled={followActionPending}
              className="w-full md:w-auto"
            >
              {isFollowing ? "Deixar de Seguir" : "Seguir"}
            </Button>
          )}
        </div>

        <div className="flex space-x-6">
          <button
            onClick={() => {}}
            className="hover:text-primary transition-colors"
          >
            <span className="font-bold">{profile.posts}</span>{" "}
            <span className="text-muted-foreground">publicações</span>
          </button>
          <button
            onClick={onShowFollowers}
            className="hover:text-primary transition-colors"
          >
            <span className="font-bold">{profile.followers}</span>{" "}
            <span className="text-muted-foreground">seguidores</span>
          </button>
          <button
            onClick={onShowFollowing}
            className="hover:text-primary transition-colors"
          >
            <span className="font-bold">{profile.following}</span>{" "}
            <span className="text-muted-foreground">seguindo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;