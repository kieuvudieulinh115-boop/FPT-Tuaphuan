export type FaceValidationStatus = 
  | 'checking'
  | 'valid'
  | 'no_face'
  | 'multiple_faces'
  | 'too_small'
  | 'too_close'
  | 'not_centered'
  | 'poor_lighting'
  | 'occluded'
  | 'camera_error';

export interface FaceValidationResult {
  status: FaceValidationStatus;
  message: string;
  isValid: boolean;
  faceCount: number;
  faceSizePercent: number;
  brightness: number;
  isCentered: boolean;
}

export type ChallengeId = 
  | 'chu_moi'
  | 'cuoi_mim'
  | 'cuoi_tuoi'
  | 'nhay_mat_trai'
  | 'nhay_mat_phai'
  | 'nham_hai_mat'
  | 'mo_mieng'
  | 'lac_dau'
  | 'gat_dau'
  | 'phong_ma'
  | 'nang_chan_may'
  | 'ha_mieng';

export interface ChallengeItem {
  id: ChallengeId;
  name: string;
  shortDesc: string;
  instructions: string;
  icon: string;
  tip: string;
}

export interface ChallengeScoreResult {
  score: number; // 0 - 100
  passed: boolean;
  details: {
    metricName: string;
    metricValue: number;
    targetValue: number;
    stability: number;
    description: string;
  };
}

export interface Question {
  id: string;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  subject?: string;
  explanation?: string;
  needsTeacherConfirmation?: boolean;
}

export interface QuestionSet {
  id: string;
  title: string;
  gradeBadge: string; // e.g. 'Lớp 3', 'Lớp 4', 'Lớp 5', 'STEM'
  category: string; // Lĩnh vực: 'Tin học & Máy tính', 'STEM & Tự nhiên', 'Toán học & Logic', v.v.
  description?: string;
  questions: Question[];
  createdAt: number;
  updatedAt?: number;
  isSaved: boolean; // Trạng thái đã lưu vào kho hay chưa
}

export interface PuzzlePiece {
  id: number; // 1 to 8
  position: number;
  unlocked: boolean;
  imageUrl: string;
  label: string;
}

export interface TeacherSettingsConfig {
  timerSeconds: number; // 5 to 30, default 10
  passThreshold: number; // 50 to 95, default 65
  randomChallenges: boolean;
  enabledChallenges: ChallengeId[];
  schoolName: string;
  teacherName: string;
  schoolLogo?: string;
  activeQuestionSetId?: string;
  puzzleImageUrl?: string;
  puzzleThemeTitle?: string;
}

export interface StudentSession {
  studentName: string;
  currentChallengeIndex: number;
  currentQuestionIndex: number;
  unlockedPieces: number[]; // e.g. [1, 2, 3]
  isCompleted: boolean;
  totalAttempts: number;
  successfulChallenges: number;
  correctAnswers: number;
  startedAt: number;
  completedAt?: number;
}
