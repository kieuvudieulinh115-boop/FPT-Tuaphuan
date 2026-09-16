import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  Play,
  ArrowRight,
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
  totalTimeSeconds: number;
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
  totalTimeSeconds,
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

  // Game state:
  // - 'ready': waiting for player to press 'Bắt đầu'
  // - 'running': 10-second countdown in progress, player holds expression, tracking peak score
  // - 'passed': finished countdown and peak score >= passThreshold
  // - 'failed': finished countdown but peak score < passThreshold
  const [gameState, setGameState] = useState<'ready' | 'running' | 'passed' | 'failed'>('ready');
  const [timeLeft, setTimeLeft] = useState<number>(totalTimeSeconds);
  const [peakScore, setPeakScore] = useState<number>(0);

  const peakScoreRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredPassScoreSoundRef = useRef<boolean>(false);

  // Interactive 3D Perspective Tilt for Mobile Touch, Gyroscope & Mouse (gentle, zero re-renders)
  const { rotateX, rotateY, touchAndMouseProps } = useMobile3DTilt({
    maxTilt: 6,
    enableGyro: true
  });

  // Reset state when challenge changes
  useEffect(() => {
    setGameState('ready');
    setTimeLeft(totalTimeSeconds);
    setPeakScore(0);
    peakScoreRef.current = 0;
    hasTriggeredPassScoreSoundRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [challenge.id, totalTimeSeconds]);

  // Track the highest peak score ONLY while running & play sound when reaching required score
  useEffect(() => {
    if (gameState === 'running' && validationResult?.isValid) {
      const currentScore = scoreResult?.score ?? 0;
      if (currentScore > peakScoreRef.current) {
        peakScoreRef.current = currentScore;
        setPeakScore(currentScore);
      }

      // Phát âm thanh ngay khi đạt số điểm cần (passThreshold)
      if (currentScore >= passThreshold && !hasTriggeredPassScoreSoundRef.current) {
        hasTriggeredPassScoreSoundRef.current = true;
        audioManager.playScoreTargetReached();
      }
    }
  }, [gameState, scoreResult?.score, validationResult?.isValid, passThreshold]);

  // Handle Starting Challenge Countdown (10 seconds)
  const handleStartChallenge = () => {
    audioManager.playClick();
    setGameState('running');
    setTimeLeft(totalTimeSeconds);
    setPeakScore(0);
    peakScoreRef.current = 0;
    hasTriggeredPassScoreSoundRef.current = false;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }

          // Evaluate the peak score ONLY after the 10 seconds finish
          const finalPeak = peakScoreRef.current;
          const passed = finalPeak >= passThreshold;

          setTimeout(() => {
            if (passed) {
              setGameState('passed');
              audioManager.playSuccess();
            } else {
              setGameState('failed');
              audioManager.playFail();
            }
          }, 50);

          return 0;
        }

        // Sound countdown tick on last 3 seconds
        if (prev <= 4) {
          audioManager.playTick();
        }

        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
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

  // Timer Progress Percentage
  const timerPercentage = Math.max(0, Math.min(100, (timeLeft / totalTimeSeconds) * 100));

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
        className="w-full h-full min-h-[380px] lg:min-h-[460px] xl:min-h-[500px] bg-[#0a152e]/90 backdrop-blur-xl border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col justify-between relative overflow-hidden text-slate-100 transform-gpu preserve-3d cursor-grab active:cursor-grabbing select-none"
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
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-cyan-900/60">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotateZ: 5 }}
                className="p-3 bg-cyan-950/70 border border-cyan-400/60 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.25)] text-cyan-300 transform-gpu"
              >
                {renderChallengeIcon(challenge.icon)}
              </motion.div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                  THỬ THÁCH KHUÔN MẶT AI
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-tech">
                  {challenge.name}
                </h2>
              </div>
            </div>

            {/* Circular Countdown Timer */}
            <motion.div
              animate={gameState === 'running' && timeLeft <= 3 ? { scale: [1, 1.08, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="flex items-center gap-2 bg-[#050c1b] px-3.5 py-2 rounded-2xl border border-cyan-500/50 shadow-inner"
            >
              <Timer className={`w-5 h-5 ${gameState === 'running' && timeLeft <= 3 ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}`} />
              <div className="flex items-baseline gap-1 font-mono">
                <span className={`text-xl font-black ${gameState === 'running' && timeLeft <= 3 ? 'text-rose-400' : 'text-white'}`}>
                  {timeLeft}
                </span>
                <span className="text-xs text-cyan-300/70">s</span>
              </div>
            </motion.div>
          </div>

          {/* Instructions & Tip */}
          <div className="space-y-2.5 mb-5">
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
              {challenge.instructions}
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 text-xs shadow-sm">
              <span className="font-bold text-cyan-300">💡 Mẹo nhỏ:</span>
              <span>{challenge.tip}</span>
            </div>
          </div>
        </div>

        {/* STATE 1: READY (Waiting for player to click 'BẮT ĐẦU THỬ THÁCH') */}
        {gameState === 'ready' && (
          <div className="my-2 space-y-4 animate-in fade-in duration-300">
            {/* Camera readiness indicator */}
            <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
              validationResult.isValid
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            }`}>
              {validationResult.isValid ? (
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              )}
              <div className="text-xs">
                <p className="font-semibold">
                  {validationResult.isValid
                    ? 'Khuôn mặt đã sẵn sàng! Nhấn nút bên dưới để bắt đầu thử thách.'
                    : validationResult.message || 'Hãy căn chỉnh khuôn mặt vào giữa khung camera...'}
                </p>
              </div>
            </div>

            {/* Big Start Challenge Button */}
            <motion.button
              id="start-challenge-btn"
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 1 }}
              onClick={handleStartChallenge}
              className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:via-sky-400 hover:to-cyan-300 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center gap-3 cursor-pointer transition-all duration-200 uppercase tracking-wide group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-950 text-cyan-300 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-cyan-300 text-cyan-300 ml-0.5" />
              </div>
              <span>BẮT ĐẦU (GIỮ BIỂU CẢM 10S)</span>
              <Sparkles className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
            </motion.button>

            <div className="text-center space-y-1 text-xs text-slate-400">
              <p>
                ⏱️ Quy tắc: Làm theo yêu cầu và <span className="font-bold text-cyan-300">giữ nguyên trong 10 giây</span>.
              </p>
              <p className="text-[11px] text-cyan-300/80">
                Sau 10 giây, hệ thống sẽ chấm điểm dựa trên <span className="font-bold underline text-white">kết quả đạt cao nhất</span> (Ngưỡng đạt: <span className="font-bold text-cyan-300">{passThreshold} điểm</span>).
              </p>
            </div>
          </div>
        )}

      {/* STATE 2: RUNNING (Live Evaluation Score Meter) */}
      {(gameState === 'running' || gameState === 'passed' || gameState === 'failed') && (
        <div className="space-y-4 my-2">
          {/* Live Score and Peak Score Display */}
          <div className="grid grid-cols-2 gap-3 bg-[#050c1b] p-3 rounded-2xl border border-cyan-500/40">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">
                Điểm tức thời:
              </span>
              <div className="flex items-baseline gap-1 font-mono">
                <span
                  className={`text-2xl font-black transition-colors ${
                    scoreResult.passed ? 'text-emerald-400' : 'text-cyan-300'
                  }`}
                >
                  {validationResult.isValid ? scoreResult.score : 0}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {scoreResult.details.metricName}
              </p>
            </div>

            <div className="border-l border-cyan-900/60 pl-3">
              <span className="text-[11px] text-slate-400 block mb-0.5 font-medium flex items-center gap-1">
                <span>⭐ Cao nhất 10s:</span>
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
                Mục tiêu: ≥ {passThreshold} đ
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

      {/* FOOTER ACTIONS / STATUS */}
      <div className="pt-3 border-t border-cyan-900/60">
        {gameState === 'running' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 animate-pulse">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Đang thực hiện thử thách...</span>
              </span>
              <span className="font-mono font-bold text-white">
                Còn lại: {timeLeft}s
              </span>
            </div>

            {/* Timer countdown bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-cyan-500/40">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 3 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-center text-slate-400 italic">
              Hệ thống liên tục ghi nhận điểm. Sau khi đếm ngược về 0s, hệ thống sẽ chốt điểm cao nhất của bạn!
            </p>
          </div>
        )}

        {gameState === 'passed' && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-4 text-center space-y-3 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-lg font-tech">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>🎉 KẾT QUẢ SAU 10S: ĐẠT YÊU CẦU!</span>
            </div>
            <div className="p-3 rounded-xl bg-[#050c1b] border border-emerald-500/40 text-xs sm:text-sm space-y-1">
              <p className="text-slate-200">
                Điểm số cao nhất bạn đạt được: <span className="text-xl font-mono font-black text-emerald-400">{peakScore}</span> / 100 (Ngưỡng đạt: {passThreshold})
              </p>
              <p className="text-emerald-300 font-medium">
                Xuất sắc! Bạn đã giữ nguyên biểu cảm thành công trong suốt 10 giây.
              </p>
            </div>
            <motion.button
              id="goto-question-btn"
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 1 }}
              onClick={() => {
                audioManager.playClick();
                onPass();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.4)] cursor-pointer transition-transform"
            >
              <span>TRẢ LỜI CÂU HỎI STEM ĐỂ NHẬN MẢNH GHÉP</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}

        {gameState === 'failed' && (
          <div className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-4 text-center space-y-3 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-rose-300 font-bold text-lg font-tech">
              <XCircle className="w-6 h-6 text-rose-400" />
              <span>KẾT QUẢ SAU 10S: CHƯA ĐẠT</span>
            </div>
            <div className="p-3 rounded-xl bg-[#050c1b] border border-rose-500/40 text-xs sm:text-sm space-y-1">
              <p className="text-slate-200">
                Điểm cao nhất bạn đạt được: <span className="text-xl font-mono font-black text-rose-400">{peakScore}</span> / 100
              </p>
              <p className="text-rose-300 font-medium">
                Chưa đủ ngưỡng {passThreshold} điểm. Bạn hãy làm lại, giữ thật rõ biểu cảm trong suốt 10 giây nhé!
              </p>
            </div>
            <motion.button
              id="retry-challenge-btn"
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 1 }}
              onClick={() => {
                audioManager.playClick();
                setGameState('ready');
                setTimeLeft(totalTimeSeconds);
                setPeakScore(0);
                peakScoreRef.current = 0;
                onRetry();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-base rounded-xl shadow-md cursor-pointer transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              <span>THỬ LẠI LẦN NỮA</span>
            </motion.button>
          </div>
        )}
      </div>
      </motion.div>
    </div>
  );
};

export const ChallengeCard = React.memo(ChallengeCardComponent);
