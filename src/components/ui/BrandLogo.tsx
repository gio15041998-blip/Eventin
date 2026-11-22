import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}

const FIGMA_ISOTIPO_PATH =
  '/figma-assets/56f1e19891a7a518bf6a9c40e227b4588595e51257bd7aa16fddba4d33a624db.svg';

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  size = 'md',
  inverted = false,
}) => {
  const iconBox =
    size === 'lg'
      ? 'w-11 h-11'
      : size === 'sm'
      ? 'w-8 h-8'
      : 'w-10 h-10';
  const textClass =
    size === 'lg'
      ? 'text-[32px] leading-none'
      : size === 'sm'
      ? 'text-[22px] leading-none'
      : 'text-[28px] sm:text-[30px] leading-none';

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 font-extrabold tracking-[-0.03em] whitespace-nowrap shrink-0 no-underline ${textClass} ${
        inverted ? 'text-white' : 'text-[#172D28]'
      }`}
      aria-label="Eventin, ir al inicio"
    >
      <span
        className={`relative block shrink-0 rounded-[10px] overflow-hidden ${iconBox} ${
          inverted ? 'ring-1 ring-white/25' : ''
        }`}
      >
        <img
          src={FIGMA_ISOTIPO_PATH}
          alt=""
          className="w-full h-full object-contain block"
        />
      </span>
      <span>eventin</span>
    </Link>
  );
};
