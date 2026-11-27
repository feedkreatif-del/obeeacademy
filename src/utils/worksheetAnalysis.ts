import { jsPDF } from 'jspdf';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, sanitizeForFirestore } from '../firebase';
import {
  WorksheetAnalysisOutput,
  WorksheetAnalysisRecord,
  WorksheetRubricId,
  WorksheetUploadedFileMeta,
} from '../types';

export interface WorksheetRubricOption {
  id: WorksheetRubricId;
  title: string;
  shortLabel: string;
  description: string;
  defaultHint: string;
}

export const WORKSHEET_RUBRIC_OPTIONS: WorksheetRubricOption[] = [
  {
    id: 'value_to_closing',
    title: 'Dari Value ke Closing & Silent Selling',
    shortLabel: 'Value ke Closing',
    description:
      'Menilai Target Pembeli Ideal, USP, Silent Selling, 7 Elemen Kemasan/Visual, Hook Copywriting, Ide Konten & Skrip Closing 3 Kalimat.',
    defaultHint:
      'Contoh: Cek apakah target pembeli masih terlalu umum dan buat skrip WA siap pakai.',
  },
  {
    id: 'value_proposition',
    title: 'Value Proposition & Positioning UMKM',
    shortLabel: 'Value Proposition',
    description:
      'Menilai ketajaman segmen pelanggan, pain point utama, janji nilai produk, bukti kepercayaan, dan pembeda dari kompetitor.',
    defaultHint:
      'Contoh: Fokus pada bagaimana produk ini memenangkan persaingan harga tanpa perang murah.',
  },
  {
    id: 'visual_packaging',
    title: 'Visual Identity & Desain Kemasan Menjual',
    shortLabel: 'Desain & Kemasan',
    description:
      'Menilai daya tarik 3 detik pertama, hierarki informasi, konsistensi warna, kelengkapan info kepercayaan (Halal/PIRT/QR) & CTA.',
    defaultHint:
      'Contoh: Berikan saran penataan ulang elemen depan kemasan agar lebih premium.',
  },
  {
    id: 'laporan_keuangan_umkm',
    title: 'Laporan Keuangan Praktis UMKM (Kas, HPP & Laba Rugi)',
    shortLabel: 'Laporan Keuangan',
    description:
      'Menilai pemisahan kas pribadi vs usaha, kelengkapan komponen HPP, margin laba kotor, dan kerapian format Laba Rugi 1 halaman.',
    defaultHint:
      'Contoh: Cek apakah ada biaya tersembunyi (kemasan/ongkir/listrik) yang belum masuk HPP.',
  },
  {
    id: 'custom',
    title: 'Review Bebas / Rubrik Kustom Mentor',
    shortLabel: 'Rubrik Kustom',
    description:
      'Analisa fleksibel sesuai instruksi khusus mentor untuk catatan bisnis, proposal kerja sama, atau tugas khusus lainnya.',
    defaultHint:
      'Tulis kriteria khusus yang ingin dinilai pada kolom instruksi tambahan di bawah.',
  },
];

export interface PreparedWorksheetUploadFile {
  name: string;
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';
  base64Data: string;
  sizeBytes: number;
  originalSizeBytes: number;
  previewDataUrl?: string;
}

const LOCAL_ANALYSES_KEY = 'obee_worksheet_analyses_v1';
const FIRESTORE_DOC_ID = 'worksheet_analyses_v1';
const MAX_LOCAL_RECORDS = 25;
const MAX_FIRESTORE_JSON_BYTES = 380_000;
const MAX_FILES_COUNT = 6;
const MAX_VERCEL_SAFE_TOTAL_BASE64_BYTES = 4_100_000;

