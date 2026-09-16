// High-fidelity vector artwork recreating the uploaded STEM mystery puzzle
// Clean valid SVG XML for 100% browser rendering reliability across SVG clipPaths and image tags

export const STEM_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 683" width="1024" height="683">
  <defs>
    <filter id="stem-shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="4" dy="8" stdDeviation="4" flood-color="#000000" flood-opacity="0.35" />
    </filter>
    <filter id="badge-shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="3" dy="6" stdDeviation="3" flood-color="#000000" flood-opacity="0.3" />
    </filter>
    <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0" />
      <stop offset="50%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="potion-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f472b6" />
      <stop offset="50%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>
  </defs>

  <rect width="1024" height="683" fill="#ffffff" />

  <!-- 1. LETTER 'S' (Orange with Atomic Model) -->
  <g id="letter-S" filter="url(#stem-shadow)">
    <path d="M 195,58 C 170,40 120,40 78,65 C 38,90 28,140 40,195 C 50,240 85,270 145,290 C 190,305 200,325 195,350 C 190,380 155,400 110,395 C 68,390 40,360 25,325 L 2,360 C 25,410 70,440 125,445 C 185,450 240,418 250,355 C 260,290 220,250 155,230 C 112,215 100,198 105,170 C 110,140 140,118 175,122 C 205,125 228,142 242,170 Z" fill="#000000" />
    <path d="M 188,48 C 165,30 115,30 72,55 C 32,80 22,130 35,185 C 45,230 80,260 140,280 C 185,295 195,315 190,340 C 185,370 150,390 105,385 C 62,380 35,350 20,315 L 2,350 C 22,400 65,430 120,435 C 180,440 232,408 242,345 C 252,280 212,240 148,220 C 105,205 92,188 98,160 C 102,130 132,108 168,112 C 198,115 220,132 235,160 Z"
          fill="#f15a24" stroke="#000000" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" />

    <g transform="translate(112, 335) scale(0.75)">
      <ellipse cx="0" cy="0" rx="55" ry="20" fill="none" stroke="#ffffff" stroke-width="4.5" transform="rotate(-30)" />
      <ellipse cx="0" cy="0" rx="55" ry="20" fill="none" stroke="#ffffff" stroke-width="4.5" transform="rotate(30)" />
      <ellipse cx="0" cy="0" rx="55" ry="20" fill="none" stroke="#ffffff" stroke-width="4.5" transform="rotate(90)" />
      <circle cx="0" cy="0" r="10" fill="#ffffff" />
      <circle cx="0" cy="0" r="5" fill="#f15a24" />
      <circle cx="48" cy="-18" r="4.5" fill="#ffffff" />
      <circle cx="-42" cy="-22" r="4.5" fill="#ffffff" />
      <circle cx="0" cy="52" r="4.5" fill="#ffffff" />
      <circle cx="-35" cy="25" r="3.5" fill="#ffffff" />
    </g>
  </g>

  <!-- DOT 1 -->
  <g filter="url(#stem-shadow)">
    <circle cx="232" cy="180" r="22" fill="#f15a24" stroke="#000000" stroke-width="10" />
    <circle cx="226" cy="174" r="5" fill="#ffffff" opacity="0.6" />
  </g>

  <!-- 2. LETTER 'T' (Green with Arrow) -->
  <g id="letter-T" filter="url(#stem-shadow)">
    <path d="M 268,48 L 418,48 C 425,48 430,53 430,60 L 430,122 C 430,128 425,134 418,134 L 372,134 L 372,428 C 372,438 364,446 354,446 L 312,446 C 302,446 294,438 294,428 L 294,134 L 258,134 C 250,134 246,128 246,122 L 246,60 C 246,53 250,48 258,48 Z" fill="#000000" transform="translate(8, 8)" />
    <path d="M 268,40 L 418,40 C 425,40 430,45 430,52 L 430,115 C 430,122 425,128 418,128 L 372,128 L 372,420 C 372,430 364,438 354,438 L 312,438 C 302,438 294,430 294,420 L 294,128 L 258,128 C 250,128 246,122 246,115 L 246,52 C 246,45 250,40 258,40 Z"
          fill="#56b949" stroke="#000000" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" />
    <g transform="translate(333, 385)">
      <polygon points="0,-35 22,-10 10,-10 10,25 -10,25 -10,-10 -22,-10" fill="#2d6a25" transform="translate(3, 3)" />
      <polygon points="0,-35 22,-10 10,-10 10,25 -10,25 -10,-10 -22,-10" fill="#ffffff" />
    </g>
  </g>

  <!-- DOT 2 -->
  <g filter="url(#stem-shadow)">
    <circle cx="388" cy="180" r="22" fill="#56b949" stroke="#000000" stroke-width="10" />
    <circle cx="382" cy="174" r="5" fill="#ffffff" opacity="0.6" />
  </g>

  <!-- 3. LETTER 'E' (Royal Blue with Mechanical Gear) -->
  <g id="letter-E" filter="url(#stem-shadow)">
    <path d="M 432,48 L 610,48 C 618,48 622,54 622,60 L 622,120 C 622,126 618,132 610,132 L 512,132 L 512,192 L 590,192 C 598,192 602,198 602,204 L 602,260 C 602,266 598,272 590,272 L 512,272 L 512,354 L 612,354 C 620,354 624,360 624,366 L 624,428 C 624,434 620,440 612,440 L 432,440 C 422,440 416,434 416,424 L 416,64 C 416,54 422,48 432,48 Z" fill="#000000" transform="translate(8, 8)" />
    <path d="M 432,40 L 610,40 C 618,40 622,46 622,52 L 622,112 C 622,118 618,124 610,124 L 512,124 L 512,185 L 590,185 C 598,185 602,191 602,197 L 602,253 C 602,259 598,265 590,265 L 512,265 L 512,346 L 612,346 C 620,346 624,352 624,358 L 624,420 C 624,426 620,432 612,432 L 432,432 C 422,432 416,426 416,416 L 416,56 C 416,46 422,40 432,40 Z"
          fill="#1573ba" stroke="#000000" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" />
    <g transform="translate(465, 230)">
      <circle cx="0" cy="0" r="32" fill="#ffffff" />
      <rect x="-7" y="-42" width="14" height="84" fill="#ffffff" rx="2" />
      <rect x="-42" y="-7" width="84" height="14" fill="#ffffff" rx="2" />
      <rect x="-7" y="-42" width="14" height="84" fill="#ffffff" rx="2" transform="rotate(45)" />
      <rect x="-7" y="-42" width="14" height="84" fill="#ffffff" rx="2" transform="rotate(-45)" />
      <circle cx="0" cy="0" r="16" fill="#1573ba" stroke="#000000" stroke-width="2" />
    </g>
  </g>

  <!-- DOT 3 -->
  <g filter="url(#stem-shadow)">
    <circle cx="652" cy="180" r="22" fill="#1573ba" stroke="#000000" stroke-width="10" />
    <circle cx="646" cy="174" r="5" fill="#ffffff" opacity="0.6" />
  </g>

  <!-- 4. LETTER 'M' (Sunny Yellow with Ruler Markings) -->
  <g id="letter-M" filter="url(#stem-shadow)">
    <path d="M 685,436 L 685,58 C 685,50 690,44 698,44 L 755,44 C 764,44 772,50 776,58 L 836,230 L 896,58 C 900,50 908,44 917,44 L 974,44 C 982,44 987,50 987,58 L 987,436 C 987,444 982,450 974,450 L 930,450 C 922,450 916,444 916,436 L 916,192 L 860,335 C 856,345 844,352 834,352 L 832,352 C 822,352 810,345 806,335 L 752,192 L 752,436 C 752,444 746,450 738,450 L 698,450 C 690,450 685,444 685,436 Z" fill="#000000" transform="translate(8, 8)" />
    <path d="M 685,428 L 685,50 C 685,42 690,36 698,36 L 755,36 C 764,36 772,42 776,50 L 836,222 L 896,50 C 900,42 908,36 917,36 L 974,36 C 982,36 987,42 987,50 L 987,428 C 987,436 982,442 974,442 L 930,442 C 922,442 916,436 916,428 L 916,184 L 860,327 C 856,337 844,344 834,344 L 832,344 C 822,344 810,337 806,327 L 752,184 L 752,428 C 752,436 746,442 738,442 L 698,442 C 690,442 685,436 685,428 Z"
          fill="#fdb813" stroke="#000000" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" />
    <g transform="translate(922, 100)">
      <rect x="0" y="0" width="46" height="280" fill="#fef08a" rx="4" opacity="0.45" />
      <line x1="0" y1="20" x2="26" y2="20" stroke="#000000" stroke-width="3" />
      <line x1="0" y1="35" x2="14" y2="35" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="50" x2="14" y2="50" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="65" x2="14" y2="65" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="80" x2="22" y2="80" stroke="#000000" stroke-width="2.5" />
      <line x1="0" y1="95" x2="14" y2="95" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="110" x2="14" y2="110" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="125" x2="14" y2="125" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="140" x2="26" y2="140" stroke="#000000" stroke-width="3" />
      <line x1="0" y1="155" x2="14" y2="155" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="170" x2="14" y2="170" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="185" x2="14" y2="185" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="200" x2="22" y2="200" stroke="#000000" stroke-width="2.5" />
      <line x1="0" y1="215" x2="14" y2="215" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="230" x2="14" y2="230" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="245" x2="14" y2="245" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="260" x2="26" y2="260" stroke="#000000" stroke-width="3" />
    </g>
  </g>

  <!-- ================= BADGE 1: SCIENCE (RED) ================= -->
  <g id="badge-science" filter="url(#badge-shadow)">
    <circle cx="130" cy="530" r="96" fill="#000000" />
    <circle cx="130" cy="530" r="88" fill="#ffffff" />
    <circle cx="130" cy="530" r="80" fill="#ed2024" />

    <g transform="translate(130, 526)">
      <rect x="-14" y="-56" width="28" height="8" rx="3" fill="#ffffff" stroke="#000000" stroke-width="2" />
      <rect x="-10" y="-50" width="20" height="26" fill="#ffffff" stroke="#000000" stroke-width="2" opacity="0.9" />
      <path d="M -10,-24 L -44,38 C -46,42 -44,46 -38,46 L 38,46 C 44,46 46,42 44,38 L 10,-24 Z"
            fill="#ffffff" stroke="#000000" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M -28,10 C -15,5 0,15 15,10 C 24,7 28,11 36,36 C 38,42 34,44 30,44 L -30,44 C -34,44 -38,42 -36,36 Z"
            fill="url(#potion-grad)" stroke="#9333ea" stroke-width="1.5" />
      <path d="M -36,35 L -10,-15" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      <circle cx="-6" cy="18" r="4" fill="#ffffff" opacity="0.75" />
      <circle cx="8" cy="26" r="3" fill="#ffffff" opacity="0.75" />
      <circle cx="3" cy="2" r="2.5" fill="#ffffff" opacity="0.75" />
    </g>
    <text x="130" y="652" text-anchor="middle" fill="#ed2024" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="25" letter-spacing="1">SCIENCE</text>
  </g>

  <!-- ================= BADGE 2: TECHNOLOGY (GREEN) ================= -->
  <g id="badge-technology" filter="url(#badge-shadow)">
    <circle cx="380" cy="530" r="96" fill="#000000" />
    <circle cx="380" cy="530" r="88" fill="#ffffff" />
    <circle cx="380" cy="530" r="80" fill="#56b949" />

    <g transform="translate(380, 526)">
      <path d="M -15,42 L 15,42 L 5,22 L -5,22 Z" fill="#475569" stroke="#000000" stroke-width="2" />
      <line x1="0" y1="22" x2="6" y2="4" stroke="#1e293b" stroke-width="6" stroke-linecap="round" />
      <g transform="rotate(-30)">
        <ellipse cx="0" cy="0" rx="46" ry="24" fill="url(#metal-grad)" stroke="#000000" stroke-width="3" />
        <ellipse cx="2" cy="0" rx="38" ry="18" fill="#cbd5e1" opacity="0.9" />
        <line x1="0" y1="0" x2="-2" y2="-36" stroke="#000000" stroke-width="3" />
        <circle cx="-2" cy="-36" r="5" fill="#e2e8f0" stroke="#000000" stroke-width="2" />
        <path d="M -12,-48 C -6,-52 4,-52 10,-48" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <path d="M -18,-58 C -8,-64 8,-64 18,-58" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" />
      </g>
    </g>
    <text x="380" y="652" text-anchor="middle" fill="#56b949" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="23" letter-spacing="0.5">TECHNOLOGY</text>
  </g>

  <!-- ================= BADGE 3: ENGINEERING (BLUE) ================= -->
  <g id="badge-engineering" filter="url(#badge-shadow)">
    <circle cx="640" cy="530" r="96" fill="#000000" />
    <circle cx="640" cy="530" r="88" fill="#ffffff" />
    <circle cx="640" cy="530" r="80" fill="#1573ba" />

    <g transform="translate(640, 526)">
      <g transform="translate(-14, 10)">
        <circle cx="0" cy="0" r="28" fill="#e2e8f0" stroke="#000000" stroke-width="3" />
        <rect x="-6" y="-36" width="12" height="72" fill="#e2e8f0" stroke="#000000" stroke-width="3" rx="2" />
        <rect x="-36" y="-6" width="72" height="12" fill="#e2e8f0" stroke="#000000" stroke-width="3" rx="2" />
        <rect x="-6" y="-36" width="12" height="72" fill="#e2e8f0" stroke="#000000" stroke-width="3" rx="2" transform="rotate(45)" />
        <rect x="-6" y="-36" width="12" height="72" fill="#e2e8f0" stroke="#000000" stroke-width="3" rx="2" transform="rotate(-45)" />
        <circle cx="0" cy="0" r="26" fill="#cbd5e1" />
        <circle cx="0" cy="0" r="12" fill="#1573ba" stroke="#000000" stroke-width="2.5" />
      </g>

      <g transform="translate(20, -18)">
        <circle cx="0" cy="0" r="20" fill="#94a3b8" stroke="#000000" stroke-width="2.5" />
        <rect x="-5" y="-26" width="10" height="52" fill="#94a3b8" stroke="#000000" stroke-width="2.5" rx="2" />
        <rect x="-26" y="-5" width="52" height="10" fill="#94a3b8" stroke="#000000" stroke-width="2.5" rx="2" />
        <rect x="-5" y="-26" width="10" height="52" fill="#94a3b8" stroke="#000000" stroke-width="2.5" rx="2" transform="rotate(45)" />
        <rect x="-5" y="-26" width="10" height="52" fill="#94a3b8" stroke="#000000" stroke-width="2.5" rx="2" transform="rotate(-45)" />
        <circle cx="0" cy="0" r="18" fill="#94a3b8" />
        <circle cx="0" cy="0" r="8" fill="#1573ba" stroke="#000000" stroke-width="2" />
      </g>
    </g>
    <text x="640" y="652" text-anchor="middle" fill="#1573ba" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="22" letter-spacing="0.5">ENGINEERING</text>
  </g>

  <!-- ================= BADGE 4: MATHEMATICS (YELLOW) ================= -->
  <g id="badge-mathematics" filter="url(#badge-shadow)">
    <circle cx="890" cy="530" r="96" fill="#000000" />
    <circle cx="890" cy="530" r="88" fill="#ffffff" />
    <circle cx="890" cy="530" r="80" fill="#fdb813" />

    <g transform="translate(890, 526)">
      <rect x="-35" y="-50" width="70" height="100" rx="10" fill="#f8fafc" stroke="#000000" stroke-width="3" />
      <rect x="-26" y="-42" width="52" height="18" rx="3" fill="#1e293b" stroke="#000000" stroke-width="1.5" />
      <text x="20" y="-29" fill="#22c55e" font-family="monospace" font-weight="bold" font-size="11" text-anchor="end">3.14159</text>

      <rect x="-26" y="-18" width="10" height="7" rx="1.5" fill="#64748b" />
      <rect x="-13" y="-18" width="10" height="7" rx="1.5" fill="#64748b" />
      <rect x="0" y="-18" width="10" height="7" rx="1.5" fill="#64748b" />
      <rect x="13" y="-18" width="13" height="7" rx="1.5" fill="#ef4444" />

      <rect x="-26" y="-7" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="-13" y="-7" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="0" y="-7" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="13" y="-7" width="13" height="8" rx="1.5" fill="#f97316" />

      <rect x="-26" y="5" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="-13" y="5" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="0" y="5" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="13" y="5" width="13" height="8" rx="1.5" fill="#f97316" />

      <rect x="-26" y="17" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="-13" y="17" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="0" y="17" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="13" y="17" width="13" height="8" rx="1.5" fill="#f97316" />

      <rect x="-26" y="29" width="23" height="8" rx="1.5" fill="#334155" />
      <rect x="0" y="29" width="10" height="8" rx="1.5" fill="#334155" />
      <rect x="13" y="29" width="13" height="8" rx="1.5" fill="#0284c7" />
    </g>
    <text x="890" y="652" text-anchor="middle" fill="#f59e0b" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="21" letter-spacing="0.5">MATHEMATICS</text>
  </g>
</svg>`;

export function generateStemPuzzleSvg(): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(STEM_SVG_STRING)}`;
}

export const STEM_ARTWORK_URL = generateStemPuzzleSvg();
export const STEM_THEME_TITLE = 'STEM - Khoa học, Công nghệ, Kỹ thuật & Toán học';
