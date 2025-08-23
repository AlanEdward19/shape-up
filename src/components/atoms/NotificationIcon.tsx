import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationType } from "@/types/notifications";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SocialService } from "@/services/socialService.ts";
import { toast } from "sonner";

const NotificationIcon = () => {
  const { notifications, unreadNotifications, markAsRead } = useNotificationStore();
  const queryClient = useQueryClient();

  const generalNotifications = notifications.filter(
    (n) => n.type !== NotificationType.Message
  );

  const manageFriendRequestMutation = useMutation({
    mutationFn: async ({ profileId, accept }: { profileId: string; accept: boolean }) => {
      await SocialService.manageFriendRequest(profileId, accept);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success("Solicitação de amizade atualizada!");
    },
    onError: () => {
      toast.error("Erro ao processar solicitação de amizade");
    },
  });

  const handleFriendRequest = (profileId: string, accept: boolean) => {
    manageFriendRequestMutation.mutate({ profileId, accept });
    markAsRead(profileId);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6 text-primary" />
          {unreadNotifications > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadNotifications}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 bg-secondary border-muted shadow-lg"
        align="center"
        side="right"
        sideOffset={24}
        style={{ zIndex: 1000 }}
      >
        <div className="space-y-2">
          <div className="font-semibold text-center">Notificações</div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {generalNotifications.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  Nenhuma notificação
                </div>
              ) : (
                generalNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      !notification.read
                        ? "bg-primary/10 hover:bg-primary/20"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <p className="text-sm">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.createdAt), "PP")}
                    </span>
                    {notification.type === NotificationType.FriendRequest && notification.data?.senderId && !notification.read && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleFriendRequest(notification.data!.senderId!, true)}
                          disabled={manageFriendRequestMutation.isPending}
                        >
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFriendRequest(notification.data!.senderId!, false)}
                          disabled={manageFriendRequestMutation.isPending}
                        >
                          Recusar
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationIcon;
