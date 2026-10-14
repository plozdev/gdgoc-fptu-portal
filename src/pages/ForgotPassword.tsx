import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { GdgLogo } from '../components/GdgLogo';
import {
  ArrowLeft,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Lock,
} from 'lucide-react';

const COOLDOWN_KEY = 'gdgoc_forgot_cooldown_until';

export const ForgotPassword: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Persistent cooldown counter in seconds
  const [countdown, setCountdown] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(COOLDOWN_KEY);
      if (stored) {
        const remaining = Math.ceil((Number(stored) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
    } catch {}
    return 0;
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(COOLDOWN_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || countdown > 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post<{ message: string }>('/api/auth/forgot-password', {
        email: identifier.trim(),
      });

      // Set 60-second cooldown lock
      const targetUntil = Date.now() + 60_000;
      localStorage.setItem(COOLDOWN_KEY, String(targetUntil));
      setCountdown(60);

      setFeedbackMessage(
        response?.message ||
          'Nếu tài khoản tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.',
      );
      setIsSubmitted(true);
    } catch (err: any) {
      if (err?.statusCode === 429) {
        setError(err?.message || 'Bạn vừa gửi yêu cầu gần đây. Vui lòng chờ trước khi thử lại.');
        if (countdown <= 0) {
          setCountdown(60);
          localStorage.setItem(COOLDOWN_KEY, String(Date.now() + 60_000));
        }
      } else {
        setError(err?.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau ít phút.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#C3ECF6]">
      {/* Top Bar Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl flex items-center justify-between mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1E1E1E] hover:text-[#4285F4] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/80 border border-transparent hover:border-[#1E1E1E]/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Đăng nhập</span>
        </Link>
        <span className="text-xs font-mono-code font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
          GDGoC FPTU OS • Security Portal
        </span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl bg-white rounded-3xl shadow-xl border-[2.5px] border-[#1E1E1E] overflow-hidden brutal-shadow">
        {/* Google 4-color Accent Bar */}
        <div className="h-2 w-full flex">
          <div className="flex-1 bg-[#4285F4]" />
          <div className="flex-1 bg-[#EA4335]" />
          <div className="flex-1 bg-[#FBBC04]" />
          <div className="flex-1 bg-[#34A853]" />
        </div>

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <GdgLogo size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
              Quên Mật Khẩu Tài Khoản
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Nhập Email hoặc MSSV đã đăng ký thành viên GDG on Campus Đại học FPT TP.HCM để nhận liên kết đặt lại mật khẩu.
            </p>
          </div>

          {/* Feedback error */}
          {error && (
            <div className="mb-5 bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Email Thành Viên Hoặc MSSV <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    required
                    autoFocus
                    placeholder="ví dụ: member@fpt.edu.vn hoặc SE180123"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4285F4] focus:bg-white font-medium text-sm transition-all"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  <span>Hệ thống sẽ gửi email chứa đường dẫn bảo mật có hiệu lực trong 15 phút.</span>
                  {countdown > 0 && (
                    <span className="font-bold text-amber-600 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>Khóa gửi lại: {countdown}s</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !identifier.trim() || countdown > 0}
                className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl border-[2px] border-[#1E1E1E] transition-all flex items-center justify-center gap-2 ${
                  countdown > 0
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-80'
                    : 'bg-[#4285F4] hover:bg-[#3367D6] text-white brutal-shadow-sm brutal-shadow-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang tạo liên kết bảo mật...</span>
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Vui lòng chờ ({countdown}s)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi Liên Kết Đặt Lại Mật Khẩu</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Đã Gửi Hướng Dẫn Qua Hòm Thư!</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">
                  {feedbackMessage}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Một số lưu ý quan trọng:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                  <li>Liên kết đặt lại mật khẩu chỉ có hiệu lực trong vòng <strong>15 phút</strong>.</li>
                  <li>Nếu không thấy email trong Hộp thư đến, vui lòng kiểm tra mục <strong>Quảng cáo (Promotions)</strong> hoặc <strong>Thư rác (Spam)</strong>.</li>
                  <li>Để tránh tình trạng spam hòm thư, bạn chỉ có thể gửi lại yêu cầu sau mỗi <strong>60 giây</strong>.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => {
                    setIsSubmitted(false);
                    setIdentifier('');
                  }}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    countdown > 0
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-xs'
                  }`}
                >
                  {countdown > 0 ? (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>Gửi lại sau ({countdown}s)</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Gửi lại yêu cầu khác</span>
                    </>
                  )}
                </button>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs rounded-xl border-[2px] border-[#1E1E1E] brutal-shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span>Đến Trang Đăng Nhập</span>
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Hệ thống bảo vệ tài khoản thành viên GDG on Campus FPTU HCMC.</span>
        </div>
      </div>
    </div>
  );
};
