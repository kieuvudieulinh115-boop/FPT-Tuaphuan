import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smile,
  Eye,
  Activity,
  Check
} from 'lucide-react';
import { ChallengeItem, ChallengeScoreResult, FaceValidationResult } from '../types';
import { audioManager } from '../services/audio/AudioManager';
import { useMobile3DTilt } from '../hooks/useMobile3DTilt';

interface ChallengeCardProps {
  challenge: ChallengeItem;
  scoreResult?: ChallengeScoreResult;
  currentScoreResult?: ChallengeScoreResult;
  validationResult?: FaceValidationResult;
  passThreshold: number;
  totalTimeSeconds?: number;
  roundState?: 'ready' | 'countdown' | 'playing';
  onResetToReady?: () => void;
  onPass: () => void;
  onRetry: () => void;
}

const ChallengeCardComponent: React.FC<ChallengeCardProps> = ({
  challenge,
  scoreResult: propScoreResult,
  currentScoreResult,
  validationResult = {
    status: 'checking',
    message: 'Đang kiểm tra...',
    isValid: false,
    faceCount: 0,
    faceSizePercent: 0,
    brightness: 100,
    isCentered: false
  },
  passThreshold,
  roundState = 'ready',
  onResetToReady,
  onPass,
  onRetry
}) => {
  const scoreResult: ChallengeScoreResult = propScoreResult || currentScoreResult || {
    score: 0,
    passed: false,
    details: {
      metricName: 'Chờ nhận diện',
      metricValue: 0,
      targetValue: passThreshold,
      stability: 0,
      description: 'Đang chuẩn bị...'
    }
  };

  const [peakScore, setPeakScore] = useState<number>(0);
  const [passedTriggered, setPassedTriggered] = useState<boolean>(false);

  const peakScoreRef = useRef<number>(0);
  const passedTriggeredRef = useRef<boolean>(false);
  const passTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Interactive 3D Perspective Tilt for Mobile Touch, Gyroscope & Mouse (gentle, zero re-renders)
  const { rotateX, rotateY, touchAndMouseProps } = useMobile3DTilt({
    maxTilt: 6,
    enableGyro: true
  });

  // Handle roundState transitions and reset pass trigger
  useEffect(() => {
    if (roundState === 'ready') {
      passedTriggeredRef.current = false;
      setPassedTriggered(false);
      setPeakScore(0);
      peakScoreRef.current = 0;
      if (passTimeoutRef.current) {
        clearTimeout(passTimeoutRef.current);
        passTimeoutRef.current = null;
      }
    } else if (roundState === 'playing') {
      passedTriggeredRef.current = false;
      setPassedTriggered(false);
    }
  }, [challenge.id, roundState]);

  // Real-time score check:
  // "Tự động chuyển ngay sang màn hình câu hỏi khi đạt điểm chuẩn."
  useEffect(() => {
    if (roundState !== 'playing') return;
    if (passedTriggeredRef.current) return;

    const currentScore = scoreResult?.score ?? 0;
    if (currentScore > peakScoreRef.current) {
      peakScoreRef.current = currentScore;
      setPeakScore(currentScore);
    }

    // Tự động chuyển khi điểm số đạt hoặc vượt điểm chuẩn (hoặc evaluator xác nhận passed)
    if (currentScore >= passThreshold || scoreResult?.passed) {
      passedTriggeredRef.current = true;
      setPassedTriggered(true);

      audioManager.playScoreTargetReached();

      // Đảm bảo timeout không bị hủy khi các frame sau cập nhật điểm
      if (!passTimeoutRef.current) {
        passTimeoutRef.current = setTimeout(() => {
          passTimeoutRef.current = null;
          onPass();
        }, 350);
      }
    }
  }, [roundState, scoreResult?.score, scoreResult?.passed, passThreshold, onPass]);

  // Handle retry
  const handleRetry = () => {
    audioManager.playClick();
    if (onResetToReady) {
      onResetToReady();
    } else {
      onRetry();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (passTimeoutRef.current) {
        clearTimeout(passTimeoutRef.current);
        passTimeoutRef.current = null;
      }
    };
  }, []);

  // Icon selector
  const renderChallengeIcon = (iconName: string) => {
    switch (iconName) {
      case 'smile':
        return <Smile className="w-6 h-6 text-cyan-300" />;
      case 'eye':
        return <Eye className="w-6 h-6 text-cyan-300" />;
      default:
        return <Activity className="w-6 h-6 text-cyan-300" />;
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col perspective-1000 touch-pan-y"
      {...touchAndMouseProps}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        animate={{
          y: [-2, 2, -2]
        }}
        transition={{
          y: { repeat: Infinity, duration: 5, ease: 'easeInOut' }
        }}
        className="w-full h-full min-h-0 lg:min-h-[460px] xl:min-h-[500px] bg-[#0a152e]/90 backdrop-blur-xl border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 lg:p-7 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col justify-between relative overflow-hidden text-slate-100 transform-gpu preserve-3d cursor-grab active:cursor-grabbing select-none"
      >
        {/* Interactive touch specular glow spotlight on mobile/cursor (GPU accelerated CSS variable) */}
        <div
          className="absolute pointer-events-none rounded-full blur-2xl transition-opacity duration-200 z-10 opacity-[var(--glow-opacity,0)]"
          style={{
            left: 'var(--glow-x, 50%)',
            top: 'var(--glow-y, 50%)',
            transform: 'translate(-50%, -50%)',
            width: '220px',
            height: '220px',
            background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(56,189,248,0.12) 50%, transparent 80%)'
          }}
        />

        {/* Hologram sheen scanline */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-full animate-holo-sheen pointer-events-none" />

        {/* Sci-Fi HUD Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm pointer-events-none" />

        {/* Subtle corner tech accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-400/10 via-transparent to-transparent pointer-events-none" />

        {/* Header with Title & Timer */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-cyan-900/60">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ scale: 1.1, rotateZ: 5 }}
                className="p-2.5 sm:p-3 bg-cyan-950/70 border border-cyan-400/60 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.25)] text-cyan-300 transform-gpu"
              >
                {renderChallengeIcon(challenge.icon)}
              </motion.div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                  THỬ THÁCH KHUÔN MẶT AI
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-white font-tech">
                  {challenge.name}
                </h2>
              </div>
            </div>

            {/* Target Score Badge (Thay thế cho giây đếm ngược) */}
            <div className="flex items-center gap-1.5 bg-[#050c1b] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-[11px] text-amber-200/80 font-medium">Mục tiêu:</span>
                <span className="text-sm sm:text-base font-black text-amber-300 font-tech">
                  ≥ {passThreshold} đ
                </span>
              </div>
            </div>
          </div>

          {/* Sửa nội dung hướng dẫn ngắn gọn: Đạt điểm chuẩn để mở khóa câu hỏi */}
          <div className="my-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-cyan-950/80 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30 shrink-0">
              Yêu cầu
            </span>
            <p className="text-sm sm:text-base text-slate-100 font-bold leading-relaxed">
              Đạt điểm chuẩn để mở khóa câu hỏi.
            </p>
          </div>
        </div>

        {/* STATE: PASSED CELEBRATION (Auto transition in progress) */}
        {passedTriggered && (
          <div className="my-2 bg-emerald-950/80 border-2 border-emerald-400/60 rounded-2xl p-4 text-center space-y-2.5 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-extrabold text-lg font-tech">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>🎉 ĐÃ ĐẠT ĐIỂM CHUẨN ({scoreResult.score}/{passThreshold})!</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Đang tự động chuyển sang câu hỏi...</span>
            </div>
          </div>
        )}

        {/* STATE: ACTIVE PLAYING (Live Evaluation Score Meter) */}
        {!passedTriggered && roundState === 'playing' && (
          <div className="space-y-4 my-2 animate-in fade-in duration-200">
            {/* Live Score and Peak Score Display */}
            <div className="grid grid-cols-2 gap-3 bg-[#050c1b] p-3 rounded-2xl border border-cyan-500/40">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">
                  Điểm tức thời:
                </span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span
                    className={`text-2xl font-black transition-colors ${
                      scoreResult.score >= passThreshold ? 'text-emerald-400' : 'text-cyan-300'
                    }`}
                  >
                    {scoreResult.score}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {scoreResult.details.metricName}
                </p>
              </div>

              <div className="border-l border-cyan-900/60 pl-3">
                <span className="text-[11px] text-slate-400 block mb-0.5 font-medium flex items-center gap-1">
                  <span>⭐ Cao nhất:</span>
                </span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span
                    className={`text-2xl font-black transition-colors ${
                      peakScore >= passThreshold ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-cyan-300'
                    }`}
                  >
                    {peakScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">
                  Điểm chuẩn: ≥ {passThreshold} đ
                </p>
              </div>
            </div>

            {/* Real-time Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">
                  {scoreResult.details.description}
                </span>
                <span className={`font-mono ${scoreResult.score >= passThreshold ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  {scoreResult.score}%
                </span>
              </div>

              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-cyan-500/40">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    scoreResult.score >= passThreshold
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, scoreResult.score))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STATE: READY OR COUNTDOWN */}
        {!passedTriggered && roundState !== 'playing' && (
          <div className="my-1 sm:my-2 space-y-3 animate-in fade-in duration-300">
            {/* Camera readiness indicator */}
            <div className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-2 transition-colors ${
              validationResult.isValid
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            }`}>
              <div className="flex items-center gap-2 text-xs">
                {validationResult.isValid ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                )}
                <p className="font-semibold text-[11px] sm:text-xs">
                  {validationResult.isValid
                    ? 'Khuôn mặt đã sẵn sàng trong khung hình!'
                    : validationResult.message || 'Hãy căn chỉnh khuôn mặt vào giữa camera...'}
                </p>
              </div>
              {validationResult.isValid && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/40 shrink-0">
                  CAMERA SẴN SÀNG
                </span>
              )}
            </div>

            {/* Target Score Box & Real-time Live Expression Meter in Ready State */}
            <div className="bg-[#050c1b]/90 p-3 rounded-2xl border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Điểm chuẩn yêu cầu:
                </span>
                <span className="font-mono font-bold text-xs sm:text-sm text-cyan-300">
                  {passThreshold} / 100 điểm
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
                <div
                  className="h-full transition-all duration-150 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{ width: `${Math.min(100, scoreResult.score)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Điểm thử biểu cảm: {scoreResult.score}đ</span>
                <span className="text-amber-300/80 font-semibold">Mục tiêu: {passThreshold}đ</span>
              </div>
            </div>

            {/* Prompt pointing player to the Camera "SẴN SÀNG" button */}
            <div className="p-3 rounded-2xl bg-cyan-950/50 border border-amber-500/30 text-center space-y-1">
              {roundState === 'countdown' ? (
                <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs sm:text-sm animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Đang đếm ngược <strong className="text-yellow-300 font-mono font-black text-sm">3 - 2 - 1</strong> trên Camera... Chuẩn bị biểu cảm!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-slate-100 font-bold text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Bấm nút <strong className="text-amber-300 font-black uppercase tracking-wide drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">"SẴN SÀNG"</strong> trên khung Camera để bắt đầu!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER STATUS */}
        <div className="pt-3 border-t border-cyan-900/60">
          {roundState === 'playing' && !passedTriggered && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 animate-pulse">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Đang nhận diện biểu cảm AI...</span>
                </span>
                <span className="font-mono font-bold text-amber-300">
                  Chuẩn: {passThreshold} điểm
                </span>
              </div>

              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                <p className="text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Đạt đủ {passThreshold} điểm hệ thống sẽ tự động chuyển sang câu hỏi ngay!</span>
                </p>
              </div>
            </div>
          )}

          {roundState !== 'playing' && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>AI Face Mesh 478 điểm mốc</span>
              </span>
              <span className="text-cyan-400 font-mono font-bold">1 Mảnh / 1 Câu hỏi</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const ChallengeCard = React.memo(ChallengeCardComponent);
