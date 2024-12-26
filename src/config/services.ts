import { create } from "domain";

export const SERVICES = {
  SOCIAL: {
    baseUrl: import.meta.env.VITE_SOCIAL_API_BASE_URL,
    endpoints: {
      viewProfile: '/Profile/v1/ViewProfile/id',
      activityFeed: '/ActivityFeed/v1/BuildActivityFeed',
      friendRecommendations: '/Recommendation/v1/FriendRecommendations',
      createPost: '/Post/v1/CreatePost',
      uploadPostImages: '/Post/v1/id/UploadPostImages',
      getFollowers: '/Follow/v1/GetFollowers/id?Page={page}&Rows={rows}',
      getFollowing: '/Follow/v1/GetFollowing/id?Page={page}&Rows={rows}',
    }
  },
  NUTRITION: {
    baseUrl: 'https://api.nutrition.example.com/v1'
  },
  TRAINING: {
    baseUrl: 'https://api.training.example.com/v1'
  }
};

export const STORAGE = {
  AZURE_BLOB: 'https://your-storage-account.blob.core.windows.net'
};