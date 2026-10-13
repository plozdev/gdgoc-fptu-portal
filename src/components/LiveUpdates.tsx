import { useGenerationStore } from "../store/useGenerationStore";
import React, { useEffect } from "react";
import { useNotificationStore } from "../store/useNotificationStore";

/**
 * Headless real-time sync component.
 * Maintains SSE connection to /api/live/stream and notifies application stores
 * without rendering intrusive greetings.
 */
export const LiveUpdates: React.FC = () => {
  useEffect(() => {
    const refresh = () => {
      void useGenerationStore.getState().fetchGenerationConfig();
      window.dispatchEvent(new Event("gdgoc:refresh"));
      void useNotificationStore.getState().fetchNotifications();
    };

    const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    const stream = new EventSource(base + "/api/live/stream", {
      withCredentials: true,
    });

    stream.onopen = () => {
      refresh();
    };

    stream.addEventListener("refresh", refresh);
    refresh();

    return () => stream.close();
  }, []);

  return null;
};
