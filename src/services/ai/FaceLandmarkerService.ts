import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface FaceLandmarkerDetectionResult {
  faceCount: number;
  landmarks: { x: number; y: number; z: number }[];
  blendshapes: { [name: string]: number };
  transformationMatrix?: Float32Array | number[];
}

class FaceLandmarkerService {
  private landmarker: FaceLandmarker | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<FaceLandmarker | null> | null = null;
  private lastVideoTime: number = -1;

  async init(): Promise<FaceLandmarker | null> {
    if (this.landmarker) return this.landmarker;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );

        // Check if WebGL is available before attempting GPU delegate
        const hasWebGL = (() => {
          try {
            const canvas = document.createElement('canvas');
            return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
          } catch {
            return false;
          }
        })();

        if (hasWebGL) {
          try {
            this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
              baseOptions: {
                modelAssetPath:
                  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'GPU'
              },
              runningMode: 'VIDEO',
              numFaces: 3, // Enable multi-face detection to enforce 1 student rule
              outputFaceBlendshapes: true,
              outputFacialTransformationMatrixes: true,
              minFaceDetectionConfidence: 0.5,
              minFacePresenceConfidence: 0.5,
              minTrackingConfidence: 0.5
            });
          } catch {
            // Silently fallback to CPU delegate
            this.landmarker = null;
          }
        }

        if (!this.landmarker) {
          this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            numFaces: 3,
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            minFaceDetectionConfidence: 0.5,
            minFacePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
        }

        this.isInitializing = false;
        return this.landmarker;
      } catch (err) {
        console.error('Failed to initialize FaceLandmarker:', err);
        this.isInitializing = false;
        return null;
      }
    })();

    return this.initPromise;
  }

  detect(videoElement: HTMLVideoElement): FaceLandmarkerDetectionResult | null {
    if (
      !this.landmarker ||
      !videoElement ||
      videoElement.readyState < 2 ||
      videoElement.paused ||
      videoElement.ended ||
      !videoElement.videoWidth ||
      !videoElement.videoHeight ||
      videoElement.videoWidth <= 0 ||
      videoElement.videoHeight <= 0
    ) {
      return null;
    }

    // Must ensure strictly monotonically increasing timestamps for VIDEO mode
    const now = performance.now();
    if (now <= this.lastVideoTime) {
      return null;
    }
    this.lastVideoTime = now;

    try {
      const results = this.landmarker.detectForVideo(videoElement, now);
      const faceCount = results.faceLandmarks ? results.faceLandmarks.length : 0;

      if (faceCount === 0) {
        return {
          faceCount: 0,
          landmarks: [],
          blendshapes: {}
        };
      }

      // Convert blendshapes map
      const blendshapesMap: { [name: string]: number } = {};
      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const categories = results.faceBlendshapes[0].categories;
        for (let i = 0; i < categories.length; i++) {
          blendshapesMap[categories[i].categoryName] = categories[i].score;
        }
      }

      const landmarks = results.faceLandmarks[0] || [];
      const transformationMatrix = results.facialTransformationMatrixes?.[0]?.data;

      return {
        faceCount,
        landmarks,
        blendshapes: blendshapesMap,
        transformationMatrix
      };
    } catch (e) {
      console.warn('detectForVideo error:', e);
      return null;
    }
  }

  isReady(): boolean {
    return !!this.landmarker;
  }

  async retryInit(): Promise<FaceLandmarker | null> {
    this.destroy();
    return this.init();
  }

  destroy() {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {}
      this.landmarker = null;
    }
    this.initPromise = null;
  }
}

export const faceLandmarkerService = new FaceLandmarkerService();
