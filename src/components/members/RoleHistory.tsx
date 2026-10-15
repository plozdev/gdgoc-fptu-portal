import React from 'react';
import { MemberRoleHistory } from '../../api/members.api';
import { useMemberProfile } from './useMemberProfile';
import {
  Calendar,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  Clock,
  RotateCcw,
  Shield,
  Briefcase
} from 'lucide-react';

const roles: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  LEAD: 'Ban Chủ nhiệm',
  ADVISOR: 'Cố vấn',
  DEPARTMENT_LEAD: 'Trưởng ban',
  MEMBER: 'Thành viên'
};

const statuses: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Đang hoạt động', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PROBATION: { label: 'Thử việc', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ALUMNI: { label: 'Cựu thành viên (Alumni)', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  ON_LEAVE: { label: 'Tạm nghỉ', color: 'bg-rose-50 text-rose-700 border-rose-200' }
};

export const roleLabel = (role: string) => roles[role] || role;
export const statusLabel = (status: string) => statuses[status]?.label || status;

const formatDate = (value?: string | null) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return value;
  }
};

export function RoleHistory({ history }: { history: MemberRoleHistory[] }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Lịch Sử Vai Trò & Hành Trình CLB
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ghi nhận các nhiệm kỳ và vai trò chính thức tại GDGoC
            </p>
          </div>
        </div>
        <span className="text-xs font-mono-code font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          {history.length} nhiệm kỳ
        </span>
      </div>

      {!history.length ? (
        <div className="text-center py-8 text-slate-400 space-y-2">
          <Clock className="w-8 h-8 mx-auto text-slate-300 opacity-60" />
          <p className="text-xs font-semibold text-slate-500">Chưa có lịch sử vai trò được ghi nhận.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-300 before:to-slate-200">
          {history.map((row) => {
            const statusConfig = statuses[row.status] || {
              label: row.status,
              color: 'bg-slate-100 text-slate-600 border-slate-200'
            };
            const isCurrent = !row.isArchived;

            return (
              <div key={row.id} className="relative group">
                {/* Timeline Node Icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isCurrent
                      ? 'bg-blue-600 border-white text-white shadow-md shadow-blue-500/30'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCurrent ? (
                    <Sparkles className="w-3 h-3 text-white" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-slate-400" />
                  )}
                </div>

                {/* Content Box */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/40 border-blue-200/80 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900">
                        {row.tenureName}
                      </h3>
                      {row.genLabel && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 font-mono-code">
                          {row.genLabel}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-200/80 text-slate-600 border-slate-300'
                        }`}
                      >
                        {isCurrent ? 'Nhiệm kỳ hiện tại' : 'Đã hoàn thành'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>{row.position || roleLabel(row.role)}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Ban {row.departmentName}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Thời gian: {formatDate(row.startDate)} – {formatDate(row.endDate)}</span>
                    </div>
                    {row.joinedAt && (
                      <span className="font-mono-code text-slate-400">
                        Gia nhập: {formatDate(row.joinedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MyRoleHistory({ id }: { id: string }) {
  const data = useMemberProfile(id);
  if (data.loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <RotateCcw className="w-4 h-4 animate-spin text-blue-500" />
        <span>Đang tải lịch sử vai trò...</span>
      </div>
    );
  }
  if (data.error) {
    return (
      <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 flex items-center justify-between gap-3">
        <span>{data.error}</span>
        <button
          type="button"
          onClick={data.retry}
          className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-300 transition-colors cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }
  return data.profile ? <RoleHistory history={data.profile.roleHistory} /> : null;
}
