import React, { useState, useRef, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { FlipchartBoardDoc } from '../types';
import {
  PenTool,
  Highlighter,
  Eraser,
  Type,
  Square,
  Circle,
  Triangle,
  Shapes,
  ArrowUpRight,
  Minus,
  Undo2,
  Redo2,
  Trash2,
  Plus,
  X,
  Download,
  FileText,
  Sparkles,
  Grid,
  AlignJustify,
  Maximize2,
  Minimize2,
  Monitor,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

export type FlipchartTool =
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'text'
  | 'line'
  | 'arrow'
  | 'rect'
  | 'ellipse'
  | 'triangle';

export type FlipchartPaperStyle = 'white' | 'grid' | 'lined' | 'chalkboard';

export interface FlipchartPoint {
  x: number;
  y: number;
}

export interface FlipchartStroke {
  id: string;
  tool: Exclude<FlipchartTool, 'text'>;
  color: string;
  size: number;
  points: FlipchartPoint[];
  isHighlight?: boolean;
}

export interface FlipchartTextItem {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export interface FlipchartPage {
  id: string;
  title: string;
  paper: FlipchartPaperStyle;
  strokes: FlipchartStroke[];
  texts: FlipchartTextItem[];
}

interface FlipchartSyncPayload {
  isOpen: boolean;
  pages: FlipchartPage[];
  activePageIndex: number;
}

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;
const STORAGE_KEY = 'partnerup_flipchart_state_v1';
const CHANNEL_NAME = 'partnerup_flipchart_local_v1';

const DEFAULT_PAGE = (index = 1): FlipchartPage => ({
  id: `page_${Date.now()}_${index}`,
  title: `Lembar ${index}`,
  paper: 'grid',
  strokes: [],
  texts: [],
});

const QUICK_TEMPLATES: Array<{ label: string; text: string }> = [
  {
    label: 'Target Laba -> Unit',
    text: [
      'SIMULASI TARGET PENJUALAN',
      '1. Target Laba Bersih/Bln : Rp __________',
      '2. Biaya Tetap Usaha     : Rp __________',
      '3. Total Beban (1 + 2)   : Rp __________',
      '4. Untung Bersih / Unit  : Rp __________',
      '=> Wajib Laku : ____ unit/bln (____ / hari)',
    ].join('\n'),
  },
  {
    label: 'Margin vs Markup',
    text: [
      'CEK MARGIN SEHAT VALUE PROPOSITION',
      '- HPP Produk + Kemasan VP : Rp __________',
      '- Target Margin (%)       : ____ %',
      '- Harga Jual = HPP / (1 - Margin%) = Rp ______',
      '- Untung Bersih / Unit    : Rp __________',
    ].join('\n'),
  },
  {
    label: 'Angka Jemput Bola',
    text: [
      'CORONG HARIAN (JEMPUT BOLA)',
      '1. Orang Melihat (Traffic) : ____ pasang mata/hari',
      '2. Orang Bertanya (Chat)   : ____ chat/hari',
      '3. Transfer (Closing)      : ____ pembeli/hari',
    ].join('\n'),
  },
  {
    label: 'Copywriting 3 Pilar',
    text: [
      'CONTOH COPYWRITING VP:',
      '1. HOOK MASALAH : ________________________',
      '2. BUKTI NYATA  : ________________________',
      '3. AJAKAN PAKET : ________________________',
    ].join('\n'),
  },
];

const PEN_COLORS = [
  { label: 'Navy Pekat', value: '#1F3A5F' },
  { label: 'Hitam', value: '#111827' },
  { label: 'Merah', value: '#DC2626' },
  { label: 'Oranye', value: '#F28C28' },
  { label: 'Hijau Teal', value: '#0D9488' },
  { label: 'Putih Kapur', value: '#FFFFFF' },
];

export function loadFlipchartStateLocal(): FlipchartSyncPayload {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        return {
          isOpen: Boolean(parsed.isOpen),
          pages: parsed.pages,
          activePageIndex: Math.min(
            typeof parsed.activePageIndex === 'number' ? parsed.activePageIndex : 0,
            parsed.pages.length - 1
          ),
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    isOpen: false,
    pages: [DEFAULT_PAGE(1)],
    activePageIndex: 0,
  };
}

function compactStrokePoints(points: FlipchartPoint[], minDistSq: number): FlipchartPoint[] {
  if (points.length <= 2) return points;
  const result: FlipchartPoint[] = [points[0]];
  let last = points[0];
  for (let i = 1; i < points.length - 1; i++) {
    const pt = points[i];
    const dx = pt.x - last.x;
    const dy = pt.y - last.y;
    if (dx * dx + dy * dy >= minDistSq) {
      result.push(pt);
      last = pt;
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

const roundCoord = (n: number): number => Math.round(n * 10) / 10;

/**
 * Penghalus tulisan tangan ringan (1-pass corner-preserving weighted smoothing)
 * Menghilangkan getaran tangan tanpa merusak bentuk sudut huruf atau angka kecil.
 */
function smoothHandwritingPoints(points: FlipchartPoint[]): FlipchartPoint[] {
  if (points.length < 3) return points;
  const smoothed: FlipchartPoint[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    smoothed.push({
      x: roundCoord(0.18 * prev.x + 0.64 * curr.x + 0.18 * next.x),
      y: roundCoord(0.18 * prev.y + 0.64 * curr.y + 0.18 * next.y),
    });
  }
  smoothed.push(points[points.length - 1]);
  return compactStrokePoints(smoothed, 5);
}

/**
 * Menyelaraskan ujung garis ke sudut horizontal/vertikal apabila mendekati 0°/90° (±7.5°).
 */
function snapLineEndpointAngle(p0: FlipchartPoint, p1: FlipchartPoint): FlipchartPoint {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 16) return p1;
  const angleDeg = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
  if (angleDeg <= 7.5 || angleDeg >= 172.5) {
    return { x: p1.x, y: p0.y };
  }
  if (Math.abs(angleDeg - 90) <= 7.5) {
    return { x: p0.x, y: p1.y };
  }
  return p1;
}

function pointToSegmentDistance(p: FlipchartPoint, a: FlipchartPoint, b: FlipchartPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function triangleDoubleArea(a: FlipchartPoint, b: FlipchartPoint, c: FlipchartPoint): number {
  return Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
}

/**
 * Merapikan 3 titik sudut segitiga agar sisi hampir horizontal/vertikal rata sempurna
 * dan puncak segitiga sama kaki berada tepat di tengah alasnya.
 */
function cleanTriangleVertices(
  verts: [FlipchartPoint, FlipchartPoint, FlipchartPoint]
): [FlipchartPoint, FlipchartPoint, FlipchartPoint] {
  const out: [FlipchartPoint, FlipchartPoint, FlipchartPoint] = [
    { x: roundCoord(verts[0].x), y: roundCoord(verts[0].y) },
    { x: roundCoord(verts[1].x), y: roundCoord(verts[1].y) },
    { x: roundCoord(verts[2].x), y: roundCoord(verts[2].y) },
  ];

  // Ratakan sisi yang hampir horizontal atau hampir vertikal (±7.5°)
  const pairs: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [2, 0],
  ];
  for (const [i, j] of pairs) {
    const a = out[i];
    const b = out[j];
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    if (Math.hypot(dx, dy) < 20) continue;
    if (dx > 0 && dy / dx <= 0.132) {
      const avgY = roundCoord((a.y + b.y) / 2);
      out[i] = { ...out[i], y: avgY };
      out[j] = { ...out[j], y: avgY };
    } else if (dy > 0 && dx / dy <= 0.132) {
      const avgX = roundCoord((a.x + b.x) / 2);
      out[i] = { ...out[i], x: avgX };
      out[j] = { ...out[j], x: avgX };
    }
  }

  // Jika ada sisi alas horizontal/vertikal dan sudut ke-3 hampir simetris di tengah, pusatkan puncaknya
  for (const [i, j] of pairs) {
    const k = 3 - i - j;
    const a = out[i];
    const b = out[j];
    const apex = out[k];
    const baseW = Math.abs(b.x - a.x);
    const baseH = Math.abs(b.y - a.y);
    if (a.y === b.y && baseW >= 24) {
      const midX = (a.x + b.x) / 2;
      if (Math.abs(apex.x - midX) <= baseW * 0.1) {
        out[k] = { ...apex, x: roundCoord(midX) };
      }
    } else if (a.x === b.x && baseH >= 24) {
      const midY = (a.y + b.y) / 2;
      if (Math.abs(apex.y - midY) <= baseH * 0.1) {
        out[k] = { ...apex, y: roundCoord(midY) };
      }
    }
  }

  return out;
}

/**
 * Deteksi & perapi bentuk geometris otomatis (Opsi 2 — Smart Shape Snap, 0 ms):
 * - Garis lurus (otomatis rata horizontal/vertikal bila mendekati 0°/90°)
 * - Kotak / Persegi
 * - Lingkaran / Elips
 * - Segitiga
 */
function detectAndSnapShape(
  points: FlipchartPoint[],
  isHoldSnap: boolean
): {
  tool: 'line' | 'rect' | 'ellipse' | 'triangle';
  label: string;
  points: FlipchartPoint[];
} | null {
  if (points.length < 2) return null;

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;
  let pathLen = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    if (i > 0) {
      pathLen += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y);
    }
  }

  const start = points[0];
  const end = points[points.length - 1];
  const directDist = Math.hypot(end.x - start.x, end.y - start.y);
  const w = maxX - minX;
  const h = maxY - minY;
  const diag = Math.hypot(w, h);

  // 1. Cek apakah goresan merupakan Garis Lurus
  const minLineLen = isHoldSnap ? 32 : 115;
  if (directDist >= minLineLen && pathLen > 0) {
    const efficiency = directDist / pathLen;
    let maxDev = 0;
    const vx = end.x - start.x;
    const vy = end.y - start.y;
    for (let i = 1; i < points.length - 1; i++) {
      const cross = Math.abs(vx * (start.y - points[i].y) - (start.x - points[i].x) * vy);
      const dev = cross / directDist;
      if (dev > maxDev) maxDev = dev;
    }

    const minEff = isHoldSnap ? 0.88 : 0.94;
    const maxAllowedDev = Math.max(isHoldSnap ? 14 : 8, directDist * (isHoldSnap ? 0.085 : 0.045));

    if (efficiency >= minEff && maxDev <= maxAllowedDev) {
      const snappedEnd = snapLineEndpointAngle(start, end);
      let finalStart = start;
      let finalEnd = snappedEnd;
      if (snappedEnd.y === start.y && start.y !== end.y) {
        const avgY = roundCoord((start.y + end.y) / 2);
        finalStart = { x: start.x, y: avgY };
        finalEnd = { x: end.x, y: avgY };
      } else if (snappedEnd.x === start.x && start.x !== end.x) {
        const avgX = roundCoord((start.x + end.x) / 2);
        finalStart = { x: avgX, y: start.y };
        finalEnd = { x: avgX, y: end.y };
      }
      return {
        tool: 'line',
        label: 'Garis Lurus',
        points: [finalStart, finalEnd],
      };
    }
  }

  // 2. Cek apakah goresan merupakan Kurva Tertutup (Segitiga, Lingkaran/Elips, atau Kotak)
  const minLoopBox = isHoldSnap ? 28 : 58;
  const minLoopDiag = isHoldSnap ? 42 : 82;
  const maxGap = Math.max(36, diag * (isHoldSnap ? 0.44 : 0.28));

  if (
    points.length >= 8 &&
    (w >= minLoopBox || h >= minLoopBox) &&
    diag >= minLoopDiag &&
    Math.min(w, h) >= 16 &&
    directDist <= maxGap &&
    pathLen >= 2 * (w + h) * 0.48
  ) {
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = Math.max(1, w / 2);
    const ry = Math.max(1, h / 2);
    const avgRadius = (rx + ry) / 2;

    let ellipseErrSum = 0;
    let rectErrSum = 0;

    for (let i = 0; i < points.length; i++) {
      const nx = Math.abs(points[i].x - cx) / rx;
      const ny = Math.abs(points[i].y - cy) / ry;
      const er = Math.hypot(nx, ny);
      const rr = Math.max(nx, ny);
      ellipseErrSum += Math.abs(er - 1);
      rectErrSum += Math.abs(rr - 1);
    }

    const ellipseErr = ellipseErrSum / points.length;
    const rectErr = rectErrSum / points.length;

    // Ekstraksi 3 sudut maksimum untuk mendeteksi Segitiga
    let v1 = points[0];
    let maxDistCenter = -1;
    for (const p of points) {
      const d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
      if (d > maxDistCenter) {
        maxDistCenter = d;
        v1 = p;
      }
    }

    let v2 = points[0];
    let maxDistV1 = -1;
    for (const p of points) {
      const d = (p.x - v1.x) * (p.x - v1.x) + (p.y - v1.y) * (p.y - v1.y);
      if (d > maxDistV1) {
        maxDistV1 = d;
        v2 = p;
      }
    }

    let v3 = points[0];
    let maxArea = -1;
    for (const p of points) {
      const a = triangleDoubleArea(v1, v2, p);
      if (a > maxArea) {
        maxArea = a;
        v3 = p;
      }
    }

    for (let pass = 0; pass < 2; pass++) {
      let bestArea = triangleDoubleArea(v1, v2, v3);
      for (const p of points) {
        const a = triangleDoubleArea(p, v2, v3);
        if (a > bestArea) {
          bestArea = a;
          v1 = p;
        }
      }
      bestArea = triangleDoubleArea(v1, v2, v3);
      for (const p of points) {
        const a = triangleDoubleArea(v1, p, v3);
        if (a > bestArea) {
          bestArea = a;
          v2 = p;
        }
      }
      bestArea = triangleDoubleArea(v1, v2, v3);
      for (const p of points) {
        const a = triangleDoubleArea(v1, v2, p);
        if (a > bestArea) {
          bestArea = a;
          v3 = p;
        }
      }
    }

    const e12 = Math.hypot(v2.x - v1.x, v2.y - v1.y);
    const e23 = Math.hypot(v3.x - v2.x, v3.y - v2.y);
    const e31 = Math.hypot(v1.x - v3.x, v1.y - v3.y);
    const minEdge = Math.min(e12, e23, e31);
    const maxEdge = Math.max(e12, e23, e31);
    const dblArea = triangleDoubleArea(v1, v2, v3);
    const altitude = maxEdge > 0 ? dblArea / maxEdge : 0;

    let triErr = Infinity;
    let triMaxErr = Infinity;
    if (minEdge >= diag * 0.25 && altitude >= diag * 0.22) {
      let triErrSum = 0;
      let maxSegDist = 0;
      for (const p of points) {
        const d = Math.min(
          pointToSegmentDistance(p, v1, v2),
          pointToSegmentDistance(p, v2, v3),
          pointToSegmentDistance(p, v3, v1)
        );
        triErrSum += d;
        if (d > maxSegDist) maxSegDist = d;
      }
      triErr = triErrSum / points.length / avgRadius;
      triMaxErr = maxSegDist / avgRadius;
    }

    const tol = isHoldSnap ? 0.23 : 0.145;
    const triTol = isHoldSnap ? 0.19 : 0.13;
    const triMaxTol = isHoldSnap ? 0.44 : 0.31;

    if (
      triErr <= triTol &&
      triMaxErr <= triMaxTol &&
      triErr < ellipseErr &&
      triErr < rectErr
    ) {
      return {
        tool: 'triangle',
        label: 'Segitiga',
        points: cleanTriangleVertices([v1, v2, v3]),
      };
    }

    if (ellipseErr <= tol && ellipseErr < rectErr) {
      const aspect = Math.min(w, h) / Math.max(w, h);
      if (aspect >= 0.85) {
        const r = (rx + ry) / 2;
        return {
          tool: 'ellipse',
          label: 'Lingkaran',
          points: [
            { x: roundCoord(cx - r), y: roundCoord(cy - r) },
            { x: roundCoord(cx + r), y: roundCoord(cy + r) },
          ],
        };
      }
      return {
        tool: 'ellipse',
        label: 'Elips',
        points: [
          { x: roundCoord(minX), y: roundCoord(minY) },
          { x: roundCoord(maxX), y: roundCoord(maxY) },
        ],
      };
    }

    if (rectErr <= tol && rectErr <= ellipseErr) {
      return {
        tool: 'rect',
        label: 'Kotak',
        points: [
          { x: roundCoord(minX), y: roundCoord(minY) },
          { x: roundCoord(maxX), y: roundCoord(maxY) },
        ],
      };
    }
  }

  return null;
}

function serializePagesSafely(pages: FlipchartPage[], maxBytes = 435000): string {
  const raw = JSON.stringify(pages);
  if (raw.length <= maxBytes) return raw;

  // Progressively compact redundant points on freehand strokes if dense drawing approaches Firestore limit
  for (const distSq of [25, 64, 144, 324]) {
    const compacted = pages.map((pg) => ({
      ...pg,
      strokes: pg.strokes.map((stk) =>
        stk.tool === 'triangle'
          ? { ...stk, points: stk.points.slice(0, 3) }
          : stk.tool === 'line' || stk.tool === 'arrow' || stk.tool === 'rect' || stk.tool === 'ellipse'
            ? { ...stk, points: stk.points.length >= 2 ? [stk.points[0], stk.points[stk.points.length - 1]] : stk.points }
            : { ...stk, points: compactStrokePoints(stk.points, distSq) }
      ),
    }));
    const candidate = JSON.stringify(compacted);
    if (candidate.length <= maxBytes) {
      return candidate;
    }
  }

  return raw.slice(0, maxBytes);
}

function saveAndBroadcastFlipchartState(payload: FlipchartSyncPayload): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota error
  }
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(CHANNEL_NAME);
      ch.postMessage(payload);
      ch.close();
    }
  } catch {
    // ignore
  }
}

