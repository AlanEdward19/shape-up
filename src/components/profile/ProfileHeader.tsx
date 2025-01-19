import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ViewProfileResponse } from "@/types/api";

interface ProfileHeaderProps {
  profile: ViewProfileResponse;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollowAction: () => void;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  followActionPending: boolean;
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
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
      <Avatar className="w-32 h-32 md:w-40 md:h-40">
        <AvatarImage src={profile.imageUrl} alt={`${profile.firstName} ${profile.lastName}`} />
        <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h1 className="text-2xl font-bold">
            {profile.firstName} {profile.lastName}
          </h1>
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