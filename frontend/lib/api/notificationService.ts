import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type { ApiResponse, PageResponse } from "./types";

export interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string | null;
}

export interface NotificationListParams {
  page?: number;
  size?: number;
}

export const notificationService = {
  async list(
    params: NotificationListParams = {},
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<PageResponse<Notification>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Notification>>>(
      "/notifications",
      { ...config, params },
    );
    return response.data.data;
  },

  async markRead(id: number): Promise<void> {
    await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch<ApiResponse<void>>("/notifications/read-all");
  },

  async unreadCount(
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<number> {
    const response = await apiClient.get<
      ApiResponse<number | { unreadCount: number }>
    >("/notifications/unread-count", config);
    const data = response.data.data;
    return typeof data === "number" ? data : data.unreadCount;
  },
};
