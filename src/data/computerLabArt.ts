// Vector Artwork for "Phòng thực hành Tin học tương lai"
// Exactly matching the classroom artwork in the jigsaw puzzle reference image

export function generateComputerLabSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600">
  <defs>
    <linearGradient id="bg-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0e3a6c" />
      <stop offset="45%" stop-color="#19599a" />
      <stop offset="100%" stop-color="#0a2a4e" />
    </linearGradient>

    <linearGradient id="desk-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="25%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>

    <linearGradient id="banner-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#065f46" />
    </linearGradient>

    <linearGradient id="screen-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  {/* Background Wall */}
  <rect width="900" height="600" fill="url(#bg-wall)" />

  {/* Classroom Window & Tech Lines */}
  <g opacity="0.18">
    <line x1="0" y1="100" x2="900" y2="100" stroke="#38bdf8" stroke-width="2" stroke-dasharray="10 10" />
    <line x1="0" y1="200" x2="900" y2="200" stroke="#38bdf8" stroke-width="2" stroke-dasharray="10 10" />
    <line x1="0" y1="300" x2="900" y2="300" stroke="#38bdf8" stroke-width="2" stroke-dasharray="10 10" />
    <circle cx="150" cy="180" r="120" stroke="#38bdf8" stroke-width="3" fill="none" />
    <circle cx="750" cy="180" r="120" stroke="#38bdf8" stroke-width="3" fill="none" />
  </g>

  {/* TOP BANNER: "PHÒNG TIN HỌC VUI NHỘN" */}
  <g id="top-banner" transform="translate(180, 28)">
    {/* Ribbon background */}
    <rect x="0" y="0" width="540" height="74" rx="16" fill="url(#banner-grad)" stroke="#34d399" stroke-width="3" filter="url(#glow)" />
    
    {/* Inner decorative frame */}
    <rect x="8" y="8" width="524" height="58" rx="10" fill="none" stroke="#6ee7b7" stroke-width="1.5" stroke-dasharray="8 4" />

    {/* Big Main Title */}
    <text x="270" y="42" text-anchor="middle" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="28" letter-spacing="1">
      PHÒNG TIN HỌC VUI NHỘN
    </text>

    {/* Slogan pill */}
    <g transform="translate(140, 50)">
      <rect x="0" y="0" width="260" height="26" rx="13" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.5" />
      <text x="130" y="18" text-anchor="middle" fill="#78350f" font-family="sans-serif" font-weight="800" font-size="12">
        ★ Ngoan - Sáng tạo - Vươn tầm ★
      </text>
    </g>
  </g>

  {/* Main Teacher & Computer Lab Stations */}
  {/* Modern Desk Surface */}
  <path d="M 0 460 L 900 460 L 900 600 L 0 600 Z" fill="url(#desk-grad)" />
  <rect x="0" y="450" width="900" height="14" fill="#7dd3fc" />

  {/* CENTER COMPUTER MONITOR (Piece 5 & 2) */}
  <g id="center-monitor" transform="translate(330, 160)">
    {/* Monitor Stand */}
    <rect x="105" y="230" width="30" height="70" fill="#64748b" rx="4" />
    <ellipse cx="120" cy="300" rx="60" ry="14" fill="#475569" stroke="#94a3b8" stroke-width="2" />

    {/* Monitor Bezel */}
    <rect x="0" y="0" width="240" height="230" rx="20" fill="#0f172a" stroke="#0ea5e9" stroke-width="4" filter="url(#glow)" />

    {/* Screen Display */}
    <rect x="12" y="12" width="216" height="206" rx="12" fill="url(#screen-grad)" />

    {/* Screen Content: Friendly Cute AI Face */}
    {/* Big expressive blue glowing eyes */}
    <ellipse cx="75" cy="80" rx="22" ry="30" fill="#38bdf8" />
    <circle cx="82" cy="72" r="9" fill="#ffffff" />
    <circle cx="70" cy="92" r="4" fill="#ffffff" />

    <ellipse cx="145" cy="80" rx="22" ry="30" fill="#38bdf8" />
    <circle cx="152" cy="72" r="9" fill="#ffffff" />
    <circle cx="140" cy="92" r="4" fill="#ffffff" />

    {/* Rosy glowing cheeks */}
    <circle cx="50" cy="115" r="10" fill="#f43f5e" opacity="0.6" />
    <circle cx="170" cy="115" r="10" fill="#f43f5e" opacity="0.6" />

    {/* Big happy smile */}
    <path d="M 85 118 Q 110 148 135 118" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" fill="none" />

    {/* Coding scratch block below */}
    <rect x="25" y="160" width="170" height="34" rx="8" fill="#10b981" />
    <text x="110" y="182" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="14">
      when_smile_clicked()
    </text>
  </g>

  {/* LEFT STATION: Cute Robot Buddy (Piece 4 & 7) */}
  <g id="left-robot" transform="translate(60, 240)">
    {/* Robot Head */}
    <rect x="40" y="40" width="120" height="100" rx="22" fill="#e2e8f0" stroke="#0284c7" stroke-width="4" />
    {/* Antenna */}
    <line x1="100" y1="40" x2="100" y2="10" stroke="#0284c7" stroke-width="5" stroke-linecap="round" />
    <circle cx="100" cy="10" r="10" fill="#f59e0b" stroke="#ffffff" stroke-width="2" />
    {/* Screen visor */}
    <rect x="52" y="60" width="96" height="50" rx="12" fill="#0f172a" />
    <circle cx="76" cy="85" r="10" fill="#22c55e" />
    <circle cx="124" cy="85" r="10" fill="#22c55e" />
    {/* Body */}
    <rect x="50" y="145" width="100" height="110" rx="16" fill="#cbd5e1" stroke="#0284c7" stroke-width="4" />
    {/* Heart Gauge */}
    <circle cx="100" cy="195" r="22" fill="#0284c7" />
    <path d="M 94 195 L 100 203 L 108 190" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    {/* Robot Arms */}
    <path d="M 50 160 Q 15 180 30 220" stroke="#0284c7" stroke-width="8" stroke-linecap="round" fill="none" />
    <path d="M 150 160 Q 185 180 170 220" stroke="#0284c7" stroke-width="8" stroke-linecap="round" fill="none" />
  </g>

  {/* RIGHT STATION: Mascot Student with Vietnamese Star Cap (Piece 6 & 9) */}
  <g id="right-student" transform="translate(660, 220)">
    {/* Student Head */}
    <circle cx="100" cy="130" r="55" fill="#fed7aa" stroke="#ea580c" stroke-width="3" />
    
    {/* Vietnamese Star Red Cap */}
    <path d="M 45 110 C 45 60 155 60 155 110 Z" fill="#dc2626" stroke="#b91c1c" stroke-width="3" />
    <path d="M 140 105 L 190 115 L 140 125 Z" fill="#991b1b" />
    {/* Yellow Star on Cap */}
    <polygon points="100,72 105,86 120,86 108,95 112,109 100,100 88,109 92,95 80,86 95,86" fill="#facc15" />

    {/* Eyes and Happy Face */}
    <ellipse cx="80" cy="130" rx="6" ry="9" fill="#1e293b" />
    <ellipse cx="120" cy="130" rx="6" ry="9" fill="#1e293b" />
    <circle cx="78" cy="126" r="2.5" fill="#ffffff" />
    <circle cx="118" cy="126" r="2.5" fill="#ffffff" />
    {/* Cute Smile */}
    <path d="M 88 150 Q 100 165 112 150" stroke="#ea580c" stroke-width="3.5" stroke-linecap="round" fill="none" />

    {/* Student Shirt (FPT Orange with Blue Collar) */}
    <path d="M 40 182 Q 100 170 160 182 L 175 300 L 25 300 Z" fill="#f97316" stroke="#c2410c" stroke-width="3" />
    <path d="M 80 180 L 100 215 L 120 180 Z" fill="#0284c7" />
  </g>

  {/* Colorful Keyboard & Mouse on Desk (Piece 8) */}
  <g id="desk-accessories" transform="translate(320, 480)">
    {/* Keyboard */}
    <rect x="0" y="0" width="260" height="60" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    {/* Glowing colorful RGB keys */}
    <g fill="#0ea5e9" opacity="0.8">
      <rect x="15" y="10" width="18" height="15" rx="3" fill="#ec4899" />
      <rect x="38" y="10" width="18" height="15" rx="3" fill="#a855f7" />
      <rect x="61" y="10" width="18" height="15" rx="3" fill="#3b82f6" />
      <rect x="84" y="10" width="18" height="15" rx="3" fill="#06b6d4" />
      <rect x="107" y="10" width="18" height="15" rx="3" fill="#10b981" />
      <rect x="130" y="10" width="18" height="15" rx="3" fill="#eab308" />
      <rect x="153" y="10" width="18" height="15" rx="3" fill="#f97316" />
      <rect x="176" y="10" width="18" height="15" rx="3" fill="#ef4444" />
      <rect x="199" y="10" width="45" height="15" rx="3" fill="#64748b" />

      {/* Row 2 */}
      <rect x="15" y="32" width="25" height="16" rx="3" fill="#64748b" />
      <rect x="45" y="32" width="140" height="16" rx="4" fill="#38bdf8" />
      <rect x="190" y="32" width="25" height="16" rx="3" fill="#64748b" />
      <rect x="220" y="32" width="25" height="16" rx="3" fill="#64748b" />
    </g>

    {/* Mouse */}
    <ellipse cx="295" cy="30" rx="18" ry="26" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
    <line x1="295" y1="8" x2="295" y2="24" stroke="#ec4899" stroke-width="2" />
  </g>

  {/* FPT Schools corner tag */}
  <g transform="translate(30, 30)">
    <rect x="0" y="0" width="125" height="34" rx="8" fill="#08509f" opacity="0.85" />
    <text x="62" y="23" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="13">
      STEM SMART LAB
    </text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const COMPUTER_LAB_ARTWORK_URL = generateComputerLabSvg();
