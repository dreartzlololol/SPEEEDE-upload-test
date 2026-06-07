import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "flex h-14 w-full theme-input px-4 py-2 text-base font-bold placeholder:text-gray-500 placeholder:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            error && "border-speede-red focus:shadow-[0_0_10px_var(--theme-primary)]",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
