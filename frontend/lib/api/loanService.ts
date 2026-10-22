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
    const response = await apiClient.post<ApiResponse<Loan>>("/loan-requests", input);
    return response.data.data;
  },

  async listMine(
    params: { page?: number; size?: number } = {},
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<PageResponse<Loan>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Loan>>>("/loan-requests/mine", {
      ...config,
      params,
    });
    return response.data.data;
  },

  async listIncoming(
    params: { page?: number; size?: number } = {},
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<PageResponse<Loan>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Loan>>>(
      "/loan-requests/incoming",
      { ...config, params },
    );
    return response.data.data;
  },

  async approve(id: number): Promise<Loan> {
    const response = await apiClient.patch<ApiResponse<Loan>>(`/loan-requests/${id}/approve`);
    return response.data.data;
  },

  async reject(id: number): Promise<Loan> {
    const response = await apiClient.patch<ApiResponse<Loan>>(`/loan-requests/${id}/reject`);
    return response.data.data;
  },

  async markReturned(id: number): Promise<Loan> {
    const response = await apiClient.patch<ApiResponse<Loan>>(`/loan-requests/${id}/return`);
    return response.data.data;
  },
};
