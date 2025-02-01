export interface ViewProfileResponse {
  id: string;
  name: string;
  bio?: string;
  country: string;
  city: string;
  state: string;
  birthDate?: string;
  gender: Gender;
  followers: number;
  following: number;
}

export enum Gender {
  Male = "male",
  Female = "female",
}

export interface FriendRequestStatus {
  profileId: string;
  status: number;
}

export interface FollowUser {
  profileId: string;
  name: string;
  avatarUrl?: string;
}
