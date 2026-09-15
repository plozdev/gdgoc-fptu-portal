import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Plus, 
  Megaphone, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Award, 
  Sparkles,
  Layers,
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore, AppNotification } from '../../store/useNotificationStore';
import { BroadcastModal } from './BroadcastModal';

export const NotificationCenter: React.FC = () => {
  const { user } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isOrgAdmin = user?.tier === 'ORG_ADMIN';
  const isLead = user?.tier === 'BAN_LEAD' || isOrgAdmin;

  // Lọc thông báo phù hợp với role và ban của user:
  // - Org Admin: thấy tất cả
  // - Thành viên / Trưởng ban: thấy 'all' + banId của mình
  const visibleNotifications = notifications.filter((notif) => {
    if (isOrgAdmin) return true;
    return notif.targetScope === 'all' || notif.targetScope === user?.banId;
  });

  const unreadCount = visibleNotifications.filter((n) => !n.isRead).length;

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (notif: AppNotification) => {
    switch (notif.type) {
      case 'task':
        return <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>;
      case 'event':
        return <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5" /></div>;
      case 'gems':
        return <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5" /></div>;
      case 'broadcast':
        return <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0"><Megaphone className="w-3.5 h-3.5" /></div>;
      default:
        return <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><Sparkles className="w-3.5 h-3.5" /></div>;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        title="Thông báo hệ thống"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-500 hover:text-slate-800 relative p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white ring-2 ring-white font-mono-code animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-slate-900">
                Thông Báo Nội Bộ
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 text-[10px] font-bold font-mono-code">
                  {unreadCount} mới
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đã đọc hết</span>
                </button>
              )}

              {/* Broadcast Button (only for BCN / Lead) */}
              {isLead && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowBroadcastModal(true);
                  }}
                  className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Phát thông báo mới cho ban/CLB"
                >
                  <Plus className="w-3 h-3" />
                  <span>Phát Tin</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List (Hiển thị tất cả, tin đã đọc làm xám mờ lại) */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {visibleNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-medium">Không có thông báo nào</p>
              </div>
            ) : (
              visibleNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  title={notif.isRead ? 'Đã đọc' : 'Nhấp để đánh dấu đã đọc'}
                  className={`p-3 transition-all cursor-pointer flex items-start gap-2.5 ${
                    notif.isRead
                      ? 'opacity-40 bg-slate-50/70 hover:opacity-75 grayscale'
                      : 'bg-white hover:bg-blue-50/30'
                  }`}
                >
                  {getNotificationIcon(notif)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className={`text-xs leading-snug truncate ${
                        !notif.isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-500'
                      }`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse"></span>
                      )}
                    </div>

                    <p className={`text-[11px] leading-relaxed line-clamp-2 mb-1.5 ${
                      !notif.isRead ? 'text-slate-600 font-normal' : 'text-slate-400 font-normal'
                    }`}>
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-code">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">{notif.senderRole}</span>
                        <span>•</span>
                        <span>{notif.createdAt}</span>
                      </div>

                      {notif.priority === 'urgent' && (
                        <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold uppercase text-[9px]">
                          Khẩn
                        </span>
                      )}
                    </div>

                    {notif.link && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-end">
                        <Link
                          to={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 hover:underline"
                        >
                          <span>Xem chi tiết</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center text-[10px] text-slate-400">
            Hệ thống thông báo thời gian thực GDGoC-OS
          </div>
        </div>
      )}

      {/* Broadcast Modal for BCN */}
      <BroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
      />
    </div>
  );
};
