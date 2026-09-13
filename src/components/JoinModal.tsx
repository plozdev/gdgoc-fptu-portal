import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Sparkles, User, Mail, GraduationCap, Code, ArrowRight, Download, Share2, Award, Flame, Layers } from 'lucide-react';
import { GdgBracketsGlyph } from './GdgLogo';
import { CHAPTER_INFO, DEPARTMENTS_DATA } from '../data/gdgData';
import { RegistrationFormData } from '../types';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDepartment?: string;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  defaultDepartment,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    studentId: '',
    email: '',
    cohort: 'K22 (Tân Sinh Viên)',
    major: 'Kỹ Thuật Phần Mềm (SE)',
    division: 'TECH',
    departmentOfInterest: defaultDepartment || 'AI',
    isApplyingForLead: false,
    portfolioUrl: '',
    motivation: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [candidateId, setCandidateId] = useState('');

  useEffect(() => {
    if (defaultDepartment) {
      const found = DEPARTMENTS_DATA.find((d) => d.name === defaultDepartment || d.id === defaultDepartment);
      setFormData((prev) => ({
        ...prev,
        departmentOfInterest: found ? found.name : defaultDepartment,
        division: found ? found.division : 'TECH',
      }));
    }
  }, [defaultDepartment, isOpen]);

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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E1E1E]/65 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-[28px] brutal-shadow-lg max-h-[92vh] flex flex-col overflow-hidden"
      >
        
        {/* Sticky Header Bar */}
        <div className="bg-[#FFFFFF] border-b-2 border-[#1E1E1E] px-6 py-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <GdgBracketsGlyph size={32} />
            <div>
              <span className="font-extrabold text-sm sm:text-base text-[#1E1E1E] block leading-tight">
                GDG on Campus FPT University HCMC
              </span>
              <span className="font-mono-code text-[11px] text-[#4285F4] font-bold">
                Cổng Tuyển Sinh Thế Hệ Gen K22 • Fall 2026
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-[#1E1E1E] hover:bg-[#FFE7A5] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#1E1E1E]" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto custom-scrollbar flex-1">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Form Title */}
              <div className="space-y-1 pb-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CCF6C5] border-[1.5px] border-[#1E1E1E] rounded-full font-mono-code text-xs font-bold text-[#1E1E1E]">
                  <Sparkles className="w-3.5 h-3.5 text-[#34A853]" />
                  <span>Đăng Ký Gia Nhập Thành Viên Gen K22</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
                  Thông Tin Ứng Viên
                </h3>
                <p className="text-xs sm:text-sm text-[#1E1E1E]/80">
                  Hoàn thiện các thông tin dưới đây để nhận Thẻ Ứng Viên Điện Tử và lịch phỏng vấn trực tiếp tại Campus FPTU HCMC.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1.5">
                  Họ và Tên Đầy Đủ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F9FA] border-2 border-[#1E1E1E] rounded-xl text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none font-medium"
                />
              </div>

              {/* Student ID & Cohort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1.5">
                    Mã Số Sinh Viên (MSSV) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SE200123"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 bg-[#F8F9FA] border-2 border-[#1E1E1E] rounded-xl text-sm font-mono-code focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1.5">
                    Khóa Sinh Viên *
                  </label>
                  <select
                    value={formData.cohort}
                    onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8F9FA] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none font-semibold cursor-pointer"
                  >
                    <option value="K22 (Tân Sinh Viên)">K22 (Tân Sinh Viên - Ưu tiên xét tuyển)</option>
                    <option value="K21">K21 (Năm 2)</option>
                    <option value="K20">K20 (Năm 3)</option>
                    <option value="K19">K19</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1.5">
                  Email FPT / Email Liên Hệ *
                </label>
                <input
                  type="email"
                  required
                  placeholder="annvse200123@fpt.edu.vn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F9FA] border-2 border-[#1E1E1E] rounded-xl text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none font-medium"
                />
              </div>

              {/* Major Selection */}
              <div>
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1.5">
                  Chuyên Ngành Học Tại FPTU *
                </label>
                <select
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F9FA] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none font-semibold cursor-pointer"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-2xl">
                <div>
                  <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1.5">
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
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-sans focus:ring-2 focus:ring-[#4285F4] outline-none font-bold cursor-pointer"
                  >
                    <option value="TECH">Khối Tech (Kỹ Thuật - 4 Ban)</option>
                    <option value="NON-TECH">Khối Non-Tech (Vận Hành - 2 Ban)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1.5">
                    2. Ban Nguyện Vọng *
                  </label>
                  <select
                    value={formData.departmentOfInterest}
                    onChange={(e) => setFormData({ ...formData, departmentOfInterest: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-sans focus:ring-2 focus:ring-[#4285F4] outline-none font-bold cursor-pointer text-[#4285F4]"
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
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1.5">
                  Link GitHub / Portfolio / CV (Nếu có)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/... hoặc link Google Drive chia sẻ quyền xem"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F9FA] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-mono-code focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none"
                />
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-xs font-mono-code font-bold text-[#1E1E1E] mb-1.5">
                  Lý do & Mục tiêu của bạn khi gia nhập GDGoC FPTU?
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Mong muốn học hỏi AI, Gemini API, Cloud Run, kết nối bạn bè cùng chí hướng và tạo ra sản phẩm thực tế..."
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F9FA] border-2 border-[#1E1E1E] rounded-xl text-xs sm:text-sm font-sans focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#4285F4] outline-none leading-relaxed font-normal"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-extrabold text-sm sm:text-base rounded-full border-2 border-[#1E1E1E] brutal-shadow brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Nộp Hồ Sơ & Xuất Thẻ Ứng Viên Gen K22</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          ) : (
            /* Digital Candidate Pass (Success State) */
            <div className="space-y-6 animate-fadeIn py-2">
              <div className="text-center space-y-1">
                <div className="w-14 h-14 rounded-2xl bg-[#CCF6C5] border-2 border-[#1E1E1E] mx-auto flex items-center justify-center text-[#34A853] mb-3 brutal-shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">
                  Nộp Đơn Tuyển Sinh Thành Công!
                </h3>
                <p className="text-xs sm:text-sm text-[#1E1E1E]/80 max-w-md mx-auto">
                  Hồ sơ ứng tuyển Gen K22 của bạn đã được tiếp nhận chính thức bởi Ban Chủ Nhiệm GDGoC FPT University HCMC.
                </p>
              </div>

              {/* Visual Digital Pass Card */}
              <div className="relative bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-[24px] p-6 brutal-shadow overflow-hidden">
                {/* 4-color top stripe */}
                <div className="absolute top-0 left-0 right-0 h-2.5 flex">
                  <div className="flex-1 bg-[#EA4335]" />
                  <div className="flex-1 bg-[#FBBC04]" />
                  <div className="flex-1 bg-[#34A853]" />
                  <div className="flex-1 bg-[#4285F4]" />
                </div>

                <div className="pt-2 flex items-start justify-between border-b-2 border-[#1E1E1E] pb-4 mb-4">
                  <div>
                    <span className="font-mono-code text-[10px] font-extrabold text-[#1E1E1E] uppercase bg-[#FFE7A5] px-2.5 py-0.5 rounded border border-[#1E1E1E] inline-block mb-1">
                      OFFICIAL CANDIDATE PASS • GEN K22
                    </span>
                    <h4 className="font-extrabold text-xl sm:text-2xl text-[#1E1E1E]">
                      {formData.fullName || 'Thành viên Gen K22'}
                    </h4>
                    <p className="font-mono-code text-xs text-[#4285F4] font-bold mt-0.5">
                      MSSV: {formData.studentId || 'SE200000'} • {formData.cohort}
                    </p>
                  </div>
                  <GdgBracketsGlyph size={40} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono-code mb-4">
                  <div className="p-2.5 bg-[#F0F0F0] rounded-xl border border-[#1E1E1E]">
                    <span className="text-[#1E1E1E]/60 block text-[10px] font-bold">KHỐI CHUYÊN MÔN</span>
                    <span className="font-extrabold text-[#1E1E1E] text-sm">KHỐI {formData.division}</span>
                  </div>
                  <div className="p-2.5 bg-[#C3ECF6] rounded-xl border border-[#1E1E1E]">
                    <span className="text-[#1E1E1E]/60 block text-[10px] font-bold">BAN NGUYỆN VỌNG</span>
                    <span className="font-extrabold text-[#1E1E1E] text-sm">{formData.departmentOfInterest}</span>
                  </div>
                  <div className="p-2.5 bg-[#FFE7A5] rounded-xl border border-[#1E1E1E]">
                    <span className="text-[#1E1E1E]/60 block text-[10px] font-bold">MÃ ỨNG VIÊN</span>
                    <span className="font-extrabold text-[#1E1E1E] text-sm">{candidateId}</span>
                  </div>
                  <div className="p-2.5 bg-[#CCF6C5] rounded-xl border border-[#1E1E1E]">
                    <span className="text-[#1E1E1E]/60 block text-[10px] font-bold">TRẠNG THÁI</span>
                    <span className="font-extrabold text-[#34A853] text-sm">ĐÃ TIẾP NHẬN</span>
                  </div>
                </div>

                {/* Slogan and Location */}
                <div className="pt-3 border-t-2 border-dashed border-[#1E1E1E]/30 flex items-center justify-between font-mono-code text-[11px]">
                  <span className="font-bold text-[#1E1E1E]/75">
                    "{CHAPTER_INFO.slogan}"
                  </span>
                  <span className="font-bold text-[#4285F4]">
                    FPTU HCMC • Fall 2026
                  </span>
                </div>
              </div>

              {/* Next steps guidance */}
              <div className="p-4 bg-[#F8F9FA] border-2 border-[#1E1E1E] rounded-2xl text-xs space-y-1.5 text-[#1E1E1E]/90">
                <span className="font-bold text-[#1E1E1E] block font-mono-code uppercase text-[11px]">
                  📌 Các bước tiếp theo:
                </span>
                <p>1. Kiểm tra hòm thư <strong>{formData.email}</strong> để nhận thư xác nhận hồ sơ và link group trao đổi.</p>
                <p>2. Ban Nhân Sự sẽ liên hệ để thông báo lịch hẹn phỏng vấn trực tiếp tại Alpha Building (ĐH FPT TP.HCM).</p>
              </div>

              {/* Action */}
              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-bold text-sm rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm cursor-pointer"
              >
                Hoàn Tất & Quay Lại Trang Chủ
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
