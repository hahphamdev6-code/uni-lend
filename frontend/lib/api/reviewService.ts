import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type { ApiResponse, PageResponse, Review } from "./types";

export const reviewService = {
  async create(
    loanId: number,
    input: { rating: number; comment?: string },
  ): Promise<Review> {
    const response = await apiClient.post<ApiResponse<Review>>(
      `/loan-requests/${loanId}/reviews`,
      input,
    );
    return response.data.data;
  },

  async listByLoan(
    loanId: number,
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<Review[]> {
    const response = await apiClient.get<ApiResponse<Review[]>>(
      `/loan-requests/${loanId}/reviews`,
      config,
    );
    return response.data.data;
  },

  async listByUser(
    userId: number,
    params: { page?: number; size?: number } = {},
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<PageResponse<Review>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Review>>>(
      `/users/${userId}/reviews`,
      { ...config, params },
    );
    return response.data.data;
  },
};
