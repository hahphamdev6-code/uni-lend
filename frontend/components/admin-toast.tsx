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
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((kind: ToastMessage["kind"], text: string) => {
    setToast({ id: Date.now(), kind, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 4500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`${styles.toast} ${toast.kind === "success" ? styles.success : styles.error}`}
          key={toast.id}
          role={toast.kind === "error" ? "alert" : "status"}
        >
          <span>{toast.text}</span>
          <button aria-label="Đóng thông báo" onClick={() => setToast(null)} type="button">
            ×
          </button>
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
