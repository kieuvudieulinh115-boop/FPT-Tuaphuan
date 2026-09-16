import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, Play, Camera, ShieldCheck, Award, ArrowRight, GraduationCap } from 'lucide-react';
import { audioManager } from '../services/audio/AudioManager';
import { FptSchoolsLogo } from './FptSchoolsLogo';
import { Cyber3DFace } from './Cyber3DFace';
import { Floating3DCards } from './Floating3DCards';
import { HoloGlobe3D } from './HoloGlobe3D';

interface StudentEntryScreenProps {
  onStart: (playerName: string) => void;
  defaultName?: string;
  onOpenTeacherSettings?: () => void;
}

export const StudentEntryScreen: React.FC<StudentEntryScreenProps> = ({
  onStart,
  defaultName = '',
  onOpenTeacherSettings
}) => {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Vui lòng nhập họ và tên của bạn để bắt đầu nhé!');
      return;
    }
    if (trimmed.length < 2) {
      setError('Tên cần có ít nhất 2 ký tự');
      return;
    }
    audioManager.playClick();
    onStart(trimmed);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#040817] text-slate-100 flex flex-col items-center justify-between p-3 sm:p-6 overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* BACKGROUND AMBIENT SCI-FI LIGHTING & GLOWING GRIDS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Deep blue and purple radial energy fields */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-cyan-600/20 via-indigo-600/15 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[170px]" />

        {/* Perspective floor grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Horizontal Laser Scanning Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      </div>

      {/* TOP HEADER BAR: FPT SCHOOLS LOGO & SLOGANS */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 pt-2 pb-4">
        {/* Top Left Slogan */}
        <div className="hidden md:flex flex-col text-[11px] font-mono tracking-widest text-cyan-400/80 leading-relaxed uppercase">
          <span>EXPLORE</span>
          <span>LEARN</span>
          <span>CREATE</span>
          <span className="text-cyan-200 font-bold">A BRIGHTER YOU</span>
        </div>

        {/* Center: Brand FPT Schools */}
        <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-slate-900/80 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-md">
          <FptSchoolsLogo className="h-8 sm:h-10 w-auto" />
        </div>

        {/* Top Right Slogan */}
        <div className="text-[11px] font-mono tracking-widest text-cyan-400 font-semibold flex items-center gap-2">
          <span>STEM × CREATIVITY</span>
          <span className="text-cyan-300 font-bold tracking-tighter">///</span>
        </div>
      </header>

      {/* MAIN HERO STAGE */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col items-center justify-center relative z-10 py-4 my-auto">
        
        {/* LEFT DECORATION: 3D HOLOGRAPHIC CYBER FACE */}
        <div className="hidden lg:flex flex-col items-start absolute left-0 top-1/2 -translate-y-1/2 w-72 pointer-events-none select-none">
          <Cyber3DFace className="w-64 h-80" interactive={true} />
          <div className="mt-2 text-[10px] font-mono tracking-wider text-cyan-400/80 space-y-1 pl-4">
            <p className="flex items-center gap-1.5 font-bold text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              FACE RECOGNITION
            </p>
            <p>FACIAL ANALYSIS</p>
            <p>EMOTION DETECTION</p>
            <p>LEARNING MODE</p>
            <div className="flex gap-1 text-cyan-500 font-bold pt-1">
              <span>/////</span>
            </div>
          </div>
        </div>

        {/* RIGHT DECORATION: FLOATING 3D CARDS & GLOBE */}
        <div className="hidden lg:flex flex-col items-center absolute right-0 top-1/2 -translate-y-1/2 w-80 pointer-events-none select-none">
          <Floating3DCards className="w-80 h-96" />
          <div className="absolute -bottom-10 right-4">
            <HoloGlobe3D />
          </div>
          <div className="absolute top-0 right-2 text-[10px] font-mono tracking-widest text-cyan-400/80 space-y-1 text-right">
            <p>DISCOVER</p>
            <p>THINK</p>
            <p>SOLVE</p>
            <p className="text-cyan-300 font-bold">GROW</p>
          </div>
        </div>

        {/* CENTER CONTENT COLUMN */}
        <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-5">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-cyan-300 text-xs sm:text-sm font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>STEM INTERACTIVE LEARNING</span>
          </div>

          {/* GIANT TITLE WITH 3D ORBITING ENERGY RINGS */}
          <div className="relative flex flex-col items-center justify-center my-1">
            {/* Elliptical Glowing Energy Rings */}
            <div className="absolute -inset-x-12 -inset-y-4 rounded-[100%] border border-cyan-400/40 shadow-[0_0_40px_rgba(6,182,212,0.3)] rotate-[-6deg] pointer-events-none animate-pulse" />
            <div className="absolute -inset-x-8 -inset-y-2 rounded-[100%] border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.3)] rotate-[8deg] pointer-events-none" />

            <h1 className="relative text-5xl sm:text-7xl font-black tracking-wider uppercase font-tech text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-sky-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.6)]">
              FACE
              <br />
              CHALLENGE
            </h1>

            {/* Script subtitle beside title */}
            <span className="absolute -bottom-3 right-0 sm:right-6 font-serif italic text-purple-300 text-sm sm:text-base font-semibold drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
              Your Imagination
            </span>
          </div>

          {/* Subheading & Description */}
          <div className="space-y-2 pt-1">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-100 tracking-wide">
              Thử thách khuôn mặt – Ghép tranh bí mật
            </h2>
            <p className="text-xs sm:text-sm text-cyan-200/80 max-w-lg mx-auto leading-relaxed">
              Vượt qua 9 thử thách biểu cảm và trả lời đúng các câu đố STEM thú vị để mở khóa toàn bộ bức tranh bí mật!
            </p>
          </div>

          {/* PLAYER INPUT CARD */}
          <div className="w-full max-w-lg bg-[#0a152e]/85 backdrop-blur-xl border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative text-left">
            {/* Sci-Fi HUD Corner Brackets */}
            <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="player-name-input" className="block text-xs sm:text-sm font-bold text-cyan-300 tracking-wide">
                  Họ và tên người chơi <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="player-name-input"
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Ví dụ: Nguyễn Văn An – Lớp 4A"
                    className="w-full pl-11 pr-4 py-3 bg-[#070e1f] border border-cyan-500/60 focus:border-cyan-400 rounded-2xl text-white text-sm sm:text-base placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-cyan-400/40 shadow-inner font-medium"
                  />
                </div>
                {error && (
                  <p className="text-xs font-semibold text-rose-400 flex items-center gap-1 pt-0.5">
                    <span>⚠️</span> {error}
                  </p>
                )}
              </div>

              {/* Privacy Note */}
              <div className="bg-[#050c1b]/80 border border-cyan-500/30 rounded-2xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-cyan-200">Bảo mật & Quyền riêng tư của người chơi:</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Toàn bộ dữ liệu xử lý trực tiếp trên thiết bị của bạn. Hệ thống không lưu video, không lưu ảnh khuôn mặt và không gửi dữ liệu lên máy chủ. Tên chỉ dùng để in Giấy Khen sau khi hoàn thành.
                  </p>
                </div>
              </div>

              {/* Circular Holographic Stage Pedestal & Start Button */}
              <div className="relative pt-3 flex flex-col items-center justify-center">
                {/* Glowing Concentric Ellipse Pedestals */}
                <div className="absolute -bottom-2 w-72 sm:w-96 h-12 rounded-[100%] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-md pointer-events-none" />
                <div className="absolute -bottom-1 w-60 sm:w-80 h-8 rounded-[100%] border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.6)] pointer-events-none" />

                <motion.button
                  id="start-challenge-button"
                  type="submit"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98, y: 1 }}
                  className="relative z-10 w-full group inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:via-sky-400 hover:to-cyan-300 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:shadow-[0_0_50px_rgba(6,182,212,0.9)] transition-all duration-200 cursor-pointer uppercase tracking-wider"
                >
                  <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                  <span>BẮT ĐẦU THỬ THÁCH</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </form>
          </div>

          {/* 3 FEATURE CARDS WITH 3D HOVER TILT & BOUNCE */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-lg pt-1 perspective-800">
            <motion.div
              whileHover={{ y: -4, scale: 1.04, rotateX: 6, rotateY: -6 }}
              className="p-3 rounded-2xl bg-[#091329]/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col items-center text-center cursor-default transform-gpu preserve-3d"
            >
              <Camera className="w-5 h-5 text-cyan-300 mb-1" />
              <p className="text-xs font-bold text-slate-100">Nhận diện biểu cảm</p>
              <p className="text-[10px] text-cyan-300/70">Biểu cảm & cử động</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.04, rotateX: 6, rotateY: 0 }}
              className="p-3 rounded-2xl bg-[#091329]/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col items-center text-center cursor-default transform-gpu preserve-3d"
            >
              <Sparkles className="w-5 h-5 text-amber-400 mb-1" />
              <p className="text-xs font-bold text-slate-100">9 Mảnh Ghép</p>
              <p className="text-[10px] text-cyan-300/70">Bức tranh bí mật</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.04, rotateX: 6, rotateY: 6 }}
              className="p-3 rounded-2xl bg-[#091329]/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col items-center text-center cursor-default transform-gpu preserve-3d"
            >
              <Award className="w-5 h-5 text-emerald-400 mb-1" />
              <p className="text-xs font-bold text-slate-100">Giấy Khen</p>
              <p className="text-[10px] text-cyan-300/70">Xuất PDF & in ngay</p>
            </motion.div>
          </div>

          {/* TEACHER SETTINGS SHORTCUT */}
          {onOpenTeacherSettings && (
            <div className="pt-2">
              <button
                id="teacher-settings-entry-btn"
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  onOpenTeacherSettings();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Dành cho Giáo viên: Cài đặt thời gian, câu hỏi & tranh ghép →</span>
              </button>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-cyan-400/60 font-mono pt-3 border-t border-cyan-950/80 z-20 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-purple-300 text-xs">Small Faces, Big Ideas, Better Tomorrow</span>
        </div>
        <div className="text-center">
          FPT SCHOOLS • STEM FOR A BRIGHTER GENERATION
        </div>
        <div className="flex items-center gap-1 font-bold">
          <span>//////</span>
        </div>
      </footer>
    </div>
  );
};
