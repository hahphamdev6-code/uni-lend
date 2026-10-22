import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type { ApiResponse, Item, ItemInput, PageResponse } from "./types";

export interface ItemSearchParams {
  keyword?: string;
  categoryId?: number;
  status?: Item["status"];
  page?: number;
  size?: number;
}

export const itemService = {
  async list(
    params: ItemSearchParams = {},
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<PageResponse<Item>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Item>>>("/items", {
      ...config,
      params,
    });
    return response.data.data;
  },

  async listMine(
    params: { page?: number; size?: number } = {},
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<PageResponse<Item>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Item>>>("/items/me", {
      ...config,
      params,
    });
    return response.data.data;
  },

  async getById(
    id: number,
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<Item> {
    const response = await apiClient.get<ApiResponse<Item>>(`/items/${id}`, config);
    return response.data.data;
  },

  async create(input: ItemInput): Promise<Item> {
    const response = await apiClient.post<ApiResponse<Item>>("/items", input);
    return response.data.data;
  },

  async update(id: number, input: ItemInput): Promise<Item> {
    const response = await apiClient.put<ApiResponse<Item>>(`/items/${id}`, input);
    return response.data.data;
  },

  async uploadImages(id: number, files: File[]): Promise<Item> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const response = await apiClient.post<ApiResponse<Item>>(
      `/items/${id}/images`,
      formData,
      { headers: { "Content-Type": null } },
    );
    return response.data.data;
  },

  async deleteImage(id: number, imageId: number): Promise<Item> {
    const response = await apiClient.delete<ApiResponse<Item>>(
      `/items/${id}/images/${imageId}`,
    );
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/items/${id}`);
  },
};
