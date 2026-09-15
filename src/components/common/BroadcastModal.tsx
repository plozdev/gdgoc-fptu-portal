import React, { useState } from 'react';
import { Megaphone, X, Send, AlertTriangle, Sparkles, Layers, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore, NotificationType, NotificationPriority } from '../../store/useNotificationStore';
import { BAN_NAMES, BanId } from '../../mocks/fixtures/users';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const isOrgAdmin = user?.tier === 'ORG_ADMIN';

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('broadcast');
  const [priority, setPriority] = useState<NotificationPriority>('important');
  // Nếu là Lead chỉ được gửi cho Ban của mình hoặc All (nếu OrgAdmin)
  const [targetScope, setTargetScope] = useState<'all' | BanId>(
    isOrgAdmin ? 'all' : (user?.banId as BanId) || 'ai'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addNotification({
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      targetScope,
      senderName: user?.name || 'Ban Điều Hành',
      senderRole: isOrgAdmin ? 'Chapter Lead' : `Trưởng Ban ${user?.banId?.toUpperCase() || ''}`,
    });

    onClose();
    setTitle('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-lg w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Phát Thông Báo Mới
              </h3>
              <p className="text-[11px] text-slate-500">
                Gửi thông báo trực tiếp đến chuông thông báo của thành viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tiêu đề */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tiêu đề thông báo *
          </label>
          <input
            type="text"
            required
            placeholder="VD: Nhắc lịch nộp tài liệu RAG trước 18h..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Nội dung */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nội dung chi tiết *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Chi tiết nội dung cần truyền đạt tới thành viên..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Cấu hình: Loại thông báo & Độ ưu tiên */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phân loại
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NotificationType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="broadcast">📢 Thông Báo Chung</option>
              <option value="task">📋 Công Việc (Task)</option>
              <option value="event">🎉 Sự Kiện (Event)</option>
              <option value="system">⚙️ Hệ Thống</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mức độ ưu tiên
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NotificationPriority)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="normal">Bình thường</option>
              <option value="important">⚠️ Quan trọng</option>
              <option value="urgent">🚨 Khẩn cấp</option>
            </select>
          </div>
        </div>

        {/* Phạm vi gửi: Toàn CLB hoặc theo Ban */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Phạm vi người nhận
          </label>
          {isOrgAdmin ? (
            <select
              value={targetScope}
              onChange={(e) => setTargetScope(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="all">🌐 Toàn bộ CLB (Tất cả 6 Ban & Thành viên)</option>
              <option value="ai">🤖 Chỉ Ban Trí Tuệ Nhân Tạo (AI)</option>
              <option value="cloud">☁️ Chỉ Ban Điện Toán Đám Mây (Cloud)</option>
              <option value="web">🌐 Chỉ Ban Phát Triển Web</option>
              <option value="research">🔬 Chỉ Ban Nghiên Cứu (Research)</option>
              <option value="media">🎨 Chỉ Ban Truyền Thông & Media</option>
              <option value="hr-event">🎪 Chỉ Ban Nhân Sự & Sự Kiện (HR-Event)</option>
            </select>
          ) : (
            <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold flex items-center justify-between">
              <span>Gửi đến Ban của bạn: <strong>{user?.banName || user?.banId?.toUpperCase()}</strong></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono-code uppercase">
                {user?.banId}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Phát Thông Báo Ngay</span>
          </button>
        </div>
      </form>
    </div>
  );
};
