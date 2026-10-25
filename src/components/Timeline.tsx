import React from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  MapPin,
  CheckCircle2,
  GraduationCap,
  Mail,
  Award,
  Users
} from 'lucide-react';

interface TimelineProps {
  onOpenJoinModal: () => void;
  onOpenJdHandbook?: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({ onOpenJoinModal }) => {
  return (
    <section id="timeline" className="py-16 sm:py-24 bg-[#FFFFFF] relative border-t border-[#1E1E1E]/10">
      {/* Decorative dot matrix background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* =====================================================================
            1. SECTION HEADER: Chuẩn hóa, không chứa tài liệu nội bộ / sổ tay lẻ
            ===================================================================== */}
        <div className="mb-12 sm:mb-16">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFE7A5] border-[2px] border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E] brutal-shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-ping" />
              <span>{'//'} 03. LỘ TRÌNH TUYỂN SINH GEN 4.0</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Timeline Tuyển Thành Viên
            </h2>
            <p className="text-sm sm:text-base text-[#1E1E1E]/80 font-normal leading-relaxed">
              Lộ trình tuyển sinh Gen 4.0 chính thức diễn ra trong 5 chặng. Nắm rõ các mốc quan trọng để không bỏ lỡ cơ hội gia nhập GDGoC FPTU.
            </p>
          </div>
        </div>

        {/* =====================================================================
            2. TRUE LINEAR ROADMAP (Trục thời gian 5 chặng xuyên suốt)
            ===================================================================== */}
        <div className="relative">
          
          {/* ===================================================================
              PROGRESS TRACK: Đường ray chạy ngang kết nối các chặng (Desktop)
              Nằm ở tầng z-0, kết nối liền mạch qua các khe hở giữa 5 khối card
              =================================================================== */}
          <div className="hidden lg:flex items-center absolute top-[36px] left-4 right-4 pointer-events-none z-0">
            {/* Active track segment up to Card 1 */}
            <div className="w-[33.3%] h-[3px] bg-[#4285F4] rounded-l-full shadow-xs" />
            {/* Dashed track across Cards 2, 3, 4, 5 */}
            <div className="flex-1 h-0 border-t-[2.5px] border-dashed border-[#1E1E1E]/30" />
          </div>

          {/* 5-Stage Linear Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
            
            {/* =================================================================
                CHẶNG 1: ĐANG MỞ ĐƠN & CLUB DAY (TÂM ĐIỂM CHIẾM 4 CỘT)
                Trạng thái: ACTIVE • Google Blue Card • CTA chính trang web
                ================================================================= */}
            <div className="lg:col-span-4 bg-[#E8F0FE] border-[2.5px] border-[#1E1E1E] rounded-3xl p-6 brutal-shadow-lg relative overflow-hidden flex flex-col justify-between ring-2 ring-[#4285F4] scale-[1.01]">
              {/* Google 4-color accent top strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 grid grid-cols-4 z-10">
                <div className="bg-[#4285F4]"></div>
                <div className="bg-[#EA4335]"></div>
                <div className="bg-[#FBBC04]"></div>
                <div className="bg-[#34A853]"></div>
              </div>

              <div>
                {/* Milestone Node Header */}
                <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-mono-code font-black text-xs border-2 border-[#1E1E1E] shadow-xs relative z-30 shrink-0">
                      1
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4285F4] text-white text-[11px] font-mono-code font-extrabold border border-[#1E1E1E] relative z-30">
                      <Flame className="w-3 h-3 text-[#FFE7A5] animate-bounce" />
                      ĐANG MỞ ĐƠN
                    </span>
                  </div>

                  <span className="text-[11px] font-mono-code font-bold text-[#EA4335] bg-[#F8D8D8] px-2.5 py-0.5 rounded-full border border-[#1E1E1E] relative z-30 shrink-0">
                    Hạn 23:59 • 08/11
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <span className="font-mono-code text-xs font-bold text-[#4285F4] block">
                    25/10 – 08/11/2026
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1E1E1E] tracking-tight">
                    Mở Đơn & Ngày Hội Club Day
                  </h3>
                  <p className="text-xs text-[#1E1E1E]/80 leading-relaxed font-normal">
                    Mở đơn online cho 6 Ban chuyên môn. Trực tiếp ghé thăm gian hàng CLB tại sảnh campus FPTU vào ngày <strong>01/11</strong> để trải nghiệm AI và nhận Sticker Google.
                  </p>
                </div>

