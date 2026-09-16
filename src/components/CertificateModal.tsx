import React, { useRef } from 'react';
import { Award, Printer, Download, X, Sparkles, Star, Calendar, School, CheckCircle2 } from 'lucide-react';
import { TeacherSettingsConfig, PuzzlePiece } from '../types';
import { audioManager } from '../services/audio/AudioManager';

interface CertificateModalProps {
  isOpen: boolean;
  studentName: string;
  settings: TeacherSettingsConfig;
  puzzlePieces: PuzzlePiece[];
  completedAt?: number;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  studentName,
  settings,
  puzzlePieces,
  completedAt = Date.now(),
  onClose
}) => {
  const certificateRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const formattedDate = new Date(completedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handlePrint = () => {
    audioManager.playClick();
    window.print();
  };

  // Download high-resolution certificate canvas
  const handleDownload = () => {
    audioManager.playClick();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 850);

    // Decorative Borders
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 1160, 810);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 1128, 778);

    // Header School Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 22px "Be Vietnam Pro", sans-serif';
    ctx.fillText(settings.schoolName || 'Trường Tiểu học STEM Tân Tiến', 600, 95);

    ctx.fillStyle = '#d97706';
    ctx.font = '500 16px "Be Vietnam Pro", sans-serif';
    ctx.fillText('★ ★ ★ Bảng vàng vinh danh thành tích học tập & sáng tạo STEM ★ ★ ★', 600, 130);

    // Title
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 44px "Be Vietnam Pro", sans-serif';
    ctx.fillText('GIẤY KHEN', 600, 200);

    ctx.fillStyle = '#475569';
    ctx.font = 'italic 18px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Chứng nhận danh hiệu "Nhà Thám Hiểm STEM Xuất Sắc" được trao tặng cho người chơi:', 600, 255);

    // Student Name Highlight
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 40px "Be Vietnam Pro", sans-serif';
    ctx.fillText(studentName, 600, 325);

    // Achievement text
    ctx.fillStyle = '#334155';
    ctx.font = '18px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Đã hoàn thành xuất sắc các thử thách nhận diện khuôn mặt và câu hỏi STEM trong:', 600, 385);

    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 22px "Be Vietnam Pro", sans-serif';
    ctx.fillText('“Face Challenge – Thử thách khuôn mặt”', 600, 425);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 18px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Thành tích: Ghép trọn vẹn 9/9 mảnh bức tranh bí ẩn (đạt 100%)', 600, 470);

    // Draw Gold Badge in center bottom
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(600, 565, 46, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 15px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Xuất sắc', 600, 560);
    ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
    ctx.fillText('STEM 2026', 600, 580);

    // Bottom Date & Signatures
    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = '16px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Ngày hoàn thành: ${formattedDate}`, 120, 710);
    ctx.fillText('Ban tổ chức Face Challenge STEM', 120, 740);

    ctx.textAlign = 'right';
    ctx.fillText('Xác nhận chuyên môn:', 1080, 710);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 17px "Be Vietnam Pro", sans-serif';
    ctx.fillText(settings.teacherName || 'Giáo viên chủ nhiệm', 1080, 745);
    ctx.font = 'italic 14px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('(Ký tên & đóng dấu)', 1080, 770);

    // Trigger download
    const link = document.createElement('a');
    link.download = `Giay_Khen_${studentName.replace(/\s+/g, '_')}_FaceChallenge.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-400/40 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] my-auto overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span className="font-tech font-bold text-slate-200 text-lg">
              GIẤY KHEN VINH DANH NGƯỜI CHƠI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-certificate-btn"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>In Giấy Khen</span>
            </button>
            <button
              id="download-certificate-btn"
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-md cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Tệp Ảnh / PDF</span>
            </button>
            <button
              id="close-certificate-btn"
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Visible Certificate Area */}
        <div className="p-4 sm:p-8 bg-slate-950/50 flex justify-center">
          <div
            id="printable-certificate"
            ref={certificateRef}
            className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border-8 border-sky-600 outline outline-4 outline-amber-400 shadow-2xl relative"
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 text-amber-500 font-serif text-2xl">✤</div>
            <div className="absolute top-3 right-3 text-amber-500 font-serif text-2xl">✤</div>
            <div className="absolute bottom-3 left-3 text-amber-500 font-serif text-2xl">✤</div>
            <div className="absolute bottom-3 right-3 text-amber-500 font-serif text-2xl">✤</div>

            {/* School Header */}
            <div className="text-center border-b-2 border-slate-200 pb-4 mb-6">
              <p className="text-xs sm:text-sm font-bold tracking-wider text-slate-700">
                {settings.schoolName || 'Trường Tiểu học STEM Tân Tiến'}
              </p>
              <p className="text-xs text-amber-700 font-semibold tracking-normal mt-1">
                ★ ★ ★ Bảng vàng vinh danh thành tích học tập & sáng tạo STEM ★ ★ ★
              </p>
            </div>

            {/* Certificate Title */}
            <div className="text-center space-y-2 mb-6">
              <h2
                className="text-3xl sm:text-5xl font-black text-sky-900 tracking-normal"
                style={{ fontFamily: "'Be Vietnam Pro', serif" }}
              >
                GIẤY KHEN
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-600 italic">
                Chứng nhận danh hiệu "Nhà Thám Hiểm STEM Xuất Sắc" được trao tặng cho người chơi:
              </p>
            </div>

            {/* Student Name */}
            <div className="text-center my-6 py-2.5 border-y-2 border-amber-300/80 bg-amber-50/50">
              <span
                className="text-2xl sm:text-4xl font-bold text-rose-600 tracking-normal"
                style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
              >
                {studentName}
              </span>
            </div>

            {/* Description */}
            <div className="text-center space-y-2.5 max-w-xl mx-auto my-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Đã hoàn thành xuất sắc các thử thách nhận diện khuôn mặt và câu hỏi STEM trong chương trình tương tác:
              </p>
              <p className="font-bold text-sky-800 text-sm sm:text-base">
                “Face Challenge – Thử thách khuôn mặt”
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Hoàn thành xuất sắc: Ghép trọn vẹn 9/9 mảnh bức tranh bí ẩn (đạt 100%).</span>
              </div>
            </div>

            {/* Center Gold Stamp */}
            <div className="flex justify-center my-4">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500 bg-amber-100 flex flex-col items-center justify-center text-amber-900 shadow-md">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500 mb-0.5" />
                <span className="text-[11px] font-bold">Xuất sắc</span>
                <span className="text-[9px] font-bold">STEM 2026</span>
              </div>
            </div>

            {/* Bottom Signatures & Date */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-slate-200 text-xs sm:text-sm text-slate-600 mt-6">
              <div>
                <p className="font-semibold text-slate-700">Ngày hoàn thành:</p>
                <p className="font-bold text-slate-900 mt-1">{formattedDate}</p>
                <p className="text-[11px] text-slate-500 mt-4">Ban tổ chức Face Challenge STEM</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-700">Xác nhận chuyên môn:</p>
                <p className="font-bold text-slate-900 mt-1">{settings.teacherName || 'Giáo viên chủ nhiệm'}</p>
                <p className="text-[11px] text-slate-500 mt-4">(Ký tên & đóng dấu)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
