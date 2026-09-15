/**
 * @file DevUserSwitcher.tsx
 * @description Dev-only floating panel để inject user session thủ công khi test RBAC.
 *
 * ⚠️  DEV ONLY — Component này bị ẩn hoàn toàn khi build production (import.meta.env.DEV).
 *
 * Khi backend được tích hợp:
 * - Đăng nhập thật qua form Login với tài khoản test
 * - Component này vẫn có thể dùng để inject session nhanh mà không cần gọi /api/auth/login
 *
 * Cách dùng: Điền thông tin user muốn inject và nhấn "Inject Session".
 * API: POST /api/auth/switch-user với body { userData: UserSession }
 */

import React, { useState } from 'react';
import type { UserSession, Tier, BanId } from '../../mocks/fixtures/users';
import { BAN_NAMES } from '../../mocks/fixtures/users';
import { useAuthStore } from '../../store/useAuthStore';
import { UserCircle2, X, Check, ChevronDown } from 'lucide-react';

// ==========================================
// PRESET USERS CHO DEV TESTING
// Thêm vào đây khi cần test các role cụ thể
// ==========================================
const DEV_PRESET_USERS: UserSession[] = [
  // BCN
  { id: 'dev-1', email: 'lead@fpt.edu.vn',    name: 'Chapter Lead (BCN)',     tier: 'ORG_ADMIN', banId: null,       banName: 'Ban Chủ Nhiệm' },
  { id: 'dev-2', email: 'colead@fpt.edu.vn',  name: 'Co-Chapter Lead (BCN)',  tier: 'ORG_ADMIN', banId: null,       banName: 'Ban Chủ Nhiệm' },
  // Advisor
  { id: 'dev-3', email: 'advisor@fpt.edu.vn', name: 'Giảng Viên Cố Vấn',     tier: 'ADVISOR',   banId: null,       banName: 'Cố Vấn CLB' },
  // Tech Leads
  { id: 'dev-4', email: 'ai.lead@fpt.edu.vn',       name: 'AI Lead',       tier: 'BAN_LEAD',  banId: 'ai',       banName: BAN_NAMES['ai'] },
  { id: 'dev-5', email: 'cloud.lead@fpt.edu.vn',    name: 'Cloud Lead',    tier: 'BAN_LEAD',  banId: 'cloud',    banName: BAN_NAMES['cloud'] },
  { id: 'dev-6', email: 'web.lead@fpt.edu.vn',      name: 'Web Lead',      tier: 'BAN_LEAD',  banId: 'web',      banName: BAN_NAMES['web'] },
  { id: 'dev-7', email: 'research.lead@fpt.edu.vn', name: 'Research Lead', tier: 'BAN_LEAD',  banId: 'research', banName: BAN_NAMES['research'] },
  // Non-Tech Leads
  { id: 'dev-8', email: 'media.lead@fpt.edu.vn',    name: 'Media Lead',    tier: 'BAN_LEAD',  banId: 'media',    banName: BAN_NAMES['media'] },
  { id: 'dev-9', email: 'hr.lead@fpt.edu.vn',       name: 'HR-Event Lead', tier: 'BAN_LEAD',  banId: 'hr-event', banName: BAN_NAMES['hr-event'] },
  // Members
  { id: 'dev-10', email: 'ai.member@fpt.edu.vn',     name: 'AI Member',       tier: 'BAN_MEMBER', banId: 'ai',       banName: BAN_NAMES['ai'] },
  { id: 'dev-11', email: 'cloud.member@fpt.edu.vn',  name: 'Cloud Member',    tier: 'BAN_MEMBER', banId: 'cloud',    banName: BAN_NAMES['cloud'] },
  { id: 'dev-12', email: 'web.member@fpt.edu.vn',    name: 'Web Member',      tier: 'BAN_MEMBER', banId: 'web',      banName: BAN_NAMES['web'] },
  { id: 'dev-13', email: 'hr.member@fpt.edu.vn',     name: 'HR-Event Member', tier: 'BAN_MEMBER', banId: 'hr-event', banName: BAN_NAMES['hr-event'] },
];

const TIER_COLORS: Record<Tier, string> = {
  ADVISOR:    'bg-purple-50 text-purple-900 border-purple-200',
  ORG_ADMIN:  'bg-red-50 text-red-900 border-red-200',
  BAN_LEAD:   'bg-blue-50 text-blue-900 border-blue-200',
  BAN_MEMBER: 'bg-slate-100 text-slate-900 border-slate-300',
};

const TIER_BADGE: Record<Tier, string> = {
  ADVISOR:    'bg-purple-600 text-white',
  ORG_ADMIN:  'bg-red-500 text-white',
  BAN_LEAD:   'bg-blue-600 text-white',
  BAN_MEMBER: 'bg-slate-500 text-white',
};

export const DevUserSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user: currentUser, setUser } = useAuthStore();

  // Chỉ hiển thị trong môi trường DEV
  if (!import.meta.env.DEV) return null;

  const handleSwitchUser = async (preset: UserSession) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData: preset }),
      });
      if (res.ok) {
        const switched = await res.json() as UserSession;
        setUser(switched);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('[DevUserSwitcher] Failed to switch user:', error);
      // Fallback: inject trực tiếp vào store mà không cần MSW
      setUser(preset);
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsOpen(false);
  };

  const groupedUsers = {
    'Cố Vấn & BCN': DEV_PRESET_USERS.filter((u) => u.tier === 'ADVISOR' || u.tier === 'ORG_ADMIN'),
    'Trưởng Ban (BAN_LEAD)': DEV_PRESET_USERS.filter((u) => u.tier === 'BAN_LEAD'),
    'Thành Viên (BAN_MEMBER)': DEV_PRESET_USERS.filter((u) => u.tier === 'BAN_MEMBER'),
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-2xl border-2 border-[#1E1E1E] w-80 max-h-[520px] overflow-y-auto p-3.5 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Dev User Switcher
              </div>
              <p className="text-[10px] text-slate-500">Inject session để test phân quyền RBAC</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current User */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Đang đăng nhập:</span>
            <span className="font-bold text-blue-600 truncate block">
              {currentUser?.name ?? 'Chưa đăng nhập'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {currentUser?.tier} {currentUser?.banId ? `(${currentUser.banId})` : ''}
            </span>
          </div>

          {/* Preset Groups */}
          {Object.entries(groupedUsers).map(([groupName, users]) => (
            <div key={groupName}>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {groupName}
              </div>
              <div className="space-y-1">
                {users.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSwitchUser(preset)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg border transition-colors flex items-center justify-between cursor-pointer ${
                      currentUser?.id === preset.id
                        ? TIER_COLORS[preset.tier]
                        : 'hover:bg-slate-100 text-slate-700 border-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-bold truncate block">{preset.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate block">{preset.email}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${TIER_BADGE[preset.tier]}`}>
                        {preset.banId ?? preset.tier}
                      </span>
                      {currentUser?.id === preset.id && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              Đăng xuất (Clear Session)
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1E1E1E] hover:bg-slate-800 text-white rounded-full p-3 shadow-xl flex items-center justify-center transition-all hover:scale-105 border-2 border-white cursor-pointer group"
        title="Dev RBAC Switcher"
      >
        {isOpen
          ? <ChevronDown className="w-6 h-6 text-[#4285F4]" />
          : <UserCircle2 className="w-6 h-6 text-[#4285F4] group-hover:text-blue-300 transition-colors" />
        }
      </button>
    </div>
  );
};
