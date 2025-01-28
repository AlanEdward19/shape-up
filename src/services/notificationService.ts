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

  private async handleNotification(type: string): Promise<void> {
    console.log("Received notification:", type);
    const { addNotification } = useNotificationStore.getState();
    let notification: Notification | null = null;

    try {
      switch (type) {
        case NotificationType.Message:
          notification = {
            id: crypto.randomUUID(),
            type: NotificationType.Message,
            message: "Nova mensagem recebida",
            createdAt: new Date().toISOString(),
            read: false
          };
          break;

        case NotificationType.NewFollower:
          const followerData = await SocialService.getLatestFollower();
          notification = {
            id: crypto.randomUUID(),
            type: NotificationType.NewFollower,
            message: `${followerData.firstName} ${followerData.lastName} começou a te seguir`,
            createdAt: new Date().toISOString(),
            read: false,
            data: {
              senderId: followerData.profileId
            }
          };
          break;

        case NotificationType.Comment:
          const commentData = await SocialService.getLatestComment();
          notification = {
            id: crypto.randomUUID(),
            type: NotificationType.Comment,
            message: `${commentData.profileFirstName} comentou em seu post`,
            createdAt: new Date().toISOString(),
            read: false,
            data: {
              senderId: commentData.profileId,
              postId: commentData.postId,
              commentId: commentData.id
            }
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

    this.connection.on("ReceiveNotification", (type: string) => {
      this.handleNotification(type);
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