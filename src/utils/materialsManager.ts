import {
  PARTNERUP_QUESTIONS,
  LIVE_POLLS,
  SEMINAR_SLIDES,
  DEFAULT_QNA_TOPICS,
  WorksheetQuestion,
  LivePollConfig,
  SlideDefinition,
} from '../data/seminarData';
import { CustomContentDoc, SavedMaterial, BrandThemeConfig } from '../types';
export type { SavedMaterial };
import { DEFAULT_BRAND_THEME, sanitizeBrandTheme } from '../brandTheme';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';

export const LOCAL_MATERIALS_KEY = 'partnerup_materials_library_v2';
export const ACTIVE_MATERIAL_ID_KEY = 'partnerup_active_material_id';

/**
 * Kurikulum Bawaan Master: Sesi 1 (Value Proposition & Diferensiasi UMKM)
 */
export const DEFAULT_PARTNERUP_CURRICULUM: SavedMaterial = {
  id: 'partnerup_sesi_1_curriculum',
  seminarTitle: 'Kenapa Pembeli Harus Pilih Kamu? (Value Proposition UMKM)',
  organizerName: 'Program PartnerUp | Obeecreatives',
  description: 'Kurikulum Utama Sesi 1: Merumuskan alasan rasional, emosional, audit bio toko & diferensiasi produk UMKM (8 Pertanyaan, 17 Slide).',
  category: 'Sesi 1 (Master)',
  isDefault: true,
  createdAt: 1729000000000,
  updatedAt: 1730000000000,
  content: {
    seminarTitle: 'Kenapa Pembeli Harus Pilih Kamu? (Value Proposition UMKM)',
    organizerName: 'Program PartnerUp | Obeecreatives',
    questions: PARTNERUP_QUESTIONS,
    polls: LIVE_POLLS,
    slides: SEMINAR_SLIDES,
    qnaTopics: DEFAULT_QNA_TOPICS,
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1730000000000,
    materialId: 'partnerup_sesi_1_curriculum',
    description: 'Kurikulum Utama Sesi 1: Merumuskan alasan rasional, emosional, audit bio toko & diferensiasi produk UMKM.',
    category: 'Sesi 1 (Master)',
    isDefault: true,
    createdAt: 1729000000000,
  },
};

/**
 * Kurikulum Lanjutan: Sesi 2 (Rencana Aksi, Strategi Harga & Penjualan UMKM)
 * Dirancang khusus untuk sesi lanjutan pelatihan minggu depan
 */
const SESI_2_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Pemantapan Kalimat Penawaran (Value Hook)',
    coreLearning: 'Mengevaluasi hasil uji coba kalimat penawaran ke calon pembeli',
    questionText: 'Tuliskan 1 kalimat penawaran terbaik usahamu yang sudah kamu coba atau sempurnakan sejak Sesi 1!',
    secondaryPrompt: 'Pastikan menyebutkan siapa pembelinya dan apa manfaat unik yang mereka dapat.',
    exampleAnswer: 'Katering diet rendah garam khusus lansia di Surabaya barat, dengan menu konsultasi ahli gizi & gratis antar tepat waktu.',
    helperTips: [
      'Gunakan masukan atau tanggapan pembeli selama seminggu terakhir.',
      'Fokus pada solusi yang membuat pembeli merasa tidak salah pilih.',
    ],
    linkedSlideIndex: 1,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Strategi Penetapan Harga & Margin (Pricing)',
    coreLearning: 'Menghitung harga dari nilai tambah nyata, bukan sekadar perang murah',
    questionText: 'Berapa persentase margin laba bersih produk unggulanmu, dan apa alasan pembeli rela membayar harga tersebut?',
    secondaryPrompt: 'Jelaskan apakah kamu memakai metode HPP + Margin atau Value-Based Pricing.',
    exampleAnswer: 'Margin bersih 35%. Pembeli rela bayar lebih mahal karena kemasan kedap udara tahan 3 bulan tanpa pengawet kimia.',
    helperTips: [
      'Perang harga murah merusak arus kas usaha.',
      'Berikan bukti nyata (kebersihan, kecepatan, garansi) agar harga premium masuk akal.',
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Paket Penawaran & Bundling Produk',
    coreLearning: 'Menaikkan nilai rata-rata transaksi pembeli (Average Order Value)',
    questionText: 'Rancang 1 paket bundling (gabungan 2-3 produk/jasa) yang membuat pembeli merasa jauh lebih untung!',
    secondaryPrompt: 'Tulis nama paket, isi produk, dan perbandingan harga eceran vs harga paket.',
    exampleAnswer: 'Paket Sarapan Hemat Keluarga: 2 Bento Ayam + 1 Tumis Sayur + 2 Teh Manis hanya Rp55.000 (hemat Rp12.000 dibanding satuan).',
    helperTips: [
      'Gabungkan produk terlaris dengan produk pendamping berbiaya rendah.',
      'Tampilkan nominal hemat agar penawaran terasa sangat menguntungkan.',
    ],
    linkedSlideIndex: 5,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Standar SOP Balas Chat WhatsApp & Closing',
    coreLearning: 'Mengubah chat tanya-tanya menjadi transfer pembayaran tanpa memaksa',
    questionText: 'Tulis contoh kalimat sapaan ramah dan pertanyaan pemantik saat pembeli baru chat "Masih ada kak?" di WhatsApp!',
    secondaryPrompt: 'Hindari hanya menjawab "Ada". Arahkan langsung ke pilihan rasa, ukuran, atau jadwal pengiriman.',
    exampleAnswer: '"Halo Kak! Masih ready hangat baru selesai panggang hari ini. Rencana mau dikirim untuk acara sore ini atau besok pagi Kak?"',
    helperTips: [
      'Selalu akhiri chat dengan pertanyaan ramah pilihan ganda, bukan kalimat buntu.',
      'Beri kepastian stok hangat atau slot pengiriman hari ini.',
    ],
    linkedSlideIndex: 7,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Rencana Aksi 14 Hari ke Depan (Action Commitment)',
    coreLearning: 'Komitmen nyata yang bisa langsung dievaluasi hasilnya',
    questionText: 'Tulis 3 tindakan konkret yang wajib kamu selesaikan dalam 14 hari ke depan untuk meningkatkan omzet usahamu!',
    secondaryPrompt: 'Sebutkan tanggal target atau jumlah pembeli baru yang ingin didapatkan.',
    exampleAnswer: '1. Update foto profil & katalog WhatsApp. 2. Hubungi 15 pelanggan lama beri promo paket bundling. 3. Target 10 transaksi baru minggu depan.',
    helperTips: [
      'Target yang terukur jauh lebih mudah dicapai daripada target umum.',
      'Fokus pada tindakan menjemput bola ke pelanggan yang sudah pernah beli.',
    ],
    linkedSlideIndex: 9,
  },
];

