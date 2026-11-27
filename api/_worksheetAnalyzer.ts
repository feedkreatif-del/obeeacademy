import fs from 'node:fs';
import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';

export type ServerRubricId =
  | 'value_to_closing'
  | 'value_proposition'
  | 'visual_packaging'
  | 'laporan_keuangan_umkm'
  | 'custom';

export interface RubricDefinition {
  id: ServerRubricId;
  title: string;
  evaluationChecklist: string;
}

export const WORKSHEET_RUBRICS: Record<ServerRubricId, RubricDefinition> = {
  value_to_closing: {
    id: 'value_to_closing',
    title: 'Dari Value ke Closing & Silent Selling',
    evaluationChecklist: [
      'Evaluasi berdasarkan kerangka materi "Dari Value ke Closing & Silent Selling" obeeAcademy:',
      '1. Target Pembeli Ideal & Profil Persona (usia, pekerjaan, masalah, kebutuhan emosional & fungsional).',
      '2. Unique Selling Proposition (USP) & Pembeda Utama dibanding kompetitor sejenis.',
      '3. Silent Selling / Pengalaman Pembelian Tanpa Salesman (apakah produk, tampilan, harga, dan info cara beli sudah bisa "menjual dirinya sendiri").',
      '4. Tujuh (7) Elemen Kemasan / Visual Penjual (Hook 3 detik pertama, kejelasan manfaat, varian/ukuran, bukti kepercayaan/legalitas, harga/penawaran, ajakan bertindak/CTA, kontak/QR).',
      '5. Copywriting: Headline / Hook yang memancing berhenti scroll + CTA yang jelas & mendesak.',
      '6. Ide Konten Edukasi vs Konten Selling (apakah selaras dengan masalah target pasar).',
      '7. Skrip Closing 3 Kalimat untuk WhatsApp / DM (sapaan hangat -> validasi kebutuhan -> penawaran/arahan transfer jelas).',
    ].join('\n'),
  },
  value_proposition: {
    id: 'value_proposition',
    title: 'Value Proposition & Positioning UMKM',
    evaluationChecklist: [
      'Evaluasi berdasarkan kerangka "Value Proposition 7 Tahap" obeeAcademy:',
      '1. Kejelasan segmen pelanggan spesifik (tidak terlalu umum seperti "semua orang").',
      '2. Masalah nyata (pain point) pelanggan yang paling terasa mahal/menyebalkan.',
      '3. Solusi & janji nilai utama produk/jasa.',
      '4. Alasan percaya / bukti nyata (testimoni, sertifikasi, bahan baku, pengalaman, garansi).',
      '5. Diferensiasi tajam dibanding kompetitor terdekat.',
    ].join('\n'),
  },
  visual_packaging: {
    id: 'visual_packaging',
    title: 'Visual Identity & Desain Kemasan Menjual',
    evaluationChecklist: [
      'Evaluasi berdasarkan materi "Visual Identity & Desain Kemasan" obeeAcademy:',
      '1. Daya tarik visual 3 detik pertama (apakah langsung terbaca jenis produk & kelas harganya).',
      '2. Hierarki tipografi & keterbacaan (nama brand, nama produk, varian, klaim utama).',
      '3. Konsistensi palet warna & mood visual terhadap target pasar.',
      '4. Elemen kepercayaan konsumen (komposisi, izin PIRT/BPOM/Halal bila relevan, berat bersih, expired date, info kontak/IG/QR).',
      '5. Kelayakan tampil di etalase offline maupun foto marketplace/Instagram.',
    ].join('\n'),
  },
  laporan_keuangan_umkm: {
    id: 'laporan_keuangan_umkm',
    title: 'Laporan Keuangan Praktis UMKM (Kas, HPP & Laba Rugi)',
    evaluationChecklist: [
      'Evaluasi berdasarkan materi "Laporan Keuangan Praktis UMKM" obeeAcademy:',
      '1. Pemisahan Kas Pribadi vs Kas Usaha & penentuan Gaji Pemilik (apakah pemilik masih campur aduk uang dapur dan modal).',
      '2. Perhitungan HPP (Harga Pokok Penjualan) per unit/porsi (bahan baku, kemasan, ongkos produksi langsung vs biaya overhead/tetap).',
      '3. Penetapan Harga Jual & Margin Laba Kotor (apakah margin aman untuk diskon/reseller/biaya admin marketplace).',
      '4. Kedisiplinan pencatatan arus kas masuk & keluar harian.',
      '5. Penyusunan Laporan Laba Rugi 1 Halaman (Omzet - HPP = Laba Kotor; Laba Kotor - Biaya Operasional = Laba Bersih Usaha).',
    ].join('\n'),
  },
  custom: {
    id: 'custom',
    title: 'Review Bebas / Rubrik Kustom Mentor',
    evaluationChecklist: [
      'Evaluasi tugas / materi / catatan usaha UMKM secara menyeluruh:',
      '1. Kejelasan tujuan usaha & produk/jasa yang ditawarkan.',
      '2. Kelengkapan informasi pada dokumen/foto/lembar kerja.',
      '3. Kesesuaian antara target pasar, pesan jualan, dan eksekusi teknis.',
      '4. Ikuti secara khusus instruksi tambahan dari mentor bila diberikan.',
    ].join('\n'),
  },
};

