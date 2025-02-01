import { Button } from "@/components/ui/button";
import { UserMinus, UserPlus, UserX } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/api";
import { toast } from "sonner";

interface FriendRequestForm {
  message: string;
}

interface FriendRequestButtonsProps {
  profileId: string;
  isFriend: boolean;
  hasSentRequest: boolean;
  onOpenChat: (profileId: string) => void;
}

const FriendRequestButtons = ({ 
  profileId, 
  isFriend, 
  hasSentRequest,
  onOpenChat 
}: FriendRequestButtonsProps) => {
  const [friendRequestOpen, setFriendRequestOpen] = useState(false);
  const queryClient = useQueryClient();

  const friendRequestForm = useForm<FriendRequestForm>({
    defaultValues: {
      message: "",
    },
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: (data: FriendRequestForm) => 
      SocialService.sendFriendRequest(profileId, data.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success("Solicitação de amizade enviada!");
      setFriendRequestOpen(false);
    },
    onError: () => {
      toast.error("Erro ao enviar solicitação de amizade");
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: () => SocialService.removeFriend(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success("Amizade removida com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover amizade");
    },
  });

  const cancelFriendRequestMutation = useMutation({
    mutationFn: () => SocialService.removeFriendRequest(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success("Solicitação de amizade cancelada!");
    },
    onError: () => {
      toast.error("Erro ao cancelar solicitação de amizade");
    },
  });

  const onSubmitFriendRequest = (data: FriendRequestForm) => {
    sendFriendRequestMutation.mutate(data);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        disabled={!isFriend}
        onClick={() => onOpenChat(profileId)}
      >
        Mensagem
      </Button>

      {isFriend ? (
        <Button
          variant="destructive"
          onClick={() => removeFriendMutation.mutate()}
          disabled={removeFriendMutation.isPending}
        >
          <UserMinus className="w-4 h-4 mr-2" />
          Desfazer Amizade
        </Button>
      ) : hasSentRequest ? (
        <Button
          variant="destructive"
          onClick={() => cancelFriendRequestMutation.mutate()}
          disabled={cancelFriendRequestMutation.isPending}
        >
          <UserX className="w-4 h-4 mr-2" />
          Cancelar Solicitação
        </Button>
      ) : (
        <Dialog open={friendRequestOpen} onOpenChange={setFriendRequestOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Amigo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Solicitação de Amizade</DialogTitle>
            </DialogHeader>
            <Form {...friendRequestForm}>
              <form onSubmit={friendRequestForm.handleSubmit(onSubmitFriendRequest)} className="space-y-4">
                <FormField
                  control={friendRequestForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem (opcional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Escreva uma mensagem..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={sendFriendRequestMutation.isPending}>
                  Enviar Solicitação
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FriendRequestButtons;