const SESI_2_POLLS: LivePollConfig[] = [
  {
    id: 'poll_kendala_eksekusi',
    title: 'Tantangan Terbesar dalam Mengeksekusi Penjualan Minggu Ini',
    subtitle: 'Pilih satu tantangan yang paling mendesak untuk diselesaikan di usahamu saat ini:',
    linkedSlideIndex: 2,
    type: 'bar',
    options: [
      {
        id: 'opt_closing_chat',
        label: '1. Banyak yang chat tapi jarang sampai transfer (Ghosting)',
        subtitle: 'Kerap berhenti setelah menanyakan daftar harga',
        category: 'rational',
      },
      {
        id: 'opt_margin_tipis',
        label: '2. Takut menaikkan harga karena khawatir pembeli kabur',
        subtitle: 'Margin tipis dan beban produksi makin tinggi',
        category: 'rational',
      },
      {
        id: 'opt_konten_waktu',
        label: '3. Tidak sempat promosi rutin karena repot produksi',
        subtitle: 'Usaha masih dikerjakan sendiri tanpa tim pembantu',
        category: 'emotional',
      },
      {
        id: 'opt_pelanggan_lama',
        label: '4. Bingung cara mengajak pembeli lama order ulang',
        subtitle: 'Belum ada sistem database kontak pelanggan',
        category: 'emotional',
      },
    ],
  },
];

