import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ViewProfileResponse, Gender, Friend, FriendRequest } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, UserPlus, UserMinus, Pencil, UserX } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/api";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { getUserId } from "@/utils/auth";

interface ProfileHeaderProps {
  profile: ViewProfileResponse;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollowAction: () => void;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  followActionPending: boolean;
  onOpenChat: (profileId: string) => void;
}

interface EditProfileForm {
  gender: string;
  birthDate: string;
  bio: string;
}

interface FriendRequestForm {
  message: string;
}

const ProfileHeader = ({
  profile,
  isOwnProfile,
  isFollowing,
  onFollowAction,
  onShowFollowers,
  onShowFollowing,
  followActionPending,
  onOpenChat,
}: ProfileHeaderProps) => {
  const [open, setOpen] = useState(false);
  const [friendRequestOpen, setFriendRequestOpen] = useState(false);
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

  const isFriend = friends.some(friend => friend.profileId === getUserId());
  const hasSentRequest = friendRequests.some(request => 
    request.profileId === profile.id && request.status === 0
  );
  const hasReceivedRequest = friendRequests.some(request => 
    request.profileId === profile.id && request.status === 1
  );

  const form = useForm<EditProfileForm>({
    defaultValues: {
      gender: profile.gender?.toString() ?? "",
      birthDate: profile.birthDate?.split('T')[0] ?? "",
      bio: profile.bio || "",
    },
  });

  const friendRequestForm = useForm<FriendRequestForm>({
    defaultValues: {
      message: "",
    },
  });

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

  const sendFriendRequestMutation = useMutation({
    mutationFn: (data: FriendRequestForm) => 
      SocialService.sendFriendRequest(profile.id, data.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success("Solicitação de amizade enviada!");
      setFriendRequestOpen(false);
    },
    onError: () => {
      toast.error("Erro ao enviar solicitação de amizade");
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: () => SocialService.removeFriend(profile.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success("Amizade removida com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover amizade");
    },
  });

  const cancelFriendRequestMutation = useMutation({
    mutationFn: () => SocialService.removeFriendRequest(profile.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success("Solicitação de amizade cancelada!");
    },
    onError: () => {
      toast.error("Erro ao cancelar solicitação de amizade");
    },
  });

  const manageFriendRequestMutation = useMutation({
    mutationFn: (accept: boolean) => SocialService.manageFriendRequest(profile.id, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success("Solicitação de amizade atualizada!");
    },
    onError: () => {
      toast.error("Erro ao processar solicitação de amizade");
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

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
      <div className="relative group">
        <Avatar 
          className="w-32 h-32 md:w-40 md:h-40 cursor-pointer"
          onClick={handleAvatarClick}
        >
          <AvatarImage src={profile.imageUrl} alt={`${profile.firstName} ${profile.lastName}`} />
          <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
          {isOwnProfile && (
            <div 
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
        </Avatar>
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
                  variant={isFollowing ? "destructive" : "default"}
                  disabled={followActionPending}
                >
                  {isFollowing ? "Deixar de Seguir" : "Seguir"}
                </Button>

                <Button
                  variant="outline"
                  disabled={!isFriend}
                  onClick={() => onOpenChat(profile.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Mensagem
                </Button>

                {isFriend ? (
                  <Button
                    variant="destructive"
                    onClick={() => removeFriendMutation.mutate()}
                    disabled={removeFriendMutation.isPending}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Desfazer Amizade
                  </Button>
                ) : hasReceivedRequest ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      Você possui uma solicitação de amizade pendente deste perfil
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => manageFriendRequestMutation.mutate(true)}
                        disabled={manageFriendRequestMutation.isPending}
                      >
                        Aceitar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => manageFriendRequestMutation.mutate(false)}
                        disabled={manageFriendRequestMutation.isPending}
                      >
                        Recusar
                      </Button>
                    </div>
                  </div>
                ) : hasSentRequest ? (
                  <Button
                    variant="destructive"
                    onClick={() => cancelFriendRequestMutation.mutate()}
                    disabled={cancelFriendRequestMutation.isPending}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Cancelar Solicitação
                  </Button>
                ) : (
                  <Dialog open={friendRequestOpen} onOpenChange={setFriendRequestOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar Amigo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enviar Solicitação de Amizade</DialogTitle>
                      </DialogHeader>
                      <Form {...friendRequestForm}>
                        <form onSubmit={friendRequestForm.handleSubmit(onSubmitFriendRequest)} className="space-y-4">
                          <FormField
                            control={friendRequestForm.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mensagem (opcional)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Escreva uma mensagem..." />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={sendFriendRequestMutation.isPending}>
                            Enviar Solicitação
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
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