function inferMimeType(file: File): PreparedWorksheetUploadFile['mimeType'] | null {
  const mime = (file.type || '').toLowerCase();
  if (
    mime === 'application/pdf' ||
    mime === 'image/jpeg' ||
    mime === 'image/png' ||
    mime === 'image/webp'
  ) {
    return mime;
  }
  const lowerName = (file.name || '').toLowerCase();
  if (lowerName.endsWith('.pdf')) return 'application/pdf';
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'image/jpeg';
  if (lowerName.endsWith('.png')) return 'image/png';
  if (lowerName.endsWith('.webp')) return 'image/webp';
  return null;
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat.'));
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memproses gambar.'));
    img.src = src;
  });
}

async function compressImageIfNeeded(
  file: File,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<{
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  dataUrl: string;
  sizeBytes: number;
}> {
  const rawDataUrl = await readFileAsDataUrl(file);
  const img = await loadHtmlImage(rawDataUrl);

  const maxDim = 1800;
  const needsResize = img.width > maxDim || img.height > maxDim;
  const needsRecompress = file.size > 480_000;

  if (!needsResize && !needsRecompress) {
    return { mimeType, dataUrl: rawDataUrl, sizeBytes: file.size };
  }

  let targetW = img.width;
  let targetH = img.height;
  if (needsResize) {
    if (targetW >= targetH) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    } else {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, targetW);
  canvas.height = Math.max(1, targetH);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { mimeType, dataUrl: rawDataUrl, sizeBytes: file.size };
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const base64Part = compressedDataUrl.split(',')[1] || '';
  const estimatedBytes = Math.floor((base64Part.length * 3) / 4);

  if (estimatedBytes > 0 && estimatedBytes < file.size) {
    return {
      mimeType: 'image/jpeg',
      dataUrl: compressedDataUrl,
      sizeBytes: estimatedBytes,
    };
  }

  return { mimeType, dataUrl: rawDataUrl, sizeBytes: file.size };
}

export async function prepareUploadedWorksheetFiles(
  incomingFiles: File[]
): Promise<PreparedWorksheetUploadFile[]> {
  if (incomingFiles.length === 0) return [];
  if (incomingFiles.length > MAX_FILES_COUNT) {
    throw new Error(`Maksimal ${MAX_FILES_COUNT} file dalam satu kali analisa.`);
  }

  const prepared: PreparedWorksheetUploadFile[] = [];
  let totalPayloadEstimate = 0;

  for (const file of incomingFiles) {
    const inferredMime = inferMimeType(file);
    if (!inferredMime) {
      throw new Error(
        `Format file "${file.name}" tidak didukung. Gunakan file PDF atau foto JPG, PNG, WebP.`
      );
    }

    if (inferredMime === 'application/pdf') {
      if (file.size > 3_100_000) {
        throw new Error(
          `File PDF "${file.name}" berukuran ${(file.size / (1024 * 1024)).toFixed(
            1
          )} MB. Agar lancar di server cloud, kompres PDF menjadi di bawah 3 MB atau unggah sebagai foto per halaman.`
        );
      }
      const dataUrl = await readFileAsDataUrl(file);
      const base64Data = dataUrl.split(',')[1] || '';
      totalPayloadEstimate += base64Data.length;
      prepared.push({
        name: file.name,
        mimeType: 'application/pdf',
        base64Data,
        sizeBytes: file.size,
        originalSizeBytes: file.size,
      });
    } else {
      const processed = await compressImageIfNeeded(file, inferredMime);
      const base64Data = processed.dataUrl.split(',')[1] || '';
      totalPayloadEstimate += base64Data.length;
      prepared.push({
        name: file.name,
        mimeType: processed.mimeType,
        base64Data,
        sizeBytes: processed.sizeBytes,
        originalSizeBytes: file.size,
        previewDataUrl: processed.dataUrl,
      });
    }
  }

  if (totalPayloadEstimate > MAX_VERCEL_SAFE_TOTAL_BASE64_BYTES) {
    throw new Error(
      'Total ukuran semua file melebihi batas aman upload (~3 MB biner / ~4.1 MB payload). Kurangi jumlah file atau kompres PDF terlebih dahulu.'
    );
  }

  return prepared;
}

export function formatBytesCompact(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function analyzeWorksheetWithApi(params: {
  files: PreparedWorksheetUploadFile[];
  rubricId: WorksheetRubricId;
  customInstruction?: string;
}): Promise<{
  rubricId: WorksheetRubricId;
  rubricTitle: string;
  analysis: WorksheetAnalysisOutput;
}> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Silakan verifikasi login akun Google mentor terlebih dahulu.');
  }

  const idToken = await currentUser.getIdToken();
  const response = await fetch('/api/analyze-worksheet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      rubricId: params.rubricId,
      customInstruction: params.customInstruction || '',
      files: params.files.map((f) => ({
        name: f.name,
        mimeType: f.mimeType,
        base64Data: f.base64Data,
      })),
    }),
  });

  const data = (await response.json().catch(() => null)) as {
    error?: string;
    rubricId?: WorksheetRubricId;
    rubricTitle?: string;
    analysis?: WorksheetAnalysisOutput;
  } | null;

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error(
        'Ukuran file melebihi batas upload server (4.5 MB di Vercel). Kompres PDF atau unggah foto halaman yang lebih ringkas.'
      );
    }
    throw new Error(
      data?.error || `Gagal menjalankan analisa AI (HTTP ${response.status}).`
    );
  }

  if (!data?.analysis) {
    throw new Error('Server tidak mengembalikan hasil analisa yang lengkap.');
  }

  return {
    rubricId: data.rubricId || params.rubricId,
    rubricTitle: data.rubricTitle || 'Bedah Tugas AI',
    analysis: data.analysis,
  };
}

