/**
 * @file useNotificationStore.ts
 * @description Zustand store quản lý thông báo nội bộ CLB kết nối API Backend.
 */

import { create } from 'zustand';
import type { BanId } from '../types/auth.types';
import { notificationsApi, CreateNotificationDto } from '../api';

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
  targetScope: 'all' | BanId;
  senderName: string;
  senderRole: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
}

// ==========================================
// STATE INTERFACE
// ==========================================

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  createNotification: (dto: {
    title: string;
    message: string;
    type?: string;
    priority?: string;
    targetDepartmentCode?: string;
    link?: string;
  }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

function mapBackendNotifToUi(item: any): AppNotification {
  const typeMap: Record<string, NotificationType> = {
    TASK: 'task',
    EVENT: 'event',
    GEMS: 'gems',
    BROADCAST: 'broadcast',
    SYSTEM: 'system',
  };

  const priorityMap: Record<string, NotificationPriority> = {
    NORMAL: 'normal',
    IMPORTANT: 'important',
    URGENT: 'urgent',
  };

  return {
    id: item.id,
    title: item.title,
    message: item.message,
    type: typeMap[item.type] || 'system',
    priority: priorityMap[item.priority] || 'normal',
    targetScope: 'all',
    senderName: item.sender?.fullName || 'Ban Chủ Nhiệm',
    senderRole: 'Ban Điều Hành',
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('vi-VN') + ' ' + new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : '',
    isRead: Boolean(item.isRead),
    link: item.link || undefined,
  };
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationsApi.getNotifications({ limit: 50 });
      const rawList = (res as any)?.items || (Array.isArray(res) ? res : []);
      const mapped = rawList.map(mapBackendNotifToUi);
      const unread = (res as any)?.unreadCount ?? mapped.filter((n: any) => !n.isRead).length;
      set({ notifications: mapped, unreadCount: unread, isLoading: false });
    } catch (err) {
      console.error('[NotificationStore] Failed to fetch notifications:', err);
      set({ isLoading: false });
    }
  },

  createNotification: async (dto) => {
    try {
      await notificationsApi.createNotification({
        title: dto.title,
        message: dto.message,
        type: dto.type?.toUpperCase() || 'BROADCAST',
        priority: dto.priority?.toUpperCase() || 'IMPORTANT',
        targetDepartmentCode: dto.targetDepartmentCode,
        link: dto.link,
      });
      await get().fetchNotifications();
    } catch (err) {
      console.error('[NotificationStore] Failed to create notification:', err);
      throw err;
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error('[NotificationStore] Failed to mark as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('[NotificationStore] Failed to mark all as read:', err);
    }
  },
}));
