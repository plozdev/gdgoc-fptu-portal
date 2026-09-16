import React from 'react';
import { Users2, BookOpenCheck, TrendingUp, Sparkles, Target } from 'lucide-react';
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
    <section id="about" className="py-20 sm:py-28 bg-[#FFFFFF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#C3ECF6] border-[2.5px] border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E]">
              <span>{'//'} 01. SỨ MỆNH & GIÁ TRỊ CỐT LÕI</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Bệ Phóng Công Nghệ Cho Sinh Viên FPTU
            </h2>
            <p className="text-base sm:text-lg text-[#1E1E1E]/85 max-w-2xl">
              Cộng đồng học thuật chính thức tại <strong>Đại học FPT TP.HCM</strong>, cầu nối giúp sinh viên tiếp cận hệ sinh thái công nghệ Google và cùng nhau kiến tạo các giải pháp có sức ảnh hưởng.
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

        {/* 4 Core Pillars Grid */}
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
                  className="w-12 h-12 rounded-xl border-2 border-[#1E1E1E] flex items-center justify-center mb-4 shadow-xs"
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

              <div className="mt-6 pt-3 border-t border-[#1E1E1E]/10 flex items-center justify-between text-[11px] font-mono-code">
                <span className="text-[#1E1E1E]/60 uppercase font-semibold">Focus Area</span>
                <span className="font-bold" style={{ color: pillar.accentColor }}>
                  {idx === 0 ? 'Network & Mentors' : idx === 1 ? 'Google Stack & Labs' : idx === 2 ? 'Leadership & Skills' : 'Real Products'}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
