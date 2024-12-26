import { SERVICES, STORAGE } from '@/config/services';
import { ActivityFeedResponse, Post } from '@/types/api';

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