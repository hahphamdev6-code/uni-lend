import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type { ApiResponse, Category } from "./types";

export interface CategoryInput {
  name: string;
  description?: string;
}

export const categoryService = {
  async list(config?: Pick<AxiosRequestConfig, "signal">): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>("/categories", config);
    return response.data.data;
  },

  async create(input: CategoryInput): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>("/categories", input);
    return response.data.data;
  },

  async update(id: number, input: CategoryInput): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, input);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
  },
};
