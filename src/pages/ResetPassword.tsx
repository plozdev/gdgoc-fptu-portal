import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { GdgLogo } from '../components/GdgLogo';
import {
  usePasswordValidation,
  PasswordStrengthBar,
  PasswordCriteriaList,
} from '../components/auth/PasswordValidationHelper';
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Check,
  X,
  Lock,
} from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { criteria, allCriteriaValid, passwordsMatch, strength } = usePasswordValidation(
    newPassword,
    confirmPassword,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Thiếu mã xác thực (token). Vui lòng sử dụng liên kết được gửi qua email.');
      return;
    }

    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (!allCriteriaValid) {
      setError('Mật khẩu mới chưa đáp ứng đầy đủ các tiêu chuẩn bảo mật bên dưới.');
      return;
    }

    if (!passwordsMatch) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/auth/reset-password', {
        token,
        newPassword,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(
        err?.message ||
          'Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn (15 phút) hoặc đã được sử dụng.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#C3ECF6]">
      {/* Top Breadcrumb Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl flex items-center justify-between mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1E1E1E] hover:text-[#4285F4] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/80 border border-transparent hover:border-[#1E1E1E]/10"
        >
          <span>Trang Đăng Nhập</span>
        </Link>
        <span className="text-xs font-mono-code font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
          GDGoC-OS • Account Recovery
        </span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl bg-white rounded-3xl shadow-xl border-[2.5px] border-[#1E1E1E] overflow-hidden brutal-shadow">
        {/* Google 4-Color Accent Bar */}
        <div className="h-2 w-full flex">
          <div className="flex-1 bg-[#4285F4]" />
          <div className="flex-1 bg-[#EA4335]" />
          <div className="flex-1 bg-[#FBBC04]" />
          <div className="flex-1 bg-[#34A853]" />
        </div>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <GdgLogo size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
              Tạo Mật Khẩu Mới
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Nhập mật khẩu mới an toàn cho tài khoản GDGoC-OS của bạn.
            </p>
          </div>

          {/* Token Missing Warning */}
          {!token && !isSuccess && (
            <div className="mb-5 bg-amber-50 border-2 border-amber-300 text-amber-900 px-4 py-4 rounded-2xl text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Liên kết không có mã token hợp lệ</span>
              </div>
              <p className="leading-relaxed">
                Đường dẫn đặt lại mật khẩu cần có tham số mã token xác thực. Hãy mở trực tiếp liên kết được gửi trong email hoặc yêu cầu cấp lại liên kết mới.
              </p>
              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
                >
                  <span>Gửi lại yêu cầu đặt mật khẩu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-emerald-900 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-emerald-800">
                  Đặt Lại Mật Khẩu Thành Công!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-700 font-medium leading-relaxed max-w-sm mx-auto">
                  Tài khoản của bạn đã được cập nhật mật khẩu mới an toàn. Hệ thống đang tự động chuyển bạn về trang đăng nhập...
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  to="/login"
                  className="w-full py-3 px-4 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-sm rounded-xl border-[2px] border-[#1E1E1E] brutal-shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span>Đăng Nhập Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            token && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="Mật khẩu mới (ít nhất 8 ký tự, hoa, thường, số, ký tự)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  <PasswordStrengthBar strength={strength} hasValue={Boolean(newPassword)} />
                </div>

                {/* 2. Xác nhận mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                        confirmPassword
                          ? passwordsMatch
                            ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                            : 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                          : 'border-slate-300 focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <p
                      className={`text-[11px] font-bold flex items-center gap-1 ${
                        passwordsMatch ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {passwordsMatch ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Mật khẩu xác nhận khớp hoàn toàn</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Mật khẩu xác nhận chưa khớp</span>
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Password Criteria Checklist */}
                <PasswordCriteriaList criteria={criteria} />

                {/* Actions */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !allCriteriaValid || !passwordsMatch || !newPassword}
                    className="w-full py-3.5 px-4 bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-50 text-white font-bold text-sm rounded-xl border-[2px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang lưu mật khẩu mới...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Lưu Mật Khẩu & Hoàn Tất</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Mật khẩu của bạn được mã hóa một chiều bằng chuẩn Bcrypt salted hash.</span>
        </div>
      </div>
    </div>
  );
};
