import type { AxiosRequestConfig } from "axios";
import apiClient, { clearAuthToken, setAuthToken } from "./apiClient";
import type {
  ApiResponse,
  AuthResponse,
  UserProfileResponse,
  UserRatingResponse,
} from "./types";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  fullName: string;
  phone?: string | null;
  university?: string | null;
  avatarUrl?: string | null;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export const userService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      {
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        password: input.password,
      },
    );
    const data = response.data.data;
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      {
        email: input.email.trim(),
        password: input.password,
      },
    );
    const data = response.data.data;
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout(): void {
    clearAuthToken();
  },

  async getMe(
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<UserProfileResponse> {
    const response = await apiClient.get<ApiResponse<UserProfileResponse>>(
      "/users/me",
      config,
    );
    return response.data.data;
  },

  async updateProfile(input: UpdateProfileInput): Promise<UserProfileResponse> {
    const response = await apiClient.put<ApiResponse<UserProfileResponse>>(
      "/users/me",
      {
        fullName: input.fullName.trim(),
        phone: input.phone?.trim() || null,
        university: input.university?.trim() || null,
        avatarUrl: input.avatarUrl?.trim() || null,
      },
    );
    return response.data.data;
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await apiClient.patch<ApiResponse<void>>("/users/me/password", input);
  },

  async getRating(
    id: number,
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<UserRatingResponse> {
    const response = await apiClient.get<ApiResponse<UserRatingResponse>>(
      `/users/${id}/rating`,
      config,
    );
    return response.data.data;
  },
};
