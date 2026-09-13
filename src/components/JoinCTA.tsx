import React from 'react';
import { ArrowRight, BookOpen, Sparkles, Trophy, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import { CHAPTER_INFO } from '../data/gdgData';

interface JoinCTAProps {
  onOpenJoinModal: () => void;
  onOpenJdHandbook?: () => void;
}

export const JoinCTA: React.FC<JoinCTAProps> = ({ onOpenJoinModal, onOpenJdHandbook }) => {
  return (
    <section className="py-20 sm:py-28 bg-[#FFFFFF] border-t-2 border-[#1E1E1E] relative overflow-hidden">
      
      {/* Neo-brutalist Background Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#FFE7A5] border-2 border-[#1E1E1E] rounded-[36px] p-8 sm:p-14 brutal-shadow-lg relative overflow-hidden">
          
          {/* Top Decorative Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#EA4335] mb-6 shadow-sm">
            <Trophy className="w-4 h-4 text-[#FBBC04]" />
            <span>TOP 1 GDGOC AI RISER VIETNAM 2026</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-2">
                <span className="font-mono-code text-xs font-bold text-[#1E1E1E]/60 uppercase tracking-wider block">
                  CỔNG TUYỂN SINH GEN K22 • KỲ FALL 2026
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight leading-tight">
                  Trở Thành Một Phần Của <br />
                  <span className="text-[#4285F4]">GDGoC FPT University HCMC</span>
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#1E1E1E]/85 max-w-2xl leading-relaxed">
                Đừng bỏ lỡ cơ hội thực chiến cùng hệ sinh thái công nghệ của Google, quản trị các sự kiện bùng nổ, và mở rộng mạng lưới quan hệ công nghệ đỉnh cao ngay trên campus Đại học FPT TP.HCM.
              </p>

              {/* Checklist */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono-code font-bold text-[#1E1E1E]">
                <div className="flex items-center gap-2 bg-[#FFFFFF]/80 p-2.5 rounded-xl border border-[#1E1E1E]">
                  <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                  <span>Dành cho sinh viên mọi chuyên ngành</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FFFFFF]/80 p-2.5 rounded-xl border border-[#1E1E1E]">
                  <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                  <span>2 Khối: Tech & Non-Tech (6 Ban)</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FFFFFF]/80 p-2.5 rounded-xl border border-[#1E1E1E]">
                  <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                  <span>Miễn phí tài khoản Google Cloud Boost</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FFFFFF]/80 p-2.5 rounded-xl border border-[#1E1E1E]">
                  <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                  <span>Cơ hội trở thành Trưởng Ban (Lead Roles)</span>
                </div>
              </div>

              {/* Action Buttons (Strictly matching User Prompt #5) */}
              <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={onOpenJoinModal}
                  id="cta-join-now-btn"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-bold text-base rounded-full border-2 border-[#1E1E1E] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
                >
                  <span>Ứng Tuyển Thành Viên K22</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={onOpenJdHandbook ? onOpenJdHandbook : () => {
                    const el = document.getElementById('departments');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  id="cta-view-jd-btn"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#FFFFFF] hover:bg-[#F0F0F0] text-[#1E1E1E] font-bold text-base rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#FBBC04]" />
                  <span>Xem Sổ Tay JD Tuyển Sinh</span>
                </button>
              </div>
            </div>

            {/* Right Badge Widget */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-[28px] p-6 brutal-shadow text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#CCF6C5] border-2 border-[#1E1E1E] flex items-center justify-center text-[#34A853] mx-auto shadow-sm">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <div className="font-mono-code text-xs font-bold text-[#EA4335] uppercase">
                    Hạn Chót Đăng Ký Đợt 1
                  </div>
                  <h4 className="font-extrabold text-xl text-[#1E1E1E]">
                    Kỳ Tuyển Fall 2026
                  </h4>
                  <p className="text-xs text-[#1E1E1E]/70 font-mono-code">
                    Phỏng vấn cuốn chiếu trực tiếp tại campus FPTU HCMC
                  </p>
                </div>

                <div className="p-3 bg-[#F0F0F0] border border-[#1E1E1E] rounded-xl text-xs font-mono-code text-[#1E1E1E] space-y-1 text-left">
                  <div><strong>Trụ sở:</strong> ĐH FPT TP.HCM (SHTP)</div>
                  <div><strong>Quy mô:</strong> Tuyển K22 & Lead Roles</div>
                  <div><strong>Email:</strong> {CHAPTER_INFO.email}</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
