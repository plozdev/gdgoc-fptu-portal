import React from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  Flame,
  MapPin,
  CheckCircle2,
  Mail,
  Award,
  Users,
  Check,
  Inbox
} from 'lucide-react';

interface TimelineProps {
  onOpenJoinModal: () => void;
  onOpenJdHandbook?: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({ onOpenJoinModal }) => {
  return (
    <section id="timeline" className="py-16 sm:py-20 bg-[#FFFFFF] relative border-t border-[#1E1E1E]/10">
      {/* Decorative dot matrix background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* =====================================================================
            1. SECTION HEADER: Tinh gọn, hiện đại
            ===================================================================== */}
        <div className="mb-10 sm:mb-14">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE7A5] border-[2px] border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E] brutal-shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FBBC04] animate-ping" />
              <span>{'//'} 03. LỘ TRÌNH TUYỂN SINH GEN 4.0</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Timeline Tuyển Thành Viên
            </h2>
            <p className="text-sm sm:text-base text-[#1E1E1E]/80 font-normal leading-relaxed">
              Vòng 1 đã đóng đơn. GDGoC FPTU đang bước vào <strong>Giai đoạn 2: Sàng lọc hồ sơ & Gửi kết quả Vòng 1</strong>. Hãy lưu ý các mốc thời gian để chủ động đặt lịch hẹn.
            </p>
          </div>
        </div>

        {/* =====================================================================
            2. LINEAR ROADMAP (5 Chặng - Chặng 2 Active cân đối hoàn hảo)
            ===================================================================== */}
        <div className="relative">

          {/* PROGRESS TRACK (Desktop) */}
          <div className="hidden lg:flex items-center absolute top-[32px] left-4 right-4 pointer-events-none z-0">
            <div className="w-[50%] h-[3px] bg-[#34A853] rounded-l-full" />
            <div className="flex-1 h-0 border-t-[2.5px] border-dashed border-[#1E1E1E]/25" />
          </div>

          {/* Grid 5 Chặng: 2 - 4 - 2 - 2 - 2 (Tổng 12 cột) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch relative z-10">

            {/* =================================================================
                CHẶNG 1: MỞ ĐƠN (COMPLETED)
                ================================================================= */}
            <div className="md:col-span-1 lg:col-span-2 bg-[#F8F9FA] border-[2px] border-[#1E1E1E]/50 rounded-2xl p-4 sm:p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-3">
                  <span className="w-7 h-7 rounded-full bg-[#CCF6C5] text-[#34A853] flex items-center justify-center font-mono-code font-black text-xs border border-[#1E1E1E] relative z-30 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#E8EAED] text-[#1E1E1E]/70 border border-[#1E1E1E]/20">
                    Đã đóng đơn
                  </span>
                </div>

                <span className="font-mono-code text-[11px] font-bold text-[#1E1E1E]/60 block mb-1">
                  26/10 – 08/11
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mb-2 leading-snug">
                  Mở Đơn & Club Day
                </h4>
                <p className="text-xs text-[#1E1E1E]/70 leading-relaxed font-normal">
                  Hoàn tất tiếp nhận hồ sơ ứng tuyển 6 Ban chuyên môn và ngày hội trải nghiệm campus.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E1E1E]/10 flex items-center gap-1.5 text-[10px] font-mono-code text-[#34A853] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Đã khóa: 23:59 • 08/11</span>
              </div>
            </div>

            {/* =================================================================
                CHẶNG 2: SÀNG LỌC & KẾT QUẢ V1 (TÂM ĐIỂM - ACTIVE)
                ================================================================= */}
            <div className="md:col-span-2 lg:col-span-4 bg-[#FFFDF5] border-[2.5px] border-[#1E1E1E] rounded-2xl sm:rounded-3xl p-5 sm:p-6 brutal-shadow-md relative overflow-hidden flex flex-col justify-between ring-2 ring-[#FBBC04]">
              {/* Google 4-color top accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 grid grid-cols-4 z-10">
                <div className="bg-[#4285F4]" />
                <div className="bg-[#EA4335]" />
                <div className="bg-[#FBBC04]" />
                <div className="bg-[#34A853]" />
              </div>

              <div>
                {/* Header Node */}
                <div className="flex items-center justify-between gap-2 mb-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#FBBC04] text-[#1E1E1E] flex items-center justify-center font-mono-code font-black text-xs border-2 border-[#1E1E1E] shadow-xs shrink-0">
                      2
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FBBC04] text-[#1E1E1E] text-[10px] font-mono-code font-black border border-[#1E1E1E]">
                      <Flame className="w-3 h-3 text-[#EA4335] animate-bounce" />
                      ĐANG DIỄN RA
                    </span>
                  </div>

                  <span className="text-[10px] font-mono-code font-bold text-[#1E1E1E] bg-[#FFE7A5] px-2.5 py-0.5 rounded-full border border-[#1E1E1E] shrink-0">
                    Gửi mail: 10 – 11/11
                  </span>
                </div>

                {/* Main Copy: Tinh giản, súc tích */}
                <div className="space-y-1 mb-4">
                  <span className="font-mono-code text-[11px] font-bold text-[#D93025] block">
                    09/11 – 11/11/2026 • GIAI ĐOẠN HIỆN TẠI
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#1E1E1E] tracking-tight">
                    Sàng Lọc & Gửi Kết Quả Vòng 1
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1E1E1E]/80 leading-relaxed font-normal">
                    BCN đang chấm điểm hồ sơ. Thư mời kèm link <strong>tự chọn ca phỏng vấn</strong> sẽ được gửi trực tiếp đến hòm thư của bạn từ <strong>10/11 – 11/11</strong>.
                  </p>
                </div>

                {/* 2 Feature Badges Rộng Rãi - Cam kết không bao giờ bị cắt chữ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#1E1E1E]/20 text-[11px] font-mono-code font-bold text-[#1E1E1E]">
                    <Inbox className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
                    <span>Check Inbox & Spam</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#1E1E1E]/20 text-[11px] font-mono-code font-bold text-[#1E1E1E]">
                    <Clock className="w-3.5 h-3.5 text-[#EA4335] shrink-0" />
                    <span>Tự chọn ca phỏng vấn</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[#1E1E1E]/15 mt-2">
                <button
                  type="button"
                  onClick={onOpenJoinModal}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E1E1E] hover:bg-[#333333] text-white text-xs sm:text-sm font-extrabold rounded-xl border-[2px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#FFE7A5]" />
                  <span>Theo Dõi Thông Báo Email</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* =================================================================
                CHẶNG 3: VÒNG PHỎNG VẤN (UPCOMING)
                ================================================================= */}
            <div className="md:col-span-1 lg:col-span-2 bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-4 sm:p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-full bg-[#F8D8D8] text-[#EA4335] flex items-center justify-center font-mono-code font-black text-xs border border-[#1E1E1E] shrink-0">
                    3
                  </span>
                  <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#1E1E1E]/70 border border-[#1E1E1E]/20">
                    Vòng 2
                  </span>
                </div>

                <span className="font-mono-code text-[11px] font-bold text-[#EA4335] block mb-1">
                  Sau tuần thi FE
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mb-2 leading-snug">
                  Vòng Phỏng Vấn
                </h4>
                <p className="text-xs text-[#1E1E1E]/70 leading-relaxed font-normal">
                  Phỏng vấn trực tiếp 1:1 cùng BCN (15–20 phút) để đánh giá độ phù hợp định hướng.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E1E1E]/10 flex items-center gap-1.5 text-[10px] font-mono-code text-[#EA4335] font-bold">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">100% Offline tại trường</span>
              </div>
            </div>

            {/* =================================================================
                CHẶNG 4: GỬI OFFER TRÚNG TUYỂN (UPCOMING)
                ================================================================= */}
            <div className="md:col-span-1 lg:col-span-2 bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-4 sm:p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-full bg-[#CCF6C5] text-[#34A853] flex items-center justify-center font-mono-code font-black text-xs border border-[#1E1E1E] shrink-0">
                    4
                  </span>
                  <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#1E1E1E]/70 border border-[#1E1E1E]/20">
                    Kết quả
                  </span>
                </div>

                <span className="font-mono-code text-[11px] font-bold text-[#34A853] block mb-1">
                  Cuối tháng 11
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mb-2 leading-snug">
                  Gửi Offer Letter
                </h4>
                <p className="text-xs text-[#1E1E1E]/70 leading-relaxed font-normal">
                  Công bố kết quả và gửi thư mời gia nhập chính thức cho các ứng viên xuất sắc.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E1E1E]/10 flex items-center gap-1.5 text-[10px] font-mono-code text-[#34A853] font-bold">
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Chào đón Gen 4.0</span>
              </div>
            </div>

            {/* =================================================================
                CHẶNG 5: ONBOARDING & FIRST MEETING (UPCOMING)
                ================================================================= */}
            <div className="md:col-span-2 lg:col-span-2 bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-4 sm:p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-full bg-[#C3ECF6] text-[#4285F4] flex items-center justify-center font-mono-code font-black text-xs border border-[#1E1E1E] shrink-0">
                    5
                  </span>
                  <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[#1E1E1E]/70 border border-[#1E1E1E]/20">
                    Kick-off
                  </span>
                </div>

                <span className="font-mono-code text-[11px] font-bold text-[#4285F4] block mb-1">
                  Tháng 12/2026
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mb-2 leading-snug">
                  First Meeting
                </h4>
                <p className="text-xs text-[#1E1E1E]/70 leading-relaxed font-normal">
                  Gặp mặt toàn thể thành viên, bàn giao tài nguyên CLB và khởi động kỳ hoạt động mới.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E1E1E]/10 flex items-center gap-1.5 text-[10px] font-mono-code text-[#4285F4] font-bold">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Onboarding Thành Viên</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
