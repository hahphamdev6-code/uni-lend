import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type { ApiResponse, Category, PageResponse } from "./types";

export interface CategoryInput {
  name: string;
  description?: string;
}

export interface CategoryListParams {
  page?: number;
  size?: number;
}

export const categoryService = {
  async list(
    params: CategoryListParams = {},
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<PageResponse<Category>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Category>>>(
      "/api/categories",
      { ...config, params },
    );
    return response.data.data;
  },

  async listAll(
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<Category[]> {
    const firstPage = await this.list({ page: 0, size: 50 }, config);
    if (firstPage.totalPages <= 1) return firstPage.content;

    const remainingPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
        this.list({ page: index + 1, size: 50 }, config),
      ),
    );
    return firstPage.content.concat(
      ...remainingPages.map((page) => page.content),
    );
  },

  async create(input: CategoryInput): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>("/api/categories", input);
    return response.data.data;
  },

  async update(id: number, input: CategoryInput): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(
      `/api/categories/${id}`,
      input,
    );
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/categories/${id}`);
  },
};
