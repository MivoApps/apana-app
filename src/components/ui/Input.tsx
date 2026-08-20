import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#0b1c30]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-12 w-full px-4 rounded-lg bg-white border ${
          error ? 'border-[#ba1a1a]' : 'border-[#bccac0]'
        } text-[#0b1c30] placeholder-[#6d7a72] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#ba1a1a]">{error}</span>}
    </div>
  );
};
