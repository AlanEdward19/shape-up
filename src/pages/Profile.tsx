import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/socialService.ts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfilePosts from "@/components/profile/ProfilePosts";
import FollowList from "@/components/profile/FollowList";
import Sidebar from "@/components/organisms/Sidebar.tsx";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSidebar from "@/components/organisms/MobileSidebar";

const Profile = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const currentUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const isOwnProfile = currentUserId === id;

  const [followersPage, setFollowersPage] = useState(1);
  const [followersPerPage, setFollowersPerPage] = useState(10);
  const [followingPage, setFollowingPage] = useState(1);
  const [followingPerPage, setFollowingPerPage] = useState(10);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
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
    queryKey: ['followers', id, followersPage, followersPerPage],
    queryFn: () => SocialService.getFollowers(id!, followersPage, Number(followersPerPage)),
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
    queryFn: () => SocialService.getFollowing(id!, followingPage, followingPerPage),
    enabled: showFollowing,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch following:', error);
        toast.error("Falha ao carregar seguindo. Tente novamente mais tarde.");
      }
    }
  });

  const { data: followData } = useQuery({
    queryKey: ['followData', id],
    queryFn: async () => {
      const [following, friendRequests] = await Promise.all([
        SocialService.getFollowing(id!),
        SocialService.checkFriendRequestStatus()
      ]);
      return {
        following,
        friendRequests
      };
    },
    enabled: !!currentUserId && !isOwnProfile,
  });

  const hasReceivedRequest = followData?.friendRequests?.some(
    request => request.profileId === id && request.status === 1
  );

  const followMutation = useMutation({
    mutationFn: () => SocialService.followUser(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followData'] });
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
      queryClient.invalidateQueries({ queryKey: ['followData'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Deixou de seguir o usuário.');
    },
    onError: () => {
      toast.error('Erro ao deixar de seguir usuário. Tente novamente.');
    }
  });

  const handleFollowAction = () => {
    if (profile.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleFollowersPageChange = (page: number) => {
    setFollowersPage(page);
  };

  const handleFollowersRowsChange = (rows: number) => {
    setFollowersPerPage(rows);
    setFollowersPage(1);
  };

  const handleFollowingPageChange = (page: number) => {
    setFollowingPage(page);
  };

  const handleFollowingRowsChange = (rows: number) => {
    setFollowingPerPage(rows);
    setFollowingPage(1);
  };

  const isMobile = useIsMobile();

  if (isLoadingProfile) {
    if (isMobile) {
      return (
        <div className="flex flex-col min-h-screen w-full bg-[#161b28] text-[#e8ecf8] relative">
          <div className="flex-1 p-4">Carregando...</div>
          <div className="fixed bottom-0 left-0 w-full h-14 bg-[#222737] border-t border-[#161b28] z-50">
            <MobileSidebar />
          </div>
        </div>
      );
    }
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
    if (isMobile) {
      return (
        <div className="flex flex-col min-h-screen w-full bg-[#161b28] text-[#e8ecf8] relative">
          <div className="flex-1 p-4">Perfil não encontrado</div>
          <div className="fixed bottom-0 left-0 w-full h-14 bg-[#222737] border-t border-[#161b28] z-50">
            <MobileSidebar />
          </div>
        </div>
      );
    }
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-20">
          <div>Perfil não encontrado</div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-[#161b28] text-[#e8ecf8] relative">
        <div className="flex-1 p-4 pb-20">
          <Card className="mb-6">
            <CardHeader>
              <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                onFollowAction={handleFollowAction}
                onShowFollowers={() => setShowFollowers(true)}
                onShowFollowing={() => setShowFollowing(true)}
                followActionPending={followMutation.isPending || unfollowMutation.isPending}
              />
            </CardHeader>
            <CardContent>
              <ProfileInfo
                profile={profile}
                hasReceivedRequest={hasReceivedRequest}
              />
            </CardContent>
          </Card>
          <ProfilePosts profileId={id!} />
          <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seguidores</DialogTitle>
              </DialogHeader>
              <FollowList
                users={followers ?? []}
                isLoading={isLoadingFollowers}
                title="Seguidores"
                currentPage={followersPage}
                onPageChange={handleFollowersPageChange}
                onRowsChange={handleFollowersRowsChange}
                totalUsers={followers?.length ?? 0}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seguindo</DialogTitle>
              </DialogHeader>
              <FollowList
                users={following ?? []}
                isLoading={isLoadingFollowing}
                title="Seguindo"
                currentPage={followingPage}
                onPageChange={handleFollowingPageChange}
                onRowsChange={handleFollowingRowsChange}
                totalUsers={following?.length ?? 0}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="fixed bottom-0 left-0 w-full h-14 bg-[#222737] border-t border-[#161b28] z-50">
          <MobileSidebar />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full text-[#e8ecf8]" style={{
      background: "radial-gradient(1200px 600px at 10% -10%, #1b2437 0, transparent 60%), #0f1420"
    }}>
      <Sidebar />
      <div className="flex-1 ml-20">
        <div className="container mx-auto p-6">
          <Card className="mb-6">
            <CardHeader>
              <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                onFollowAction={handleFollowAction}
                onShowFollowers={() => setShowFollowers(true)}
                onShowFollowing={() => setShowFollowing(true)}
                followActionPending={followMutation.isPending || unfollowMutation.isPending}
              />
            </CardHeader>
            <CardContent>
              <ProfileInfo 
                profile={profile}
                hasReceivedRequest={hasReceivedRequest}
              />
            </CardContent>
          </Card>

          <ProfilePosts profileId={id!} />

          <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seguidores</DialogTitle>
              </DialogHeader>
              <FollowList
                users={followers ?? []}
                isLoading={isLoadingFollowers}
                title="Seguidores"
                currentPage={followersPage}
                onPageChange={handleFollowersPageChange}
                onRowsChange={handleFollowersRowsChange}
                totalUsers={followers?.length ?? 0}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seguindo</DialogTitle>
              </DialogHeader>
              <FollowList
                users={following ?? []}
                isLoading={isLoadingFollowing}
                title="Seguindo"
                currentPage={followingPage}
                onPageChange={handleFollowingPageChange}
                onRowsChange={handleFollowingRowsChange}
                totalUsers={following?.length ?? 0}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Profile;
