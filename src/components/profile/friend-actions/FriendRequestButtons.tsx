
import { Button } from "@/components/ui/button";
import { SocialService } from "@/services/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChatStore } from "@/components/organisms/Chat";

interface FriendRequestButtonsProps {
  profileId: string;
  isFriend: boolean;
  hasSentRequest: boolean;
  hasReceivedRequest: boolean;
}

const FriendRequestButtons = ({
  profileId,
  isFriend,
  hasSentRequest,
  hasReceivedRequest,
}: FriendRequestButtonsProps) => {
  const queryClient = useQueryClient();
  const { openChatWithUser } = useChatStore();

  const sendRequestMutation = useMutation({
    mutationFn: () => SocialService.sendFriendRequest(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Solicitação de amizade enviada!");
    },
    onError: () => {
      toast.error("Erro ao enviar solicitação de amizade");
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: () => SocialService.acceptFriendRequest(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Solicitação de amizade aceita!");
    },
    onError: () => {
      toast.error("Erro ao aceitar solicitação de amizade");
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: () => SocialService.rejectFriendRequest(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Solicitação de amizade rejeitada!");
    },
    onError: () => {
      toast.error("Erro ao rejeitar solicitação de amizade");
    },
  });

  const unfriendMutation = useMutation({
    mutationFn: () => SocialService.unfriend(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Amizade desfeita!");
    },
    onError: () => {
      toast.error("Erro ao desfazer amizade");
    },
  });

  const handleChatClick = () => {
    openChatWithUser(profileId);
  };

  if (isFriend) {
    return (
      <>
        <Button variant="secondary" onClick={handleChatClick}>
          Mensagem
        </Button>
        <Button
          variant="destructive"
          onClick={() => unfriendMutation.mutate()}
          disabled={unfriendMutation.isPending}
        >
          Desfazer Amizade
        </Button>
      </>
    );
  }

  if (hasReceivedRequest) {
    return (
      <>
        <Button
          onClick={() => acceptRequestMutation.mutate()}
          disabled={acceptRequestMutation.isPending}
        >
          Aceitar
        </Button>
        <Button
          variant="destructive"
          onClick={() => rejectRequestMutation.mutate()}
          disabled={rejectRequestMutation.isPending}
        >
          Rejeitar
        </Button>
      </>
    );
  }

  if (hasSentRequest) {
    return (
      <Button disabled variant="secondary">
        Solicitação Enviada
      </Button>
    );
  }

  return (
    <Button
      onClick={() => sendRequestMutation.mutate()}
      disabled={sendRequestMutation.isPending}
    >
      Adicionar Amigo
    </Button>
  );
};

export default FriendRequestButtons;
