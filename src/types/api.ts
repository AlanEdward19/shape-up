export enum Visibility {
  Public = 0,
  FriendsOnly = 1,
  Private = 2
}

export enum Gender {
  Male = 0,
  Female = 1
}

export interface Post {
  id: string;
  publisherId: string;
  publisherFirstName: string;
  publisherLastName: string;
  publisherImageUrl: string;
  visibility: Visibility;
  images: string[];
  content: string;
}

export interface ActivityFeedResponse {
  posts: Post[];
}

export interface PostReaction {
  profileId: string;
  createdAt: string;
  reactionType: string;
  postId: string;
  id: string;
}

export interface PostComment {
  profileId: string;
  postId: string;
  createdAt: string;
  content: string;
  id: string;
}
