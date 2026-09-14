import React, { useState } from 'react';
import { mockUsers } from '../../mocks/fixtures/users';
import { useAuthStore } from '../../store/useAuthStore';
import { UserCircle2, Shield, Cpu, Palette, Users, X, Check } from 'lucide-react';

export const DevUserSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user: currentUser, setUser } = useAuthStore();

  // Chỉ hiển thị trong môi trường DEV
  if (!import.meta.env.DEV) return null;

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });
      if (res.ok) {
        const switchedUser = await res.json();
        setUser(switchedUser);
        setIsOpen(false);
      }
    } catch (e) {
      console.error('Failed to switch user in mock', e);
    }
  };

  const adminUsers = mockUsers.filter(u => u.tier === 'ORG_ADMIN');
  const techLeadUsers = mockUsers.filter(u => u.tier === 'BAN_LEAD' && ['ai', 'cloud', 'web', 'research'].includes(u.banId || ''));
  const nonTechLeadUsers = mockUsers.filter(u => u.tier === 'BAN_LEAD' && ['media', 'hr-event'].includes(u.banId || ''));
  const memberUsers = mockUsers.filter(u => u.tier === 'BAN_MEMBER');

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-2xl border-2 border-[#1E1E1E] w-84 max-h-[500px] overflow-y-auto p-3.5 space-y-3 custom-scrollbar brutal-shadow">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Dev User Switcher</div>
              <p className="text-[10px] text-slate-500">Đổi vai trò để test phân quyền RBAC</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current User Info */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Đang đăng nhập:</span>
            <span className="font-bold text-blue-600 truncate block">{currentUser?.name || 'Chưa đăng nhập'}</span>
            <span className="text-[10px] text-slate-500 font-mono-code">{currentUser?.tier} {currentUser?.banId ? `(${currentUser.banId})` : ''}</span>
          </div>

          {/* GROUP 1: BAN CHỦ NHIỆM */}
          <div>
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Ban Chủ Nhiệm (ORG_ADMIN)</span>
            </div>
            <div className="space-y-1">
              {adminUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(user.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    currentUser?.id === user.id ? 'bg-red-50 text-red-900 border border-red-200 font-bold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{user.name}</span>
                  {currentUser?.id === user.id && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* GROUP 2: KHỐI TECH (4 LEADS NGANG HÀNG) */}
          <div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>Khối Tech • 4 Trưởng Ban (BAN_LEAD)</span>
            </div>
            <div className="space-y-1">
              {techLeadUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(user.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    currentUser?.id === user.id ? 'bg-blue-50 text-blue-900 border border-blue-200 font-bold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{user.name}</span>
                  {currentUser?.id === user.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* GROUP 3: KHỐI NON-TECH (2 LEADS NGANG HÀNG) */}
          <div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Palette className="w-3 h-3" />
              <span>Khối Non-Tech • 2 Trưởng Ban (BAN_LEAD)</span>
            </div>
            <div className="space-y-1">
              {nonTechLeadUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(user.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    currentUser?.id === user.id ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{user.name}</span>
                  {currentUser?.id === user.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* GROUP 4: THÀNH VIÊN CÁC BAN */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Thành Viên 6 Ban (BAN_MEMBER)</span>
            </div>
            <div className="space-y-1">
              {memberUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(user.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    currentUser?.id === user.id ? 'bg-slate-200 text-slate-900 font-bold' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="truncate">{user.name}</span>
                  {currentUser?.id === user.id && <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1E1E1E] hover:bg-slate-800 text-white rounded-full p-3 shadow-xl flex items-center justify-center transition-all hover:scale-105 border-2 border-white cursor-pointer group"
        title="Chuyển đổi vai trò Dev (RBAC Switcher)"
      >
        <UserCircle2 className="w-6 h-6 text-[#4285F4] group-hover:text-blue-300 transition-colors" />
      </button>
    </div>
  );
};
