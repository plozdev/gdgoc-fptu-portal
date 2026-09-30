import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, UserCheck, Shield, Award, Calendar, GraduationCap } from 'lucide-react';
import { Member, useMemberStore } from '../../store/useMemberStore';
import { Tier, BanId, BAN_NAMES } from '../../types/auth.types';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  availableGens: string[];
  currentGen: string;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  availableGens,
  currentGen,
}) => {
  const { addMember, updateMember, availableTenures, activeTenureId } = useMemberStore();

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [tier, setTier] = useState<Tier>('BAN_MEMBER');
  const [banId, setBanId] = useState<BanId | 'none'>('ai');
  const [selectedTenureId, setSelectedTenureId] = useState<string>('');
  const [status, setStatus] = useState<'ACTIVE' | 'PROBATION' | 'ALUMNI' | 'ON_LEAVE'>('ACTIVE');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tự động suy luận Khóa sinh viên từ MSSV (ví dụ SE180123 -> K18, SE200456 -> K20)
  const inferredCohort = useMemo(() => {
    const match = studentId.trim().toUpperCase().match(/^(?:SE|SS|IA|IB|GD|CS|IT|HE)?(\d{2})/);
    return match ? `K${match[1]}` : null;
  }, [studentId]);

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name);
      setStudentId(memberToEdit.studentId);
      setEmail(memberToEdit.email);
      setPhone(memberToEdit.phone || '');
      setPosition(memberToEdit.position || '');
      setTier(memberToEdit.tier);
      setBanId(memberToEdit.banId || 'none');
      setSelectedTenureId(memberToEdit.tenureId || activeTenureId || availableTenures[0]?.id || '');
      setStatus(memberToEdit.status || 'ACTIVE');
    } else {
      setName('');
      setStudentId('');
      setEmail('');
      setPhone('');
      setPosition('Thành Viên');
      setTier('BAN_MEMBER');
      setBanId('ai');
      setSelectedTenureId(activeTenureId || availableTenures[0]?.id || '');
      setStatus('ACTIVE');
    }
    setError('');
  }, [memberToEdit, isOpen, activeTenureId, availableTenures]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Vui lòng nhập Họ và tên thành viên');
      return;
    }
    if (!studentId.trim()) {
      setError('Vui lòng nhập MSSV (Mã số sinh viên)');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập Email FPT hợp lệ');
      return;
    }

    const selectedBanId = tier === 'ORG_ADMIN' || tier === 'ADVISOR' ? null : (banId === 'none' ? null : (banId as BanId));
    const banName = selectedBanId ? BAN_NAMES[selectedBanId] : (tier === 'ADVISOR' ? 'Ban Cố Vấn' : 'Ban Chủ Nhiệm');

    let finalPosition = position.trim();
    if (!finalPosition) {
      if (tier === 'ORG_ADMIN') finalPosition = 'Chapter Lead';
      else if (tier === 'ADVISOR') finalPosition = 'Cố Vấn CLB';
      else if (tier === 'BAN_LEAD') finalPosition = `${selectedBanId?.toUpperCase()} Lead`;
      else if (tier === 'COLLABORATOR') finalPosition = `${selectedBanId?.toUpperCase()} Cộng Tác Viên`;
      else finalPosition = `${selectedBanId?.toUpperCase()} Member`;
    }

    const chosenTenure = availableTenures.find(t => t.id === selectedTenureId);
    const resolvedGen = chosenTenure?.genLabel || chosenTenure?.name || currentGen;

    setIsSubmitting(true);
    try {
      if (memberToEdit) {
        await updateMember(memberToEdit.id, {
          name: name.trim(),
          studentId: studentId.trim().toUpperCase(),
          academicYear: inferredCohort || 'K20',
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          position: finalPosition,
          tier,
          banId: selectedBanId,
          banName,
          gen: resolvedGen,
          tenureId: selectedTenureId || undefined,
          status,
        });
      } else {
        await addMember({
          name: name.trim(),
          studentId: studentId.trim().toUpperCase(),
          academicYear: inferredCohort || 'K20',
          email: email.trim().toLowerCase(),
          phone: phone.trim() || 'Chưa cập nhật',
          position: finalPosition,
          tier,
          banId: selectedBanId,
          banName,
          gen: resolvedGen,
          tenureId: selectedTenureId || undefined,
          status,
          joinedDate: new Date().toLocaleDateString('vi-VN'),
          bio: `${finalPosition} tại GDG on Campus FPT University HCMC.`,
          skills: [],
        });
      }
      onClose();
    } catch (err: any) {
      console.error('Member submit error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Có lỗi xảy ra khi lưu thành viên xuống cơ sở dữ liệu. Vui lòng kiểm tra lại!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              {memberToEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {memberToEdit ? 'Chỉnh Sửa Thông Tin Thành Viên' : 'Thêm Thành Viên Mới'}
              </h3>
              <p className="text-xs text-slate-500">
                {memberToEdit ? `Cập nhật hồ sơ cho #${memberToEdit.studentId}` : 'Nhập thông tin nhân sự và phân ban'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đặng Mai Phương"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* MSSV (Tự động nhận diện Khóa K) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mã Số Sinh Viên (MSSV) <span className="text-red-500">*</span>
                </label>
                {inferredCohort && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-mono-code">
                    <GraduationCap className="w-3 h-3" />
                    <span>Khóa {inferredCohort}</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="Ví dụ: SE180123"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono-code font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Email FPT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email FPT University <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="Ví dụ: phuongdmse180123@fpt.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Điện Thoại Liên Hệ
              </label>
              <input
                type="tel"
                placeholder="Ví dụ: 0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Chức danh cụ thể (Position) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chức Danh Cụ Thể (Position)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: AI Lead, Co-Chapter Lead, Web Member"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Trạng thái hoạt động (Status) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trạng Thái Thành Viên
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="ACTIVE">ACTIVE (Đang Hoạt Động)</option>
                <option value="PROBATION">PROBATION (Thử Việc / Tân Thành Viên)</option>
                <option value="ON_LEAVE">ON_LEAVE (Tạm Nghỉ Hoạt Động)</option>
                <option value="ALUMNI">ALUMNI (Cựu Thành Viên)</option>
              </select>
            </div>

            {/* Cấp bậc (Tier / Role) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cấp Bậc Phân Quyền (Tier / Role)
              </label>
              <select
                value={tier}
                onChange={(e) => {
                  const newTier = e.target.value as Tier;
                  setTier(newTier);
                  if (newTier === 'ORG_ADMIN' || newTier === 'ADVISOR') {
                    setBanId('none');
                  }
                }}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="BAN_MEMBER">BAN_MEMBER (Thành Viên Thường)</option>
                <option value="BAN_LEAD">BAN_LEAD (Trưởng Ban Chuyên Môn)</option>
                <option value="ORG_ADMIN">ORG_ADMIN (Ban Chủ Nhiệm - Toàn Quyền)</option>
                <option value="ADVISOR">ADVISOR (Ban Cố Vấn - View Only)</option>
                <option value="COLLABORATOR">COLLABORATOR (Cộng Tác Viên)</option>
              </select>
            </div>

            {/* Ban Chuyên Môn */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ban Chuyên Môn
              </label>
              <select
                value={banId}
                disabled={tier === 'ORG_ADMIN' || tier === 'ADVISOR'}
                onChange={(e) => setBanId(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
              >
                {tier === 'ORG_ADMIN' ? (
                  <option value="none">Ban Chủ Nhiệm</option>
                ) : tier === 'ADVISOR' ? (
                  <option value="none">Ban Cố Vấn</option>
                ) : (
                  <>
                    <option value="ai">Ban Trí Tuệ Nhân Tạo (AI)</option>
                    <option value="cloud">Ban Điện Toán Đám Mây (Cloud)</option>
                    <option value="web">Ban Phát Triển Web</option>
                    <option value="research">Ban Nghiên Cứu (Research)</option>
                    <option value="media">Ban Truyền Thông & Media</option>
                    <option value="hr-event">Ban Nhân Sự & Sự Kiện (HR-Event)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Nhiệm Kỳ Hoạt Động (Tenure UUID từ BE) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Nhiệm Kỳ Hoạt Động (Tenure):</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono-code">Khớp 100% với Backend Database</span>
            </div>

            <select
              value={selectedTenureId}
              onChange={(e) => setSelectedTenureId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {availableTenures.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.genLabel} {t.id === activeTenureId ? '(Đang hoạt động)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang Lưu Xuống DB...</span>
                </>
              ) : (
                <>
                  {memberToEdit ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{memberToEdit ? 'Lưu Thay Đổi' : 'Thêm Vào Danh Sách'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
