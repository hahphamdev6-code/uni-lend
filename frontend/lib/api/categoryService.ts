import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type { ApiResponse, Category } from "./types";

export const categoryService = {
  async list(config?: Pick<AxiosRequestConfig, "signal">): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>("/categories", config);
    return response.data.data;
  },
};
