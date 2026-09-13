import React from 'react';
import { Users2, BookOpenCheck, TrendingUp, Sparkles, Target, Compass, Award, Trophy } from 'lucide-react';
import { VALUES_PILLARS, CHAPTER_INFO } from '../data/gdgData';

interface AboutProps {
  onOpenJoinModal: () => void;
}

export const About: React.FC<AboutProps> = ({ onOpenJoinModal }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users2':
        return <Users2 className="w-6 h-6" />;
      case 'BookOpenCheck':
        return <BookOpenCheck className="w-6 h-6" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FFFFFF] border-t-2 border-[#1E1E1E] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C3ECF6] border-2 border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E]">
              <span>{'//'} 01. VỀ CHÚNG TÔI</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              GDG on Campus FPT University HCMC
            </h2>
            <p className="text-base sm:text-lg text-[#1E1E1E]/75 max-w-2xl">
              Cộng đồng lập trình viên sinh viên hàng đầu tại cơ sở TP.HCM. Cầu nối giữa giảng đường đại học và hệ sinh thái kỹ thuật công nghệ toàn cầu của Google.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono-code text-xs text-[#1E1E1E]/60 hidden sm:inline">
              Học kỳ: {CHAPTER_INFO.term}
            </span>
            <div className="h-4 w-px bg-[#1E1E1E]/20 hidden sm:block" />
            <span className="font-mono-code text-xs font-bold text-[#4285F4]">
              {CHAPTER_INFO.slogan}
            </span>
          </div>
        </div>

        {/* Story & Mission Block (Neo-Brutalist Color Blocked Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Main Story Card */}
          <div className="lg:col-span-8 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-[28px] rounded-tl-sm p-6 sm:p-10 brutal-shadow relative">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1 bg-[#FFE7A5] border-2 border-[#1E1E1E] rounded-md font-mono-code text-xs font-bold text-[#1E1E1E] shadow-sm">
              SUMMER_MILESTONE_2026.md
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EA4335] text-[#FFFFFF] rounded-lg text-xs font-mono-code font-bold">
                <Trophy className="w-3.5 h-3.5 text-[#FBBC04]" />
                <span>TOP 1 GDGoC AI RISER VIETNAM 2026</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] leading-snug">
                Vươn tầm từ kỳ Summer 2026 bùng nổ đến đợt tuyển quân Fall 2026 quy mô lớn.
              </h3>
              <p className="text-[#1E1E1E]/80 text-base leading-relaxed">
                <strong>Google Developer Groups on Campus FPT University HCMC (GDGoC FPTU HCMC)</strong> vừa trải qua một kỳ Summer 2026 đầy tự hào: tổ chức 10 hoạt động sự kiện, thu hút hơn 100+ lượt sinh viên tham gia, xây dựng đội ngũ 30+ core members hoạt động năng nổ, và đặc biệt xuất sắc giành ngôi vị <strong>Top 1 Toàn Quốc tại AI Riser Vietnam 2026</strong> với danh hiệu danh giá <em>"The GDGoC Impact Maker"</em>.
              </p>
              <p className="text-[#1E1E1E]/80 text-base leading-relaxed">
                Bước sang kỳ <strong>Fall 2026</strong>, câu lạc bộ chính thức mở đơn tuyển sinh thế hệ <strong>Gen K22</strong> và khung tuyển chọn Trưởng ban (Lead Roles) nội bộ cho cả 2 khối: <strong>Khối Tech</strong> (AI, Cloud, Web, Research dự án cùng giảng viên) và <strong>Khối Non-Tech</strong> (Media, HR & Event).
              </p>

              {/* Slogan banner */}
              <div className="pt-2">
                <div className="bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-2.5 h-10 bg-[#4285F4] rounded-full shrink-0" />
                  <div>
                    <span className="font-mono-code text-xs font-bold text-[#EA4335] uppercase">
                      Tôn Chỉ Hoạt Động
                    </span>
                    <p className="font-extrabold text-sm sm:text-base text-[#1E1E1E]">
                      "{CHAPTER_INFO.slogan}" — Cùng nhau đặt mục tiêu, cùng nhau bứt phá giới hạn và kiến tạo dấu ấn công nghệ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Facts Column */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Fact 1 */}
            <div className="bg-[#CCF6C5] border-2 border-[#1E1E1E] rounded-[24px] rounded-br-sm p-6 brutal-shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-code text-xs font-bold text-[#1E1E1E]">01 / ĐỊA ĐIỂM HOẠT ĐỘNG</span>
                <Compass className="w-5 h-5 text-[#34A853]" />
              </div>
              <h4 className="font-extrabold text-xl text-[#1E1E1E]">Đại Học FPT TP.HCM</h4>
              <p className="text-xs text-[#1E1E1E]/80 mt-1">
                Khu Công Nghệ Cao (SHTP), TP. Thủ Đức. Không gian sinh hoạt công nghệ năng động tại Alpha Hall, Beta Labs và Maker Space.
              </p>
            </div>

            {/* Fact 2 */}
            <div className="bg-[#FFE7A5] border-2 border-[#1E1E1E] rounded-[24px] rounded-bl-sm p-6 brutal-shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-code text-xs font-bold text-[#1E1E1E]">02 / CƠ HỘI BỨT PHÁ</span>
                <Award className="w-5 h-5 text-[#FBBC04]" />
              </div>
              <h4 className="font-extrabold text-xl text-[#1E1E1E]">Tài Nguyên Chuẩn Google</h4>
              <p className="text-xs text-[#1E1E1E]/80 mt-1">
                Miễn phí tài khoản Google Cloud Skills Boost, tham gia các buổi Codelab thực chiến, kết nối Google Developer Experts (GDE) và giảng viên nghiên cứu.
              </p>
            </div>
          </div>

        </div>

        {/* 4 Core Pillars Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E] tracking-tight">
              4 Giá Trị Cốt Lõi (Core Pillars)
            </h3>
            <span className="font-mono-code text-xs text-[#1E1E1E]/60">
              CÙNG PHÁT TRIỂN TẠI FPTU
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES_PILLARS.map((pillar, idx) => (
              <div
                key={pillar.title}
                className="bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-2xl p-6 brutal-shadow-sm brutal-shadow-hover transition-all flex flex-col justify-between"
                style={{
                  borderTopWidth: '8px',
                  borderTopColor: pillar.accentColor,
                }}
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-xl border-2 border-[#1E1E1E] flex items-center justify-center mb-4 shadow-sm"
                    style={{ backgroundColor: pillar.pastelColor, color: pillar.accentColor }}
                  >
                    {getIcon(pillar.iconName)}
                  </div>
                  <span className="font-mono-code text-[11px] font-bold text-[#1E1E1E]/50 block mb-1">
                    PILLAR // 0{idx + 1}
                  </span>
                  <h4 className="font-extrabold text-xl text-[#1E1E1E] mb-2">
                    {pillar.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#1E1E1E]/75 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
