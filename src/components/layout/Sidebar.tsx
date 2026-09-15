import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  FolderGit2, 
  Award, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Lock,
  Sliders,
  PackageSearch
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGenerationStore } from '../../store/useGenerationStore';
import { BAN_NAMES } from '../../mocks/fixtures/users';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { currentGen } = useGenerationStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    logout();
    navigate('/login');
  };

  const isOrgAdmin = user?.tier === 'ORG_ADMIN';
  const isBanLead = user?.tier === 'BAN_LEAD';

  // Role display label
  const getRoleBadge = () => {
    if (isOrgAdmin) {
      return {
        label: '👑 Chapter Lead',
        bg: 'bg-red-500/20 text-red-300 border-red-500/30',
      };
    }
    if (isBanLead) {
      return {
        label: `⚡ Trưởng Ban ${user?.banId?.toUpperCase() || ''}`,
        bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      };
    }
    return {
      label: `Thành Viên ${user?.banId?.toUpperCase() || ''}`,
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  };

  const roleInfo = getRoleBadge();

  return (
    <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col h-full border-r border-slate-800 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-2.5 mb-2">
          {/* Google 4-color dot icon */}
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center p-1.5 border border-slate-700">
            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
              <div className="bg-[#4285F4] rounded-xs"></div>
              <div className="bg-[#EA4335] rounded-xs"></div>
              <div className="bg-[#34A853] rounded-xs"></div>
              <div className="bg-[#FBBC04] rounded-xs"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">GDGoC-OS</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono-code">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">FPT University HCMC</p>
          </div>
        </div>

        {/* Current Generation Pill */}
        <Link
          to="/app/settings/generation"
          title="Xem & Cấu hình Niên khóa"
          className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-800 text-[11px] transition-colors"
        >
          <span className="text-slate-400">Niên khóa:</span>
          <span className="font-bold text-amber-300 flex items-center gap-1">
            {currentGen}
          </span>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {/* GROUP 1: TỔNG QUAN */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Tổng Quan
          </div>
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Bảng Tổng Quan</span>
          </NavLink>
        </div>

        {/* GROUP 2: VẬN HÀNH & NHÂN SỰ */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Vận Hành & Nhân Sự
          </div>
          <div className="space-y-1">
            {/* 🚨 CRITICAL USER CONSTRAINT: Only ORG_ADMIN can see and access HR Management! */}
            {isOrgAdmin ? (
              <NavLink
                to="/app/hr"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Nhân Sự & Niên Khóa</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-mono-code">
                  Admin
                </span>
              </NavLink>
            ) : null}

            {/* Cấu Hình Niên Khóa & Chuyển Kỳ (Tất cả có thể xem, chỉ Admin mới đổi) */}
            <NavLink
              to="/app/settings/generation"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Cấu Hình Niên Khóa</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono-code">
                Config
              </span>
            </NavLink>

            {/* Task Kanban Board */}
            <NavLink
              to="/app/tasks"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Bảng Công Việc</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono-code">
                Kanban
              </span>
            </NavLink>

            {/* Landing Page CMS (Chỉ dành cho Ban Chủ Nhiệm và Trưởng Ban) */}
            {(isOrgAdmin || isBanLead) && (
              <NavLink
                to="/app/landing-cms"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Quản Trị Landing Page</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono-code">
                  CMS
                </span>
              </NavLink>
            )}
          </div>
        </div>

        {/* GROUP 3: HOẠT ĐỘNG & TÀI NGUYÊN */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Hoạt Động & Tài Nguyên
          </div>
          <div className="space-y-1">
            <NavLink
              to="/app/events"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Sự Kiện & Điểm Danh</span>
            </NavLink>

            <NavLink
              to="/app/assets"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <FolderGit2 className="w-4 h-4 text-amber-400" />
                <span>Smart Asset Hub</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono-code">
                Drive
              </span>
            </NavLink>

            {/* Quản lý Vật tư & Quà tặng (Chỉ dành riêng cho Ban Chủ Nhiệm: Chapter Lead & Co-Chapter Lead) */}
            {isOrgAdmin && (
              <NavLink
                to="/app/inventory"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <PackageSearch className="w-4 h-4 text-pink-400" />
                  <span>Quản Lý Vật Tư</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono-code">
                  Items
                </span>
              </NavLink>
            )}

            <NavLink
              to="/app/gems"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Điểm Thưởng & BXH</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-mono-code">
                Gems
              </span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Footer User Info & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        {/* User Profile Card */}
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-2.5">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono-code">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleInfo.bg} truncate`}>
              {roleInfo.label}
            </span>
            {user?.banId && (
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {user.banId}
              </span>
            )}
          </div>
        </div>

        {/* Action Link & Logout */}
        <div className="flex items-center gap-1.5">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Trang Chủ</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
