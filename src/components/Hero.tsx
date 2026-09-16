import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';
import { CHAPTER_INFO } from '../data/gdgData';
import { GdgBracketsGlyph } from './GdgLogo';

interface HeroProps {
  onOpenJoinModal: () => void;
  onOpenJdHandbook?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenJoinModal, onOpenJdHandbook }) => {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-dot-pattern">
      {/* Decorative Background Accents */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10 opacity-60">
        <div className="absolute top-10 left-4 w-72 h-72 bg-[#C3ECF6] rounded-full blur-3xl" />
        <div className="absolute top-16 right-12 w-80 h-80 bg-[#FFE7A5] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#CCF6C5] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">

            {/* Unified Sleek Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-full brutal-shadow-sm text-xs font-mono-code">
              <span className="flex items-center gap-1.5 font-bold text-[#34A853]">
                <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
                Tuyển Sinh Gen 4.0
              </span>
              <span className="text-[#1E1E1E]/30 font-bold">•</span>
              <span className="font-bold text-[#4285F4]">Fall 2026</span>
            </div>

            {/* Slogan & Main Heading */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono-code text-xs sm:text-sm font-bold tracking-wider text-[#1E1E1E]/90 uppercase">
                <span className="text-[#EA4335] font-extrabold">{'{'}</span>
                <span>GDG on Campus FPT University HCMC • Fall 2026</span>
                <span className="text-[#4285F4] font-extrabold">{'}'}</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1E1E1E] tracking-tight leading-[1.08]">
                Take Target <br className="hidden sm:inline" />
                <span className="relative inline-block mt-1">
                  <span className="relative z-10 text-[#4285F4]">Together</span>
                  {/* Flat Color Block Underline */}
                  <span className="absolute left-0 bottom-1.5 sm:bottom-2.5 w-full h-3.5 sm:h-5 bg-[#FFE7A5] -z-10 rounded-sm -rotate-1 border-[1.5px] border-[#1E1E1E]/40" />
                </span>
                <span className="text-[#EA4335]">.</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#1E1E1E]/90 font-medium leading-relaxed max-w-2xl">
              Cộng đồng công nghệ sinh viên hàng đầu tại <strong className="text-[#1E1E1E]">Đại học FPT TP.HCM</strong>. Nơi bạn làm chủ công nghệ mới nhất từ Google, kết nối chuyên gia GDE và cùng đồng đội tạo nên những sản phẩm thực tế có sức ảnh hưởng.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <button
                onClick={onOpenJoinModal}
                id="hero-join-community-btn"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-bold text-base rounded-full border-[2.5px] border-[#1E1E1E] brutal-shadow brutal-shadow-hover cursor-pointer whitespace-nowrap"
              >
                <span>Gia Nhập Gen 4.0 Ngay</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('departments');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                id="hero-scroll-departments-btn"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFFFFF] hover:bg-[#FFE7A5] text-[#1E1E1E] font-bold text-base rounded-full border-[2.5px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 text-[#4285F4]" />
                <span>Khám Phá 6 Ban Chuyên Môn</span>
              </button>
            </div>

          </div>

          {/* Right Column: Digital Admission Pass & Chapter Recognition */}
          <div className="lg:col-span-5 space-y-4">

            {/* Card 1: Official Gen 4.0 Digital Admission Pass */}
            <div className="relative bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-[28px] brutal-shadow overflow-hidden p-6">

              {/* Google 4-Color Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-[#EA4335]" />
                <div className="flex-1 bg-[#FBBC04]" />
                <div className="flex-1 bg-[#34A853]" />
                <div className="flex-1 bg-[#4285F4]" />
              </div>

              {/* Pass Header */}
              <div className="flex items-center justify-between pt-2 pb-4 border-b-2 border-[#1E1E1E]/15">
                <div className="flex items-center gap-2.5">
                  <GdgBracketsGlyph size={32} />
                  <div>
                    <span className="font-extrabold text-sm text-[#1E1E1E] block leading-tight">
                      GDG on Campus FPTU
                    </span>
                    <span className="font-mono-code text-[11px] font-bold text-[#4285F4]">
                      OFFICIAL ADMISSION PASS
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-[#CCF6C5] border-2 border-[#1E1E1E] rounded-full text-[10px] font-mono-code font-extrabold text-[#1E1E1E] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
                  ONLINE
                </span>
              </div>

              {/* Pass Ticket Body */}
              <div className="py-4 space-y-3 font-mono-code">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#1E1E1E]/60 uppercase">ĐỐI TƯỢNG:</span>
                  <span className="font-extrabold text-[#1E1E1E] bg-[#FFE7A5] px-2 py-0.5 rounded border border-[#1E1E1E]">
                    Tân Sinh Viên Gen 4.0
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#1E1E1E]/60 uppercase">HỌC KỲ:</span>
                  <span className="font-bold text-[#1E1E1E]">Fall 2026 • Campus HCMC</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#1E1E1E]/60 uppercase">ĐẶC QUYỀN:</span>
                  <span className="font-bold text-[#4285F4]">Google Cloud Boost & Codelab</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#1E1E1E]/60 uppercase">TIẾP NHẬN:</span>
                  <span className="font-bold text-[#34A853]">Phỏng vấn cuốn chiếu</span>
                </div>
              </div>

              {/* Simulated Barcode & Pass ID */}
              <div className="pt-3 border-t-2 border-dashed border-[#1E1E1E]/20 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-6 flex items-center gap-1 opacity-70">
                    {[3, 1, 4, 2, 5, 2, 3, 1, 4, 3, 2, 4, 1, 3, 2, 5, 1, 4].map((w, i) => (
                      <div
                        key={i}
                        className="bg-[#1E1E1E] h-full rounded-[1px]"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono-code font-bold text-[#1E1E1E]/70 block">
                    ID: GDGOC-FPTU-K22-ADMIT
                  </span>
                </div>

                <button
                  onClick={onOpenJoinModal}
                  className="px-4 py-2 bg-[#1E1E1E] hover:bg-[#4285F4] text-[#FFFFFF] font-mono-code text-xs font-bold rounded-xl border-2 border-[#1E1E1E] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Nộp Đơn</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Official Chapter Honor Card */}
            <div className="p-4 bg-[#FFE7A5] border-[2.5px] border-[#1E1E1E] rounded-[24px] brutal-shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFFFFF] border-2 border-[#1E1E1E] flex items-center justify-center text-[#EA4335] shrink-0 shadow-xs">
                  <Award className="w-6 h-6 text-[#EA4335]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-[10px] font-extrabold px-2 py-0.5 bg-[#FFFFFF] border border-[#1E1E1E] rounded-full text-[#EA4335]">
                      AI Riser Vietnam 2026
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] leading-tight mt-0.5">
                    "The GDGoC Impact Maker"
                  </h4>
                  <p className="text-[11px] font-mono-code text-[#1E1E1E]/80">
                    Google Developer Ecosystem Recognition
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
