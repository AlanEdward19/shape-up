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
  updatedAt: string;
  images: string[];
  content: string;
  visibility: Visibility;
}

export interface ActivityFeedResponse {
  posts: Post[];
}

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  country: string;
  imageUrl: string;
  bio: string;
  birthDate: string;
  gender: Gender;
}

export interface FriendRecommendation {
  profile: Profile;
  mutualFriends: number;
}

export interface FriendRecommendationsResponse {
  recommendations: FriendRecommendation[];
}

export interface CreatePostResponse {
  id: string;
}