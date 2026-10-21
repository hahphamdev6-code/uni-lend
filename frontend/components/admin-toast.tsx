"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./admin-toast.module.css";

type ToastMessage = {
  id: number;
  kind: "success" | "error";
  text: string;
};

type ToastContextValue = {
  showToast: (kind: ToastMessage["kind"], text: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const showToast = useCallback((kind: ToastMessage["kind"], text: string) => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, kind, text }]);
    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id);
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4500),
    );
  }, []);

  useEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
  }, []);

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className={styles.toastContainer} aria-label="Thông báo">
          {toasts.map((toast) => (
            <div
              className={`${styles.toast} ${toast.kind === "success" ? styles.success : styles.error}`}
              key={toast.id}
              role={toast.kind === "error" ? "alert" : "status"}
            >
              <span>{toast.text}</span>
              <button
                aria-label="Đóng thông báo"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useAdminToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useAdminToast must be used within AdminToastProvider.");
  return context;
}
