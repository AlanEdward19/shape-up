export enum NotificationType {
  Message = "Message",
  FriendRequest = "FriendRequest",
  NewFollower = "NewFollower",
  Comment = "Comment",
  Reaction = "Reaction",
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
  data?: {
    senderId?: string;
    postId?: string;
    commentId?: string;
  };
}

export const topicToNotificationType: Record<number, NotificationType> = {
  0: NotificationType.Message,
  1: NotificationType.FriendRequest,
  2: NotificationType.Reaction,
  3: NotificationType.NewFollower,
  4: NotificationType.Comment,
};