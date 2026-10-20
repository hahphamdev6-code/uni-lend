"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_TOKEN_CHANGE_EVENT,
  getAuthToken,
} from "../lib/api/apiClient";
import {
  notificationService,
  type Notification,
} from "../lib/api/notificationService";

const POLLING_INTERVAL = 30_000;
const NOTIFICATION_PAGE_SIZE = 10;

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string;
  authenticated: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const requestInProgress = useRef(false);
  const hasLoaded = useRef(false);

  const refresh = useCallback(async () => {
    if (!getAuthToken() || requestInProgress.current) return;

    requestInProgress.current = true;
    if (!hasLoaded.current) setLoading(true);
    try {
      const [page, count] = await Promise.all([
        notificationService.list({ page: 0, size: NOTIFICATION_PAGE_SIZE }),
        notificationService.unreadCount(),
      ]);
      setNotifications(page.content);
      setUnreadCount(count);
      setError("");
      hasLoaded.current = true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải thông báo. Vui lòng thử lại.",
      );
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let active = true;

    function stopPolling() {
      if (intervalId) clearInterval(intervalId);
      intervalId = undefined;
      setAuthenticated(false);
      setNotifications([]);
      setUnreadCount(0);
      setError("");
      setLoading(false);
      hasLoaded.current = false;
    }

    function startPolling() {
      if (!getAuthToken()) {
        stopPolling();
        return;
      }

      setAuthenticated(true);
      void refresh();
      if (!intervalId) {
        intervalId = setInterval(() => {
          void refresh();
        }, POLLING_INTERVAL);
      }
    }

    queueMicrotask(() => {
      if (active) startPolling();
    });
    window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, startPolling);

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, startPolling);
    };
  }, [refresh]);

  const markRead = useCallback(
    async (id: number) => {
      const previousNotifications = notifications;
      const wasUnread = previousNotifications.some((notification) => notification.id === id && !notification.read);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification,
        ),
      );
      if (wasUnread) setUnreadCount((current) => Math.max(0, current - 1));

      try {
        await notificationService.markRead(id);
      } catch (requestError) {
        setNotifications(previousNotifications);
        if (wasUnread) setUnreadCount((current) => current + 1);
        throw requestError;
      }
    },
    [notifications],
  );

  const markAllRead = useCallback(async () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
    setUnreadCount(0);

    try {
      await notificationService.markAllRead();
    } catch (requestError) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      throw requestError;
    }
  }, [notifications, unreadCount]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      authenticated,
      refresh,
      markRead,
      markAllRead,
    }),
    [authenticated, error, loading, markAllRead, markRead, notifications, refresh, unreadCount],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider.");
  }
  return context;
}
