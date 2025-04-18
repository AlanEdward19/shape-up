
export interface FriendRequestStatus {
  profileId: string;
  status: number;
}

export interface FollowUser {
  profileId: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}

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
  createdAt: string;
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
  profileFirstName: string;
  profileLastName: string;
  profileImageUrl: string;
  postId: string;
  createdAt: string;
  content: string;
  id: string;
}

export interface ViewProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  country: string;
  birthDate: string;
  bio: string;
  gender: number;
  email: string;
  imageUrl: string;
  followers: number;
  following: number;
  posts: number;
}

export interface Friend {
  profileId: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}

export interface FriendRequest {
  profileId: string;
  status: number;
  message?: string;
}

export interface FriendRecommendation {
  profile: ViewProfileResponse;
  mutualFriends: number;
}

export interface FriendRecommendationsResponse {
  recommendations: FriendRecommendation[];
}

export interface ProfileSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}
