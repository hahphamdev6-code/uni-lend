import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type {
  ApiResponse,
  CreateLoanInput,
  Loan,
  PageResponse,
} from "./types";

export const loanService = {
  async createRequest(input: CreateLoanInput): Promise<Loan> {
    const response = await apiClient.post<ApiResponse<Loan>>("/loans", input);
    return response.data.data;
  },

  async listMine(
    params: { page?: number; size?: number } = {},
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<PageResponse<Loan>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Loan>>>("/loans/me", {
      ...config,
      params,
    });
    return response.data.data;
  },
};
