import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#059669] hover:bg-[#00855d] text-white focus:ring-[#059669]',
    secondary: 'bg-white border border-[#6d7a72]/30 text-[#0b1c30] hover:bg-gray-50 focus:ring-[#059669]',
    outline: 'bg-white border border-[#bccac0] text-[#0b1c30] hover:bg-slate-50 hover:border-[#059669] focus:ring-[#059669]',
    ghost: 'bg-transparent text-[#0b1c30] hover:bg-gray-100 focus:ring-gray-400',
    whatsapp: 'bg-[#25d366] hover:bg-[#20bd5a] text-white font-semibold shadow-sm focus:ring-[#25d366]',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-12 px-5 text-base', // Stitch minimum touch target 48px
    lg: 'h-14 px-6 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
