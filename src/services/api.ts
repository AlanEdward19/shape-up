import { SERVICES, STORAGE } from '@/config/services';
import { ActivityFeedResponse, Post, FriendRecommendationsResponse, FriendRecommendation } from '@/types/api';

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
      const response = await fetch(`${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.activityFeed}`);
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
      const response = await fetch(`${SERVICES.SOCIAL.baseUrl}/Recommendation/FriendRecommendations`);
      if (!response.ok) throw new Error('Failed to fetch friend recommendations');
      
      const data: FriendRecommendationsResponse = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Error fetching friend recommendations:', error);
      throw error;
    }
  },

  createPost: async (data: { content: string; visibility: number }): Promise<{ id: string }> => {
    const response = await fetch(`${SERVICES.SOCIAL.baseUrl}/Post/CreatePost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return response.json();
  },

  uploadPostImages: async (postId: string, formData: FormData): Promise<void> => {
    const response = await fetch(`${SERVICES.SOCIAL.baseUrl}/Post/${postId}/uploadPostImages`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload post images');
    }
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