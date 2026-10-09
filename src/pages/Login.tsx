import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { GdgLogo } from '../components/GdgLogo';
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const performLogin = async (targetEmail: string, targetPass: string) => {
    setIsSubmitting(true);
    setError('');

    try {
      await login({ email: targetEmail, password: targetPass });
      navigate('/app');
    } catch (err: any) {
      if (
        err?.statusCode === 401 ||
        err?.message === 'Invalid credentials' ||
        err?.message?.toLowerCase().includes('credential') ||
        err?.message?.toLowerCase().includes('invalid')
      ) {
        setError('Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      } else if (err?.statusCode === 400) {
        setError('Email hoặc mật khẩu không đúng định dạng quy định.');
      } else if (
        err?.statusCode === 502 ||
        err?.statusCode === 503 ||
        err?.statusCode === 504 ||
        err?.message?.includes('504') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.message?.includes('ECONNREFUSED')
      ) {
        setError('Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng kiểm tra xem Backend đã được khởi chạy chưa!');
      } else {
        setError(err?.message || 'Đăng nhập không thành công. Vui lòng thử lại!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!email.trim() || !password) return;
    performLogin(email.trim(), password);
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
              Đăng nhập tài khoản nội bộ GDG on Campus Đại học FPT TP.HCM
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Direct Login Form */}
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
                  placeholder="ví dụ: lead@fpt.edu.vn"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4285F4] focus:bg-white font-medium text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mật Khẩu
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu tài khoản"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-4 py-3 pr-11 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4285F4] focus:bg-white font-medium text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-sm rounded-xl border-[2px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang xác thực với Backend...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Vào Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Hệ thống phân quyền RBAC được bảo vệ bởi phiên HttpOnly Cookie từ Backend.</span>
        </div>
      </div>
    </div>
  );
};
