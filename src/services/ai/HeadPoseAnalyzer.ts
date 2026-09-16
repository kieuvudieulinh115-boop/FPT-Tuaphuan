export interface HeadPoseResult {
  yaw: number;   // In degrees: negative = left, positive = right
  pitch: number; // In degrees: negative = down, positive = up
  roll: number;  // In degrees: tilt
  shakeScore: number; // 0 to 1 (detected left-right head shake)
  nodScore: number;   // 0 to 1 (detected up-down head nod)
}

interface Landmark {
  x: number;
  y: number;
  z?: number;
}

interface PoseHistoryItem {
  timestamp: number;
  yaw: number;
  pitch: number;
}

export class HeadPoseAnalyzer {
  private history: PoseHistoryItem[] = [];
  private readonly HISTORY_WINDOW_MS = 2500; // 2.5 second sliding window for dynamic motions

  analyze(landmarks: Landmark[], matrix?: Float32Array | number[]): HeadPoseResult {
    let yaw = 0;
    let pitch = 0;
    let roll = 0;

    if (matrix && matrix.length >= 16) {
      // Extract Euler angles from 4x4 rotation matrix:
      // R = [ [m0, m1, m2], [m4, m5, m6], [m8, m9, m10] ]
      const m00 = matrix[0], m01 = matrix[1], m02 = matrix[2];
      const m10 = matrix[4], m11 = matrix[5], m12 = matrix[6];
      const m20 = matrix[8], m21 = matrix[9], m22 = matrix[10];

      pitch = Math.asin(-Math.max(-1, Math.min(1, m12))) * (180 / Math.PI);
      if (Math.cos(pitch * (Math.PI / 180)) > 0.001) {
        yaw = Math.atan2(m02, m22) * (180 / Math.PI);
        roll = Math.atan2(m10, m11) * (180 / Math.PI);
      }
    } else if (landmarks && landmarks.length >= 468) {
      // Geometric fallback using 3D landmarks
      const nose = landmarks[1];
      const chin = landmarks[152];
      const forehead = landmarks[10];
      const leftCheek = landmarks[234];
      const rightCheek = landmarks[454];

      // Yaw: horizontal position of nose relative to cheeks midpoint
      const midX = (leftCheek.x + rightCheek.x) / 2;
      const faceW = Math.abs(rightCheek.x - leftCheek.x) || 0.001;
      const yawRatio = (nose.x - midX) / faceW;
      yaw = yawRatio * 90; // Approx degrees

      // Pitch: vertical position of nose relative to forehead & chin
      const midY = (forehead.y + chin.y) / 2;
      const faceH = Math.abs(chin.y - forehead.y) || 0.001;
      const pitchRatio = (midY - nose.y) / faceH;
      pitch = (pitchRatio - 0.05) * 80;

      // Roll: angle between eyes or cheeks
      const dy = rightCheek.y - leftCheek.y;
      const dx = rightCheek.x - leftCheek.x;
      roll = Math.atan2(dy, dx) * (180 / Math.PI);
    }

    // Dynamic motion tracking over time
    const now = performance.now();
    this.history.push({ timestamp: now, yaw, pitch });
    this.history = this.history.filter(item => now - item.timestamp <= this.HISTORY_WINDOW_MS);

    // Compute Shake Score (turning head left AND right across threshold)
    let minYaw = 0;
    let maxYaw = 0;
    let yawSwings = 0;
    let prevSign = 0;

    for (const h of this.history) {
      if (h.yaw < minYaw) minYaw = h.yaw;
      if (h.yaw > maxYaw) maxYaw = h.yaw;
      const sign = h.yaw < -8 ? -1 : h.yaw > 8 ? 1 : 0;
      if (sign !== 0 && prevSign !== 0 && sign !== prevSign) {
        yawSwings++;
      }
      if (sign !== 0) prevSign = sign;
    }

    const yawRange = maxYaw - minYaw;
    const shakeScore = Math.min(
      1,
      (yawRange > 18 ? 0.5 : yawRange / 36) + (yawSwings >= 1 ? 0.5 : 0)
    );

    // Compute Nod Score (pitch dipping down then rising up)
    let minPitch = 0;
    let maxPitch = 0;
    let pitchDips = 0;
    let prevPitchSign = 0;

    for (const h of this.history) {
      if (h.pitch < minPitch) minPitch = h.pitch;
      if (h.pitch > maxPitch) maxPitch = h.pitch;
      const sign = h.pitch < -6 ? -1 : h.pitch > 6 ? 1 : 0;
      if (sign !== 0 && prevPitchSign !== 0 && sign !== prevPitchSign) {
        pitchDips++;
      }
      if (sign !== 0) prevPitchSign = sign;
    }

    const pitchRange = maxPitch - minPitch;
    const nodScore = Math.min(
      1,
      (pitchRange > 14 ? 0.5 : pitchRange / 28) + (pitchDips >= 1 ? 0.5 : 0)
    );

    return {
      yaw,
      pitch,
      roll,
      shakeScore,
      nodScore
    };
  }

  reset() {
    this.history = [];
  }
}

export const headPoseAnalyzer = new HeadPoseAnalyzer();
