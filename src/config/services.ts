export const SERVICES = {
  SOCIAL: {
    baseUrl: import.meta.env.VITE_SOCIAL_API_BASE_URL,
    endpoints: {
      uploadProfilePicture: 'v1/Profile/uploadProfilePicture',
      sendFriendRequest: 'v1/Friend/sendFriendRequest',
      listFriends: 'v1/Friend/listFriends/id?page=pageNumber&rows=rowsNumber',
      removeFriendRequest: 'v1/Friend/removeFriendRequest/id',
      removeFriend: 'v1/Friend/removeFriend/id',
      manageFriendRequests: 'v1/Friend/manageFriendRequests',
      checkRequestStatus: 'v1/Friend/checkRequestStatus',
      editProfile: 'v1/Profile/EditProfile',
      viewProfile: 'v1/Profile/ViewProfile/id',
      viewProfileSimplified: 'v1/Profile/viewProfile/id/simplified',
      activityFeed: 'v1/ActivityFeed/BuildActivityFeed',
      friendRecommendations: 'v1/Recommendation/FriendRecommendations',
      createPost: 'v1/Post/CreatePost',
      uploadPostImages: 'v1/Post/id/UploadPostImages',
      followUser: 'v1/Follow/FollowUser/id',
      unfollowUser: 'v1/Follow/UnfollowUser/id',
      getFollowers: 'v1/Follow/GetFollowers/id?Page={page}&Rows={rows}',
      getFollowing: 'v1/Follow/GetFollowing/id?Page={page}&Rows={rows}',
      getPostReactions: 'v1/Post/id/getReactions',
      reactToPost: 'v1/Post/id/react',
      deleteReaction: 'v1/Post/id/deleteReaction',
      getComments: 'v1/Post/id/getComments',
      commentOnPost: 'v1/Post/id/commentOnPost',
      deleteComment: 'v1/Post/id/deleteComment',
      editComment: 'v1/Post/id/editComment',
      getPost: 'v1/Post/id',
      getProfilePosts: 'v1/Profile/id/getPosts?Page={page}',
      searchProfileByName: 'v1/Profile/searchProfileByName?Name={name}'
    }
  },
  CHAT: {
    baseUrl: import.meta.env.VITE_CHAT_API_BASE_URL,
    endpoints: {
      getRecentMessages: 'v1/Chat/messages/getRecentMessages',
      getMessages: 'v1/Chat/messages/getMessages/id',
      sendMessage: 'v1/Chat/messages/send'
    }
  },
  NOTIFICATION: {
    baseUrl: import.meta.env.VITE_NOTIFICATION_API_BASE_URL,
    hubUrl: 'notifications'
  },
  AUTH:{
    baseUrl: import.meta.env.VITE_AUTH_API_BASE_URL,
    endpoints: {
      enhanceToken: 'v1/Authentication/enhanceToken'
    }
  }
};

export const STORAGE = {
  baseUrl: import.meta.env.VITE_STORAGE_URL,
};