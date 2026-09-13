import React from 'react';
import { GdgLogo } from './GdgLogo';
import { Github, Linkedin, Facebook, MessageSquare, ArrowUp, MapPin, Mail, Globe, BookOpen, ArrowRight, Trophy } from 'lucide-react';
import { CHAPTER_INFO } from '../data/gdgData';

interface FooterProps {
  onOpenJoinModal?: () => void;
  onOpenJdHandbook?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenJoinModal, onOpenJdHandbook }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com', icon: Facebook, color: '#4285F4' },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin, color: '#57CAFF' },
    { name: 'GitHub', href: 'https://github.com', icon: Github, color: '#1E1E1E' },
    { name: 'Discord', href: 'https://discord.com', icon: MessageSquare, color: '#34A853' },
  ];

  const quickLinks = [
    { name: 'Giới Thiệu Chapter', href: '#about' },
    { name: 'Các Ban Chuyên Môn', href: '#departments' },
    { name: 'Số Liệu Summer 2026', href: '#impact' },
    { name: 'Sự Kiện Fall 2026', href: '#events' },
    { name: 'Tuyển Chọn Trưởng Ban', href: '#leads' },
  ];

  const resources = [
    { name: 'Google Cloud Skills Boost', href: 'https://www.cloudskillsboost.google/' },
    { name: 'Gemini for Developers & AI Studio', href: 'https://ai.google.dev/' },
    { name: 'Google Developer Groups Community', href: 'https://developers.google.com/community/gdg' },
    { name: 'Google Solution Challenge', href: 'https://developers.google.com/community/gdsc-solution-challenge' },
  ];

  return (
    <footer className="bg-[#FFFFFF] border-t-2 border-[#1E1E1E] relative pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Top CTA Banner as requested in Requirement #5 */}
        <div className="mb-14 p-6 sm:p-8 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-[28px] brutal-shadow flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 font-mono-code text-xs font-bold text-[#EA4335]">
              <Trophy className="w-3.5 h-3.5 text-[#FBBC04]" />
              <span>{CHAPTER_INFO.summerAward}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E]">
              Sẵn Sàng Gia Nhập GDGoC FPT University HCMC?
            </h3>
            <p className="text-xs sm:text-sm text-[#1E1E1E]/75 max-w-xl">
              Đợt tuyển sinh Gen K22 & xét tuyển Trưởng ban (Lead Roles) đang diễn ra sôi nổi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {onOpenJoinModal && (
              <button
                onClick={onOpenJoinModal}
                id="footer-join-btn"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-bold text-xs sm:text-sm rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ứng Tuyển Thành Viên K22</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenJdHandbook ? onOpenJdHandbook : () => {
                const el = document.getElementById('departments');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              id="footer-jd-btn"
              className="w-full sm:w-auto px-5 py-3.5 bg-[#FFFFFF] hover:bg-[#FFE7A5] text-[#1E1E1E] font-bold text-xs sm:text-sm rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#FBBC04]" />
              <span>Xem Sổ Tay JD Tuyển Sinh</span>
            </button>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b-2 border-[#1E1E1E]">
          
          {/* Brand & Chapter Bio */}
          <div className="lg:col-span-5 space-y-4">
            <GdgLogo size="lg" />
            <p className="text-xs sm:text-sm text-[#1E1E1E]/80 leading-relaxed max-w-sm">
              Cộng đồng Google Developer Groups on Campus chính thức tại <strong>Đại học FPT TP.HCM</strong>. Nơi sinh viên tiếp cận công nghệ mới nhất từ Google, kết nối chuyên gia GDE và kiến tạo những sản phẩm có sức ảnh hưởng thực tế.
            </p>

            <div className="inline-block px-3 py-1.5 bg-[#FFE7A5] border border-[#1E1E1E] rounded-lg font-mono-code text-xs font-bold text-[#1E1E1E]">
              Khẩu hiệu: "{CHAPTER_INFO.slogan}"
            </div>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-2.5">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#FFFFFF] hover:bg-[#F0F0F0] border-2 border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover flex items-center justify-center text-[#1E1E1E] transition-all"
                    aria-label={`GDGoC FPTU on ${social.name}`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-xs font-mono-code text-[#1E1E1E] uppercase tracking-wider">
              Điều Hướng
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-sm text-[#1E1E1E]/80 hover:text-[#4285F4] hover:underline transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Google Resources */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-xs font-mono-code text-[#1E1E1E] uppercase tracking-wider">
              Hệ Sinh Thái
            </h4>
            <ul className="space-y-2">
              {resources.map((res) => (
                <li key={res.name}>
                  <a
                    href={res.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-[#1E1E1E]/80 hover:text-[#34A853] hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    <span>{res.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus Location info */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-xs font-mono-code text-[#1E1E1E] uppercase tracking-wider">
              Cơ Sở Hoạt Động
            </h4>
            <div className="space-y-2.5 text-xs text-[#1E1E1E]/80 font-mono-code">
              <div className="flex items-start gap-2 bg-[#F0F0F0] p-3 rounded-xl border border-[#1E1E1E]/20">
                <MapPin className="w-4 h-4 text-[#EA4335] shrink-0 mt-0.5" />
                <span>
                  <strong>Đại học FPT TP.HCM:</strong> Đường D9, Khu Công Nghệ Cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh.
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#F0F0F0] p-3 rounded-xl border border-[#1E1E1E]/20">
                <Mail className="w-4 h-4 text-[#4285F4] shrink-0" />
                <span className="truncate">{CHAPTER_INFO.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Mandatory Independent Group Disclaimer */}
        <div className="mt-8 p-5 bg-[#F0F0F0] border-2 border-[#1E1E1E] rounded-2xl">
          <div className="flex items-start gap-3">
            <span className="font-mono-code text-xs font-bold text-[#EA4335] px-2 py-0.5 bg-[#FFFFFF] border border-[#1E1E1E] rounded shrink-0">
              DISCLAIMER
            </span>
            <p className="text-xs text-[#1E1E1E]/80 leading-relaxed">
              {CHAPTER_INFO.disclaimer}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-[#1E1E1E]/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span>© {new Date().getFullYear()} {CHAPTER_INFO.name}.</span>
            <span>•</span>
            <span className="font-bold text-[#4285F4]">{CHAPTER_INFO.hashtag}</span>
          </div>

          <div className="flex items-center gap-4">
            <span>FPT University HCMC • Fall 2026</span>
            <button
              onClick={scrollToTop}
              className="p-2 bg-[#FFFFFF] hover:bg-[#FFE7A5] text-[#1E1E1E] rounded-lg border-2 border-[#1E1E1E] transition-colors cursor-pointer"
              title="Về đầu trang"
              aria-label="Về đầu trang"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
