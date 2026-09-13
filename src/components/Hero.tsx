import React, { useState } from 'react';
import { ArrowRight, BookOpen, Sparkles, Terminal, Code2, Trophy, Cpu, CheckCircle2, ChevronRight, Flame } from 'lucide-react';
import { CHAPTER_INFO } from '../data/gdgData';

interface HeroProps {
  onOpenJoinModal: () => void;
  onOpenJdHandbook?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenJoinModal, onOpenJdHandbook }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'ai' | 'cloud' | 'web' | 'research'>('ai');

  const codeSnippets = {
    ai: `// GDG on Campus FPTU HCMC: Ban AI & GenAI Lab
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI();
// Top 1 GDGoC AI Riser Vietnam 2026!
const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function runCampusRAG(prompt: string) {
  const response = await model.generateContent({
    contents: prompt,
    systemInstruction: "GDGoC FPTU HCMC: Take Target Together!"
  });
  return response.text;
}`,
    cloud: `// Ban Cloud: Quản trị hạ tầng GCP & Cloud Run
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: gdgoc-fptu-portal
  labels:
    campus: fptu-hcmc
    campaign: cloud-skills-boost-2026
spec:
  template:
    spec:
      containers:
      - image: gcr.io/gdgoc-fptu/portal:v2.0
        env:
        - name: TERM
          value: "Fall-2026"`,
    web: `// Ban Web Development: Event & Check-in Portal
import { useState } from 'react';

export function RegistrationPortal() {
  const [candidate, setCandidate] = useState({
    batch: "Gen K22",
    campus: "FPT University HCMC",
    status: "READY_TO_BUILD"
  });

  return <DigitalPass candidate={candidate} />;
}`,
    research: `// Ban Research: Nghiên cứu khoa học cùng Giảng viên
\\documentclass[conference]{IEEEtran}
\\title{Advancing Multimodal AI in Higher Education}
\\author{GDGoC FPT University HCMC Research Group}

\\begin{document}
\\maketitle
\\begin{abstract}
Student-led academic study with FPTU faculty advisors.
\\end{abstract}
\\end{document}`
  };

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
          <div className="lg:col-span-7 flex flex-col items-start space-y-5 text-left">
            
            {/* National Achievement Badge */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-full brutal-shadow-sm">
              <span className="flex items-center gap-1 font-mono-code text-xs font-bold text-[#EA4335]">
                <Trophy className="w-3.5 h-3.5 text-[#FBBC04]" />
                Top 1 GDGoC AI Riser Vietnam 2026
              </span>
              <span className="text-[#1E1E1E]/30 font-mono-code hidden sm:inline">|</span>
              <span className="font-mono-code text-[11px] font-bold text-[#4285F4]">
                "The GDGoC Impact Maker"
              </span>
            </div>

            {/* Slogan & Main Heading */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono-code text-xs sm:text-sm font-bold tracking-wider text-[#1E1E1E]/70 uppercase">
                <span className="text-[#EA4335] font-extrabold">{'{'}</span>
                <span>GDG on Campus FPT University HCMC • Kỳ Fall 2026</span>
                <span className="text-[#4285F4] font-extrabold">{'}'}</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1E1E1E] tracking-tight leading-[1.08]">
                Take Target <br className="hidden sm:inline" />
                <span className="relative inline-block mt-1">
                  <span className="relative z-10 text-[#4285F4]">Together</span>
                  {/* Flat Color Block Underline */}
                  <span className="absolute left-0 bottom-1.5 sm:bottom-2.5 w-full h-3.5 sm:h-5 bg-[#FFE7A5] -z-10 rounded-sm -rotate-1 border border-[#1E1E1E]/20" />
                </span>
                <span className="text-[#EA4335]">.</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#1E1E1E]/80 font-normal leading-relaxed max-w-2xl">
              Cộng đồng sinh viên đam mê công nghệ tại <span className="font-semibold text-[#1E1E1E]">Đại học FPT TP.HCM</span>. Mở đợt tuyển quân chính thức <span className="font-bold text-[#EA4335]">Gen K22</span> & Khung tuyển chọn Trưởng ban (Lead Roles) kỳ Fall 2026 trên 2 Khối: <strong>Khối Tech</strong> (AI, Cloud, Web, Research) và <strong>Khối Non-Tech</strong> (Media, HR & Event).
            </p>

            {/* Action Buttons (Strictly matching User Prompt #5) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <button
                onClick={onOpenJoinModal}
                id="hero-join-community-btn"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-bold text-base rounded-full border-2 border-[#1E1E1E] brutal-shadow brutal-shadow-hover cursor-pointer"
              >
                <span>Ứng Tuyển Thành Viên K22</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenJdHandbook ? onOpenJdHandbook : () => {
                  const el = document.getElementById('departments');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                id="hero-jd-handbook-btn"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFFFFF] hover:bg-[#FFE7A5] text-[#1E1E1E] font-bold text-base rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#FBBC04]" />
                <span>Xem Sổ Tay JD Tuyển Sinh</span>
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-mono-code text-[#1E1E1E]/75">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
                <span className="font-bold text-[#34A853]">Đang mở đơn tuyển sinh K22</span>
              </div>
              <span>•</span>
              <div>6 Ban Chuyên Môn</div>
              <span>•</span>
              <div className="text-[#4285F4] font-semibold">Cơ hội Lead Roles nội bộ</div>
            </div>

          </div>

          {/* Right Column: Neo-brutalist Interactive Terminal Frame */}
          <div className="lg:col-span-5">
            <div className="relative bg-[#FFFFFF] border-2 border-[#1E1E1E] rounded-[28px] brutal-shadow overflow-hidden">
              
              {/* Window Title Bar */}
              <div className="bg-[#F0F0F0] border-b-2 border-[#1E1E1E] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EA4335] border border-[#1E1E1E]" />
                  <div className="w-3 h-3 rounded-full bg-[#FBBC04] border border-[#1E1E1E]" />
                  <div className="w-3 h-3 rounded-full bg-[#34A853] border border-[#1E1E1E]" />
                  <span className="ml-2 font-mono-code text-xs font-bold text-[#1E1E1E]">
                    gdgoc-fptu-hcmc.fall2026.ts
                  </span>
                </div>

                <div className="px-2 py-0.5 bg-[#C3ECF6] border border-[#1E1E1E] rounded text-[10px] font-mono-code font-bold">
                  FALL 2026
                </div>
              </div>

              {/* Code Tab Switcher */}
              <div className="flex border-b-2 border-[#1E1E1E] bg-[#FFFFFF] overflow-x-auto text-xs font-mono-code">
                <button
                  onClick={() => setActiveCodeTab('ai')}
                  className={`px-3 py-2 border-r-2 border-[#1E1E1E] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeCodeTab === 'ai' ? 'bg-[#FFE7A5] text-[#1E1E1E]' : 'bg-[#FFFFFF] text-[#1E1E1E]/60 hover:bg-[#F0F0F0]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#FBBC04]" />
                  <span>Ban AI</span>
                </button>
                <button
                  onClick={() => setActiveCodeTab('cloud')}
                  className={`px-3 py-2 border-r-2 border-[#1E1E1E] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeCodeTab === 'cloud' ? 'bg-[#C3ECF6] text-[#1E1E1E]' : 'bg-[#FFFFFF] text-[#1E1E1E]/60 hover:bg-[#F0F0F0]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                  <span>Ban Cloud</span>
                </button>
                <button
                  onClick={() => setActiveCodeTab('web')}
                  className={`px-3 py-2 border-r-2 border-[#1E1E1E] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeCodeTab === 'web' ? 'bg-[#CCF6C5] text-[#1E1E1E]' : 'bg-[#FFFFFF] text-[#1E1E1E]/60 hover:bg-[#F0F0F0]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                  <span>Ban Web</span>
                </button>
                <button
                  onClick={() => setActiveCodeTab('research')}
                  className={`px-3 py-2 font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeCodeTab === 'research' ? 'bg-[#F8D8D8] text-[#1E1E1E]' : 'bg-[#FFFFFF] text-[#1E1E1E]/60 hover:bg-[#F0F0F0]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                  <span>Research</span>
                </button>
              </div>

              {/* Code Display Area */}
              <div className="p-5 bg-[#1E1E1E] text-[#F0F0F0] font-mono-code text-xs leading-relaxed overflow-x-auto min-h-[220px]">
                <pre className="text-[12px] leading-5 text-[#C3ECF6]">
                  <code>{codeSnippets[activeCodeTab]}</code>
                </pre>
              </div>

              {/* Live Status Bar */}
              <div className="bg-[#FFFFFF] border-t-2 border-[#1E1E1E] px-4 py-2.5 flex items-center justify-between text-xs font-mono-code">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                  <span className="text-[#1E1E1E] font-bold">2 Khối Chuyên Môn • 6 Ban</span>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById('departments');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[#4285F4] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Khám phá các ban</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
