import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/socialService.ts";
import { toast } from "sonner";

interface FriendRequestButtonsProps {
  profileId: string;
  isFriend: boolean;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  hasSentRequest?: boolean;
  hasReceivedRequest?: boolean;
}

const FriendRequestButtons = ({
  profileId,
  isFriend,
  firstName,
  lastName,
  imageUrl,
  hasSentRequest = false,
  hasReceivedRequest = false,
}: FriendRequestButtonsProps) => {
  const queryClient = useQueryClient();
  const { addChat } = useChatStore();

  const unfriendMutation = useMutation({
    mutationFn: () => SocialService.unfriend(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Amizade desfeita!");
    },
    onError: () => {
      toast.error("Erro ao desfazer amizade");
    },
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: () => SocialService.sendFriendRequest(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Solicitação de amizade enviada!");
    },
    onError: () => {
      toast.error("Erro ao enviar solicitação de amizade");
    },
  });

  const handleChatClick = () => {
    addChat({
      profileId,
      firstName,
      lastName,
      imageUrl,
      isProfessionalChat: false,
    });
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

  // Show add friend button if not friends, no request sent, and no request received
  if (hasSentRequest) {
    return (
      <Button variant="outline" disabled>
        Solicitação enviada
      </Button>
    );
  }

  if (hasReceivedRequest) {
    return null;
  }

  return (
    <Button
      variant="default"
      onClick={() => sendFriendRequestMutation.mutate()}
      disabled={sendFriendRequestMutation.isPending}
    >
      Adicionar amigo
    </Button>
  );
};

export default FriendRequestButtons;
