import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle, XCircle, ArrowRight, RotateCcw, Award, Lightbulb, Box } from 'lucide-react';
import { Question } from '../types';
import { audioManager } from '../services/audio/AudioManager';

interface QuestionViewProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  currentPieceNumber: number;
  onCorrectAnswer: () => void;
  onWrongAnswer: () => void;
}

const QuestionViewComponent: React.FC<QuestionViewProps> = ({
  question,
  questionIndex,
  totalQuestions,
  currentPieceNumber,
  onCorrectAnswer,
  onWrongAnswer
}) => {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }> = [
    { key: 'A', label: question.options.A },
    { key: 'B', label: question.options.B },
    { key: 'C', label: question.options.C },
    { key: 'D', label: question.options.D }
  ];

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (answerState !== 'idle') return;
    audioManager.playClick();
    setSelectedOption(key);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || answerState !== 'idle') return;

    if (selectedOption === question.correctOption) {
      setAnswerState('correct');
      audioManager.playPuzzleUnlock();

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      setAnswerState('wrong');
      audioManager.playFail();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full bg-[#0a152e]/90 backdrop-blur-xl border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.25)] text-slate-100 relative overflow-hidden transform-gpu preserve-3d"
      >
        {/* Hologram sheen scanline */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-full animate-holo-sheen pointer-events-none" />

        {/* Sci-Fi HUD Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm pointer-events-none" />

        {/* Question Header */}
        <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-cyan-900/60">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.1, rotateZ: 5 }}
              className="p-2.5 bg-cyan-950/70 border border-cyan-400/50 rounded-xl text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
            >
              <HelpCircle className="w-5 h-5" />
            </motion.div>
            <div>
              <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase font-mono">
                {question.subject || 'CÂU HỎI STEM'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white font-tech">
                Câu số {questionIndex + 1} / {totalQuestions}
              </h3>
            </div>
          </div>

          {/* Target Piece Reward Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-sm"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Mở khóa: Mảnh #{currentPieceNumber}</span>
          </motion.div>
        </div>

        {/* Question Content */}
        <div className="my-5">
          <p className="text-base sm:text-xl font-bold text-slate-100 leading-relaxed">
            {question.content}
          </p>
        </div>

        {/* Options List A, B, C, D */}
        <div className="space-y-3 my-6">
          {options.map(({ key, label }) => {
            const isSelected = selectedOption === key;
            const isCorrectChoice = answerState !== 'idle' && key === question.correctOption;
            const isWrongChoice = answerState === 'wrong' && isSelected;

            return (
              <motion.button
                key={key}
                type="button"
                disabled={answerState !== 'idle'}
                onClick={() => handleSelectOption(key)}
                whileHover={answerState === 'idle' ? { x: 6, scale: 1.015 } : {}}
                whileTap={answerState === 'idle' ? { scale: 0.98 } : {}}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 cursor-pointer transform-gpu ${
                  isCorrectChoice
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                    : isWrongChoice
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 font-semibold shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 font-medium ring-2 ring-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-[#050c1b] border-cyan-950 hover:bg-cyan-950/40 hover:border-cyan-500/50 text-slate-300 hover:text-white'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-tech shrink-0 transition-colors border ${
                    isCorrectChoice
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : isWrongChoice
                      ? 'bg-rose-500 text-white border-rose-400'
                      : isSelected
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                      : 'bg-slate-900 text-cyan-300 border-cyan-800'
                  }`}
                >
                  {key}
                </div>
                <span className="text-sm sm:text-base font-medium flex-1">
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Action Footer */}
        {answerState === 'idle' && (
          <div className="pt-4 border-t border-cyan-900/60 flex justify-end">
            <motion.button
              id="submit-answer-btn"
              type="button"
              disabled={!selectedOption}
              onClick={handleConfirmAnswer}
              whileHover={selectedOption ? { scale: 1.03, y: -2 } : {}}
              whileTap={selectedOption ? { scale: 0.97 } : {}}
              className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-base transition-all shadow-sm cursor-pointer uppercase tracking-wider ${
                selectedOption
                  ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:brightness-110'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <span>XÁC NHẬN ĐÁP ÁN</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}

        {/* Correct State */}
        {answerState === 'correct' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-950/70 border border-emerald-500/50 rounded-2xl p-5 text-center space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-extrabold text-xl font-tech">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
              <span>🎉 CHÍNH XÁC! NHẬN 1 LƯỢT CHỌN MẢNH GHÉP</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200">
              {question.explanation ? (
                <span className="block mb-1 font-semibold">{question.explanation}</span>
              ) : null}
              Toàn bộ các mảnh ghép còn lại đã sẵn sàng! Bạn hãy sang Bàn Ghép Tranh và tự do chọn 1 mảnh bất kỳ mà bạn nhận diện được để ghép vào khung tranh nhé!
            </p>
            <motion.button
              id="claim-piece-btn"
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                audioManager.playClick();
                onCorrectAnswer();
              }}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.5)] cursor-pointer transition-transform uppercase tracking-wide"
            >
              <Box className="w-5 h-5" />
              <span>SANG BÀN GHÉP TRANH ĐỂ CHỌN 1 MẢNH GHÉP YÊU THÍCH</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Wrong State */}
        {answerState === 'wrong' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-950/70 border border-rose-500/50 rounded-2xl p-5 text-center space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 text-rose-300 font-extrabold text-xl font-tech">
              <XCircle className="w-7 h-7 text-rose-400" />
              <span>❌ CHƯA CHÍNH XÁC!</span>
            </div>
            <p className="text-xs sm:text-sm text-rose-200">
              Chưa nhận được mảnh ghép lần này. Theo quy định trò chơi, bạn hãy hoàn thành lại thử thách khuôn mặt để có lượt trả lời lại nhé!
            </p>
            {question.explanation && (
              <div className="text-left bg-[#050c1b] p-3 rounded-xl border border-rose-500/40 text-xs text-slate-300 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Gợi ý: {question.explanation}</span>
              </div>
            )}
            <motion.button
              id="retry-after-wrong-btn"
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                audioManager.playClick();
                onWrongAnswer();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-base rounded-xl shadow-md cursor-pointer transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              <span>QUAY LẠI THỬ THÁCH KHUÔN MẶT</span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export const QuestionView = React.memo(QuestionViewComponent);
