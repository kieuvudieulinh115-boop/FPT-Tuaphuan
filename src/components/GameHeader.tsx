import React from 'react';
import { Volume2, VolumeX, Settings, Sparkles, User, Trophy, RotateCcw, Video, Box } from 'lucide-react';
import { audioManager } from '../services/audio/AudioManager';
import { FptSchoolsLogo } from './FptSchoolsLogo';

interface GameHeaderProps {
  studentName: string;
  unlockedCount: number;
  totalPieces?: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTeacherSettings: () => void;
  onOpenCertificate?: () => void;
  isCompleted: boolean;
  onExitStudentSession?: () => void;
  currentView?: 'play' | 'assembly';
  onSelectView?: (view: 'play' | 'assembly') => void;
  onResetGame?: () => void;
}

const GameHeaderComponent: React.FC<GameHeaderProps> = ({
  studentName,
  unlockedCount,
  totalPieces = 9,
  isMuted,
  onToggleMute,
  onOpenTeacherSettings,
  onOpenCertificate,
  isCompleted,
  onExitStudentSession,
  currentView = 'play',
  onSelectView,
  onResetGame
}) => {
  return (
    <header className="w-full bg-[#040c24]/90 border-b border-cyan-500/40 px-3 sm:px-6 py-2.5 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(6,182,212,0.25)] text-slate-100">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        
        {/* LEFT: FPT Schools Logo & Brand Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Logo container */}
          <div className="flex items-center px-2.5 py-1.5 rounded-xl bg-[#06102a] border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:border-cyan-300 transition-all duration-300 relative group">
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-cyan-300" />
            <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-cyan-300" />
            <FptSchoolsLogo className="h-6 sm:h-7 w-auto" />
          </div>

          <div className="h-6 w-px bg-cyan-800/60 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-cyan-950/70 border border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-base font-black tracking-wide font-tech text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                  FACE CHALLENGE
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#081b3d] text-cyan-300 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.4)] font-mono tracking-wider">
                  STEM AI
                </span>
              </div>
              <p className="text-[10px] text-cyan-300/80 hidden md:block font-medium">
                Thử thách khuôn mặt - Ghép tranh bí ẩn
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: View Switcher Tabs (Challenge vs Puzzle Assembly) */}
        {onSelectView && (
          <div className="flex items-center p-1 bg-[#06122d] rounded-2xl border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)] order-3 md:order-2">
            <button
              id="view-challenge-tab-btn"
              type="button"
              onClick={() => {
                audioManager.playClick();
                onSelectView('play');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'play'
                  ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.7)]'
                  : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Thử Thách & Câu Hỏi</span>
            </button>

            <button
              id="view-assembly-tab-btn"
              type="button"
              onClick={() => {
                audioManager.playClick();
                onSelectView('assembly');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'assembly'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                  : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Thử Thách Ghép Tranh Bí Ẩn</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-black ${
                currentView === 'assembly'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-[#0a1b3d] text-cyan-300 border border-cyan-500/40'
              }`}>
                {unlockedCount}/{totalPieces}
              </span>
            </button>
          </div>
        )}

        {/* RIGHT: Player Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 order-2 md:order-3">
          {/* Player Name Pill */}
          <div
            onClick={onExitStudentSession}
            title="Nhấp để đổi người chơi"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#081533] border border-cyan-400/50 hover:border-cyan-300 cursor-pointer transition-colors shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <User className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-cyan-100 max-w-[90px] sm:max-w-[140px] truncate">
              {studentName}
            </span>
          </div>

          {/* Reset / Chơi lại button */}
          {onResetGame && (
            <button
              id="reset-game-header-btn"
              type="button"
              title="Chơi lại từ đầu (Đặt lại tiến trình)"
              onClick={() => {
                audioManager.playClick();
                onResetGame();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1408] border border-amber-500/60 text-amber-300 hover:bg-[#2c1c0a] transition-all cursor-pointer text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Chơi lại</span>
            </button>
          )}

          {/* Certificate shortcut if completed */}
          {isCompleted && onOpenCertificate && (
            <button
              type="button"
              onClick={onOpenCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Giấy Khen</span>
            </button>
          )}

          {/* Sound Mute Toggle */}
          <button
            id="sound-toggle-btn"
            type="button"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            onClick={() => {
              audioManager.playClick();
              onToggleMute();
            }}
            className="p-2 rounded-xl bg-[#081533] border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 transition-colors cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>

          {/* Teacher Settings Button */}
          <button
            id="open-teacher-settings-btn"
            type="button"
            title="Cài đặt Giáo viên"
            onClick={() => {
              audioManager.playClick();
              onOpenTeacherSettings();
            }}
            className="p-2 rounded-xl bg-[#081533] border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export const GameHeader = React.memo(GameHeaderComponent);
