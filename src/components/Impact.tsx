import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { useLandingContentStore } from '../store/useLandingContentStore';

export const Impact: React.FC = () => {
  const stats = useLandingContentStore((s) => s.stats);
  const [counts, setCounts] = useState<{ [key: number]: number }>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  });

  // Animated counter effect on mount
  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setCounts({
        0: Math.min(10, Math.round((10 / steps) * step)),
        1: Math.min(100, Math.round((100 / steps) * step)),
        2: Math.min(30, Math.round((30 / steps) * step)),
        3: Math.min(1, Math.round((1 / steps) * step)),
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="impact" className="py-20 sm:py-28 bg-[#FFFFFF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#CCF6C5] border-[2.5px] border-[#1E1E1E] rounded-full text-xs font-mono-code font-bold text-[#1E1E1E]">
              <span>{'//'} 03. IMPACT & REACH</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
              Dấu Ấn Thực Tế Kỳ Summer 2026
            </h2>
            <p className="text-base sm:text-lg text-[#1E1E1E]/85 max-w-2xl">
              Tổng kết số liệu thực tế đã đạt được trong kỳ Summer 2026 của <strong>GDG on Campus FPT University HCMC</strong> trước thềm học kỳ Fall 2026.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono-code text-xs text-[#1E1E1E] bg-[#FFE7A5] px-3.5 py-2 rounded-xl border-[2.5px] border-[#1E1E1E] brutal-shadow-sm">
            <Award className="w-4 h-4 text-[#EA4335]" />
            <span className="font-extrabold">"THE GDGOC IMPACT MAKER" 2026</span>
          </div>
        </div>

        {/* 4 Clean Stats Counter Grid with Google Brand Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="bg-[#FFFFFF] border-[2.5px] border-[#1E1E1E] rounded-[24px] p-6 brutal-shadow-sm brutal-shadow-hover flex flex-col justify-between transition-all"
              style={{
                borderBottomWidth: '8px',
                borderBottomColor: stat.accentColor,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono-code text-[11px] font-bold text-[#1E1E1E]/80 uppercase">
                    SUMMER 2026 // 0{idx + 1}
                  </span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-[#1E1E1E]"
                    style={{ backgroundColor: stat.accentColor }}
                  />
                </div>

                {/* Animated Stat Value */}
                <div className="font-mono-code text-4xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight mb-2">
                  {idx === 3 ? (
                    <span className="text-2xl sm:text-3xl">Impact Maker</span>
                  ) : (
                    <span>
                      {counts[idx]?.toLocaleString()}
                      {stat.suffix}
                    </span>
                  )}
                </div>

                <div className="font-extrabold text-base sm:text-lg text-[#1E1E1E] mb-2 leading-snug">
                  {stat.label}
                </div>

                <p className="text-xs sm:text-sm text-[#1E1E1E]/85 leading-relaxed font-normal">
                  {stat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E1E1E]/15 flex items-center justify-between text-[11px] font-mono-code">
                <span className="text-[#1E1E1E]/80 font-semibold">Verified</span>
                <span className="font-extrabold" style={{ color: stat.accentColor }}>
                  FPTU HCMC
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
