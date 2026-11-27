import { doc, Firestore, getDoc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';
import { sanitizeForFirestore } from '../firebase';
import { FlipchartBoardDoc } from '../types';

export type RoadmapPriority = 'tinggi' | 'sedang' | 'santai';
export type RoadmapStatus = 'ide' | 'menyusun' | 'selesai';

export interface CurriculumRoadmapItem {
  id: string;
  title: string;
  pillar: string;
  priority: RoadmapPriority;
  status: RoadmapStatus;
  summary: string;
  tierPlan: {
    seminar: string;
    workshop: string;
    coaching: string;
  };
  linkedMaterialId?: string;
  createdAt: number;
  updatedAt: number;
}

export const ROADMAP_LOCAL_KEY = 'obee_curriculum_roadmap_v1';
export const ROADMAP_DOC_ID = 'curriculum_roadmap';
const ROADMAP_SOURCE_ID = 'obeeacademy_roadmap';
const ROADMAP_DISMISSED_SEEDS_KEY = 'obee_roadmap_dismissed_seeds_v1';
const ROADMAP_FINANCE_LINK_UPGRADE_KEY = 'obee_roadmap_fin_linked_v1';

const FINANCE_ROADMAP_ITEM: CurriculumRoadmapItem = {
  id: 'rm_laporan_keuangan_umkm',
  title: 'Laporan Keuangan Praktis UMKM: Pisah Kas, Hitung HPP & Laba Rugi 1 Halaman',
  pillar: 'Pilar Bisnis & Keuangan',
  priority: 'tinggi',
  status: 'selesai',
  summary:
    'Panduan keuangan anti-rumit untuk UMKM: memisahkan rekening pribadi dan usaha, menghitung HPP asli termasuk biaya kemasan/promo/admin marketplace, serta membaca arus kas dan titik impas harian.',
  tierPlan: {
    seminar:
      '5 bocor halus keuangan UMKM (omzet ramai tapi kas kosong), aturan gaji pemilik, & rumus cek margin aman.',
    workshop:
      'Praktik isi template HPP & Laporan Arus Kas–Laba Rugi 1 halaman memakai angka produk masing-masing.',
    coaching:
      'Bedah catatan transaksi 1 bulan terakhir peserta & tentukan batas aman biaya iklan/promo serta target penjualan harian.',
  },
  linkedMaterialId: 'laporan_keuangan_umkm_master_1',
  createdAt: 1735000008000,
  updatedAt: 1735100000000,
};

export const DEFAULT_CURRICULUM_ROADMAP: CurriculumRoadmapItem[] = [
  {
    id: 'rm_video_pendek_jualan',
    title: 'Video Pendek Jualan (Reels / TikTok / Shorts) dengan Smartphone & CapCut',
    pillar: 'Pilar Konten Visual',
    priority: 'tinggi',
    status: 'ide',
    summary:
      'Panduan praktis UMKM merekam dan mengedit video produk 15–30 detik hanya bermodal HP agar memancing perhatian di detik pertama dan mengundang order.',
    tierPlan: {
      seminar: 'Anatomi hook 3 detik, 5 ide video tanpa tampil wajah, & rumus video pendek jualan.',
      workshop: 'Praktik langsung rekam 3 angle + edit cepat di CapCut + pasang teks/subjudul siap tayang.',
      coaching: 'Bedah hasil editan video peserta, koreksi pencahayaan/ritme, & jadwal tayang 14 hari.',
    },
    createdAt: 1735000001000,
    updatedAt: 1735000001000,
  },
  {
    id: 'rm_desain_canva_konsisten',
    title: 'Desain Konten Media Sosial Konsisten dengan Canva (Anti-Pasaran)',
    pillar: 'Pilar Konten Visual',
    priority: 'tinggi',
    status: 'ide',
    summary:
      'Mengubah Identitas Visual menjadi template IG Feed/Story/Status WA yang rapi, konsisten warna & font, serta mudah diperbarui pemilik maupun admin.',
    tierPlan: {
      seminar: '3 kesalahan desain yang bikin akun terlihat kurang tepercaya & aturan 1 warna + 2 font.',
      workshop: 'Merakit 3 template Canva siap pakai (promo paket, edukasi produk, & testimoni) sesuai brand.',
      coaching: 'Audit kerapian feed Instagram peserta & penyesuaian layout katalog produk.',
    },
    createdAt: 1735000002000,
    updatedAt: 1735000002000,
  },
  {
    id: 'rm_food_product_styling',
    title: 'Food & Product Styling Sederhana dengan Properti Murah',
    pillar: 'Pilar Fotografi Lanjutan',
    priority: 'sedang',
    status: 'ide',
    summary:
      'Melanjutkan Foto Produk Dasar dengan teknik komposisi, alas foto, tekstur, dan properti hemat biaya agar produk F&B & kriya terlihat bernilai tinggi.',
    tierPlan: {
      seminar: 'Prinsip komposisi 60-30-10, pemilihan warna alas yang menguatkan produk, & properti pendukung.',
      workshop: 'Praktik merangkai set styling mini untuk F&B & kerajinan dengan properti di bawah Rp100 ribu.',
      coaching: 'Kurasi ulang foto katalog produk peserta & daftar properti wajib sesuai jenis usaha.',
    },
    createdAt: 1735000003000,
    updatedAt: 1735000003000,
  },
  {
    id: 'rm_optimasi_etalase_digital',
    title: 'Optimasi Etalase Digital: Google Maps (GBP), Bio IG & Katalog WhatsApp',
    pillar: 'Pilar Digital Presence',
    priority: 'tinggi',
    status: 'ide',
    summary:
      'Merapikan pintu masuk calon pembeli sebelum beriklan: Google Business Profile agar mudah dicari di Maps, Bio IG konversi tinggi, & Katalog WhatsApp Business.',
    tierPlan: {
      seminar: 'Kenapa pembeli batal beli karena toko susah dicari di Google Maps & alur chat WA membingungkan.',
      workshop: 'Setup langsung Google Business Profile, tulis ulang Bio IG 3 baris + link, & susun Katalog WA.',
      coaching: 'Audit alur klik dari Maps/IG hingga ke chat WA + pesan sambutan otomatis.',
    },
    createdAt: 1735000004000,
    updatedAt: 1735000004000,
  },
  {
    id: 'rm_dasar_iklan_berbayar',
    title: 'Dasar Iklan Berbayar (Meta Ads / TikTok Ads) Tanpa Takut Boncos',
    pillar: 'Pilar Traffic & Iklan',
    priority: 'sedang',
    status: 'ide',
    summary:
      'Bekal sebelum menekan tombol Boost/Ads: menentukan produk pancingan, membaca metrik dasar (CTR & biaya per chat), serta menghindari pemborosan anggaran.',
    tierPlan: {
      seminar: 'Kapan produk siap diiklankan, bedanya Boost Post vs Ads Manager, & batas aman anggaran iklan.',
      workshop: 'Simulasi menyusun kampanye pesan WhatsApp bertarget lokal dengan anggaran uji coba harian.',
      coaching: 'Evaluasi data iklan peserta, membedakan kendala materi kreatif vs target audiens.',
    },
    createdAt: 1735000005000,
    updatedAt: 1735000005000,
  },
  {
    id: 'rm_ai_riset_copywriting',
    title: 'Pemanfaatan AI untuk Riset Pasar, Ide Konten 30 Hari & Copywriting Manusiawi',
    pillar: 'Pilar AI & Produktivitas',
    priority: 'tinggi',
    status: 'ide',
    summary:
      'Menggunakan asisten AI secara cerdas untuk menggali masalah pelanggan dan membuat bank ide 30 hari dengan gaya bahasa yang tetap hangat dan natural.',
    tierPlan: {
      seminar: 'Ciri caption AI yang kaku vs cara memberi konteks usaha agar hasil tulisan terasa manusiawi.',
      workshop: 'Menyusun prompt profil usaha + menghasilkan kalender konten 30 hari & skrip balasan WA.',
      coaching: 'Menyelaraskan gaya bahasa brand peserta pada template prompt pribadi untuk tim.',
    },
    createdAt: 1735000006000,
    updatedAt: 1735000006000,
  },
  {
    id: 'rm_sop_konten_tim_kreatif',
    title: 'SOP Konten Harian, Kalender Editorial & Alur Kerja Tim Kreatif',
    pillar: 'Pilar Sistem Kerja',
    priority: 'sedang',
    status: 'ide',
    summary:
      'Membangun sistem kerja pembuatan konten dan follow-up harian agar promosi tidak berhenti saat pemilik sibuk produksi atau saat mulai mendelegasikan ke admin.',
    tierPlan: {
      seminar: 'Mengatasi siklus "semangat 3 hari lalu menghilang" dengan pembagian tugas 30 menit/hari.',
      workshop: 'Mengisi kalender konten 2 minggu + checklist serah-terima brief singkat pemilik & admin.',
      coaching: 'Menyusun SOP mingguan khusus operasional usaha peserta & jadwal evaluasi rutin.',
    },
    createdAt: 1735000007000,
    updatedAt: 1735000007000,
  },
  FINANCE_ROADMAP_ITEM,
];

function sanitizeRoadmapItems(raw: unknown): CurriculumRoadmapItem[] {
  if (!Array.isArray(raw)) return DEFAULT_CURRICULUM_ROADMAP;
  const cleaned: CurriculumRoadmapItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Partial<CurriculumRoadmapItem>;
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title) continue;
    const priority: RoadmapPriority =
      item.priority === 'tinggi' || item.priority === 'sedang' || item.priority === 'santai'
        ? item.priority
        : 'sedang';
    const status: RoadmapStatus =
      item.status === 'ide' || item.status === 'menyusun' || item.status === 'selesai'
        ? item.status
        : 'ide';
    cleaned.push({
      id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `rm_${Date.now()}`,
      title: title.slice(0, 140),
      pillar: typeof item.pillar === 'string' && item.pillar.trim() ? item.pillar.trim().slice(0, 60) : 'Pilar Kurikulum',
      priority,
      status,
      summary: typeof item.summary === 'string' ? item.summary.trim().slice(0, 400) : '',
      tierPlan: {
        seminar: typeof item.tierPlan?.seminar === 'string' ? item.tierPlan.seminar.trim().slice(0, 220) : '',
        workshop: typeof item.tierPlan?.workshop === 'string' ? item.tierPlan.workshop.trim().slice(0, 220) : '',
        coaching: typeof item.tierPlan?.coaching === 'string' ? item.tierPlan.coaching.trim().slice(0, 220) : '',
      },
      linkedMaterialId:
        typeof item.linkedMaterialId === 'string' && item.linkedMaterialId.trim()
          ? item.linkedMaterialId.trim()
          : undefined,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : Date.now(),
    });
  }
  return cleaned.length > 0 ? cleaned : DEFAULT_CURRICULUM_ROADMAP;
}

