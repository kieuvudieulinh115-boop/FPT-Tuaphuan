import { PuzzlePiece } from '../types';

// Helper to create beautiful high-tech SVG illustrations for the 8 puzzle sections
function createPuzzleSliceSVG(index: number, title: string, accentColor: string, detailSvg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#091428" />
        <stop offset="50%" stop-color="#0d2342" />
        <stop offset="100%" stop-color="#050b14" />
      </linearGradient>
      <linearGradient id="glow${index}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#00f0ff" stop-opacity="0.3" />
      </linearGradient>
      <pattern id="grid${index}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e3a5f" stroke-width="0.75" stroke-opacity="0.4" />
      </pattern>
    </defs>
    <rect width="400" height="300" fill="url(#bgGrad${index})" />
    <rect width="400" height="300" fill="url(#grid${index})" />
    
    <!-- Tech Frame Borders -->
    <rect x="12" y="12" width="376" height="276" rx="14" fill="none" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.5" />
    <path d="M 12 40 L 40 12 M 360 12 L 388 40 M 12 260 L 40 288 M 360 288 L 388 260" stroke="${accentColor}" stroke-width="2" />
    
    <!-- Center Piece Graphics -->
    <g transform="translate(40, 30)">
      ${detailSvg}
    </g>
    
    <!-- Piece Badge -->
    <rect x="24" y="24" width="48" height="28" rx="8" fill="#000" fill-opacity="0.6" stroke="${accentColor}" stroke-width="1.5" />
    <text x="48" y="43" fill="${accentColor}" font-family="Space Grotesk, sans-serif" font-weight="bold" font-size="14" text-anchor="middle">#${index}</text>
    
    <!-- Piece Title -->
    <rect x="24" y="246" width="352" height="32" rx="8" fill="#030712" fill-opacity="0.8" stroke="#1e293b" stroke-width="1" />
    <circle cx="42" cy="262" r="5" fill="${accentColor}" />
    <text x="56" y="267" fill="#f8fafc" font-family="Plus Jakarta Sans, sans-serif" font-weight="bold" font-size="13">${title}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_PUZZLE_PIECES: PuzzlePiece[] = [
  {
    id: 1,
    position: 1,
    unlocked: false,
    label: 'Bộ vi xử lý Quantum & Mắt thần cảm biến',
    imageUrl: createPuzzleSliceSVG(
      1,
      'Bộ vi xử lý Quantum & Quantum Core',
      '#38bdf8',
      `<circle cx="160" cy="100" r="55" fill="#0369a1" fill-opacity="0.25" stroke="#38bdf8" stroke-width="3" />
       <circle cx="160" cy="100" r="35" fill="#0284c7" fill-opacity="0.4" stroke="#7dd3fc" stroke-width="2" />
       <circle cx="160" cy="100" r="15" fill="#38bdf8" />
       <path d="M 160 30 L 160 170 M 90 100 L 230 100" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,4" />
       <rect x="135" y="75" width="50" height="50" rx="6" fill="none" stroke="#67e8f9" stroke-width="2" />
       <path d="M 60 70 L 100 70 M 220 70 L 260 70 M 60 130 L 100 130 M 220 130 L 260 130" stroke="#38bdf8" stroke-width="2" />`
    )
  },
  {
    id: 2,
    position: 2,
    unlocked: false,
    label: 'Cánh thu Năng lượng Mặt Trời',
    imageUrl: createPuzzleSliceSVG(
      2,
      'Tấm pin Năng lượng Mặt Trời',
      '#f59e0b',
      `<polygon points="70,50 250,30 230,160 50,140" fill="#1e3a8a" stroke="#f59e0b" stroke-width="2.5" />
       <line x1="130" y1="43" x2="110" y2="153" stroke="#fbbf24" stroke-width="1.5" />
       <line x1="190" y1="36" x2="170" y2="146" stroke="#fbbf24" stroke-width="1.5" />
       <line x1="60" y1="95" x2="240" y2="75" stroke="#fbbf24" stroke-width="1.5" />
       <circle cx="280" cy="50" r="28" fill="#fbbf24" fill-opacity="0.8" />
       <circle cx="280" cy="50" r="38" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,3" />`
    )
  },
  {
    id: 3,
    position: 3,
    unlocked: false,
    label: 'Cánh tay Cơ điện tử Robotics',
    imageUrl: createPuzzleSliceSVG(
      3,
      'Cánh tay Robot Cơ điện tử',
      '#10b981',
      `<path d="M 50 160 L 120 120 L 180 140 L 250 80" fill="none" stroke="#10b981" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
       <circle cx="120" cy="120" r="16" fill="#047857" stroke="#34d399" stroke-width="3" />
       <circle cx="180" cy="140" r="14" fill="#047857" stroke="#34d399" stroke-width="3" />
       <circle cx="250" cy="80" r="10" fill="#6ee7b7" />
       <path d="M 250 80 L 275 60 M 250 80 L 275 100" stroke="#34d399" stroke-width="5" stroke-linecap="round" />`
    )
  },
  {
    id: 4,
    position: 4,
    unlocked: false,
    label: 'Module Thí nghiệm Sinh học Vũ trụ',
    imageUrl: createPuzzleSliceSVG(
      4,
      'Module Sinh học Không gian',
      '#ec4899',
      `<rect x="100" y="45" width="120" height="130" rx="20" fill="#4c0519" fill-opacity="0.5" stroke="#ec4899" stroke-width="3" />
       <path d="M 160 150 C 130 110, 190 90, 160 65" fill="none" stroke="#34d399" stroke-width="4" stroke-linecap="round" />
       <circle cx="140" cy="115" r="12" fill="#10b981" fill-opacity="0.8" />
       <circle cx="180" cy="85" r="10" fill="#10b981" fill-opacity="0.8" />
       <ellipse cx="160" cy="155" rx="35" ry="12" fill="#065f46" stroke="#34d399" stroke-width="2" />
       <circle cx="125" cy="70" r="4" fill="#f472b6" />
       <circle cx="195" cy="140" r="4" fill="#f472b6" />`
    )
  },
  {
    id: 5,
    position: 5,
    unlocked: false,
    label: 'Vệ tinh Viễn thông & Quả cầu Xanh',
    imageUrl: createPuzzleSliceSVG(
      5,
      'Trái Đất Xanh & Vệ tinh',
      '#6366f1',
      `<circle cx="160" cy="110" r="60" fill="#1e1b4b" stroke="#6366f1" stroke-width="3" />
       <path d="M 120 100 Q 140 70 170 85 Q 190 100 180 130 Q 150 150 130 130 Z" fill="#059669" fill-opacity="0.7" />
       <ellipse cx="160" cy="110" rx="90" ry="25" fill="none" stroke="#818cf8" stroke-width="2" stroke-dasharray="6,4" />
       <rect x="230" y="98" width="16" height="14" rx="3" fill="#e0e7ff" />
       <line x1="220" y1="105" x2="256" y2="105" stroke="#38bdf8" stroke-width="3" />`
    )
  },
  {
    id: 6,
    position: 6,
    unlocked: false,
    label: 'Tàu Con Thoi Khám Phá Vũ Trụ',
    imageUrl: createPuzzleSliceSVG(
      6,
      'Phi Thuyền Thám Hiểm Không Gian',
      '#8b5cf6',
      `<path d="M 160 30 L 205 140 L 175 130 L 175 160 L 145 160 L 145 130 L 115 140 Z" fill="#e2e8f0" stroke="#8b5cf6" stroke-width="2.5" />
       <ellipse cx="160" cy="75" rx="10" ry="16" fill="#0284c7" />
       <polygon points="145,160 175,160 160,195" fill="#f97316" />
       <polygon points="150,160 170,160 160,185" fill="#fde047" />`
    )
  },
  {
    id: 7,
    position: 7,
    unlocked: false,
    label: 'Kính Viễn Vọng Khúc Xạ James Webb',
    imageUrl: createPuzzleSliceSVG(
      7,
      'Kính Viễn Vọng Quang Học STEM',
      '#06b6d4',
      `<polygon points="160,35 185,50 185,80 160,95 135,80 135,50" fill="#f59e0b" stroke="#fbbf24" stroke-width="2" />
       <polygon points="205,60 230,75 230,105 205,120 180,105 180,75" fill="#f59e0b" stroke="#fbbf24" stroke-width="2" />
       <polygon points="115,60 140,75 140,105 115,120 90,105 90,75" fill="#f59e0b" stroke="#fbbf24" stroke-width="2" />
       <polygon points="160,110 185,125 185,155 160,170 135,155 135,125" fill="#f59e0b" stroke="#fbbf24" stroke-width="2" />
       <circle cx="160" cy="102" r="5" fill="#00f0ff" />`
    )
  },
  {
    id: 8,
    position: 8,
    unlocked: false,
    label: 'Bàn phím đèn LED RGB đa sắc màu',
    imageUrl: createPuzzleSliceSVG(
      8,
      'Bàn phím RGB STEM',
      '#eab308',
      `<circle cx="160" cy="95" r="50" fill="#ca8a04" stroke="#fde047" stroke-width="4" />
       <circle cx="160" cy="95" r="40" fill="#eab308" stroke="#fef08a" stroke-width="2" stroke-dasharray="4,4" />
       <polygon points="160,65 169,83 189,86 174,100 178,120 160,110 142,120 146,100 131,86 151,83" fill="#ffffff" />
       <path d="M 135 140 L 115 190 L 140 175 L 160 190 L 148 140" fill="#dc2626" />
       <path d="M 185 140 L 205 190 L 180 175 L 160 190 L 172 140" fill="#b91c1c" />`
    )
  },
  {
    id: 9,
    position: 9,
    unlocked: false,
    label: 'Chuột quang & Góc bàn thực hành STEM',
    imageUrl: createPuzzleSliceSVG(
      9,
      'Chuột quang & Trạm điều khiển',
      '#ec4899',
      `<ellipse cx="160" cy="100" rx="35" ry="50" fill="#0f172a" stroke="#ec4899" stroke-width="3" />
       <line x1="160" y1="50" x2="160" y2="85" stroke="#ec4899" stroke-width="3" />
       <circle cx="160" cy="85" r="8" fill="#38bdf8" />
       <path d="M 130 90 Q 160 120 190 90" stroke="#f43f5e" stroke-width="2" fill="none" />`
    )
  }
];
