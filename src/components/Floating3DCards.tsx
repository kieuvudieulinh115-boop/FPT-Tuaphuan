import React from 'react';
import { motion } from 'motion/react';
import { Smile, Laugh, Sparkles } from 'lucide-react';

interface Floating3DCardsProps {
  className?: string;
}

export const Floating3DCards: React.FC<Floating3DCardsProps> = ({ className = '' }) => {
  return (
    <div className={`relative pointer-events-none select-none ${className}`} style={{ perspective: '1200px' }}>
      {/* CARD 1: Top Floating Smile Card */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          rotateX: [12, 18, 12],
          rotateY: [-22, -14, -22],
          rotateZ: [6, 2, 6]
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-0 right-8 w-28 h-36 sm:w-36 sm:h-44 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-600/10 to-indigo-950/40 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.35)] flex flex-col items-center justify-center p-3 transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Glow corner brackets */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-cyan-300" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-cyan-300" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-cyan-300" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-cyan-300" />

        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-cyan-400/70 flex items-center justify-center bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <Smile className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 stroke-[1.8]" />
        </div>
        <div className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
          Happy
        </div>
      </motion.div>

      {/* CARD 2: Middle Laughing / Winking Card */}
      <motion.div
        animate={{
          y: [10, -10, 10],
          rotateX: [16, 8, 16],
          rotateY: [-28, -20, -28],
          rotateZ: [-4, 3, -4]
        }}
        transition={{
          duration: 6.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.6
        }}
        className="absolute top-36 right-0 w-32 h-40 sm:w-40 sm:h-48 rounded-2xl bg-gradient-to-br from-indigo-500/25 via-cyan-600/10 to-blue-950/45 backdrop-blur-md border border-indigo-400/50 shadow-[0_0_35px_rgba(99,102,241,0.35)] flex flex-col items-center justify-center p-3 transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-indigo-300" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-indigo-300" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-indigo-300" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-indigo-300" />

        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border-2 border-indigo-400/70 flex items-center justify-center bg-indigo-950/50 shadow-[0_0_25px_rgba(99,102,241,0.5)]">
          <Laugh className="w-9 h-9 sm:w-11 sm:h-11 text-indigo-200 stroke-[1.8]" />
        </div>
        <div className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-indigo-300 uppercase">
          Joy
        </div>
      </motion.div>

      {/* CARD 3: Bottom Floating Card */}
      <motion.div
        animate={{
          y: [-6, 12, -6],
          rotateX: [6, 14, 6],
          rotateY: [-18, -26, -18],
          rotateZ: [2, -5, 2]
        }}
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.2
        }}
        className="absolute top-76 right-10 w-28 h-36 sm:w-34 sm:h-42 rounded-2xl bg-gradient-to-br from-sky-400/20 via-teal-600/10 to-slate-950/40 backdrop-blur-md border border-sky-400/50 shadow-[0_0_30px_rgba(14,165,233,0.35)] flex flex-col items-center justify-center p-3 transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-sky-300" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-sky-300" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-sky-300" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-sky-300" />

        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-sky-400/70 flex items-center justify-center bg-sky-950/40 shadow-[0_0_20px_rgba(14,165,233,0.4)]">
          <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-sky-300 stroke-[1.8]" />
        </div>
        <div className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-sky-300 uppercase">
          Wonder
        </div>
      </motion.div>
    </div>
  );
};