const ADDITIONAL_OFFICIAL_SEEDS: CurriculumRoadmapItem[] = [FINANCE_ROADMAP_ITEM];

function getDismissedSeedIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(ROADMAP_DISMISSED_SEEDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((id): id is string => typeof id === 'string'))
      : new Set();
  } catch {
    return new Set();
  }
}

export function markRoadmapSeedDismissed(itemId: string): void {
  if (!ADDITIONAL_OFFICIAL_SEEDS.some((seed) => seed.id === itemId)) return;
  try {
    const current = getDismissedSeedIds();
    current.add(itemId);
    window.localStorage.setItem(ROADMAP_DISMISSED_SEEDS_KEY, JSON.stringify(Array.from(current)));
  } catch {
    // ignore storage errors
  }
}

function applyPendingSeedMerges(items: CurriculumRoadmapItem[]): {
  items: CurriculumRoadmapItem[];
  changed: boolean;
} {
  const dismissed = getDismissedSeedIds();
  const next = [...items];
  let changed = false;

  for (const seed of ADDITIONAL_OFFICIAL_SEEDS) {
    if (!dismissed.has(seed.id) && !next.some((it) => it.id === seed.id)) {
      next.push(seed);
      changed = true;
    }
  }

  try {
    const upgradedOnce = window.localStorage.getItem(ROADMAP_FINANCE_LINK_UPGRADE_KEY) === '1';
    const finIdx = next.findIndex((it) => it.id === FINANCE_ROADMAP_ITEM.id);
    if (finIdx >= 0 && !upgradedOnce) {
      const existing = next[finIdx];
      const hasGenericDraftLink =
        !existing.linkedMaterialId || existing.linkedMaterialId.startsWith('mat_');
      if (hasGenericDraftLink) {
        next[finIdx] = {
          ...existing,
          status: 'selesai',
          linkedMaterialId: FINANCE_ROADMAP_ITEM.linkedMaterialId,
          updatedAt: Math.max(existing.updatedAt || 0, FINANCE_ROADMAP_ITEM.updatedAt),
        };
        changed = true;
      }
      window.localStorage.setItem(ROADMAP_FINANCE_LINK_UPGRADE_KEY, '1');
    }
  } catch {
    // ignore storage errors
  }

  return { items: next, changed };
}

