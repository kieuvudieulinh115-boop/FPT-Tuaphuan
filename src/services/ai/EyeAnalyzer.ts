export interface EyeAnalysisResult {
  leftEAR: number;
  rightEAR: number;
  leftBlinkScore: number;  // 0 to 1
  rightBlinkScore: number; // 0 to 1
  isLeftWinking: boolean;
  isRightWinking: boolean;
  isBothClosed: boolean;
}

// MediaPipe 468/478 Landmark indexes for eyes
// Anatomical Left Eye of the subject (indices 263, 387, 385, 362, 380, 373)
// When looking at a mirrored webcam, the subject's left eye is on the left side of the screen.
const ANATOMICAL_LEFT_EYE_POINTS = {
  p1: 263, // outer corner
  p2: 387, // top-outer
  p3: 385, // top-inner
  p4: 362, // inner corner
  p5: 380, // bottom-inner
  p6: 373  // bottom-outer
};

// Anatomical Right Eye of the subject (indices 33, 160, 158, 133, 153, 144)
// When looking at a mirrored webcam, the subject's right eye is on the right side of the screen.
const ANATOMICAL_RIGHT_EYE_POINTS = {
  p1: 33,  // outer corner
  p2: 160, // top-outer
  p3: 158, // top-inner
  p4: 133, // inner corner
  p5: 153, // bottom-inner
  p6: 144  // bottom-outer
};

interface Landmark {
  x: number;
  y: number;
  z?: number;
}

function euclideanDistance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateEAR(landmarks: Landmark[], points: typeof ANATOMICAL_LEFT_EYE_POINTS): number {
  if (!landmarks || landmarks.length < 468) return 0.3;
  const p1 = landmarks[points.p1];
  const p2 = landmarks[points.p2];
  const p3 = landmarks[points.p3];
  const p4 = landmarks[points.p4];
  const p5 = landmarks[points.p5];
  const p6 = landmarks[points.p6];

  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return 0.3;

  const dVertical1 = euclideanDistance(p2, p6);
  const dVertical2 = euclideanDistance(p3, p5);
  const dHorizontal = euclideanDistance(p1, p4);

  if (dHorizontal <= 0.0001) return 0.3;
  return (dVertical1 + dVertical2) / (2.0 * dHorizontal);
}

export class EyeAnalyzer {
  analyze(landmarks: Landmark[], blendshapes?: { [name: string]: number }): EyeAnalysisResult {
    const leftEAR = calculateEAR(landmarks, ANATOMICAL_LEFT_EYE_POINTS);
    const rightEAR = calculateEAR(landmarks, ANATOMICAL_RIGHT_EYE_POINTS);

    // Complement with blendshapes if available
    const bsLeftBlink = blendshapes?.['eyeBlinkLeft'] ?? 0;
    const bsRightBlink = blendshapes?.['eyeBlinkRight'] ?? 0;

    // Geometric EAR thresholds:
    // Normal open eye: EAR ~ 0.25 - 0.38
    // Closed eye: EAR < 0.16
    const leftClosedGeo = leftEAR < 0.165;
    const rightClosedGeo = rightEAR < 0.165;
    const leftOpenGeo = leftEAR > 0.22;
    const rightOpenGeo = rightEAR > 0.22;

    const leftBlinkScore = Math.max(
      bsLeftBlink,
      Math.min(1, Math.max(0, (0.24 - leftEAR) / 0.12))
    );
    const rightBlinkScore = Math.max(
      bsRightBlink,
      Math.min(1, Math.max(0, (0.24 - rightEAR) / 0.12))
    );

    // Left wink: left eye is closed, right eye is clearly open
    const isLeftWinking = (leftClosedGeo || bsLeftBlink > 0.65) && (rightOpenGeo && bsRightBlink < 0.35);

    // Right wink: right eye is closed, left eye is clearly open
    const isRightWinking = (rightClosedGeo || bsRightBlink > 0.65) && (leftOpenGeo && bsLeftBlink < 0.35);

    // Both closed: both eyes closed
    const isBothClosed = (leftClosedGeo || bsLeftBlink > 0.6) && (rightClosedGeo || bsRightBlink > 0.6);

    return {
      leftEAR,
      rightEAR,
      leftBlinkScore,
      rightBlinkScore,
      isLeftWinking,
      isRightWinking,
      isBothClosed
    };
  }
}

export const eyeAnalyzer = new EyeAnalyzer();
