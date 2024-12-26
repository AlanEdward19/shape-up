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
    <div className="flex flex-row items-center gap-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src={profile.imageUrl} alt={`${profile.firstName} ${profile.lastName}`} />
        <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {profile.firstName} {profile.lastName}
          </h1>
          {!isOwnProfile && (
            <Button
              onClick={onFollowAction}
              variant={isFollowing ? "destructive" : "default"}
              disabled={followActionPending}
            >
              {isFollowing ? "Deixar de Seguir" : "Seguir"}
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">{profile.email}</p>
        <div className="flex space-x-6 mt-4">
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