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
      primary: 'theme-button',
      secondary: 'theme-button-secondary',
      outline: 'theme-panel hover:-translate-y-[2px] transition-transform',
      ghost: 'text-theme-muted hover:text-theme-text hover:bg-theme-surface/50 font-display',
    };

    const sizes = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-14 px-6 text-lg',
      lg: 'h-16 px-8 text-xl',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      soundEffects.play('click', theme, language);
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <motion.button
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.9, rotate: -3 }}
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none uppercase',
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
