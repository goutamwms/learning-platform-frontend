import { forwardRef, useEffect, useState, type InputHTMLAttributes } from 'react';
import { generateSlug } from '../../utils/slug';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  generateSlugFrom?: string;
  onSlugChange?: (slug: string) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, generateSlugFrom, onSlugChange, ...props }, ref) => {
    const [internalSlug, setInternalSlug] = useState('');

    useEffect(() => {
      if (generateSlugFrom !== undefined && !props.value) {
        const newSlug = generateSlug(generateSlugFrom);
        setInternalSlug(newSlug);
        onSlugChange?.(newSlug);
      }
    }, [generateSlugFrom, props.value, onSlugChange]);

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 text-sm rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
