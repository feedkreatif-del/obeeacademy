import React, { useState, useRef, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { FlipchartBoardDoc } from '../types';
import {
  PenTool,
  Highlighter,
  Eraser,
  Type,
  Square,
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
  | 'rect';

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
    } else if (stroke.tool === 'highlighter') {
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
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) {
        ctx.lineTo(pts[0].x + 0.1, pts[0].y + 0.1);
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i + 1].x) / 2;
          const midY = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
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
  const isDrawingRef = useRef<boolean>(false);
  const lastLocalWriteTsRef = useRef<number>(0);
  const lastAppliedRemoteTsRef = useRef<number>(0);
  const wasOpenRef = useRef<boolean>(false);

  const safeIndex = Math.min(activePageIndex, Math.max(0, pages.length - 1));
  const currentPage = pages[safeIndex] || pages[0];

  const publishSnapshot = useCallback(
    (nextOpen: boolean, nextSync: boolean, nextPages: FlipchartPage[], nextIdx: number) => {
      if (readOnlyMirror) return;
      const now = Date.now();
      lastLocalWriteTsRef.current = now;
      saveAndBroadcastFlipchartState({
        isOpen: nextOpen,
        pages: nextPages,
        activePageIndex: nextIdx,
      });

      if (onPublishFlipchart) {
        try {
          const serialized = JSON.stringify(nextPages);
          if (serialized.length <= 440000) {
            onPublishFlipchart({
              isOpen: nextOpen,
              syncToProjector: nextSync,
              activePageIndex: Math.min(Math.max(0, nextIdx), 25),
              pagesJson: serialized,
            });
          }
        } catch {
          // ignore serialization errors
        }
      }
    },
    [readOnlyMirror, onPublishFlipchart]
  );

  // Apply incoming remote updates from Firestore (e.g. Tablet Remote -> Laptop Projector, or shared board edits)
  useEffect(() => {
    if (!flipchartRemote) return;
    if (
      flipchartRemote.sourceDeviceId === boardDeviceId &&
      !readOnlyMirror
    ) {
      return;
    }
    if (flipchartRemote.updatedAt <= lastAppliedRemoteTsRef.current) return;
    if (!readOnlyMirror && flipchartRemote.updatedAt <= lastLocalWriteTsRef.current) return;

    try {
      const parsed = JSON.parse(flipchartRemote.pagesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        lastAppliedRemoteTsRef.current = flipchartRemote.updatedAt;
        setPages(parsed);
        setActivePageIndex(
          Math.min(
            typeof flipchartRemote.activePageIndex === 'number' ? flipchartRemote.activePageIndex : 0,
            parsed.length - 1
          )
        );
      }
    } catch {
      // ignore malformed remote JSON
    }
  }, [flipchartRemote, boardDeviceId, readOnlyMirror]);

  // Publish on open/close transitions and local edits when interactive
  useEffect(() => {
    if (readOnlyMirror) return;
    if (isOpen) {
      wasOpenRef.current = true;
      publishSnapshot(true, syncToProjector, pages, safeIndex);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      publishSnapshot(false, syncToProjector, pages, safeIndex);
    }
  }, [isOpen, syncToProjector, pages, safeIndex, readOnlyMirror, publishSnapshot]);

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
      x: ((e.clientX - rect.left) / rect.width) * VIRTUAL_WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * VIRTUAL_HEIGHT,
    };
  };

  const commitTextItem = () => {
    if (!textEditor) return;
    const trimmed = textEditor.value.trim();
    if (trimmed) {
      setPages((prev) =>
        prev.map((pg, idx) => {
          if (idx !== safeIndex) return pg;
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
        })
      );
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
    isDrawingRef.current = true;

    const effectiveColor =
      currentPage.paper === 'chalkboard' && (color === '#1F3A5F' || color === '#111827')
        ? '#FFFFFF'
        : color;

    draftStrokeRef.current = {
      id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tool,
      color: tool === 'highlighter' && color === '#1F3A5F' ? '#FACC15' : effectiveColor,
      size: strokeSize,
      points: [pt],
    };
    redrawCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnlyMirror || !isDrawingRef.current || !draftStrokeRef.current) return;
    const pt = getVirtualCoords(e);
    const pts = draftStrokeRef.current.points;
    const last = pts[pts.length - 1];
    if (last) {
      const dx = pt.x - last.x;
      const dy = pt.y - last.y;
      if (dx * dx + dy * dy < 6.25 && draftStrokeRef.current.tool !== 'line' && draftStrokeRef.current.tool !== 'arrow' && draftStrokeRef.current.tool !== 'rect') {
        return;
      }
    }
    pts.push(pt);
    redrawCanvas();
  };

  const handlePointerUp = () => {
    if (readOnlyMirror || !isDrawingRef.current || !draftStrokeRef.current) return;
    isDrawingRef.current = false;
    const finishedStroke = draftStrokeRef.current;
    draftStrokeRef.current = null;

    setPages((prev) =>
      prev.map((pg, idx) =>
        idx === safeIndex ? { ...pg, strokes: [...pg.strokes, finishedStroke] } : pg
      )
    );
    // Clear redo stack on new action
    setRedoMap((prev) => ({ ...prev, [currentPage.id]: [] }));
  };

  const handleUndo = () => {
    if (!currentPage) return;
    if (currentPage.strokes.length === 0 && currentPage.texts.length === 0) return;

    const snapshot = { strokes: currentPage.strokes, texts: currentPage.texts };
    setRedoMap((prev) => ({
      ...prev,
      [currentPage.id]: [...(prev[currentPage.id] || []), snapshot],
    }));

    setPages((prev) =>
      prev.map((pg, idx) => {
        if (idx !== safeIndex) return pg;
        if (pg.strokes.length > 0) {
          return { ...pg, strokes: pg.strokes.slice(0, -1) };
        }
        return { ...pg, texts: pg.texts.slice(0, -1) };
      })
    );
  };

  const handleRedo = () => {
    if (!currentPage) return;
    const stack = redoMap[currentPage.id] || [];
    if (stack.length === 0) return;
    const last = stack[stack.length - 1];
    setRedoMap((prev) => ({
      ...prev,
      [currentPage.id]: stack.slice(0, -1),
    }));
    setPages((prev) =>
      prev.map((pg, idx) =>
        idx === safeIndex ? { ...pg, strokes: last.strokes, texts: last.texts } : pg
      )
    );
  };

  const handleClearCurrentPage = () => {
    if (!currentPage) return;
    const snapshot = { strokes: currentPage.strokes, texts: currentPage.texts };
    setRedoMap((prev) => ({
      ...prev,
      [currentPage.id]: [...(prev[currentPage.id] || []), snapshot],
    }));
    setPages((prev) =>
      prev.map((pg, idx) => (idx === safeIndex ? { ...pg, strokes: [], texts: [] } : pg))
    );
  };

  const handleAddPage = () => {
    const nextNum = pages.length + 1;
    const newPg = DEFAULT_PAGE(nextNum);
    setPages((prev) => [...prev, newPg]);
    setActivePageIndex(pages.length);
  };

  const handleDeletePage = (idxToDelete: number) => {
    if (pages.length <= 1) {
      handleClearCurrentPage();
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== idxToDelete));
    if (safeIndex >= pages.length - 1) {
      setActivePageIndex(Math.max(0, pages.length - 2));
    }
  };

  const handleChangePaper = (paper: FlipchartPaperStyle) => {
    setPages((prev) =>
      prev.map((pg, idx) => (idx === safeIndex ? { ...pg, paper } : pg))
    );
    if (paper === 'chalkboard' && (color === '#1F3A5F' || color === '#111827')) {
      setColor('#FFFFFF');
    } else if (paper !== 'chalkboard' && color === '#FFFFFF') {
      setColor('#1F3A5F');
    }
  };

  const handleInsertTemplate = (templateText: string) => {
    setPages((prev) =>
      prev.map((pg, idx) => {
        if (idx !== safeIndex) return pg;
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
      })
    );
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
                    onClick={() => setSyncToProjector(!syncToProjector)}
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
                  onClick={() => setActivePageIndex(Math.max(0, safeIndex - 1))}
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
                  onClick={() => setActivePageIndex(Math.min(pages.length - 1, safeIndex + 1))}
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
                            onClick={() => setActivePageIndex(idx)}
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
                        <span>Bersihkan</span>
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
                      onClick={() => setSyncToProjector(!syncToProjector)}
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
                {/* Read-only indicator for 2nd Screen Projector or Remote Tablet Sync */}
                {readOnlyMirror && (
                  <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
                    <div className="px-3 py-1 rounded-full bg-[#1F3A5F]/85 text-white text-xs font-bold shadow-xs">
                      Papan Simulasi Kelas · {currentPage.title}
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="pointer-events-auto px-3 py-1 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
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
