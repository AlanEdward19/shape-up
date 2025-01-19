import { SERVICES, STORAGE } from '@/config/services';
import { Post, PostReaction, PostComment } from '@/types/api';
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
};