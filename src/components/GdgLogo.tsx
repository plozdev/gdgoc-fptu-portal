import React from 'react';

interface GdgLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const GdgBracketsGlyph: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => {
  return (
    <img
      src="/google_developers_logomark.png"
      alt="Google Developers Logomark"
      style={{ width: `${size}px`, height: 'auto' }}
      className={`object-contain inline-block shrink-0 ${className}`}
    />
  );
};

export const GdgLogo: React.FC<GdgLogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const pixelSizes = {
    sm: 30,
    md: 40,
    lg: 52,
    xl: 64,
  };

  return (
    <div className={`flex items-center gap-3 select-none shrink-0 whitespace-nowrap ${className}`}>
      <img
        src="/google_developers_logomark.png"
        alt="Google Developers Logomark"
        style={{ width: `${pixelSizes[size]}px`, height: 'auto' }}
        className="object-contain inline-block shrink-0"
      />
      {showText && (
        <div className="flex flex-col text-left leading-tight whitespace-nowrap">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-extrabold text-[#1E1E1E] tracking-tight text-sm lg:text-base font-sans whitespace-nowrap">
              Google Developer Groups
            </span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-mono-code text-[11px] sm:text-xs font-semibold text-[#1E1E1E]/80 tracking-wide">
              on Campus
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4285F4]" />
            <span className="font-bold text-xs sm:text-sm text-[#4285F4] tracking-tight">
              FPT University HCMC
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
