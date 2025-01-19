import { SERVICES } from '@/config/services';
import { Post, ViewProfileResponse, FollowUser } from '@/types/api';
import { createHeaders } from './api';

export const ProfileService = {
  viewProfile: async (id: string): Promise<ViewProfileResponse> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.viewProfile.replace('id', id)}`,
      { headers: createHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  getPosts: async (profileId: string, page: number = 1, rows: number = 10): Promise<Post[]> => {
    const response = await fetch(
      `${SERVICES.SOCIAL.baseUrl}${SERVICES.SOCIAL.endpoints.getProfilePosts.replace('id', profileId)}?page=${page}&rows=${rows}`,
      { headers: createHeaders() }
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
      headers: createHeaders(),
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
      headers: createHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch following');
    return response.json();
  },
};