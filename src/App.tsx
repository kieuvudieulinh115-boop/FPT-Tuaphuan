import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  StudentSession,
  TeacherSettingsConfig,
  Question,
  PuzzlePiece,
  ChallengeId,
  ChallengeScoreResult,
  FaceValidationResult
} from './types';
import { CHALLENGE_LIBRARY } from './data/challenges';
import { INITIAL_STEM_QUESTIONS } from './data/initialQuestions';
import { DEFAULT_PUZZLE_PIECES } from './data/puzzlePieces';
import { dbService } from './services/storage/IndexedDBService';
import { audioManager } from './services/audio/AudioManager';

// Components
import { GameHeader } from './components/GameHeader';
import { StudentEntryScreen } from './components/StudentEntryScreen';
import { FaceCamera } from './components/FaceCamera';
import { ChallengeCard } from './components/ChallengeCard';
import { QuestionView } from './components/QuestionView';
import { PuzzleBoard } from './components/PuzzleBoard';
import { CertificateModal } from './components/CertificateModal';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { CyberLeftPanel, CyberRightPanel } from './components/CyberSidePanels';
import { Globe, ChevronRight, Sparkles } from 'lucide-react';

export default function App() {
  // Database / Persisted Configurations
  const [settings, setSettings] = useState<TeacherSettingsConfig>({
    timerSeconds: 10,
    passThreshold: 65,
    randomChallenges: false,
    enabledChallenges: CHALLENGE_LIBRARY.map(c => c.id),
    schoolName: 'Trường Tiểu học STEM Tân Tiến',
    teacherName: 'Ban Cố vấn Chuyên môn STEM'
  });

  const [questions, setQuestions] = useState<Question[]>(INITIAL_STEM_QUESTIONS);
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>(DEFAULT_PUZZLE_PIECES);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Student Session State
  const [studentName, setStudentName] = useState<string>('');
  const [completedRoundIndexes, setCompletedRoundIndexes] = useState<number[]>([]); // Rounds where student answered correctly
  const [placedPieceIds, setPlacedPieceIds] = useState<number[]>([]); // Pieces manually assembled onto board by student
  const [roundIndex, setRoundIndex] = useState<number>(0); // 0 to 8
  const [currentPhase, setCurrentPhase] = useState<'challenge' | 'question'>('challenge');
  const [activeView, setActiveView] = useState<'play' | 'assembly'>('play');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // AI & Live Video Status
  const [currentScore, setCurrentScore] = useState<ChallengeScoreResult>({
    score: 0,
    passed: false,
    details: {
      metricName: 'Chờ nhận diện',
      metricValue: 0,
      targetValue: 65,
      stability: 0,
      description: 'Đang đưa khuôn mặt vào khung hình...'
    }
  });

  const [validation, setValidation] = useState<FaceValidationResult>({
    status: 'checking',
    message: 'Đang khởi động hệ thống nhận diện...',
    isValid: false,
    faceCount: 0,
    faceSizePercent: 0,
    brightness: 100,
    isCentered: false
  });

  // Modal Dialogs
  const [isTeacherSettingsOpen, setIsTeacherSettingsOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(audioManager.getMuted());
  const [completedTimestamp, setCompletedTimestamp] = useState<number | undefined>(undefined);

  // Load Data from IndexedDB on initial mount
  useEffect(() => {
    async function loadData() {
      try {
        const [savedSettings, savedQuestions, savedPieces, savedSets, savedActiveSetId] = await Promise.all([
          dbService.getSettings(),
          dbService.getQuestions(),
          dbService.getPuzzlePieces(),
          dbService.getQuestionSets(),
          dbService.getActiveQuestionSetId()
        ]);
        setSettings(savedSettings);
        setPuzzlePieces(savedPieces);

        // Determine questions from active question set
        const activeId = savedSettings.activeQuestionSetId || savedActiveSetId || 'set_lop3_tinhoc';
        const targetSet = savedSets.find(s => s.id === activeId) || savedSets[0];
        if (targetSet && targetSet.questions && targetSet.questions.length > 0) {
          setQuestions(targetSet.questions);
        } else if (savedQuestions && savedQuestions.length > 0) {
          setQuestions(savedQuestions);
        }
      } catch (err) {
        console.warn('Error loading from IndexedDB, using initial dataset:', err);
      } finally {
        setIsDataLoaded(true);
      }
    }
    loadData();
  }, []);

  // Determine current active challenge
  const activeChallenges = useMemo(() => {
    const list = CHALLENGE_LIBRARY.filter(c => settings.enabledChallenges.includes(c.id));
    return list.length > 0 ? list : CHALLENGE_LIBRARY;
  }, [settings.enabledChallenges]);

  const currentChallenge = useMemo(() => {
    if (settings.randomChallenges) {
      // Seeded random per round to avoid flickering within the same round
      const idx = (roundIndex * 7 + 3) % activeChallenges.length;
      return activeChallenges[idx];
    }
    return activeChallenges[roundIndex % activeChallenges.length];
  }, [activeChallenges, roundIndex, settings.randomChallenges]);

  // Determine current active question
  const currentQuestion = useMemo(() => {
    if (questions.length === 0) return INITIAL_STEM_QUESTIONS[0];
    return questions[roundIndex % questions.length];
  }, [questions, roundIndex]);

  // Game is completed when all 9 pieces have been MANUALLY placed into the board
  const isCompleted = placedPieceIds.length >= 9;

  // Placement turns available: 1 turn per completed STEM question round
  const placementTurnsAvailable = Math.max(0, completedRoundIndexes.length - placedPieceIds.length);

  // Next uncompleted round index
  const nextUncompletedRoundIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8].find(idx => !completedRoundIndexes.includes(idx));
  const nextRoundNumber = nextUncompletedRoundIndex !== undefined ? nextUncompletedRoundIndex + 1 : (roundIndex < 8 ? roundIndex + 2 : 9);

  // Handle student starting session
  const handleStartGame = (name: string) => {
    setStudentName(name);
    setCompletedRoundIndexes([]);
    setPlacedPieceIds([]);
    setRoundIndex(0);
    setCurrentPhase('challenge');
    setActiveView('play');
    setCompletedTimestamp(undefined);
    if (!audioManager.getMuted()) {
      audioManager.startBgm();
    }
  };

  // Face challenge passed -> proceed to STEM question
  const handlePassChallenge = () => {
    setCurrentPhase('question');
  };

  // Question correct -> award 1 placement turn, unlock piece selection, switch to assembly view!
  const handleCorrectAnswer = () => {
    setCompletedRoundIndexes(prev => {
      if (prev.includes(roundIndex)) return prev;
      return [...prev, roundIndex];
    });
    // Switch to Assembly Table so student can choose ANY 1 piece to place!
    setActiveView('assembly');
  };

  // Student manually places a piece into the board
  const handlePlacePiece = (pieceId: number) => {
    setPlacedPieceIds(prev => {
      const next = Array.from(new Set([...prev, pieceId]));
      if (next.length >= 9) {
        // All 9 pieces placed! Complete game!
        setCompletedTimestamp(Date.now());
        audioManager.playVictory();
        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 }
          });
        } catch {}
        setTimeout(() => {
          setIsCertificateOpen(true);
        }, 1200);
      }
      return next;
    });
  };

  // Continue to next round from assembly view
  const handleContinueNextRound = () => {
    const nextIdx = [0, 1, 2, 3, 4, 5, 6, 7, 8].find(i => !completedRoundIndexes.includes(i));
    if (nextIdx !== undefined) {
      setRoundIndex(nextIdx);
    } else if (roundIndex < 8) {
      setRoundIndex(prev => prev + 1);
    }
    setCurrentPhase('challenge');
    setActiveView('play');
    setCurrentScore({
      score: 0,
      passed: false,
      details: {
        metricName: 'Chờ nhận diện',
        metricValue: 0,
        targetValue: settings.passThreshold,
        stability: 0,
        description: 'Đang đưa khuôn mặt vào khung hình...'
      }
    });
  };

  // Question wrong -> retry face challenge
  const handleWrongAnswer = () => {
    setCurrentPhase('challenge');
  };

  // Confirm Reset game back to round 1
  const handleConfirmReset = () => {
    setCompletedRoundIndexes([]);
    setPlacedPieceIds([]);
    setRoundIndex(0);
    setCurrentPhase('challenge');
    setActiveView('play');
    setCompletedTimestamp(undefined);
    setIsResetConfirmOpen(false);
  };

  // Reset session
  const handleExitSession = () => {
    if (confirm('Em có muốn kết thúc phiên chơi hiện tại và quay lại màn hình chính không?')) {
      setStudentName('');
      setCompletedRoundIndexes([]);
      setPlacedPieceIds([]);
      setRoundIndex(0);
      setCurrentPhase('challenge');
      setActiveView('play');
    }
  };

  // Save Handlers for Teacher Settings
  const handleSaveSettings = async (newSettings: TeacherSettingsConfig) => {
    setSettings(newSettings);
    await dbService.saveSettings(newSettings);
  };

  const handleSaveQuestions = async (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    await dbService.saveQuestions(newQuestions);
  };

  const handleSavePuzzlePieces = async (newPieces: PuzzlePiece[]) => {
    setPuzzlePieces(newPieces);
    await dbService.savePuzzlePieces(newPieces);
  };

  const handleResetDefaults = async () => {
    await dbService.resetToDefaults();
    setSettings({
      timerSeconds: 10,
      passThreshold: 65,
      randomChallenges: false,
      enabledChallenges: CHALLENGE_LIBRARY.map(c => c.id),
      schoolName: 'Trường Tiểu học STEM Tân Tiến',
      teacherName: 'Ban Cố vấn Chuyên môn STEM'
    });
    setQuestions(INITIAL_STEM_QUESTIONS);
    setPuzzlePieces(DEFAULT_PUZZLE_PIECES);
  };

  const handleToggleMute = () => {
    const nextMute = audioManager.toggleMute();
    setIsMuted(nextMute);
  };

  // If student name not entered, show entry screen
  if (!studentName) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
        <StudentEntryScreen
          onStart={handleStartGame}
          onOpenTeacherSettings={() => setIsTeacherSettingsOpen(true)}
        />

        {/* Teacher Settings Modal */}
        <TeacherSettingsModal
          isOpen={isTeacherSettingsOpen}
          currentSettings={settings}
          questions={questions}
          puzzlePieces={puzzlePieces}
          onSaveSettings={handleSaveSettings}
          onSaveQuestions={handleSaveQuestions}
          onSavePuzzlePieces={handleSavePuzzlePieces}
          onResetDefaults={handleResetDefaults}
          onClose={() => setIsTeacherSettingsOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040817] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black relative overflow-x-hidden cyber-grid-pattern">
      {/* High-Tech Glowing Ambient Lights */}
      <div className="fixed top-12 left-1/4 w-[600px] h-[350px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[550px] h-[450px] bg-indigo-500/12 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[400px] bg-sky-500/12 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Header */}
      <GameHeader
        studentName={studentName}
        unlockedCount={placedPieceIds.length}
        totalPieces={9}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenTeacherSettings={() => setIsTeacherSettingsOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        isCompleted={isCompleted}
        onExitStudentSession={handleExitSession}
        currentView={activeView}
        onSelectView={setActiveView}
        onResetGame={() => setIsResetConfirmOpen(true)}
      />

      {/* Ambient Sci-Fi Side Panels on ultra-wide screens (2xl: >= 1536px) */}
      {activeView === 'play' && !isCompleted && (
        <div className="hidden 2xl:block pointer-events-none select-none">
          <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20">
            <CyberLeftPanel />
          </div>
          <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20">
            <CyberRightPanel />
          </div>
        </div>
      )}

      {/* Main Game Stage - Perfectly Centered in Viewport */}
      <main className="flex-1 flex flex-col justify-center items-center max-w-7xl 2xl:max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* VIEW 1: CHALLENGE & STEM QUESTION VIEW */}
        {activeView === 'play' && !isCompleted && (
          <div className="w-full my-auto space-y-4 lg:space-y-6 animate-in fade-in duration-200">
            {/* Phase A & Phase B Container (Camera & Challenge Card aligned up) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left Stage: Camera & AI Processing */}
              <div className="lg:col-span-6 flex flex-col justify-center h-full">
                <FaceCamera
                  currentChallengeId={currentChallenge.id}
                  passThreshold={settings.passThreshold}
                  isPaused={currentPhase !== 'challenge'}
                  onValidationChange={setValidation}
                  onScoreUpdate={setCurrentScore}
                />
              </div>

              {/* Right Stage: Interactive Challenge or STEM Question */}
              <div className="lg:col-span-6 flex flex-col justify-center h-full">
                {currentPhase === 'challenge' ? (
                  <ChallengeCard
                    challenge={currentChallenge}
                    totalTimeSeconds={settings.timerSeconds}
                    passThreshold={settings.passThreshold}
                    scoreResult={currentScore}
                    currentScoreResult={currentScore}
                    validationResult={validation}
                    onPass={handlePassChallenge}
                    onRetry={() => {
                      setCurrentScore({
                        score: 0,
                        passed: false,
                        details: {
                          metricName: 'Nhận diện lại',
                          metricValue: 0,
                          targetValue: settings.passThreshold,
                          stability: 0,
                          description: 'Đang chuẩn bị...'
                        }
                      });
                    }}
                  />
                ) : (
                  <QuestionView
                    question={currentQuestion}
                    questionIndex={roundIndex}
                    totalQuestions={9}
                    currentPieceNumber={roundIndex + 1}
                    onCorrectAnswer={handleCorrectAnswer}
                    onWrongAnswer={handleWrongAnswer}
                  />
                )}
              </div>
            </div>

            {/* Quick Link to Puzzle Assembly Table */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#06122d]/90 backdrop-blur-md border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  <Globe className="w-4 h-4" />
                </div>
                <span>
                  Tiến trình lắp tranh: <strong className="text-cyan-300 font-mono text-sm sm:text-base">{placedPieceIds.length}/9 mảnh</strong> đã ghép vào tranh
                  {placementTurnsAvailable > 0 && (
                    <span className="ml-2 text-amber-400 font-bold">
                      (Em đang có {placementTurnsAvailable} lượt chọn ghép mảnh!)
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  setActiveView('assembly');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1309] hover:bg-[#281c0c] text-amber-300 border border-amber-500/60 font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:border-amber-400 group text-xs sm:text-sm"
              >
                <span>Đến Bàn Ghép Tranh Tự Chọn Mảnh</span>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: INTERACTIVE PUZZLE ASSEMBLY TABLE */}
        {(activeView === 'assembly' || isCompleted) && (
          <section className="animate-in fade-in duration-200 space-y-4 my-auto w-full">
            {!isCompleted && (
              <div className="flex items-center justify-between pb-2">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setActiveView('play');
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#081533] hover:bg-[#0c1f4a] text-cyan-200 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                >
                  <span>« Quay lại Thử Thách Khuôn Mặt (Vòng #{roundIndex + 1})</span>
                </button>
              </div>
            )}

            <PuzzleBoard
              pieces={puzzlePieces}
              placedPieceIds={placedPieceIds}
              onPlacePiece={handlePlacePiece}
              studentName={studentName}
              isCompleted={isCompleted}
              onOpenCertificate={() => setIsCertificateOpen(true)}
              onContinueNextRound={handleContinueNextRound}
              onResetGame={() => setIsResetConfirmOpen(true)}
              nextRoundNumber={nextRoundNumber}
              placementTurnsAvailable={placementTurnsAvailable}
            />
          </section>
        )}
      </main>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        studentName={studentName}
        settings={settings}
        puzzlePieces={puzzlePieces}
        completedAt={completedTimestamp}
        onClose={() => setIsCertificateOpen(false)}
      />

      {/* Teacher Settings Modal */}
      <TeacherSettingsModal
        isOpen={isTeacherSettingsOpen}
        currentSettings={settings}
        questions={questions}
        puzzlePieces={puzzlePieces}
        onSaveSettings={handleSaveSettings}
        onSaveQuestions={handleSaveQuestions}
        onSavePuzzlePieces={handleSavePuzzlePieces}
        onResetDefaults={handleResetDefaults}
        onClose={() => setIsTeacherSettingsOpen(false)}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        unlockedCount={placedPieceIds.length}
        totalPieces={9}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