const SESI_2_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'SESI 2: EKSEKUSI & ACTION PLAN',
    title: 'Dari Pemahaman Menjadi Omzet Nyata',
    subtitle: 'Strategi Harga, Paket Bundling & SOP Closing Chat WhatsApp UMKM — PartnerUp',
    type: 'cover',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'BAGIAN 1',
    title: 'Review & Uji Coba Kalimat Penawaran',
    subtitle: 'Apakah calon pembelimu sudah langsung paham apa keunggulan usahamu?',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    cards: [
      { title: '1. Jelas & Tidak Klise', body: 'Bukan sekadar "Enak, Murah, Berkualitas", tapi sebutkan bukti atau racikan khas.', accent: 'orange' },
      { title: '2. Menyentuh Rasa Butuh', body: 'Ingatkan pembeli mengapa mereka membutuhkannya hari ini.', accent: 'teal' },
    ],
    promptLines: ['Tuliskan kalimat penawaran terbaik usahamu saat ini: ______________'],
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'POLLING INTERAKTIF',
    title: 'Tantangan Eksekusi di Lapangan',
    subtitle: 'Yuk kita petakan kendala teman-teman UMKM sebelum masuk materi strategi.',
    type: 'concept',
    linkedPollId: 'poll_kendala_eksekusi',
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'BAGIAN 2',
    title: 'Strategi Penetapan Harga (Pricing) Tanpa Perang Diskon',
    subtitle: 'Pembeli tidak keberatan bayar lebih mahal jika mereka yakin hasilnya sesuai janji.',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    comparison: {
      leftTitle: 'Perang Harga Murah',
      leftBody: 'Menurunkan harga demi bersaing. Akibatnya margin tipis, capek tenaga, dan pembeli mudah berpaling ke yang lebih murah.',
      rightTitle: 'Value-Based Pricing (Nilai Tambah)',
      rightBody: 'Pertahankan harga sehat dengan memberi garansi ketepatan rasa, kebersihan kemasan, dan pelayanan prima.',
    },
    promptLines: ['Berapa margin laba bersih usahamu saat ini? ______________'],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'BAGIAN 3',
    title: 'Seni Membuat Paket Bundling',
    subtitle: 'Cara mudah menaikkan total belanjaan pembeli dalam 1 kali transaksi.',
    type: 'concept',
    cards: [
      { title: 'Paket Pemula (Trial)', body: 'Ukuran kecil/porsi mini untuk pembeli baru yang ingin coba-coba tanpa risiko rugi.', accent: 'orange' },
      { title: 'Paket Hemat Keluarga (Bundle)', body: 'Kombinasi 3 varian terlaris dengan potongan harga menarik dibanding satuan.', accent: 'teal' },
      { title: 'Paket Langganan / Hadiah', body: 'Disiapkan dengan kartu ucapan rapi untuk hantaran atau kantor.', accent: 'orange' },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'PRAKTIK BUNDLING',
    title: 'Rancang Paket Bundling Usahamu',
    subtitle: 'Tuliskan ide paket penawaran yang langsung bisa diposting di status WhatsApp hari ini.',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    promptLines: ['Nama Paket: ______________', 'Isi Produk: ______________', 'Harga Paket vs Satuan: ______________'],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'BAGIAN 4',
    title: 'SOP Balas Chat WhatsApp: Jangan Biarkan Buntu',
    subtitle: 'Ubah pertanyaan "Masih ada kak?" menjadi transfer pembayaran dengan teknik closing ramah.',
    type: 'concept',
    cards: [
      { title: 'Respons Cepat (< 5 Menit)', body: 'Pembeli online punya rentang fokus pendek; balasan cepat mencegah mereka beralih.', accent: 'orange' },
      { title: 'Beri Pertanyaan Pilihan Ganda', body: 'Jangan akhiri chat dengan titik; tanyakan pilihan rasa, ukuran, atau jadwal antar.', accent: 'teal' },
      { title: 'Kirim Format Pemesanan Rapi', body: 'Mudahkan pembeli mengisi nama, alamat, dan pilihan pembayaran sekali klik.', accent: 'orange' },
    ],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'PRAKTIK CHAT WA',
    title: 'Simulasi Balas Chat Calon Pembeli',
    subtitle: 'Tuliskan kalimat pembuka dan cara memandu pembeli agar langsung transfer.',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    promptLines: ['Kalimat balasan saat pembeli bertanya ketersediaan: ______________'],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'BAGIAN 5',
    title: 'Komitmen Aksi 14 Hari',
    subtitle: 'Ilmu pelatihan hanya akan menjadi uang jika dieksekusi dengan disiplin.',
    type: 'concept',
    cards: [
      { title: 'Tindakan 1', body: 'Perbarui etalase, foto profil, dan katalog WhatsApp Business.', accent: 'orange' },
      { title: 'Tindakan 2', body: 'Tawarkan paket bundling ke minimal 10 pelanggan yang sudah ada.', accent: 'teal' },
      { title: 'Tindakan 3', body: 'Evaluasi respon dan hitung omzet mingguan usahamu.', accent: 'orange' },
    ],
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'PENUTUP & KOMITMEN',
    title: 'Tulis Rencana Aksi Nyata 14 Hari',
    subtitle: 'Tulis 3 komitmen tindakan konkretmu sekarang!',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    promptLines: ['3 Komitmen Aksi 14 Hari ke Depan: ______________'],
  },
];

export const SESI_2_ACTION_PLAN_CURRICULUM: SavedMaterial = {
  id: 'partnerup_sesi_2_action_plan',
  seminarTitle: 'Sesi 2: Dari Pemahaman Menjadi Omzet (Action Plan & SOP Penjualan)',
  organizerName: 'Program PartnerUp | Obeecreatives',
  description: 'Kurikulum Lanjutan Sesi 2: Rencana aksi 14 hari, strategi penetapan harga tanpa perang diskon, paket bundling & SOP closing chat WhatsApp (5 Pertanyaan, 10 Slide).',
  category: 'Sesi 2 (Lanjutan)',
  isDefault: false,
  createdAt: 1730000000000,
  updatedAt: 1730000000000,
  content: {
    seminarTitle: 'Sesi 2: Dari Pemahaman Menjadi Omzet (Action Plan & SOP Penjualan)',
    organizerName: 'Program PartnerUp | Obeecreatives',
    questions: SESI_2_QUESTIONS,
    polls: SESI_2_POLLS,
    slides: SESI_2_SLIDES,
    qnaTopics: ['Strategi Harga & Margin', 'Paket Bundling', 'SOP Chat WhatsApp', 'Closing Penjualan', 'Action Plan 14 Hari'],
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1730000000000,
    materialId: 'partnerup_sesi_2_action_plan',
    description: 'Kurikulum Lanjutan Sesi 2: Rencana aksi 14 hari, strategi penetapan harga tanpa perang diskon, paket bundling & SOP closing chat WhatsApp.',
    category: 'Sesi 2 (Lanjutan)',
    isDefault: false,
    createdAt: 1730000000000,
  },
};

