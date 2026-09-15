/**
 * @file useNotificationStore.ts
 * @description Zustand store quản lý thông báo nội bộ CLB.
 *
 * ⚠️  MOCK DATA ĐÃ BỊ XÓA — Store bắt đầu với danh sách rỗng.
 * Khi backend được tích hợp, notifications sẽ được fetch từ GET /api/notifications.
 */

import { create } from 'zustand';
import type { BanId } from '../mocks/fixtures/users';

// ==========================================
// TYPES
// ==========================================

export type NotificationType = 'task' | 'event' | 'gems' | 'broadcast' | 'system';
export type NotificationPriority = 'normal' | 'important' | 'urgent';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetScope: 'all' | BanId; // Gửi cho toàn CLB hoặc riêng 1 Ban
  senderName: string;
  senderRole: string;
  createdAt: string;          // dd/MM/yyyy HH:mm
  isRead: boolean;
  link?: string;
}

// ==========================================
// STATE INTERFACE
// ==========================================

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

// ==========================================
// HELPERS
// ==========================================

function formatDateTimeVN(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${y} ${hh}:${mm}`;
}

// ==========================================
// STORE
// ==========================================

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [], // Empty — data comes from backend

  addNotification: (notif) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: formatDateTimeVN(),
      isRead: false,
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
