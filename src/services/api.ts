import { SERVICES, STORAGE } from '@/config/services';
import { ActivityFeedResponse, Post, FriendRecommendationsResponse, FriendRecommendation, ViewProfileResponse, FollowUser } from '@/types/api';
import { getAuthToken } from '@/utils/auth';

const createHeaders = () => {
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
  return `${STORAGE.AZURE_BLOB}/images/${imageGuid}`;
};

export const SocialService = {
  getActivityFeed: async (): Promise<Post[]> => {
    try {
      const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.activityFeed}`, {
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch activity feed');
      
      const data: ActivityFeedResponse = await response.json();
      return data.posts;
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      throw error;
    }
  },

  getFriendRecommendations: async (): Promise<FriendRecommendation[]> => {
    try {
      const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.friendRecommendations}`, {
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch friend recommendations');
      
      const data: FriendRecommendationsResponse = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Error fetching friend recommendations:', error);
      throw error;
    }
  },

  createPost: async (data: { content: string; visibility: number }): Promise<{ id: string }> => {
    const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.createPost}`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return response.json();
  },

  uploadPostImages: async (postId: string, formData: FormData): Promise<void> => {
    const headers = createHeaders();
    delete headers['Content-Type']; // Let the browser set the correct content type for FormData
    
    const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.uploadPostImages.replace('id', postId)}`, {
      method: 'PUT',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload post images');
    }
  },

  viewProfile: async (id: string): Promise<ViewProfileResponse> => {
    try {
      const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.viewProfile.replace('id', id)}`, {
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      return response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  getFollowers: async (id: string, page: number = 1, rows: number = 10): Promise<FollowUser[]> => {
    try {
      const endpoint = SERVICES.SOCIAL.endpoints.getFollowers
        .replace('id', id)
        .replace('{page}', page.toString())
        .replace('{rows}', rows.toString());
      
      const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${endpoint}`, {
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch followers');
      
      return response.json();
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  },

  getFollowing: async (id: string, page: number = 1, rows: number = 10): Promise<FollowUser[]> => {
    try {
      const endpoint = SERVICES.SOCIAL.endpoints.getFollowing
        .replace('id', id)
        .replace('{page}', page.toString())
        .replace('{rows}', rows.toString());
      
      const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${endpoint}`, {
        headers: createHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch following');
      
      return response.json();
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  },

  followUser: async (id: string): Promise<void> => {
    const response = await fetch(`${SERVICES.SOCIAL.baseUrl}/Follow/followUser/${id}`, {
      method: 'POST',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to follow user');
    }
  },

  unfollowUser: async (id: string): Promise<void> => {
    const response = await fetch(`${SERVICES.SOCIAL.baseUrl}/Follow/unfollowUser/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to unfollow user');
    }
  },

  getCurrentUserFollowData: async (id: string): Promise<{
    followers: FollowUser[];
    following: FollowUser[];
  }> => {
    const [followers, following] = await Promise.all([
      SocialService.getFollowers(id),
      SocialService.getFollowing(id)
    ]);

    return { followers, following };
  }
};

export const NutritionService = {
  baseUrl: SERVICES.NUTRITION.baseUrl,
  // Add nutrition-specific methods here
};

export const TrainingService = {
  baseUrl: SERVICES.TRAINING.baseUrl,
  // Add training-specific methods here
};
