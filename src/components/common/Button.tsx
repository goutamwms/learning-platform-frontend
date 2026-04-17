import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-[#aa3bff] text-white hover:bg-[#9331e6] focus:ring-[#aa3bff]',
      secondary:
        'bg-[#f4f3ec] dark:bg-[#2e303a] text-[#08060d] dark:text-[#f3f4f6] hover:bg-[#e5e4e7] dark:hover:bg-[#3e404a] focus:ring-[#aa3bff]',
      ghost:
        'bg-transparent text-[#6b6375] dark:text-[#9ca3af] hover:bg-[#f4f3ec] dark:hover:bg-[#2e303a] focus:ring-[#aa3bff]',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
