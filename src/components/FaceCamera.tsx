import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  AlertCircle,
  RefreshCw,
  Eye,
  Sparkles,
  SunMedium,
  Users,
  ShieldAlert,
  SwitchCamera,
  Play,
  Copy,
  Check,
  Smartphone,
  ExternalLink
} from 'lucide-react';
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

const isLikelyInAppBrowser = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return /FBAN|FBAV|Instagram|Line|MicroMessenger|Zalo|Snapchat|HeyTapBrowser/i.test(ua);
};

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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [needsUserGesture, setNeedsUserGesture] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [liveScoreVal, setLiveScoreVal] = useState<number>(0);
  const [livePassedVal, setLivePassedVal] = useState<boolean>(false);

  const [validation, setValidation] = useState<FaceValidationResult>({
    status: 'checking',
    message: 'Đang kết nối camera & nhận diện...',
    isValid: false,
    faceCount: 0,
    faceSizePercent: 0,
    brightness: 100,
    isCentered: false
  });

  // Check if device has more than one video input
  useEffect(() => {
    async function checkCameras() {
      try {
        if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setHasMultipleCameras(videoDevices.length > 1);
        }
      } catch {
        // Safe fallback
      }
    }
    checkCameras();
  }, []);

  // Multi-tier progressive stream acquisition specifically engineered for mobile devices
  const requestStreamWithFallbacks = async (targetFacing: 'user' | 'environment'): Promise<MediaStream> => {
    // 1. Check browser mediaDevices support
    if (
      !navigator?.mediaDevices?.getUserMedia &&
      !(navigator as unknown as { getUserMedia?: unknown })?.getUserMedia &&
      !(navigator as unknown as { webkitGetUserMedia?: unknown })?.webkitGetUserMedia &&
      !(navigator as unknown as { mozGetUserMedia?: unknown })?.mozGetUserMedia
    ) {
      const err = new Error('NOT_SUPPORTED');
      err.name = 'NotSupportedError';
      throw err;
    }

    // Constraints list: Ordered from high-compatibility mobile to simplest fallback
    // Note: NEVER use rigid max constraint on height/width for mobile portrait cameras
    const constraintVariants: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      },
      {
        video: {
          facingMode: { ideal: targetFacing }
        },
        audio: false
      },
      {
        video: {
          facingMode: targetFacing
        },
        audio: false
      },
      {
        video: true,
        audio: false
      }
    ];

    let lastError: unknown = null;
    for (const constraints of constraintVariants) {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          return await navigator.mediaDevices.getUserMedia(constraints);
        } else {
          // Legacy getUserMedia fallback
          const legacyGUM =
            (navigator as unknown as { getUserMedia?: Function }).getUserMedia ||
            (navigator as unknown as { webkitGetUserMedia?: Function }).webkitGetUserMedia ||
            (navigator as unknown as { mozGetUserMedia?: Function }).mozGetUserMedia;

          if (legacyGUM) {
            return await new Promise<MediaStream>((resolve, reject) => {
              legacyGUM.call(navigator, constraints, resolve, reject);
            });
          }
        }
      } catch (err: unknown) {
        lastError = err;
        const errName = (err as { name?: string })?.name;
        // If user actively denied permission, abort immediately
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          throw err;
        }
        console.warn('Mobile camera constraint fallback triggered:', constraints, err);
      }
    }

    throw lastError || new Error('CAMERA_FAILED');
  };

  // Start webcam with full mobile lifecycle & autoplay handling
  const startCamera = useCallback(async (targetFacing: 'user' | 'environment' = facingMode) => {
    setCameraState('loading');
    setErrorMessage('');
    setNeedsUserGesture(false);

    try {
      // Clean up previous active tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {}
        });
        streamRef.current = null;
      }

      const stream = await requestStreamWithFallbacks(targetFacing);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      // Crucial properties for iOS Safari & Mobile Chrome inline streaming
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.controls = false;
      video.tabIndex = -1;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      video.setAttribute('x5-video-player-type', 'h5-page');
      video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');
      video.setAttribute('disablepictureinpicture', 'true');
      video.setAttribute('disableremoteplayback', 'true');
      video.removeAttribute('controls');

      // Force WebKit to never enter native fullscreen
      const preventFullscreen = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          (video as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen?.();
        } catch {}
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen?.();
          }
        } catch {}
      };
      video.addEventListener('webkitbeginfullscreen', preventFullscreen);
      video.addEventListener('fullscreenchange', preventFullscreen);

      video.srcObject = stream;

      const attemptPlay = async () => {
        try {
          await video.play();
          setNeedsUserGesture(false);
          setCameraState('active');
        } catch (playErr: unknown) {
          const errName = (playErr as { name?: string })?.name;
          console.warn('video.play() rejected (autoplay/gesture required on mobile):', playErr);
          if (errName === 'NotAllowedError' || errName === 'AbortError') {
            // Mobile browser requires user touch gesture to begin live camera playback
            setNeedsUserGesture(true);
            setCameraState('loading');
          } else {
            // Still provide gesture unlock button
            setNeedsUserGesture(true);
          }
        }
      };

      video.onloadedmetadata = () => {
        attemptPlay();
      };

      video.oncanplay = () => {
        attemptPlay();
      };

      // Call play immediately as well (some browsers fire metadata before handler binds)
      attemptPlay();

    } catch (err: unknown) {
      console.error('Mobile camera start error:', err);
      const errName = (err as { name?: string })?.name;

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Quyền truy cập Camera bị từ chối trên thiết bị.');
      } else if (errName === 'NotSupportedError') {
        setCameraState('error');
        setErrorMessage('Trình duyệt hiện tại chưa hỗ trợ Camera hoặc đang chạy trên kết nối không bảo mật.');
      } else {
        setCameraState('error');
        setErrorMessage('Không thể khởi tạo camera điện thoại. Hãy đảm bảo chưa có ứng dụng nào khác đang chiếm quyền camera.');
      }
    }
  }, [facingMode]);

  // Handle manual unlock when mobile browser requires user tap
  const handleUserUnlockVideo = async () => {
    if (videoRef.current) {
      try {
        videoRef.current.muted = true;
        await videoRef.current.play();
        setNeedsUserGesture(false);
        setCameraState('active');
      } catch (err) {
        console.error('Manual unlock failed:', err);
        startCamera(facingMode);
      }
    }
  };

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Copy link tool for in-app browser users
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Initialize AI Model and start camera
  useEffect(() => {
    let isMounted = true;

    async function initAI() {
      setModelLoading(true);
      try {
        await faceLandmarkerService.init();
      } catch (e) {
        console.warn('FaceLandmarker init issue on mobile:', e);
      } finally {
        if (isMounted) {
          setModelLoading(false);
        }
      }
    }

    initAI();
    startCamera(facingMode);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {}
        });
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

      // Essential mobile safety check: readyState >= 2 AND positive video dimensions
      if (
        !video ||
        !canvas ||
        video.readyState < 2 ||
        video.paused ||
        video.ended ||
        !video.videoWidth ||
        !video.videoHeight ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        animFrameIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Sync canvas dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const now = performance.now();
      // Throttle heavy MediaPipe AI detection to ~20 FPS (every 50ms) to ensure butter-smooth mobile performance
      if (now - lastDetectTimeRef.current >= 50) {
        lastDetectTimeRef.current = now;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Run real MediaPipe detection with error suppression
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

            // 3. Single Biometric Rotating Ring
            const apertureR = Math.max(halfW, halfH) * 1.04;
            const rotAngle = (now / 2200) % (Math.PI * 2);
            ctx.strokeStyle = `rgba(${themeRgb}, 0.45)`;
            ctx.lineWidth = 1.6;
            const arcSpan = Math.PI * 0.20;
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

            // 6. Subtle Eye Outlines
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
            setLiveScoreVal(scoreRes.score);
            setLivePassedVal(scoreRes.passed);
            onScoreUpdate(scoreRes);
          }
        } else {
          // Not valid face -> zero score, emit once when entering invalid state
          if (lastEmittedScoreValRef.current !== 0 || lastEmittedPassedRef.current !== false) {
            lastEmittedScoreValRef.current = 0;
            lastEmittedPassedRef.current = false;
            setLiveScoreVal(0);
            setLivePassedVal(false);
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

  const isMirrored = facingMode === 'user';
  const inAppBrowserDetected = isLikelyInAppBrowser();

  return (
    <div className="relative w-full h-[220px] xs:h-[250px] sm:h-[300px] md:h-[360px] lg:h-[460px] xl:h-[500px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.25)] flex items-center justify-center group select-none">
      {/* Sci-Fi HUD Corner Brackets */}
      <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm pointer-events-none z-20" />
      <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm pointer-events-none z-20" />
      <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm pointer-events-none z-20" />
      <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm pointer-events-none z-20" />

      {/* Futuristic Scanline Effect */}
      {cameraState === 'active' && !modelLoading && (
        <div className="animate-scan-line pointer-events-none z-10" />
      )}

      {/* Video Element with Mobile WebKit Inline and Mirroring Controls (Locked against iOS native video player) */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        controls={false}
        tabIndex={-1}
        disablePictureInPicture
        className={`w-full h-full object-cover pointer-events-none select-none touch-none transition-opacity duration-300 ${
          isMirrored ? 'scale-x-[-1]' : 'scale-x-1'
        } ${cameraState === 'active' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Touch shield overlay to prevent iOS WebKit from opening media controls */}
      <div className="absolute inset-0 pointer-events-none select-none touch-none z-[5]" />

      {/* Canvas Overlay with synchronized mirroring */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
          isMirrored ? 'scale-x-[-1]' : 'scale-x-1'
        }`}
      />

      {/* Mobile Autoplay Policy Unlock Screen (when phone demands a user touch to start stream) */}
      {needsUserGesture && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Camera className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-base sm:text-lg font-bold text-white font-tech">
              Chạm để bật Camera trên điện thoại
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Trình duyệt điện thoại yêu cầu một chạm của bạn để bắt đầu truyền hình ảnh trực tiếp.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUserUnlockVideo}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Kích hoạt Camera ngay</span>
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {cameraState === 'loading' && !needsUserGesture && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 backdrop-blur-sm">
          <div className="relative">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-base font-semibold text-slate-200 font-tech">
            {modelLoading ? 'Đang tải mô hình thị giác AI Face Landmarker...' : 'Đang khởi động Camera điện thoại...'}
          </p>
          <p className="text-xs text-slate-400 max-w-xs">
            Hệ thống xử lý trực tiếp trên thiết bị, bảo mật an toàn tuyệt đối.
          </p>
        </div>
      )}

      {/* Denied / Error State - Tailored for Mobile Troubleshooting */}
      {(cameraState === 'denied' || cameraState === 'error') && !needsUserGesture && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-5 sm:p-6 text-center space-y-3.5 z-20 overflow-y-auto">
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400 shrink-0">
            {cameraState === 'denied' ? <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" /> : <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 font-tech">
              {cameraState === 'denied' ? 'Quyền Camera Bị Chặn' : 'Lỗi Kết Nối Camera'}
            </h3>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* In-App Browser Warning (Zalo / Facebook / Messenger) */}
          {inAppBrowserDetected && (
            <div className="w-full max-w-xs p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-[11px] sm:text-xs text-amber-200 text-left space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-300">
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                Đang mở trong Zalo / Facebook?
              </p>
              <p className="text-slate-300 leading-normal">
                Hãy nhấn dấu <strong>3 chấm (⋮ hoặc •••)</strong> ở góc trên bên phải, chọn <strong>"Mở bằng trình duyệt ngoài"</strong> (Safari / Chrome).
              </p>
            </div>
          )}

          {/* Device Specific Tip */}
          <div className="w-full max-w-xs p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-[11px] text-slate-300 text-left space-y-1">
            <p className="font-semibold text-cyan-300">Cách khắc phục nhanh trên điện thoại:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li><strong>iPhone (Safari):</strong> Bấm biểu tượng <strong>aA</strong> trên thanh link &gt; Cài đặt &gt; Camera: Cho phép.</li>
              <li><strong>Android (Chrome):</strong> Bấm biểu tượng <strong>ổ khoá 🔒</strong> cạnh link &gt; Quyền &gt; Bật Camera.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              id="retry-camera-btn"
              type="button"
              onClick={() => startCamera(facingMode)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Thử kết nối lại
            </button>

            {hasMultipleCameras && (
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-medium text-xs transition-all cursor-pointer"
              >
                <SwitchCamera className="w-3.5 h-3.5 text-cyan-400" />
                Đổi Camera khác
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 text-xs transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã sao chép link!' : 'Sao chép link web'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Status Badge at the bottom of the Camera */}
      {cameraState === 'active' && !modelLoading && (
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 flex justify-center z-10 pointer-events-none">
          <div
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md border shadow-lg transition-all duration-300 ${
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
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping" />
            ) : validation.status === 'multiple_faces' ? (
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
            ) : validation.status === 'poor_lighting' ? (
              <SunMedium className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            ) : (
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
            )}
            <span className="truncate max-w-[200px] sm:max-w-none">{validation.message}</span>
            {validation.isValid && liveScoreVal > 0 && (
              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold border transition-colors ${
                livePassedVal
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
              }`}>
                {liveScoreVal}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Corner HUD Badges & Camera Flip Control */}
      {cameraState === 'active' && (
        <>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">VISION ACTIVE</span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {/* Camera Flip button for phones */}
            <button
              type="button"
              onClick={handleToggleFacingMode}
              title="Đổi camera trước / sau"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 hover:bg-slate-800 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer active:scale-95 transition-all"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{facingMode === 'user' ? 'Cam Trước' : 'Cam Sau'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-purple-500/40 text-[11px] font-mono text-purple-300 backdrop-blur-md pointer-events-none shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Sparkles className="w-3 h-3 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>478 MESH</span>
            </div>
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
