// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// This app uses a simple X-User-ID header instead of JWT (no token-based auth was built).
export function getUserId(): string {
  if (typeof window === 'undefined') return '1';
  return localStorage.getItem('user_id') || '1';
}

export function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-User-ID': getUserId(),
  };
}

export interface ApiResponse<T> {
  data: T;
  status: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    const data = await response.json();
    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('API Error');
    }

    return response.json();
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken() {
    return this.token;
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  login: (loginName: string, password: string) =>
    api.post('/auth/login', { loginName, password }),
};

// Issues API
export const issuesApi = {
  create: (data: any) => api.post('/issues', data),
  list: (params?: any) => api.get(`/issues?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => api.get(`/issues/${id}`),
  update: (id: string, data: any) => api.patch(`/issues/${id}`, data),
  changeState: (id: string, newState: string) =>
    api.patch(`/issues/${id}/state`, { newState }),
  addMessage: (id: string, text: string) =>
    api.post(`/issues/${id}/messages`, { messageText: text }),
  getMessages: (id: string) => api.get(`/issues/${id}/messages`),
};
