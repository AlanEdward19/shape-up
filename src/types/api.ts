export enum Visibility {
  Public = 0,
  FriendsOnly = 1,
  Private = 3
}

export interface Post {
  updatedAt: string;
  images: string[];
  content: string;
  visibility: Visibility;
}

export interface ActivityFeedResponse {
  posts: Post[];
}