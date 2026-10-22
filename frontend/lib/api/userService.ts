import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type { ApiResponse, UserProfileResponse, UserRatingResponse } from "./types";

export const userService = {
  async getMe(
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<UserProfileResponse> {
    const response = await apiClient.get<ApiResponse<UserProfileResponse>>(
      "/users/me",
      config,
    );
    return response.data.data;
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
