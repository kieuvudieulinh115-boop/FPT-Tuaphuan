export interface MouthAnalysisResult {
  mouthWidth: number;
  mouthHeight: number;
  mouthAspectRatio: number; // MAR = height / width
  normalizedWidth: number;   // mouth width / face width
  smileGentleScore: number;  // 0 to 1
  smileBigScore: number;     // 0 to 1
  puckerScore: number;       // 0 to 1 (Chu môi)
  openScore: number;         // 0 to 1 (Mở miệng)
  wideOpenScore: number;     // 0 to 1 (Há miệng to)
  cornerElevation: number;   // elevation of corners relative to center
}

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

export class MouthAnalyzer {
  analyze(landmarks: Landmark[], blendshapes?: { [name: string]: number }): MouthAnalysisResult {
    if (!landmarks || landmarks.length < 468) {
      return {
        mouthWidth: 0,
        mouthHeight: 0,
        mouthAspectRatio: 0,
        normalizedWidth: 0,
        smileGentleScore: 0,
        smileBigScore: 0,
        puckerScore: 0,
        openScore: 0,
        wideOpenScore: 0,
        cornerElevation: 0
      };
    }

    const leftCorner = landmarks[61];
    const rightCorner = landmarks[291];
    const topInnerLip = landmarks[13];
    const bottomInnerLip = landmarks[14];
    const topOuterLip = landmarks[0];
    const bottomOuterLip = landmarks[17];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];

    const faceWidth = euclideanDistance(leftCheek, rightCheek) || 0.001;
    const mouthWidth = euclideanDistance(leftCorner, rightCorner);
    const innerHeight = euclideanDistance(topInnerLip, bottomInnerLip);
    const outerHeight = euclideanDistance(topOuterLip, bottomOuterLip);

    const mouthAspectRatio = innerHeight / (mouthWidth || 0.001);
    const normalizedWidth = mouthWidth / faceWidth;

    // Corner elevation: how high the corners are relative to the top outer lip center
    // In normalized coords, smaller y is higher up
    const avgCornerY = (leftCorner.y + rightCorner.y) / 2;
    const cornerElevation = (bottomOuterLip.y - avgCornerY) / faceWidth;

    // Blendshape references if available
    const bsSmileLeft = blendshapes?.['mouthSmileLeft'] ?? 0;
    const bsSmileRight = blendshapes?.['mouthSmileRight'] ?? 0;
    const bsSmileAvg = (bsSmileLeft + bsSmileRight) / 2;
    const bsJawOpen = blendshapes?.['jawOpen'] ?? 0;
    const bsPucker = blendshapes?.['mouthPucker'] ?? 0;
    const bsFunnel = blendshapes?.['mouthFunnel'] ?? 0;

    // 1. Chu môi (Pucker):
    // Width narrows (normalizedWidth drops), lips compress, bsPucker / bsFunnel high
    const geoPucker = Math.max(0, Math.min(1, (0.40 - normalizedWidth) / 0.12 * (outerHeight / (mouthWidth || 0.001))));
    const puckerScore = Math.max(
      bsPucker * 0.7 + bsFunnel * 0.3,
      Math.min(1, (geoPucker * 0.7 + (bsPucker || 0) * 0.3))
    );

    // 2. Cười mỉm (Gentle Smile):
    // Corners pulled wide & up, but mouth opening remains small
    const geoGentleSmile = Math.max(0, Math.min(1, (normalizedWidth - 0.44) / 0.10)) *
      (innerHeight < 0.035 ? 1 : Math.max(0, 1 - (innerHeight - 0.035) / 0.04));
    const smileGentleScore = Math.max(
      bsSmileAvg > 0.45 && bsJawOpen < 0.25 ? bsSmileAvg : 0,
      Math.min(1, geoGentleSmile * 0.6 + bsSmileAvg * 0.4)
    );

    // 3. Cười tươi lộ răng (Big smile):
    // Corners pulled wide & up, jaw open showing teeth
    const geoBigSmile = Math.max(0, Math.min(1, (normalizedWidth - 0.45) / 0.10)) *
      Math.max(0, Math.min(1, (innerHeight - 0.02) / 0.05));
    const smileBigScore = Math.max(
      bsSmileAvg > 0.5 && bsJawOpen > 0.18 ? (bsSmileAvg * 0.6 + bsJawOpen * 0.4) : 0,
      Math.min(1, geoBigSmile * 0.6 + (bsSmileAvg * 0.5 + bsJawOpen * 0.5) * 0.4)
    );

    // 4. Mở miệng (Normal open mouth):
    // innerHeight / mouthWidth moderate
    const geoOpen = Math.min(1, Math.max(0, (mouthAspectRatio - 0.15) / 0.25));
    const openScore = Math.max(bsJawOpen, geoOpen);

    // 5. Há miệng thật to (Wide open mouth):
    // innerHeight / mouthWidth large
    const geoWideOpen = Math.min(1, Math.max(0, (mouthAspectRatio - 0.32) / 0.35));
    const wideOpenScore = Math.max(
      bsJawOpen > 0.6 ? bsJawOpen : 0,
      Math.min(1, geoWideOpen * 0.6 + bsJawOpen * 0.4)
    );

    return {
      mouthWidth,
      mouthHeight: innerHeight,
      mouthAspectRatio,
      normalizedWidth,
      smileGentleScore,
      smileBigScore,
      puckerScore,
      openScore,
      wideOpenScore,
      cornerElevation
    };
  }
}

export const mouthAnalyzer = new MouthAnalyzer();
