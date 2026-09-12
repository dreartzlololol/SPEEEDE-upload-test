import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';

import { useSettings } from '@/contexts/SettingsContext';
import { soundEffects } from '@/lib/soundEffects';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, onClick, ...props }, ref) => {
    const { theme, language } = useSettings();

    const variants = {
      primary:
        'bg-blue-500 text-white border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]',
      secondary:
        'bg-gray-700 text-white border-gray-800 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]',
      outline:
        'bg-transparent text-blue-500 border-blue-500 border-b-[4px] hover:bg-blue-500/10 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:translate-y-[2px]',
      ghost:
        'text-theme-muted hover:text-theme-text hover:bg-theme-surface/50 font-display',
    };

    const sizes = {
      sm: 'px-4 py-1.5 text-sm',
      md: 'px-6 py-2 text-base',
      lg: 'px-8 py-3 text-lg',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      soundEffects.play('click', theme, language);
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(
          'cursor-pointer transition-all rounded-lg font-bold inline-flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:pointer-events-none uppercase',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export { Button };