export function loadCurriculumRoadmapLocal(): CurriculumRoadmapItem[] {
  try {
    const raw = window.localStorage.getItem(ROADMAP_LOCAL_KEY);
    if (!raw) {
      saveCurriculumRoadmapLocal(DEFAULT_CURRICULUM_ROADMAP);
      return DEFAULT_CURRICULUM_ROADMAP;
    }
    const sanitized = sanitizeRoadmapItems(JSON.parse(raw));
    const merged = applyPendingSeedMerges(sanitized);
    if (merged.changed) {
      saveCurriculumRoadmapLocal(merged.items);
    }
    return merged.items;
  } catch {
    return DEFAULT_CURRICULUM_ROADMAP;
  }
}

export function saveCurriculumRoadmapLocal(items: CurriculumRoadmapItem[]): void {
  try {
    window.localStorage.setItem(ROADMAP_LOCAL_KEY, JSON.stringify(items));
  } catch {
    // noop
  }
}

export async function saveCurriculumRoadmap(
  db: Firestore,
  items: CurriculumRoadmapItem[]
): Promise<CurriculumRoadmapItem[]> {
  const cleanItems = sanitizeRoadmapItems(items);
  saveCurriculumRoadmapLocal(cleanItems);

  const payload: FlipchartBoardDoc = sanitizeForFirestore({
    isOpen: false,
    syncToProjector: false,
    activePageIndex: 0,
    pagesJson: JSON.stringify(cleanItems),
    sourceDeviceId: ROADMAP_SOURCE_ID,
    updatedAt: Math.trunc(Date.now()),
  });

  try {
    await setDoc(doc(db, 'flipchart', ROADMAP_DOC_ID), payload);
  } catch (err) {
    console.warn('Gagal menyinkronkan roadmap kurikulum ke Firestore (tersimpan lokal):', err);
  }

  return cleanItems;
}

