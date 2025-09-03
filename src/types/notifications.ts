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
  1: NotificationType.Message,
  2: NotificationType.FriendRequest,
  3: NotificationType.NewFollower,
  4: NotificationType.Comment,
  5: NotificationType.Reaction,
};