import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { audioManager } from '../services/audio/AudioManager';

interface ResetConfirmModalProps {
  isOpen: boolean;
  unlockedCount?: number;
  totalPieces?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  warningText?: string;
  confirmText?: string;
  confirmIcon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const ResetConfirmModalComponent: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  unlockedCount = 0,
  totalPieces = 9,
  title = 'Bắt Đầu Lại Từ Đầu?',
  subtitle = 'XÁC NHẬN CHƠI LẠI',
  description,
  warningText,
  confirmText = 'Đồng Ý Chơi Lại',
  confirmIcon,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-[#0a152e]/95 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-5 animate-in zoom-in-95 duration-200 text-slate-100 overflow-hidden">
        {/* Corner HUD brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => {
            audioManager.playClick();
            onCancel();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <RotateCcw className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">
              {subtitle}
            </span>
            <h3 className="text-lg font-black text-white font-tech">
              {title}
            </h3>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="p-4 rounded-2xl bg-[#070e1f] border border-amber-500/30 space-y-2 text-sm text-slate-200 leading-relaxed">
          <p>
            {description || (
              <>
                Bạn có chắc chắn muốn <span className="font-bold text-amber-300">đặt lại toàn bộ trò chơi</span> từ Vòng 1 không?
              </>
            )}
          </p>
          <div className="flex items-center gap-2 text-xs text-amber-400/90 pt-1 border-t border-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {warningText || `Tiến trình hiện tại (${unlockedCount}/${totalPieces} mảnh ghép đã mở) sẽ được thiết lập lại từ đầu.`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onCancel();
            }}
            className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-sm transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            id="confirm-reset-btn"
            type="button"
            onClick={() => {
              audioManager.playClick();
              onConfirm();
            }}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide border border-rose-400/50"
          >
            {confirmIcon || <RotateCcw className="w-4 h-4" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ResetConfirmModal = React.memo(ResetConfirmModalComponent);
