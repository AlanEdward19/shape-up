import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ViewProfileResponse } from "@/types/socialService.ts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/socialService.ts";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { getUserId } from "@/services/authService.ts";
import FriendRequestButtons from "./friend-actions/FriendRequestButtons";

interface ProfileHeaderProps {
  profile: ViewProfileResponse;
  isOwnProfile: boolean;
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
  onFollowAction,
  onShowFollowers,
  onShowFollowing,
  followActionPending}: ProfileHeaderProps) => {
  const [open, setOpen] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', profile.id],
    queryFn: () => SocialService.listFriends(profile.id),
    enabled: !isOwnProfile,
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: () => SocialService.checkFriendRequestStatus(),
    enabled: !isOwnProfile,
  });

  const form = useForm<EditProfileForm>({
    defaultValues: {
      gender: profile.gender?.toString() ?? "",
      birthDate: profile.birthDate?.split('T')[0] ?? "",
      bio: profile.bio || "",
    },
  });

  useEffect(() => {
    form.reset({
      gender: profile.gender?.toString() ?? "",
      birthDate: profile.birthDate?.split('T')[0] ?? "",
      bio: profile.bio || "",
    });
  }, [profile]);

  const editProfileMutation = useMutation({
    mutationFn: async (data: Partial<EditProfileForm>) => {
      const payload: any = {};
      
      if (profile.gender == null || data.gender !== profile.gender.toString()) {
        payload.gender = parseInt(data.gender);
      }
      if (profile.birthDate == null || data.birthDate !== profile.birthDate.split('T')[0]) {
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

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      await SocialService.uploadProfilePicture(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Foto de perfil atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar foto de perfil');
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadProfilePictureMutation.mutate(file);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    setShowFullImage(true);
  };

  const onSubmit = (data: EditProfileForm) => {
    editProfileMutation.mutate(data);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
      <div className="relative group">
        <Avatar 
          className="w-32 h-32 md:w-40 md:h-40 cursor-pointer overflow-hidden rounded-full flex items-center justify-center"
          onClick={handleAvatarClick}
        >
          <AvatarImage src={profile.imageUrl} alt={`${profile.firstName} ${profile.lastName}`} className="object-cover w-full h-full rounded-full" />
          <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
        </Avatar>
        {isOwnProfile && (
          <div 
            className="absolute -top-1 -right-1 p-1.5 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-muted"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4 text-white" />
            <input
              id="profile-picture"
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

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
                              <SelectContent className="bg-background border border-border">
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
          <div className="flex gap-2">
            {!isOwnProfile && (
              <>
                <Button
                  onClick={onFollowAction}
                  variant={profile.isFollowing ? "destructive" : "default"}
                  disabled={followActionPending}
                >
                  {profile.isFollowing ? "Deixar de Seguir" : "Seguir"}
                </Button>

                <FriendRequestButtons
                  profileId={profile.id}
                  isFriend={profile.isFriend}
                  firstName={profile.firstName}
                  lastName={profile.lastName}
                  imageUrl={profile.imageUrl}
                  hasSentRequest={friendRequests.some((req: any) => req.profileId === profile.id && req.status === 0)}
                  hasReceivedRequest={friendRequests.some((req: any) => req.profileId === profile.id && req.status === 1)}
                />
              </>
            )}
          </div>
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

      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl">
          <img 
            src={profile.imageUrl} 
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;
