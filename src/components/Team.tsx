import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Cloud,
  Code2,
  GraduationCap,
  Palette,
  CalendarCheck,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { LEAD_ROLES_DATA } from '../data/gdgData';
import { LeadRole } from '../types';

interface TeamProps {
  onApplyLead: (role: LeadRole) => void;
}

export const Team: React.FC<TeamProps> = ({ onApplyLead }) => {
  const [filterDivision, setFilterDivision] = useState<'ALL' | 'TECH' | 'NON-TECH'>('ALL');

  const getRoleIcon = (deptId: string, color: string) => {
    switch (deptId) {
      case 'tech-ai':
        return <BrainCircuit className="w-6 h-6" style={{ color }} />;
      case 'tech-cloud':
        return <Cloud className="w-6 h-6" style={{ color }} />;
      case 'tech-web':
        return <Code2 className="w-6 h-6" style={{ color }} />;
      case 'tech-research':
        return <GraduationCap className="w-6 h-6" style={{ color }} />;
      case 'nontech-media':
        return <Palette className="w-6 h-6" style={{ color }} />;
      case 'nontech-hr-event':
        return <CalendarCheck className="w-6 h-6" style={{ color }} />;
      default:
        return <Crown className="w-6 h-6" style={{ color }} />;
    }
  };

  const filteredRoles =
    filterDivision === 'ALL'
      ? LEAD_ROLES_DATA
      : filterDivision === 'TECH'
      ? LEAD_ROLES_DATA.filter((r) => r.division.includes('TECH') && !r.division.includes('NON-TECH'))
      : LEAD_ROLES_DATA.filter((r) => r.division.includes('NON-TECH'));

  return (
    <section id="leads" className="py-20 sm:py-28 bg-[#FFFFFF] border-t-2 border-[#1E1E1E] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE7A5] border-2 border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E]">
              <span>{'//'} 05. CORE TEAM / LEAD ROLES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Khung Tuyển Chọn Trưởng Ban
            </h2>
            <p className="text-base sm:text-lg text-[#1E1E1E]/75 max-w-2xl">
              Cơ hội lãnh đạo đội ngũ kỹ thuật và điều hành các sự kiện quy mô lớn trong kỳ Fall 2026 tại <strong>GDG on Campus FPT University HCMC</strong>.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-2xl brutal-shadow-sm self-start sm:self-auto">
            <button
              onClick={() => setFilterDivision('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
                filterDivision === 'ALL'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF]'
                  : 'text-[#1E1E1E] hover:bg-[#FFFFFF]'
              }`}
            >
              Tất Cả (6 Vị Trí)
            </button>
            <button
              onClick={() => setFilterDivision('TECH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
                filterDivision === 'TECH'
                  ? 'bg-[#4285F4] text-[#FFFFFF]'
                  : 'text-[#1E1E1E] hover:bg-[#FFFFFF]'
              }`}
            >
              Lead Khối Tech (4)
            </button>
            <button
              onClick={() => setFilterDivision('NON-TECH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
                filterDivision === 'NON-TECH'
                  ? 'bg-[#34A853] text-[#FFFFFF]'
                  : 'text-[#1E1E1E] hover:bg-[#FFFFFF]'
              }`}
            >
              Lead Khối Non-Tech (2)
            </button>
          </div>
        </div>

        {/* Lead Roles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((lead) => (
            <div
              key={lead.id}
              className="bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-[28px] p-6 brutal-shadow flex flex-col justify-between transition-all hover:-translate-y-1"
              style={{
                borderTopWidth: '8px',
                borderTopColor: lead.accentColor,
              }}
            >
              <div className="space-y-4">
                {/* Header: Icon, Badge & Title */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl border-2 border-[#1E1E1E] flex items-center justify-center shrink-0 shadow-inner"
                    style={{ backgroundColor: lead.pastelColor }}
                  >
                    {getRoleIcon(lead.departmentId, lead.accentColor)}
                  </div>

                  <span className="font-mono-code text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#1E1E1E] bg-[#CCF6C5] text-[#1E1E1E] flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
                    {lead.badge}
                  </span>
                </div>

                <div>
                  <span className="font-mono-code text-[10px] font-bold text-[#1E1E1E]/60 uppercase block">
                    {lead.division}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#1E1E1E] leading-snug">
                    {lead.role}
                  </h3>
                </div>

                {/* Sứ mệnh chính (Mission) */}
                <div className="p-3 bg-[#F0F0F0] border border-[#1E1E1E] rounded-xl text-xs text-[#1E1E1E]/90 leading-relaxed font-medium">
                  <span className="font-bold text-[#1E1E1E] block font-mono-code text-[11px] uppercase mb-1">
                    Sứ mệnh trọng tâm:
                  </span>
                  {lead.mission}
                </div>

                {/* Nhiệm vụ chính */}
                <div className="space-y-1.5">
                  <span className="font-mono-code text-[11px] font-bold text-[#1E1E1E]/70 uppercase block">
                    Nhiệm vụ lãnh đạo:
                  </span>
                  {lead.responsibilities.map((resp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#1E1E1E]/85">
                      <span className="font-mono-code text-[11px] font-bold text-[#4285F4] shrink-0 mt-0.5">
                        •
                      </span>
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>

                {/* Tiêu chí tuyển chọn */}
                <div className="space-y-1.5 pt-1">
                  <span className="font-mono-code text-[11px] font-bold text-[#1E1E1E]/70 uppercase block">
                    Tiêu chí ứng viên:
                  </span>
                  {lead.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#1E1E1E]/85">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-[#1E1E1E]/10">
                <button
                  onClick={() => onApplyLead(lead)}
                  className="w-full py-3 px-4 bg-[#1E1E1E] hover:bg-[#4285F4] text-[#FFFFFF] font-bold text-xs sm:text-sm font-mono-code rounded-xl border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Ứng Tuyển Vị Trí {lead.role.split('(')[0].trim()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Lead Opportunity Banner */}
        <div className="mt-14 p-6 sm:p-8 bg-[#C3ECF6] border-2 border-[#1E1E1E] rounded-[28px] brutal-shadow flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E]">
              Bạn sẵn sàng trở thành Thủ Lĩnh Công Nghệ tiếp theo?
            </h4>
            <p className="text-xs sm:text-sm text-[#1E1E1E]/80 max-w-2xl">
              Vị trí Trưởng ban mở cho cả thành viên nội bộ và các ứng viên tài năng khóa K19, K20, K21 Đại học FPT TP.HCM có mong muốn kiến tạo giá trị cộng đồng.
            </p>
          </div>

          <button
            onClick={() => onApplyLead(LEAD_ROLES_DATA[0])}
            className="px-6 py-3 bg-[#FFFFFF] hover:bg-[#FFE7A5] text-[#1E1E1E] font-bold text-xs sm:text-sm font-mono-code rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover shrink-0 cursor-pointer"
          >
            Đăng Ký Phỏng Vấn Lead Ngay
          </button>
        </div>

      </div>
    </section>
  );
};