/**
 * Menggambar seluruh coretan + teks ke Canvas 2D context berukuran VIRTUAL_WIDTH x VIRTUAL_HEIGHT
 */
function renderStrokesAndTexts(
  ctx: CanvasRenderingContext2D,
  page: FlipchartPage,
  activeDraftStroke: FlipchartStroke | null,
  includePaperBackground: boolean
): void {
  ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  if (includePaperBackground) {
    if (page.paper === 'chalkboard') {
      ctx.fillStyle = '#14332C';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    }

    if (page.paper === 'grid') {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let x = 0; x <= VIRTUAL_WIDTH; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, VIRTUAL_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= VIRTUAL_HEIGHT; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(VIRTUAL_WIDTH, y);
        ctx.stroke();
      }
    } else if (page.paper === 'lined') {
      ctx.strokeStyle = '#DBEAFE';
      ctx.lineWidth = 1.2;
      for (let y = 48; y <= VIRTUAL_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(VIRTUAL_WIDTH, y);
        ctx.stroke();
      }
      ctx.strokeStyle = '#FCA5A5';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(96, 0);
      ctx.lineTo(96, VIRTUAL_HEIGHT);
      ctx.stroke();
    }
  }

  const allStrokes = activeDraftStroke ? [...page.strokes, activeDraftStroke] : page.strokes;

  allStrokes.forEach((stroke) => {
    if (stroke.points.length === 0) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'eraser') {
      if (includePaperBackground) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = page.paper === 'chalkboard' ? '#14332C' : '#FFFFFF';
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      }
      ctx.lineWidth = stroke.size * 3.2;
    } else if (stroke.tool === 'highlighter' || stroke.isHighlight) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
    }

    const pts = stroke.points;
    if (stroke.tool === 'line' && pts.length >= 2) {
      const p0 = pts[0];
      const p1 = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    } else if (stroke.tool === 'arrow' && pts.length >= 2) {
      const p0 = pts[0];
      const p1 = pts[pts.length - 1];
      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const headLen = Math.max(14, stroke.size * 3.5);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(
        p1.x - headLen * Math.cos(angle - Math.PI / 6),
        p1.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(
        p1.x - headLen * Math.cos(angle + Math.PI / 6),
        p1.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    } else if (stroke.tool === 'rect' && pts.length >= 2) {
      const p0 = pts[0];
      const p1 = pts[pts.length - 1];
      ctx.beginPath();
      ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
    } else if (stroke.tool === 'ellipse' && pts.length >= 2) {
      const p0 = pts[0];
      const p1 = pts[pts.length - 1];
      const cx = (p0.x + p1.x) / 2;
      const cy = (p0.y + p1.y) / 2;
      const rx = Math.max(1, Math.abs(p1.x - p0.x) / 2);
      const ry = Math.max(1, Math.abs(p1.y - p0.y) / 2);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (stroke.tool === 'triangle' && pts.length >= 2) {
      ctx.beginPath();
      if (pts.length >= 3) {
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
      } else {
        const p0 = pts[0];
        const p1 = pts[1];
        ctx.moveTo((p0.x + p1.x) / 2, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p0.x, p1.y);
      }
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) {
        ctx.lineTo(pts[0].x + 0.1, pts[0].y + 0.1);
      } else if (pts.length === 2) {
        ctx.lineTo(pts[1].x, pts[1].y);
      } else {
        // Catmull-Rom -> Cubic Bezier untuk lekukan huruf yang mulus dan presisi melewati tiap titik
        for (let i = 0; i < pts.length - 1; i++) {
          const pPrev = pts[Math.max(0, i - 1)];
          const p0 = pts[i];
          const p1 = pts[i + 1];
          const pNext = pts[Math.min(pts.length - 1, i + 2)];

          const cp1x = p0.x + (p1.x - pPrev.x) / 6;
          const cp1y = p0.y + (p1.y - pPrev.y) / 6;
          const cp2x = p1.x - (pNext.x - p0.x) / 6;
          const cp2y = p1.y - (pNext.y - p0.y) / 6;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1.x, p1.y);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  });

  // Render Text Items
  page.texts.forEach((t) => {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = t.color;
    ctx.font = `700 ${t.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textBaseline = 'top';
    const lines = t.text.split('\n');
    const lineHeight = t.fontSize * 1.32;
    lines.forEach((line, i) => {
      ctx.fillText(line, t.x, t.y + i * lineHeight);
    });
    ctx.restore();
  });
}

interface FlipchartCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  readOnlyMirror?: boolean;
  seminarTitle?: string;
  flipchartRemote?: FlipchartBoardDoc | null;
  boardDeviceId?: string;
  onPublishFlipchart?: (payload: {
    isOpen: boolean;
    syncToProjector: boolean;
    activePageIndex: number;
    pagesJson: string;
    revision?: number;
  }) => void;
}

export const FlipchartCanvasModal: React.FC<FlipchartCanvasModalProps> = ({
  isOpen,
  onClose,
  readOnlyMirror = false,
  seminarTitle = 'Simulasi Kelas UMKM',
  flipchartRemote = null,
  boardDeviceId = '',
  onPublishFlipchart,
}) => {
  const [pages, setPages] = useState<FlipchartPage[]>(() => loadFlipchartStateLocal().pages);
  const [activePageIndex, setActivePageIndex] = useState<number>(
    () => loadFlipchartStateLocal().activePageIndex
  );
  const [syncToProjector, setSyncToProjector] = useState<boolean>(true);

  // Drawing Tool States
  const [tool, setTool] = useState<FlipchartTool>('pen');
  const [color, setColor] = useState<string>('#1F3A5F');
  const [strokeSize, setStrokeSize] = useState<number>(4);
  const [textFontSize, setTextFontSize] = useState<number>(28);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [isFooterExpanded, setIsFooterExpanded] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [mirrorBarHovered, setMirrorBarHovered] = useState<boolean>(false);
  const [smoothWriting, setSmoothWriting] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('obee_flipchart_smooth_v1');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const toggleSmoothWriting = () => {
    setSmoothWriting((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('obee_flipchart_smooth_v1', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [shapeSnap, setShapeSnap] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('obee_flipchart_shape_snap_v1');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const shapeSnapRef = useRef<boolean>(shapeSnap);
  shapeSnapRef.current = shapeSnap;

  const toggleShapeSnap = () => {
    setShapeSnap((prev) => {
      const next = !prev;
      shapeSnapRef.current = next;
      try {
        window.localStorage.setItem('obee_flipchart_shape_snap_v1', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [recentSnapRevert, setRecentSnapRevert] = useState<{
    pageId: string;
    strokeId: string;
    shapeLabel: string;
    rawStroke: FlipchartStroke;
  } | null>(null);

  // Undo/Redo stacks per page id
  const [redoMap, setRedoMap] = useState<
    Record<string, Array<{ strokes: FlipchartStroke[]; texts: FlipchartTextItem[] }>>
  >({});

  // Floating Text Input State
  const [textEditor, setTextEditor] = useState<{
    x: number;
    y: number;
    value: string;
    editingId?: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draftStrokeRef = useRef<FlipchartStroke | null>(null);
  const dragOriginRef = useRef<FlipchartPoint | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const holdSnapTimerRef = useRef<number | null>(null);
  const holdSnappedModeRef = useRef<'none' | 'line' | 'shape'>('none');
  const holdSnappedLabelRef = useRef<string>('');
  const rawPointsBeforeSnapRef = useRef<FlipchartPoint[] | null>(null);
  const snapRevertTimerRef = useRef<number | null>(null);
  const pagesRef = useRef<FlipchartPage[]>(pages);
  const activePageIndexRef = useRef<number>(activePageIndex);
  const syncToProjectorRef = useRef<boolean>(syncToProjector);
  const revisionRef = useRef<number>(0);
  const hasLocalEditsRef = useRef<boolean>(false);
  const pendingRemoteRef = useRef<FlipchartBoardDoc | null>(null);
  const lastLocalWriteTsRef = useRef<number>(0);
  const lastAppliedRemoteTsRef = useRef<number>(0);
  const wasOpenRef = useRef<boolean>(false);

  const clearHoldSnapTimer = useCallback(() => {
    if (holdSnapTimerRef.current !== null) {
      window.clearTimeout(holdSnapTimerRef.current);
      holdSnapTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearHoldSnapTimer();
      if (snapRevertTimerRef.current !== null) {
        window.clearTimeout(snapRevertTimerRef.current);
      }
    };
  }, [clearHoldSnapTimer]);

  useEffect(() => {
    if (!isOpen || !readOnlyMirror) {
      setMirrorBarHovered(false);
    }
    if (!isOpen) {
      clearHoldSnapTimer();
    }
  }, [isOpen, readOnlyMirror, clearHoldSnapTimer]);

  const safeIndex = Math.min(activePageIndex, Math.max(0, pages.length - 1));
  const currentPage = pages[safeIndex] || pages[0];

  const publishSnapshot = useCallback(
    (nextOpen: boolean, nextSync: boolean, nextPages: FlipchartPage[], nextIdx: number) => {
      if (readOnlyMirror) return;
      const nextRev = Math.max(revisionRef.current + 1, Date.now());
      revisionRef.current = nextRev;
      lastLocalWriteTsRef.current = nextRev;
      saveAndBroadcastFlipchartState({
        isOpen: nextOpen,
        pages: nextPages,
        activePageIndex: nextIdx,
      });

      if (onPublishFlipchart) {
        try {
          const serialized = serializePagesSafely(nextPages);
          onPublishFlipchart({
            isOpen: nextOpen,
            syncToProjector: nextSync,
            activePageIndex: Math.min(Math.max(0, nextIdx), 25),
            pagesJson: serialized,
            revision: nextRev,
          });
        } catch {
          // ignore serialization errors
        }
      }
    },
    [readOnlyMirror, onPublishFlipchart]
  );

  // Synchronous local commit helper: updates refs immediately before React state so rapid consecutive strokes never drop
  const commitLocalChange = useCallback(
    (
      nextPages: FlipchartPage[],
      nextIdx: number,
      nextSync: boolean = syncToProjectorRef.current,
      shouldPublish = true
    ) => {
      const clampedIdx = Math.min(Math.max(0, nextIdx), Math.max(0, nextPages.length - 1));
      pagesRef.current = nextPages;
      activePageIndexRef.current = clampedIdx;
      syncToProjectorRef.current = nextSync;
      hasLocalEditsRef.current = true;

      setPages(nextPages);
      setActivePageIndex(clampedIdx);
      setSyncToProjector(nextSync);

      if (shouldPublish && isOpen) {
        publishSnapshot(true, nextSync, nextPages, clampedIdx);
      } else {
        saveAndBroadcastFlipchartState({
          isOpen,
          pages: nextPages,
          activePageIndex: clampedIdx,
        });
      }
    },
    [isOpen, publishSnapshot]
  );

  const applyRemoteBoard = useCallback(
    (remote: FlipchartBoardDoc, forceAdoptIfUntouched = false): boolean => {
      if (!remote) return false;
      if (!readOnlyMirror && remote.sourceDeviceId === boardDeviceId) {
        return false;
      }

      const localHasAnyContent = pagesRef.current.some(
        (pg) => pg.strokes.length > 0 || pg.texts.length > 0
      );
      const allowUntouchedAdopt =
        forceAdoptIfUntouched && !hasLocalEditsRef.current && !localHasAnyContent;

      if (!allowUntouchedAdopt && remote.updatedAt <= revisionRef.current) {
        return false;
      }
      if (!readOnlyMirror && !allowUntouchedAdopt && remote.updatedAt <= lastLocalWriteTsRef.current) {
        return false;
      }

      if (!readOnlyMirror && isDrawingRef.current) {
        pendingRemoteRef.current = remote;
        return false;
      }

      try {
        const parsed = JSON.parse(remote.pagesJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nextIdx = Math.min(
            typeof remote.activePageIndex === 'number' ? remote.activePageIndex : 0,
            parsed.length - 1
          );
          revisionRef.current = Math.max(revisionRef.current, remote.updatedAt);
          lastAppliedRemoteTsRef.current = remote.updatedAt;
          pagesRef.current = parsed;
          activePageIndexRef.current = nextIdx;
          setPages(parsed);
          setActivePageIndex(nextIdx);
          saveAndBroadcastFlipchartState({
            isOpen: remote.isOpen,
            pages: parsed,
            activePageIndex: nextIdx,
          });
          return true;
        }
      } catch {
        // ignore malformed remote JSON
      }
      return false;
    },
    [boardDeviceId, readOnlyMirror]
  );

  // Apply incoming remote updates from Firestore without re-publishing (prevents echo ping-pong loop)
  useEffect(() => {
    if (!flipchartRemote) return;
    applyRemoteBoard(flipchartRemote, !hasLocalEditsRef.current);
  }, [flipchartRemote, applyRemoteBoard]);

  // Publish ONLY on explicit open/close modal transitions (never on every remote pages state update)
  useEffect(() => {
    if (readOnlyMirror) return;
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      if (flipchartRemote) {
        applyRemoteBoard(flipchartRemote, true);
      }
      publishSnapshot(
        true,
        syncToProjectorRef.current,
        pagesRef.current,
        activePageIndexRef.current
      );
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      publishSnapshot(
        false,
        syncToProjectorRef.current,
        pagesRef.current,
        activePageIndexRef.current
      );
    }
  }, [isOpen, readOnlyMirror, flipchartRemote, applyRemoteBoard, publishSnapshot]);

  // Listen to BroadcastChannel in same-browser Extend Projector Mirror mode (zero latency)
  useEffect(() => {
    if (!readOnlyMirror) return;
    const handleSync = (data: FlipchartSyncPayload) => {
      if (Array.isArray(data.pages) && data.pages.length > 0) {
        setPages(data.pages);
        setActivePageIndex(data.activePageIndex || 0);
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data) handleSync(event.data as FlipchartSyncPayload);
        };
      }
    } catch {
      // ignore
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          handleSync(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, [readOnlyMirror]);

  // Render canvas whenever currentPage changes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderStrokesAndTexts(ctx, currentPage, draftStrokeRef.current, false);
  }, [currentPage]);

  useEffect(() => {
    if (isOpen) {
      redrawCanvas();
    }
  }, [isOpen, redrawCanvas]);

  const getVirtualCoords = (e: React.PointerEvent<HTMLCanvasElement>): FlipchartPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: roundCoord(((e.clientX - rect.left) / rect.width) * VIRTUAL_WIDTH),
      y: roundCoord(((e.clientY - rect.top) / rect.height) * VIRTUAL_HEIGHT),
    };
  };

  const commitTextItem = () => {
    if (!textEditor) return;
    const trimmed = textEditor.value.trim();
    if (trimmed) {
      const curIdx = Math.min(activePageIndexRef.current, Math.max(0, pagesRef.current.length - 1));
      const nextPages = pagesRef.current.map((pg, idx) => {
        if (idx !== curIdx) return pg;
        const nextTexts = textEditor.editingId
          ? pg.texts.map((t) =>
              t.id === textEditor.editingId ? { ...t, text: trimmed, color, fontSize: textFontSize } : t
            )
          : [
              ...pg.texts,
              {
                id: `txt_${Date.now()}`,
                x: textEditor.x,
                y: textEditor.y,
                text: trimmed,
                color: pg.paper === 'chalkboard' && color === '#1F3A5F' ? '#FFFFFF' : color,
                fontSize: textFontSize,
              },
            ];
        return { ...pg, texts: nextTexts };
      });
      commitLocalChange(nextPages, curIdx);
    }
    setTextEditor(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnlyMirror) return;
    e.preventDefault();
    const pt = getVirtualCoords(e);

    if (tool === 'text') {
      if (textEditor) {
        commitTextItem();
        return;
      }
      setTextEditor({
        x: Math.min(pt.x, VIRTUAL_WIDTH - 260),
        y: Math.min(pt.y, VIRTUAL_HEIGHT - 80),
        value: '',
      });
      return;
    }

    if (textEditor) {
      commitTextItem();
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    clearHoldSnapTimer();
    holdSnappedModeRef.current = 'none';
    holdSnappedLabelRef.current = '';
    rawPointsBeforeSnapRef.current = null;
    isDrawingRef.current = true;

    const activePg = pagesRef.current[activePageIndexRef.current] || currentPage;
    const effectiveColor =
      activePg.paper === 'chalkboard' && (color === '#1F3A5F' || color === '#111827')
        ? '#FFFFFF'
        : color;

    draftStrokeRef.current = {
      id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tool,
      color: tool === 'highlighter' && color === '#1F3A5F' ? '#FACC15' : effectiveColor,
      size: strokeSize,
      points: [pt],
      isHighlight: tool === 'highlighter',
    };
    dragOriginRef.current = pt;
    redrawCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnlyMirror || !isDrawingRef.current || !draftStrokeRef.current) return;
    const pt = getVirtualCoords(e);
    const activeTool = draftStrokeRef.current.tool;
    const pts = draftStrokeRef.current.points;

    if (holdSnappedModeRef.current === 'line') {
      const p0 = pts[0];
      draftStrokeRef.current.points = [p0, snapLineEndpointAngle(p0, pt)];
      redrawCanvas();
      return;
    }

    if (holdSnappedModeRef.current === 'shape') {
      return;
    }

    if (
      activeTool === 'line' ||
      activeTool === 'arrow' ||
      activeTool === 'rect' ||
      activeTool === 'ellipse' ||
      activeTool === 'triangle'
    ) {
      const origin = dragOriginRef.current || pts[0];
      if (activeTool === 'triangle') {
        draftStrokeRef.current.points = [
          { x: roundCoord((origin.x + pt.x) / 2), y: origin.y },
          pt,
          { x: origin.x, y: pt.y },
        ];
      } else {
        const nextPt = activeTool === 'line' ? snapLineEndpointAngle(origin, pt) : pt;
        draftStrokeRef.current.points = [origin, nextPt];
      }
      redrawCanvas();
      return;
    }

    const last = pts[pts.length - 1];
    const minSq = smoothWriting && (activeTool === 'pen' || activeTool === 'highlighter') ? 4 : 9;
    if (last) {
      const dx = pt.x - last.x;
      const dy = pt.y - last.y;
      if (dx * dx + dy * dy < minSq) {
        return;
      }
      if (smoothWriting && (activeTool === 'pen' || activeTool === 'highlighter')) {
        // Live anti-tremor EMA stabilizer (0 ms latensi)
        const alpha = 0.62;
        pts.push({
          x: roundCoord(last.x + alpha * dx),
          y: roundCoord(last.y + alpha * dy),
        });
      } else {
        pts.push(pt);
      }
    } else {
      pts.push(pt);
    }

    if (shapeSnapRef.current && (activeTool === 'pen' || activeTool === 'highlighter')) {
      clearHoldSnapTimer();
      holdSnapTimerRef.current = window.setTimeout(() => {
        if (!isDrawingRef.current || !draftStrokeRef.current) return;
        const rawPts = [...draftStrokeRef.current.points];
        const snapped = detectAndSnapShape(rawPts, true);
        if (snapped) {
          rawPointsBeforeSnapRef.current = rawPts;
          if (draftStrokeRef.current.tool === 'highlighter') {
            draftStrokeRef.current.isHighlight = true;
          }
          draftStrokeRef.current.tool = snapped.tool;
          draftStrokeRef.current.points = snapped.points;
          holdSnappedModeRef.current = snapped.tool === 'line' ? 'line' : 'shape';
          holdSnappedLabelRef.current = snapped.label;
          redrawCanvas();
        }
      }, 380);
    }

    redrawCanvas();
  };

  const showSnapRevertOption = (
    pageId: string,
    strokeId: string,
    shapeLabel: string,
    rawStroke: FlipchartStroke
  ) => {
    if (snapRevertTimerRef.current !== null) {
      window.clearTimeout(snapRevertTimerRef.current);
    }
    setRecentSnapRevert({ pageId, strokeId, shapeLabel, rawStroke });
    snapRevertTimerRef.current = window.setTimeout(() => {
      setRecentSnapRevert(null);
      snapRevertTimerRef.current = null;
    }, 3500);
  };

  const handleRevertLastSnap = () => {
    if (!recentSnapRevert) return;
    const { pageId, strokeId, rawStroke } = recentSnapRevert;
    const nextPages = pagesRef.current.map((pg) =>
      pg.id === pageId
        ? {
            ...pg,
            strokes: pg.strokes.map((stk) => (stk.id === strokeId ? rawStroke : stk)),
          }
        : pg
    );
    commitLocalChange(nextPages, activePageIndexRef.current);
    setRecentSnapRevert(null);
    if (snapRevertTimerRef.current !== null) {
      window.clearTimeout(snapRevertTimerRef.current);
      snapRevertTimerRef.current = null;
    }
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    clearHoldSnapTimer();
    if (readOnlyMirror || !isDrawingRef.current || !draftStrokeRef.current) return;
    isDrawingRef.current = false;
    const rawStroke = draftStrokeRef.current;
    draftStrokeRef.current = null;

    const curIdx = Math.min(activePageIndexRef.current, Math.max(0, pagesRef.current.length - 1));
    const curPg = pagesRef.current[curIdx];

    let finishedStroke: FlipchartStroke = rawStroke;
    const wasHoldSnapped = holdSnappedModeRef.current !== 'none';
    const holdLabel = holdSnappedLabelRef.current;
    const savedRawPts = rawPointsBeforeSnapRef.current;
    holdSnappedModeRef.current = 'none';
    holdSnappedLabelRef.current = '';
    rawPointsBeforeSnapRef.current = null;

    if (wasHoldSnapped) {
      if (curPg && savedRawPts) {
        const fallbackPts = smoothWriting ? smoothHandwritingPoints(savedRawPts) : savedRawPts;
        showSnapRevertOption(curPg.id, rawStroke.id, holdLabel || 'Bentuk', {
          ...rawStroke,
          tool: rawStroke.isHighlight ? 'highlighter' : 'pen',
          points: fallbackPts,
        });
      }
    } else if (rawStroke.tool === 'pen' || rawStroke.tool === 'highlighter') {
      let finalPoints = rawStroke.points;
      if (e && canvasRef.current) {
        const endPt = getVirtualCoords(e);
        const lastPt = finalPoints[finalPoints.length - 1];
        if (!lastPt || Math.hypot(endPt.x - lastPt.x, endPt.y - lastPt.y) >= 1.5) {
          finalPoints = [...finalPoints, endPt];
        }
      }

      const snapped = shapeSnapRef.current ? detectAndSnapShape(finalPoints, false) : null;
      if (snapped) {
        const fallbackPts = smoothWriting ? smoothHandwritingPoints(finalPoints) : finalPoints;
        finishedStroke = {
          ...rawStroke,
          tool: snapped.tool,
          isHighlight: rawStroke.tool === 'highlighter' || rawStroke.isHighlight,
          points: snapped.points,
        };
        if (curPg) {
          showSnapRevertOption(curPg.id, rawStroke.id, snapped.label, {
            ...rawStroke,
            points: fallbackPts,
          });
        }
      } else {
        if (smoothWriting) {
          finalPoints = smoothHandwritingPoints(finalPoints);
        }
        finishedStroke = {
          ...rawStroke,
          points: finalPoints,
        };
      }
    }

    const nextPages = pagesRef.current.map((pg, idx) =>
      idx === curIdx ? { ...pg, strokes: [...pg.strokes, finishedStroke] } : pg
    );
    commitLocalChange(nextPages, curIdx);
    pendingRemoteRef.current = null;
    if (curPg) {
      setRedoMap((prev) => ({ ...prev, [curPg.id]: [] }));
    }
  };

  const handleUndo = () => {
    const curIdx = Math.min(activePageIndexRef.current, Math.max(0, pagesRef.current.length - 1));
    const curPg = pagesRef.current[curIdx];
    if (!curPg) return;
    if (curPg.strokes.length === 0 && curPg.texts.length === 0) return;

    const snapshot = { strokes: curPg.strokes, texts: curPg.texts };
    setRedoMap((prev) => ({
      ...prev,
      [curPg.id]: [...(prev[curPg.id] || []), snapshot],
    }));

    const nextPages = pagesRef.current.map((pg, idx) => {
      if (idx !== curIdx) return pg;
      if (pg.strokes.length > 0) {
        return { ...pg, strokes: pg.strokes.slice(0, -1) };
      }
      return { ...pg, texts: pg.texts.slice(0, -1) };
    });
    commitLocalChange(nextPages, curIdx);
  };

  const handleRedo = () => {
    const curIdx = Math.min(activePageIndexRef.current, Math.max(0, pagesRef.current.length - 1));
    const curPg = pagesRef.current[curIdx];
    if (!curPg) return;
    const stack = redoMap[curPg.id] || [];
    if (stack.length === 0) return;
    const last = stack[stack.length - 1];
    setRedoMap((prev) => ({
      ...prev,
      [curPg.id]: stack.slice(0, -1),
    }));
    const nextPages = pagesRef.current.map((pg, idx) =>
      idx === curIdx ? { ...pg, strokes: last.strokes, texts: last.texts } : pg
    );
    commitLocalChange(nextPages, curIdx);
  };

  const handleClearCurrentPage = () => {
    const curIdx = Math.min(activePageIndexRef.current, Math.max(0, pagesRef.current.length - 1));
    const curPg = pagesRef.current[curIdx];
    if (!curPg) return;
    const snapshot = { strokes: curPg.strokes, texts: curPg.texts };
    setRedoMap((prev) => ({
      ...prev,
      [curPg.id]: [...(prev[curPg.id] || []), snapshot],
    }));
    const nextPages = pagesRef.current.map((pg, idx) =>
      idx === curIdx ? { ...pg, strokes: [], texts: [] } : pg
    );
    commitLocalChange(nextPages, curIdx);
  };

  const handleAddPage = () => {
    const nextNum = pagesRef.current.length + 1;
    const newPg = DEFAULT_PAGE(nextNum);
    const nextPages = [...pagesRef.current, newPg];
    commitLocalChange(nextPages, nextPages.length - 1);
  };

  const handleDeletePage = (idxToDelete: number) => {
    if (pagesRef.current.length <= 1) {
      handleClearCurrentPage();
      return;
    }
    const nextPages = pagesRef.current.filter((_, i) => i !== idxToDelete);
    const curIdx = activePageIndexRef.current;
    const nextIdx =
      curIdx >= nextPages.length ? Math.max(0, nextPages.length - 1) : curIdx;
    commitLocalChange(nextPages, nextIdx);
  };

  const handleChangePaper = (paper: FlipchartPaperStyle) => {
    const curIdx = Math.min(activePageIndexRef.current, Math.max(0, pagesRef.current.length - 1));
    const nextPages = pagesRef.current.map((pg, idx) =>
      idx === curIdx ? { ...pg, paper } : pg
    );
    if (paper === 'chalkboard' && (color === '#1F3A5F' || color === '#111827')) {
      setColor('#FFFFFF');
    } else if (paper !== 'chalkboard' && color === '#FFFFFF') {
      setColor('#1F3A5F');
    }
    commitLocalChange(nextPages, curIdx);
  };

  const handleInsertTemplate = (templateText: string) => {
    const curIdx = Math.min(activePageIndexRef.current, Math.max(0, pagesRef.current.length - 1));
    const nextPages = pagesRef.current.map((pg, idx) => {
      if (idx !== curIdx) return pg;
      const offset = (pg.texts.length % 3) * 35;
      return {
        ...pg,
        texts: [
          ...pg.texts,
          {
            id: `tpl_${Date.now()}`,
            x: 70 + offset,
            y: 65 + offset,
            text: templateText,
            color: pg.paper === 'chalkboard' ? '#FFFFFF' : '#1F3A5F',
            fontSize: 26,
          },
        ],
      };
    });
    commitLocalChange(nextPages, curIdx);
    setShowTemplates(false);
  };

  const exportPageToDataUrl = (page: FlipchartPage): string => {
    const offscreen = document.createElement('canvas');
    offscreen.width = VIRTUAL_WIDTH;
    offscreen.height = VIRTUAL_HEIGHT;
    const ctx = offscreen.getContext('2d')!;
    renderStrokesAndTexts(ctx, page, null, true);
    return offscreen.toDataURL('image/png');
  };

  const handleDownloadPng = () => {
    if (!currentPage) return;
    const dataUrl = exportPageToDataUrl(currentPage);
    const link = document.createElement('a');
    link.href = dataUrl;
    const safeName = currentPage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `flipchart-${safeName || 'simulasi'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pages.forEach((pg, idx) => {
      if (idx > 0) doc.addPage();
      const imgData = exportPageToDataUrl(pg);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(31, 58, 95);
      doc.text(`${seminarTitle} — ${pg.title}`, 12, 10);
      doc.addImage(imgData, 'PNG', 10, 14, 277, 155.8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 145);
      doc.text(`Catatan Papan Tulis Kelas · Halaman ${idx + 1} dari ${pages.length}`, 12, 178);
    });
    doc.save(`papan-tulis-flipchart-kelas.pdf`);
  };

  if (!isOpen) return null;

  const paperBgStyle: React.CSSProperties =
    currentPage.paper === 'chalkboard'
      ? { backgroundColor: '#14332C' }
      : currentPage.paper === 'grid'
        ? {
            backgroundColor: '#FFFFFF',
            backgroundImage:
              'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
            backgroundSize: '2.5% 4.444%',
          }
        : currentPage.paper === 'lined'
          ? {
              backgroundColor: '#FFFFFF',
              backgroundImage:
                'linear-gradient(to bottom, transparent 94%, #DBEAFE 95%)',
              backgroundSize: '100% 5.55%',
            }
          : { backgroundColor: '#FFFFFF' };

  const quickColors =
    currentPage.paper === 'chalkboard'
      ? [PEN_COLORS[5], PEN_COLORS[1], PEN_COLORS[2], PEN_COLORS[3], PEN_COLORS[4]]
      : PEN_COLORS.slice(0, 5);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0F1E33]/92 backdrop-blur-xs flex flex-col ${
        isMaximized || readOnlyMirror || !isSidebarExpanded ? 'p-1 sm:p-2' : 'p-2 sm:p-4'
      }`}
    >
      <div
        className={`flex-1 flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-[#1F3A5F]/20 mx-auto w-full min-h-0 ${
          isMaximized || readOnlyMirror || !isSidebarExpanded ? 'max-w-full' : 'max-w-[1440px]'
        }`}
      >
        {/* MAIN WORKSPACE: LEFT SIDEBAR + RIGHT CANVAS STAGE */}
        <div className="flex-1 flex min-h-0 relative overflow-hidden">
          {/* COLLAPSED SLIM VERTICAL RAIL (NON-OVERLAPPING LEFT SIDEBAR) */}
          {!readOnlyMirror && !isSidebarExpanded && (
            <aside
              aria-label="Alat Cepat Papan Tulis"
              className="w-[52px] shrink-0 bg-[#1F3A5F] text-white flex flex-col items-center py-2 px-1.5 gap-1.5 border-r border-white/15 overflow-y-auto no-scrollbar z-20"
            >
              <button
                type="button"
                onClick={() => setIsSidebarExpanded(true)}
                className="w-9 h-9 rounded-lg bg-[#F28C28] hover:bg-[#d97719] text-white flex items-center justify-center cursor-pointer shrink-0 shadow-xs transition-colors"
                title="Perluas menu lengkap papan tulis"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="w-6 h-px bg-white/15 shrink-0" />

              {/* Core Drawing Tools */}
              {(
                [
                  { id: 'pen', label: 'Spidol', icon: PenTool },
                  { id: 'highlighter', label: 'Stabilo', icon: Highlighter },
                  { id: 'text', label: 'Ketik Teks', icon: Type },
                  { id: 'eraser', label: 'Hapus', icon: Eraser },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const active = tool === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTool(item.id)}
                    title={item.label}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                      active
                        ? 'bg-white text-[#1F3A5F] shadow-xs'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}

              <div className="w-6 h-px bg-white/15 shrink-0" />

              {/* Quick Color Swatches */}
              <div className="flex flex-col items-center gap-1.5 py-0.5 shrink-0">
                {quickColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setColor(c.value);
                      if (tool === 'eraser') setTool('pen');
                    }}
                    title={c.label}
                    className={`w-5 h-5 rounded-full border cursor-pointer transition-transform ${
                      color === c.value ? 'scale-120 ring-2 ring-[#F28C28]' : 'border-white/50'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={toggleSmoothWriting}
                className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                  smoothWriting
                    ? 'bg-[#2A9D8F] text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white/75'
                }`}
                title={
                  smoothWriting
                    ? 'Penghalus Tulisan Otomatis: AKTIF (Klik untuk matikan)'
                    : 'Penghalus Tulisan Otomatis: MATI (Klik untuk aktifkan)'
                }
              >
                <Sparkles className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleShapeSnap}
                className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                  shapeSnap
                    ? 'bg-[#F28C28] text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white/75'
                }`}
                title={
                  shapeSnap
                    ? 'Perapi Garis & Bentuk Otomatis: AKTIF (Tahan ujung goresan atau gambar garis/kotak/lingkaran)'
                    : 'Perapi Garis & Bentuk Otomatis: MATI (Klik untuk aktifkan)'
                }
              >
                <Shapes className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleUndo}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer shrink-0"
                title="Undo coretan terakhir"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              {/* Bottom Controls inside Rail: Projector Sync, Page Switcher, Close */}
              <div className="mt-auto pt-1.5 border-t border-white/15 flex flex-col items-center gap-1 w-full shrink-0">
                {onPublishFlipchart && (
                  <button
                    type="button"
                    onClick={() =>
                      commitLocalChange(
                        pagesRef.current,
                        activePageIndexRef.current,
                        !syncToProjectorRef.current
                      )
                    }
                    className={`w-9 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                      syncToProjector
                        ? 'bg-[#2A9D8F] hover:bg-[#218276] text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white/75'
                    }`}
                    title={syncToProjector ? 'Proyektor: LIVE (Klik untuk lokal saja)' : 'Mode Lokal (Klik untuk LIVE ke proyektor)'}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    commitLocalChange(pagesRef.current, Math.max(0, safeIndex - 1))
                  }
                  disabled={safeIndex === 0}
                  className="w-8 h-6 rounded bg-white/10 hover:bg-white/20 disabled:opacity-35 flex items-center justify-center cursor-pointer"
                  title="Lembar sebelumnya"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold tabular-nums leading-none py-0.5">
                  {safeIndex + 1}/{pages.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    commitLocalChange(pagesRef.current, Math.min(pages.length - 1, safeIndex + 1))
                  }
                  disabled={safeIndex === pages.length - 1}
                  className="w-8 h-6 rounded bg-white/10 hover:bg-white/20 disabled:opacity-35 flex items-center justify-center cursor-pointer"
                  title="Lembar berikutnya"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleAddPage}
                  className="w-9 h-7 rounded-lg bg-[#2A9D8F] hover:bg-[#218276] text-white flex items-center justify-center cursor-pointer mt-0.5"
                  title="Tambah Lembar Baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 mt-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                  title="Tutup Papan Tulis"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </aside>
          )}

          {/* EXPANDED LEFT SIDEBAR (DOCKED ON MD+, SLIDE-OVER DRAWER ON MOBILE) */}
          {!readOnlyMirror && isSidebarExpanded && (
            <>
              <div
                onClick={() => setIsSidebarExpanded(false)}
                className="md:hidden absolute inset-0 bg-slate-900/45 z-20"
                aria-hidden="true"
              />
              <aside
                aria-label="Menu Lengkap Papan Tulis"
                className="absolute md:static inset-y-0 left-0 z-30 w-[272px] md:w-[264px] shrink-0 bg-white border-r border-[#1F3A5F]/15 flex flex-col min-h-0 shadow-2xl md:shadow-none"
              >
                {/* Sidebar Header */}
                <div className="bg-[#1F3A5F] text-white px-3 py-2.5 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#F28C28] text-white flex items-center justify-center shrink-0">
                      <PenTool className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-extrabold tracking-wide truncate">
                      Papan Tulis
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsSidebarExpanded(false)}
                      className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Ciutkan sidebar menjadi bilah ikon tipis"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-[#F28C28]" />
                      <span>Ciutkan</span>
                    </button>
                  </div>
                </div>

                {/* Scrollable Tools & Pages Area */}
                <div className="flex-1 overflow-y-auto bg-[#FFF7EC]/55 p-3 space-y-3.5 min-h-0">
                  {/* Pages Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#1F3A5F]/75">
                        Lembar Flipchart ({pages.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddPage}
                        className="px-2 py-1 rounded-lg bg-[#2A9D8F] hover:bg-[#218276] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        title="Tambah Lembar Flipchart Baru"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Baru</span>
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
                      {pages.map((pg, idx) => (
                        <div
                          key={pg.id}
                          className={`flex items-center justify-between rounded-lg text-xs font-bold transition-colors ${
                            idx === safeIndex
                              ? 'bg-[#1F3A5F] text-white shadow-xs'
                              : 'bg-white text-[#1F3A5F] border border-[#1F3A5F]/15 hover:bg-slate-50'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => commitLocalChange(pagesRef.current, idx)}
                            className="flex-1 text-left px-2.5 py-1.5 cursor-pointer truncate"
                          >
                            {pg.title}
                          </button>
                          {pages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeletePage(idx)}
                              className="px-2 py-1.5 opacity-65 hover:opacity-100 hover:text-rose-400 cursor-pointer shrink-0"
                              title="Hapus lembar ini"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drawing Tools */}
                  <div className="space-y-1.5 pt-2 border-t border-[#1F3A5F]/10">
                    <span className="block text-[11px] font-bold text-[#1F3A5F]/75">
                      Alat Tulis
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'pen', label: 'Spidol', icon: PenTool },
                          { id: 'highlighter', label: 'Stabilo', icon: Highlighter },
                          { id: 'text', label: 'Ketik Teks', icon: Type },
                          { id: 'arrow', label: 'Panah', icon: ArrowUpRight },
                          { id: 'line', label: 'Garis', icon: Minus },
                          { id: 'rect', label: 'Kotak', icon: Square },
                          { id: 'ellipse', label: 'Lingkaran', icon: Circle },
                          { id: 'triangle', label: 'Segitiga', icon: Triangle },
                          { id: 'eraser', label: 'Hapus', icon: Eraser },
                        ] as const
                      ).map((item) => {
                        const Icon = item.icon;
                        const active = tool === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTool(item.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                              active
                                ? 'bg-[#1F3A5F] text-white shadow-xs'
                                : 'bg-white text-[#1F3A5F] border border-[#1F3A5F]/15 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={handleClearCurrentPage}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        title="Bersihkan seluruh coretan di lembar ini"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Bersihkan</span>
                      </button>
                    </div>

                    {/* Undo & Redo Row */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={handleUndo}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-[#1F3A5F]/15 text-[#1F3A5F] hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Undo"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Undo</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRedo}
                        disabled={!(redoMap[currentPage.id]?.length > 0)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-[#1F3A5F]/15 text-[#1F3A5F] hover:bg-slate-100 disabled:opacity-35 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Redo"
                      >
                        <Redo2 className="w-3.5 h-3.5" />
                        <span>Redo</span>
                      </button>
                    </div>
                  </div>

                  {/* Colors & Thickness */}
                  <div className="space-y-2 pt-2 border-t border-[#1F3A5F]/10">
                    <span className="block text-[11px] font-bold text-[#1F3A5F]/75">
                      Warna & Ukuran
                    </span>
                    <div className="flex items-center justify-between gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-[#1F3A5F]/15">
                      {PEN_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            setColor(c.value);
                            if (tool === 'eraser') setTool('pen');
                          }}
                          title={c.label}
                          className={`w-6 h-6 rounded-full border cursor-pointer transition-transform ${
                            color === c.value ? 'scale-120 ring-2 ring-[#F28C28]' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                    <select
                      value={tool === 'text' ? textFontSize : strokeSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (tool === 'text') setTextFontSize(val);
                        else setStrokeSize(val);
                      }}
                      className="w-full rounded-lg border border-[#1F3A5F]/20 bg-white px-2.5 py-1.5 text-xs font-bold text-[#1F3A5F] cursor-pointer"
                      title={tool === 'text' ? 'Ukuran Huruf' : 'Ketebalan Garis'}
                    >
                      {tool === 'text' ? (
                        <>
                          <option value={22}>Ukuran: Teks Kecil</option>
                          <option value={28}>Ukuran: Teks Sedang</option>
                          <option value={36}>Ukuran: Teks Besar</option>
                          <option value={46}>Ukuran: Judul Besar</option>
                        </>
                      ) : (
                        <>
                          <option value={2}>Ketebalan: Tipis</option>
                          <option value={4}>Ketebalan: Sedang</option>
                          <option value={8}>Ketebalan: Tebal</option>
                        </>
                      )}
                    </select>

                    {/* Toggle Penghalus Tulisan Tangan (Opsi 1) */}
                    <button
                      type="button"
                      onClick={toggleSmoothWriting}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-bold flex items-center justify-between gap-2 border cursor-pointer transition-colors ${
                        smoothWriting
                          ? 'bg-[#E3F5F2] border-[#2A9D8F]/40 text-[#1F3A5F]'
                          : 'bg-white border-[#1F3A5F]/15 text-[#1F3A5F]/70 hover:bg-slate-50'
                      }`}
                      title="Menghaluskan lengkungan tulisan spidol secara otomatis agar lebih rapi dan tidak bergerigi (0 ms delay)"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles
                          className={`w-3.5 h-3.5 ${
                            smoothWriting ? 'text-[#2A9D8F]' : 'text-slate-400'
                          }`}
                        />
                        <span>Haluskan Tulisan</span>
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                          smoothWriting
                            ? 'bg-[#2A9D8F] text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {smoothWriting ? 'AKTIF' : 'MATI'}
                      </span>
                    </button>

                    {/* Toggle Perapi Garis & Bentuk Otomatis (Opsi 2) */}
                    <button
                      type="button"
                      onClick={toggleShapeSnap}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-bold flex items-center justify-between gap-2 border cursor-pointer transition-colors ${
                        shapeSnap
                          ? 'bg-[#FFF3E0] border-[#F28C28]/45 text-[#1F3A5F]'
                          : 'bg-white border-[#1F3A5F]/15 text-[#1F3A5F]/70 hover:bg-slate-50'
                      }`}
                      title="Tahan ujung goresan ±0,4 detik (atau gambar garis panjang/kotak/lingkaran jelas) agar otomatis lurus dan simetris"
                    >
                      <span className="flex items-center gap-1.5">
                        <Shapes
                          className={`w-3.5 h-3.5 ${
                            shapeSnap ? 'text-[#F28C28]' : 'text-slate-400'
                          }`}
                        />
                        <span>Rapikan Bentuk</span>
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                          shapeSnap
                            ? 'bg-[#F28C28] text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {shapeSnap ? 'AKTIF' : 'MATI'}
                      </span>
                    </button>
                  </div>

                  {/* Paper Style & Formula Templates */}
                  <div className="space-y-2 pt-2 border-t border-[#1F3A5F]/10">
                    <span className="block text-[11px] font-bold text-[#1F3A5F]/75">
                      Jenis Kertas & Rumus
                    </span>
                    <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-lg border border-[#1F3A5F]/15">
                      <button
                        type="button"
                        onClick={() => handleChangePaper('white')}
                        className={`py-1 rounded text-[11px] font-bold cursor-pointer ${
                          currentPage.paper === 'white' ? 'bg-[#1F3A5F] text-white' : 'text-[#1F3A5F]'
                        }`}
                        title="Kertas Putih Polos"
                      >
                        Polos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePaper('grid')}
                        className={`py-1 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 cursor-pointer ${
                          currentPage.paper === 'grid' ? 'bg-[#1F3A5F] text-white' : 'text-[#1F3A5F]'
                        }`}
                        title="Kertas Kotak-Kotak"
                      >
                        <Grid className="w-3 h-3" />
                        <span>Kotak</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePaper('lined')}
                        className={`py-1 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 cursor-pointer ${
                          currentPage.paper === 'lined' ? 'bg-[#1F3A5F] text-white' : 'text-[#1F3A5F]'
                        }`}
                        title="Kertas Bergaris"
                      >
                        <AlignJustify className="w-3 h-3" />
                        <span>Garis</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangePaper('chalkboard')}
                        className={`py-1 rounded text-[11px] font-bold cursor-pointer ${
                          currentPage.paper === 'chalkboard'
                            ? 'bg-[#14332C] text-white'
                            : 'text-[#1F3A5F]'
                        }`}
                        title="Papan Hijau Klasik"
                      >
                        Gelap
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F28C28] hover:bg-[#d97719] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Tempel kerangka rumus simulasi UMKM ke papan tulis"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sisipkan Rumus</span>
                    </button>
                    {showTemplates && (
                      <div className="bg-white border border-[#1F3A5F]/20 rounded-xl p-1.5 space-y-1 shadow-xs">
                        {QUICK_TEMPLATES.map((tpl) => (
                          <button
                            key={tpl.label}
                            type="button"
                            onClick={() => handleInsertTemplate(tpl.text)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1F3A5F] hover:bg-[#FFF7EC] cursor-pointer"
                          >
                            + {tpl.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Bottom Actions: Sync, Export, Window, Close */}
                <div className="p-2.5 bg-white border-t border-[#1F3A5F]/15 space-y-1.5 shrink-0">
                  {onPublishFlipchart && (
                    <button
                      type="button"
                      onClick={() =>
                        commitLocalChange(
                          pagesRef.current,
                          activePageIndexRef.current,
                          !syncToProjectorRef.current
                        )
                      }
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        syncToProjector
                          ? 'bg-[#2A9D8F] hover:bg-[#218276] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-[#1F3A5F]'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>{syncToProjector ? 'Proyektor: LIVE' : 'Hanya Lokal'}</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={handleDownloadPng}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      title="Unduh lembar ini sebagai gambar PNG"
                    >
                      <Download className="w-3.5 h-3.5 text-[#F28C28]" />
                      <span>PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadAllPdf}
                      className="px-2 py-1.5 rounded-lg bg-[#2A9D8F] hover:bg-[#218276] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      title="Unduh seluruh lembar flipchart menjadi PDF"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold items-center justify-center gap-1 cursor-pointer"
                      title={isMaximized ? 'Perkecil jendela' : 'Perbesar penuh'}
                    >
                      {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tutup Papan</span>
                    </button>
                  </div>
                </div>
              </aside>
            </>
          )}

          {/* DRAWING STAGE (16:9 ASPECT-PRESERVED CANVAS — NEVER COVERED BY SIDEBAR) */}
          <div
            className={`flex-1 bg-slate-200/80 flex items-center justify-center overflow-hidden relative min-w-0 min-h-0 ${
              !isSidebarExpanded ? 'p-1.5 sm:p-2.5' : 'p-2 sm:p-3.5'
            }`}
          >
            {/* Subtle Bottom-Right Tips Expand Trigger when Footer is Collapsed */}
            {!readOnlyMirror && !isFooterExpanded && (
              <button
                type="button"
                onClick={() => setIsFooterExpanded(true)}
                className="absolute bottom-2.5 right-2.5 z-20 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-[#1F3A5F] border border-[#1F3A5F]/20 shadow-sm text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Tampilkan info tips penggunaan Tab & Laptop"
              >
                <Info className="w-3.5 h-3.5 text-[#2A9D8F]" />
                <span>Tips</span>
                <ChevronUp className="w-3 h-3 text-[#1F3A5F]/60" />
              </button>
            )}

            <div
              className="w-full h-full flex items-center justify-center min-w-0 min-h-0"
              style={{ containerType: 'size' }}
            >
              <div
                className="relative rounded-xl shadow-lg overflow-hidden border border-[#1F3A5F]/15"
                style={{
                  ...paperBgStyle,
                  width: 'min(100cqw, calc(100cqh * 16 / 9))',
                  height: 'min(100cqh, calc(100cqw * 9 / 16))',
                }}
              >
                {/* Read-only floating controls (auto-hidden until mouse hovers top bar area) */}
                {readOnlyMirror && (
                  <div
                    onMouseEnter={() => setMirrorBarHovered(true)}
                    onMouseLeave={() => setMirrorBarHovered(false)}
                    onPointerDown={(e) => {
                      if (e.pointerType !== 'mouse') {
                        setMirrorBarHovered((prev) => !prev);
                      }
                    }}
                    className="absolute top-0 left-0 right-0 h-16 z-20 px-4 pt-3 flex items-start justify-between gap-2"
                  >
                    <div
                      className={`px-3.5 py-1.5 rounded-full bg-[#1F3A5F]/90 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-white/15 transition-all duration-200 pointer-events-none ${
                        mirrorBarHovered
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 -translate-y-2'
                      }`}
                    >
                      Papan Simulasi Kelas · {currentPage.title}
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className={`px-3.5 py-1.5 rounded-full bg-rose-600/95 hover:bg-rose-700 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 cursor-pointer transition-all duration-200 ${
                        mirrorBarHovered
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                      title="Tutup tampilan papan tulis di layar ini"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tutup</span>
                    </button>
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  width={VIRTUAL_WIDTH}
                  height={VIRTUAL_HEIGHT}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  style={{ touchAction: 'none' }}
                  className={`w-full h-full block ${
                    readOnlyMirror
                      ? 'cursor-default'
                      : tool === 'text'
                        ? 'cursor-text'
                        : tool === 'eraser'
                          ? 'cursor-cell'
                          : 'cursor-crosshair'
                  }`}
                />

                {/* 1-Klik Kembalikan Coretan Asli bila Auto Shape Snap aktif */}
                {!readOnlyMirror && recentSnapRevert && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F3A5F]/92 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-white/15">
                    <Shapes className="w-3.5 h-3.5 text-[#F28C28] shrink-0" />
                    <span>Dirapikan ke {recentSnapRevert.shapeLabel}</span>
                    <button
                      type="button"
                      onClick={handleRevertLastSnap}
                      className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[#FFF7EC] text-[11px] font-extrabold cursor-pointer transition-colors"
                    >
                      Kembalikan Asli
                    </button>
                  </div>
                )}

                {/* Editable Text Overlay Input */}
                {textEditor && !readOnlyMirror && (
                  <div
                    style={{
                      left: `${(textEditor.x / VIRTUAL_WIDTH) * 100}%`,
                      top: `${(textEditor.y / VIRTUAL_HEIGHT) * 100}%`,
                    }}
                    className="absolute z-20 bg-white/95 border-2 border-[#F28C28] rounded-xl shadow-xl p-2 min-w-[240px] max-w-[380px]"
                  >
                    <textarea
                      autoFocus
                      rows={3}
                      value={textEditor.value}
                      onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          commitTextItem();
                        } else if (e.key === 'Escape') {
                          setTextEditor(null);
                        }
                      }}
                      placeholder="Ketik angka / catatan simulasi... (Enter untuk tempel, Shift+Enter baris baru)"
                      className="w-full text-sm font-bold text-[#1F3A5F] bg-transparent focus:outline-none resize-y"
                    />
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setTextEditor(null)}
                        className="px-2 py-1 rounded text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={commitTextItem}
                        className="px-3 py-1 rounded bg-[#1F3A5F] text-white text-xs font-bold cursor-pointer"
                      >
                        Tempel di Papan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE BOTTOM FOOTER INFO (DEFAULT COLLAPSED) */}
        {!readOnlyMirror && isFooterExpanded && (
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 shrink-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 flex-1 min-w-0">
              <span>
                <strong>Tips Tab & Laptop:</strong> Coret langsung pakai jari/stylus di Tab yang di-mirror ke Laptop, atau pakai alat <strong>Ketik Teks / Sisipkan Rumus</strong> jika sedang memegang mouse laptop.
              </span>
              <span className="font-semibold text-[#2A9D8F]">
                Hanya tampil di Layar Presentasi/Proyektor (HP peserta tetap fokus ke materi)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFooterExpanded(false)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-[#1F3A5F] text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
              title="Ciutkan footer agar papan tulis lebih lega"
            >
              <span>Ciutkan</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
