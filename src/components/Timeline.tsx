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
    <section id="timeline" className="py-16 sm:py-24 bg-[#FFFFFF] relative border-t border-[#1E1E1E]/10">
      {/* Decorative dot matrix background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* =====================================================================
            1. SECTION HEADER: Cập nhật sang Giai đoạn 2 (Sàng Lọc & Kết Quả V1)
            ===================================================================== */}
        <div className="mb-12 sm:mb-16">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFE7A5] border-[2px] border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E] brutal-shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FBBC04] animate-ping" />
              <span>{'//'} 03. LỘ TRÌNH TUYỂN SINH GEN 4.0</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Timeline Tuyển Thành Viên
            </h2>
            <p className="text-sm sm:text-base text-[#1E1E1E]/80 font-normal leading-relaxed">
              Vòng 1 đã chính thức khép lại. GDGoC FPTU đang bước vào <strong>Giai đoạn 2: Sàng lọc hồ sơ & Gửi kết quả Vòng 1</strong>. Nắm rõ các mốc tiếp theo để chủ động đặt ca phỏng vấn.
            </p>
          </div>
        </div>

        {/* =====================================================================
            2. TRUE LINEAR ROADMAP (Trục thời gian 5 chặng - Chặng 2 là Tâm Điểm)
            ===================================================================== */}
        <div className="relative">

          {/* ===================================================================
              PROGRESS TRACK: Đường ray chạy ngang kết nối các chặng (Desktop)
              Từ Chặng 1 đến hết Chặng 2 (50%) là vạch hoàn thành/đang diễn ra
              =================================================================== */}
          <div className="hidden lg:flex items-center absolute top-[36px] left-4 right-4 pointer-events-none z-0">
            {/* Completed & Active track up to end of Card 2 (50% layout) */}
            <div className="w-[50%] h-[3px] bg-[#34A853] rounded-l-full shadow-xs" />
            {/* Dashed track across Cards 3, 4, 5 */}
            <div className="flex-1 h-0 border-t-[2.5px] border-dashed border-[#1E1E1E]/30" />
          </div>

          {/* 5-Stage Linear Grid: 2 - 4 - 2 - 2 - 2 (Tổng 12 cột cân đối) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch relative z-10">

            {/* =================================================================
                CHẶNG 1: MỞ ĐƠN & CLUB DAY (ĐÃ HOÀN THÀNH / ĐÃ ĐÓNG ĐƠN)
                Trạng thái: COMPLETED • Gọn gàng (2 cột) • Tick xanh xác nhận
                ================================================================= */}
            <div className="md:col-span-1 lg:col-span-2 bg-[#F8F9FA] border-[2px] border-[#1E1E1E]/60 rounded-2xl p-4 sm:p-5 brutal-shadow-sm transition-all flex flex-col justify-between opacity-95">
              <div>
                {/* Header Node */}
                <div className="flex items-center justify-between gap-1 mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#CCF6C5] text-[#34A853] flex items-center justify-center font-mono-code font-black text-xs border border-[#1E1E1E] relative z-30 shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#E8EAED] text-[#1E1E1E]/80 border border-[#1E1E1E]/30 relative z-30">
                    Đã đóng đơn
                  </span>
                </div>

                <span className="font-mono-code text-[11px] font-bold text-[#1E1E1E]/60 block mb-1">
                  26/10 – 08/11/2026
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mb-1.5 leading-snug">
                  Mở Đơn & Club Day
                </h4>
                <p className="text-xs text-[#1E1E1E]/70 leading-relaxed font-normal mb-3">
                  Cổng nhận đơn online cho 6 Ban chuyên môn và gian hàng trải nghiệm tại sảnh campus đã khép lại thành công.
                </p>

                {/* Micro-tags */}
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                    <Sparkles className="w-3 h-3 text-[#4285F4] shrink-0" />
                    <span className="truncate">6 Ban chuyên môn</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-[#1E1E1E]/10 text-[10px] font-mono-code text-[#1E1E1E]/80 w-full">
                    <MapPin className="w-3 h-3 text-[#EA4335] shrink-0" />
                    <span className="truncate">Club Day 01/11</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E1E1E]/10 flex items-center gap-1.5 text-[10px] font-mono-code text-[#34A853] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853] shrink-0" />
                <span>Khóa cổng 23:59 • 08/11</span>
              </div>
            </div>

            {/* =================================================================
                CHẶNG 2: KẾT QUẢ VÒNG ĐƠN & SÀNG LỌC HỒ SƠ (TÂM ĐIỂM CHIẾM 4 CỘT)
                Trạng thái: ACTIVE • Google 4-Color Accent • Elevated brutal shadow
                ================================================================= */}
            <div className="md:col-span-2 lg:col-span-4 bg-[#FFFDF5] border-[2.5px] border-[#1E1E1E] rounded-3xl p-5 sm:p-6 brutal-shadow-lg relative overflow-hidden flex flex-col justify-between ring-2 ring-[#FBBC04] scale-[1.01]">
              {/* Google 4-color accent top strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 grid grid-cols-4 z-10">
                <div className="bg-[#4285F4]"></div>
                <div className="bg-[#EA4335]"></div>
                <div className="bg-[#FBBC04]"></div>
                <div className="bg-[#34A853]"></div>
              </div>

              <div>
                {/* Milestone Node Header */}
                <div className="flex items-center justify-between gap-2 mb-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#FBBC04] text-[#1E1E1E] flex items-center justify-center font-mono-code font-black text-xs border-2 border-[#1E1E1E] shadow-xs relative z-30 shrink-0">
                      2
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FBBC04] text-[#1E1E1E] text-[11px] font-mono-code font-extrabold border border-[#1E1E1E] relative z-30">
                      <Flame className="w-3 h-3 text-[#EA4335] animate-bounce" />
                      ĐANG DIỄN RA
                    </span>
                  </div>

                  <span className="text-[11px] font-mono-code font-bold text-[#1E1E1E] bg-[#FFE7A5] px-2.5 py-0.5 rounded-full border border-[#1E1E1E] relative z-30 shrink-0">
                    Gửi mail: 10 – 11/11
                  </span>
                </div>

                <div className="space-y-1 mb-3.5">
                  <span className="font-mono-code text-xs font-bold text-[#D93025] block">
                    09/11 – 11/11/2026 • GIAI ĐOẠN HIỆN TẠI
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1E1E1E] tracking-tight">
                    Sàng Lọc Hồ Sơ & Kết Quả Vòng 1
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1E1E1E]/85 leading-relaxed font-normal">
                    Ban Chủ Nhiệm đang tích cực chấm điểm và sàng lọc hồ sơ ứng viên. Thư thông báo kết quả Vòng 1 kèm link <strong>chủ động đặt ca phỏng vấn</strong> sẽ được gửi trực tiếp đến email của bạn từ <strong>10/11 – 11/11</strong>.
                  </p>
                </div>

                {/* Structured Micro-tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#1E1E1E]/20 text-[11px] font-mono-code font-bold text-[#1E1E1E]">
                    <Mail className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
                    <span className="truncate">Email FPT & Cá nhân</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#1E1E1E]/20 text-[11px] font-mono-code font-bold text-[#1E1E1E]">
                    <Clock className="w-3.5 h-3.5 text-[#EA4335] shrink-0" />
                    <span className="truncate">Chủ động đặt ca PV</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#1E1E1E]/20 text-[11px] font-mono-code font-bold text-[#1E1E1E]">
                    <Inbox className="w-3.5 h-3.5 text-[#FBBC04] shrink-0" />
                    <span className="truncate">Kiểm tra cả hòm thư Spam</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#1E1E1E]/20 text-[11px] font-mono-code font-bold text-[#1E1E1E]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853] shrink-0" />
                    <span className="truncate">Đánh giá minh bạch</span>
                  </div>
                </div>
              </div>

              {/* Guidance / Action Pill */}
              <div className="pt-3 border-t border-[#1E1E1E]/15 mt-2">
                <button
                  type="button"
                  onClick={onOpenJoinModal}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1E1E1E] hover:bg-[#333333] text-white text-xs sm:text-sm font-extrabold rounded-2xl border-[2px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#FFE7A5]" />
                  <span>Theo Dõi Thông Báo Email & Lịch Trình</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* =================================================================
                CHẶNG 3: VÒNG PHỎNG VẤN (100% OFFLINE TẠI PHÒNG HỌC FPTU)
                Trạng thái: UPCOMING • 2 Cột
                ================================================================= */}
            <div className="md:col-span-1 lg:col-span-2 bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-4 sm:p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
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

            {/* =================================================================
                CHẶNG 4: GỬI OFFER TRÚNG TUYỂN (OFFER LETTER)
                Trạng thái: UPCOMING • 2 Cột
                ================================================================= */}
            <div className="md:col-span-1 lg:col-span-2 bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-4 sm:p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
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

            {/* =================================================================
                CHẶNG 5: ONBOARDING & FIRST MEETING
                Trạng thái: UPCOMING • 2 Cột
                ================================================================= */}
            <div className="md:col-span-2 lg:col-span-2 bg-[#FFFFFF] border-[2px] border-[#1E1E1E]/40 hover:border-[#1E1E1E] rounded-2xl p-4 sm:p-5 brutal-shadow-sm transition-all flex flex-col justify-between">
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
    </section>
  );
};
