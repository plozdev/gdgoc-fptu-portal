import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useGenerationStore } from '../store/useGenerationStore';
import { GdgLogo } from '../components/GdgLogo';
import { ArrowLeft, ArrowRight, Lock, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('lead@gdgfptu.dev');
  const [password, setPassword] = useState('GDGoC@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const { currentGen, currentSemester } = useGenerationStore();
  const navigate = useNavigate();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login({
        email: email.trim(),
        password: password.trim(),
      });
      navigate('/app');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Email hoặc mật khẩu không chính xác. Vui lòng thử lại!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('GDGoC@2026');
    setError('');
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
          {currentSemester ? `Niên khóa ${currentSemester}` : 'Niên khóa'} • {currentGen}
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

          {/* Direct Email & Password Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Tài Khoản
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ví dụ: lead@gdgfptu.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4285F4] focus:bg-white font-medium text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mật khẩu đăng nhập"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4285F4] focus:bg-white font-medium text-sm transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-sm rounded-xl border-[2px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
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

          {/* Quick Presets Fill for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Điền Nhanh Tài Khoản Test (Mật khẩu: <code className="text-blue-600 lowercase bg-blue-50 px-1 py-0.5 rounded font-mono font-bold">GDGoC@2026</code>)</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillPreset('lead@gdgfptu.dev')}
                className="text-left px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-red-900 block truncate">👑 Chapter Lead</span>
                <span className="text-[10px] text-red-600 font-mono truncate block">lead@gdgfptu.dev</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillPreset('web.lead@gdgfptu.dev')}
                className="text-left px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-blue-900 block truncate">⚡ Web Lead</span>
                <span className="text-[10px] text-blue-600 font-mono truncate block">web.lead@gdgfptu.dev</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillPreset('hr.lead@gdgfptu.dev')}
                className="text-left px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-purple-900 block truncate">🎯 HR Lead</span>
                <span className="text-[10px] text-purple-600 font-mono truncate block">hr.lead@gdgfptu.dev</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillPreset('member.web@gdgfptu.dev')}
                className="text-left px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-emerald-900 block truncate">💻 Member Web</span>
                <span className="text-[10px] text-emerald-600 font-mono truncate block">member.web@gdgfptu.dev</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillPreset('member.ai@gdgfptu.dev')}
                className="text-left px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-cyan-900 block truncate">🤖 Member AI</span>
                <span className="text-[10px] text-cyan-600 font-mono truncate block">member.ai@gdgfptu.dev</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillPreset('advisor@gdgfptu.dev')}
                className="text-left px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-amber-900 block truncate">🎓 Cố Vấn CLB</span>
                <span className="text-[10px] text-amber-600 font-mono truncate block">advisor@gdgfptu.dev</span>
              </button>
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