/**
 * Kurikulum Praktik: Copywriting & Foto Produk Sosmed UMKM
 */
export const COPYWRITING_MATERIAL_PRESET: SavedMaterial = {
  id: 'copywriting_foto_sosmed_umkm',
  seminarTitle: 'Cara Menulis Caption & Foto Produk yang Bikin Pembeli Langsung Chat',
  organizerName: 'Program PartnerUp | Obeecreatives',
  description: 'Materi Praktik Singkat: Merombak Bio profil toko, merangkai hook caption promosi, dan Call to Action di sosmed (3 Pertanyaan, 5 Slide).',
  category: 'Workshop Khusus',
  isDefault: false,
  createdAt: 1729500000000,
  updatedAt: 1730000000000,
  content: {
    seminarTitle: 'Cara Menulis Caption & Foto Produk yang Bikin Pembeli Langsung Chat',
    organizerName: 'Program PartnerUp | Obeecreatives',
    questions: [
      {
        index: 0,
        sectionNumber: 1,
        sectionTitle: '1. Audit Profil Toko Saat Ini',
        coreLearning: 'Memastikan pembeli langsung paham produkmu dalam 3 detik',
        questionText: 'Apa kalimat yang saat ini tertulis di Bio Instagram atau profil WhatsApp usahamu?',
        secondaryPrompt: 'Apakah sudah menyebutkan lokasi dan cara pesan?',
        exampleAnswer: 'Sedia aneka kue basah & tumpeng mini Sidoarjo. Pesan H-1 via WA.',
        helperTips: ['Bio yang jelas membantu pembeli baru percaya tanpa harus tanya berulang-ulang.'],
        linkedSlideIndex: 1,
      },
      {
        index: 1,
        sectionNumber: 2,
        sectionTitle: '2. Headline Pancingan (Hook)',
        coreLearning: 'Kalimat baris pertama yang menghentikan jempol pembeli saat scroll',
        questionText: 'Tulis 1 kalimat pembuka caption yang menyentuh masalah pembelimu!',
        secondaryPrompt: 'Gunakan pertanyaan atau masalah sehari-hari pembeli',
        exampleAnswer: 'Bingung cari hantaran arisan yang kelihatan mewah tapi budget di bawah Rp50 ribu?',
        helperTips: ['Jangan mulai caption dengan "Kami menjual...", mulailah dengan kondisi yang dialami pembeli.'],
        linkedSlideIndex: 2,
      },
      {
        index: 2,
        sectionNumber: 3,
        sectionTitle: '3. Ajakan Bertindak (Call to Action)',
        coreLearning: 'Mengarahkan pembeli agar langsung klik atau chat sekarang',
        questionText: 'Tulis kalimat penutup promosi (Call to Action) yang bikin pembeli segera pesan!',
        secondaryPrompt: 'Tambahkan batas kuota atau bonus agar tidak ditunda',
        exampleAnswer: 'Amankan kuota pengiriman Jumat pagi sekarang (sisa 5 slot) — klik link WA di bio!',
        helperTips: ['Berikan alasan kenapa mereka harus chat hari ini, bukan minggu depan.'],
        linkedSlideIndex: 3,
      },
    ],
    polls: [
      {
        id: 'poll_kendala_konten',
        title: 'Kendala Terbesar Saat Buat Konten Promosi',
        subtitle: 'Apa hal yang paling sering membuatmu batal posting di Instagram/WhatsApp?',
        linkedSlideIndex: 1,
        type: 'bar',
        options: [
          {
            id: 'bingung_caption',
            label: '1. Bingung mau nulis kalimat caption apa',
            subtitle: 'Sudah ada foto tapi mentok merangkai kata',
            category: 'rational',
          },
          {
            id: 'foto_kurang_bagus',
            label: '2. Merasa foto produk kurang terang / kurang menarik',
            subtitle: 'Belum percaya diri dengan hasil kamera HP',
            category: 'rational',
          },
          {
            id: 'tidak_sempat',
            label: '3. Sibuk produksi & melayani pembeli sampai lupa posting',
            subtitle: 'Kurang waktu luang untuk mengedit',
            category: 'emotional',
          },
        ],
      },
    ],
    slides: [
      {
        index: 0,
        pageNumber: 1,
        badge: 'SEMINAR COPYWRITING UMKM',
        title: 'Cara Menulis Caption & Foto Produk yang Bikin Pembeli Langsung Chat',
        subtitle: 'Praktik Langsung Merombak Bio & Promosi Harian — Obeecreatives',
        type: 'cover',
      },
      {
        index: 1,
        pageNumber: 2,
        badge: 'BAGIAN 1',
        title: 'Audit Bio & Profil Toko',
        subtitle: 'Dalam 3 detik pertama, pembeli baru memutuskan lanjut lihat atau keluar.',
        type: 'worksheet',
        linkedQuestionIndex: 0,
        linkedPollId: 'poll_kendala_konten',
        promptLines: ['Tulis isi Bio Instagram / WA usahamu saat ini: ______________'],
      },
      {
        index: 2,
        pageNumber: 3,
        badge: 'BAGIAN 2',
        title: 'Membuat Kalimat Pancingan (Hook)',
        subtitle: 'Sentuh masalah pembeli di baris pertama sebelum menawarkan produk.',
        type: 'worksheet',
        linkedQuestionIndex: 1,
        comparison: {
          leftTitle: 'Biasa (Kurang Menarik)',
          leftBody: '"Ready stok sambal cumi botol 150gr harga Rp25.000. Silakan diorder kak."',
          rightTitle: 'Kuat (Menggugah Pembeli)',
          rightBody: '"Pulang kerja capek dan malas masak? Cukup nasi hangat + 1 sendok Sambal Cumi potongan penuh ini, makan malam langsung lahap!"',
        },
        promptLines: ['Kalimat pancingan (Hook) untuk produkku: ______________'],
      },
      {
        index: 3,
        pageNumber: 4,
        badge: 'BAGIAN 3',
        title: 'Call to Action (Ajakan Membeli)',
        subtitle: 'Akhiri promosi dengan petunjuk pesan yang jelas dan mudah.',
        type: 'worksheet',
        linkedQuestionIndex: 2,
        promptLines: ['Kalimat ajakan pesan (CTA) yang akan kupakai: ______________'],
      },
      {
        index: 4,
        pageNumber: 5,
        badge: 'PENUTUP & Q&A',
        title: 'Saatnya Praktik & Tanya Jawab!',
        subtitle: 'Silakan kirim pertanyaan seputar Copywriting & Konten Sosmed.',
        type: 'closing',
        cards: [
          { title: '1. Rapikan Bio Toko', body: 'Pastikan produk utama dan lokasi langsung terlihat.', accent: 'orange' },
          { title: '2. Pakai Hook Masalah', body: 'Panggil kebutuhan pembeli di kalimat pertama.', accent: 'teal' },
          { title: '3. Beri Ajakan Jelas', body: 'Arahkan langsung ke nomor WhatsApp atau keranjang.', accent: 'orange' },
        ],
      },
    ],
    qnaTopics: ['Copywriting Caption', 'Bio Instagram', 'Foto Produk HP', 'Strategi WhatsApp'],
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1730000000000,
    materialId: 'copywriting_foto_sosmed_umkm',
    description: 'Materi Praktik Singkat: Merombak Bio profil toko, merangkai hook caption promosi, dan Call to Action di sosmed.',
    category: 'Workshop Khusus',
    isDefault: false,
    createdAt: 1729500000000,
  },
};

