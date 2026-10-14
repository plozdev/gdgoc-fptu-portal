import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  Sparkles,
  Check,
  X,
  User,
  Mail
} from 'lucide-react';
import {
  usePasswordValidation,
  PasswordStrengthBar,
  PasswordCriteriaList,
} from './auth/PasswordValidationHelper';

interface FirstPasswordChangeProps {
  mode?: 'mandatory' | 'standard';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const FirstPasswordChange: React.FC<FirstPasswordChangeProps> = ({
  mode,
  onSuccess,
  onCancel,
}) => {
  const { user, fetchSession, logout } = useAuthStore();
  const navigate = useNavigate();

  // If mode not specified, auto-detect: if user.mustChangePassword -> mandatory, otherwise standard
  const isMandatory = mode ? mode === 'mandatory' : Boolean(user?.mustChangePassword);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password criteria checks (aligned with backend @IsStrongPassword())
  const { criteria, allCriteriaValid, passwordsMatch, strength } = usePasswordValidation(
    newPassword,
    confirmPassword,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    if (!allCriteriaValid) {
      setError('Mật khẩu mới chưa đáp ứng đầy đủ tiêu chuẩn bảo mật. Vui lòng kiểm tra danh sách bên dưới.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Mật khẩu mới phải khác với mật khẩu hiện tại.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/auth/change-password', {
        oldPassword,
        newPassword,
      });

      setSuccessMessage('Đổi mật khẩu thành công! Đang đồng bộ tài khoản...');
      
      // Refresh session in store (mustChangePassword becomes false)
      await fetchSession();

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      console.error('Change password error:', err);
      setError(err?.message || 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackOrCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-red-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300">
        {/* Top 4-Color Google Brand Accent Bar */}
        <div className="grid grid-cols-4 h-1.5 w-full">
          <div className="bg-[#4285F4]" />
          <div className="bg-[#EA4335]" />
          <div className="bg-[#FBBC04]" />
          <div className="bg-[#34A853]" />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* GDGoC Emblem */}
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
                  <div className="grid grid-cols-2 gap-1 p-1">
                    <div className="w-2 h-2 rounded-xs bg-[#4285F4]" />
                    <div className="w-2 h-2 rounded-xs bg-[#EA4335]" />
                    <div className="w-2 h-2 rounded-xs bg-[#34A853]" />
                    <div className="w-2 h-2 rounded-xs bg-[#FBBC04]" />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block font-mono-code">
                    GDGoC FPTU OS • Security Portal
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    FPT University HCMC
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {isMandatory ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bắt Buộc Lần Đầu</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                  <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                  <span>Cập Nhật Mật Khẩu</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isMandatory ? 'Thiết Lập Mật Khẩu Khởi Tạo' : 'Đổi Mật Khẩu Tài Khoản'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                {isMandatory
                  ? 'Tài khoản của bạn đang dùng mật khẩu mặc định. Hãy tạo mật khẩu mới an toàn để mở khóa toàn bộ tính năng nội bộ.'
                  : 'Cập nhật mật khẩu mới giúp tài khoản của bạn tại GDG on Campus luôn được bảo vệ tối ưu.'}
              </p>
            </div>

            {/* Current Logged-in User Info Strip */}
            {user && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    {user.name ? user.name.slice(0, 1).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{user.name || 'Thành viên'}</p>
                    <p className="text-slate-500 text-[11px] font-mono-code truncate">{user.email}</p>
                  </div>
                </div>
                {user.banName && (
                  <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 font-bold text-[10px] text-slate-700 shrink-0">
                    {user.banName}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Error & Success Feedback Banners */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 font-bold">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Mật khẩu hiện tại */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Mật khẩu hiện tại <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showOld ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Nhập mật khẩu bạn đang dùng"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowOld(!showOld)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2. Mật khẩu mới */}
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
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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

            {/* 3. Xác nhận mật khẩu mới */}
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
                  className={`w-full pl-10 pr-11 py-2.5 bg-slate-50/80 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                    confirmPassword
                      ? passwordsMatch
                        ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                        : 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
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
                <p className={`text-[11px] font-bold flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
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
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              {isMandatory ? (
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng Xuất</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBackOrCancel}
                  className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay Lại</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !allCriteriaValid || !passwordsMatch || !oldPassword}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isMandatory ? 'Lưu & Vào Hệ Thống' : 'Cập Nhật Mật Khẩu'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
