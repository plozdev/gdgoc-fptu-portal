import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { GdgLogo } from '../components/GdgLogo';
import { ArrowLeft, ArrowRight, Shield, Sparkles, CheckCircle2, Lock, Users, Cpu, Palette } from 'lucide-react';
import { mockUsers, BAN_NAMES } from '../mocks/fixtures/users';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const performLogin = async (targetEmail: string) => {
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      if (!res.ok) {
        throw new Error('Email không tồn tại trong danh sách thành viên');
      }

      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const user = await meRes.json();
        setUser(user);
        navigate('/app');
      } else {
        throw new Error('Không thể đồng bộ phiên làm việc');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    performLogin(email.trim());
  };

  // Group mock users for fast testing
  const adminUsers = mockUsers.filter(u => u.tier === 'ORG_ADMIN');
  const techLeadUsers = mockUsers.filter(u => u.tier === 'BAN_LEAD' && ['ai', 'cloud', 'web', 'research'].includes(u.banId || ''));
  const nonTechLeadUsers = mockUsers.filter(u => u.tier === 'BAN_LEAD' && ['media', 'hr-event'].includes(u.banId || ''));
  const memberUsers = mockUsers.filter(u => u.tier === 'BAN_MEMBER');

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#C3ECF6]">
      {/* Top Brand Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl flex items-center justify-between mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1E1E1E] hover:text-[#4285F4] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/80 border border-transparent hover:border-[#1E1E1E]/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Trang Chủ</span>
        </Link>
        <span className="text-xs font-mono-code font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
          Niên khóa 2025 - 2026 • Gen 4.0
        </span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl bg-white rounded-2xl shadow-xl border-[2.5px] border-[#1E1E1E] overflow-hidden brutal-shadow">
        {/* Google 4-color Top Accent Line */}
        <div className="h-2 w-full flex">
          <div className="flex-1 bg-[#4285F4]"></div>
          <div className="flex-1 bg-[#EA4335]"></div>
          <div className="flex-1 bg-[#FBBC04]"></div>
          <div className="flex-1 bg-[#34A853]"></div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Header Lockup */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <GdgLogo size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
              Cổng Thành Viên <span className="text-[#4285F4]">GDGoC-OS</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Hệ sinh thái điều hành nội bộ GDG on Campus Đại học FPT TP.HCM
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Direct Email Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Sinh Viên FPT (@fpt.edu.vn)
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ví dụ: lead@fpt.edu.vn hoặc ban.lead@fpt.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4285F4] focus:bg-white font-medium text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-sm rounded-xl border-[2px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang xác thực thông tin...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Vào Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Fast RBAC Role Picker */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" />
                Chọn nhanh vai trò mẫu (1-Click Login)
              </span>
              <span className="text-[11px] text-slate-400 font-mono-code">Dành cho DEV / Test</span>
            </div>

            <div className="space-y-3.5">
              {/* Ban Chủ Nhiệm */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#EA4335]" />
                  Ban Chủ Nhiệm (ORG_ADMIN - Toàn quyền)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {adminUsers.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => { setEmail(u.email); performLogin(u.email); }}
                      className="text-left px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-800 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold truncate group-hover:text-amber-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono-code truncate">{u.email}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#EA4335] text-white">
                        Admin
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Khối Tech: 4 Leads Ngang Hàng */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-[#4285F4]" />
                  Khối Tech • 4 Trưởng Ban Ngang Hàng (BAN_LEAD)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {techLeadUsers.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => { setEmail(u.email); performLogin(u.email); }}
                      className="text-left p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200 text-slate-800 transition-all cursor-pointer group"
                    >
                      <p className="text-xs font-bold text-blue-900 truncate">{u.name.replace(/\(.*\)/, '')}</p>
                      <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white uppercase">
                        Lead {u.banId}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Khối Non-Tech: 2 Leads Ngang Hàng */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-[#34A853]" />
                  Khối Non-Tech • 2 Trưởng Ban Ngang Hàng (BAN_LEAD)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {nonTechLeadUsers.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => { setEmail(u.email); performLogin(u.email); }}
                      className="text-left px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-slate-800 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-emerald-950 truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono-code truncate">{u.email}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#34A853] text-white">
                        Lead
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Thành Viên Các Ban */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-600" />
                  Thành Viên Các Ban (BAN_MEMBER)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {memberUsers.slice(0, 6).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => { setEmail(u.email); performLogin(u.email); }}
                      className="text-left p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 transition-all cursor-pointer group"
                    >
                      <p className="text-[11px] font-bold truncate text-slate-800">{u.name.replace(/\(.*\)/, '')}</p>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase">
                        Member {u.banId}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Chỉ thành viên nội bộ GDG on Campus FPTU HCMC mới được cấp quyền truy cập.</span>
        </div>
      </div>
    </div>
  );
};
