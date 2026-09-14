import { create } from 'zustand';
import { BanId } from '../mocks/fixtures/users';

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
  createdAt: string; // dd/MM/yyyy HH:mm
  isRead: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Nhiệm vụ mới được giao cho Ban AI',
    message: 'Nghiên cứu Gemini 2.0 Multimodal API & viết notebook mẫu. Hạn nộp: 25/09/2026.',
    type: 'task',
    priority: 'important',
    targetScope: 'ai',
    senderName: 'Trần Nguyên Bảo',
    senderRole: 'AI Lead',
    createdAt: '14/09/2026 14:30',
    isRead: false,
    link: '/app/tasks'
  },
  {
    id: 'notif-2',
    title: '💎 Thưởng 200 Gems hoàn thành công việc',
    message: 'Task "Tối ưu Core Web Vitals cho Landing Page Gen 4.0" đã được duyệt thành công.',
    type: 'gems',
    priority: 'normal',
    targetScope: 'web',
    senderName: 'Lê Hoàng Long',
    senderRole: 'Web Lead',
    createdAt: '14/09/2026 11:15',
    isRead: false,
    link: '/app/gems'
  },
  {
    id: 'notif-3',
    title: 'Sự kiện mở đăng ký: Showcase & Awarding Day',
    message: 'Sự kiện AI Riser Vietnam đã mở đăng ký vé Bevy cho toàn thể thành viên và sinh viên FPTU.',
    type: 'event',
    priority: 'urgent',
    targetScope: 'all',
    senderName: 'Đặng Mai Phương',
    senderRole: 'Chapter Lead',
    createdAt: '13/09/2026 09:00',
    isRead: true,
    link: '/app/events'
  },
  {
    id: 'notif-4',
    title: 'Họp giao ban toàn CLB giữa kỳ Fall 2026',
    message: 'Tất cả thành viên 6 ban tham dự họp trực tuyến qua Google Meet vào lúc 20:00 ngày 25/09/2026.',
    type: 'broadcast',
    priority: 'urgent',
    targetScope: 'all',
    senderName: 'Đặng Mai Phương',
    senderRole: 'Chapter Lead',
    createdAt: '12/09/2026 16:45',
    isRead: true,
  }
];

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: INITIAL_NOTIFICATIONS,

  addNotification: (notif) => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const createdAt = `${d}/${m}/${y} ${hh}:${mm}`;

    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt,
      isRead: false,
    };

    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },

  markAsRead: (id: string) => {
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

  deleteNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
