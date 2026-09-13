import React from 'react';
import { Users2, BookOpenCheck, TrendingUp, Sparkles, Target, Compass, Award, Cpu, ShieldCheck } from 'lucide-react';
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

  const ecosystemFeatures = [
    {
      badge: '01 / MÔI TRƯỜNG',
      title: 'Không Gian Sáng Tạo Tại FPTU',
      desc: 'Sinh hoạt tại Maker Space, Alpha Hall và Beta Labs (D9 Khu Công Nghệ Cao, TP. Thủ Đức). Môi trường mở khích lệ tự do nghiên cứu, làm dự án và tổ chức sự kiện kỹ thuật.',
      icon: Compass,
      accentColor: '#34A853',
      pastelColor: '#CCF6C5'
    },
    {
      badge: '02 / TÀI NGUYÊN',
      title: 'Tài Nguyên Chuẩn Toàn Cầu',
      desc: 'Cung cấp miễn phí tài khoản Google Cloud Skills Boost, trải nghiệm sớm Gemini API, Google AI Studio và các bộ Codelab chuẩn kỹ sư Google.',
      icon: Cpu,
      accentColor: '#4285F4',
      pastelColor: '#C3ECF6'
    },
    {
      badge: '03 / KẾT NỐI',
      title: 'Cố Vấn & Mạng Lưới Chuyên Gia',
      desc: 'Được đồng hành và định hướng trực tiếp bởi các Google Developer Experts (GDE), các thầy cô giảng viên CNTT Đại học FPT và cựu thành viên đang làm việc tại các tập đoàn công nghệ.',
      icon: ShieldCheck,
      accentColor: '#FBBC04',
      pastelColor: '#FFE7A5'
    }
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FFFFFF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#C3ECF6] border-[2.5px] border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E]">
              <span>{'//'} 01. SỨ MỆNH & TẦM NHÌN</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Bệ Phóng Công Nghệ Cho Sinh Viên FPTU
            </h2>
            <p className="text-base sm:text-lg text-[#1E1E1E]/85 max-w-2xl">
              GDGoC FPTU HCMC là cộng đồng học thuật chính thức, cầu nối giúp sinh viên tiếp cận sớm các công nghệ tiên phong của Google và hiện thực hóa ý tưởng thành sản phẩm thực tế.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="font-mono-code text-xs font-semibold text-[#1E1E1E]/80">
              Học kỳ: {CHAPTER_INFO.term}
            </span>
            <div className="h-4 w-px bg-[#1E1E1E]/20" />
            <span className="font-mono-code text-xs font-bold text-[#4285F4]">
              {CHAPTER_INFO.hashtag}
            </span>
          </div>
        </div>

        {/* 3 Pillars of Ecosystem Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {ecosystemFeatures.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.title}
                className="bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-[24px] p-6 brutal-shadow-sm flex flex-col justify-between"
                style={{
                  borderTopWidth: '8px',
                  borderTopColor: item.accentColor,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono-code text-[11px] font-extrabold text-[#1E1E1E]/80">
                      {item.badge}
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-[#1E1E1E] flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: item.pastelColor, color: item.accentColor }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-extrabold text-lg text-[#1E1E1E] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#1E1E1E]/85 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E] tracking-tight">
                4 Giá Trị Cốt Lõi (Core Pillars)
              </h3>
              <p className="text-xs sm:text-sm text-[#1E1E1E]/75 font-mono-code mt-0.5">
                Định hướng xuyên suốt mọi hoạt động và dự án tại GDGoC FPTU HCMC
              </p>
            </div>
            <span className="font-mono-code text-xs font-bold text-[#4285F4] hidden sm:inline">
              CONNECT • LEARN • GROW • IMPACT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES_PILLARS.map((pillar, idx) => (
              <div
                key={pillar.title}
                className="bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-[24px] p-6 brutal-shadow-sm brutal-shadow-hover transition-all flex flex-col justify-between"
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
                  <span className="font-mono-code text-[11px] font-bold text-[#1E1E1E]/80 block mb-1">
                    PILLAR // 0{idx + 1}
                  </span>
                  <h4 className="font-extrabold text-xl text-[#1E1E1E] mb-2">
                    {pillar.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#1E1E1E]/85 leading-relaxed font-normal">
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