function normalizeRecords(raw: unknown): WorksheetAnalysisRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is WorksheetAnalysisRecord =>
      Boolean(item && typeof item === 'object' && 'id' in item && 'analysis' in item)
    )
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, MAX_LOCAL_RECORDS);
}

export function loadWorksheetAnalysesLocal(): WorksheetAnalysisRecord[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_ANALYSES_KEY);
    if (!raw) return [];
    return normalizeRecords(JSON.parse(raw));
  } catch {
    return [];
  }
}

function buildSizedPayloadJson(records: WorksheetAnalysisRecord[]): string {
  const trimmed = records.slice(0, MAX_LOCAL_RECORDS);
  while (trimmed.length > 0) {
    const json = JSON.stringify(trimmed);
    if (json.length <= MAX_FIRESTORE_JSON_BYTES) {
      return json;
    }
    trimmed.pop();
  }
  return '[]';
}

export async function saveWorksheetAnalyses(
  records: WorksheetAnalysisRecord[]
): Promise<void> {
  const normalized = normalizeRecords(records);
  try {
    window.localStorage.setItem(LOCAL_ANALYSES_KEY, JSON.stringify(normalized));
  } catch {
    // ignore quota issues
  }

  const pagesJson = buildSizedPayloadJson(normalized);
  const deviceId = 'mentor_worksheet_ai';
  try {
    await setDoc(
      doc(db, 'flipchart', FIRESTORE_DOC_ID),
      sanitizeForFirestore({
        isOpen: false,
        syncToProjector: false,
        activePageIndex: 0,
        pagesJson,
        sourceDeviceId: deviceId,
        updatedAt: Date.now(),
      })
    );
  } catch (err) {
    console.warn('Gagal menyinkronkan riwayat bedah tugas ke Firestore:', err);
  }
}

export function subscribeWorksheetAnalyses(
  onUpdate: (records: WorksheetAnalysisRecord[]) => void
): () => void {
  const localInitial = loadWorksheetAnalysesLocal();
  if (localInitial.length > 0) {
    onUpdate(localInitial);
  }

  const ref = doc(db, 'flipchart', FIRESTORE_DOC_ID);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as { pagesJson?: unknown };
      if (typeof data?.pagesJson !== 'string') return;
      try {
        const parsed = normalizeRecords(JSON.parse(data.pagesJson));
        try {
          window.localStorage.setItem(LOCAL_ANALYSES_KEY, JSON.stringify(parsed));
        } catch {
          // ignore
        }
        onUpdate(parsed);
      } catch {
        // ignore invalid json
      }
    },
    (err) => {
      console.warn('Subscription worksheet_analyses_v1 error:', err);
    }
  );
}

