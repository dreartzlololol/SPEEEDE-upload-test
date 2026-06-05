import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo } from 'react';

type QuoteEntry = {
  text: string;
  speaker: string;
  emoji: string;
  isOliver?: boolean;
  isAllen?: boolean;
};

const QUOTES: QuoteEntry[] = [
  {
    text: 'WHAT WILL YOU HAVE AFTER 500 JOBS',
    speaker: '— Omni-Man —',
    emoji: '🦸‍♂️',
  },
  {
    text: 'How much does this job pay',
    speaker: '— Oliver, your half-alien son —',
    emoji: '🟣',
    isOliver: true,
  },
  {
    text: "Where's job, william?",
    speaker: '— Omni-Man —',
    emoji: '🦸‍♂️',
  },
  {
    text: "Somebody's Jobbing",
    speaker: '— Allen the Alien —',
    emoji: '👽',
    isAllen: true,
  },
];

interface Props {
  onClose: () => void;
}

export function InvincibleEasterEgg({ onClose }: Props) {
  const entry = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    []
  );

  const isOliver = entry.isOliver;
  const isAllen = entry.isAllen;
  const dripsClass = isOliver ? 'bg-purple-500' : isAllen ? 'bg-orange-500' : 'bg-red-600';
  const glowStyle = isOliver
    ? 'drop-shadow-[0_0_30px_rgba(168,85,247,0.9)]'
    : isAllen
    ? 'drop-shadow-[0_0_30px_rgba(249,115,22,0.9)]'
    : 'drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]';
  const speakerColor = isOliver ? 'text-purple-400' : isAllen ? 'text-orange-400' : 'text-red-500';
  const barColor = isOliver ? 'bg-purple-500' : isAllen ? 'bg-orange-500' : 'bg-red-600';
  const vignetteColor = isOliver
    ? 'rgba(168,85,247,0.4)'
    : isAllen
    ? 'rgba(249,115,22,0.4)'
    : null;

  useEffect(() => {
    const timer = setTimeout(onClose, 7000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Dark background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black"
        />

        {/* Animated drips */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: '110vh', opacity: [0, 1, 1, 0] }}
            transition={{ delay: i * 0.1, duration: 1.5 + (i % 5) * 0.3, ease: 'easeIn' }}
            className={`absolute top-0 rounded-full ${dripsClass}`}
            style={{
              left: `${(i * 8.3) % 100}%`,
              width: `${6 + (i % 3) * 6}px`,
              height: `${40 + (i % 4) * 20}px`,
            }}
          />
        ))}

        {/* Colored vignette for Oliver or Allen */}
        {(isOliver || isAllen) && vignetteColor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.4) 0%, transparent 70%)',
            }}
          />
        )}

        <div className="relative z-10 text-center max-w-2xl px-4">
          {/* Character emoji */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="text-[6rem] mb-6 select-none"
          >
            {entry.emoji}
          </motion.div>

          {/* Speaker label */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`text-xs font-bold tracking-[0.4em] ${speakerColor} uppercase mb-4`}
          >
            {entry.speaker}
          </motion.p>

          {/* Main quote */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
            className={`text-2xl md:text-4xl font-black text-white uppercase leading-tight ${glowStyle}`}
          >
            {entry.text}
          </motion.h2>

          {/* Dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-gray-500 text-sm mt-8"
          >
            (click anywhere to escape… if you can)
          </motion.p>

          {/* Timer bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 6.5, ease: 'linear' }}
            className={`${barColor} h-0.5 origin-left mt-6 w-full`}
            style={{ position: 'relative' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
