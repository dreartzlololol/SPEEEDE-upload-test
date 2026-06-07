import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const { theme } = useSettings();

  const variants = {
    cartoon: {
      initial: { opacity: 0, scale: 0.8, y: 50 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { type: 'spring', damping: 12, stiffness: 200 }
    },
    scifi: {
      initial: { opacity: 0, x: -50, skewX: 10, filter: 'blur(10px)' },
      animate: { 
        opacity: [0, 1, 0.5, 1], 
        x: [-50, 10, -5, 0], 
        skewX: [10, -5, 2, 0],
        filter: ['blur(10px)', 'blur(0px)', 'blur(2px)', 'blur(0px)']
      },
      transition: { duration: 0.25, times: [0, 0.4, 0.7, 1], ease: "linear" }
    },
    steampunk: {
      initial: { opacity: 0, y: -100, rotate: -5 },
      animate: { opacity: 1, y: 0, rotate: 0 },
      transition: { type: 'spring', damping: 8, stiffness: 100, mass: 2 }
    },
    default: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  const animation = variants[theme as keyof typeof variants] || variants.default;

  return (
    <motion.div
      className={className}
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
    >
      {children}
    </motion.div>
  );
}
