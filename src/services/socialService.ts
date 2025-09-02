import { SERVICES, STORAGE } from '@/config/services';
import {
    Post,
    PostReaction,
    PostComment,
    ViewProfileResponse,
    Friend,
    FriendRequest,
    FollowUser,
    ProfileSearchResult,
    ViewProfileSimplifiedResponse
} from '@/types/socialService.ts';
import { createHeaders } from '@/services/utils/serviceUtils.ts';

export const SocialService = {
    viewProfile: async (id: string): Promise<ViewProfileResponse> => {
        const response = await fetch(
            `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.viewProfile.replace('id', id)}`,
            { headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    viewProfileSimplified: async (id: string): Promise<ViewProfileSimplifiedResponse> => {
        const response = await fetch(
            `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.viewProfileSimplified.replace('id', id)}`,
            { headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    getPosts: async (profileId: string, page: number = 1): Promise<Post[]> => {
        const response = await fetch(
            `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.getProfilePosts.replace('id', profileId).replace('{page}', page.toString())}`,
            { headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to fetch profile posts');
        return response.json();
    },

    getFollowers: async (id: string, page: number = 1, rows: number = 10): Promise<FollowUser[]> => {
        const endpoint = SERVICES.SOCIAL.endpoints.getFollowers
            .replace('id', id)
            .replace('{page}', page.toString())
            .replace('{rows}', rows.toString());

        const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${endpoint}`, {
            headers: await createHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch followers');
        return response.json();
    },

    getFollowing: async (id: string, page: number = 1, rows: number = 10): Promise<FollowUser[]> => {
        const endpoint = SERVICES.SOCIAL.endpoints.getFollowing
            .replace('id', id)
            .replace('{page}', page.toString())
            .replace('{rows}', rows.toString());

        const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${endpoint}`, {
            headers: await createHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch following');
        return response.json();
    },

  editProfile: async (data: { gender?: number; birthDate?: string; bio?: string }): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.editProfile}`,
      {
        method: 'PATCH',
        headers: await createHeaders(),
        body: JSON.stringify(data)
      }
    );
    if (!response.ok) throw new Error('Failed to edit profile');
  },

  followUser: async (userId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.followUser.replace('id', userId)}`,
      {
        method: 'POST',
        headers: await createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to follow user');
  },

  unfollowUser: async (userId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.unfollowUser.replace('id', userId)}`,
      {
        method: 'DELETE',
        headers: await createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to unfollow user');
  },

  getPost: async (postId: string): Promise<Post> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.getPost.replace('id', postId)}`,
      { headers: await createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  getActivityFeed: async (): Promise<Post[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.activityFeed}`,
      { headers: await createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch activity feed');
    return response.json();
  },

  createPost: async (data: { content: string; visibility: number }): Promise<{ id: string }> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.createPost}`,
      {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  uploadPostImages: async (postId: string, formData: FormData): Promise<void> => {
    const headers = await createHeaders();
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
      { headers: await createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch post reactions');
    return response.json();
  },

  reactToPost: async (postId: string, reactionType: number): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.reactToPost.replace('id', postId)}`,
      {
        method: 'PUT',
        headers: await createHeaders(),
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
        headers: await createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to delete reaction');
  },

  getComments: async (postId: string): Promise<PostComment[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.getComments.replace('id', postId)}`,
      { headers: await createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  commentOnPost: async (postId: string, content: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.commentOnPost.replace('id', postId)}`,
      {
        method: 'POST',
        headers: await createHeaders(),
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
        headers: await createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to delete comment');
  },

  editComment: async (commentId: string, content: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.editComment.replace('id', commentId)}`,
      {
        method: 'PUT',
        headers: await createHeaders(),
        body: JSON.stringify({ content })
      }
    );
    if (!response.ok) throw new Error('Failed to edit comment');
  },

  getFriendRecommendations: async () => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.friendRecommendations}`,
      { headers: await createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch friend recommendations');
    return response.json();
  },

  sendFriendRequest: async (friendId: string, requestMessage?: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.sendFriendRequest}`,
      {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify({ friendId, requestMessage })
      }
    );
    if (!response.ok) throw new Error('Failed to send friend request');
  },

  listFriends: async (profileId: string, page: number = 1, rows: number = 10): Promise<Friend[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.listFriends.replace('id', profileId).replace('pageNumber', page.toString()).replace('rowsNumber', rows.toString())}`,
      { headers: await createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to list friends');
    return response.json();
  },

  checkFriendRequestStatus: async (): Promise<FriendRequest[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.checkRequestStatus}`,
      { headers: await createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to check friend request status');
    return response.json();
  },

  manageFriendRequest: async (profileId: string, accept: boolean): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.manageFriendRequests}`,
      {
        method: 'PUT',
        headers: await createHeaders(),
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
        headers: await createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to remove friend');
  },

  removeFriendRequest: async (profileId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.removeFriendRequest.replace('id', profileId)}`,
      {
        method: 'DELETE',
        headers: await createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to remove friend request');
  },

  uploadProfilePicture: async (formData: FormData): Promise<void> => {
    const headers = await createHeaders();
    delete headers['Content-Type'];
    
    const response = await fetch(
        `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.uploadProfilePicture}`,
      {
        method: 'PUT',
        headers: headers,
        body: formData,
      }
    );
    if (!response.ok) throw new Error('Failed to upload profile picture');
  },

  acceptFriendRequest: async (profileId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.manageFriendRequests}`,
      {
        method: 'PUT',
        headers: await createHeaders(),
        body: JSON.stringify({ profileId, accept: true })
      }
    );
    if (!response.ok) throw new Error('Failed to accept friend request');
  },

  rejectFriendRequest: async (profileId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.manageFriendRequests}`,
      {
        method: 'PUT',
        headers: await createHeaders(),
        body: JSON.stringify({ profileId, accept: false })
      }
    );
    if (!response.ok) throw new Error('Failed to reject friend request');
  },

  unfriend: async (profileId: string): Promise<void> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.removeFriend.replace('id', profileId)}`,
      {
        method: 'DELETE',
        headers: await createHeaders()
      }
    );
    if (!response.ok) throw new Error('Failed to unfriend');
  },

  searchProfileByName: async (name: string): Promise<ProfileSearchResult[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.searchProfileByName.replace('{name}', encodeURIComponent(name))}`,
      { headers: await createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to search profiles');
    return response.json();
  }
};
