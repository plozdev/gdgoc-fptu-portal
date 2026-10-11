import React from 'react';
import { X, ExternalLink } from 'lucide-react';
interface JoinModalProps { isOpen: boolean; onClose: () => void; defaultDepartment?: string; }
export const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose, defaultDepartment }) => {
  if (!isOpen) return null;
  const configuredUrl = import.meta.env.VITE_RECRUITMENT_URL;
  let recruitmentUrl: string | undefined;
  try { const url = new URL(configuredUrl); if (url.protocol === 'https:' && ['forms.gle', 'docs.google.com'].includes(url.hostname)) recruitmentUrl = url.href; } catch { /* No recruitment form configured. */ }
  return <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Đăng ký thành viên" className="w-full max-w-lg p-6 bg-white border-2 border-slate-900 rounded-3xl space-y-5">
      <div className="flex justify-between items-center"><h3 className="text-xl font-extrabold">Gia nhập GDG on Campus FPTU HCMC</h3><button onClick={onClose} aria-label="Đóng"><X /></button></div>
      {defaultDepartment && <p className="text-sm text-slate-500">Ban quan tâm: {defaultDepartment}</p>}
      {recruitmentUrl ? <><p>Hoàn tất hồ sơ trên biểu mẫu tuyển thành viên của CLB.</p><a href={recruitmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full font-bold">Mở biểu mẫu đăng ký<ExternalLink className="w-4 h-4" /></a></> : <p className="text-slate-600">CLB chưa mở biểu mẫu tuyển thành viên. Vui lòng theo dõi thông báo tuyển dụng.</p>}
    </div>
  </div>;
};
