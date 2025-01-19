export const SERVICES = {
  SOCIAL: {
    baseUrl: import.meta.env.VITE_SOCIAL_API_BASE_URL,
    endpoints: {
      viewProfile: '/Profile/v1/ViewProfile/id',
      viewProfileSimplified: '/Profile/v1/viewProfile/id/simplified',
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
      getLatestFollower: '/Follow/v1/GetLatestFollower',
      getLatestComment: '/Post/v1/GetLatestComment',
      getPost: '/Post/v1/id',
      getProfilePosts: '/Profile/v1/id/getPosts?Page={page}',
    }
  },
  CHAT: {
    baseUrl: import.meta.env.VITE_CHAT_API_BASE_URL,
    endpoints: {
      getRecentMessages: '/Chat/v1/messages/getRecentMessages',
      sendMessage: '/Chat/v1/messages/send'
    }
  },
  NOTIFICATION: {
    baseUrl: import.meta.env.VITE_NOTIFICATION_API_BASE_URL,
    hubUrl: '/notifications'
  },
  AUTH: {
    baseUrl: import.meta.env.VITE_AUTH_API_BASE_URL,
    endpoints: {
      login: '/Auth/v1/Login',
      register: '/Auth/v1/Register',
      refreshToken: '/Auth/v1/RefreshToken',
      forgotPassword: '/Auth/v1/ForgotPassword',
      resetPassword: '/Auth/v1/ResetPassword',
      validateResetToken: '/Auth/v1/ValidateResetToken',
    }
  }
};

export const STORAGE = {
  baseUrl: import.meta.env.VITE_STORAGE_URL,
};