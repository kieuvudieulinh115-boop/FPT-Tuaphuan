// High fidelity vector artwork representing "Scratch-hoc-ma-choi-1024x683"
// Clean valid SVG XML without JSX comments for 100% browser rendering reliability

export function generateScratchHocMaChoiSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 683" width="1024" height="683">
  <defs>
    <linearGradient id="scratch-topbar" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4c97ff" />
      <stop offset="100%" stop-color="#3373cc" />
    </linearGradient>

    <linearGradient id="sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#60b4fb" />
      <stop offset="65%" stop-color="#bce3ff" />
      <stop offset="100%" stop-color="#e8f5ff" />
    </linearGradient>

    <linearGradient id="ground-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b45309" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>

    <linearGradient id="mario-pipe" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#15803d" />
      <stop offset="35%" stop-color="#22c55e" />
      <stop offset="70%" stop-color="#4ade80" />
      <stop offset="100%" stop-color="#166534" />
    </linearGradient>

    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Base Background -->
  <rect width="1024" height="683" fill="#e5e9f0" />

  <!-- 1. TOP MENU BAR -->
  <rect width="1024" height="42" fill="url(#scratch-topbar)" />
  
  <!-- Scratch Cat Logo -->
  <g transform="translate(14, 7)">
    <ellipse cx="14" cy="14" rx="13" ry="12" fill="#ffab19" stroke="#ffffff" stroke-width="1.5" />
    <polygon points="5,5 9,1 12,6" fill="#ffab19" />
    <polygon points="23,5 19,1 16,6" fill="#ffab19" />
    <circle cx="10" cy="12" r="2.5" fill="#ffffff" />
    <circle cx="10" cy="12" r="1.2" fill="#000000" />
    <circle cx="18" cy="12" r="2.5" fill="#ffffff" />
    <circle cx="18" cy="12" r="1.2" fill="#000000" />
    <ellipse cx="14" cy="17" rx="4" ry="2.5" fill="#ffffff" />
    <ellipse cx="14" cy="16.5" rx="1.5" ry="1" fill="#000000" />
    <text x="36" y="20" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="19" letter-spacing="-0.5">SCRATCH</text>
  </g>

  <!-- Menu Items -->
  <g transform="translate(160, 25)" fill="#ffffff" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="600" opacity="0.95">
    <text x="0" y="0">Archivo ▾</text>
    <text x="65" y="0">Editar ▾</text>
    <text x="125" y="0">Sugerencias</text>
    <text x="210" y="0">Acerca de</text>
  </g>

  <!-- Project Name Box -->
  <g transform="translate(430, 7)">
    <rect x="0" y="0" width="260" height="28" rx="14" fill="#ffffff" opacity="0.95" />
    <text x="14" y="19" fill="#1e293b" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="13">SuperMario Bros</text>
    <text x="135" y="19" fill="#64748b" font-family="'Segoe UI', sans-serif" font-size="11">(por programamosES)</text>
  </g>

  <!-- Green Flag & Stop Sign -->
  <g transform="translate(710, 8)">
    <circle cx="13" cy="13" r="12" fill="#e2e8f0" stroke="#cbd5e1" />
    <polygon points="10,7 20,13 10,19" fill="#22c55e" />
    <circle cx="43" cy="13" r="12" fill="#e2e8f0" stroke="#cbd5e1" />
    <polygon points="40,7 46,7 50,11 50,15 46,19 40,19 36,15 36,11" fill="#ef4444" />
  </g>

  <!-- Video Tool -->
  <g transform="translate(785, 9)">
    <rect x="0" y="0" width="60" height="25" rx="6" fill="#3b82f6" />
    <text x="18" y="17" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="11">Video</text>
  </g>

  <!-- 2. LEFT SIDE: STAGE -->
  <g id="scratch-stage" transform="translate(16, 52)">
    <!-- Stage Outer Frame -->
    <rect width="420" height="320" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="url(#card-shadow)" />

    <!-- Stage Canvas Area -->
    <rect x="10" y="10" width="400" height="300" rx="6" fill="url(#sky-grad)" />

    <!-- Mario Clouds -->
    <g fill="#ffffff" opacity="0.92">
      <ellipse cx="90" cy="70" rx="35" ry="18" />
      <ellipse cx="115" cy="62" rx="25" ry="20" />
      <ellipse cx="70" cy="74" rx="20" ry="14" />

      <ellipse cx="320" cy="95" rx="42" ry="20" />
      <ellipse cx="350" cy="85" rx="30" ry="22" />
      <ellipse cx="295" cy="98" rx="24" ry="16" />
    </g>

    <!-- Distant Hills -->
    <ellipse cx="140" cy="270" rx="80" ry="35" fill="#4ade80" opacity="0.85" />
    <ellipse cx="300" cy="275" rx="110" ry="40" fill="#22c55e" opacity="0.85" />

    <!-- Mario Ground Blocks -->
    <rect x="10" y="260" width="400" height="50" fill="url(#ground-grad)" />
    <rect x="10" y="256" width="400" height="6" fill="#22c55e" />
    
    <!-- Ground Block Texture lines -->
    <path d="M 10 275 L 410 275 M 10 290 L 410 290" stroke="#522306" stroke-width="2" />
    <path d="M 40 260 L 40 275 M 90 275 L 90 290 M 140 260 L 140 275 M 190 275 L 190 290 M 240 260 L 240 275 M 290 275 L 290 290 M 340 260 L 340 275 M 390 275 L 390 290" stroke="#522306" stroke-width="2" />

    <!-- Mario Green Warp Pipe -->
    <g transform="translate(320, 200)">
      <rect x="5" y="16" width="50" height="42" fill="url(#mario-pipe)" stroke="#0f172a" stroke-width="2" />
      <rect x="0" y="0" width="60" height="18" rx="3" fill="url(#mario-pipe)" stroke="#0f172a" stroke-width="2" />
      <rect x="4" y="2" width="10" height="14" fill="#86efac" opacity="0.6" />
    </g>

    <!-- Floating Blocks -->
    <g transform="translate(130, 160)">
      <rect x="0" y="0" width="30" height="30" rx="3" fill="#f59e0b" stroke="#78350f" stroke-width="2" />
      <circle cx="4" cy="4" r="1.5" fill="#78350f" />
      <circle cx="26" cy="4" r="1.5" fill="#78350f" />
      <circle cx="4" cy="26" r="1.5" fill="#78350f" />
      <circle cx="26" cy="26" r="1.5" fill="#78350f" />
      <text x="15" y="22" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="18" text-anchor="middle">?</text>

      <rect x="32" y="0" width="30" height="30" rx="2" fill="#b45309" stroke="#451a03" stroke-width="2" />
      <line x1="32" y1="15" x2="62" y2="15" stroke="#451a03" stroke-width="1.5" />
      <line x1="47" y1="0" x2="47" y2="15" stroke="#451a03" stroke-width="1.5" />
      <line x1="39" y1="15" x2="39" y2="30" stroke="#451a03" stroke-width="1.5" />
      <line x1="55" y1="15" x2="55" y2="30" stroke="#451a03" stroke-width="1.5" />

      <rect x="64" y="0" width="30" height="30" rx="3" fill="#f59e0b" stroke="#78350f" stroke-width="2" />
      <circle cx="68" cy="4" r="1.5" fill="#78350f" />
      <circle cx="90" cy="4" r="1.5" fill="#78350f" />
      <circle cx="68" cy="26" r="1.5" fill="#78350f" />
      <circle cx="90" cy="26" r="1.5" fill="#78350f" />
      <text x="79" y="22" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="18" text-anchor="middle">?</text>
    </g>

    <!-- SCRATCH CAT ON STAGE -->
    <g id="scratch-cat-stage" transform="translate(60, 160)">
      <!-- Cat Tail -->
      <path d="M 22 75 C -10 65 -5 40 10 38 C 15 37 18 48 16 55 C 15 62 18 68 24 72 Z" fill="#ffab19" stroke="#000000" stroke-width="2" />

      <!-- Cat Body -->
      <ellipse cx="40" cy="65" rx="20" ry="24" fill="#ffab19" stroke="#000000" stroke-width="2.5" />
      <ellipse cx="38" cy="66" rx="12" ry="16" fill="#ffffff" />

      <!-- Feet -->
      <ellipse cx="28" cy="90" rx="10" ry="6" fill="#ffffff" stroke="#000000" stroke-width="2" />
      <ellipse cx="48" cy="90" rx="10" ry="6" fill="#ffffff" stroke="#000000" stroke-width="2" />

      <!-- Cat Head -->
      <g transform="translate(10, 0)">
        <polygon points="5,24 16,3 24,20" fill="#ffab19" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
        <polygon points="9,20 16,8 21,18" fill="#ffffff" />
        
        <polygon points="42,18 50,3 61,24" fill="#ffab19" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
        <polygon points="45,18 50,8 57,20" fill="#ffffff" />

        <ellipse cx="33" cy="30" rx="30" ry="24" fill="#ffab19" stroke="#000000" stroke-width="2.5" />

        <ellipse cx="22" cy="24" rx="7" ry="10" fill="#ffffff" stroke="#000000" stroke-width="2" />
        <ellipse cx="24" cy="24" rx="3.5" ry="5.5" fill="#22c55e" />
        <circle cx="25" cy="22" r="2" fill="#000000" />
        <circle cx="23" cy="20" r="1" fill="#ffffff" />

        <ellipse cx="44" cy="24" rx="7" ry="10" fill="#ffffff" stroke="#000000" stroke-width="2" />
        <ellipse cx="42" cy="24" rx="3.5" ry="5.5" fill="#22c55e" />
        <circle cx="41" cy="22" r="2" fill="#000000" />
        <circle cx="43" cy="20" r="1" fill="#ffffff" />

        <ellipse cx="33" cy="38" rx="13" ry="9" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
        <polygon points="30,34 36,34 33,37" fill="#000000" />
        <path d="M 33 37 L 33 42 M 28 42 Q 33 45 38 42" stroke="#000000" stroke-width="1.5" fill="none" />
        <line x1="12" y1="36" x2="2" y2="34" stroke="#000000" stroke-width="1.5" />
        <line x1="12" y1="40" x2="2" y2="42" stroke="#000000" stroke-width="1.5" />
        <line x1="54" y1="36" x2="64" y2="34" stroke="#000000" stroke-width="1.5" />
        <line x1="54" y1="40" x2="64" y2="42" stroke="#000000" stroke-width="1.5" />
      </g>
    </g>
  </g>

  <!-- 3. STAGE SPRITES TRAY -->
  <g transform="translate(16, 385)">
    <rect width="420" height="280" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
    <rect x="0" y="0" width="420" height="32" rx="8" fill="#f1f5f9" />
    <text x="14" y="21" fill="#475569" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="12">Escenario: 1 fondo</text>
    <text x="180" y="21" fill="#475569" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="12">Nuevo objeto:</text>
    
    <!-- Sprite 1: Scratch Cat -->
    <g transform="translate(180, 42)">
      <rect width="100" height="110" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
      <ellipse cx="50" cy="55" rx="30" ry="26" fill="#ffab19" />
      <text x="50" y="100" fill="#0369a1" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">Objeto1</text>
    </g>

    <!-- Sprite 2: Mario -->
    <g transform="translate(295, 42)">
      <rect width="100" height="110" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
      <circle cx="50" cy="45" r="22" fill="#ef4444" />
      <text x="50" y="100" fill="#64748b" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">Mario</text>
    </g>
  </g>

  <!-- 4. CENTER & RIGHT: SCRATCH CODE BLOCKS -->
  <!-- Category Column -->
  <g transform="translate(448, 52)">
    <rect width="170" height="613" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />

    <g transform="translate(10, 12)" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">
      <!-- Movimiento -->
      <rect x="0" y="0" width="150" height="26" rx="13" fill="#4c97ff" />
      <circle cx="16" cy="13" r="6" fill="#ffffff" opacity="0.6" />
      <text x="32" y="17">Movimiento</text>

      <!-- Apariencia -->
      <rect x="0" y="32" width="150" height="26" rx="13" fill="#9966ff" />
      <circle cx="16" cy="45" r="6" fill="#ffffff" opacity="0.6" />
      <text x="32" y="49">Apariencia</text>

      <!-- Sonido -->
      <rect x="0" y="64" width="150" height="26" rx="13" fill="#d65cd6" />
      <circle cx="16" cy="77" r="6" fill="#ffffff" opacity="0.6" />
      <text x="32" y="81">Sonido</text>

      <!-- Lápiz -->
      <rect x="0" y="96" width="150" height="26" rx="13" fill="#0fbd8c" />
      <circle cx="16" cy="109" r="6" fill="#ffffff" opacity="0.6" />
      <text x="32" y="113">Lápiz</text>

      <!-- Datos -->
      <rect x="0" y="128" width="150" height="26" rx="13" fill="#ff8c1a" />
      <circle cx="16" cy="141" r="6" fill="#ffffff" opacity="0.6" />
      <text x="32" y="145">Datos y bloques</text>

      <!-- Eventos -->
      <rect x="0" y="160" width="150" height="26" rx="13" fill="#ffbf00" />
      <circle cx="16" cy="173" r="6" fill="#ffffff" opacity="0.6" />
      <text x="32" y="177">Eventos</text>

      <!-- Control -->
      <rect x="0" y="192" width="150" height="26" rx="13" fill="#ffab19" />
      <circle cx="16" cy="205" r="6" fill="#ffffff" opacity="0.6" />
      <text x="32" y="209">Control</text>

      <!-- Sensores -->
      <rect x="0" y="224" width="150" height="26" rx="13" fill="#4cbfe6" />
      <circle cx="16" cy="237" r="6" fill="#ffffff" opacity="0.6" />
      <text x="32" y="241">Sensores</text>

      <!-- Operadores -->
      <rect x="0" y="256" width="150" height="26" rx="13" fill="#59c059" />
      <circle cx="16" cy="269" r="6" fill="#ffffff" opacity="0.6" />
      <text x="32" y="273">Operadores</text>
    </g>

    <!-- Sample Blocks -->
    <g transform="translate(10, 310)" font-family="'Segoe UI', monospace" font-size="11" font-weight="bold" fill="#ffffff">
      <rect x="0" y="0" width="150" height="28" rx="6" fill="#4c97ff" stroke="#3373cc" />
      <text x="12" y="18">mover (10) pasos</text>

      <rect x="0" y="34" width="150" height="28" rx="6" fill="#4c97ff" stroke="#3373cc" />
      <text x="12" y="52">girar ↻ (15) grados</text>

      <rect x="0" y="68" width="150" height="28" rx="6" fill="#4c97ff" stroke="#3373cc" />
      <text x="12" y="86">ir a x: (0) y: (0)</text>

      <rect x="0" y="102" width="150" height="28" rx="6" fill="#9966ff" stroke="#774dcc" />
      <text x="12" y="120">decir [Hola!] (2) s</text>
    </g>
  </g>

  <!-- Scripts Area Canvas -->
  <g transform="translate(628, 52)">
    <rect width="380" height="613" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5" />

    <!-- Script Tabs -->
    <g transform="translate(12, 10)" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold">
      <rect x="0" y="0" width="90" height="28" rx="6" fill="#ffffff" stroke="#cbd5e1" />
      <text x="14" y="18" fill="#1e293b">Programas</text>
      <text x="105" y="18" fill="#64748b">Disfraces</text>
      <text x="180" y="18" fill="#64748b">Sonidos</text>
    </g>

    <!-- ASSEMBLED SCRATCH SCRIPT 1 -->
    <g id="script-stack-1" transform="translate(30, 60)" font-family="'Segoe UI', monospace" font-size="12" font-weight="bold" fill="#ffffff">
      <path d="M 0 16 C 15 5 45 5 60 16 L 190 16 A 6 6 0 0 1 196 22 L 196 46 A 6 6 0 0 1 190 52 L 50 52 C 45 56 35 56 30 52 L 6 52 A 6 6 0 0 1 0 46 Z" fill="#ffbf00" stroke="#cc9900" stroke-width="1.5" />
      <circle cx="16" cy="34" r="5" fill="#22c55e" />
      <text x="26" y="38">al presionar ⚑</text>

      <g transform="translate(0, 52)">
        <rect x="0" y="0" width="220" height="150" rx="8" fill="#ffab19" stroke="#cc8800" stroke-width="1.5" />
        <text x="15" y="24">por siempre</text>

        <rect x="18" y="34" width="195" height="98" rx="6" fill="#f8fafc" />

        <g transform="translate(24, 40)">
          <rect x="0" y="0" width="182" height="40" rx="6" fill="#ffab19" stroke="#cc8800" />
          <text x="8" y="25" font-size="11">si &lt;tecla [espacio]&gt; ent.</text>
        </g>

        <g transform="translate(24, 86)">
          <rect x="0" y="0" width="182" height="36" rx="6" fill="#4c97ff" stroke="#3373cc" />
          <text x="10" y="23" font-size="11">cambiar y por (10)</text>
        </g>
      </g>
    </g>

    <!-- ASSEMBLED SCRATCH SCRIPT 2 -->
    <g id="script-stack-2" transform="translate(40, 310)" font-family="'Segoe UI', monospace" font-size="12" font-weight="bold" fill="#ffffff">
      <path d="M 0 16 C 15 5 45 5 60 16 L 220 16 A 6 6 0 0 1 226 22 L 226 46 A 6 6 0 0 1 220 52 L 50 52 C 45 56 35 56 30 52 L 6 52 A 6 6 0 0 1 0 46 Z" fill="#ffbf00" stroke="#cc9900" stroke-width="1.5" />
      <text x="14" y="38">al presionar [flecha der ▾]</text>

      <g transform="translate(0, 52)">
        <rect x="0" y="0" width="226" height="34" rx="6" fill="#4c97ff" stroke="#3373cc" />
        <text x="14" y="22">apuntar en dirección (90)</text>
      </g>

      <g transform="translate(0, 88)">
        <rect x="0" y="0" width="226" height="34" rx="6" fill="#4c97ff" stroke="#3373cc" />
        <text x="14" y="22">mover (10) pasos</text>
      </g>

      <g transform="translate(0, 124)">
        <rect x="0" y="0" width="226" height="34" rx="6" fill="#9966ff" stroke="#774dcc" />
        <text x="14" y="22">siguiente disfraz</text>
      </g>
    </g>

    <!-- Watermark -->
    <g transform="translate(260, 480)" opacity="0.15">
      <ellipse cx="45" cy="45" rx="40" ry="35" fill="#ffab19" />
      <polygon points="15,20 30,5 38,18" fill="#ffab19" />
      <polygon points="55,18 64,5 78,20" fill="#ffab19" />
    </g>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SCRATCH_ARTWORK_URL = generateScratchHocMaChoiSvg();
