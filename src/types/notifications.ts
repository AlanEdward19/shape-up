export enum NotificationType {
  Message = "Message",
  FriendRequest = "FriendRequest",
  NewFollower = "NewFollower",
  Comment = "Comment"
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