/**
 * Daftar Material Bawaan Awal
 */
export const INITIAL_PRESET_MATERIALS: SavedMaterial[] = [
  DEFAULT_PARTNERUP_CURRICULUM,
  SESI_2_ACTION_PLAN_CURRICULUM,
  COPYWRITING_MATERIAL_PRESET,
];

/**
 * Muat daftar materi tersimpan dari LocalStorage dengan fallback ke preset bawaan
 */
export function getSavedMaterialsLocal(): SavedMaterial[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_MATERIALS_KEY);
    if (!raw) {
      saveSavedMaterialsLocal(INITIAL_PRESET_MATERIALS);
      return INITIAL_PRESET_MATERIALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Pastikan materi bawaan master selalu ada jika tidak sengaja hilang
      const hasMaster = parsed.some((m) => m.id === DEFAULT_PARTNERUP_CURRICULUM.id);
      const hasSesi2 = parsed.some((m) => m.id === SESI_2_ACTION_PLAN_CURRICULUM.id);
      let updated = [...parsed];
      if (!hasMaster) {
        updated.unshift(DEFAULT_PARTNERUP_CURRICULUM);
      }
      if (!hasSesi2) {
        updated.splice(1, 0, SESI_2_ACTION_PLAN_CURRICULUM);
      }
      return updated;
    }
    saveSavedMaterialsLocal(INITIAL_PRESET_MATERIALS);
    return INITIAL_PRESET_MATERIALS;
  } catch (err) {
    console.warn('Gagal membaca localStorage materi:', err);
    return INITIAL_PRESET_MATERIALS;
  }
}

