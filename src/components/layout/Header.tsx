import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ExternalLink, ChevronRight, Lock, Sliders, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGenerationStore } from '../../store/useGenerationStore';
import { NotificationCenter } from '../common/NotificationCenter';
import { MeetingSetupModal } from '../meetings/MeetingSetupModal';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { currentGen, currentSemester } = useGenerationStore();
  const [isMeetingModalOpen, setIsMeetingModalOpen] = React.useState(false);

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/app/settings/generation')) return 'Cấu Hình Niên Khóa & Chuyển Kỳ';
    if (pathname.includes('/app/hr')) return 'Nhân Sự & Niên Khóa';
    if (pathname.includes('/app/tasks')) return 'Bảng Công Việc (Kanban)';
    if (pathname.includes('/app/landing-cms')) return 'Quản Trị Hiển Thị Landing Page';
    if (pathname.includes('/app/events')) return 'Sự Kiện & Đóng Góp';
    if (pathname.includes('/app/assets')) return 'Smart Asset Hub (Google Drive)';
    if (pathname.includes('/app/inventory')) return 'Quản Lý Vật Tư & Quà Tặng';
    if (pathname.includes('/app/gems')) return 'Điểm Thưởng & Bảng Xếp Hạng';
    if (pathname.includes('/app/profile')) return 'Hồ Sơ Cá Nhân';
    if (pathname.includes('/app/members/')) return 'Hồ Sơ Thành Viên';
    return 'Bảng Tổng Quan (Dashboard)';
  };

  const isOrgAdmin = !user?.readOnly && user?.tier === 'ORG_ADMIN';
  const canDispatchMeeting = !user?.readOnly && (user?.tier === 'ORG_ADMIN' || user?.tier === 'BAN_LEAD' || user?.tier === 'ADVISOR');

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-xs select-none shrink-0">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 font-mono-code">GDGoC FPTU OS</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <h1 key={location.pathname} className="text-sm font-extrabold text-slate-800 tracking-tight animate-fadeIn">
          {getPageTitle(location.pathname)}
        </h1>
      </div>
      
      {/* Right Action & Indicators */}
      <div className="flex items-center gap-3">
        {/* Generation Status Badge */}
        {isOrgAdmin ? (
          <Link
            to="/app/settings/generation"
            title="Xem và cấu hình niên khóa"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{currentGen} • {currentSemester}</span>
            <span className="text-[10px] text-blue-600 font-bold ml-1 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 flex items-center gap-0.5">
              <Sliders className="w-2.5 h-2.5" />
              <span>Cấu hình</span>
            </span>
          </Link>
        ) : (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 select-none cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{currentGen} • {currentSemester}</span>
          </div>
        )}

        {/* Meeting Dispatcher for Leaders */}
        {canDispatchMeeting && (
          <button
            type="button"
            onClick={() => setIsMeetingModalOpen(true)}
            title="Thiết lập lịch họp nhanh và phát lời mời tới thành viên CLB"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lên Lịch Họp</span>
            <span className="sm:hidden">Họp</span>
          </button>
        )}

        {/* View Public Site */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#4285F4] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Xem Trang Khách</span>
        </Link>

        {/* Real-time Notifications Center */}
        <NotificationCenter />
      </div>

      {/* Meeting Setup Modal */}
      {isMeetingModalOpen && (
        <MeetingSetupModal
          isOpen={isMeetingModalOpen}
          onClose={() => setIsMeetingModalOpen(false)}
        />
      )}
    </header>
  );
};
