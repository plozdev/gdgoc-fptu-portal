import React from 'react';

interface GdgLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const GdgBracketsGlyph: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.65)}
      viewBox="0 0 54 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Google Developer Groups Logo Brackets"
    >
      {/* Left bracket: Red top slanted bar, Yellow bottom slanted bar */}
      <path
        d="M20 5L7 18"
        stroke="#EA4335"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 18L20 31"
        stroke="#F9AB00"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right bracket: Blue top slanted bar, Green bottom slanted bar */}
      <path
        d="M34 5L47 18"
        stroke="#4285F4"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M47 18L34 31"
        stroke="#34A853"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const GdgLogo: React.FC<GdgLogoProps> = ({ size = 'md', showText = true }) => {
  const pixelSizes = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 60,
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      <GdgBracketsGlyph size={pixelSizes[size]} />
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[#1E1E1E] tracking-tight text-sm sm:text-base font-sans">
              Google Developer Groups
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono-code text-[11px] sm:text-xs font-semibold text-[#1E1E1E]/80 tracking-wide">
              on Campus
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4285F4]" />
            <span className="font-bold text-xs sm:text-sm text-[#4285F4] tracking-tight">
              FPT University
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
