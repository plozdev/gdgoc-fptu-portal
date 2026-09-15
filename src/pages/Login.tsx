import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { GdgLogo } from '../components/GdgLogo';
import { ArrowLeft, ArrowRight, Shield, Info, Lock } from 'lucide-react';

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

          {/* Dev Info Panel — Backend Integration Pending */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">Backend chưa được kết nối</p>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    Hệ thống đang chạy ở chế độ development. Đăng nhập sẽ hoạt động sau khi backend API được tích hợp.
                    Dùng <span className="font-bold">DevUserSwitcher</span> (nút tròn góc phải màn hình) để inject session test RBAC.
                  </p>
                </div>
              </div>
            </div>
          )}

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
