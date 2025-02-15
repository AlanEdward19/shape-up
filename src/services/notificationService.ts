
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { SERVICES } from "@/config/services";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { Notification, NotificationType } from "@/types/notifications";
import { getAuthToken, getUserId } from "@/utils/auth";
import { SocialService } from "./api";

class NotificationService {
  private connection: HubConnection | null = null;

  async startConnection(): Promise<void> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      this.connection = new HubConnectionBuilder()
        .withUrl(`${SERVICES.NOTIFICATION.baseUrl}${SERVICES.NOTIFICATION.hubUrl}?userId=${getUserId()}`, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      await this.connection.start();
      console.log("SignalR Connected");

      this.setupNotificationHandlers();
    } catch (error) {
      console.error("SignalR Connection Error:", error);
      throw error;
    }
  }

  private async handleNotification(type: string, message: string): Promise<void> {
    console.log("Received notification:", type);
    const { addNotification } = useNotificationStore.getState();
    let notification: Notification | null = null;

    try {

      switch (type) {
        case NotificationType.Message:
          notification = {
            id: crypto.randomUUID(),
            type: NotificationType.Message,
            message: message,
            createdAt: new Date().toISOString(),
            read: false
          };
          break;

        case NotificationType.NewFollower:
          notification = {
            id: crypto.randomUUID(),
            type: NotificationType.NewFollower,
            message: message,
            createdAt: new Date().toISOString(),
            read: false
          };
          break;

        case NotificationType.FriendRequest:
          notification = {
            id: crypto.randomUUID(),
            type: NotificationType.FriendRequest,
            message: message,
            createdAt: new Date().toISOString(),
            read: false
          };
          break;

        case NotificationType.Comment:
          notification = {
            id: crypto.randomUUID(),
            type: NotificationType.Comment,
            message: message,
            createdAt: new Date().toISOString(),
            read: false
          };
          break;

          case NotificationType.Reaction:
          notification = {
            id: crypto.randomUUID(),
            type: NotificationType.Reaction,
            message: message,
            createdAt: new Date().toISOString(),
            read: false
          };
          break;

        default:
          console.warn(`Unhandled notification type: ${type}`);
          return;
      }

      if (notification) {
        console.log("Adding notification:", notification);
        addNotification(notification);
      }
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  }

  private setupNotificationHandlers(): void {
    if (!this.connection) return;

    this.connection.on("ReceiveNotification", (content: string) => {

      const typeMatch = content.match(/Topic:\s*(.*)/);
  const messageMatch = content.match(/Message:\s*(.*)/);

  const type = typeMatch ? typeMatch[1].trim() : '';
  const message = messageMatch ? messageMatch[1].trim() : '';

  this.handleNotification(type, message);
    });
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      console.log("SignalR Disconnected");
    }
  }
}

export const notificationService = new NotificationService();
