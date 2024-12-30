import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { SERVICES } from "@/config/services";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { Notification, NotificationType } from "@/types/notifications";
import { getAuthToken } from "@/utils/auth";
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
        .withUrl(`${SERVICES.NOTIFICATION.baseUrl}${SERVICES.NOTIFICATION.hubUrl}`, {
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
    const { addNotification } = useNotificationStore.getState();
    let notification: Notification;

    switch (type) {
      case NotificationType.Message:
        // Messages are handled separately in the chat
        const messageData = await fetch(`${SERVICES.CHAT.baseUrl}/messages/latest`).then(res => res.json());
        notification = {
          id: messageData.id,
          type: NotificationType.Message,
          message: `Nova mensagem de ${messageData.senderName}`,
          createdAt: new Date().toISOString(),
          read: false,
          data: {
            senderId: messageData.senderId
          }
        };
        break;

      case NotificationType.NewFollower:
        const followerData = await SocialService.getLatestFollower();
        notification = {
          id: followerData.profileId, // Fixed: using profileId instead of id
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
          id: commentData.id,
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

    addNotification(notification);
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