export interface IncomingWorksheetFile {
  name?: unknown;
  mimeType?: unknown;
  base64Data?: unknown;
}

export interface AnalyzeWorksheetPayload {
  files?: IncomingWorksheetFile[];
  rubricId?: unknown;
  customInstruction?: unknown;
}

export interface AnalyzerHttpResult {
  status: number;
  body: Record<string, unknown>;
}

const ALLOWED_ADMIN_EMAIL = 'feedkreatif@gmail.com';
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const MAX_FILES = 6;
const MAX_SINGLE_FILE_BYTES = 12 * 1024 * 1024;
const MAX_TOTAL_BYTES = 15 * 1024 * 1024;

let cachedFirebaseApiKey: string | null = null;

function resolveFirebaseWebApiKey(): string {
  if (cachedFirebaseApiKey) return cachedFirebaseApiKey;

  const fromEnv =
    process.env.FIREBASE_WEB_API_KEY?.trim() ||
    process.env.VITE_FIREBASE_API_KEY?.trim() ||
    '';
  if (fromEnv) {
    cachedFirebaseApiKey = fromEnv;
    return fromEnv;
  }

  try {
    const configUrl = new URL('../firebase-applet-config.json', import.meta.url);
    const raw = fs.readFileSync(configUrl, 'utf-8');
    const parsed = JSON.parse(raw) as { apiKey?: unknown };
    if (typeof parsed.apiKey === 'string' && parsed.apiKey.trim()) {
      cachedFirebaseApiKey = parsed.apiKey.trim();
      return cachedFirebaseApiKey;
    }
  } catch {
    // Ignore missing config file; handled below
  }

  return '';
}

async function verifyMentorFirebaseToken(
  authorizationHeader: string | undefined
): Promise<{ ok: true; email: string } | { ok: false; status: number; message: string }> {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      message:
        'Sesi verifikasi mentor diperlukan. Login Google mentor (feedkreatif@gmail.com) sebelum menjalankan analisa AI.',
    };
  }

  const idToken = authorizationHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length < 40 || idToken.length > 8192) {
    return {
      ok: false,
      status: 401,
      message: 'Token otentikasi mentor tidak valid.',
    };
  }

  const firebaseApiKey = resolveFirebaseWebApiKey();
  if (!firebaseApiKey) {
    return {
      ok: false,
      status: 500,
      message: 'Konfigurasi Firebase API key di server tidak ditemukan.',
    };
  }

  try {
    const lookupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
        firebaseApiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!lookupRes.ok) {
      return {
        ok: false,
        status: 401,
        message: 'Sesi Google mentor kedaluwarsa atau tidak sah. Silakan login ulang.',
      };
    }

    const lookupData = (await lookupRes.json()) as {
      users?: Array<{ email?: string; emailVerified?: boolean }>;
    };
    const user = lookupData?.users?.[0];
    const email = (user?.email || '').trim().toLowerCase();

    if (!email) {
      return {
        ok: false,
        status: 401,
        message: 'Akun Google tidak terbaca dari token.',
      };
    }

    if (email !== ALLOWED_ADMIN_EMAIL || user?.emailVerified !== true) {
      return {
        ok: false,
        status: 403,
        message: `Akses ditolak (${email}). Fitur Bedah Tugas AI hanya untuk mentor terverifikasi (${ALLOWED_ADMIN_EMAIL}).`,
      };
    }

    return { ok: true, email };
  } catch (err) {
    console.error('Firebase token verification error:', err);
    return {
      ok: false,
      status: 502,
      message: 'Gagal memverifikasi token Google ke server autentikasi Firebase.',
    };
  }
}

