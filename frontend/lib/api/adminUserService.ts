import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type { ApiResponse, PageResponse } from "./types";

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
}

export interface AdminUserSearchParams {
  keyword?: string;
  page?: number;
  size?: number;
}

export const adminUserService = {
  async list(
    params: AdminUserSearchParams = {},
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<PageResponse<AdminUser>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AdminUser>>>(
      "/admin/users",
      { ...config, params },
    );
    return response.data.data;
  },

  async setEnabled(id: number, enabled: boolean): Promise<AdminUser> {
    const response = await apiClient.patch<ApiResponse<AdminUser>>(
      `/admin/users/${id}/${enabled ? "unlock" : "lock"}`,
    );
    return response.data.data;
  },
};
