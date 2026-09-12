import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const routeOrder = [
  '/',
  '/feed',
  '/map',
  '/post-job',
  '/chat',
  '/profile',
  '/settings',
  '/admin'
];

function getRouteIndex(pathname: string) {
  if (pathname.startsWith('/workspace/')) return 10;
  const base = '/' + pathname.split('/')[1];
  const index = routeOrder.indexOf(base);
  return index === -1 ? 99 : index;
}

let prevIndex = 0;
let slideDirection = 1;

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const location = useLocation();
  
  // Synchronously update slide direction on render based on new location
  const currentIndex = getRouteIndex(location.pathname);
  if (currentIndex !== prevIndex) {
    slideDirection = currentIndex > prevIndex ? 1 : -1;
    prevIndex = currentIndex;
  }

  const slideAnimation = {
    initial: { x: slideDirection > 0 ? '100vw' : '-100vw' },
    animate: { x: 0 },
    exit: { x: slideDirection > 0 ? '-100vw' : '100vw' },
    transition: { duration: 0.25, ease: "easeInOut" }
  };

  return (
    <motion.div
      className={className}
      initial={slideAnimation.initial}
      animate={slideAnimation.animate}
      exit={slideAnimation.exit}
      transition={slideAnimation.transition}
    >
      {children}
    </motion.div>
  );
}
