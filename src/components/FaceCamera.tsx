import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, AlertCircle, RefreshCw, Eye, Sparkles, SunMedium, Users, ShieldAlert } from 'lucide-react';
import { faceLandmarkerService } from '../services/ai/FaceLandmarkerService';
import { expressionAnalyzer } from '../services/ai/ExpressionAnalyzer';
import { challengeEvaluator } from '../services/ai/ChallengeEvaluator';
import { ChallengeId, ChallengeScoreResult, FaceValidationResult } from '../types';

interface FaceCameraProps {
  currentChallengeId: ChallengeId;
  passThreshold: number;
  isPaused: boolean;
  onValidationChange: (res: FaceValidationResult) => void;
  onScoreUpdate: (res: ChallengeScoreResult) => void;
}

const FaceCameraComponent: React.FC<FaceCameraProps> = ({
  currentChallengeId,
  passThreshold,
  isPaused,
  onValidationChange,
  onScoreUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastDetectTimeRef = useRef<number>(0);
  const lastEmittedScoreTimeRef = useRef<number>(0);
  const lastEmittedScoreValRef = useRef<number>(-1);
  const lastEmittedPassedRef = useRef<boolean>(false);
  const lastEmittedValKeyRef = useRef<string>('');
  const lastLandmarksRef = useRef<{ x: number; y: number; z: number }[] | null>(null);

  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [modelLoading, setModelLoading] = useState<boolean>(true);
  const [validation, setValidation] = useState<FaceValidationResult>({
    status: 'checking',
    message: 'Đang kết nối camera & nhận diện...',
    isValid: false,
    faceCount: 0,
    faceSizePercent: 0,
    brightness: 100,
    isCentered: false
  });

  // Start webcam
  const startCamera = useCallback(async () => {
    setCameraState('loading');
    setErrorMessage('');

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setCameraState('active');
          }).catch(err => {
            console.error('Video play error:', err);
            setCameraState('error');
            setErrorMessage('Không thể phát luồng camera.');
          });
        };
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const errName = (err as { name?: string })?.name;
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Quyền truy cập Camera bị từ chối. Hãy nhấp vào biểu tượng camera trên thanh địa chỉ duyệt web để cho phép.');
      } else {
        setCameraState('error');
        setErrorMessage('Không tìm thấy camera hoặc camera đang bị ứng dụng khác sử dụng.');
      }
    }
  }, []);

  // Initialize AI Model and start camera
  useEffect(() => {
    let isMounted = true;

    async function initAI() {
      setModelLoading(true);
      try {
        await faceLandmarkerService.init();
      } catch (e) {
        console.warn('FaceLandmarker init issue:', e);
      } finally {
        if (isMounted) {
          setModelLoading(false);
        }
      }
    }

    initAI();
    startCamera();

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // Main Computer Vision Detection Loop
  useEffect(() => {
    if (cameraState !== 'active' || isPaused) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      return;
    }

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2) {
        animFrameIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Sync canvas dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const now = performance.now();
      // Throttle heavy MediaPipe AI detection to ~20 FPS (every 50ms) to ensure butter-smooth performance
      if (now - lastDetectTimeRef.current >= 50) {
        lastDetectTimeRef.current = now;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Run real MediaPipe detection
        const det = faceLandmarkerService.detect(video);
        const faceCount = det ? det.faceCount : 0;
        const landmarks = det?.landmarks;
        const blendshapes = det?.blendshapes;
        const matrix = det?.transformationMatrix;
        lastLandmarksRef.current = landmarks || null;

        // Validate face position, distance, lighting, multiple faces
        const valRes = expressionAnalyzer.validateFace(faceCount, landmarks, video);
        
        // Only propagate validation state when status or validity changes to prevent React render thrashing
        const valKey = `${valRes.status}_${valRes.isValid}_${valRes.message}`;
        if (lastEmittedValKeyRef.current !== valKey) {
          lastEmittedValKeyRef.current = valKey;
          setValidation(valRes);
          onValidationChange(valRes);
        }

        // Draw High-Tech Biometric HUD Tracking Overlay on Canvas
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const hasFace = landmarks && landmarks.length > 0;

          if (!hasFace) {
            // STATE 1: WAITING FOR FACE - Draw a single, sleek futuristic alignment target
            ctx.save();
            const guideW = w * 0.44;
            const guideH = h * 0.58;
            const gcx = w / 2;
            const gcy = h / 2;
            const gx1 = gcx - guideW / 2;
            const gy1 = gcy - guideH / 2;
            const gx2 = gcx + guideW / 2;
            const gy2 = gcy + guideH / 2;
            const cLen = 22;

            // Subtle pulsing glow
            const pulseAlpha = 0.35 + 0.15 * Math.sin(now / 300);
            ctx.strokeStyle = `rgba(6, 182, 212, ${pulseAlpha})`;
            ctx.lineWidth = 2;
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 8;

            // 4 Corner Brackets
            // Top-Left
            ctx.beginPath();
            ctx.moveTo(gx1, gy1 + cLen);
            ctx.lineTo(gx1, gy1);
            ctx.lineTo(gx1 + cLen, gy1);
            // Top-Right
            ctx.moveTo(gx2 - cLen, gy1);
            ctx.lineTo(gx2, gy1);
            ctx.lineTo(gx2, gy1 + cLen);
            // Bottom-Left
            ctx.moveTo(gx1, gy2 - cLen);
            ctx.lineTo(gx1, gy2);
            ctx.lineTo(gx1 + cLen, gy2);
            // Bottom-Right
            ctx.moveTo(gx2 - cLen, gy2);
            ctx.lineTo(gx2, gy2);
            ctx.lineTo(gx2, gy2 - cLen);
            ctx.stroke();

            // Center Crosshairs
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
            ctx.beginPath();
            ctx.moveTo(gcx - 14, gcy);
            ctx.lineTo(gcx + 14, gcy);
            ctx.moveTo(gcx, gcy - 14);
            ctx.lineTo(gcx, gcy + 14);
            ctx.stroke();

            // Thin dashed oval guide
            ctx.setLineDash([6, 8]);
            ctx.beginPath();
            ctx.ellipse(gcx, gcy, guideW * 0.48, guideH * 0.48, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.restore();
          } else {
            // STATE 2: FACE DETECTED - Draw precision single Sci-Fi biometric HUD tracking frame
            ctx.save();

            const noseTip = landmarks[1] || landmarks[4];
            const chin = landmarks[152];
            const forehead = landmarks[10];
            const leftCheek = landmarks[234];
            const rightCheek = landmarks[454];

            // Face center
            const cx = (leftCheek && rightCheek ? (leftCheek.x + rightCheek.x) / 2 : (noseTip ? noseTip.x : 0.5)) * w;
            const cy = (forehead && chin ? (forehead.y + chin.y) / 2 : (noseTip ? noseTip.y : 0.5)) * h;

            // Dimensions with pleasant breathing room
            const rawFaceW = leftCheek && rightCheek ? Math.abs(rightCheek.x - leftCheek.x) * w : w * 0.35;
            const rawFaceH = forehead && chin ? Math.abs(chin.y - forehead.y) * h : h * 0.45;
            const halfW = Math.max(rawFaceW * 0.62, 68);
            const halfH = Math.max(rawFaceH * 0.65, 84);

            const x1 = cx - halfW;
            const y1 = cy - halfH;
            const x2 = cx + halfW;
            const y2 = cy + halfH;
            const cornerLen = Math.min(halfW, halfH) * 0.32;

            const isOk = valRes.isValid;
            const isWarn = valRes.status === 'multiple_faces' || valRes.status === 'occluded';
            const themeColor = isOk ? '#10b981' : (isWarn ? '#f43f5e' : '#06b6d4');
            const themeRgb = isOk ? '16, 185, 129' : (isWarn ? '244, 63, 94' : '6, 182, 212');

            // 1. Sleek 4-Corner L-Brackets with neon glow
            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = themeColor;
            ctx.shadowBlur = 10;

            // Top-Left
            ctx.beginPath();
            ctx.moveTo(x1, y1 + cornerLen);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x1 + cornerLen, y1);
            // Top-Right
            ctx.moveTo(x2 - cornerLen, y1);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2, y1 + cornerLen);
            // Bottom-Left
            ctx.moveTo(x1, y2 - cornerLen);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x1 + cornerLen, y2);
            // Bottom-Right
            ctx.moveTo(x2 - cornerLen, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y2 - cornerLen);
            ctx.stroke();

            // 2. Subtle bounding perimeter hairlines with micro tick-marks
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(${themeRgb}, 0.25)`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(x1 + cornerLen, y1);
            ctx.lineTo(x2 - cornerLen, y1);
            ctx.moveTo(x2, y1 + cornerLen);
            ctx.lineTo(x2, y2 - cornerLen);
            ctx.moveTo(x2 - cornerLen, y2);
            ctx.lineTo(x1 + cornerLen, y2);
            ctx.moveTo(x1, y2 - cornerLen);
            ctx.lineTo(x1, y1 + cornerLen);
            ctx.stroke();
            ctx.setLineDash([]);

            // Edge center tick marks
            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 6, y1); ctx.lineTo(cx + 6, y1);
            ctx.moveTo(cx - 6, y2); ctx.lineTo(cx + 6, y2);
            ctx.moveTo(x1, cy - 6); ctx.lineTo(x1, cy + 6);
            ctx.moveTo(x2, cy - 6); ctx.lineTo(x2, cy + 6);
            ctx.stroke();

            // 3. Single Elegant Biometric Segmented Ring (ONE ring only, rotating aperture)
            const apertureR = Math.max(halfW, halfH) * 1.04;
            const rotAngle = (now / 2200) % (Math.PI * 2);
            ctx.strokeStyle = `rgba(${themeRgb}, 0.45)`;
            ctx.lineWidth = 1.6;
            const arcSpan = Math.PI * 0.20; // 36 degrees per arc
            for (let i = 0; i < 4; i++) {
              const startA = rotAngle + (i * Math.PI * 0.5) + (Math.PI * 0.05);
              const endA = startA + arcSpan;
              ctx.beginPath();
              ctx.arc(cx, cy, apertureR, startA, endA);
              ctx.stroke();
            }

            // Small glowing pips at Cardinal points
            ctx.fillStyle = themeColor;
            const pipDist = apertureR + 4;
            const cardinalPoints = [
              [cx, cy - pipDist],
              [cx + pipDist, cy],
              [cx, cy + pipDist],
              [cx - pipDist, cy]
            ];
            for (const [px, py] of cardinalPoints) {
              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }

            // 4. Biometric Landmark Nodes (Cyber Mesh Points)
            const keyPoints = [
              1, 33, 133, 362, 263, 61, 291, 13, 14, 70, 300, 152, 10,
              160, 144, 385, 373, 234, 454
            ];

            ctx.fillStyle = isOk ? '#00f5d4' : '#f59e0b';
            ctx.shadowColor = isOk ? '#00f5d4' : '#f59e0b';
            ctx.shadowBlur = 6;
            for (const idx of keyPoints) {
              const pt = landmarks[idx];
              if (pt) {
                ctx.beginPath();
                ctx.arc(pt.x * w, pt.y * h, 2.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.shadowBlur = 0;

            // 5. Dynamic Lips Loop (Vital feedback for smile / pucker / mouth open)
            const lipIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.lineWidth = 1.6;
            for (let i = 0; i < lipIndices.length; i++) {
              const pt = landmarks[lipIndices[i]];
              if (pt) {
                const px = pt.x * w;
                const py = pt.y * h;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
            }
            ctx.closePath();
            ctx.stroke();

            // 6. Subtle Eye Outlines (Feedback for blink / wink)
            const leftEyeIndices = [33, 160, 158, 133, 153, 144];
            const rightEyeIndices = [362, 385, 387, 263, 373, 380];
            const drawEyeLoop = (indices: number[]) => {
              ctx.beginPath();
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
              ctx.lineWidth = 1.2;
              for (let i = 0; i < indices.length; i++) {
                const pt = landmarks[indices[i]];
                if (pt) {
                  const px = pt.x * w;
                  const py = pt.y * h;
                  if (i === 0) ctx.moveTo(px, py);
                  else ctx.lineTo(px, py);
                }
              }
              ctx.closePath();
              ctx.stroke();
            };
            drawEyeLoop(leftEyeIndices);
            drawEyeLoop(rightEyeIndices);

            ctx.restore();
          }
        }

        // Evaluate challenge score if face is valid
        if (valRes.isValid && landmarks && landmarks.length >= 468) {
          const scoreRes = challengeEvaluator.evaluate(
            currentChallengeId,
            landmarks,
            blendshapes,
            matrix,
            passThreshold
          );

          // Throttle score emission to avoid 60fps React state churn
          const timeSinceLastScore = now - lastEmittedScoreTimeRef.current;
          const scoreDelta = Math.abs(scoreRes.score - lastEmittedScoreValRef.current);
          if (
            scoreRes.passed !== lastEmittedPassedRef.current ||
            scoreDelta >= 2 ||
            timeSinceLastScore >= 75
          ) {
            lastEmittedScoreTimeRef.current = now;
            lastEmittedScoreValRef.current = scoreRes.score;
            lastEmittedPassedRef.current = scoreRes.passed;
            onScoreUpdate(scoreRes);
          }
        } else {
          // Not valid face -> zero score, emit once when entering invalid state
          if (lastEmittedScoreValRef.current !== 0 || lastEmittedPassedRef.current !== false) {
            lastEmittedScoreValRef.current = 0;
            lastEmittedPassedRef.current = false;
            onScoreUpdate({
              score: 0,
              passed: false,
              details: {
                metricName: 'Nhận diện khuôn mặt',
                metricValue: 0,
                targetValue: passThreshold,
                stability: 0,
                description: valRes.message
              }
            });
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [cameraState, isPaused, currentChallengeId, passThreshold, onValidationChange, onScoreUpdate]);

  return (
    <div className="relative w-full aspect-[4/3] min-h-[320px] sm:min-h-[360px] max-h-[440px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-sky-400 shadow-[0_0_25px_rgba(14,165,233,0.25)] flex items-center justify-center group">
      {/* Sci-Fi HUD Corner Brackets */}
      <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm pointer-events-none z-20" />
      <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm pointer-events-none z-20" />
      <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm pointer-events-none z-20" />
      <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm pointer-events-none z-20" />

      {/* Futuristic Scanline Effect */}
      {cameraState === 'active' && !modelLoading && (
        <div className="animate-scan-line pointer-events-none z-10" />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
          cameraState === 'active' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1] z-10"
      />

      {/* Loading Overlay */}
      {(cameraState === 'loading' || modelLoading) && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 backdrop-blur-sm">
          <div className="relative">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-base font-semibold text-slate-200 font-tech">
            {modelLoading ? 'Đang tải mô hình thị giác Face Landmarker...' : 'Đang khởi động Camera...'}
          </p>
          <p className="text-xs text-slate-400 max-w-xs">
            Hệ thống xử lý thị giác trên thiết bị, bảo mật an toàn tuyệt đối cho người chơi.
          </p>
        </div>
      )}

      {/* Denied / Error State */}
      {(cameraState === 'denied' || cameraState === 'error') && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-10">
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400">
            {cameraState === 'denied' ? <ShieldAlert className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-slate-100 font-tech">
            {cameraState === 'denied' ? 'Yêu cầu Quyền Camera' : 'Lỗi Thiết Bị Camera'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs leading-relaxed">
            {errorMessage}
          </p>
          <button
            id="retry-camera-btn"
            type="button"
            onClick={startCamera}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Thử kết nối lại
          </button>
        </div>
      )}

      {/* Real-time Status Badge at the bottom of the Camera */}
      {cameraState === 'active' && !modelLoading && (
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 flex justify-center z-10 pointer-events-none">
          <div
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md border shadow-lg transition-all duration-300 ${
              validation.isValid
                ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20'
                : validation.status === 'multiple_faces'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-500/20 animate-pulse'
                : validation.status === 'poor_lighting'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/50 shadow-amber-500/20'
                : 'bg-slate-900/90 text-cyan-300 border-cyan-500/40 shadow-cyan-500/15'
            }`}
          >
            {validation.isValid ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            ) : validation.status === 'multiple_faces' ? (
              <Users className="w-4 h-4 text-rose-400 shrink-0" />
            ) : validation.status === 'poor_lighting' ? (
              <SunMedium className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span className="truncate">{validation.message}</span>
          </div>
        </div>
      )}

      {/* Top Corner Badge: VISION ACTIVE */}
      {cameraState === 'active' && (
        <>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">VISION ACTIVE</span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-purple-500/40 text-[11px] font-mono text-purple-300 backdrop-blur-md pointer-events-none shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-3 h-3 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>478 MESH</span>
          </div>

          {/* Futuristic HUD Scanning Reticles */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400 pointer-events-none opacity-80 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400 pointer-events-none opacity-80 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400 pointer-events-none opacity-80 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400 pointer-events-none opacity-80 rounded-br-lg" />
        </>
      )}
    </div>
  );
};

export const FaceCamera = React.memo(FaceCameraComponent);
