import React, { useState } from 'react';
import {
  BrainCircuit,
  Cloud,
  Code2,
  GraduationCap,
  Palette,
  CalendarCheck,
  ArrowRight,
  Sparkles,
  Check,
  BookOpen,
  FileText
} from 'lucide-react';
import { DEPARTMENTS_DATA } from '../data/gdgData';
import { Department } from '../types';

interface TracksProps {
  onSelectDepartment: (dept: Department) => void;
  onOpenJoinModal: (departmentName?: string) => void;
}

export const Tracks: React.FC<TracksProps> = ({ onSelectDepartment, onOpenJoinModal }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'TECH' | 'NON-TECH'>('ALL');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getDeptIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'BrainCircuit':
        return <BrainCircuit className="w-7 h-7" style={{ color }} />;
      case 'Cloud':
        return <Cloud className="w-7 h-7" style={{ color }} />;
      case 'Code2':
        return <Code2 className="w-7 h-7" style={{ color }} />;
      case 'GraduationCap':
        return <GraduationCap className="w-7 h-7" style={{ color }} />;
      case 'Palette':
        return <Palette className="w-7 h-7" style={{ color }} />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-7 h-7" style={{ color }} />;
      default:
        return <FileText className="w-7 h-7" style={{ color }} />;
    }
  };

  const techDepts = DEPARTMENTS_DATA.filter((d) => d.division === 'TECH');
  const nonTechDepts = DEPARTMENTS_DATA.filter((d) => d.division === 'NON-TECH');

  const displayedDepts =
    activeTab === 'ALL'
      ? DEPARTMENTS_DATA
      : DEPARTMENTS_DATA.filter((d) => d.division === activeTab);

  return (
    <section id="departments" className="py-20 sm:py-28 bg-[#F0F0F0] border-t-2 border-[#1E1E1E] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE7A5] border-2 border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E]">
              <span>{'//'} 02. CÁC BAN CHUYÊN MÔN</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Khối Tech & Khối Non-Tech
            </h2>
            <p className="text-base sm:text-lg text-[#1E1E1E]/75 max-w-2xl">
              Cơ cấu tổ chức thực tế của <strong>GDG on Campus FPT University HCMC</strong> kỳ Fall 2026. Chọn đúng ban đam mê để phát triển năng lực vượt bậc.
            </p>
          </div>

          {/* Division Filter Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-2xl brutal-shadow-sm self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF]'
                  : 'text-[#1E1E1E] hover:bg-[#F0F0F0]'
              }`}
            >
              Tất Cả (6 Ban)
            </button>
            <button
              onClick={() => setActiveTab('TECH')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
                activeTab === 'TECH'
                  ? 'bg-[#4285F4] text-[#FFFFFF]'
                  : 'text-[#1E1E1E] hover:bg-[#F0F0F0]'
              }`}
            >
              Khối Tech (4)
            </button>
            <button
              onClick={() => setActiveTab('NON-TECH')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
                activeTab === 'NON-TECH'
                  ? 'bg-[#34A853] text-[#FFFFFF]'
                  : 'text-[#1E1E1E] hover:bg-[#F0F0F0]'
              }`}
            >
              Khối Non-Tech (2)
            </button>
          </div>
        </div>

        {/* Division Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="p-4 bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-2xl flex items-center justify-between brutal-shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C3ECF6] border-2 border-[#1E1E1E] flex items-center justify-center font-mono-code font-extrabold text-[#4285F4]">
                T
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E]">KHỐI TECH (Kỹ Thuật & Công Nghệ)</h4>
                <p className="text-xs text-[#1E1E1E]/70 font-mono-code">AI • Cloud • Web Development • Research</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-[#F0F0F0] border border-[#1E1E1E] rounded-lg text-xs font-mono-code font-bold">
              4 Ban
            </span>
          </div>

          <div className="p-4 bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-2xl flex items-center justify-between brutal-shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#CCF6C5] border-2 border-[#1E1E1E] flex items-center justify-center font-mono-code font-extrabold text-[#34A853]">
                NT
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E]">KHỐI NON-TECH (Truyền Thông & Vận Hành)</h4>
                <p className="text-xs text-[#1E1E1E]/70 font-mono-code">Media • HR & Event</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-[#F0F0F0] border border-[#1E1E1E] rounded-lg text-xs font-mono-code font-bold">
              2 Ban
            </span>
          </div>
        </div>

        {/* Departments Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedDepts.map((dept) => {
            const isHovered = hoveredCard === dept.id;

            return (
              <div
                key={dept.id}
                onMouseEnter={() => setHoveredCard(dept.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-[26px] p-6 brutal-shadow transition-all duration-200 flex flex-col justify-between ${
                  isHovered ? '-translate-y-1' : ''
                }`}
                style={{
                  boxShadow: isHovered
                    ? `6px 6px 0px ${dept.coreColor}`
                    : '4px 4px 0px #1E1E1E',
                }}
              >
                <div>
                  {/* Card Header: Icon, Division Badge & Color tag */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl border-2 border-[#1E1E1E] flex items-center justify-center shadow-inner shrink-0"
                        style={{ backgroundColor: dept.pastelColor }}
                      >
                        {getDeptIcon(dept.iconName, dept.coreColor)}
                      </div>
                      <div>
                        <span
                          className={`font-mono-code text-[10px] font-bold px-2 py-0.5 rounded border border-[#1E1E1E] inline-block mb-0.5 ${
                            dept.division === 'TECH'
                              ? 'bg-[#C3ECF6] text-[#1E1E1E]'
                              : 'bg-[#CCF6C5] text-[#1E1E1E]'
                          }`}
                        >
                          KHỐI {dept.division}
                        </span>
                        <h3 className="text-xl font-extrabold text-[#1E1E1E] tracking-tight leading-tight">
                          {dept.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#1E1E1E]/60 font-mono-code">
                          {dept.vietnameseName}
                        </p>
                      </div>
                    </div>

                    <div
                      className="w-4 h-4 rounded-full border-2 border-[#1E1E1E] shrink-0"
                      style={{ backgroundColor: dept.coreColor }}
                    />
                  </div>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-[#1E1E1E]/85 leading-relaxed mb-4 min-h-[44px]">
                    {dept.shortDesc}
                  </p>

                  {/* Tech-Stack / Related Skills Tags */}
                  <div className="space-y-1.5 mb-6">
                    <span className="text-[11px] font-mono-code font-bold text-[#1E1E1E]/70 block uppercase">
                      Kỹ năng & Công cụ liên quan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-[#F0F0F0] border border-[#1E1E1E]/30 rounded-md text-[11px] font-mono-code font-semibold text-[#1E1E1E]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (JD Chi Tiết & Ứng Tuyển) */}
                <div className="pt-4 border-t-2 border-[#1E1E1E]/10 flex items-center gap-2">
                  <button
                    onClick={() => onSelectDepartment(dept)}
                    className="flex-1 py-2.5 px-3 bg-[#FFFFFF] hover:bg-[#FFE7A5] text-[#1E1E1E] font-bold text-xs font-mono-code rounded-xl border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#1E1E1E]" />
                    <span>Xem JD Chi Tiết</span>
                  </button>

                  <button
                    onClick={() => onOpenJoinModal(dept.name)}
                    className="py-2.5 px-3.5 bg-[#1E1E1E] hover:bg-[#4285F4] text-[#FFFFFF] font-bold text-xs rounded-xl border-2 border-[#1E1E1E] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title={`Ứng tuyển ${dept.name}`}
                  >
                    <span>Ứng Tuyển</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
