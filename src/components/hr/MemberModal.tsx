import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Shield, Award } from 'lucide-react';
import { Member, useMemberStore } from '../../store/useMemberStore';
import { Tier, BanId, BAN_NAMES } from '../../mocks/fixtures/users';

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
  currentGen
}) => {
  const { addMember, updateMember, members } = useMemberStore();

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState('K20');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [tier, setTier] = useState<Tier>('BAN_MEMBER');
  const [banId, setBanId] = useState<BanId | 'none'>('ai');
  const [gen, setGen] = useState(currentGen || 'Gen 4.0');
  const [customGen, setCustomGen] = useState('');
  const [isCustomGen, setIsCustomGen] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'ALUMNI' | 'ON_LEAVE'>('ACTIVE');
  const [error, setError] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name);
      setStudentId(memberToEdit.studentId);
      setAcademicYear(memberToEdit.academicYear || 'K20');
      setEmail(memberToEdit.email);
      setPhone(memberToEdit.phone || '');
      setPosition(memberToEdit.position || '');
      setTier(memberToEdit.tier);
      setBanId(memberToEdit.banId || 'none');
      
      if (availableGens.includes(memberToEdit.gen)) {
        setGen(memberToEdit.gen);
        setIsCustomGen(false);
      } else {
        setIsCustomGen(true);
        setCustomGen(memberToEdit.gen);
      }
      setStatus(memberToEdit.status || 'ACTIVE');
    } else {
      // Default new
      setName('');
      setStudentId('');
      setAcademicYear('K20');
      setEmail('');
      setPhone('');
      setPosition('Thành Viên');
      setTier('BAN_MEMBER');
      setBanId('ai');
      setGen(currentGen || 'Gen 4.0');
      setIsCustomGen(false);
      setCustomGen('');
      setStatus('ACTIVE');
    }
    setError('');
  }, [memberToEdit, isOpen, currentGen, availableGens]);

  if (!isOpen) return null;

  const resolvedGen = isCustomGen && customGen.trim() ? customGen.trim() : gen;

  const handleSubmit = (e: React.FormEvent) => {
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

    // Check duplicate email
    const duplicateEmail = members.find(m => 
      m.email.toLowerCase() === email.trim().toLowerCase() && m.id !== memberToEdit?.id
    );
    if (duplicateEmail) {
      setError(`Email "${email}" đã được sử dụng bởi ${duplicateEmail.name}`);
      return;
    }

    const selectedBanId = banId === 'none' ? null : (banId as BanId);
    const banName = selectedBanId ? BAN_NAMES[selectedBanId] : 'Ban Chủ Nhiệm';

    let finalPosition = position.trim();
    if (!finalPosition) {
      if (tier === 'ORG_ADMIN') finalPosition = 'Ban Chủ Nhiệm';
      else if (tier === 'BAN_LEAD') finalPosition = `${selectedBanId?.toUpperCase()} Lead`;
      else finalPosition = `${selectedBanId?.toUpperCase()} Member`;
    }

    if (memberToEdit) {
      updateMember(memberToEdit.id, {
        name: name.trim(),
        studentId: studentId.trim().toUpperCase(),
        academicYear: academicYear.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        position: finalPosition,
        tier,
        banId: selectedBanId,
        banName,
        gen: resolvedGen,
        status,
      });
    } else {
      addMember({
        name: name.trim(),
        studentId: studentId.trim().toUpperCase(),
        academicYear: academicYear.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || 'Chưa cập nhật',
        position: finalPosition,
        tier,
        banId: selectedBanId,
        banName,
        gen: resolvedGen,
        status,
        joinedDate: new Date().toLocaleDateString('vi-VN'),
        bio: `${finalPosition} tại GDG on Campus FPT University HCMC.`,
        skills: []
      });
    }

    onClose();
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

            {/* MSSV */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã Số Sinh Viên (MSSV) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: SE180123"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono-code font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Khóa Đại Học (K19, K20...) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Khóa Sinh Viên
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="K18">Khóa K18 (Fall 2022)</option>
                <option value="K19">Khóa K19 (Fall 2023)</option>
                <option value="K20">Khóa K20 (Fall 2024)</option>
                <option value="K21">Khóa K21 (Fall 2025)</option>
                <option value="K22">Khóa K22 (Fall 2026)</option>
              </select>
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

            {/* Cấp bậc (Tier) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cấp Bậc Phân Quyền (Tier)
              </label>
              <select
                value={tier}
                onChange={(e) => {
                  const newTier = e.target.value as Tier;
                  setTier(newTier);
                  if (newTier === 'ORG_ADMIN') {
                    setBanId('none');
                  }
                }}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="BAN_MEMBER">BAN_MEMBER (Thành Viên Thường)</option>
                <option value="BAN_LEAD">BAN_LEAD (Trưởng Ban Chuyên Môn)</option>
                <option value="ORG_ADMIN">ORG_ADMIN (Ban Chủ Nhiệm - Toàn Quyền)</option>
              </select>
            </div>

            {/* Ban Chuyên Môn */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ban Chuyên Môn
              </label>
              <select
                value={banId}
                disabled={tier === 'ORG_ADMIN'}
                onChange={(e) => setBanId(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
              >
                {tier === 'ORG_ADMIN' ? (
                  <option value="none">Ban Chủ Nhiệm</option>
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

          {/* Khóa Gen (Hỗ trợ Gen lẻ) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Khóa Gen Hoạt Động (CLB):
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {availableGens.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGen(g);
                    setIsCustomGen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isCustomGen && gen === g
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {g}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomGen(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCustomGen
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                + Gen Khác
              </button>
            </div>

            {isCustomGen && (
              <input
                type="text"
                placeholder="Nhập Gen (ví dụ: Gen 2.5, Gen 3.5, Gen 4.5...)"
                value={customGen}
                onChange={(e) => setCustomGen(e.target.value)}
                className="mt-1 px-3 py-1.5 bg-white border border-blue-400 rounded-lg text-xs font-medium focus:outline-none w-full max-w-xs"
              />
            )}
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {memberToEdit ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{memberToEdit ? 'Lưu Thay Đổi' : 'Thêm Vào Danh Sách'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