/**
 * Simpan daftar materi ke LocalStorage
 */
export function saveSavedMaterialsLocal(materials: SavedMaterial[]): void {
  try {
    window.localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify(materials));
  } catch (err) {
    console.warn('Gagal menyimpan ke localStorage materi:', err);
  }
}

/**
 * Dapatkan ID materi aktif yang sedang dipilih (jika ada)
 */
export function getActiveMaterialIdLocal(): string {
  try {
    return window.localStorage.getItem(ACTIVE_MATERIAL_ID_KEY) || DEFAULT_PARTNERUP_CURRICULUM.id;
  } catch {
    return DEFAULT_PARTNERUP_CURRICULUM.id;
  }
}

export function setActiveMaterialIdLocal(id: string): void {
  try {
    window.localStorage.setItem(ACTIVE_MATERIAL_ID_KEY, id);
  } catch {
    // noop
  }
}

/**
 * Sinkronisasi materi dengan Firestore (membaca koleksi custom_content)
 */
export async function syncMaterialsFromFirestore(db: Firestore): Promise<SavedMaterial[]> {
  const localList = getSavedMaterialsLocal();
  try {
    const snapshot = await getDocs(collection(db, 'custom_content'));
    const remoteDocs: SavedMaterial[] = [];
    
    snapshot.forEach((d) => {
      // Jangan masukkan dokumen 'active' sebagai entri material terpisah jika merupakan representasi runtime
      if (d.id === 'active') return;
      const data = d.data() as Partial<CustomContentDoc>;
      if (data.seminarTitle && Array.isArray(data.questions) && Array.isArray(data.slides)) {
        remoteDocs.push({
          id: d.id,
          seminarTitle: data.seminarTitle,
          organizerName: data.organizerName || 'Program PartnerUp',
          description: data.description || '',
          category: data.category || 'Materi Kustom',
          isDefault: Boolean(data.isDefault),
          createdAt: data.createdAt || data.updatedAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
          content: {
            seminarTitle: data.seminarTitle,
            organizerName: data.organizerName || 'Program PartnerUp',
            questions: data.questions,
            polls: Array.isArray(data.polls) ? data.polls : [],
            slides: data.slides,
            qnaTopics: Array.isArray(data.qnaTopics) ? data.qnaTopics : DEFAULT_QNA_TOPICS,
            brandTheme: sanitizeBrandTheme(data.brandTheme),
            updatedAt: data.updatedAt || Date.now(),
            materialId: d.id,
            description: data.description,
            category: data.category,
            isDefault: Boolean(data.isDefault),
            createdAt: data.createdAt,
          },
        });
      }
    });

    if (remoteDocs.length > 0) {
      // Gabungkan data remote dan lokal (remote menang jika updatedAt lebih baru)
      const mergedMap = new Map<string, SavedMaterial>();
      localList.forEach((m) => mergedMap.set(m.id, m));
      remoteDocs.forEach((m) => mergedMap.set(m.id, m));
      const merged = Array.from(mergedMap.values());
      saveSavedMaterialsLocal(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Gagal membaca remote materials Firestore, menggunakan lokal:', err);
  }
  return localList;
}

/**
 * Simpan atau perbarui sebuah materi di Bank Materi (Lokal & Firestore)
 */
export async function persistMaterial(
  db: Firestore,
  material: SavedMaterial,
  setAsActive: boolean = false
): Promise<SavedMaterial[]> {
  const currentList = getSavedMaterialsLocal();
  const existingIndex = currentList.findIndex((m) => m.id === material.id);
  
  const updatedMaterial: SavedMaterial = {
    ...material,
    updatedAt: Date.now(),
    content: {
      ...material.content,
      seminarTitle: material.seminarTitle,
      organizerName: material.organizerName,
      materialId: material.id,
      description: material.description,
      category: material.category,
      isDefault: material.isDefault,
      updatedAt: Date.now(),
    },
  };

  let nextList: SavedMaterial[];
  if (existingIndex >= 0) {
    nextList = [...currentList];
    nextList[existingIndex] = updatedMaterial;
  } else {
    nextList = [updatedMaterial, ...currentList];
  }

  saveSavedMaterialsLocal(nextList);

  if (setAsActive) {
    setActiveMaterialIdLocal(material.id);
  }

  // Simpan ke Firestore
  try {
    // Simpan ke doc ID materi di custom_content/{material.id}
    await setDoc(doc(db, 'custom_content', material.id), {
      seminarTitle: updatedMaterial.seminarTitle,
      organizerName: updatedMaterial.organizerName,
      questions: updatedMaterial.content.questions,
      polls: updatedMaterial.content.polls,
      slides: updatedMaterial.content.slides,
      qnaTopics: updatedMaterial.content.qnaTopics,
      brandTheme: sanitizeBrandTheme(updatedMaterial.content.brandTheme),
      updatedAt: updatedMaterial.updatedAt,
      materialId: updatedMaterial.id,
      description: updatedMaterial.description || '',
      category: updatedMaterial.category || 'Materi Kustom',
      isDefault: Boolean(updatedMaterial.isDefault),
      createdAt: updatedMaterial.createdAt || Date.now(),
    });

    // Jika diminta aktifkan, perbarui juga custom_content/active
    if (setAsActive) {
      await setDoc(doc(db, 'custom_content', 'active'), {
        seminarTitle: updatedMaterial.seminarTitle,
        organizerName: updatedMaterial.organizerName,
        questions: updatedMaterial.content.questions,
        polls: updatedMaterial.content.polls,
        slides: updatedMaterial.content.slides,
        qnaTopics: updatedMaterial.content.qnaTopics,
        brandTheme: sanitizeBrandTheme(updatedMaterial.content.brandTheme),
        updatedAt: updatedMaterial.updatedAt,
        materialId: updatedMaterial.id,
        description: updatedMaterial.description || '',
        category: updatedMaterial.category || 'Materi Kustom',
        isDefault: Boolean(updatedMaterial.isDefault),
        createdAt: updatedMaterial.createdAt || Date.now(),
      });
    }
  } catch (err) {
    console.warn('Gagal menyimpan materi ke Firestore, data aman di lokal:', err);
  }

  return nextList;
}

/**
 * Hapus materi dari Bank Materi
 */
export async function removeMaterial(
  db: Firestore,
  materialId: string
): Promise<{ success: boolean; nextList: SavedMaterial[] }> {
  // Materi bawaan asli tidak boleh dihapus
  if (materialId === DEFAULT_PARTNERUP_CURRICULUM.id) {
    return { success: false, nextList: getSavedMaterialsLocal() };
  }

  const currentList = getSavedMaterialsLocal();
  const nextList = currentList.filter((m) => m.id !== materialId);
  saveSavedMaterialsLocal(nextList);

  try {
    await deleteDoc(doc(db, 'custom_content', materialId));
  } catch (err) {
    console.warn('Gagal menghapus materi di Firestore:', err);
  }

  return { success: true, nextList };
}

/**
 * Buat salinan baru dari materi yang ada (Duplikasi)
 */
export function duplicateMaterial(
  sourceMaterial: SavedMaterial,
  newTitlePrefix: string = 'Salinan dari '
): SavedMaterial {
  const newId = `mat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const title = `${newTitlePrefix}${sourceMaterial.seminarTitle}`.slice(0, 120);

  return {
    id: newId,
    seminarTitle: title,
    organizerName: sourceMaterial.organizerName,
    description: `Duplikasi dibuat pada ${new Date().toLocaleDateString('id-ID')}. Berisi ${sourceMaterial.content.slides.length} slide dan ${sourceMaterial.content.questions.length} pertanyaan.`,
    category: 'Materi Kustom',
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: {
      ...sourceMaterial.content,
      seminarTitle: title,
      materialId: newId,
      description: `Salinan dari ${sourceMaterial.seminarTitle}`,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
}

/**
 * Buat template materi baru dari awal (Kanvas Bersih)
 */
export function createBlankMaterial(
  title: string,
  organizerName: string = 'Program PartnerUp | Obeecreatives',
  brandTheme: BrandThemeConfig = DEFAULT_BRAND_THEME
): SavedMaterial {
  const newId = `mat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const cleanTitle = (title.trim() || 'Materi Pelatihan Baru').slice(0, 120);

  const blankQuestions: WorksheetQuestion[] = [
    {
      index: 0,
      sectionNumber: 1,
      sectionTitle: '1. Pertanyaan Praktik Pertama',
      coreLearning: 'Menuliskan ide atau jawaban utama peserta',
      questionText: 'Tuliskan tantangan atau ide utamamu pada bagian ini:',
      secondaryPrompt: 'Gunakan kalimat yang jelas dan spesifik.',
      exampleAnswer: 'Contoh jawaban yang baik dan mudah dipahami.',
      helperTips: ['Berikan contoh nyata yang dialami usahamu.'],
      linkedSlideIndex: 1,
    },
    {
      index: 1,
      sectionNumber: 2,
      sectionTitle: '2. Komitmen Rencana Aksi',
      coreLearning: 'Tindakan nyata yang akan dieksekusi setelah materi ini',
      questionText: 'Apa 1 langkah nyata yang akan langsung kamu terapkan minggu ini?',
      secondaryPrompt: 'Tuliskan target waktu atau jumlah yang ingin dicapai.',
      exampleAnswer: 'Memperbaiki kemasan produk dan mencoba penawaran paket bundling.',
      helperTips: ['Fokus pada langkah kecil yang bisa langsung dieksekusi.'],
      linkedSlideIndex: 2,
    },
  ];

  const blankSlides: SlideDefinition[] = [
    {
      index: 0,
      pageNumber: 1,
      badge: 'MODUL BARU',
      title: cleanTitle,
      subtitle: `${organizerName} — Pelatihan Interaktif UMKM`,
      type: 'cover',
    },
    {
      index: 1,
      pageNumber: 2,
      badge: 'BAGIAN 1',
      title: 'Identifikasi Masalah & Praktik',
      subtitle: 'Mari kita mulai dengan latihan pertama di layar HP masing-masing.',
      type: 'worksheet',
      linkedQuestionIndex: 0,
      cards: [
        { title: 'Poin Utama 1', body: 'Penjelasan konsep penting pada slide ini.', accent: 'orange' },
        { title: 'Poin Utama 2', body: 'Contoh penerapan nyata di lapangan.', accent: 'teal' },
      ],
      promptLines: ['Pertanyaan latihan: ______________'],
    },
    {
      index: 2,
      pageNumber: 3,
      badge: 'BAGIAN 2',
      title: 'Rencana Eksekusi & Tindakan Nyata',
      subtitle: 'Tuliskan komitmen langkah yang akan dieksekusi.',
      type: 'worksheet',
      linkedQuestionIndex: 1,
      cards: [
        { title: 'Target Waktu', body: 'Kapan langkah ini akan diselesaikan.', accent: 'orange' },
        { title: 'Dampak Usaha', body: 'Hasil yang diharapkan bagi bisnis.', accent: 'teal' },
      ],
      promptLines: ['Langkah komitmenku: ______________'],
    },
    {
      index: 3,
      pageNumber: 4,
      badge: 'PENUTUP & EVALUASI',
      title: 'Tanya Jawab & Kesimpulan',
      subtitle: 'Terima kasih atas partisipasi aktif seluruh peserta!',
      type: 'closing',
      cards: [
        { title: '1. Pahami Nilai Unik', body: 'Jangan takut berbeda dari pesaing.', accent: 'orange' },
        { title: '2. Eksekusi Cepat', body: 'Lakukan perbaikan kecil setiap minggu.', accent: 'teal' },
      ],
    },
  ];

  const blankPolls: LivePollConfig[] = [
    {
      id: `poll_${newId}`,
      title: 'Tingkat Kesiapan Eksekusi Materi Ini',
      subtitle: 'Seberapa yakin kamu bisa menerapkan materi ini di usahamu?',
      linkedSlideIndex: 1,
      type: 'bar',
      options: [
        { id: 'opt_sangat_siap', label: '1. Sangat Siap & Langsung Praktik', subtitle: 'Siap eksekusi hari ini', category: 'rational' },
        { id: 'opt_perlu_waktu', label: '2. Perlu Waktu Menyiapkan Tim/Bahan', subtitle: 'Butuh persiapan tambahan', category: 'rational' },
        { id: 'opt_butuh_bimbingan', label: '3. Masih Butuh Bimbingan Mentor', subtitle: 'Ingin konsultasi lebih lanjut', category: 'emotional' },
      ],
    },
  ];

  return {
    id: newId,
    seminarTitle: cleanTitle,
    organizerName,
    description: `Materi baru dibuat pada ${new Date().toLocaleDateString('id-ID')}. Siap disesuaikan pertanyaan dan slidenya.`,
    category: 'Materi Baru',
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: {
      seminarTitle: cleanTitle,
      organizerName,
      questions: blankQuestions,
      polls: blankPolls,
      slides: blankSlides,
      qnaTopics: ['Praktik Lapangan', 'Kendala Teknis', 'Strategi Lanjutan'],
      brandTheme,
      updatedAt: Date.now(),
      materialId: newId,
      description: `Materi baru dibuat pada ${new Date().toLocaleDateString('id-ID')}`,
      category: 'Materi Baru',
      isDefault: false,
      createdAt: Date.now(),
    },
  };
}

/**
 * Unduh 1 Materi sebagai file .JSON ke komputer
 */
export function downloadMaterialAsJson(material: SavedMaterial): void {
  const fileName = `Materi_${material.seminarTitle.replace(/[^a-zA-Z0-9_\-]/g, '_')}.json`;
  const dataStr = JSON.stringify(material, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Unduh seluruh Bank Materi sebagai 1 file cadangan bundle .JSON
 */
export function downloadAllMaterialsBundleAsJson(materials: SavedMaterial[]): void {
  const fileName = `Semua_Bank_Materi_PartnerUp_${new Date().toISOString().slice(0, 10)}.json`;
  const exportPayload = {
    bundleVersion: '2.0',
    exportDate: new Date().toISOString(),
    totalMaterials: materials.length,
    materials,
  };
  const dataStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
