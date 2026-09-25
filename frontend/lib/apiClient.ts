import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token (stored in localStorage) to every request.
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('uni_lend_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// If the API returns 401, clear the stored session.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('uni_lend_token');
      window.localStorage.removeItem('uni_lend_user');
    }
    return Promise.reject(error);
  },
);

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  roles: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  fullName: string;
}) {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
  return data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<ApiResponse<{ id: number; email: string; fullName: string; roles: string[] }>>(
    '/users/me',
  );
  return data;
}

export default apiClient;
