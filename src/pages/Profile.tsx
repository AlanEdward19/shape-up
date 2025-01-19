import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/api";
import { ProfileService } from "@/services/profileService";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfilePosts from "@/components/profile/ProfilePosts";
import FollowList from "@/components/profile/FollowList";
import Sidebar from "@/components/Sidebar";

const Profile = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const currentUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const isOwnProfile = currentUserId === id;

  const [followersPage, setFollowersPage] = useState(1);
  const [followersPerPage, setFollowersPerPage] = useState("10");
  const [followingPage, setFollowingPage] = useState(1);
  const [followingPerPage, setFollowingPerPage] = useState("10");

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => ProfileService.viewProfile(id!),
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch profile:', error);
        toast.error("Falha ao carregar perfil. Tente novamente mais tarde.");
      }
    }
  });

  const { data: followers, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ['followers', id, followersPage, followersPerPage],
    queryFn: () => ProfileService.getFollowers(id!, followersPage, Number(followersPerPage)),
    enabled: showFollowers,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch followers:', error);
        toast.error("Falha ao carregar seguidores. Tente novamente mais tarde.");
      }
    }
  });

  const { data: following, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ['following', id, followingPage, followingPerPage],
    queryFn: () => SocialService.getFollowing(id!, followingPage, Number(followingPerPage)),
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

  const handleFollowersPageChange = (page: number) => {
    setFollowersPage(page);
  };

  const handleFollowersRowsChange = (rows: string) => {
    setFollowersPerPage(rows);
    setFollowersPage(1);
  };

  const handleFollowingPageChange = (page: number) => {
    setFollowingPage(page);
  };

  const handleFollowingRowsChange = (rows: string) => {
    setFollowingPerPage(rows);
    setFollowingPage(1);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-20">
          <div>Carregando...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-20">
          <div>Perfil não encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-20">
        <div className="container mx-auto p-6">
          <Card className="mb-6">
            <CardHeader>
              <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                isFollowing={isFollowing}
                onFollowAction={handleFollowAction}
                onShowFollowers={() => setShowFollowers(true)}
                onShowFollowing={() => setShowFollowing(true)}
                followActionPending={followMutation.isPending || unfollowMutation.isPending}
              />
            </CardHeader>
            <CardContent>
              <ProfileInfo profile={profile} />
            </CardContent>
          </Card>

          <ProfilePosts profileId={id!} />

          <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seguidores</DialogTitle>
              </DialogHeader>
              <FollowList
                users={followers}
                isLoading={isLoadingFollowers}
                title="Seguidores"
                currentPage={followersPage}
                onPageChange={handleFollowersPageChange}
                onRowsChange={handleFollowersRowsChange}
                totalUsers={profile.followers}
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
                currentPage={followingPage}
                onPageChange={handleFollowingPageChange}
                onRowsChange={handleFollowingRowsChange}
                totalUsers={profile.following}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Profile;
