import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type { AdminStats, ApiResponse } from "./types";

export const adminStatsService = {
  async get(config?: Pick<AxiosRequestConfig, "signal">): Promise<AdminStats> {
    const response = await apiClient.get<ApiResponse<AdminStats>>("/admin/stats", config);
    return response.data.data;
  },
};