const WORKSHEET_ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    participantName: {
      type: Type.STRING,
      description: 'Nama lengkap peserta yang tertulis di lembar tugas atau "Tidak tercantum".',
    },
    brandName: {
      type: Type.STRING,
      description: 'Nama brand / usaha UMKM yang tertulis di tugas atau "Belum tercantum".',
    },
    subsector: {
      type: Type.STRING,
      description: 'Kategori/subsektor bisnis UMKM (misal: Jasa Sewa Perlengkapan, Kuliner/F&B, Fashion, Kriya).',
    },
    documentSummary: {
      type: Type.STRING,
      description: 'Ringkasan 2-4 kalimat mengenai isi dokumen/foto tulisan tangan peserta dan konteks usahanya.',
    },
    completenessScore: {
      type: Type.INTEGER,
      description: 'Skor kelengkapan & ketajaman tugas dari 0 hingga 100 berdasarkan rubrik.',
    },
    rubricVerdict: {
      type: Type.STRING,
      description: 'Predikat singkat seperti "Fondasi Bagus, Perlu Dipertajam", "Perlu Dilengkapi Dulu", atau "Siap Eksekusi & Closing".',
    },
    missingSections: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Daftar bagian/kolom lembar kerja yang masih kosong, belum dijawab, atau terlewat.',
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Poin-poin kekuatan utama dari ide atau jawaban peserta.',
    },
    gapsAndCorrections: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Celah strategi, miskonsepsi, atau hal yang masih terlalu umum dan perlu dikoreksi.',
    },
    actionableRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          area: {
            type: Type.STRING,
            description: 'Aspek yang diperbaiki (misal: Target Pembeli Ideal, Hook Copywriting, HPP, Skrip Closing WA).',
          },
          currentDraft: {
            type: Type.STRING,
            description: 'Ringkasan isi tulisan peserta saat ini (atau tulis "Masih kosong / belum diisi").',
          },
          suggestedUpgrade: {
            type: Type.STRING,
            description: 'Contoh rumusan perbaikan konkret yang siap pakai untuk usaha peserta tersebut.',
          },
          reason: {
            type: Type.STRING,
            description: 'Alasan singkat mengapa perbaikan ini berdampak ke konversi/penjualan/keuangan.',
          },
        },
        required: ['area', 'currentDraft', 'suggestedUpgrade', 'reason'],
      },
      description: '3 sampai 6 rekomendasi perbaikan konkret sebelum -> sesudah.',
    },
    coachingQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 sampai 4 pertanyaan pemantik tajam untuk ditanyakan mentor saat sesi coaching 1-on-1.',
    },
    whatsappFeedbackDraft: {
      type: Type.STRING,
      description: 'Draft pesan feedback WhatsApp yang hangat, suportif, terstruktur rapi dengan poin kekuatan, PR melengkapi yang kurang, dan 1 contoh kalimat siap pakai.',
    },
  },
  required: [
    'participantName',
    'brandName',
    'subsector',
    'documentSummary',
    'completenessScore',
    'rubricVerdict',
    'missingSections',
    'strengths',
    'gapsAndCorrections',
    'actionableRecommendations',
    'coachingQuestions',
    'whatsappFeedbackDraft',
  ],
};

function sanitizeStringArray(val: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(val)) return fallback;
  return val
    .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
    .filter((item) => item.length > 0)
    .slice(0, 12);
}

