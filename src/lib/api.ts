import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false, // Disable credentials for now
    });

    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Generic request methods with retry logic for rate limiting
  async get<T>(url: string, params?: any): Promise<T> {
    const maxRetries = 5; // Increased retries
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response: AxiosResponse<T> = await this.client.get(url, { params });
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 429 && retries < maxRetries - 1) {
          // Rate limited - wait longer and retry
          const waitTime = Math.pow(2, retries) * 2000; // Longer backoff: 2s, 4s, 8s, 16s
          console.log(`Rate limited, retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries++;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response: AxiosResponse<T> = await this.client.post(url, data);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 429 && retries < maxRetries - 1) {
          const waitTime = Math.pow(2, retries) * 1000;
          console.log(`Rate limited (POST), retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries++;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response: AxiosResponse<T> = await this.client.put(url, data);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 429 && retries < maxRetries - 1) {
          const waitTime = Math.pow(2, retries) * 1000;
          console.log(`Rate limited (PUT), retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries++;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response: AxiosResponse<T> = await this.client.patch(url, data);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 429 && retries < maxRetries - 1) {
          const waitTime = Math.pow(2, retries) * 1000;
          console.log(`Rate limited (PATCH), retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries++;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  async delete<T>(url: string): Promise<T> {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response: AxiosResponse<T> = await this.client.delete(url);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 429 && retries < maxRetries - 1) {
          const waitTime = Math.pow(2, retries) * 1000;
          console.log(`Rate limited (DELETE), retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries++;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// API Endpoints
export const api = {
  // Poets
  poets: {
    list: (params?: { page?: number; search?: string; century?: string; ordering?: string }) =>
      apiClient.get<PaginatedResponse<GanjoorPoetList>>('/poets/', params),
    get: (id: number) =>
      apiClient.get<GanjoorPoet>(`/poets/${id}/`),
    categories: (id: number) =>
      apiClient.get<GanjoorPoet>(`/poets/${id}/categories/`),
    poems: (id: number) =>
      apiClient.get<GanjoorPoet>(`/poets/${id}/poems/`),
  },

  // Categories
  categories: {
    list: (params?: { page?: number; parent?: number; poet?: number; search?: string; ordering?: string }) =>
      apiClient.get<PaginatedResponse<GanjoorCategoryList>>('/categories/', params),
    get: (id: number) =>
      apiClient.get<GanjoorCategory>(`/categories/${id}/`),
    poems: (id: number) =>
      apiClient.get<PaginatedResponse<GanjoorPoemList>>(`/categories/${id}/poems/`),
    subcategories: (id: number) =>
      apiClient.get<GanjoorCategory>(`/categories/${id}/subcategories/`),
  },

  // Poems
  poems: {
    list: (params?: { page?: number; category?: number; category__poet?: number; search?: string; ordering?: string }) =>
      apiClient.get<PaginatedResponse<GanjoorPoemList>>('/poems/', params),
    get: (id: number) =>
      apiClient.get<GanjoorPoem>(`/poems/${id}/`),
    verses: (id: number) =>
      apiClient.get<GanjoorPoem>(`/poems/${id}/verses/`),
    search: (query: string, poet?: number) =>
      apiClient.get<GanjoorPoem>(`/poems/search/?q=${encodeURIComponent(query)}${poet ? `&poet=${poet}` : ''}`),
  },

  // Verses
  verses: {
    list: (params?: { page?: number; poem?: number; position?: number; search?: string; ordering?: string }) =>
      apiClient.get<PaginatedResponse<GanjoorVerse>>('/verses/', params),
    get: (id: number) =>
      apiClient.get<GanjoorVerse>(`/verses/${id}/`),
  },

  // Audios
  audios: {
    list: (params?: { page?: number; poem?: number; is_direct?: boolean; is_uploaded?: boolean; ordering?: string }) =>
      apiClient.get<PaginatedResponse<GanjoorPoemAudio>>('/audios/', params),
    get: (id: number) =>
      apiClient.get<GanjoorPoemAudio>(`/audios/${id}/`),
  },

  // Audio Syncs
  audioSyncs: {
    list: (params?: { page?: number; audio?: number; poem?: number; ordering?: string }) =>
      apiClient.get<PaginatedResponse<GanjoorAudioSync>>('/audio-syncs/', params),
    get: (id: number) =>
      apiClient.get<GanjoorAudioSync>(`/audio-syncs/${id}/`),
  },

  // Favorites
  favorites: {
    list: (params?: { page?: number; ordering?: string }) =>
      apiClient.get<PaginatedResponse<GanjoorFavorite>>('/favorites/', params),
    get: (id: string) =>
      apiClient.get<GanjoorFavorite>(`/favorites/${id}/`),
    create: (data: { poem: number; verse: number }) =>
      apiClient.post<GanjoorFavorite>('/favorites/', data),
    toggle: (data: { poem: number; verse: number }) =>
      apiClient.post<GanjoorFavorite>('/favorites/toggle/', data),
    delete: (id: string) =>
      apiClient.delete(`/favorites/${id}/`),
  },

  // Settings
  settings: {
    list: (params?: { page?: number; search?: string; ordering?: string }) =>
      apiClient.get<PaginatedResponse<UserSetting>>('/settings/', params),
    get: (id: string) =>
      apiClient.get<UserSetting>(`/settings/${id}/`),
    me: () =>
      apiClient.get<UserSetting>('/settings/me/'),
    update: (data: Partial<UserSettingRequest>) =>
      apiClient.post<UserSetting>('/settings/me/', data),
  },
};

// Type definitions based on the API schema
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GanjoorPoetList {
  id: number;
  name: string;
  century: 'ancient' | 'classical' | 'contemporary' | 'modern';
  image: string | null;
  image_slug: string | null;
  poems_count: number; // API returns number, not string
}

export interface GanjoorPoet extends GanjoorPoetList {
  description: string;
  century_display: string;
  categories_count: number; // API returns number, not string
}

export interface GanjoorCategoryList {
  id: number;
  title: string;
  url: string | null;
  poet: number;
  poet_name: string;
  parent: number | null;
  parent_title: string | null;
  poems_count: number; // API returns number, not string
}

export interface GanjoorCategory extends GanjoorCategoryList {
  children: any[]; // API returns array, not string
  poems_count: number; // API returns number, not string
  breadcrumbs: string;
}

export interface GanjoorPoemList {
  id: number;
  title: string;
  url: string;
  category: number;
  category_title: string;
  poet_name: string;
  verses_count: number; // API returns number, not string
}

export interface GanjoorPoem extends GanjoorPoemList {
  poet_id: number;
  verses: GanjoorVerse[];
  audios: string;
}

export interface GanjoorVerse {
  id: number;
  poem: number;
  order: number;
  position: 0 | 1 | 2 | 3 | 4 | 5 | -1;
  position_display: string;
  text: string;
}

export interface GanjoorPoemAudio {
  id: number;
  poem: number;
  poem_title: string;
  file: string;
  file_url: string;
  description: string | null;
  download_url: string;
  is_direct: boolean;
  sync_guid: string;
  file_checksum: string;
  is_uploaded: boolean;
}

export interface GanjoorAudioSync {
  id: number;
  poem: number;
  poem_title: string;
  audio: number;
  verse_order: number;
  verse_text: string;
  millisec: number;
}

export interface GanjoorFavorite {
  id: number;
  user: number;
  user_username: string;
  poem: number;
  poem_title: string;
  verse: number;
  verse_text: string;
  poet_name: string;
  created_at: string;
}

export interface UserSetting {
  id: number;
  user: number;
  username: string;
  view_mode: string;
  font_size: number;
  show_line_numbers: boolean;
  last_highlight: string | null;
  browse_button_visible: boolean;
  comments_button_visible: boolean;
  copy_button_visible: boolean;
  print_button_visible: boolean;
  home_button_visible: boolean;
  random_button_visible: boolean;
  editor_button_visible: boolean;
  download_button_visible: boolean;
}

export interface UserSettingRequest {
  view_mode: string;
  font_size: number;
  show_line_numbers: boolean;
  last_highlight: string | null;
  browse_button_visible: boolean;
  comments_button_visible: boolean;
  copy_button_visible: boolean;
  print_button_visible: boolean;
  home_button_visible: boolean;
  random_button_visible: boolean;
  editor_button_visible: boolean;
  download_button_visible: boolean;
}
