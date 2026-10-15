import React, { useEffect, useRef } from 'react';
import { api, ApiError } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { useGenerationStore } from '../store/useGenerationStore';
import { useNotificationStore } from '../store/useNotificationStore';

interface SyncStatusResponse {
  revisions: Record<string, string>;
  fingerprint: {
    userId: string;
    role: string;
    departmentId: string | null;
    status: string;
    tenureId: string | null;
  };
  serverTime: string;
}

const BASE_POLL_INTERVAL_MS = 30_000;
const MAX_BACKOFF_MS = 300_000; // 5 minutes

export const PollingUpdates: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceVisibleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPollingBusyRef = useRef(false);
  const backoffDelayRef = useRef(BASE_POLL_INTERVAL_MS);

  // Baseline tracking refs
  const isBaselineLoadedRef = useRef(false);
  const knownRevisionsRef = useRef<Record<string, string>>({});
  const knownFingerprintRef = useRef<{
    role?: string;
    departmentId?: string | null;
    status?: string;
    tenureId?: string | null;
  }>({});

  useEffect(() => {
    // Only poll when authenticated and not in first-password reset mode
    if (!user || user.mustChangePassword) {
      return;
    }

    let isMounted = true;

    const clearActiveTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const abortActiveRequest = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isPollingBusyRef.current = false;
    };

    const scheduleNextPoll = (delayMs: number) => {
      clearActiveTimer();
      if (!isMounted || document.hidden || !navigator.onLine) {
        return;
      }
      // Add random jitter between 0 and 2000ms to avoid synchronous herd requests
      const jitter = Math.floor(Math.random() * 2000);
      timerRef.current = setTimeout(() => {
        void executePoll();
      }, delayMs + jitter);
    };

    const executePoll = async () => {
      if (!isMounted || isPollingBusyRef.current || document.hidden || !navigator.onLine) {
        return;
      }

      isPollingBusyRef.current = true;
      abortActiveRequest();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await api.get<SyncStatusResponse>('/api/sync/status', {
          signal: controller.signal,
        });

        if (!isMounted) return;

        // Reset backoff on success
        backoffDelayRef.current = BASE_POLL_INTERVAL_MS;

        const newRevisions: Record<string, string> = data?.revisions || {};
        const newFingerprint = data?.fingerprint;

        if (!isBaselineLoadedRef.current) {
          // Initial baseline run
          knownRevisionsRef.current = { ...newRevisions };
          knownFingerprintRef.current = {
            role: newFingerprint?.role,
            departmentId: newFingerprint?.departmentId,
            status: newFingerprint?.status,
            tenureId: newFingerprint?.tenureId,
          };
          isBaselineLoadedRef.current = true;

          // Initial hydration of common stores
          void useGenerationStore.getState().fetchGenerationConfig();
          void useNotificationStore.getState().fetchNotifications();
        } else {
          // Compare revisions and selectively invalidate
          const prevRevisions = knownRevisionsRef.current;
          let hasAnyChange = false;

          if (newRevisions.tasks && newRevisions.tasks !== prevRevisions.tasks) {
            hasAnyChange = true;
            window.dispatchEvent(new CustomEvent('gdgoc:sync:tasks'));
            window.dispatchEvent(new CustomEvent('gdgoc:sync:dashboard'));
          }

          if (newRevisions.events && newRevisions.events !== prevRevisions.events) {
            hasAnyChange = true;
            window.dispatchEvent(new CustomEvent('gdgoc:sync:events'));
            window.dispatchEvent(new CustomEvent('gdgoc:sync:dashboard'));
          }

          if (newRevisions.gems && newRevisions.gems !== prevRevisions.gems) {
            hasAnyChange = true;
            window.dispatchEvent(new CustomEvent('gdgoc:sync:gems'));
            window.dispatchEvent(new CustomEvent('gdgoc:sync:dashboard'));
          }

          if (newRevisions.notifications && newRevisions.notifications !== prevRevisions.notifications) {
            void useNotificationStore.getState().fetchNotifications();
          }

          if (newRevisions.semesters && newRevisions.semesters !== prevRevisions.semesters) {
            hasAnyChange = true;
            void useGenerationStore.getState().fetchGenerationConfig();
            window.dispatchEvent(new CustomEvent('gdgoc:sync:semesters'));
            window.dispatchEvent(new CustomEvent('gdgoc:sync:dashboard'));
          }

          if (newRevisions.members && newRevisions.members !== prevRevisions.members) {
            window.dispatchEvent(new CustomEvent('gdgoc:sync:members'));
          }

          // Legacy event trigger to support un-migrated listeners
          if (hasAnyChange) {
            window.dispatchEvent(new Event('gdgoc:refresh'));
          }

          // Check fingerprint changes (e.g. role, banId, status change)
          const prevFp = knownFingerprintRef.current;
          if (
            newFingerprint &&
            (newFingerprint.role !== prevFp.role ||
              newFingerprint.departmentId !== prevFp.departmentId ||
              newFingerprint.status !== prevFp.status ||
              newFingerprint.tenureId !== prevFp.tenureId)
          ) {
            knownFingerprintRef.current = {
              role: newFingerprint.role,
              departmentId: newFingerprint.departmentId,
              status: newFingerprint.status,
              tenureId: newFingerprint.tenureId,
            };
            void useAuthStore.getState().fetchSession();
          }

          knownRevisionsRef.current = { ...newRevisions };
        }

        // Schedule next regular poll
        scheduleNextPoll(BASE_POLL_INTERVAL_MS);
      } catch (err: any) {
        if (!isMounted || err?.name === 'AbortError') {
          return;
        }

        const statusCode = err instanceof ApiError ? err.statusCode : err?.status;

        if (statusCode === 401) {
          // Token expired or invalid
          useAuthStore.getState().logout();
          return;
        }

        if (statusCode === 403) {
          // Password change mandatory or access revoked
          clearActiveTimer();
          return;
        }

        if (statusCode === 429) {
          // Rate limited, wait 60 seconds
          scheduleNextPoll(60_000);
          return;
        }

        // 5xx or network disconnect: exponential backoff
        const nextBackoff = Math.min(MAX_BACKOFF_MS, backoffDelayRef.current * 2);
        backoffDelayRef.current = nextBackoff;
        scheduleNextPoll(nextBackoff);
      } finally {
        isPollingBusyRef.current = false;
        abortControllerRef.current = null;
      }
    };

    // Visibility and Online change listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearActiveTimer();
        abortActiveRequest();
      } else {
        if (debounceVisibleRef.current) clearTimeout(debounceVisibleRef.current);
        debounceVisibleRef.current = setTimeout(() => {
          void executePoll();
        }, 300);
      }
    };

    const handleOnline = () => {
      if (!document.hidden) {
        if (debounceVisibleRef.current) clearTimeout(debounceVisibleRef.current);
        debounceVisibleRef.current = setTimeout(() => {
          void executePoll();
        }, 300);
      }
    };

    const handleOffline = () => {
      clearActiveTimer();
      abortActiveRequest();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial kickoff
    void executePoll();

    return () => {
      isMounted = false;
      clearActiveTimer();
      abortActiveRequest();
      if (debounceVisibleRef.current) clearTimeout(debounceVisibleRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  return null;
};
