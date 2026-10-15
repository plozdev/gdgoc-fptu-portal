import React, { useEffect } from 'react';
import { api, ApiError } from '../api/client';
import { mapBackendUserToSession, useAuthStore } from '../store/useAuthStore';
import { useGenerationStore } from '../store/useGenerationStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useMemberStore } from '../store/useMemberStore';
import { refreshSync, resetSync, subscribeSync } from '../sync/subscriptions';

interface SyncStatusResponse {
  revisions: Record<string, string>;
  fingerprint: { userId: string; role: string; departmentId: string | null; status: string; tenureId: string | null };
}
const BASE_INTERVAL = 30_000;
const MAX_BACKOFF = 300_000;

export const PollingUpdates: React.FC = () => {
  const userId = useAuthStore(s => s.user?.id);
  const mustChangePassword = useAuthStore(s => s.user?.mustChangePassword);
  useEffect(() => {
    if (!userId || mustChangePassword) return;
    let mounted = true;
    let busy = false;
    let resumePending = false;
    let backoff = BASE_INTERVAL;
    let fingerprint: string | undefined;
    let scopeRevision = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    const active = () => mounted && !document.hidden && navigator.onLine;
    const clearTimer = () => { clearTimeout(timer); timer = undefined; };
    const schedule = (delay: number) => {
      clearTimer();
      if (active()) timer = setTimeout(() => void poll(), delay + Math.floor(Math.random() * 2000));
    };
    resetSync();
    const unsubscribers = [
      subscribeSync(['semesters', 'scope'], () => useGenerationStore.getState().fetchGenerationConfig()),
      subscribeSync(['notifications', 'scope'], () => useNotificationStore.getState().fetchNotifications()),
      subscribeSync(['members', 'gems', 'scope'], () => useMemberStore.getState().fetchMembers()),
    ];
    const refreshSession = async (signal: AbortSignal) => {
      // A transient failure must not clear an authenticated user's session.
      const raw = await api.get('/api/auth/me', { signal });
      if (mounted && !signal.aborted) useAuthStore.getState().setUser(mapBackendUserToSession(raw));
    };
    const poll = async () => {
      if (!active()) return;
      if (busy) {
        // Resume an aborted cycle once it releases the lock. A normal in-flight
        // request already covers repeated focus/online events.
        if (controller?.signal.aborted) resumePending = true;
        return;
      }
      clearTimer();
      busy = true;
      const current = new AbortController();
      controller = current;
      let delay = BASE_INTERVAL;
      try {
        const data = await api.get<SyncStatusResponse>('/api/sync/status', { signal: current.signal });
        if (!mounted || current.signal.aborted) return;
        const resources = ['tasks', 'events', 'gems', 'notifications', 'semesters', 'members'];
        if (!data?.fingerprint || resources.some(resource => !data.revisions?.[resource])) {
          throw new Error('Dữ liệu đồng bộ chưa được khởi tạo. Cần kiểm tra migration của BE.');
        }
        const nextFingerprint = JSON.stringify(data.fingerprint);
        if (fingerprint !== undefined && fingerprint !== nextFingerprint) {
          await refreshSession(current.signal);
          if (!mounted || current.signal.aborted) return;
          scopeRevision++;
        }
        fingerprint = nextFingerprint;
        await refreshSync({ ...data.revisions, scope: String(scopeRevision) });
        backoff = BASE_INTERVAL;
      } catch (error) {
        if (!mounted || current.signal.aborted) return;
        if (error instanceof ApiError && error.statusCode === 401) {
          useAuthStore.getState().setUser(null);
          return;
        }
        if (error instanceof ApiError && error.statusCode === 403) {
          try { await refreshSession(current.signal); } catch { /* Retry with backoff. */ }
        }
        backoff = Math.min(MAX_BACKOFF, backoff * 2);
        delay = error instanceof ApiError && error.statusCode === 429 ? 60_000 : backoff;
      } finally {
        busy = false;
        if (controller === current) controller = undefined;
        if (active() && useAuthStore.getState().user?.id === userId && !useAuthStore.getState().user?.mustChangePassword) {
          schedule(resumePending ? 0 : delay);
        }
        resumePending = false;
      }
    };
    const pause = () => {
      clearTimer();
      clearTimeout(debounce);
      controller?.abort();
    };
    const resume = () => {
      clearTimeout(debounce);
      if (active()) debounce = setTimeout(() => void poll(), 300);
    };
    const visibility = () => document.hidden ? pause() : resume();
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('online', resume);
    window.addEventListener('offline', pause);
    window.addEventListener('gdgoc:sync-now', resume);
    void poll();
    return () => {
      mounted = false;
      pause();
      unsubscribers.forEach(unsubscribe => unsubscribe());
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('online', resume);
      window.removeEventListener('offline', pause);
      window.removeEventListener('gdgoc:sync-now', resume);
    };
  }, [userId, mustChangePassword]);

  return null;
};
