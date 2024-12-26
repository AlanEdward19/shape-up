export const SERVICES = {
  SOCIAL: {
    baseUrl: import.meta.env.VITE_SOCIAL_API_BASE_URL,
    endpoints: {
      viewProfile: '/Profile/v1/ViewProfile/id',
      activityFeed: '/ActivityFeed/v1/BuildActivityFeed',
      friendRecommendations: '/Recommendation/v1/FriendRecommendations',
      createPost: '/Post/v1/CreatePost',
      uploadPostImages: '/Post/v1/id/UploadPostImages',
      followUser: '/Follow/v1/FollowUser/id',
      unfollowUser: '/Follow/v1/UnfollowUser/id',
      getFollowers: '/Follow/v1/GetFollowers/id?Page={page}&Rows={rows}',
      getFollowing: '/Follow/v1/GetFollowing/id?Page={page}&Rows={rows}',
      getPostReactions: '/Post/v1/id/getReactions',
      reactToPost: '/Post/v1/id/react',
      deleteReaction: '/Post/v1/id/deleteReaction',
      getComments: '/Post/v1/id/getComments',
      commentOnPost: '/Post/v1/id/commentOnPost',
      deleteComment: '/Post/v1/id/deleteComment',
      editComment: '/Post/v1/id/editComment',
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