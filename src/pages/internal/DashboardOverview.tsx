import React, { useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useMemberStore } from '../../store/useMemberStore';
import { useLandingContentStore } from '../../store/useLandingContentStore';
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  Award, 
  Sparkles,
  ArrowRight,
  FolderGit2
} from 'lucide-react';
import { BAN_NAMES, BanId } from '../../mocks/fixtures/users';

interface StoredTask {
  id: string;
  banId: string;
  status: string;
  gems: number;
}

export const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { members } = useMemberStore();
  const { events } = useLandingContentStore();
  const isOrgAdmin = user?.tier === 'ORG_ADMIN';

  // Read actual tasks from storage
  const tasks: StoredTask[] = useMemo(() => {
    try {
      const raw = localStorage.getItem('gdgoc_tasks_v2');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;
  const runningTasksCount = tasks.filter(t => t.status !== 'done').length;
  const reviewTasksCount = tasks.filter(t => t.status === 'review').length;
  const totalGemsEarned = tasks
    .filter(t => t.status === 'done')
    .reduce((sum, t) => sum + (Number(t.gems) || 0), 0);

  const upcomingEvents = events.filter(e => e.status !== 'Completed');

  const BAN_CONFIGS = [
    { id: 'ai' as BanId, name: 'Ban Trí Tuệ Nhân Tạo (AI)', division: 'Khối Tech', defaultLead: 'Trần Nguyên Bảo', color: 'border-l-amber-400' },
    { id: 'cloud' as BanId, name: 'Ban Điện Toán Đám Mây (Cloud)', division: 'Khối Tech', defaultLead: 'Hoàng Minh Tuấn', color: 'border-l-blue-500' },
    { id: 'web' as BanId, name: 'Ban Phát Triển Web', division: 'Khối Tech', defaultLead: 'Lê Hoàng Long', color: 'border-l-emerald-500' },
    { id: 'research' as BanId, name: 'Ban Nghiên Cứu (Research)', division: 'Khối Tech', defaultLead: 'Phạm Quốc Anh', color: 'border-l-red-500' },
    { id: 'media' as BanId, name: 'Ban Truyền Thông & Media', division: 'Khối Non-Tech', defaultLead: 'Vũ Thị Lan Hương', color: 'border-l-pink-500' },
    { id: 'hr-event' as BanId, name: 'Ban Nhân Sự & Sự Kiện', division: 'Khối Non-Tech', defaultLead: 'Bùi Đức Thịnh', color: 'border-l-teal-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              GDGoC-OS • Gen 4.0
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300 font-mono-code">Kỳ Fall 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {isOrgAdmin 
              ? 'Bạn đang đăng nhập với quyền Ban Chủ Nhiệm (Toàn quyền hệ thống). Bạn có thể xem toàn bộ 6 ban và đổi niên khóa.'
              : `Không gian làm việc ${user?.banName || 'Ban chuyên môn'} • Cùng kết nối và hoàn thành các mục tiêu trong kỳ!`
            }
          </p>
        </div>
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Nhân Sự Active</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{activeMembersCount}</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            {activeMembersCount > 0 ? (
              <span className="text-emerald-600 font-bold">Đã phân ban hoạt động</span>
            ) : (
              <span className="text-slate-400">Chưa có thành viên nào trong danh bạ</span>
            )}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Nhiệm Vụ Đang Chạy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{runningTasksCount} Tasks</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-amber-600 font-bold">{reviewTasksCount} tasks</span> đang chờ duyệt kết quả
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sự Kiện Trọng Điểm</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{upcomingEvents.length} Events</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
            {upcomingEvents.length > 0 ? (
              <span>Gần nhất: <strong className="text-slate-700">{upcomingEvents[0].title}</strong></span>
            ) : (
              <span className="text-slate-400">Chưa có lịch sự kiện kỳ Fall 2026</span>
            )}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Quỹ Gems Tích Lũy</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{totalGemsEarned} 💎</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">Từ các task hoàn thành</span>
          </p>
        </div>
      </div>

      {/* 6 Ban Chuyên Môn Status Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-800">Tiến Độ Vận Hành 6 Ban Chuyên Môn</h2>
            <p className="text-xs text-slate-500">Bao gồm 4 Ban Khối Tech & 2 Ban Khối Non-Tech đồng cấp trong kỳ Fall 2026</p>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono-code">6 Departments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {BAN_CONFIGS.map((ban) => {
            const isUserBan = user?.banId === ban.id;
            const banMembersCount = members.filter(m => m.banId === ban.id && m.status === 'ACTIVE').length;
            const banTasksCount = tasks.filter(t => t.banId === ban.id && t.status !== 'done').length;
            const designatedLead = members.find(m => m.banId === ban.id && m.tier === 'BAN_LEAD')?.name || ban.defaultLead;

            return (
              <div 
                key={ban.id} 
                className={`p-4 rounded-xl border-l-4 ${ban.color} border border-slate-200 hover:border-slate-300 transition-all ${
                  isUserBan ? 'bg-blue-50/40 ring-1 ring-blue-300' : 'bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 uppercase">
                    {ban.division}
                  </span>
                  {isUserBan && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      Ban của bạn
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 truncate mb-1">{ban.name}</h3>
                <p className="text-xs text-slate-600 mb-3">Trưởng Ban: <span className="font-semibold text-slate-800">{designatedLead}</span></p>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <span>{banMembersCount} thành viên</span>
                  <span className="font-semibold text-slate-800">{banTasksCount} tasks đang chạy</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