                {/* Structured Micro-tags */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-[#1E1E1E]/15 text-[11px] font-mono-code font-bold text-[#1E1E1E]/90">
                    <Sparkles className="w-3 h-3 text-[#4285F4]" />
                    6 Ban Chuyên Môn
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-[#1E1E1E]/15 text-[11px] font-mono-code font-bold text-[#1E1E1E]/90">
                    <MapPin className="w-3 h-3 text-[#EA4335]" />
                    Gian hàng Club Day 01/11
                  </span>
                </div>
              </div>

              {/* Central CTA Button */}
              <div className="pt-4 border-t border-[#1E1E1E]/15 mt-3">
                <button
                  type="button"
                  onClick={onOpenJoinModal}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-extrabold rounded-2xl border-[2px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FFE7A5]" />
                  <span>Nộp Đơn Ứng Tuyển Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* =================================================================
                CÁC CHẶNG TƯƠNG LAI (MUTED / GHOST STYLE - CHIẾM 8 CỘT)
                Chia đều 4 thẻ cột, bổ sung micro-elements để xóa khoảng trống thừa
                ================================================================= */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* CHẶNG 2: KẾT QUẢ VÒNG ĐƠN */}
              <div className="bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-[#FFE7A5] text-[#1E1E1E] flex items-center justify-center font-mono-code font-black text-xs border border-[#1E1E1E] relative z-30 shrink-0">
                      2
                    </span>
                    <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#1E1E1E]/70 border border-[#1E1E1E]/20 relative z-30">
                      Sắp tới
                    </span>
                  </div>

                  <span className="font-mono-code text-[11px] font-bold text-[#1E1E1E]/60 block mb-1">
                    10/11 – 11/11/2026
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mb-1.5 leading-snug">
                    Kết Quả Vòng Đơn
                  </h4>
                  <p className="text-xs text-[#1E1E1E]/70 leading-relaxed font-normal mb-3">
                    Gửi thư thông báo kết quả Vòng 1 qua email kèm link chủ động chọn ca phỏng vấn.
                  </p>

                  {/* Micro-tags */}
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F8F9FA] border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                      <Mail className="w-3 h-3 text-[#4285F4] shrink-0" />
                      <span className="truncate">Hòm thư cá nhân</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F8F9FA] border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                      <Clock className="w-3 h-3 text-[#EA4335] shrink-0" />
                      <span className="truncate">Chủ động đặt ca</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E1E1E]/10 flex items-center gap-1.5 text-[11px] font-mono-code text-[#1E1E1E]/70 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Email & Lịch PV</span>
                </div>
              </div>

              {/* CHẶNG 3: VÒNG PHỎNG VẤN (100% OFFLINE TẠI PHÒNG HỌC FPTU) */}
              <div className="bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-[#F8D8D8] text-[#EA4335] flex items-center justify-center font-mono-code font-black text-xs border border-[#1E1E1E] relative z-30 shrink-0">
                      3
                    </span>
                    <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#1E1E1E]/70 border border-[#1E1E1E]/20 relative z-30">
                      Vòng 2
                    </span>
                  </div>

                  <span className="font-mono-code text-[11px] font-bold text-[#EA4335] block mb-1">
                    Sau tuần thi FE
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mb-1.5 leading-snug">
                    Vòng Phỏng Vấn
                  </h4>
                  <p className="text-xs text-[#1E1E1E]/70 leading-relaxed font-normal mb-3">
                    Phỏng vấn trực tiếp tại phòng học Campus FPTU (15-20p) để hiểu rõ định hướng và sự phù hợp.
                  </p>

                  {/* Micro-tags */}
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F8F9FA] border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                      <MapPin className="w-3 h-3 text-[#EA4335] shrink-0" />
                      <span className="truncate">Phòng học tại FPTU</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F8F9FA] border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                      <Users className="w-3 h-3 text-[#EA4335] shrink-0" />
                      <span className="truncate">Phỏng vấn trực tiếp</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E1E1E]/10 flex items-center gap-1.5 text-[11px] font-mono-code text-[#1E1E1E]/70 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#EA4335]" />
                  <span>100% Offline tại trường</span>
                </div>
              </div>

              {/* CHẶNG 4: GỬI OFFER TRÚNG TUYỂN */}
              <div className="bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-[#CCF6C5] text-[#34A853] flex items-center justify-center font-mono-code font-black text-xs border border-[#1E1E1E] relative z-30 shrink-0">
                      4
                    </span>
                    <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#1E1E1E]/70 border border-[#1E1E1E]/20 relative z-30">
                      Kết quả cuối
                    </span>
                  </div>

                  <span className="font-mono-code text-[11px] font-bold text-[#34A853] block mb-1">
                    Cuối tháng 11
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mb-1.5 leading-snug">
                    Gửi Offer Letter
                  </h4>
                  <p className="text-xs text-[#1E1E1E]/70 leading-relaxed font-normal mb-3">
                    Gửi thư mời trúng tuyển chính thức gia nhập thế hệ thành viên Gen 4.0.
                  </p>

                  {/* Micro-tags */}
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F8F9FA] border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                      <Award className="w-3 h-3 text-[#34A853] shrink-0" />
                      <span className="truncate">Thư mời trúng tuyển</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F8F9FA] border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                      <CheckCircle2 className="w-3 h-3 text-[#34A853] shrink-0" />
                      <span className="truncate">Xác nhận gia nhập</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E1E1E]/10 flex items-center gap-1.5 text-[11px] font-mono-code text-[#1E1E1E]/70 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#34A853]" />
                  <span>Chào đón Gen 4.0</span>
                </div>
              </div>

              {/* CHẶNG 5: ONBOARDING & FIRST MEETING */}
              <div className="bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-[#C3ECF6] text-[#4285F4] flex items-center justify-center font-mono-code font-black text-xs border border-[#1E1E1E] relative z-30 shrink-0">
                      5
                    </span>
                    <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#1E1E1E]/70 border border-[#1E1E1E]/20 relative z-30">
                      Kick-off
                    </span>
                  </div>

                  <span className="font-mono-code text-[11px] font-bold text-[#4285F4] block mb-1">
                    Tháng 12/2026
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mb-1.5 leading-snug">
                    First Meeting
                  </h4>
                  <p className="text-xs text-[#1E1E1E]/70 leading-relaxed font-normal mb-3">
                    Gặp mặt toàn thể thành viên, bàn giao tài nguyên học thuật và kích hoạt kỳ Fall 2026.
                  </p>

                  {/* Micro-tags */}
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F8F9FA] border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                      <Users className="w-3 h-3 text-[#4285F4] shrink-0" />
                      <span className="truncate">Toàn thể thành viên</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F8F9FA] border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                      <GraduationCap className="w-3 h-3 text-[#FBBC04] shrink-0" />
                      <span className="truncate">Bàn giao OS & Mail</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E1E1E]/10 flex items-center gap-1.5 text-[11px] font-mono-code text-[#1E1E1E]/70 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Khởi động Fall 2026</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