export function buildCompactCrmNoteFromAnalysis(
  record: WorksheetAnalysisRecord
): string {
  const topMissing = record.analysis.missingSections[0]
    ? `Kosong: ${record.analysis.missingSections[0]}`
    : '';
  const topFix = record.analysis.actionableRecommendations[0]?.area
    ? `Fokus: ${record.analysis.actionableRecommendations[0].area}`
    : '';
  const parts = [
    `[Bedah AI ${record.analysis.completenessScore}/100]`,
    record.analysis.rubricVerdict,
    topMissing || topFix,
  ].filter(Boolean);
  return parts.join(' | ').slice(0, 295);
}

export function exportWorksheetAnalysisPdf(record: WorksheetAnalysisRecord): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 16;
  const maxContentW = pageWidth - marginX * 2;
  let y = 18;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - 16) {
      pdf.addPage();
      y = 18;
    }
  };

  const writeWrapped = (
    text: string,
    opts?: {
      fontSize?: number;
      bold?: boolean;
      color?: [number, number, number];
      indentX?: number;
      lineHeight?: number;
    }
  ) => {
    const fontSize = opts?.fontSize ?? 10;
    const indent = opts?.indentX ?? 0;
    const lineHeight = opts?.lineHeight ?? fontSize * 0.44;
    pdf.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    pdf.setFontSize(fontSize);
    const rgb = opts?.color ?? [30, 41, 59];
    pdf.setTextColor(rgb[0], rgb[1], rgb[2]);

    const lines = pdf.splitTextToSize(text, maxContentW - indent) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight + 2);
      pdf.text(line, marginX + indent, y);
      y += lineHeight;
    }
  };

  // Header Banner
  pdf.setFillColor(31, 58, 95);
  pdf.rect(0, 0, pageWidth, 34, 'F');
  pdf.setFillColor(242, 140, 40);
  pdf.rect(0, 32, pageWidth, 2, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('RAPOR BEDAH TUGAS & COACHING UMKM', marginX, 13);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.text(
    `obeeAcademy (Obeecreatives) • Rubrik: ${record.rubricTitle}`,
    marginX,
    20
  );
  pdf.text(
    `Tanggal Analisa: ${new Date(record.createdAt).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`,
    marginX,
    26.5
  );

  y = 43;

  // Identity & Score Summary Box
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(marginX, y - 4, maxContentW, 24, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(31, 58, 95);
  pdf.text(
    `${record.analysis.brandName} (${record.analysis.participantName})`,
    marginX + 4,
    y + 3
  );
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Subsektor: ${record.analysis.subsector}`, marginX + 4, y + 9.5);
  pdf.text(
    `Predikat: ${record.analysis.rubricVerdict}`,
    marginX + 4,
    y + 15.5
  );

  // Score right badge
  const scoreColor: [number, number, number] =
    record.analysis.completenessScore >= 75
      ? [16, 185, 129]
      : record.analysis.completenessScore >= 50
      ? [242, 140, 40]
      : [225, 29, 72];
  pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  pdf.roundedRect(pageWidth - marginX - 36, y, 32, 16, 2.5, 2.5, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(`${record.analysis.completenessScore}/100`, pageWidth - marginX - 20, y + 10.5, {
    align: 'center',
  });

  y += 28;

  // Document Summary
  writeWrapped('RINGKASAN DOKUMEN', { fontSize: 10.5, bold: true, color: [31, 58, 95] });
  y += 1.5;
  writeWrapped(record.analysis.documentSummary, { fontSize: 9.8 });
  y += 4;

  // Missing Sections
  if (record.analysis.missingSections.length > 0) {
    ensureSpace(14);
    writeWrapped('BAGIAN YANG MASIH KOSONG / PERLU DILENGKAPI', {
      fontSize: 10.5,
      bold: true,
      color: [190, 18, 60],
    });
    y += 1.5;
    record.analysis.missingSections.forEach((item) => {
      writeWrapped(`• ${item}`, { fontSize: 9.6, indentX: 3, color: [136, 19, 55] });
    });
    y += 4;
  }

  // Strengths
  if (record.analysis.strengths.length > 0) {
    ensureSpace(14);
    writeWrapped('POIN KUAT YANG SUDAH BAGUS', {
      fontSize: 10.5,
      bold: true,
      color: [15, 118, 110],
    });
    y += 1.5;
    record.analysis.strengths.forEach((item) => {
      writeWrapped(`✓ ${item}`, { fontSize: 9.6, indentX: 3 });
    });
    y += 4;
  }

  // Gaps
  if (record.analysis.gapsAndCorrections.length > 0) {
    ensureSpace(14);
    writeWrapped('CELAH & KOREKSI STRATEGIS', {
      fontSize: 10.5,
      bold: true,
      color: [180, 83, 9],
    });
    y += 1.5;
    record.analysis.gapsAndCorrections.forEach((item) => {
      writeWrapped(`! ${item}`, { fontSize: 9.6, indentX: 3 });
    });
    y += 4;
  }

  // Actionable Recommendations
  if (record.analysis.actionableRecommendations.length > 0) {
    ensureSpace(18);
    writeWrapped('REKOMENDASI PERBAIKAN KONKRET (SEBELUM -> SESUDAH)', {
      fontSize: 10.5,
      bold: true,
      color: [31, 58, 95],
    });
    y += 2;
    record.analysis.actionableRecommendations.forEach((rec, idx) => {
      ensureSpace(22);
      writeWrapped(`${idx + 1}. ${rec.area}`, {
        fontSize: 10,
        bold: true,
        color: [31, 58, 95],
      });
      writeWrapped(`Saat ini: ${rec.currentDraft}`, {
        fontSize: 9.2,
        indentX: 4,
        color: [100, 116, 139],
      });
      writeWrapped(`Usulan perbaikan: ${rec.suggestedUpgrade}`, {
        fontSize: 9.5,
        bold: true,
        indentX: 4,
        color: [15, 118, 110],
      });
      writeWrapped(`Dampak: ${rec.reason}`, {
        fontSize: 9.1,
        indentX: 4,
        color: [71, 85, 105],
      });
      y += 2.5;
    });
  }

  // Coaching Questions
  if (record.analysis.coachingQuestions.length > 0) {
    ensureSpace(14);
    writeWrapped('PERTANYAAN PEMANTIK SESI COACHING', {
      fontSize: 10.5,
      bold: true,
      color: [31, 58, 95],
    });
    y += 1.5;
    record.analysis.coachingQuestions.forEach((q, idx) => {
      writeWrapped(`${idx + 1}. ${q}`, { fontSize: 9.6, indentX: 3 });
    });
    y += 4;
  }

  // WA Feedback Draft
  ensureSpace(18);
  writeWrapped('DRAFT PESAN FEEDBACK WHATSAPP', {
    fontSize: 10.5,
    bold: true,
    color: [31, 58, 95],
  });
  y += 1.5;
  writeWrapped(record.analysis.whatsappFeedbackDraft, {
    fontSize: 9.5,
    indentX: 3,
    color: [30, 41, 59],
  });

  const safeSlug = (record.analysis.brandName || record.analysis.participantName || 'umkm')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

  pdf.save(`Rapor_Bedah_Tugas_${safeSlug || 'peserta'}.pdf`);
}

export function buildFileMetaList(
  files: PreparedWorksheetUploadFile[]
): WorksheetUploadedFileMeta[] {
  return files.map((f) => ({
    fileName: f.name,
    mimeType: f.mimeType,
    sizeBytes: f.sizeBytes,
  }));
}
