import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Sparkles, User, Mail, GraduationCap, Code, ArrowRight, Download, Share2, Briefcase, Trophy, Flame } from 'lucide-react';
import { GdgBracketsGlyph } from './GdgLogo';
import { CHAPTER_INFO, DEPARTMENTS_DATA } from '../data/gdgData';
import { RegistrationFormData } from '../types';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDepartment?: string;
  isLeadRole?: boolean;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  defaultDepartment,
  isLeadRole = false,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    studentId: '',
    email: '',
    cohort: 'K22 (Tân Sinh Viên)',
    major: 'Kỹ Thuật Phần Mềm (SE)',
    division: 'TECH',
    departmentOfInterest: defaultDepartment || 'AI (Artificial Intelligence)',
    isApplyingForLead: isLeadRole,
    portfolioUrl: '',
    motivation: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [candidateId, setCandidateId] = useState('');

  useEffect(() => {
    if (defaultDepartment) {
      const found = DEPARTMENTS_DATA.find((d) => d.name === defaultDepartment);
      setFormData((prev) => ({
        ...prev,
        departmentOfInterest: defaultDepartment,
        division: found ? found.division : 'TECH',
      }));
    }
    if (isLeadRole !== undefined) {
      setFormData((prev) => ({ ...prev, isApplyingForLead: isLeadRole }));
    }
  }, [defaultDepartment, isLeadRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `K22-${formData.division}-${Math.floor(1000 + Math.random() * 9000)}`;
    setCandidateId(generatedId);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  const availableDepts = DEPARTMENTS_DATA.filter((d) => d.division === formData.division);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1E1E]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-[28px] brutal-shadow-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="sticky top-0 bg-[#FFFFFF] border-b-2 border-[#1E1E1E] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <GdgBracketsGlyph size={28} />
            <div>
              <span className="font-extrabold text-sm text-[#1E1E1E] block leading-none">
                GDG on Campus FPT University HCMC
              </span>
              <span className="font-mono-code text-[11px] text-[#4285F4] font-bold">
                Cổng Tuyển Sinh Gen K22 & Lead Roles Fall 2026
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-[#1E1E1E] hover:bg-[#F0F0F0] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#1E1E1E]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFE7A5] border border-[#1E1E1E] rounded-md font-mono-code text-[11px] font-bold text-[#1E1E1E]">
                  <Trophy className="w-3 h-3 text-[#EA4335]" />
                  <span>Top 1 GDGoC AI Riser Vietnam 2026</span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#1E1E1E]">
                  {formData.isApplyingForLead ? 'Ứng Tuyển Trưởng Ban (Lead Role)' : 'Ứng Tuyển Thành Viên Gen K22'}
                </h3>
                <p className="text-xs text-[#1E1E1E]/75">
                  Điền đầy đủ thông tin để nhận Thẻ Ứng Viên Điện Tử và lịch phỏng vấn chính thức tại campus FPTU HCMC.
                </p>
              </div>

              {/* Lead Role toggle check */}
              <div className="p-3 bg-[#C3ECF6] border-2 border-[#1E1E1E] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#4285F4]" />
                  <span className="text-xs font-bold text-[#1E1E1E]">
                    Ứng tuyển vị trí Trưởng Ban (Lead Role)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isApplyingForLead}
                  onChange={(e) => setFormData({ ...formData, isApplyingForLead: e.target.checked })}
                  className="w-4 h-4 accent-[#4285F4] rounded cursor-pointer"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1">
                  Họ và Tên Đầy Đủ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                />
              </div>

              {/* Student ID & Cohort */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1">
                    Mã Số Sinh Viên (MSSV) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SE200123"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-sm font-mono-code focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1">
                    Khóa Sinh Viên *
                  </label>
                  <select
                    value={formData.cohort}
                    onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-mono-code focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                  >
                    <option value="K22 (Tân Sinh Viên)">K22 (Tân Sinh Viên)</option>
                    <option value="K21">K21</option>
                    <option value="K20">K20</option>
                    <option value="K19">K19</option>
                    <option value="Khác">Khác / Cựu SV</option>
                  </select>
                </div>
              </div>

              {/* FPT University Email */}
              <div>
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1">
                  Email Trường (@fpt.edu.vn) hoặc Cá Nhân *
                </label>
                <input
                  type="email"
                  required
                  placeholder="annvse200123@fpt.edu.vn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-sm font-mono-code focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                />
              </div>

              {/* Major */}
              <div>
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1">
                  Chuyên Ngành Đang Theo Học *
                </label>
                <select
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                >
                  <option value="Kỹ Thuật Phần Mềm (SE)">Kỹ Thuật Phần Mềm (Software Engineering - SE)</option>
                  <option value="Trí Tuệ Nhân Tạo (AI)">Trí Tuệ Nhân Tạo (Artificial Intelligence - AI)</option>
                  <option value="An Toàn Thông Tin (IA)">An Toàn Thông Tin (Information Assurance - IA)</option>
                  <option value="Hệ Thống Thông Tin (IS)">Hệ Thống Thông Tin (Information Systems - IS)</option>
                  <option value="Thiết Kế Mỹ Thuật Số (GD)">Thiết Kế Mỹ Thuật Số (Digital Art & Graphic Design - GD)</option>
                  <option value="Quản Trị Kinh Doanh / Truyền Thông">Quản Trị Kinh Doanh / Truyền Thông Đa Phương Tiện</option>
                  <option value="Ngành Khác">Ngành Khác</option>
                </select>
              </div>

              {/* Division & Department Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1">
                    1. Khối Chuyên Môn *
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => {
                      const newDiv = e.target.value as 'TECH' | 'NON-TECH';
                      const defaultForDiv = DEPARTMENTS_DATA.find((d) => d.division === newDiv)?.name || '';
                      setFormData({
                        ...formData,
                        division: newDiv,
                        departmentOfInterest: defaultForDiv,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none font-bold"
                  >
                    <option value="TECH">KHỐI TECH (Kỹ Thuật)</option>
                    <option value="NON-TECH">KHỐI NON-TECH (Truyền Thông & Sự Kiện)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1">
                    2. Ban Nguyện Vọng *
                  </label>
                  <select
                    value={formData.departmentOfInterest}
                    onChange={(e) => setFormData({ ...formData, departmentOfInterest: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                  >
                    {availableDepts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.vietnameseName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Portfolio Link / CV */}
              <div>
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1">
                  Link GitHub / Portfolio / Behance / CV (Nếu có)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/... hoặc link Google Drive"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-sm font-mono-code focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                />
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1">
                  Định hướng & Lý do bạn muốn đồng hành cùng GDGoC FPTU?
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Nghiên cứu GenAI & Gemini API, làm chủ GCP, tổ chức Google I/O Extended, phát triển bản thân..."
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-xl text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-extrabold text-sm rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Nộp Hồ Sơ & Xuất Thẻ Ứng Viên Gen K22</span>
              </button>
            </form>
          ) : (
            /* Digital Candidate Pass */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-[#CCF6C5] border-2 border-[#1E1E1E] mx-auto flex items-center justify-center text-[#34A853] mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#1E1E1E]">
                  Nộp Đơn Tuyển Dụng Thành Công!
                </h3>
                <p className="text-xs text-[#1E1E1E]/75">
                  Hồ sơ của bạn đã được chuyển đến Ban Chủ Nhiệm GDGoC FPT University HCMC.
                </p>
              </div>

              {/* Visual Pass Card */}
              <div className="relative bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-3xl p-6 brutal-shadow overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#EA4335] via-[#FBBC04] via-[#34A853] to-[#4285F4]" />

                <div className="pt-2 flex items-start justify-between border-b-2 border-[#1E1E1E] pb-4 mb-4">
                  <div>
                    <span className="font-mono-code text-[10px] font-bold text-[#EA4335] uppercase bg-[#FFE7A5] px-2 py-0.5 rounded border border-[#1E1E1E]">
                      {formData.isApplyingForLead ? 'LEAD CANDIDATE PASS' : 'GEN K22 CANDIDATE PASS'}
                    </span>
                    <h4 className="font-extrabold text-xl text-[#1E1E1E] mt-1">
                      {formData.fullName || 'Thành viên K22'}
                    </h4>
                    <p className="font-mono-code text-xs text-[#4285F4] font-bold">
                      MSSV: {formData.studentId || 'SE200000'} • {formData.cohort}
                    </p>
                  </div>
                  <GdgBracketsGlyph size={36} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono-code mb-4">
                  <div>
                    <span className="text-[#1E1E1E]/60 block text-[10px]">KHỐI CHUYÊN MÔN</span>
                    <span className="font-bold text-[#1E1E1E]">KHỐI {formData.division}</span>
                  </div>
                  <div>
                    <span className="text-[#1E1E1E]/60 block text-[10px]">BAN ỨNG TUYỂN</span>
                    <span className="font-bold text-[#4285F4]">{formData.departmentOfInterest}</span>
                  </div>
                  <div>
                    <span className="text-[#1E1E1E]/60 block text-[10px]">MÃ ỨNG VIÊN</span>
                    <span className="font-bold text-[#1E1E1E]">{candidateId}</span>
                  </div>
                  <div>
                    <span className="text-[#1E1E1E]/60 block text-[10px]">TRẠNG THÁI</span>
                    <span className="font-bold text-[#34A853]">ĐÃ TIẾP NHẬN HỒ SƠ</span>
                  </div>
                </div>

                {/* Slogan and Location */}
                <div className="pt-3 border-t-2 border-[#1E1E1E] flex items-center justify-between">
                  <div className="font-mono-code text-[10px] font-bold text-[#1E1E1E]/70">
                    "{CHAPTER_INFO.slogan}"
                  </div>
                  <div className="font-mono-code text-[10px] bg-[#F0F0F0] px-2 py-0.5 rounded border border-[#1E1E1E]/30 font-bold">
                    FPTU HCMC • Fall 2026
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3.5 bg-[#F0F0F0] border border-[#1E1E1E] rounded-xl text-xs space-y-1 text-[#1E1E1E]/80">
                <span className="font-bold text-[#1E1E1E] block font-mono-code">Các bước tiếp theo:</span>
                <div>1. Kiểm tra hòm thư <strong>{formData.email}</strong> để nhận thư xác nhận và link tham gia group kết nối.</div>
                <div>2. Ban Nhân sự sẽ gửi lịch phỏng vấn trực tiếp tại Alpha Building (FPTU HCMC).</div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-[#4285F4] text-[#FFFFFF] font-bold text-sm rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm cursor-pointer"
                >
                  Hoàn Tất & Quay Lại Trang Chủ
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