export async function loadCurriculumRoadmap(db: Firestore): Promise<CurriculumRoadmapItem[]> {
  const local = loadCurriculumRoadmapLocal();
  try {
    const snap = await getDoc(doc(db, 'flipchart', ROADMAP_DOC_ID));
    if (snap.exists()) {
      const data = snap.data() as Partial<FlipchartBoardDoc>;
      if (typeof data.pagesJson === 'string' && data.pagesJson.trim().startsWith('[')) {
        const parsed = sanitizeRoadmapItems(JSON.parse(data.pagesJson));
        const merged = applyPendingSeedMerges(parsed);
        saveCurriculumRoadmapLocal(merged.items);
        if (merged.changed) {
          void saveCurriculumRoadmap(db, merged.items);
        }
        return merged.items;
      }
    } else {
      // Seed awal ke Firestore agar perangkat lain langsung memiliki daftar rencana awal
      await saveCurriculumRoadmap(db, local);
    }
  } catch (err) {
    console.warn('Gagal membaca roadmap kurikulum dari Firestore, menggunakan data lokal:', err);
  }
  return local;
}

export function subscribeCurriculumRoadmap(
  db: Firestore,
  onUpdate: (items: CurriculumRoadmapItem[]) => void
): Unsubscribe {
  onUpdate(loadCurriculumRoadmapLocal());
  const ref = doc(db, 'flipchart', ROADMAP_DOC_ID);
  let seeded = false;

  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<FlipchartBoardDoc>;
        if (typeof data.pagesJson === 'string' && data.pagesJson.trim().startsWith('[')) {
          try {
            const parsed = sanitizeRoadmapItems(JSON.parse(data.pagesJson));
            const merged = applyPendingSeedMerges(parsed);
            saveCurriculumRoadmapLocal(merged.items);
            if (merged.changed) {
              void saveCurriculumRoadmap(db, merged.items);
            }
            onUpdate(merged.items);
            return;
          } catch {
            // fallback to local
          }
        }
      } else if (!seeded) {
        seeded = true;
        const local = loadCurriculumRoadmapLocal();
        void saveCurriculumRoadmap(db, local);
      }
    },
    (err) => {
      console.warn('Listener roadmap kurikulum fallback ke lokal:', err);
    }
  );
}
