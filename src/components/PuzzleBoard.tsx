import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  Eye,
  EyeOff,
  Lightbulb,
  CheckCircle2,
  Trophy,
  Shuffle,
  Flame,
  Lock,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Layers
} from 'lucide-react';
import { PuzzlePiece } from '../types';
import { buildJigsawPieces, JigsawPiecePathInfo } from '../utils/jigsawGeometry';
import { PUZZLE_THEMES, DEFAULT_PUZZLE_THEME, PuzzleTheme } from '../data/puzzleThemes';
import { audioManager } from '../services/audio/AudioManager';

export interface PuzzleBoardProps {
  pieces: PuzzlePiece[];
  earnedPieceIds?: number[];
  unlockedPieceIds?: number[];
  placedPieceIds?: number[];
  unplacedPieceIds?: number[];
  onPlacePiece?: (pieceId: number) => void;
  studentName: string;
  isCompleted: boolean;
  onOpenCertificate?: () => void;
  justUnlockedPieceId?: number | null;
  onContinueNextRound?: () => void;
  onResetGame?: () => void;
  nextRoundNumber?: number;
  placementTurnsAvailable?: number;
}

const PuzzleBoardComponent: React.FC<PuzzleBoardProps> = ({
  pieces,
  earnedPieceIds,
  unlockedPieceIds,
  placedPieceIds = [],
  unplacedPieceIds,
  onPlacePiece,
  studentName,
  isCompleted,
  onOpenCertificate,
  justUnlockedPieceId,
  onContinueNextRound,
  onResetGame,
  nextRoundNumber,
  placementTurnsAvailable
}) => {
  const totalPieces = 9;

  // Normalized placed list
  const placed = useMemo(() => {
    if (placedPieceIds && Array.isArray(placedPieceIds)) return placedPieceIds;
    return [];
  }, [placedPieceIds]);

  // Compute 9 authentic interlocking jigsaw paths (810 x 540 coordinate space, 3x3)
  const jigsawPaths: JigsawPiecePathInfo[] = useMemo(() => {
    return buildJigsawPieces({ width: 810, height: 540, rows: 3, cols: 3 });
  }, []);

  // Current active theme
  const [selectedThemeId] = useState<string>(DEFAULT_PUZZLE_THEME.id);
  const currentTheme: PuzzleTheme = useMemo(() => {
    return PUZZLE_THEMES.find(t => t.id === selectedThemeId) || DEFAULT_PUZZLE_THEME;
  }, [selectedThemeId]);

  // Master artwork image URL
  const masterImageUrl = useMemo(() => {
    return currentTheme.imageUrl;
  }, [currentTheme]);

  // User UI controls
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [hintActive, setHintActive] = useState<boolean>(false);
  const [shakeSocketId, setShakeSocketId] = useState<number | null>(null);
  const [lockWarning, setLockWarning] = useState<string | null>(null);

  // Tray order & shuffle state (all 9 pieces)
  const [trayOrder, setTrayOrder] = useState<number[]>(() => [1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // Selected piece in tray
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);

  // Dragging state
  const [draggingPieceId, setDraggingPieceId] = useState<number | null>(null);

  // Turns available: how many pieces the student is permitted to place right now
  const availableTurns = placementTurnsAvailable !== undefined
    ? placementTurnsAvailable
    : Math.max(0, 9 - placed.length);

  // Remaining unplaced count
  const remainingCount = totalPieces - placed.length;

  // Automatically select piece when student opens tray or places a piece
  useEffect(() => {
    if (selectedPieceId && !placed.includes(selectedPieceId)) {
      // Current selected piece is still valid & unplaced
      return;
    }
    // Otherwise automatically select the first unplaced piece in tray
    const nextUnplaced = trayOrder.find(id => !placed.includes(id)) ?? null;
    setSelectedPieceId(nextUnplaced);
  }, [placed, selectedPieceId, trayOrder]);

  // Shuffle tray pieces
  const handleShuffleTray = () => {
    audioManager.playClick();
    const shuffled = [...trayOrder].sort(() => Math.random() - 0.5);
    setTrayOrder(shuffled);
  };

  // Toggle show numbers
  const handleToggleNumbers = () => {
    audioManager.playClick();
    setShowNumbers(prev => !prev);
  };

  // Toggle socket hint
  const handleToggleHint = () => {
    audioManager.playClick();
    setHintActive(prev => !prev);
    if (!hintActive) {
      setTimeout(() => setHintActive(false), 4000);
    }
  };

  // Attempt placement: player is allowed to place any valid unplaced piece when turns are available!
  const handleAttemptPlace = (targetSocketId: number) => {
    if (!selectedPieceId) {
      if (placed.length < totalPieces) {
        setLockWarning(`Bạn hãy nhấp chọn một mảnh ghép trong khay trước nhé!`);
        setTimeout(() => setLockWarning(null), 3000);
      }
      return;
    }

    // Security check: cannot re-place an already placed piece
    if (placed.includes(selectedPieceId)) {
      setLockWarning(`Mảnh #${selectedPieceId} đã được lắp vào tranh rồi!`);
      setTimeout(() => setLockWarning(null), 3000);
      return;
    }

    // Check placement allowance for current round
    if (availableTurns <= 0) {
      audioManager.playWrongDrop();
      setLockWarning(
        `Bạn đã dùng xong lượt ghép của vòng này rồi! Hãy làm tiếp Thử thách Vòng #${nextRoundNumber || (placed.length + 1)} để nhận thêm lượt chọn mảnh nhé.`
      );
      setTimeout(() => setLockWarning(null), 4000);
      return;
    }

    if (selectedPieceId === targetSocketId) {
      // CORRECT FIT!
      audioManager.playPieceSnap();
      if (onPlacePiece) {
        onPlacePiece(selectedPieceId);
      }
      setHintActive(false);
      setLockWarning(null);

      if (placed.length + 1 >= totalPieces) {
        audioManager.playVictory();
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    } else {
      // MISMATCH!
      audioManager.playWrongDrop();
      setShakeSocketId(targetSocketId);
      setTimeout(() => setShakeSocketId(null), 800);
      setLockWarning(
        `Mảnh #${selectedPieceId} chưa khớp với ô #${targetSocketId}. Bạn hãy quan sát kỹ mộng răng cưa hoặc bật gợi ý ô để thử lại nhé!`
      );
      setTimeout(() => setLockWarning(null), 3500);
    }
  };

  // Path info for active selected piece
  const activePathInfo = useMemo(() => {
    if (selectedPieceId) {
      return jigsawPaths.find(p => p.position === selectedPieceId) || null;
    }
    const firstUnplaced = trayOrder.find(id => !placed.includes(id));
    if (firstUnplaced) {
      return jigsawPaths.find(p => p.position === firstUnplaced) || null;
    }
    return null;
  }, [selectedPieceId, jigsawPaths, trayOrder, placed]);

  return (
    <div
      id="puzzle-board-container"
      className="w-full rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-4 border-[#3d1f12] wood-board-chassis select-none relative text-amber-100"
    >
      {/* Wooden Frame Corner Accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600/70 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600/70 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600/70 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600/70 rounded-br-sm pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-amber-900/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 shadow-sm">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-amber-200 font-tech tracking-wide">
                BÀN GHÉP TRANH GỖ TỰ NHIÊN
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700 font-mono">
                STEM MATRIX 3x3
              </span>
            </div>
            <p className="text-xs text-amber-300/70">
              Quan sát mộng ghép & vị trí, nhấp hoặc kéo thả mảnh vào khung tranh
            </p>
          </div>
        </div>

        {/* Real-time Progress HUD */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 shadow-sm transition-all ${
            availableTurns > 0
              ? 'bg-[#2a1708] border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/60'
              : 'bg-[#24130b] border-amber-800/60 text-amber-400/70'
          }`}>
            {availableTurns > 0 ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-500" />
            )}
            <span>
              LƯỢT GHÉP: <strong>{availableTurns > 0 ? `${availableTurns} lượt` : 'Đã dùng hết'}</strong>
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#142416] border border-emerald-700/80 text-emerald-300 font-bold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ĐÃ LẮP: <strong>{placed.length}/9</strong></span>
          </div>
        </div>
      </div>

      {/* Dynamic guidance banner */}
      <div className="mb-5">
        {availableTurns > 0 ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#27140b] to-[#1a0c06] border-2 border-amber-500/70 flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm shrink-0 font-mono">
                ★
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wide">
                  TẤT CẢ MẢNH GHÉP ĐÃ XUẤT HIỆN • BẠN ĐƯỢC CHỌN 1 MẢNH DUY NHẤT ĐỂ GHÉP
                </div>
                <div className="text-[11px] sm:text-xs text-amber-300/85 mt-0.5">
                  Bạn không bắt buộc phải ghép theo thứ tự 1-8. Hãy nhấp chọn bất kỳ mảnh nào trong khay mà bạn muốn để ghép vào tranh!
                </div>
              </div>
            </div>
            <div className="hidden md:inline-flex px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-500/80 text-amber-300 text-xs font-bold shrink-0 font-mono">
              {availableTurns} lượt chọn
            </div>
          </div>
        ) : placed.length < totalPieces ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#1c1008] to-[#150a04] border border-emerald-600/70 flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wide">
                  ĐÃ DÙNG XONG LƯỢT GHÉP VÒNG NÀY (ĐÃ LẮP {placed.length}/9 MẢNH)
                </div>
                <div className="text-[11px] sm:text-xs text-amber-200/80 mt-0.5">
                  Hãy hoàn thành Thử thách Vòng #{nextRoundNumber || (placed.length + 1)} để nhận thêm 1 lượt chọn mảnh mới nhé!
                </div>
              </div>
            </div>
            {onContinueNextRound && (
              <button
                type="button"
                onClick={onContinueNextRound}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer uppercase tracking-wider shrink-0"
              >
                <span>TIẾP TỤC VÒNG #{nextRoundNumber || (placed.length + 1)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Warning Toast if clicking locked piece */}
      {lockWarning && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-950/90 border-2 border-amber-500 text-amber-200 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in fade-in duration-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{lockWarning}</span>
        </div>
      )}

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: MẢNH GHÉP & KHAY CHỜ ================= */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col space-y-3.5">
          {/* Header row: 🔥 MẢNH GHÉP LỘN XỘN | 🔀 Xáo lại | Còn 9 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs uppercase tracking-wider font-tech">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>MẢNH GHÉP LỘN XỘN</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-shuffle-tray"
                onClick={handleShuffleTray}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24130b] border border-amber-700/80 hover:bg-amber-900/60 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                title="Xáo trộn ngẫu nhiên thứ tự các mảnh trong khay"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>Xáo lại</span>
              </button>

              <div className="px-2.5 py-1.5 rounded-xl bg-[#24130b] border border-amber-700/80 text-amber-300 text-xs font-bold font-mono shadow-sm">
                Còn {remainingCount}
              </div>
            </div>
          </div>

          {/* Active Piece Preview Card / Card Mảnh Đang Chọn */}
          <motion.div
            layout
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="rounded-2xl border-2 border-amber-500/90 bg-[#1c0e07] p-4 shadow-[0_0_25px_rgba(245,158,11,0.22)] flex flex-col space-y-3 relative overflow-hidden perspective-800"
          >
            {/* Top decorative amber glow & holographic light sheen */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent -translate-x-full animate-holo-sheen pointer-events-none" />

            {activePathInfo ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`preview-piece-${activePathInfo.position}`}
                  initial={{ opacity: 0, scale: 0.9, rotateX: 12 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateX: -12 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="space-y-3 preserve-3d"
                >
                  {/* Top Badge: ✨ Mảnh bí ẩn */}
                  <div className="flex items-center justify-between">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#271309] border border-amber-600/70 text-amber-300 text-xs font-bold shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>Mảnh bí ẩn 3D</span>
                    </motion.div>
                    <span className="text-[11px] text-amber-400 font-mono font-bold">
                      {placed.includes(activePathInfo.position) ? '✓ Đã lắp vào tranh' : `Vị trí #${activePathInfo.position}`}
                    </span>
                  </div>

                  {/* Center Preview with authentic Jigsaw Cutout & 3D Levitation */}
                  <motion.div
                    animate={{
                      y: [-3, 3, -3],
                      rotateX: [2, -2, 2],
                      rotateY: [-2, 2, -2]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    whileHover={{ scale: 1.04, rotateX: 6, rotateY: -6 }}
                    className="w-full h-44 rounded-xl bg-[#120803] border border-amber-900/80 flex items-center justify-center relative overflow-hidden shadow-inner p-2 cursor-grab active:cursor-grabbing hover:border-amber-500/80 transition-colors transform-gpu preserve-3d"
                    draggable={!placed.includes(activePathInfo.position)}
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', String(activePathInfo.position));
                      setSelectedPieceId(activePathInfo.position);
                      setDraggingPieceId(activePathInfo.position);
                    }}
                    onDragEnd={() => setDraggingPieceId(null)}
                  >
                    <svg
                      viewBox={`${activePathInfo.bounds.minX - 8} ${activePathInfo.bounds.minY - 8} ${
                        activePathInfo.bounds.maxX - activePathInfo.bounds.minX + 16
                      } ${activePathInfo.bounds.maxY - activePathInfo.bounds.minY + 16}`}
                      className="w-auto h-36 max-w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] transition-transform"
                    >
                      <defs>
                        <clipPath id={`active-preview-clip-${activePathInfo.position}`}>
                          <path d={activePathInfo.pathD} />
                        </clipPath>
                      </defs>

                      {/* Masked artwork image */}
                      <g clipPath={`url(#active-preview-clip-${activePathInfo.position})`}>
                        <image
                          href={masterImageUrl}
                          x="0"
                          y="0"
                          width="810"
                          height="540"
                          preserveAspectRatio="xMidYMid slice"
                        />
                      </g>

                      {/* Glowing amber border */}
                      <path
                        d={activePathInfo.pathD}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        className="filter drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]"
                      />
                    </svg>
                  </motion.div>

                  {/* Button inside the card below preview */}
                  <motion.button
                    id="btn-drag-hint"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (availableTurns <= 0) {
                        if (onContinueNextRound) onContinueNextRound();
                      } else {
                        if (hintActive) {
                          setHintActive(false);
                        } else {
                          handleToggleHint();
                        }
                      }
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl border font-bold text-xs text-center cursor-pointer transition-colors shadow-md flex items-center justify-center gap-2 ${
                      availableTurns > 0
                        ? 'bg-[#140803] hover:bg-[#1f0d06] text-amber-200 border-amber-800/80'
                        : 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border-emerald-600/80'
                    }`}
                  >
                    {availableTurns > 0 ? (
                      <span>
                        {hintActive ? 'Đang bật gợi ý vị trí ô trên tranh' : `Kéo thả hoặc Nhấp ô #${activePathInfo.position} để ghép`}
                      </span>
                    ) : (
                      <span>
                        Đã dùng hết lượt vòng này • Tiếp tục Vòng #{nextRoundNumber || (placed.length + 1)} »
                      </span>
                    )}
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            ) : (
              /* When all 9 pieces are placed */
              <div className="py-6 px-3 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-200 font-tech">
                    ĐÃ LẮP XONG TẤT CẢ CÁC MẢNH GHÉP!
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Bạn đã tự tay ghép thành công toàn bộ {placed.length}/9 mảnh vào tranh.
                  </p>
                </div>

                {placed.length < totalPieces && onContinueNextRound && (
                  <button
                    onClick={onContinueNextRound}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    <span>TIẾP TỤC THỬ THÁCH VÒNG #{nextRoundNumber || (placed.length + 1)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Observation Hint Card (GỢI Ý QUAN SÁT) */}
          {activePathInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="p-3 rounded-xl bg-[#1e0f08] border border-amber-950 space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs uppercase font-tech">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>GỢI Ý QUAN SÁT:</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#064e3b] border border-emerald-500 text-emerald-300 text-xs font-bold shadow-sm">
                  {activePathInfo.categoryBadge}
                </span>
              </div>
              <p className="text-[#fef3c7] text-xs leading-relaxed font-normal">
                {activePathInfo.categoryHint}
              </p>
            </motion.div>
          )}

          {/* Tray Thumbnail Grid - All pieces appear, player can pick any unplaced piece */}
          <div className="space-y-2 pt-1">
            <div className="text-xs text-amber-400/90 font-mono italic flex items-center justify-between">
              <span>Khay mảnh ghép (Chọn 1 mảnh bất kỳ):</span>
              <span className="text-[11px] text-amber-300 font-mono">
                Còn {remainingCount}/9 mảnh
              </span>
            </div>

            {/* 3-Column Thumbnail Grid with 3D perspective */}
            <div className="grid grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-2 wood-tray-scrollbar perspective-800">
              {trayOrder.map(pieceId => {
                const isSelected = selectedPieceId === pieceId;
                const isPlaced = placed.includes(pieceId);
                const pathInfo = jigsawPaths.find(p => p.position === pieceId) || jigsawPaths[0];

                return (
                  <motion.button
                    key={`tray-piece-${pieceId}`}
                    id={`tray-piece-btn-${pieceId}`}
                    layout
                    whileHover={!isPlaced ? {
                      scale: 1.08,
                      y: -4,
                      rotateX: 8,
                      rotateY: -6,
                      boxShadow: '0 12px 25px rgba(245, 158, 11, 0.45)',
                      transition: { type: 'spring', stiffness: 450, damping: 20 }
                    } : {}}
                    whileTap={!isPlaced ? { scale: 0.94, y: 1 } : {}}
                    animate={isSelected ? {
                      y: [-2, 2, -2],
                      transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
                    } : {}}
                    onClick={() => {
                      audioManager.playClick();
                      setSelectedPieceId(pieceId);
                    }}
                    draggable={!isPlaced}
                    onDragStart={e => {
                      if (isPlaced) {
                        e.preventDefault();
                        return;
                      }
                      e.dataTransfer.setData('text/plain', String(pieceId));
                      setSelectedPieceId(pieceId);
                      setDraggingPieceId(pieceId);
                    }}
                    onDragEnd={() => setDraggingPieceId(null)}
                    className={`aspect-square rounded-2xl relative p-1.5 transition-all flex items-center justify-center overflow-hidden cursor-pointer transform-gpu preserve-3d ${
                      isSelected
                        ? 'border-2 border-amber-400 bg-[#25130a] shadow-[0_0_20px_rgba(245,158,11,0.65)] ring-2 ring-amber-500/50 scale-[1.04]'
                        : isPlaced
                        ? 'border border-emerald-800/80 bg-[#142319]/70 opacity-60'
                        : 'border border-amber-950/90 bg-[#190d07] hover:border-amber-600/70'
                    }`}
                    title={`Mảnh #${pieceId} - ${pathInfo.categoryBadge}`}
                  >
                    <svg
                      viewBox={`${pathInfo.bounds.minX - 5} ${pathInfo.bounds.minY - 5} ${
                        pathInfo.bounds.maxX - pathInfo.bounds.minX + 10
                      } ${pathInfo.bounds.maxY - pathInfo.bounds.minY + 10}`}
                      className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                    >
                      <defs>
                        <clipPath id={`tray-clip-${pieceId}`}>
                          <path d={pathInfo.pathD} />
                        </clipPath>
                      </defs>

                      <g clipPath={`url(#tray-clip-${pieceId})`}>
                        <image
                          href={masterImageUrl}
                          x="0"
                          y="0"
                          width="810"
                          height="540"
                          preserveAspectRatio="xMidYMid slice"
                        />
                      </g>

                      <path
                        d={pathInfo.pathD}
                        fill="none"
                        stroke={isSelected ? '#f59e0b' : '#78350f'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                      />
                    </svg>

                    {/* Placed Badge */}
                    {isPlaced && (
                      <div className="absolute inset-0 bg-[#0d1a10]/75 backdrop-blur-[1px] flex flex-col items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in zoom-in duration-200" />
                        <span className="text-[9px] font-bold font-mono mt-0.5">Đã lắp</span>
                      </div>
                    )}

                    {/* Piece Number Badge */}
                    <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-[#190d07]/90 border border-amber-900 text-[9px] font-bold font-mono text-amber-300 shadow-sm">
                      #{pieceId}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Bottom Tool Buttons: 💡 Gợi ý ô | 👁️ Hiện số 1-9 */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <motion.button
              id="btn-hint-socket"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleToggleHint}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                hintActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-[#24130b] border-amber-700/80 hover:border-amber-500 text-amber-300'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Gợi ý ô</span>
            </motion.button>

            <motion.button
              id="btn-toggle-numbers"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleToggleNumbers}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                showNumbers
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-[#24130b] border-amber-700/80 hover:border-amber-500 text-amber-300'
              }`}
            >
              {showNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showNumbers ? 'Ẩn số 1-9' : 'Hiện số 1-9'}</span>
            </motion.button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: THE GRAND PUZZLE BOARD ================= */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col space-y-3">
          {/* Authentic Wood Chassis Frame */}
          <div
            id="grand-jigsaw-frame"
            className="w-full rounded-3xl p-4 sm:p-6 border-4 border-[#3e1f13] wood-board-chassis relative shadow-[inset_0_4px_35px_rgba(0,0,0,0.8),0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-center items-center overflow-hidden"
          >
            {/* SVG Jigsaw Board (810 x 540) */}
            <div className="w-full max-w-[810px] aspect-[810/540] relative">
              <svg
                viewBox="0 0 810 540"
                className="w-full h-full drop-shadow-[0_12px_30px_rgba(0,0,0,0.8)]"
              >
                <defs>
                  {/* ClipPaths for all 9 pieces */}
                  {jigsawPaths.map(piece => (
                    <clipPath key={`board-clip-${piece.position}`} id={`board-clip-${piece.position}`}>
                      <path d={piece.pathD} />
                    </clipPath>
                  ))}

                  {/* Dark Wood Socket Slats Pattern */}
                  <pattern
                    id="board-wood-pattern"
                    width="100"
                    height="30"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="100" height="30" fill="#180b06" />
                    <line x1="0" y1="0" x2="100" y2="0" stroke="#251209" strokeWidth="1" />
                    <line x1="0" y1="15" x2="100" y2="15" stroke="#1f0e07" strokeWidth="0.8" />
                    <line x1="0" y1="29" x2="100" y2="29" stroke="#120803" strokeWidth="1.2" />
                  </pattern>
                </defs>

                {/* Backing base of the sunken wooden board */}
                <rect width="810" height="540" fill="url(#board-wood-pattern)" rx="8" stroke="#3d1f11" strokeWidth="2.5" />

                {/* Sockets: Render all 9 interlocking sockets */}
                {jigsawPaths.map(socket => {
                  const isPlaced = placed.includes(socket.position);
                  const isTargetHint =
                    hintActive && selectedPieceId !== null && selectedPieceId === socket.position;
                  const isShaking = shakeSocketId === socket.position;

                  return (
                    <g
                      key={`socket-${socket.position}`}
                      id={`jigsaw-socket-${socket.position}`}
                      onClick={() => handleAttemptPlace(socket.position)}
                      onDragOver={e => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        const droppedId = Number(e.dataTransfer.getData('text/plain'));
                        if (droppedId) {
                          setSelectedPieceId(droppedId);
                          handleAttemptPlace(socket.position);
                        }
                      }}
                      className={`cursor-pointer transition-all ${
                        isShaking ? 'animate-bounce' : ''
                      }`}
                    >
                      {/* Socket Interior */}
                      {isPlaced ? (
                        /* Placed Piece: Render full artwork cleanly clipped with 3D snap bounce */
                        <g
                          clipPath={`url(#board-clip-${socket.position})`}
                          className={justUnlockedPieceId === socket.position ? 'animate-jigsaw-snap origin-center' : ''}
                        >
                          <image
                            href={masterImageUrl}
                            x="0"
                            y="0"
                            width="810"
                            height="540"
                            preserveAspectRatio="xMidYMid slice"
                          />
                        </g>
                      ) : (
                        /* Empty Socket: Sunken dark wooden socket */
                        <path
                          d={socket.pathD}
                          fill={isTargetHint ? 'rgba(245, 158, 11, 0.25)' : 'rgba(22, 10, 5, 0.95)'}
                          stroke={
                            isTargetHint
                              ? '#f59e0b'
                              : isShaking
                              ? '#ef4444'
                              : '#381c0f'
                          }
                          strokeWidth={isTargetHint || isShaking ? '3.5' : '2'}
                          strokeDasharray={isTargetHint ? '8,4' : undefined}
                          className={isTargetHint ? 'animate-pulse' : ''}
                        />
                      )}

                      {/* Jigsaw Boundary Outline */}
                      <path
                        d={socket.pathD}
                        fill="none"
                        stroke={isPlaced ? '#2a140b' : '#30180c'}
                        strokeWidth={isPlaced ? '2' : '1.5'}
                      />

                      {/* Coordinates / Socket Position Marks */}
                      {!isPlaced && (
                        <g>
                          {/* Crosshair Target in Socket Center */}
                          <line
                            x1={socket.center.x - 8}
                            y1={socket.center.y}
                            x2={socket.center.x + 8}
                            y2={socket.center.y}
                            stroke="rgba(120, 53, 15, 0.3)"
                            strokeWidth="1.5"
                          />
                          <line
                            x1={socket.center.x}
                            y1={socket.center.y - 8}
                            x2={socket.center.x}
                            y2={socket.center.y + 8}
                            stroke="rgba(120, 53, 15, 0.3)"
                            strokeWidth="1.5"
                          />

                          {/* Position Number Watermark (Always faint, bright when toggled or hinted) */}
                          {(showNumbers || isTargetHint) ? (
                            <text
                              x={socket.center.x}
                              y={socket.center.y + 10}
                              textAnchor="middle"
                              fill={isTargetHint ? '#f59e0b' : '#d97706'}
                              fontSize="32"
                              fontWeight="900"
                              fontFamily="Space Grotesk, monospace"
                              className={isTargetHint ? 'animate-ping' : ''}
                            >
                              #{socket.position}
                            </text>
                          ) : (
                            <text
                              x={socket.center.x}
                              y={socket.center.y + 8}
                              textAnchor="middle"
                              fill="rgba(120, 53, 15, 0.35)"
                              fontSize="22"
                              fontWeight="800"
                              fontFamily="Space Grotesk, monospace"
                            >
                              {socket.position}
                            </text>
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Bottom Caption Bar matching Image 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 text-xs text-[#d6c7b2] pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)] shrink-0" />
              <span className="text-amber-200 font-bold font-mono text-xs sm:text-sm">
                Bức tranh: {currentTheme.title}
              </span>
            </div>

            <div className="text-[#d6c7b2] text-xs">
              Quan sát răng cưa và chi tiết tranh, Kéo thả hoặc Nhấp ô để ghép
            </div>
          </div>
        </div>
      </div>

      {/* Completion Banner if all 9 pieces placed */}
      {isCompleted && (
        <div className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-sky-50 via-emerald-50 to-sky-50 border-2 border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-emerald-500 text-white rounded-2xl shadow-md">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 font-tech">
                HOÀN THÀNH TOÀN BỘ BỨC TRANH 9 MẢNH!
              </h4>
              <p className="text-xs text-slate-600">
                Chúc mừng người chơi <strong>{studentName}</strong> đã xuất sắc vượt qua toàn bộ các thử thách khuôn mặt và trả lời đúng các câu hỏi STEM!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenCertificate && (
              <button
                onClick={onOpenCertificate}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs shadow-md cursor-pointer transition-transform active:scale-95 uppercase tracking-wider"
              >
                Nhận Giấy Khen STEM
              </button>
            )}
            {onResetGame && (
              <button
                onClick={onResetGame}
                className="px-4 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer shadow-sm"
              >
                Ghép Lại
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const PuzzleBoard = React.memo(PuzzleBoardComponent);
