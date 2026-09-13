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
  const [activeSection, setActiveSection] = useState<string>('#about');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Scrollspy detection
      const sections = ['about', 'departments', 'impact', 'events', 'organizers'];
      const scrollPosition = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(`#${sectionId}`);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
    { name: 'Sự Kiện', href: '#events' },
    { name: 'Core Team', href: '#organizers' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-b-[2.5px] border-[#1E1E1E] shadow-sm py-2.5'
          : 'bg-[#FFFFFF] border-b-[2.5px] border-[#1E1E1E]/15 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <a
          href="#"
          id="navbar-brand-link"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4] rounded-lg shrink-0"
          aria-label="GDG on Campus FPT University HCMC Home"
        >
          <GdgLogo size="md" />
        </a>

        {/* Desktop Nav Links with Scrollspy Active Highlight (Strict 1-line) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0 whitespace-nowrap" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <a
                key={link.name}
                href={link.href}
                className={`px-2.5 py-1.5 text-xs xl:text-[13px] whitespace-nowrap transition-all rounded-xl ${
                  isActive
                    ? 'bg-[#FFE7A5] text-[#1E1E1E] font-extrabold border-2 border-[#1E1E1E] brutal-shadow-sm'
                    : 'text-[#1E1E1E]/90 hover:text-[#4285F4] hover:bg-[#F0F0F0] font-semibold border-2 border-transparent'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Desktop Action Area (Strict 1-line, No Emoji) */}
        <div className="hidden md:flex items-center gap-2 shrink-0 whitespace-nowrap">
          
          <button
            onClick={onOpenJoinModal}
            id="navbar-join-button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] font-bold text-xs lg:text-sm rounded-full border-[2.5px] border-[#1E1E1E] brutal-shadow-hover brutal-shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span>Ứng Tuyển Gen K22</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <button
            onClick={onOpenJoinModal}
            className="px-3 py-1.5 bg-[#4285F4] text-[#FFFFFF] text-xs font-bold rounded-full border-[2px] border-[#1E1E1E] whitespace-nowrap"
          >
            Tuyển K22
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="navbar-mobile-toggle"
            className="p-2 text-[#1E1E1E] hover:bg-[#F0F0F0] rounded-xl border-[2.5px] border-[#1E1E1E] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFFFF] border-b-[2.5px] border-[#1E1E1E] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fadeIn">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-[#FFE7A5] text-[#1E1E1E] border-2 border-[#1E1E1E]'
                      : 'text-[#1E1E1E] hover:bg-[#C3ECF6]'
                  }`}
                >
                  <span>{link.name}</span>
                  <span className="font-mono-code text-xs text-[#1E1E1E]/70">//</span>
                </a>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#1E1E1E]/15 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenJoinModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#4285F4] text-[#FFFFFF] font-bold text-sm rounded-full border-[2.5px] border-[#1E1E1E] brutal-shadow-sm"
            >
              <span>Ứng Tuyển Gen K22</span>
            </button>

            {onOpenJdHandbook && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJdHandbook();
                }}
                className="w-full py-2.5 bg-[#FFE7A5] text-[#1E1E1E] font-bold text-xs font-mono-code rounded-full border-[2.5px] border-[#1E1E1E]"
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
