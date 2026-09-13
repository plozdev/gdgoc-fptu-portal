import React, { useState } from 'react';
import { X, Check, ArrowRight, BookOpen, Layers, Sparkles, CheckCircle2, ShieldAlert, Award, FileText } from 'lucide-react';
import { Department } from '../types';
import { DEPARTMENTS_DATA } from '../data/gdgData';

interface TrackDetailModalProps {
  department: Department | null;
  onClose: () => void;
  onJoinDepartment: (deptName: string) => void;
}

export const TrackDetailModal: React.FC<TrackDetailModalProps> = ({
  department,
  onClose,
  onJoinDepartment,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(department?.id || DEPARTMENTS_DATA[0].id);

  if (!department) return null;

  // Allow switching between JDs directly in the handbook view
  const currentDept = DEPARTMENTS_DATA.find((d) => d.id === selectedDeptId) || department;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1E1E]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-[28px] brutal-shadow-lg max-h-[90vh] overflow-y-auto">
        
        {/* Modal Top Bar */}
        <div className="sticky top-0 bg-[#FFFFFF] border-b-2 border-[#1E1E1E] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span
              className="px-2.5 py-1 text-xs font-mono-code font-bold rounded-lg border border-[#1E1E1E]"
              style={{ backgroundColor: currentDept.pastelColor }}
            >
              KHỐI {currentDept.division}
            </span>
            <span className="font-mono-code text-xs font-bold text-[#1E1E1E] uppercase">
              Sổ Tay JD Tuyển Sinh Fall 2026
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-[#1E1E1E] hover:bg-[#F0F0F0] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#1E1E1E]" />
          </button>
        </div>

        {/* Quick Department Selector Pills inside Modal */}
        <div className="bg-[#F0F0F0] border-b border-[#1E1E1E]/20 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs font-mono-code">
          <span className="text-[#1E1E1E]/60 font-bold shrink-0">Chọn Ban:</span>
          {DEPARTMENTS_DATA.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeptId(d.id)}
              className={`px-3 py-1 rounded-lg border font-semibold shrink-0 transition-all cursor-pointer ${
                currentDept.id === d.id
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border-[#1E1E1E]'
                  : 'bg-[#FFFFFF] text-[#1E1E1E] border-[#1E1E1E]/30 hover:bg-[#FFE7A5]'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header info */}
          <div
            className="p-6 rounded-2xl border-2 border-[#1E1E1E] space-y-2"
            style={{ backgroundColor: currentDept.pastelColor }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono-code text-xs font-bold text-[#1E1E1E]/70 uppercase">
                {currentDept.vietnameseName}
              </span>
              <span className="px-2 py-0.5 bg-[#FFFFFF] border border-[#1E1E1E] rounded text-[11px] font-mono-code font-bold">
                Tuyển Sinh Gen K22
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">
              {currentDept.name}
            </h3>
            <p className="text-sm text-[#1E1E1E]/90 leading-relaxed font-medium">
              {currentDept.jd.overview}
            </p>
          </div>

          {/* Key Responsibilities */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-base text-[#1E1E1E] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#4285F4]" />
              Trách Nhiệm Chính (Key Responsibilities)
            </h4>
            <div className="space-y-2">
              {currentDept.jd.responsibilities.map((resp, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#F0F0F0] border border-[#1E1E1E] rounded-xl flex items-start gap-3"
                >
                  <span className="font-mono-code text-xs font-bold text-[#4285F4] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#1E1E1E] shrink-0">
                    0{i + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#1E1E1E]">
                    {resp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-base text-[#1E1E1E] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#EA4335]" />
              Yêu Cầu Tuyển Dụng (Requirements)
            </h4>
            <div className="space-y-2">
              {currentDept.jd.requirements.map((req, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#FFFFFF] border border-[#1E1E1E] rounded-xl flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[#1E1E1E]/90">
                    {req}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-base text-[#1E1E1E] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FBBC04]" />
              Quyền Lợi Dành Cho Bạn (Benefits)
            </h4>
            <div className="space-y-2">
              {currentDept.jd.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#CCF6C5] border border-[#1E1E1E] rounded-xl flex items-start gap-3"
                >
                  <Sparkles className="w-4 h-4 text-[#1E1E1E] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1E1E1E]">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Skills Tags */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs font-mono-code text-[#1E1E1E] uppercase">
              Tech Stack & Công Cụ Trọng Tâm:
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentDept.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-lg text-xs font-mono-code font-bold text-[#1E1E1E]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                onJoinDepartment(currentDept.name);
              }}
              className="flex-1 py-3.5 px-6 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-bold text-sm rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ứng Tuyển {currentDept.name} (Gen K22)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="py-3.5 px-6 bg-[#F0F0F0] text-[#1E1E1E] font-bold text-xs font-mono-code rounded-full border-2 border-[#1E1E1E] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
