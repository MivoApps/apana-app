import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'outline',
  className = '',
  ...props
}) => {
  const baseClass = 'bg-white rounded-2xl p-4 transition-all';
  const borderClass = variant === 'outline' ? 'border border-[#bccac0]/40 shadow-xs' : '';

  return (
    <div className={`${baseClass} ${borderClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
