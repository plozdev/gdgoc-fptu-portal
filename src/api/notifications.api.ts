import { api } from './client';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: string;
  priority?: string;
  targetDepartmentCode?: string;
  link?: string;
}

export const notificationsApi = {
  getNotifications: (params?: { type?: string; unreadOnly?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    return api.get(`/api/notifications${queryString ? `?${queryString}` : ''}`);
  },

  createNotification: (dto: CreateNotificationDto) =>
    api.post('/api/notifications', dto),

  markAsRead: (id: string) => api.patch(`/api/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/api/notifications/read-all'),

  deleteNotification: (id: string) =>
    api.delete(`/api/notifications/${id}`),
};
