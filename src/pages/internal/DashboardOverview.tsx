import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useMemberStore } from '../../store/useMemberStore';
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  Award, 
  Sparkles,
  ArrowRight,
  FolderGit2,
  Loader2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { BAN_NAMES, BanId } from '../../types/auth.types';
import { tasksApi, eventsApi, gemsApi } from '../../api';
import { Link } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { members, activeGenLabel, fetchMembers } = useMemberStore();
  const isOrgAdmin = user?.tier === 'ORG_ADMIN';

  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [topMembers, setTopMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [tasksRes, eventsRes, gemsRes] = await Promise.allSettled([
          tasksApi.getTasks({ limit: 100 }),
          eventsApi.getEvents(),
          gemsApi.getLeaderboard({ limit: 5 }),
        ]);

        if (tasksRes.status === 'fulfilled') {
          const raw = (tasksRes.value as any)?.items || (Array.isArray(tasksRes.value) ? tasksRes.value : []);
          setTasks(raw);
        }

        if (eventsRes.status === 'fulfilled') {
          const raw = (eventsRes.value as any)?.items || (Array.isArray(eventsRes.value) ? eventsRes.value : []);
          setEvents(raw);
        }

        if (gemsRes.status === 'fulfilled') {
          const raw = (gemsRes.value as any)?.rankings || (gemsRes.value as any)?.items || (Array.isArray(gemsRes.value) ? gemsRes.value : []);
          setTopMembers(raw);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchMembers]);

  const activeMembersCount = members.filter((m) => m.status === 'ACTIVE').length;
  const runningTasksCount = tasks.filter((t) => t.status !== 'DONE').length;
  const reviewTasksCount = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const totalGemsEarned = tasks
    .filter((t) => t.status === 'DONE')
    .reduce((sum, t) => sum + (Number(t.gemsReward) || 0), 0);

  const upcomingEvents = events.filter((e) => {
    if (!e.startTime) return true;
    return new Date(e.startTime) >= new Date();
  });

  const BAN_CONFIGS = [
    { id: 'ai' as BanId, name: 'Ban Trí Tuệ Nhân Tạo (AI)', division: 'Khối Tech', color: 'border-l-amber-400' },
    { id: 'cloud' as BanId, name: 'Ban Điện Toán Đám Mây (Cloud)', division: 'Khối Tech', color: 'border-l-blue-500' },
    { id: 'web' as BanId, name: 'Ban Phát Triển Web', division: 'Khối Tech', color: 'border-l-emerald-500' },
    { id: 'research' as BanId, name: 'Ban Nghiên Cứu (Research)', division: 'Khối Tech', color: 'border-l-red-500' },
    { id: 'media' as BanId, name: 'Ban Truyền Thông & Media', division: 'Khối Non-Tech', color: 'border-l-pink-500' },
    { id: 'hr-event' as BanId, name: 'Ban Nhân Sự & Sự Kiện', division: 'Khối Non-Tech', color: 'border-l-teal-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              GDGoC-OS • {activeGenLabel}
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300 font-mono-code">Hệ Thống Vận Hành Trung Tâm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {isOrgAdmin
              ? 'Bạn đang đăng nhập với quyền Ban Chủ Nhiệm (Toàn quyền hệ thống). Bạn có thể giám sát tiến độ toàn bộ 6 ban và quản trị niên khóa.'
              : `Không gian làm việc ${user?.banName || 'Ban chuyên môn'} • Cùng kết nối và hoàn thành các mục tiêu trong kỳ!`
            }
          </p>
        </div>
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
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
              <span className="text-emerald-600 font-bold">Thành viên nòng cốt & Ban</span>
            ) : (
              <span className="text-slate-400">Chưa có dữ liệu thành viên</span>
            )}
          </p>
        </div>

        {/* Running Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Task Đang Thực Hiện</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{runningTasksCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {reviewTasksCount > 0 ? (
              <span className="text-amber-600 font-bold">{reviewTasksCount} task chờ duyệt nghiệm thu</span>
            ) : (
              <span className="text-slate-400">Tiến độ ổn định</span>
            )}
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sự Kiện Sắp Tới</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{upcomingEvents.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            <span className="text-purple-600 font-bold">{events.length} sự kiện trong kỳ</span>
          </p>
        </div>

        {/* Total Gems */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gems Đã Quyết Toán</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{totalGemsEarned.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-emerald-600 font-bold">Điểm thưởng cống hiến</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Left Ban Status & Right Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 6 Ban Overview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-blue-600" />
              Tình Hình Hoạt Động Các Ban Chuyên Môn
            </h2>
            <Link
              to="/app/tasks"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              Xem Kanban Board <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BAN_CONFIGS.map((ban) => {
              const banMembers = members.filter((m) => m.banId === ban.id);
              const banTasks = tasks.filter((t) => {
                const deptCode = t.department?.code;
                if (deptCode === 'TECH_AI' && ban.id === 'ai') return true;
                if (deptCode === 'TECH_CLOUD' && ban.id === 'cloud') return true;
                if (deptCode === 'TECH_WEB' && ban.id === 'web') return true;
                if (deptCode === 'TECH_RESEARCH' && ban.id === 'research') return true;
                if (deptCode === 'MEDIA' && ban.id === 'media') return true;
                if (deptCode === 'HR_EVENT' && ban.id === 'hr-event') return true;
                return false;
              });

              const banDoneTasks = banTasks.filter((t) => t.status === 'DONE').length;

              return (
                <div
                  key={ban.id}
                  className={`bg-white p-4 rounded-xl border border-slate-200 border-l-4 ${ban.color} shadow-xs space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {ban.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {ban.division}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-bold">Thành Viên</span>
                      <span className="font-extrabold text-slate-800">{banMembers.length} người</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-bold">Tiến Độ Tasks</span>
                      <span className="font-extrabold text-slate-800">
                        {banDoneTasks}/{banTasks.length} Done
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Top Gems Leaderboard & Next Events (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Top Leaderboard Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Top Cống Hiến (Gems)
              </h3>
              <Link to="/app/gems" className="text-[11px] font-bold text-blue-600 hover:underline">
                Tất cả
              </Link>
            </div>

            {topMembers.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Chưa có dữ liệu bảng xếp hạng</p>
            ) : (
              <div className="space-y-2.5">
                {topMembers.slice(0, 4).map((item, idx) => (
                  <div key={item.userId || item.user?.id || idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 truncate block">
                          {item.fullName || item.user?.fullName || item.user?.name || 'Thành viên'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {item.departmentName || item.department?.name || 'Thành viên'}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-blue-600 shrink-0 ml-2">
                      {item.gemsBalance ?? item.user?.gemsBalance ?? item.totalGems ?? 0} Gems
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Events Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                Sự Kiện Sắp Diễn Ra
              </h3>
              <Link to="/app/events" className="text-[11px] font-bold text-blue-600 hover:underline">
                Chi tiết
              </Link>
            </div>

            {events.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Chưa có sự kiện nào sắp tới</p>
            ) : (
              <div className="space-y-2.5">
                {events.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <span className="font-bold text-slate-900 line-clamp-1">{ev.title}</span>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{ev.location || 'FPTU HCMC'}</span>
                      <span className="font-bold text-purple-600">{ev.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
