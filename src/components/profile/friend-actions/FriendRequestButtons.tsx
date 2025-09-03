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
}

const FriendRequestButtons = ({
  profileId,
  isFriend,
  firstName,
  lastName,
  imageUrl,
}: FriendRequestButtonsProps) => {
  const queryClient = useQueryClient();
  const { addChat } = useChatStore();

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

  return null;
};

export default FriendRequestButtons;
