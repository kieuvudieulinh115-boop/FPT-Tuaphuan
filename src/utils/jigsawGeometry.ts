// Jigsaw geometry generator for authentic interlocking puzzle pieces
// Standard 3 rows x 3 columns = 9 pieces (matching reference image) or customizable

export interface Point {
  x: number;
  y: number;
}

export interface JigsawPiecePathInfo {
  id: number;
  position: number; // 1 to 9
  row: number;      // 0, 1, 2
  col: number;      // 0, 1, 2
  pathD: string;    // SVG path string in board coordinate system [0, 0, width, height]
  center: Point;    // Center of the piece
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  cellWidth: number;
  cellHeight: number;
  // Pedagogical classification from reference image
  category: 'corner' | 'edge' | 'center';
  categoryBadge: string;
  categoryHint: string;
}

export interface JigsawConfig {
  width: number;
  height: number;
  rows: number;
  cols: number;
}

/**
 * Generates an authentic interlocking jigsaw edge from start to end with cubic bezier curves.
 * @param start Start point
 * @param end End point
 * @param outward Vector [ox, oy] pointing OUTWARD from the piece
 * @param tabSign +1 = tab bulges OUTWARD, -1 = blank indents INWARD, 0 = flat boundary edge
 */
function generateJigsawEdge(
  start: Point,
  end: Point,
  outward: [number, number],
  tabSign: number
): string {
  if (tabSign === 0) {
    return ` L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const edgeLen = Math.sqrt(dx * dx + dy * dy);

  // Tab height proportional to edge length (~18% of edge length)
  const tabHeight = edgeLen * 0.18 * tabSign;

  // Vector V along the protrusion direction (outward * tabHeight)
  const vx = outward[0] * tabHeight;
  const vy = outward[1] * tabHeight;

  // Helper to calculate coordinate at parametric position (t along edge, s along protrusion)
  const pt = (t: number, s: number): Point => ({
    x: start.x + t * dx + s * vx,
    y: start.y + t * dy + s * vy
  });

  const p0 = pt(0.36, 0);
  const p1 = pt(0.38, 0.45);
  const pApex = pt(0.50, 1.05);
  const p2 = pt(0.62, 0.45);
  const pEnd = pt(0.64, 0);

  // Control points for organic bulbous jigsaw tab & blank
  const cp1_1 = pt(0.36, -0.05);
  const cp1_2 = pt(0.31, 0.20);

  const cp2_1 = pt(0.40, 0.95);
  const cp2_2 = pt(0.45, 1.08);

  const cp3_1 = pt(0.55, 1.08);
  const cp3_2 = pt(0.60, 0.95);

  const cp4_1 = pt(0.69, 0.20);
  const cp4_2 = pt(0.64, -0.05);

  return (
    ` L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}` +
    ` C ${cp1_1.x.toFixed(2)} ${cp1_1.y.toFixed(2)}, ${cp1_2.x.toFixed(2)} ${cp1_2.y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}` +
    ` C ${cp2_1.x.toFixed(2)} ${cp2_1.y.toFixed(2)}, ${cp2_2.x.toFixed(2)} ${cp2_2.y.toFixed(2)}, ${pApex.x.toFixed(2)} ${pApex.y.toFixed(2)}` +
    ` C ${cp3_1.x.toFixed(2)} ${cp3_1.y.toFixed(2)}, ${cp3_2.x.toFixed(2)} ${cp3_2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}` +
    ` C ${cp4_1.x.toFixed(2)} ${cp4_1.y.toFixed(2)}, ${cp4_2.x.toFixed(2)} ${cp4_2.y.toFixed(2)}, ${pEnd.x.toFixed(2)} ${pEnd.y.toFixed(2)}` +
    ` L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
  );
}

// 3x3 Tab orientations (Horizontal boundaries: 2 rows of 3 cols)
// +1: top piece tab points DOWN. -1: top piece blank indents UP (bottom piece tab points UP).
const H_TABS_3x3 = [
  [1, -1, 1], // row 0 to 1
  [-1, 1, -1] // row 1 to 2
];

// 3x3 Tab orientations (Vertical boundaries: 3 rows of 2 cols)
// +1: left piece tab points RIGHT. -1: left piece blank indents LEFT (right piece tab points LEFT).
const V_TABS_3x3 = [
  [1, -1], // row 0
  [-1, 1], // row 1
  [1, -1]  // row 2
];

// Fallback for 2x4 (8 pieces) if ever needed
const H_TABS_2x4 = [
  [1, -1, 1, -1]
];
const V_TABS_2x4 = [
  [1, -1, 1],
  [-1, 1, -1]
];

