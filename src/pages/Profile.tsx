import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/api";
import { Gender, FollowUser } from "@/types/api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const currentUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const isOwnProfile = currentUserId === id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => SocialService.viewProfile(id!),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch profile:', error);
        toast.error("Falha ao carregar perfil. Tente novamente mais tarde.");
      }
    }
  });

  const { data: followers, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ['followers', id],
    queryFn: () => SocialService.getFollowers(id!),
    enabled: showFollowers,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch followers:', error);
        toast.error("Falha ao carregar seguidores. Tente novamente mais tarde.");
      }
    }
  });

  const { data: following, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ['following', id],
    queryFn: () => SocialService.getFollowing(id!),
    enabled: showFollowing,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch following:', error);
        toast.error("Falha ao carregar seguindo. Tente novamente mais tarde.");
      }
    }
  });

  const { data: currentUserFollowData } = useQuery({
    queryKey: ['currentUserFollowData', currentUserId],
    queryFn: () => SocialService.getCurrentUserFollowData(currentUserId!),
    enabled: !!currentUserId && !isOwnProfile,
  });

  const isFollowing = currentUserFollowData?.following?.some(f => f.profileId === id);

  const followMutation = useMutation({
    mutationFn: () => SocialService.followUser(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserFollowData'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Usuário seguido com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao seguir usuário. Tente novamente.');
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: () => SocialService.unfollowUser(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserFollowData'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Deixou de seguir o usuário.');
    },
    onError: () => {
      toast.error('Erro ao deixar de seguir usuário. Tente novamente.');
    }
  });

  const handleFollowAction = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!profile) {
    return <div>Perfil não encontrado</div>;
  }

  const FollowList = ({ users, isLoading, title }: { users?: FollowUser[], isLoading: boolean, title: string }) => {
    if (isLoading) return <div>Carregando...</div>;
    if (!users) return null;

    return (
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.profileId}
            className="flex items-center space-x-4 p-2 hover:bg-secondary/50 rounded-lg cursor-pointer"
            onClick={() => navigate(`/profile/${user.profileId}`)}
          >
            <img
              src={user.imageUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="font-medium">
              {user.firstName} {user.lastName}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <img
            src={profile.imageUrl}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
              </h1>
              {!isOwnProfile && (
                <Button
                  onClick={handleFollowAction}
                  variant={isFollowing ? "destructive" : "default"}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                  {isFollowing ? "Deixar de Seguir" : "Seguir"}
                </Button>
              )}
            </div>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex space-x-6 mt-4">
              <button
                onClick={() => setShowFollowers(true)}
                className="hover:text-primary transition-colors"
              >
                <span className="font-bold">{profile.followers}</span>{" "}
                <span className="text-muted-foreground">seguidores</span>
              </button>
              <button
                onClick={() => setShowFollowing(true)}
                className="hover:text-primary transition-colors"
              >
                <span className="font-bold">{profile.following}</span>{" "}
                <span className="text-muted-foreground">seguindo</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Sobre</h2>
            <p>{profile.bio}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold mb-2">Informações Pessoais</h2>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">Gênero:</span>{" "}
                  {profile.gender === Gender.Male ? "Masculino" : "Feminino"}
                </li>
                <li>
                  <span className="text-muted-foreground">Data de Nascimento:</span>{" "}
                  {format(new Date(profile.birthDate), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-2">Localização</h2>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">Cidade:</span>{" "}
                  {profile.city}
                </li>
                <li>
                  <span className="text-muted-foreground">Estado:</span>{" "}
                  {profile.state}
                </li>
                <li>
                  <span className="text-muted-foreground">País:</span>{" "}
                  {profile.country}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seguidores</DialogTitle>
          </DialogHeader>
          <FollowList
            users={followers}
            isLoading={isLoadingFollowers}
            title="Seguidores"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seguindo</DialogTitle>
          </DialogHeader>
          <FollowList
            users={following}
            isLoading={isLoadingFollowing}
            title="Seguindo"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;