import { create } from 'zustand';
import { Notification, NotificationType } from '@/types/notifications';

interface NotificationStore {
  notifications: Notification[];
  unreadMessages: number;
  unreadNotifications: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (type?: NotificationType) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadMessages: 0,
  unreadNotifications: 0,
  addNotification: (notification) => {
    set((state) => {
      const newNotifications = [...state.notifications, notification];
      const unreadMessages = newNotifications.filter(
        n => !n.read && n.type === NotificationType.Message
      ).length;
      const unreadNotifications = newNotifications.filter(
        n => !n.read && n.type !== NotificationType.Message
      ).length;
      
      return {
        notifications: newNotifications,
        unreadMessages,
        unreadNotifications,
      };
    });
  },
  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadMessages = notifications.filter(
        n => !n.read && n.type === NotificationType.Message
      ).length;
      const unreadNotifications = notifications.filter(
        n => !n.read && n.type !== NotificationType.Message
      ).length;
      
      return {
        notifications,
        unreadMessages,
        unreadNotifications,
      };
    });
  },
  markAllAsRead: (type) => {
    set((state) => {
      const notifications = state.notifications.map(n =>
        type ? (n.type === type ? { ...n, read: true } : n) : { ...n, read: true }
      );
      const unreadMessages = notifications.filter(
        n => !n.read && n.type === NotificationType.Message
      ).length;
      const unreadNotifications = notifications.filter(
        n => !n.read && n.type !== NotificationType.Message
      ).length;
      
      return {
        notifications,
        unreadMessages,
        unreadNotifications,
      };
    });
  },
}));