import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { SocialService } from "@/services/api";
import { toast } from "sonner";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";

const Suggestions = () => {
  const navigate = useNavigate();
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['friendRecommendations'],
    queryFn: SocialService.getFriendRecommendations,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch recommendations:', error);
        toast.error("Falha ao carregar recomendações. Tente novamente mais tarde.");
      }
    }
  });

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-secondary rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Você talvez conheça</h2>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Você talvez conheça</h2>
      <div className="space-y-4">
        {recommendations?.map((recommendation) => (
          <div
            key={recommendation.profile.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
            onClick={() => handleProfileClick(recommendation.profile.id)}
          >
            <Avatar
              imageUrl={recommendation.profile.imageUrl}
              firstName={recommendation.profile.firstName}
              lastName={recommendation.profile.lastName}
              className="w-10 h-10"
            />
            <div className="flex-1">
              <h3 className="font-medium">
                {recommendation.profile.firstName} {recommendation.profile.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {recommendation.mutualFriends} amigos em comum
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;
