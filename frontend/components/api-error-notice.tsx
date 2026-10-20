"use client";

import { useEffect, useState } from "react";
import { API_ERROR_EVENT } from "../lib/api/apiClient";
import styles from "./api-error-notice.module.css";

type ApiErrorEvent = CustomEvent<{ message: string }>;

export function ApiErrorNotice() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    function handleApiError(event: Event) {
      const detail = (event as ApiErrorEvent).detail;
      if (detail && typeof detail.message === "string") setMessage(detail.message);
    }

    window.addEventListener(API_ERROR_EVENT, handleApiError);
    return () => window.removeEventListener(API_ERROR_EVENT, handleApiError);
  }, []);

  if (!message) return null;

  return (
    <div className={styles.notice} role="alert">
      <span>{message}</span>
      <button
        aria-label="Đóng thông báo"
        onClick={() => setMessage("")}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
