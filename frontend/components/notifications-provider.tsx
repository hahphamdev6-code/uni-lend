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
  actionInProgress: boolean;
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
  const [actionInProgress, setActionInProgress] = useState(false);
  const actionInProgressRef = useRef(false);
  const refreshController = useRef<AbortController | null>(null);
  const hasLoaded = useRef(false);

  const refresh = useCallback(async () => {
    if (!getAuthToken() || actionInProgressRef.current || refreshController.current) return;

    const controller = new AbortController();
    refreshController.current = controller;
    if (!hasLoaded.current) setLoading(true);
    try {
      const [page, count] = await Promise.all([
        notificationService.list(
          { page: 0, size: NOTIFICATION_PAGE_SIZE },
          { signal: controller.signal },
        ),
        notificationService.unreadCount({ signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;
      setNotifications(page.content);
      setUnreadCount(count);
      setError("");
      hasLoaded.current = true;
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải thông báo. Vui lòng thử lại.",
      );
    } finally {
      if (refreshController.current === controller) {
        refreshController.current = null;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let active = true;
    let activeToken: string | null = null;

    function stopPolling() {
      if (intervalId) clearInterval(intervalId);
      intervalId = undefined;
      activeToken = null;
      refreshController.current?.abort();
      refreshController.current = null;
      setAuthenticated(false);
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setError("");
      setLoading(false);
      hasLoaded.current = false;
    }

    function startPolling() {
      const token = getAuthToken();
      if (!token) {
        stopPolling();
        return;
      }

      if (activeToken && activeToken !== token) {
        refreshController.current?.abort();
        refreshController.current = null;
        setNotifications([]);
        setUnreadCount(0);
        setError("");
        hasLoaded.current = false;
      }
      activeToken = token;
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
      refreshController.current?.abort();
      refreshController.current = null;
      window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, startPolling);
    };
  }, [refresh]);

  const markRead = useCallback(
    async (id: number) => {
      if (actionInProgressRef.current) {
        throw new Error("Một thao tác thông báo khác đang được xử lý.");
      }
      actionInProgressRef.current = true;
      setActionInProgress(true);
      refreshController.current?.abort();
      const previousNotifications = notifications;
      const wasUnread =
        previousNotifications.find((notification) => notification.id === id)?.read === false ||
        (!previousNotifications.some((notification) => notification.id === id) && unreadCount > 0);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification,
        ),
      );
      if (wasUnread) setUnreadCount((current) => Math.max(0, current - 1));

      try {
        await notificationService.markRead(id);
      } catch (requestError) {
        if (wasUnread) {
          setNotifications((current) =>
            current.map((notification) =>
              notification.id === id ? { ...notification, read: false } : notification,
            ),
          );
          setUnreadCount((current) => current + 1);
        }
        throw requestError;
      } finally {
        actionInProgressRef.current = false;
        setActionInProgress(false);
      }
    },
    [notifications, unreadCount],
  );

  const markAllRead = useCallback(async () => {
    if (actionInProgressRef.current) {
      throw new Error("Một thao tác thông báo khác đang được xử lý.");
    }
    actionInProgressRef.current = true;
    setActionInProgress(true);
    refreshController.current?.abort();
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
    } finally {
      actionInProgressRef.current = false;
      setActionInProgress(false);
    }
  }, [notifications, unreadCount]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      authenticated,
      actionInProgress,
      refresh,
      markRead,
      markAllRead,
    }),
    [actionInProgress, authenticated, error, loading, markAllRead, markRead, notifications, refresh, unreadCount],
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
