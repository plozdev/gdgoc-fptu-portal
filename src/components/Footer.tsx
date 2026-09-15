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
    { name: 'Cổng Thành Viên (GDGoC-OS)', href: '/login' },
  ];

  const resources = [
    { name: 'Google Cloud Skills Boost', href: 'https://www.cloudskillsboost.google/' },
    { name: 'Gemini for Developers & AI Studio', href: 'https://ai.google.dev/' },
    { name: 'Google Developer Groups Community', href: 'https://developers.google.com/community/gdg' },
    { name: 'Google Solution Challenge', href: 'https://developers.google.com/community/gdsc-solution-challenge' },
  ];

  return (
    <footer className="bg-[#FFFFFF] border-t-[2.5px] border-[#1E1E1E]/20 relative pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b-[2.5px] border-[#1E1E1E]/15">
          
          {/* Brand & Chapter Bio */}
          <div className="lg:col-span-5 space-y-4">
            <GdgLogo size="lg" />
            <p className="text-xs sm:text-sm text-[#1E1E1E]/90 leading-relaxed max-w-sm font-normal">
              Cộng đồng Google Developer Groups on Campus chính thức tại <strong>Đại học FPT TP.HCM</strong>. Nơi sinh viên tiếp cận công nghệ mới nhất từ Google, kết nối chuyên gia GDE và kiến tạo những sản phẩm có sức ảnh hưởng thực tế.
            </p>

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
                    className="w-11 h-11 rounded-xl bg-[#FFFFFF] hover:bg-[#F0F0F0] border-[2.5px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover flex items-center justify-center text-[#1E1E1E] transition-all"
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
                    className="text-xs sm:text-sm text-[#1E1E1E]/85 hover:text-[#4285F4] hover:underline transition-colors font-medium"
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
                    className="text-xs sm:text-sm text-[#1E1E1E]/85 hover:text-[#34A853] hover:underline transition-colors inline-flex items-center gap-1 font-medium"
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
            <div className="space-y-2.5 text-xs text-[#1E1E1E]/90 font-mono-code">
              <div className="flex items-start gap-2 bg-[#F0F0F0] p-3 rounded-xl border border-[#1E1E1E]/20 font-medium">
                <MapPin className="w-4 h-4 text-[#EA4335] shrink-0 mt-0.5" />
                <span>
                  <strong>Đại học FPT TP.HCM:</strong> Đường D9, Khu Công Nghệ Cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh.
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#F0F0F0] p-3 rounded-xl border border-[#1E1E1E]/20 font-medium">
                <Mail className="w-4 h-4 text-[#4285F4] shrink-0" />
                <span className="truncate">{CHAPTER_INFO.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Mandatory Independent Group Disclaimer */}
        <div className="mt-8 p-5 bg-[#F0F0F0] border-[2px] border-[#1E1E1E] rounded-2xl">
          <div className="flex items-start gap-3">
            <span className="font-mono-code text-xs font-bold text-[#EA4335] px-2 py-0.5 bg-[#FFFFFF] border border-[#1E1E1E] rounded shrink-0">
              DISCLAIMER
            </span>
            <p className="text-xs text-[#1E1E1E]/90 leading-relaxed font-normal">
              {CHAPTER_INFO.disclaimer}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-[#1E1E1E]/80 font-medium">
          <div className="flex items-center gap-2 flex-wrap">
            <span>© {new Date().getFullYear()} {CHAPTER_INFO.name}.</span>
            <span>•</span>
            <span className="font-bold text-[#4285F4]">{CHAPTER_INFO.hashtag}</span>
          </div>

          <div className="flex items-center gap-4">
            <span>FPT University HCMC • Fall 2026</span>
            <button
              onClick={scrollToTop}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 bg-[#FFFFFF] hover:bg-[#FFE7A5] text-[#1E1E1E] rounded-xl border-[2.5px] border-[#1E1E1E] brutal-shadow-sm brutal-shadow-hover transition-all cursor-pointer"
              title="Cuộn lên đầu trang"
              aria-label="Cuộn lên đầu trang"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
