import React, { useState, useEffect } from 'react';
import { GdgLogo } from './GdgLogo';
import { Menu, X, ArrowRight, Sparkles, Check, Copy } from 'lucide-react';
import { CHAPTER_INFO } from '../data/gdgData';

interface NavbarProps {
  onOpenJoinModal: () => void;
  onOpenJdHandbook?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenJoinModal, onOpenJdHandbook }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedHashtag, setCopiedHashtag] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyHashtag = () => {
    navigator.clipboard.writeText(CHAPTER_INFO.hashtag);
    setCopiedHashtag(true);
    setTimeout(() => setCopiedHashtag(false), 2000);
  };

  const navLinks = [
    { name: 'Giới Thiệu', href: '#about' },
    { name: 'Ban Chuyên Môn', href: '#departments' },
    { name: 'Số Liệu Summer', href: '#impact' },
    { name: 'Sự Kiện Fall 2026', href: '#events' },
    { name: 'Tuyển Chọn Lead', href: '#leads' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-b-2 border-[#1E1E1E] shadow-sm py-2.5'
          : 'bg-[#FFFFFF] border-b-2 border-[#1E1E1E]/10 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Lockup */}
        <a
          href="#"
          id="navbar-brand-link"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4] rounded-lg"
          aria-label="GDG on Campus FPT University HCMC Home"
        >
          <GdgLogo size="md" />
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 py-1.5 text-xs lg:text-sm font-semibold text-[#1E1E1E] hover:text-[#4285F4] transition-colors rounded-lg hover:bg-[#F0F0F0]"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Action Area */}
        <div className="hidden md:flex items-center gap-2.5">
          {onOpenJdHandbook && (
            <button
              onClick={onOpenJdHandbook}
              className="px-3.5 py-2 text-xs font-mono-code font-bold text-[#1E1E1E] hover:bg-[#FFE7A5] rounded-full border-2 border-[#1E1E1E] transition-all cursor-pointer"
            >
              Sổ Tay JD
            </button>
          )}

          <button
            onClick={onOpenJoinModal}
            id="navbar-join-button"
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-bold text-xs lg:text-sm rounded-full border-2 border-[#1E1E1E] brutal-shadow-hover brutal-shadow-sm cursor-pointer"
          >
            <span>Ứng Tuyển Thành Viên K22</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenJoinModal}
            className="px-3 py-1.5 bg-[#4285F4] text-[#FFFFFF] text-xs font-bold rounded-full border border-[#1E1E1E]"
          >
            Tuyển K22
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="navbar-mobile-toggle"
            className="p-2 text-[#1E1E1E] hover:bg-[#F0F0F0] rounded-xl border-2 border-[#1E1E1E] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b-2 border-[#1E1E1E] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fadeIn">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl font-bold text-[#1E1E1E] hover:bg-[#C3ECF6] transition-colors flex items-center justify-between"
              >
                <span>{link.name}</span>
                <span className="font-mono-code text-xs text-[#1E1E1E]/50">//</span>
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1E1E1E]/10 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenJoinModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#4285F4] text-[#FFFFFF] font-bold text-sm rounded-full border-2 border-[#1E1E1E] brutal-shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ứng Tuyển Thành Viên K22</span>
            </button>

            {onOpenJdHandbook && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJdHandbook();
                }}
                className="w-full py-2.5 bg-[#FFE7A5] text-[#1E1E1E] font-bold text-xs font-mono-code rounded-full border-2 border-[#1E1E1E]"
              >
                Xem Sổ Tay JD Tuyển Sinh
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