export async function handleWorksheetAnalyzeRequest(params: {
  authorizationHeader?: string;
  body: unknown;
}): Promise<AnalyzerHttpResult> {
  const authCheck = await verifyMentorFirebaseToken(params.authorizationHeader);
  if (authCheck.ok === false) {
    return {
      status: authCheck.status,
      body: { error: authCheck.message },
    };
  }

  const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!geminiApiKey || geminiApiKey === 'MY_GEMINI_API_KEY') {
    return {
      status: 503,
      body: {
        error:
          'GEMINI_API_KEY belum dikonfigurasi di server. Tambahkan variable GEMINI_API_KEY di Environment Server / Vercel Settings -> Environment Variables, lalu restart atau redeploy.',
      },
    };
  }

  const payload =
    params.body && typeof params.body === 'object'
      ? (params.body as AnalyzeWorksheetPayload)
      : null;

  if (!payload || !Array.isArray(payload.files) || payload.files.length === 0) {
    return {
      status: 400,
      body: { error: 'Unggah minimal 1 file tugas (PDF atau gambar JPG/PNG/WebP).' },
    };
  }

  if (payload.files.length > MAX_FILES) {
    return {
      status: 400,
      body: { error: `Maksimal ${MAX_FILES} file dalam satu kali analisa.` },
    };
  }

  const rawRubricId = typeof payload.rubricId === 'string' ? payload.rubricId.trim() : 'value_to_closing';
  const rubricKey: ServerRubricId =
    rawRubricId in WORKSHEET_RUBRICS ? (rawRubricId as ServerRubricId) : 'value_to_closing';
  const rubric = WORKSHEET_RUBRICS[rubricKey];

  const customInstruction =
    typeof payload.customInstruction === 'string'
      ? payload.customInstruction.trim().slice(0, 1000)
      : '';

  const validatedParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
  const fileNames: string[] = [];
  let totalDecodedBytes = 0;

  for (let i = 0; i < payload.files.length; i += 1) {
    const file = payload.files[i];
    const fileName =
      typeof file?.name === 'string' && file.name.trim()
        ? file.name.trim().slice(0, 140)
        : `lampiran-${i + 1}`;
    const mimeType = typeof file?.mimeType === 'string' ? file.mimeType.trim().toLowerCase() : '';
    const rawBase64 = typeof file?.base64Data === 'string' ? file.base64Data.trim() : '';

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return {
        status: 400,
        body: {
          error: `Tipe file "${fileName}" (${mimeType || 'tidak diketahui'}) tidak didukung. Gunakan PDF, JPG, PNG, atau WebP.`,
        },
      };
    }

    const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/i, '').replace(/\s+/g, '');
    if (!cleanBase64 || !/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
      return {
        status: 400,
        body: { error: `Data file "${fileName}" tidak valid atau rusak.` },
      };
    }

    const estimatedBytes = Math.floor((cleanBase64.length * 3) / 4);
    if (estimatedBytes <= 0 || estimatedBytes > MAX_SINGLE_FILE_BYTES) {
      return {
        status: 400,
        body: {
          error: `Ukuran file "${fileName}" melebihi batas maksimal server (12 MB per file).`,
        },
      };
    }

    totalDecodedBytes += estimatedBytes;
    if (totalDecodedBytes > MAX_TOTAL_BYTES) {
      return {
        status: 400,
        body: {
          error: 'Total ukuran seluruh lampiran melebihi batas maksimal 15 MB. Kompres atau kurangi halaman terlebih dahulu.',
        },
      };
    }

    validatedParts.push({
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    });
    fileNames.push(fileName);
  }

  const promptText = [
    `Tolong bedah dan analisis berkas tugas peserta pelatihan UMKM obeeAcademy berikut (${fileNames.join(', ')}).`,
    '',
    `RUBRIK PENILAIAN AKTIF: ${rubric.title}`,
    rubric.evaluationChecklist,
    '',
    customInstruction
      ? `INSTRUKSI FOKUS TAMBAHAN DARI MENTOR:\n${customInstruction}\n`
      : '',
    'ATURAN ANALISA:',
    '- Baca seluruh halaman dengan cermat termasuk tulisan tangan, poin yang dicoret, kotak kosong, atau catatan tepi.',
    '- Jika ada bagian lembar kerja yang terlihat kosong/belum diisi atau halaman terpotong, sebutkan secara jujur dan spesifik di `missingSections` serta perhitungkan dalam `completenessScore` (0-100).',
    '- Jangan mengarang isi jawaban peserta yang tidak tertulis di lampiran; bedakan dengan jelas antara isi peserta saat ini (`currentDraft`) dan usulan peningkatan dari mentor (`suggestedUpgrade`).',
    '- Pastikan contoh perbaikan sangat kontekstual dengan nama usaha, produk, dan target pasar peserta tersebut.',
    '- Tulis seluruh output dalam Bahasa Indonesia yang hangat, memberdayakan UMKM, lugas, dan profesional.',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [...validatedParts, { text: promptText }],
      config: {
        systemInstruction:
          'Anda adalah Mentor Senior Bisnis & Branding UMKM di obeeAcademy (Obeecreatives). Anda ahli membaca lembar kerja tulisan tangan maupun PDF hasil kerja peserta UMKM, mengevaluasi strategi pemasaran, positioning, kemasan, dan keuangan praktis, lalu menghasilkan laporan bedah tugas terstruktur serta saran kalimat perbaikan siap pakai dalam Bahasa Indonesia.',
        responseMimeType: 'application/json',
        responseSchema: WORKSHEET_ANALYSIS_SCHEMA,
      },
    });

    const rawText = (response.text || '').trim();
    if (!rawText) {
      return {
        status: 502,
        body: {
          error: 'Model AI mengembalikan respons kosong. Silakan coba unggah gambar/PDF yang lebih jelas.',
        },
      };
    }

    let parsedJson: Record<string, unknown>;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsedJson = JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      console.error('Failed to parse Gemini JSON response:', rawText.slice(0, 400));
      return {
        status: 502,
        body: {
          error: 'Format hasil analisa AI tidak sesuai JSON terstruktur. Silakan coba ulangi analisa.',
        },
      };
    }

    const rawScore = Number(parsedJson.completenessScore);
    const completenessScore = Number.isFinite(rawScore)
      ? Math.max(0, Math.min(100, Math.round(rawScore)))
      : 60;

    const rawRecommendations = Array.isArray(parsedJson.actionableRecommendations)
      ? parsedJson.actionableRecommendations
      : [];

    const actionableRecommendations = rawRecommendations
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .slice(0, 8)
      .map((item) => ({
        area: typeof item.area === 'string' && item.area.trim() ? item.area.trim() : 'Aspek Strategi',
        currentDraft:
          typeof item.currentDraft === 'string' && item.currentDraft.trim()
            ? item.currentDraft.trim()
            : 'Belum tercantum',
        suggestedUpgrade:
          typeof item.suggestedUpgrade === 'string' && item.suggestedUpgrade.trim()
            ? item.suggestedUpgrade.trim()
            : '-',
        reason:
          typeof item.reason === 'string' && item.reason.trim()
            ? item.reason.trim()
            : 'Meningkatkan kejelasan nilai dan peluang closing.',
      }));

    const normalizedAnalysis = {
      participantName:
        typeof parsedJson.participantName === 'string' && parsedJson.participantName.trim()
          ? parsedJson.participantName.trim()
          : 'Tidak tercantum',
      brandName:
        typeof parsedJson.brandName === 'string' && parsedJson.brandName.trim()
          ? parsedJson.brandName.trim()
          : 'Belum tercantum',
      subsector:
        typeof parsedJson.subsector === 'string' && parsedJson.subsector.trim()
          ? parsedJson.subsector.trim()
          : 'UMKM Umum',
      documentSummary:
        typeof parsedJson.documentSummary === 'string' && parsedJson.documentSummary.trim()
          ? parsedJson.documentSummary.trim()
          : 'Ringkasan dokumen berhasil diproses.',
      completenessScore,
      rubricVerdict:
        typeof parsedJson.rubricVerdict === 'string' && parsedJson.rubricVerdict.trim()
          ? parsedJson.rubricVerdict.trim()
          : completenessScore >= 75
          ? 'Fondasi Kuat & Siap Dipertajam'
          : completenessScore >= 50
          ? 'Cukup Baik, Perlu Dilengkapi'
          : 'Perlu Pengisian Ulang Bagian Inti',
      missingSections: sanitizeStringArray(parsedJson.missingSections),
      strengths: sanitizeStringArray(parsedJson.strengths),
      gapsAndCorrections: sanitizeStringArray(parsedJson.gapsAndCorrections),
      actionableRecommendations,
      coachingQuestions: sanitizeStringArray(parsedJson.coachingQuestions),
      whatsappFeedbackDraft:
        typeof parsedJson.whatsappFeedbackDraft === 'string' && parsedJson.whatsappFeedbackDraft.trim()
          ? parsedJson.whatsappFeedbackDraft.trim()
          : 'Halo Kak, terima kasih sudah mengumpulkan lembar kerja. Mari kita pertajam beberapa bagian inti agar makin siap closing ya.',
    };

    return {
      status: 200,
      body: {
        rubricId: rubric.id,
        rubricTitle: rubric.title,
        analysis: normalizedAnalysis,
      },
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err || '');
    console.error('Gemini analyzeWorksheet error:', errMsg);

    if (/429|RESOURCE_EXHAUSTED|quota/i.test(errMsg)) {
      return {
        status: 429,
        body: {
          error: 'Batas kuota permintaan AI sementara tercapai (rate limit). Tunggu beberapa detik lalu coba lagi.',
        },
      };
    }

    if (/API_KEY_INVALID|API key not valid|401|403/i.test(errMsg)) {
      return {
        status: 503,
        body: {
          error: 'GEMINI_API_KEY di server tidak valid atau belum aktif. Periksa ulang API key pada environment server.',
        },
      };
    }

    return {
      status: 502,
      body: {
        error: 'Gagal menganalisa dokumen dengan layanan AI. Pastikan gambar/PDF terbaca jelas lalu coba lagi.',
      },
    };
  }
}
