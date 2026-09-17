import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Puzzle,
  User,
  RotateCcw,
  Volume2,
  VolumeX,
  Settings,
  Trophy,
  Sparkles,
  MousePointerClick,
  Image as ImageIcon,
  Search,
  Check,
  Lock,
  Upload,
  Home,
  CheckCircle2,
  X
} from 'lucide-react';
import { PuzzlePiece } from '../types';
import { audioManager } from '../services/audio/AudioManager';
import { buildJigsawPieces, JigsawPiecePathInfo } from '../utils/jigsawGeometry';
import { STEM_ARTWORK_URL, STEM_THEME_TITLE } from '../data/stemArtwork';

export interface PuzzleBoardProps {
  pieces?: PuzzlePiece[];
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
  onBackToChallenge?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenTeacherSettings?: () => void;
  customArtworkUrl?: string;
  themeTitle?: string;
  onUploadArtwork?: (url: string, name: string) => void;
  onResetArtwork?: () => void;
}

const BOARD_WIDTH = 1024;
const BOARD_HEIGHT = 683;

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  pieces = [],
  earnedPieceIds,
  unlockedPieceIds,
  placedPieceIds = [],
  onPlacePiece,
  studentName,
  isCompleted: globalIsCompleted,
  onOpenCertificate,
  justUnlockedPieceId,
  onContinueNextRound,
  onResetGame,
  onBackToChallenge,
  isMuted = false,
  onToggleMute,
  onOpenTeacherSettings,
  customArtworkUrl,
  themeTitle = STEM_THEME_TITLE,
  onUploadArtwork,
  onResetArtwork
}) => {
  const artworkUrl = customArtworkUrl || STEM_ARTWORK_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [recentlyPlacedPieceId, setRecentlyPlacedPieceId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPlacementSuccessPopup, setShowPlacementSuccessPopup] = useState<boolean>(false);
  const [popupPlacedCount, setPopupPlacedCount] = useState<number | null>(null);

  // Build the 9 authentic interlocking jigsaw puzzle piece definitions (3 rows x 3 columns)
  const jigsawPieces = useMemo<JigsawPiecePathInfo[]>(() => {
    return buildJigsawPieces({
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      rows: 3,
      cols: 3
    });
  }, []);

  // Compute all pieces that the student has earned/unlocked
  const effectiveUnlockedIds = useMemo<number[]>(() => {
    if (unlockedPieceIds && unlockedPieceIds.length > 0) {
      return Array.from(new Set([...unlockedPieceIds, ...placedPieceIds]));
    }
    if (earnedPieceIds && earnedPieceIds.length > 0) {
      return Array.from(new Set([...earnedPieceIds, ...placedPieceIds]));
    }
    const fromPieces = pieces.filter(p => p.unlocked).map(p => p.position || p.id);
    if (fromPieces.length > 0) {
      return Array.from(new Set([...fromPieces, ...placedPieceIds]));
    }
    // Default: at least piece 1 or placed pieces
    return placedPieceIds.length > 0 ? placedPieceIds : [1];
  }, [unlockedPieceIds, earnedPieceIds, placedPieceIds, pieces]);

  // Pieces that are unlocked but not yet placed on the board
  const unplacedUnlockedIds = useMemo<number[]>(() => {
    return effectiveUnlockedIds.filter(id => !placedPieceIds.includes(id));
  }, [effectiveUnlockedIds, placedPieceIds]);

  // Selected piece for inspection & placement
  const [activePieceId, setActivePieceId] = useState<number>(() => {
    if (justUnlockedPieceId && !placedPieceIds.includes(justUnlockedPieceId)) {
      return justUnlockedPieceId;
    }
    if (unplacedUnlockedIds.length > 0) {
      return unplacedUnlockedIds[0];
    }
    return 1;
  });

  // Track wrong slot shake animation
  const [shakingSlotId, setShakingSlotId] = useState<number | null>(null);

  // When a new piece is unlocked randomly, automatically focus on it!
  useEffect(() => {
    if (justUnlockedPieceId && !placedPieceIds.includes(justUnlockedPieceId)) {
      setActivePieceId(justUnlockedPieceId);
    } else if (!effectiveUnlockedIds.includes(activePieceId) && unplacedUnlockedIds.length > 0) {
      setActivePieceId(unplacedUnlockedIds[0]);
    }
  }, [justUnlockedPieceId, unplacedUnlockedIds, effectiveUnlockedIds, activePieceId, placedPieceIds]);

  // Active jigsaw geometry definition
  const activeJigsawPiece = useMemo(() => {
    return jigsawPieces.find(p => p.id === activePieceId) || jigsawPieces[0];
  }, [jigsawPieces, activePieceId]);

  // Solved state: all 9 pieces placed on the board
  const isAllSolved = globalIsCompleted || placedPieceIds.length >= 9;

  // File Upload Handler for custom puzzle artwork
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP, GIF)');
      setTimeout(() => setUploadError(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
        if (onUploadArtwork) {
          onUploadArtwork(dataUrl, cleanTitle);
        }
        audioManager.playSuccess();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Drag and Drop files onto puzzle board
  const handleBoardDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDraggingFile(true);
    }
  };

  const handleBoardDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingFile(false);
  };

  const handleBoardDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      setIsDraggingFile(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
            if (onUploadArtwork) {
              onUploadArtwork(dataUrl, cleanTitle);
            }
            audioManager.playSuccess();
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Manual placement into correct slot
  const handlePlaceIntoSlot = (slotId: number) => {
    // Already placed slot
    if (placedPieceIds.includes(slotId)) return;

    // Check if the student is placing the active piece into its correct matching slot
    if (slotId === activePieceId) {
      audioManager.playPieceSnap();
      setRecentlyPlacedPieceId(slotId);
      if (onPlacePiece) {
        onPlacePiece(activePieceId);
      }

      const newCount = placedPieceIds.includes(activePieceId)
        ? placedPieceIds.length
        : placedPieceIds.length + 1;
      setPopupPlacedCount(newCount);
      setShowPlacementSuccessPopup(true);

      // Automatically select the next unplaced unlocked piece if available
      const remaining = unplacedUnlockedIds.filter(id => id !== activePieceId);
      if (remaining.length > 0) {
        setActivePieceId(remaining[0]);
      }

      // Check if this was the 9th piece (completion)
      if (newCount >= 9) {
        setTimeout(() => {
          audioManager.playVictory();
          try {
            confetti({
              particleCount: 160,
              spread: 90,
              origin: { y: 0.55 },
              colors: ['#06b6d4', '#22d3ee', '#fbbf24', '#ffffff']
            });
          } catch {}
        }, 200);
      }
      return;
    }

    // If student clicked on a slot for which they already own the piece, let them snap that piece directly!
    if (effectiveUnlockedIds.includes(slotId)) {
      setActivePieceId(slotId);
      audioManager.playPieceSnap();
      setRecentlyPlacedPieceId(slotId);
      if (onPlacePiece) {
        onPlacePiece(slotId);
      }

      const newCount = placedPieceIds.includes(slotId)
        ? placedPieceIds.length
        : placedPieceIds.length + 1;
      setPopupPlacedCount(newCount);
      setShowPlacementSuccessPopup(true);

      const remaining = unplacedUnlockedIds.filter(id => id !== slotId);
      if (remaining.length > 0) {
        setActivePieceId(remaining[0]);
      }

      if (newCount >= 9) {
        setTimeout(() => {
          audioManager.playVictory();
          try {
            confetti({
              particleCount: 160,
              spread: 90,
              origin: { y: 0.55 },
              colors: ['#06b6d4', '#22d3ee', '#fbbf24', '#ffffff']
            });
          } catch {}
        }, 200);
      }
      return;
    }

    // WRONG SLOT: Mismatch! Shake slot and play soft wooden block knock (NO electrical buzz)
    audioManager.playWrongDrop();
    setShakingSlotId(slotId);
    setTimeout(() => {
      setShakingSlotId(null);
    }, 400);
  };

  const handleContinueFromPopup = () => {
    setShowPlacementSuccessPopup(false);
    audioManager.playClick();
    if (onContinueNextRound) {
      onContinueNextRound();
    } else if (onBackToChallenge) {
      onBackToChallenge();
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', String(activePieceId));
  };

  const handleDropOnSlot = (e: React.DragEvent, slotId: number) => {
    e.preventDefault();
    const draggedId = Number(e.dataTransfer.getData('text/plain'));
    if (draggedId === slotId && effectiveUnlockedIds.includes(draggedId)) {
      handlePlaceIntoSlot(slotId);
    } else {
      audioManager.playWrongDrop();
      setShakingSlotId(slotId);
      setTimeout(() => setShakingSlotId(null), 400);
    }
  };

  return (
    <div
      id="wooden-desk-environment"
      onDragOver={handleBoardDragOver}
      onDragLeave={handleBoardDragLeave}
      onDrop={handleBoardDrop}
      className="wood-desk-surface relative w-full min-h-[700px] flex flex-col justify-between rounded-3xl p-3 sm:p-5 lg:p-6 overflow-hidden select-none border-2 border-[#452410] shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-slate-100"
    >
      {/* Hidden File Input for Custom Puzzle Artwork */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleImageFileSelect}
      />

      {/* Dragging Image Overlay Feedback */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-[#061838]/90 border-4 border-dashed border-cyan-400 rounded-3xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm animate-fade-in pointer-events-none">
          <Upload className="w-16 h-16 text-cyan-300 animate-bounce" />
          <span className="text-xl sm:text-2xl font-black text-cyan-200 uppercase tracking-wider">
            Thả ảnh vào đây để làm tranh ghép mới!
          </span>
          <span className="text-sm text-cyan-400">
            Hỗ trợ PNG, JPG, JPEG, WEBP, GIF
          </span>
        </div>
      )}

      {/* ================= DESK AMBIENT CORNER DECORATIONS (MATCHING REFERENCE IMAGE) ================= */}
      {/* Top-Right: Notebook "PUZZLE LEARNING FUN!" & Green Leaves */}
      <div className="absolute top-2 right-4 pointer-events-none opacity-40 lg:opacity-75 z-0 flex items-start gap-2">
        <div className="transform rotate-12 text-right">
          <div className="text-[11px] sm:text-xs font-black tracking-widest text-cyan-200/90 font-mono uppercase drop-shadow">
            PUZZLE
          </div>
          <div className="text-[10px] sm:text-[11px] font-black tracking-widest text-cyan-300 font-mono uppercase drop-shadow">
            LEARNING FUN!
          </div>
          <div className="text-[10px] text-cyan-400 font-mono">✦ ✦ ✦</div>
        </div>
      </div>

      {/* Bottom-Right: Notepad "Good Ideas Today!" */}
      <div className="absolute bottom-3 right-4 pointer-events-none opacity-30 lg:opacity-60 z-0 text-right">
        <div className="w-24 h-16 bg-[#f5efe6] rounded shadow-md transform rotate-[-6deg] p-1.5 text-stone-800 border border-stone-300">
          <div className="text-[9px] font-bold text-stone-700 leading-tight">Good Ideas</div>
          <div className="text-[9px] font-bold text-stone-700 leading-tight">Today!</div>
          <div className="text-[14px] text-amber-500 text-center mt-1">☺</div>
        </div>
      </div>

      {/* Bottom-Left: Colored Pencils Accent */}
      <div className="absolute bottom-2 left-4 pointer-events-none opacity-30 lg:opacity-60 z-0">
        <div className="w-28 h-4 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-cyan-500 transform -rotate-12 shadow-md" />
      </div>

      {/* ================= 1. TOP HEADER & CONTROLS ================= */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#4d2813]/80">
        {/* Left Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Student Profile Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#081830]/90 border border-cyan-400/80 shadow text-cyan-200 font-bold text-xs sm:text-sm">
            <User className="w-4 h-4 text-cyan-400" />
            <span>{studentName || 'Linh'}</span>
          </div>

          {/* Reset / Chơi lại */}
          {onResetGame && (
            <button
              id="btn-puzzle-reset"
              type="button"
              onClick={() => {
                audioManager.playClick();
                onResetGame();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0d2242] hover:bg-[#13325e] border border-cyan-500/70 text-cyan-300 font-bold text-xs sm:text-sm shadow transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chơi lại</span>
            </button>
          )}

          {/* Sound Toggle */}
          {onToggleMute && (
            <button
              id="btn-puzzle-mute"
              type="button"
              onClick={() => {
                audioManager.playClick();
                onToggleMute();
              }}
              className="w-8 h-8 rounded-full bg-[#0d2242] hover:bg-[#13325e] border border-cyan-500/60 flex items-center justify-center text-cyan-300 transition-all cursor-pointer shadow active:scale-95"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
          )}

          {/* Teacher Settings */}
          {onOpenTeacherSettings && (
            <button
              id="btn-puzzle-settings"
              type="button"
              onClick={() => {
                audioManager.playClick();
                onOpenTeacherSettings();
              }}
              className="w-8 h-8 rounded-full bg-[#0d2242] hover:bg-[#13325e] border border-cyan-500/60 flex items-center justify-center text-cyan-300 transition-all cursor-pointer shadow active:scale-95"
              title="Cài đặt giáo viên"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
            </button>
          )}
        </div>

        {/* Center: Title "Thử thách ghép tranh bí ẩn" */}
        <div className="flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
          <h1 className="text-base sm:text-xl font-black uppercase tracking-wider text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]">
            Thử thách ghép tranh bí ẩn
          </h1>
          <span className="ml-1 px-2.5 py-0.5 rounded-full bg-[#07162b] border border-cyan-400/50 text-[11px] font-mono font-bold text-cyan-300 shadow">
            {placedPieceIds.length}/9
          </span>
        </div>

        {/* Right Actions: Return to Home Challenge */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Return to Home / Next Challenge */}
          <button
            id="btn-nav-home-challenge"
            type="button"
            onClick={() => {
              audioManager.playClick();
              if (onContinueNextRound) {
                onContinueNextRound();
              } else if (onBackToChallenge) {
                onBackToChallenge();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-black text-xs sm:text-sm shadow transition-all cursor-pointer active:scale-95"
            title="Quay về màn hình thử thách khuôn mặt"
          >
            <Home className="w-4 h-4" />
            <span>Về Home Thử Thách</span>
          </button>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="relative z-20 mt-2 px-4 py-2.5 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-white text-xs font-bold uppercase ml-3 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 my-auto items-center py-3">
        {/* ================= LEFT COLUMN: SCI-FI NEON CYAN CARD (MATCHING REFERENCE IMAGE) ================= */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center w-full max-w-[360px] mx-auto">
          <div className="w-full rounded-3xl p-4 bg-[#051124]/95 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.45)] flex flex-col space-y-3">
            {/* Top Badge: [🧩 Mảnh bí ẩn] + ✨ */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b2447] border border-cyan-400/80 text-cyan-200 text-xs sm:text-sm font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Puzzle className="w-4 h-4 text-cyan-400" />
                <span>Mảnh bí ẩn</span>
              </div>
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>

            {/* Active Jigsaw Piece Preview Box with Tech Corner Brackets (L shapes) */}
            <div
              draggable={!placedPieceIds.includes(activePieceId)}
              onDragStart={handleDragStart}
              className="relative w-full aspect-[4/3] rounded-2xl bg-[#091830] border border-cyan-500/40 flex items-center justify-center p-3 overflow-hidden shadow-inner group"
            >
              {/* 4 White Tech Corner Brackets */}
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-300 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-300 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-300 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-300 pointer-events-none" />

              {/* Jigsaw Cutout of Active Piece */}
              {activeJigsawPiece && (
                <svg
                  viewBox={`${activeJigsawPiece.bounds.minX - 8} ${activeJigsawPiece.bounds.minY - 8} ${
                    activeJigsawPiece.bounds.maxX - activeJigsawPiece.bounds.minX + 16
                  } ${activeJigsawPiece.bounds.maxY - activeJigsawPiece.bounds.minY + 16}`}
                  className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] transition-transform group-hover:scale-105 cursor-grab active:cursor-grabbing"
                >
                  <defs>
                    <clipPath id={`active-piece-preview-clip-${activeJigsawPiece.id}`}>
                      <path d={activeJigsawPiece.pathD} />
                    </clipPath>
                  </defs>

                  {/* Clipped image of the puzzle piece */}
                  <image
                    href={artworkUrl}
                    x="0"
                    y="0"
                    width={BOARD_WIDTH}
                    height={BOARD_HEIGHT}
                    preserveAspectRatio="none"
                    clipPath={`url(#active-piece-preview-clip-${activeJigsawPiece.id})`}
                  />

                  {/* Interlocking boundary stroke */}
                  <path
                    d={activeJigsawPiece.pathD}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {placedPieceIds.includes(activePieceId) && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Đã ở trên bàn ghép
                  </span>
                </div>
              )}
            </div>

            {/* Action Button: [👆 Kéo thả hoặc Nhấp ô để ghép] */}
            <button
              id="btn-active-piece-action"
              type="button"
              onClick={() => handlePlaceIntoSlot(activePieceId)}
              disabled={placedPieceIds.includes(activePieceId)}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow cursor-pointer border flex items-center justify-center gap-2 ${
                placedPieceIds.includes(activePieceId)
                  ? 'bg-[#0a1626] text-slate-500 border-slate-700 cursor-default'
                  : 'bg-[#081e3a] hover:bg-[#0c2c54] border-cyan-400 text-cyan-300 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-98'
              }`}
            >
              <MousePointerClick className="w-4 h-4 text-cyan-400" />
              <span>
                {placedPieceIds.includes(activePieceId)
                  ? 'Mảnh này đã ghép xong'
                  : 'Kéo thả hoặc Nhấp ô để ghép'}
              </span>
            </button>

            {/* Observation Hint Card (GỢI Ý QUAN SÁT) */}
            <div className="w-full rounded-xl p-2.5 bg-[#081b36]/90 border border-cyan-500/30 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-black tracking-wide text-[11px] flex items-center gap-1">
                  <span>💡 GỢI Ý QUAN SÁT:</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-bold text-[10px]">
                  {activeJigsawPiece.categoryBadge}
                </span>
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed">
                {activeJigsawPiece.categoryHint}
              </div>
            </div>

            {/* Tray of Other Pieces: Các mảnh khác trong khay (Xáo trộn ngẫu nhiên) */}
            <div className="w-full pt-1">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-xs font-bold text-cyan-200">Các mảnh khác trong khay:</span>
                <span className="text-[11px] text-slate-400 italic">(Xáo trộn ngẫu nhiên)</span>
              </div>

              {/* 3-Column Grid of 9 pieces with cyan scrollbar */}
              <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto cyan-tray-scrollbar pr-1">
                {jigsawPieces.map(pieceObj => {
                  const pId = pieceObj.id;
                  const isUnlocked = effectiveUnlockedIds.includes(pId);
                  const isPlaced = placedPieceIds.includes(pId);
                  const isSelected = pId === activePieceId;

                  return (
                    <button
                      key={`tray-piece-${pId}`}
                      type="button"
                      onClick={() => {
                        audioManager.playClick();
                        setActivePieceId(pId);
                      }}
                      className={`aspect-[4/3] rounded-xl overflow-hidden border p-1 bg-[#091830] relative transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.7)] scale-105'
                          : isPlaced
                          ? 'border-emerald-600/60 opacity-60'
                          : isUnlocked
                          ? 'border-cyan-500/50 hover:border-cyan-300'
                          : 'border-slate-800 opacity-40'
                      }`}
                    >
                      <svg
                        viewBox={`${pieceObj.bounds.minX - 6} ${pieceObj.bounds.minY - 6} ${
                          pieceObj.bounds.maxX - pieceObj.bounds.minX + 12
                        } ${pieceObj.bounds.maxY - pieceObj.bounds.minY + 12}`}
                        className="w-full h-full"
                      >
                        <defs>
                          <clipPath id={`tray-clip-${pieceObj.id}`}>
                            <path d={pieceObj.pathD} />
                          </clipPath>
                        </defs>

                        {/* If unlocked, show colorful artwork */}
                        {isUnlocked ? (
                          <>
                            <image
                              href={artworkUrl}
                              x="0"
                              y="0"
                              width={BOARD_WIDTH}
                              height={BOARD_HEIGHT}
                              preserveAspectRatio="none"
                              clipPath={`url(#tray-clip-${pieceObj.id})`}
                            />
                            <path d={pieceObj.pathD} fill="none" stroke="#06b6d4" strokeWidth="2" />
                          </>
                        ) : (
                          /* Locked piece silhouette */
                          <path d={pieceObj.pathD} fill="#0d1f38" stroke="#1e3a5f" strokeWidth="2" />
                        )}
                      </svg>

                      {/* Status indicator on thumbnail */}
                      {isPlaced ? (
                        <span className="absolute bottom-0.5 right-0.5 bg-emerald-950/90 text-emerald-300 text-[8px] font-bold px-1 rounded">
                          ✓
                        </span>
                      ) : !isUnlocked ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Lock className="w-3 h-3 text-slate-500" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: 3x3 CARVED WOODEN JIGSAW BOARD ================= */}
        <div className="lg:col-span-8 flex justify-center items-center w-full">
          <div className="w-full max-w-[640px] aspect-[1024/683] rounded-3xl overflow-hidden p-3 sm:p-4 bg-[#502611] border-4 border-[#3a1a0b] shadow-[inset_0_12px_35px_rgba(0,0,0,0.9),0_20px_50px_rgba(0,0,0,0.85)] relative">
            {/* The 3x3 Wooden Planks Board */}
            <div className="w-full h-full rounded-2xl overflow-hidden wood-planks-board relative">
              <svg
                viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
                className="w-full h-full"
              >
                <defs>
                  {/* SVG Clipping Paths for all 9 puzzle pieces */}
                  {jigsawPieces.map(piece => (
                    <clipPath key={`clip-${piece.id}`} id={`jigsaw-cell-clip-${piece.id}`}>
                      <path d={piece.pathD} />
                    </clipPath>
                  ))}
                </defs>

                {/* Render the 9 Interlocking Puzzle Sockets / Placed Pieces */}
                {jigsawPieces.map(piece => {
                  const isPlaced = placedPieceIds.includes(piece.id);
                  const isShaking = shakingSlotId === piece.id;

                  return (
                    <g
                      key={`jigsaw-slot-${piece.id}`}
                      id={`jigsaw-slot-${piece.id}`}
                      onClick={() => handlePlaceIntoSlot(piece.id)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handleDropOnSlot(e, piece.id)}
                      className={`cursor-pointer transition-all ${
                        isShaking ? 'animate-shake-wrong' : ''
                      }`}
                    >
                      {isPlaced ? (
                        /* PLACED PIECE: Colorful slice snapped into the wooden socket */
                        <g className="animate-jigsaw-snap">
                          <image
                            href={artworkUrl}
                            x="0"
                            y="0"
                            width={BOARD_WIDTH}
                            height={BOARD_HEIGHT}
                            preserveAspectRatio="none"
                            clipPath={`url(#jigsaw-cell-clip-${piece.id})`}
                          />
                          {/* Subtle golden bevel seam */}
                          <path
                            d={piece.pathD}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="1.5"
                            opacity="0.4"
                          />
                        </g>
                      ) : (
                        /* EMPTY SLOT: Sunken dark carved wooden socket with authentic interlocking teeth */
                        <g>
                          {/* Dark carved groove fill */}
                          <path
                            d={piece.pathD}
                            fill="#1a0903"
                            stroke={isShaking ? '#ef4444' : '#331507'}
                            strokeWidth={isShaking ? '3' : '2.5'}
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Compact Hint Bar */}
      <div className="relative z-10 w-full max-w-lg mx-auto rounded-full bg-[#06142a]/85 border border-cyan-500/40 px-4 py-2 flex items-center justify-center gap-2 text-cyan-300 text-xs shadow mt-2">
        <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Quan sát răng cưa và chi tiết tranh, Kéo thả hoặc Nhấp ô để ghép</span>
      </div>

      {/* ================= CENTERED SUCCESS PLACEMENT POPUP OVERLAY ================= */}
      {showPlacementSuccessPopup && (
        <div
          id="puzzle-placement-success-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            id="puzzle-placement-success-popup"
            className="relative w-full max-w-md sm:max-w-lg rounded-3xl bg-[#0a1532] border-2 border-cyan-400 p-6 sm:p-8 text-center flex flex-col items-center gap-5 shadow-[0_0_50px_rgba(6,182,212,0.45),0_20px_60px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tech Corner Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                setShowPlacementSuccessPopup(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Đóng popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Trophy / Sparkles Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-cyan-400/20 to-emerald-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300 animate-pulse" />
            </div>

            {/* Main Title */}
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide leading-snug drop-shadow-md">
              🎉 ĐÃ GHÉP HÌNH THÀNH CÔNG VÀO KHUNG TRANH
            </h3>

            {/* Dynamic Progress Indicator */}
            <div className="w-full flex flex-col items-center gap-2 py-1">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-[#040e24] border border-cyan-400/70 shadow-inner">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300">Tiến độ:</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-amber-300 drop-shadow">
                  {Math.min(9, Math.max(placedPieceIds.length, popupPlacedCount || placedPieceIds.length))}/9 mảnh
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full max-w-xs h-3 rounded-full bg-[#050f24] border border-cyan-500/40 overflow-hidden shadow-inner p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-400 transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                  style={{
                    width: `${Math.min(100, (Math.min(9, Math.max(placedPieceIds.length, popupPlacedCount || placedPieceIds.length)) / 9) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Primary Action Button: Glowing Yellow */}
            <button
              id="btn-continue-face-challenge-popup"
              type="button"
              onClick={handleContinueFromPopup}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.65)] hover:shadow-[0_0_50px_rgba(245,158,11,0.9)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border-2 border-yellow-100 flex items-center justify-center gap-2 mt-1"
            >
              <span>TIẾP TỤC THỬ THÁCH KHUÔN MẶT »</span>
            </button>
          </div>
        </div>
      )}

      {/* Victory Notification when all 9 pieces are placed */}
      {isAllSolved && (
        <div className="relative z-10 mt-3 p-3 rounded-2xl bg-[#081b36]/95 border-2 border-cyan-400 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-cyan-100">
              Xuất sắc! Em đã hoàn thành 9/9 mảnh ghép của bức tranh bí ẩn!
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCertificate && (
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  onOpenCertificate();
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow hover:brightness-110 cursor-pointer"
              >
                Nhận Giấy Khen FPT
              </button>
            )}

            {onContinueNextRound && (
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  onContinueNextRound();
                }}
                className="px-4 py-1.5 rounded-xl bg-[#0c2c54] hover:bg-[#133f78] text-cyan-300 font-bold text-xs border border-cyan-400 shadow cursor-pointer"
              >
                Tiếp tục
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleBoard;
