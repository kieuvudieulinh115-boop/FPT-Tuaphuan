import { FaceValidationResult, FaceValidationStatus } from '../../types';

interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface ExpressionAnalysisResult {
  eyebrowRaiseScore: number; // 0 to 1
  cheekPuffScore: number;     // 0 to 1
}

// Reusable offscreen canvas for lighting sampling to prevent GC pressure on mobile devices
let cachedOffCanvas: HTMLCanvasElement | null = null;
let cachedOffCtx: CanvasRenderingContext2D | null = null;
let lastBrightnessCheckTime = 0;
let lastCalculatedBrightness = 120;

export class ExpressionAnalyzer {
  analyze(landmarks: Landmark[], blendshapes?: { [name: string]: number }): ExpressionAnalysisResult {
    if (!landmarks || landmarks.length < 468) {
      return { eyebrowRaiseScore: 0, cheekPuffScore: 0 };
    }

    // Blendshape references
    const bsBrowInnerUp = blendshapes?.['browInnerUp'] ?? 0;
    const bsBrowOuterLeft = blendshapes?.['browOuterUpLeft'] ?? 0;
    const bsBrowOuterRight = blendshapes?.['browOuterUpRight'] ?? 0;
    const bsBrowAvg = (bsBrowInnerUp * 0.5 + bsBrowOuterLeft * 0.25 + bsBrowOuterRight * 0.25);
    const bsCheekPuff = blendshapes?.['cheekPuff'] ?? 0;

    // Geometric eyebrow elevation:
    // Distance between left eyebrow (105) and upper left eyelid (159)
    // and right eyebrow (334) and upper right eyelid (386)
    // Normalized by distance between eyes (33 to 263)
    const eyeDist = Math.hypot(landmarks[263].x - landmarks[33].x, landmarks[263].y - landmarks[33].y) || 0.001;
    const leftBrowDist = Math.hypot(landmarks[105].x - landmarks[159].x, landmarks[105].y - landmarks[159].y) / eyeDist;
    const rightBrowDist = Math.hypot(landmarks[334].x - landmarks[386].x, landmarks[334].y - landmarks[386].y) / eyeDist;
    const avgBrowDist = (leftBrowDist + rightBrowDist) / 2;

    // Standard brow height is around 0.28 - 0.35. Raised brow > 0.42
    const geoBrowScore = Math.min(1, Math.max(0, (avgBrowDist - 0.34) / 0.12));
    const eyebrowRaiseScore = Math.max(bsBrowAvg, geoBrowScore);

    // Cheek puff:
    // Blendshape cheekPuff is highly reliable in MediaPipe FaceLandmarker.
    // Also cheek distance expansion between 205 and 425 normalized by eyeDist:
    const cheekDist = Math.hypot(landmarks[425].x - landmarks[205].x, landmarks[425].y - landmarks[205].y) / eyeDist;
    const geoCheekPuff = Math.min(1, Math.max(0, (cheekDist - 1.55) / 0.25));
    const cheekPuffScore = Math.max(bsCheekPuff, geoCheekPuff);

    return {
      eyebrowRaiseScore,
      cheekPuffScore
    };
  }

  validateFace(
    detectedFacesCount: number,
    landmarks?: Landmark[],
    videoElement?: HTMLVideoElement | null
  ): FaceValidationResult {
    if (detectedFacesCount === 0) {
      return {
        status: 'no_face',
        message: 'Hãy đưa khuôn mặt vào khung camera',
        isValid: false,
        faceCount: 0,
        faceSizePercent: 0,
        brightness: 0,
        isCentered: false
      };
    }

    if (detectedFacesCount > 1) {
      return {
        status: 'multiple_faces',
        message: 'Chỉ một người chơi được đứng trước camera',
        isValid: false,
        faceCount: detectedFacesCount,
        faceSizePercent: 0,
        brightness: 0,
        isCentered: false
      };
    }

    if (!landmarks || landmarks.length < 468) {
      return {
        status: 'occluded',
        message: 'Hãy để khuôn mặt rõ ràng, không bị che',
        isValid: false,
        faceCount: 1,
        faceSizePercent: 0,
        brightness: 0,
        isCentered: false
      };
    }

    // Calculate face bounding box in normalized coords (0..1)
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const faceSizePercent = Math.round(width * height * 100);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Centering check: center within [0.22, 0.78]
    const isCentered = centerX >= 0.22 && centerX <= 0.78 && centerY >= 0.15 && centerY <= 0.85;

    // Lighting check if videoElement is accessible (throttled to 300ms on mobile)
    let brightness = lastCalculatedBrightness;
    const now = performance.now();
    if (videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0 && now - lastBrightnessCheckTime >= 300) {
      lastBrightnessCheckTime = now;
      try {
        if (!cachedOffCanvas) {
          cachedOffCanvas = document.createElement('canvas');
          cachedOffCanvas.width = 32;
          cachedOffCanvas.height = 32;
          cachedOffCtx = cachedOffCanvas.getContext('2d', { willReadFrequently: true });
        }
        if (cachedOffCtx && cachedOffCanvas) {
          const vw = videoElement.videoWidth;
          const vh = videoElement.videoHeight;
          const sx = Math.max(0, Math.min(vw - 1, minX * vw));
          const sy = Math.max(0, Math.min(vh - 1, minY * vh));
          const sw = Math.max(1, Math.min(vw - sx, width * vw));
          const sh = Math.max(1, Math.min(vh - sy, height * vh));
          cachedOffCtx.drawImage(videoElement, sx, sy, sw, sh, 0, 0, 32, 32);
          const imgData = cachedOffCtx.getImageData(0, 0, 32, 32);
          let totalLum = 0;
          for (let i = 0; i < imgData.data.length; i += 4) {
            totalLum += (imgData.data[i] * 0.299 + imgData.data[i + 1] * 0.587 + imgData.data[i + 2] * 0.114);
          }
          brightness = Math.round(totalLum / (32 * 32));
          lastCalculatedBrightness = brightness;
        }
      } catch {
        // Fallback safe brightness
        brightness = lastCalculatedBrightness || 120;
      }
    }

    if (brightness < 35) {
      return {
        status: 'poor_lighting',
        message: 'Ánh sáng kém, hãy di chuyển đến nơi đủ sáng',
        isValid: false,
        faceCount: 1,
        faceSizePercent,
        brightness,
        isCentered
      };
    }

    if (width * height < 0.04) {
      return {
        status: 'too_small',
        message: 'Hãy tiến gần camera hơn',
        isValid: false,
        faceCount: 1,
        faceSizePercent,
        brightness,
        isCentered
      };
    }

    if (width * height > 0.82) {
      return {
        status: 'too_close',
        message: 'Hãy lùi ra xa camera một chút',
        isValid: false,
        faceCount: 1,
        faceSizePercent,
        brightness,
        isCentered
      };
    }

    if (!isCentered) {
      return {
        status: 'not_centered',
        message: 'Hãy đưa khuôn mặt vào giữa khung camera',
        isValid: false,
        faceCount: 1,
        faceSizePercent,
        brightness,
        isCentered
      };
    }

    return {
      status: 'valid',
      message: 'Đã nhận diện khuôn mặt ✓',
      isValid: true,
      faceCount: 1,
      faceSizePercent,
      brightness,
      isCentered: true
    };
  }
}

export const expressionAnalyzer = new ExpressionAnalyzer();
