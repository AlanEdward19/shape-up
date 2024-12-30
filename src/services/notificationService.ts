import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { SERVICES } from "@/config/services";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { Notification } from "@/types/notifications";
import { getUserId } from "@/utils/auth";

class NotificationService {
  private connection: HubConnection | null = null;

  async startConnection(): Promise<void> {
    try {
      const userId = getUserId();
      
      if (!userId) {
        throw new Error("No user ID found");
      }

      this.connection = new HubConnectionBuilder()
        .withUrl(`${SERVICES.NOTIFICATION.baseUrl}${SERVICES.NOTIFICATION.hubUrl}?userId=${userId}`)
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

  private setupNotificationHandlers(): void {
    if (!this.connection) return;

    this.connection.on("ReceiveNotification", (notification: Notification) => {
      const { addNotification } = useNotificationStore.getState();
      addNotification(notification);
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