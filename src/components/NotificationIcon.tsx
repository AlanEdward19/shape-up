import { Bell } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationType } from "@/types/notifications";
import { format } from "date-fns";

const NotificationIcon = () => {
  const { notifications, unreadNotifications, markAsRead } = useNotificationStore();

  const generalNotifications = notifications.filter(
    (n) => n.type !== NotificationType.Message
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6 text-primary" />
          {unreadNotifications > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadNotifications}
            </div>
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="end">
        <div className="space-y-2">
          <div className="font-semibold">Notificações</div>
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
                        ? "bg-primary/10"
                        : "bg-secondary"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <p className="text-sm">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.createdAt), "PP")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default NotificationIcon;