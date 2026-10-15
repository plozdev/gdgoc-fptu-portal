import { create } from 'zustand';
import type { BanId } from '../types/auth';
import { notificationsApi } from '../api/notifications.api';

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


interface NotificationState {
  notifications: AppNotification[];
  error: string | null;
  fetchNotifications: () => Promise<boolean>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}
const departmentCodes: Record<BanId, string> = { ai: 'TECH_AI', cloud: 'TECH_CLOUD', web: 'TECH_WEB', research: 'TECH_RESEARCH', media: 'MEDIA', 'hr-event': 'HR_EVENT' };
const departmentIds = Object.fromEntries(Object.entries(departmentCodes).map(([id, code]) => [code, id]));
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [], error: null,
  fetchNotifications: async () => {
    try {
      const response: any = await notificationsApi.getNotifications({ limit: 100 });
      set({ notifications: response.items.map((notification: any) => ({
        id: notification.id, title: notification.title, message: notification.message,
        type: notification.type.toLowerCase(), priority: notification.priority.toLowerCase(),
        targetScope: notification.targetDepartment ? departmentIds[notification.targetDepartment.code] : 'all',
        senderName: notification.sender?.fullName || '', senderRole: '',
        createdAt: new Date(notification.createdAt).toLocaleString('vi-VN'), isRead: notification.isRead, link: notification.link,
      })), error: null });
      return true;
    } catch (err) { set({ error: err instanceof Error ? err.message : 'Không thể tải thông báo' }); return false; }
  },
  addNotification: async (notification) => {
    await notificationsApi.createNotification({ title: notification.title, message: notification.message,
      type: notification.type.toUpperCase(), priority: notification.priority.toUpperCase(),
      targetDepartmentCode: notification.targetScope === 'all' ? 'all' : departmentCodes[notification.targetScope], link: notification.link });
    await get().fetchNotifications();
  },
  markAsRead: async (id) => {
    try { await notificationsApi.markAsRead(id); set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n), error: null })); }
    catch (err) { set({ error: err instanceof Error ? err.message : 'Không thể đánh dấu đã đọc' }); }
  },
  markAllAsRead: async () => {
    try { await notificationsApi.markAllAsRead(); set(state => ({ notifications: state.notifications.map(n => ({ ...n, isRead: true })), error: null })); }
    catch (err) { set({ error: err instanceof Error ? err.message : 'Không thể đánh dấu đã đọc' }); }
  },
  deleteNotification: async (id) => {
    try { await notificationsApi.deleteNotification(id); set(state => ({ notifications: state.notifications.filter(n => n.id !== id), error: null })); }
    catch (err) { set({ error: err instanceof Error ? err.message : 'Không thể xóa thông báo' }); }
  },
}));
