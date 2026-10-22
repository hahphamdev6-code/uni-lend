"use client";

import { useEffect } from "react";
import { useAdminToast } from "./admin-toast";
import { API_ERROR_EVENT } from "../lib/api/apiClient";

type ApiErrorEvent = CustomEvent<{ message: string }>;

export function ApiErrorNotice() {
  const { showToast } = useAdminToast();

  useEffect(() => {
    function handleApiError(event: Event) {
      const detail = (event as ApiErrorEvent).detail;
      if (detail && typeof detail.message === "string") showToast("error", detail.message);
    }

    window.addEventListener(API_ERROR_EVENT, handleApiError);
    return () => window.removeEventListener(API_ERROR_EVENT, handleApiError);
  }, [showToast]);

  return null;
}
