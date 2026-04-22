const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined | null>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      credentials: 'include',
      ...fetchOptions,
    });
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to server. Check CORS configuration.');
    }
    throw err;
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: `HTTP error! status: ${response.status}` };
    }
    
    let errorMessage = 'An error occurred';
    
    if (typeof errorData.detail === 'string') {
      errorMessage = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      errorMessage = errorData.detail.map((e: { msg: string }) => e.msg).join(', ');
    } else if (errorData.detail) {
      errorMessage = String(errorData.detail);
    } else {
      errorMessage = `Request failed with status ${response.status}`;
    }
    
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | undefined | null>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface TopicSection {
  id: number;
  topic_id: number;
  section_type: string;
  content: string | null;
  section_metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface Topic {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  author_id: number;
  author?: { id: number; username: string; email: string };
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags: Tag[];
  sections: TopicSection[];
  author_username?: string;
  tag_names?: string[];
}

export interface TopicsResponse {
  items: Topic[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  tags: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface DashboardStats {
  total_users: number;
  total_topics: number;
  public_topics: number;
  private_topics: number;
  total_views: number;
  recent_users: { id: number; username: string; email: string; role: string; created_at: string }[];
  recent_topics: { id: number; title: string; author: string; is_public: boolean; view_count: number }[];
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<User>('/auth/login', { email, password }),
  
  signup: (email: string, username: string, password: string) =>
    api.post<User>('/auth/signup', { email, username, password }),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get<User>('/auth/me'),
  
  refresh: () => api.post<AuthResponse>('/auth/refresh'),
};

export const topicsApi = {
  getAll: (params?: {
    search?: string;
    starts_with?: string;
    tags?: string[];
    sort_by?: string;
    sort_order?: string;
    page?: number;
    page_size?: number;
  }) => api.get<TopicsResponse>('/topics', params),
  
  getById: (id: number) => api.get<Topic>(`/topics/${id}`),
  
  create: (data: {
    title: string;
    description?: string;
    is_public: boolean;
    tags?: string[];
    sections?: {
      type: string;
      content?: string;
      section_metadata?: Record<string, unknown>;
      order: number;
    }[];
  }) => api.post<Topic>('/topics', data),
  
  update: (id: number, data: {
    title?: string;
    description?: string;
    is_public?: boolean;
    tags?: string[];
    sections?: {
      type: string;
      content?: string;
      metadata?: Record<string, unknown>;
      order: number;
    }[];
  }) => api.put<Topic>(`/topics/${id}`, data),
  
  delete: (id: number) => api.delete(`/topics/${id}`),
  
  getMyTopics: () => api.get<Topic[]>('/topics/my-topics'),
  
  getTags: () => api.get<Tag[]>('/topics/tags'),
};

export const adminApi = {
  getDashboard: () => api.get<DashboardStats>('/admin/dashboard'),
  
  getActivity: (days?: number) => api.get('/admin/activity', { days }),
  
  getRateLimits: () => api.get('/admin/rate-limits'),
};