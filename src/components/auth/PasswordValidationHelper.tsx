import React, { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface PasswordCriterion {
  id: string;
  label: string;
  valid: boolean;
}

export interface PasswordStrength {
  score: number;
  label: string;
  barWidth: string;
  color: string;
  text: string;
}

export function usePasswordValidation(newPassword: string, confirmPassword?: string) {
  const criteria: PasswordCriterion[] = useMemo(() => {
    return [
      { id: 'length', label: 'Tối thiểu 8 ký tự', valid: newPassword.length >= 8 },
      { id: 'upper', label: 'Ít nhất 1 chữ hoa (A-Z)', valid: /[A-Z]/.test(newPassword) },
      { id: 'lower', label: 'Ít nhất 1 chữ thường (a-z)', valid: /[a-z]/.test(newPassword) },
      { id: 'number', label: 'Ít nhất 1 chữ số (0-9)', valid: /[0-9]/.test(newPassword) },
      { id: 'symbol', label: 'Ít nhất 1 ký tự đặc biệt (!@#$...)', valid: /[^A-Za-z0-9]/.test(newPassword) },
    ];
  }, [newPassword]);

  const allCriteriaValid = useMemo(() => criteria.every((c) => c.valid), [criteria]);

  const passwordsMatch = useMemo(() => {
    if (confirmPassword === undefined) return true;
    return Boolean(confirmPassword && newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  const strength: PasswordStrength = useMemo(() => {
    if (!newPassword) {
      return { score: 0, label: 'Chưa nhập', barWidth: '0%', color: 'bg-slate-200', text: 'text-slate-400' };
    }
    const validCount = criteria.filter((c) => c.valid).length;
    if (validCount <= 2) {
      return { score: 1, label: 'Yếu', barWidth: '25%', color: 'bg-rose-500', text: 'text-rose-600' };
    }
    if (validCount === 3) {
      return { score: 2, label: 'Trung bình', barWidth: '50%', color: 'bg-amber-500', text: 'text-amber-600' };
    }
    if (validCount === 4) {
      return { score: 3, label: 'Khá mạnh', barWidth: '75%', color: 'bg-blue-500', text: 'text-blue-600' };
    }
    return { score: 4, label: 'Rất an toàn', barWidth: '100%', color: 'bg-emerald-500', text: 'text-emerald-600' };
  }, [newPassword, criteria]);

  return { criteria, allCriteriaValid, passwordsMatch, strength };
}

export const PasswordStrengthBar: React.FC<{ strength: PasswordStrength; hasValue: boolean }> = ({
  strength,
  hasValue,
}) => {
  if (!hasValue) return null;
  return (
    <div className="space-y-1 pt-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500">Độ mạnh mật khẩu:</span>
        <span className={`font-bold ${strength.text}`}>{strength.label}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.barWidth }}
        />
      </div>
    </div>
  );
};

export const PasswordCriteriaList: React.FC<{ criteria: PasswordCriterion[] }> = ({ criteria }) => {
  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
      <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wide">
        Tiêu chuẩn mật khẩu an toàn:
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {criteria.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
              item.valid ? 'text-emerald-700' : 'text-slate-400'
            }`}
          >
            {item.valid ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
