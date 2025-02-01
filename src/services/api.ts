import { SERVICES, STORAGE } from '@/config/services';
import { Post, PostReaction, PostComment, ViewProfileResponse, Friend, FriendRequest, FollowUser } from '@/types/api';
import { getAuthToken } from '@/utils/auth';

export const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

export const getTimeDifference = (updatedAt: string): string => {
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffHours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return `${diffHours}h atrás`;
  }
  
  return updated.toLocaleDateString();
};

export const getImageUrl = (imageGuid: string): string => {
  return `${STORAGE.baseUrl}/images/${imageGuid}`;
};

export const SocialService = {
  viewProfile: async (id: string): Promise<ViewProfileResponse> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.viewProfile.replace('id', id)}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  editProfile: async (data: { gender?: number; birthDate?: string; bio?: string }): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.editProfile}`,
      {
        method: 'PATCH',
        headers: createHeaders(),
        body: JSON.stringify(data)
      }
    );
    if (!response.ok) throw new Error('Failed to edit profile');
  },

  getFollowers: async (userId: string): Promise<FollowUser[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.getFollowers.replace('id', userId).replace('{page}', '1').replace('{rows}', '10')}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch followers list');
    return response.json();
  },

  getFollowing: async (userId: string): Promise<FollowUser[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.getFollowing.replace('id', userId).replace('{page}', '1').replace('{rows}', '10')}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch following list');
    return response.json();
  },

  getCurrentUserFollowData: async (userId: string) => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}/Follow/v1/GetUserFollowData/${userId}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch user follow data');
    return response.json();
  },

  followUser: async (userId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.followUser.replace('id', userId)}`,
      {
        method: 'POST',
        headers: createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to follow user');
  },

  unfollowUser: async (userId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.unfollowUser.replace('id', userId)}`,
      {
        method: 'POST',
        headers: createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to unfollow user');
  },

  getPost: async (postId: string): Promise<Post> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.getPost.replace('id', postId)}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  getActivityFeed: async (): Promise<Post[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.activityFeed}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch activity feed');
    return response.json();
  },

  createPost: async (data: { content: string; visibility: number }): Promise<{ id: string }> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.createPost}`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  uploadPostImages: async (postId: string, formData: FormData): Promise<void> => {
    const headers = createHeaders();
    delete headers['Content-Type'];
    
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.uploadPostImages.replace('id', postId)}`,
      {
        method: 'PUT',
        headers: headers,
        body: formData,
      }
    );
    if (!response.ok) throw new Error('Failed to upload post images');
  },

  getPostReactions: async (postId: string): Promise<PostReaction[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.getPostReactions.replace('id', postId)}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch post reactions');
    return response.json();
  },

  reactToPost: async (postId: string, reactionType: number): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.reactToPost.replace('id', postId)}`,
      {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify({ reactionType })
      }
    );
    if (!response.ok) throw new Error('Failed to react to post');
  },

  deleteReaction: async (postId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.deleteReaction.replace('id', postId)}`,
      {
        method: 'DELETE',
        headers: createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to delete reaction');
  },

  getComments: async (postId: string): Promise<PostComment[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.getComments.replace('id', postId)}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  commentOnPost: async (postId: string, content: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.commentOnPost.replace('id', postId)}`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ content })
      }
    );
    if (!response.ok) throw new Error('Failed to comment on post');
  },

  deleteComment: async (commentId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.deleteComment.replace('id', commentId)}`,
      {
        method: 'DELETE',
        headers: createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to delete comment');
  },

  editComment: async (commentId: string, content: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.editComment.replace('id', commentId)}`,
      {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify({ content })
      }
    );
    if (!response.ok) throw new Error('Failed to edit comment');
  },

  getFriendRecommendations: async () => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.friendRecommendations}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch friend recommendations');
    return response.json();
  },

  sendFriendRequest: async (friendId: string, requestMessage?: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}/Friend/v1/sendFriendRequest`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ friendId, requestMessage })
      }
    );
    if (!response.ok) throw new Error('Failed to send friend request');
  },

  listFriends: async (profileId: string, page: number = 1, rows: number = 10): Promise<Friend[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.listFriends.replace('id', profileId).replace('pageNumber', page.toString()).replace('rowsNumber', rows.toString())}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to list friends');
    return response.json();
  },

  checkFriendRequestStatus: async (): Promise<FriendRequest[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.checkRequestStatus}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to check friend request status');
    return response.json();
  },

  manageFriendRequest: async (profileId: string, accept: boolean): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.manageFriendRequests}`,
      {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify({ profileId, accept })
      }
    );
    if (!response.ok) throw new Error('Failed to manage friend request');
  },

  removeFriend: async (profileId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.removeFriend.replace('id', profileId)}`,
      {
        method: 'DELETE',
        headers: createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to remove friend');
  },

  removeFriendRequest: async (profileId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.removeFriendRequest.replace('id', profileId)}`,
      {
        method: 'DELETE',
        headers: createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to remove friend request');
  },

  uploadProfilePicture: async (formData: FormData): Promise<void> => {
    const headers = createHeaders();
    delete headers['Content-Type'];
    
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}/Profile/v1/uploadProfilePicture`,
      {
        method: 'PUT',
        headers: headers,
        body: formData,
      }
    );
    if (!response.ok) throw new Error('Failed to upload profile picture');
  },
};
