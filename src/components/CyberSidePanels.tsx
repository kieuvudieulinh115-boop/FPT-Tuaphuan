import React from 'react';
import { motion } from 'motion/react';
import { Smile } from 'lucide-react';
import { Cyber3DFace } from './Cyber3DFace';

interface CyberSidePanelProps {
  className?: string;
}

export const CyberLeftPanel: React.FC<CyberSidePanelProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none pointer-events-none perspective-800 ${className}`}>
      {/* Compact 3D Floating Holographic Scanner Card */}
      <motion.div
        animate={{
          y: [-4, 4, -4],
          rotateY: [-16, -10, -16],
          rotateX: [6, 12, 6],
          rotateZ: [-1, 1, -1]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="w-18 h-22 rounded-xl bg-cyan-950/40 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.35)] backdrop-blur-md flex flex-col items-center justify-center relative p-1.5 transform-gpu preserve-3d"
      >
        {/* Corner Brackets */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-300" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-300" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-300" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-300" />

        {/* Hologram Sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/15 via-transparent to-transparent pointer-events-none rounded-lg" />

        <div className="w-10 h-10 rounded-full border border-cyan-400/70 flex items-center justify-center bg-cyan-900/40 shadow-[0_0_12px_rgba(6,182,212,0.4)] relative">
          <Smile className="w-6 h-6 text-cyan-300 stroke-[1.8]" />
          <div className="absolute inset-0 border border-cyan-300/30 rounded-full animate-ping opacity-25" />
        </div>

        <div className="mt-1 text-[8px] font-mono font-black tracking-wider text-cyan-300 uppercase">
          AI SCAN
        </div>
      </motion.div>

      {/* Vertical Tech Keywords (Compact) */}
      <div className="mt-6 flex flex-col items-center space-y-1 font-mono tracking-widest text-[10px] font-black text-cyan-400/90 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
        <span>SCAN</span>
        <span>ANALYZE</span>
        <span>LEARN</span>
        <span className="text-cyan-200">GROW</span>
      </div>

      {/* Cyber Slanted Bars (Compact) */}
      <div className="mt-3 flex items-center space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`left-bar-${i}`}
            className="w-1 h-3.5 bg-cyan-400 transform skew-x-[-20deg] shadow-[0_0_6px_rgba(6,182,212,0.8)] opacity-90"
            style={{ animation: `pulse 1.8s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
};

export const CyberRightPanel: React.FC<CyberSidePanelProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none pointer-events-none ${className}`}>
      {/* Cursive Glowing Script */}
      <div className="mb-1 text-center">
        <span
          className="text-xs sm:text-sm font-bold italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          style={{ fontFamily: 'Brush Script MT, "Segoe Script", cursive' }}
        >
          AI Makes
          <br />
          Learning Fun
        </span>
      </div>

      {/* Compact 3D Wireframe Cyber Face Mesh */}
      <div className="w-28 h-36 relative flex items-center justify-center">
        <Cyber3DFace className="w-full h-full" interactive={false} />
      </div>

      {/* HUD Subtitle (Compact) */}
      <div className="mt-2 text-center space-y-0.5 font-mono text-[9px] font-black tracking-widest text-cyan-400/90 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
        <p>UNLOCK</p>
        <p>YOUR</p>
        <p className="text-cyan-200">POTENTIAL</p>
      </div>

      {/* Cyber Slanted Bars */}
      <div className="mt-2.5 flex items-center space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`right-bar-${i}`}
            className="w-1 h-3.5 bg-cyan-400 transform skew-x-[-20deg] shadow-[0_0_6px_rgba(6,182,212,0.8)] opacity-90"
            style={{ animation: `pulse 1.8s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
};
