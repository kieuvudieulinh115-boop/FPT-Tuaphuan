import { ChallengeId, ChallengeScoreResult } from '../../types';
import { eyeAnalyzer } from './EyeAnalyzer';
import { mouthAnalyzer } from './MouthAnalyzer';
import { headPoseAnalyzer } from './HeadPoseAnalyzer';
import { expressionAnalyzer } from './ExpressionAnalyzer';

interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export class ChallengeEvaluator {
  private frameScores: number[] = [];
  private readonly MAX_FRAMES = 18; // ~0.6s at 30fps
  private currentChallenge: ChallengeId | null = null;
  private holdStartTimestamp: number | null = null;

  reset(challengeId?: ChallengeId) {
    this.frameScores = [];
    this.currentChallenge = challengeId || null;
    this.holdStartTimestamp = null;
    headPoseAnalyzer.reset();
  }

  evaluate(
    challengeId: ChallengeId,
    landmarks: Landmark[],
    blendshapes?: { [name: string]: number },
    matrix?: Float32Array | number[],
    threshold: number = 80
  ): ChallengeScoreResult {
    if (this.currentChallenge !== challengeId) {
      this.reset(challengeId);
    }

    if (!landmarks || landmarks.length < 468) {
      return {
        score: 0,
        passed: false,
        details: {
          metricName: 'Landmark Tracking',
          metricValue: 0,
          targetValue: threshold,
          stability: 0,
          description: 'Không đủ dữ liệu điểm khuôn mặt'
        }
      };
    }

    // Run specialized analyzers
    const eyeRes = eyeAnalyzer.analyze(landmarks, blendshapes);
    const mouthRes = mouthAnalyzer.analyze(landmarks, blendshapes);
    const headRes = headPoseAnalyzer.analyze(landmarks, matrix);
    const exprRes = expressionAnalyzer.analyze(landmarks, blendshapes);

    let rawScore0to1 = 0;
    let metricName = '';
    let description = '';

    switch (challengeId) {
      case 'chu_moi': {
        metricName = 'Mức độ chu môi (Pucker)';
        rawScore0to1 = mouthRes.puckerScore;
        description = `Độ chụm môi: ${Math.round(rawScore0to1 * 100)}%`;
        break;
      }
      case 'cuoi_mim': {
        metricName = 'Nụ cười mỉm (Gentle Smile)';
        rawScore0to1 = mouthRes.smileGentleScore;
        description = `Khóe miệng mở rộng: ${Math.round(rawScore0to1 * 100)}%`;
        break;
      }
      case 'cuoi_tuoi': {
        metricName = 'Cười tươi lộ răng (Big Smile)';
        rawScore0to1 = mouthRes.smileBigScore;
        description = `Độ mở nụ cười rạng rỡ: ${Math.round(rawScore0to1 * 100)}%`;
        break;
      }
      case 'nhay_mat_trai': {
        metricName = 'Nháy mắt trái (Left Wink)';
        // Target: Subject's left eye closed, right eye open
        if (eyeRes.isLeftWinking) {
          rawScore0to1 = 0.96;
        } else if (eyeRes.leftBlinkScore > 0.5 && eyeRes.rightBlinkScore < 0.45) {
          rawScore0to1 = Math.min(1, eyeRes.leftBlinkScore * 0.75 + (1 - eyeRes.rightBlinkScore) * 0.25 + 0.1);
        } else if (eyeRes.rightEAR > 0.19 && eyeRes.leftEAR < 0.18) {
          rawScore0to1 = Math.min(1, eyeRes.leftBlinkScore * 0.7 + (1 - eyeRes.rightBlinkScore) * 0.3 + 0.2);
        } else {
          rawScore0to1 = eyeRes.leftBlinkScore > 0.4 && eyeRes.rightBlinkScore < 0.5 ? eyeRes.leftBlinkScore * 0.6 : 0;
        }
        description = `Mắt trái khép: ${Math.round(eyeRes.leftBlinkScore * 100)}%, Mắt phải mở: ${Math.round((1 - eyeRes.rightBlinkScore) * 100)}%`;
        break;
      }
      case 'nhay_mat_phai': {
        metricName = 'Nháy mắt phải (Right Wink)';
        // Target: Subject's right eye closed, left eye open
        if (eyeRes.isRightWinking) {
          rawScore0to1 = 0.96;
        } else if (eyeRes.rightBlinkScore > 0.5 && eyeRes.leftBlinkScore < 0.45) {
          rawScore0to1 = Math.min(1, eyeRes.rightBlinkScore * 0.75 + (1 - eyeRes.leftBlinkScore) * 0.25 + 0.1);
        } else if (eyeRes.leftEAR > 0.19 && eyeRes.rightEAR < 0.18) {
          rawScore0to1 = Math.min(1, eyeRes.rightBlinkScore * 0.7 + (1 - eyeRes.leftBlinkScore) * 0.3 + 0.2);
        } else {
          rawScore0to1 = eyeRes.rightBlinkScore > 0.4 && eyeRes.leftBlinkScore < 0.5 ? eyeRes.rightBlinkScore * 0.6 : 0;
        }
        description = `Mắt phải khép: ${Math.round(eyeRes.rightBlinkScore * 100)}%, Mắt trái mở: ${Math.round((1 - eyeRes.leftBlinkScore) * 100)}%`;
        break;
      }
      case 'nham_hai_mat': {
        metricName = 'Nhắm cả hai mắt (Eyes Closed)';
        const avgBlink = (eyeRes.leftBlinkScore + eyeRes.rightBlinkScore) / 2;
        rawScore0to1 = avgBlink;
        description = `Độ khép 2 mắt: ${Math.round(avgBlink * 100)}%`;
        break;
      }
      case 'mo_mieng': {
        metricName = 'Mở miệng vừa phải (Open Mouth)';
        rawScore0to1 = mouthRes.openScore;
        description = `Độ mở hàm: ${Math.round(rawScore0to1 * 100)}%`;
        break;
      }
      case 'lac_dau': {
        metricName = 'Lắc đầu trái/phải (Head Shake)';
        rawScore0to1 = headRes.shakeScore;
        description = `Biên độ quay đầu: ${Math.round(rawScore0to1 * 100)}%`;
        break;
      }
      case 'gat_dau': {
        metricName = 'Gật đầu lên/xuống (Head Nod)';
        rawScore0to1 = headRes.nodScore;
        description = `Biên độ gật đầu: ${Math.round(rawScore0to1 * 100)}%`;
        break;
      }
      case 'phong_ma': {
        metricName = 'Phồng hai má (Cheek Puff)';
        rawScore0to1 = exprRes.cheekPuffScore;
        description = `Độ căng tròn hai má: ${Math.round(rawScore0to1 * 100)}%`;
        break;
      }
      case 'nang_chan_may': {
        metricName = 'Nâng chân mày (Raise Eyebrows)';
        rawScore0to1 = exprRes.eyebrowRaiseScore;
        description = `Độ nhướng chân mày: ${Math.round(rawScore0to1 * 100)}%`;
        break;
      }
      case 'ha_mieng': {
        metricName = 'Há miệng to (Wide Open)';
        rawScore0to1 = mouthRes.wideOpenScore;
        description = `Khẩu hình chữ O: ${Math.round(rawScore0to1 * 100)}%`;
        break;
      }
    }

    // Convert raw score 0..1 to 0..100 with non-linear ease for natural feel
    // clamp between 0 and 100
    const frameScore = Math.min(100, Math.max(0, Math.round(rawScore0to1 * 100)));

    // Sliding window buffer
    this.frameScores.push(frameScore);
    if (this.frameScores.length > this.MAX_FRAMES) {
      this.frameScores.shift();
    }

    // Calculate moving average & stability
    const sum = this.frameScores.reduce((a, b) => a + b, 0);
    const avgScore = Math.round(sum / this.frameScores.length);

    // Dynamic challenges (lac_dau, gat_dau, winks) use peak with stability confirmation
    const isDynamic = challengeId === 'lac_dau' || challengeId === 'gat_dau' || challengeId === 'nhay_mat_trai' || challengeId === 'nhay_mat_phai';

    let finalScore = avgScore;
    if (isDynamic) {
      const maxScore = Math.max(...this.frameScores);
      finalScore = Math.round(maxScore * 0.7 + avgScore * 0.3);
    }

    // Calculate variance / stability metric
    const variance = this.frameScores.reduce((acc, val) => acc + Math.pow(val - avgScore, 2), 0) / this.frameScores.length;
    const stability = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance))));

    const passed = finalScore >= threshold;

    return {
      score: finalScore,
      passed,
      details: {
        metricName,
        metricValue: finalScore,
        targetValue: threshold,
        stability,
        description
      }
    };
  }
}

export const challengeEvaluator = new ChallengeEvaluator();
