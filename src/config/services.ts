export const SERVICES = {
  SOCIAL: {
    baseUrl: import.meta.env.VITE_SOCIAL_API_URL,
    endpoints: {
      viewProfile: '/api/profiles/id',
      viewProfileSimplified: '/api/profiles/id/simplified',
      activityFeed: '/api/posts/feed',
      friendRecommendations: '/api/profiles/recommendations',
      createPost: '/api/posts',
      uploadPostImages: '/api/posts/id/images',
      followUser: '/api/profiles/id/follow',
      unfollowUser: '/api/profiles/id/unfollow',
      getFollowing: '/api/profiles/id/following?page={page}&rows={rows}',
      getFollowers: '/api/profiles/id/followers?page={page}&rows={rows}',
      getLatestFollower: '/api/profiles/followers/latest',
      getLatestComment: '/api/posts/comments/latest',
      getPostReactions: '/api/posts/id/reactions',
      reactToPost: '/api/posts/id/react',
      deleteReaction: '/api/posts/id/react',
      getComments: '/api/posts/id/comments',
      commentOnPost: '/api/posts/id/comments',
      deleteComment: '/api/posts/comments/id',
      editComment: '/api/posts/comments/id',
      getPost: '/api/posts/id',
      getProfilePosts: '/api/profiles/id/posts?page={page}&rows={rows}',
    }
  },
  AUTH: {
    baseUrl: import.meta.env.VITE_AUTH_API_URL,
    endpoints: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      refreshToken: '/api/auth/refresh-token',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      validateResetToken: '/api/auth/validate-reset-token',
    }
  }
};

export const STORAGE = {
  baseUrl: import.meta.env.VITE_STORAGE_URL,
};