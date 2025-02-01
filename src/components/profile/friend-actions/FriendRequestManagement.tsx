import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/api";
import { toast } from "sonner";

interface FriendRequestManagementProps {
  profileId: string;
  hasReceivedRequest: boolean;
}

const FriendRequestManagement = ({ 
  profileId,
  hasReceivedRequest 
}: FriendRequestManagementProps) => {
  const queryClient = useQueryClient();

  const manageFriendRequestMutation = useMutation({
    mutationFn: (accept: boolean) => SocialService.manageFriendRequest(profileId, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success("Solicitação de amizade atualizada!");
    },
    onError: () => {
      toast.error("Erro ao processar solicitação de amizade");
    },
  });

  if (!hasReceivedRequest) return null;

  return (
    <div className="mt-8 p-4 bg-secondary rounded-lg">
      <p className="text-sm text-muted-foreground mb-3">
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
  );
};

export default FriendRequestManagement;