/**
 * Builds all jigsaw piece paths for a board (default 3 rows x 3 cols = 9 pieces, 810 x 540)
 */
export function buildJigsawPieces(
  config: JigsawConfig = { width: 810, height: 540, rows: 3, cols: 3 }
): JigsawPiecePathInfo[] {
  const { width, height, rows, cols } = config;
  const cellW = width / cols;
  const cellH = height / rows;

  const pieces: JigsawPiecePathInfo[] = [];

  const hTabs = rows === 3 && cols === 3 ? H_TABS_3x3 : H_TABS_2x4;
  const vTabs = rows === 3 && cols === 3 ? V_TABS_3x3 : V_TABS_2x4;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const position = r * cols + c + 1; // 1 to 9 (or rows*cols)

      // Corner points of cell (r, c)
      const tl: Point = { x: c * cellW, y: r * cellH };
      const tr: Point = { x: (c + 1) * cellW, y: r * cellH };
      const br: Point = { x: (c + 1) * cellW, y: (r + 1) * cellH };
      const bl: Point = { x: c * cellW, y: (r + 1) * cellH };

      // Top edge
      let topTab = 0;
      if (r > 0) {
        // Boundary between row r-1 and r:
        const prevRowTab = hTabs[r - 1]?.[c] ?? (c % 2 === 0 ? 1 : -1);
        topTab = -prevRowTab; // opposite of top piece bottom edge
      }

      // Right edge
      let rightTab = 0;
      if (c < cols - 1) {
        rightTab = vTabs[r]?.[c] ?? (r % 2 === 0 ? 1 : -1);
      }

      // Bottom edge
      let bottomTab = 0;
      if (r < rows - 1) {
        bottomTab = hTabs[r]?.[c] ?? (c % 2 === 0 ? 1 : -1);
      }

      // Left edge
      let leftTab = 0;
      if (c > 0) {
        const prevColTab = vTabs[r]?.[c - 1] ?? (r % 2 === 0 ? 1 : -1);
        leftTab = -prevColTab;
      }

      // Closed SVG path clockwise
      let d = `M ${tl.x.toFixed(2)} ${tl.y.toFixed(2)}`;
      d += generateJigsawEdge(tl, tr, [0, -1], topTab);
      d += generateJigsawEdge(tr, br, [1, 0], rightTab);
      d += generateJigsawEdge(br, bl, [0, 1], bottomTab);
      d += generateJigsawEdge(bl, tl, [-1, 0], leftTab);
      d += ' Z';

      // Estimate bounds
      const protrusionX = cellW * 0.22;
      const protrusionY = cellH * 0.22;
      const bounds = {
        minX: Math.max(0, tl.x - protrusionX),
        minY: Math.max(0, tl.y - protrusionY),
        maxX: Math.min(width, tr.x + protrusionX),
        maxY: Math.min(height, bl.y + protrusionY)
      };

      // Classification & Hints matching user reference image
      let category: 'corner' | 'edge' | 'center' = 'center';
      let categoryBadge = 'Mảnh trung tâm';
      let categoryHint = 'Cả 4 cạnh đều có răng cưa lồi lõm — nằm ở chính giữa bức tranh.';

      const isTop = r === 0;
      const isBottom = r === rows - 1;
      const isLeft = c === 0;
      const isRight = c === cols - 1;

      if ((isTop || isBottom) && (isLeft || isRight)) {
        category = 'corner';
        const vert = isTop ? 'trên' : 'dưới';
        const horiz = isLeft ? 'trái' : 'phải';
        categoryBadge = `Mảnh góc (${vert}-${horiz})`;
        categoryHint = 'Có 2 cạnh thẳng vuông góc — nằm ở góc khung tranh.';
      } else if (isTop || isBottom || isLeft || isRight) {
        category = 'edge';
        const side = isTop ? 'trên' : isBottom ? 'dưới' : isLeft ? 'trái' : 'phải';
        categoryBadge = `Mảnh cạnh (${side})`;
        categoryHint = `Có 1 cạnh thẳng — nằm ở mép ${side} của khung tranh.`;
      }

      pieces.push({
        id: position,
        position,
        row: r,
        col: c,
        pathD: d,
        center: {
          x: tl.x + cellW / 2,
          y: tl.y + cellH / 2
        },
        bounds,
        cellWidth: cellW,
        cellHeight: cellH,
        category,
        categoryBadge,
        categoryHint
      });
    }
  }

  return pieces;
}
