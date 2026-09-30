import { api, buildQueryString } from '../client';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: 'TASK' | 'EVENT' | 'GEMS' | 'BROADCAST' | 'SYSTEM' | string;
  priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT' | string;
  targetDepartmentCode?: string;
  targetDepartmentId?: string;
  targetUserId?: string;
  link?: string;
}

export const notificationsApi = {
  getNotifications: (params?: { type?: string; unreadOnly?: boolean; page?: number; limit?: number }) =>
    api.get(`/api/notifications${buildQueryString(params)}`),

  createNotification: (dto: CreateNotificationDto) =>
    api.post('/api/notifications', dto),

  markAsRead: (id: string) => api.patch(`/api/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/api/notifications/read-all'),

  deleteNotification: (id: string) =>
    api.delete(`/api/notifications/${id}`),
};
