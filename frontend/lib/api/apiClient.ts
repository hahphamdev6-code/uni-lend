import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse } from "./types";

export const AUTH_TOKEN_KEY = "unilend.accessToken";
export const API_ERROR_EVENT = "unilend:api-error";
export const AUTH_TOKEN_CHANGE_EVENT = "unilend:auth-token-change";

const apiClient = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, ""),
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export class ApiClientError extends Error {
  readonly statusCode: number | undefined;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${encodeURIComponent(name)}=`));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(cookie.indexOf("=") + 1)) || null;
  } catch {
    return cookie.slice(cookie.indexOf("=") + 1) || null;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.localStorage.getItem("accessToken") ??
    window.localStorage.getItem("token") ??
    readCookie(AUTH_TOKEN_KEY) ??
    readCookie("accessToken") ??
    readCookie("token")
  );
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    throw new Error("Access tokens can only be stored in a browser.");
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("token");

  for (const name of [AUTH_TOKEN_KEY, "accessToken", "token"]) {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; path=/; SameSite=Lax`;
  }
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function responseMessage(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data.errors)) {
    const firstError = data.errors.find(
      (error): error is Record<string, unknown> =>
        isRecord(error) && typeof error.message === "string",
    );
    if (firstError && typeof firstError.message === "string") return firstError.message;
  }

  return undefined;
}

function friendlyMessage(statusCode?: number, serverMessage?: string): string {
  if (serverMessage && serverMessage !== "Success") return serverMessage;

  switch (statusCode) {
    case 400:
      return "Thông tin gửi lên chưa hợp lệ. Vui lòng kiểm tra lại.";
    case 401:
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    case 403:
      return "Bạn không có quyền thực hiện thao tác này.";
    case 404:
      return "Không tìm thấy dữ liệu bạn yêu cầu.";
    case 500:
      return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
    default:
      return "Đã xảy ra lỗi. Vui lòng thử lại.";
  }
}

function handleAuthorizationFailure(statusCode: number | undefined, message: string): void {
  if (typeof window === "undefined") return;

  if (statusCode === 401) {
    clearAuthToken();
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  } else if (statusCode === 403) {
    window.dispatchEvent(new CustomEvent(API_ERROR_EVENT, { detail: { message } }));
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const data: unknown = response.data;

    if (isRecord(data) && typeof data.success === "boolean") {
      const normalizedResponse: ApiResponse<unknown> = {
        success: data.success,
        message: typeof data.message === "string" ? data.message : "",
        data: data.data,
        statusCode:
          typeof data.statusCode === "number" ? data.statusCode : response.status,
      };

      if (!normalizedResponse.success) {
        const message = friendlyMessage(
          normalizedResponse.statusCode,
          normalizedResponse.message,
        );
        handleAuthorizationFailure(normalizedResponse.statusCode, message);
        throw new ApiClientError(message, normalizedResponse.statusCode);
      }

      response.data = normalizedResponse;
    }

    return response;
  },
  (error: AxiosError<unknown>) => {
    const statusCode = error.response?.status;
    const serverMessage = responseMessage(error.response?.data);

    const message =
      statusCode === undefined
        ? axios.isCancel(error)
          ? "Yêu cầu đã bị hủy."
          : "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
        : friendlyMessage(statusCode, serverMessage);

    handleAuthorizationFailure(statusCode, message);

    return Promise.reject(new ApiClientError(message, statusCode));
  },
);

export default apiClient;
