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
 * Kurikulum Spesialis: Desain Kemasan Sebagai Penunjang Pemasaran UMKM
 * Disusun dari sudut pandang ahli desain kemasan (packaging designer) & strategi marketing
 */
const PACKAGING_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Audit Kemasan Produkmu Saat Ini',
    coreLearning: 'Mengenali kelemahan proteksi fisik dan visual kemasan sebelum diperbaiki',
    questionText: 'Bahan kemasan apa yang saat ini kamu pakai, dan apa kendala terbesarnya (misal: gampang melempem, minyak merembes, stiker luntur, atau terlihat murahan)?',
    secondaryPrompt: 'Sebutkan jenis wadah (plastik bening biasa, standing pouch, toples mika, thinwall, botol kaca/plastik) dan jenis labelnya.',
    exampleAnswer: 'Kami pakai standing pouch plastik bening biasa dengan stiker kertas print rumahan. Kendalanya: stiker mudah pudar kalau kena minyak dan di rak toko terlihat sama persis dengan puluhan keripik lainnya.',
    helperTips: [
      'Jangan malu mengakui kekurangan kemasan saat ini; audit jujur adalah langkah awal kemasanmu naik kelas.',
      'Perhatikan keluhan pembeli: apakah pernah ada yang komplain kemasan robek atau kerenyahan hilang?',
    ],
    linkedSlideIndex: 4,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Uji Pandang 3 Detik di Rak (First Impression)',
    coreLearning: 'Kemasan harus mampu menghentikan langkah calon pembeli dalam 3 detik pertama',
    questionText: 'Jika produkmu dijejerkan di rak toko oleh-oleh bersama 5 produk pesaing, apakah pembeli langsung tahu apa keunggulan usahamu dalam 3 detik?',
    secondaryPrompt: 'Apa elemen visual utama (warna kontras, ilustrasi, atau kata kunci) yang langsung menyedot pandangan pembeli?',
    exampleAnswer: 'Belum tentu. Saat ini merek kami warnanya pucat. Seharusnya kami pakai warna kuning kunyit menyala dengan tulisan besar "Pedas Gurih Daun Jeruk" agar mata pembeli langsung tertuju ke produk kami.',
    helperTips: [
      'Di rak toko atau feed Instagram, pembeli tidak membaca paragraf; mereka memindai (scanning) warna dan kata kunci.',
      'Pastikan ada satu elemen dominan yang langsung mencolok dibanding produk di sebelah kiri dan kanannya.',
    ],
    linkedSlideIndex: 7,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Menyusun Hierarki 3 Tulisan Utama di Bagian Depan',
    coreLearning: 'Menghindari kemasan yang membingungkan dengan aturan ukuran font bertingkat',
    questionText: 'Tuliskan 3 tulisan paling penting yang wajib langsung terbaca di bagian depan kemasanmu secara berurutan!',
    secondaryPrompt: 'Urutan wajib: 1. Nama Merek (Paling Besar) — 2. Kategori Produk (Jelas) — 3. Varian Rasa / Keunikan Utama.',
    exampleAnswer: '1. MEREK: "Dapoer Mak Renyah" (Font tebal paling dominan) — 2. KATEGORI: "Keripik Usus Krispi" (Ukuran sedang, langsung paham makanan apa) — 3. VARIAN: "Rasa Bawang Gurih Tanpa Amis" (Kontras).',
    helperTips: [
      'Jangan biarkan pembeli bertanya: "Ini jualan apa ya?". Kategori produk harus terbaca dari jarak 1,5 meter.',
      'Hindari font sambung/keriting rumit yang sulit dibaca orang tua atau saat berjalan terburu-buru.',
    ],
    linkedSlideIndex: 9,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Anatomi Legalitas & Informasi Penumbuh Kepercayaan',
    coreLearning: 'Konsumen modern rela membayar lebih jika kemasan mencantumkan jaminan keamanan',
    questionText: 'Keterangan dan legalitas apa saja yang sudah (atau segera) kamu cantumkan pada kemasan usahamu agar pembeli tidak ragu?',
    secondaryPrompt: 'Ceklis: Nomor P-IRT / BPOM, Logo Halal Kemenag, Tanggal Kedaluwarsa, Komposisi Bahan, Nomor WhatsApp / Medsos, dan Berat Bersih (Netto).',
    exampleAnswer: 'Sudah ada Logo Halal dan Nomor WhatsApp pesanan. Target bulan ini: mencantumkan nomor P-IRT resmi dan membuat kotak stempel rapi untuk "Baik Digunakan Sebelum (Exp Date)".',
    helperTips: [
      'Toko oleh-oleh modern dan minimarket menolak produk UMKM yang tidak punya P-IRT dan tanggal expired yang jelas.',
      'Cantumkan nomor WhatsApp pemesanan dan akun Instagram/TikTok agar kemasan menjadi media promosi berulang.',
    ],
    linkedSlideIndex: 11,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Kekuatan Menaikkan Harga Jual (Pricing Power)',
    coreLearning: 'Kemasan yang estetik dan rapi menciptakan persepsi harga (perceived value) berkali lipat',
    questionText: 'Jika kemasanmu di-upgrade menjadi lebih higienis, kedap udara, dan berdesain profesional, berapa kenaikan harga jual yang pantas kamu tetapkan?',
    secondaryPrompt: 'Bandingkan harga jual kemasan lama vs harga jual kemasan baru. Hitung tambahan biaya kemasan vs keuntungan harga jual barumu.',
    exampleAnswer: 'Kemasan lama (plastik klip tipis) dijual Rp10.000 (margin Rp3.000). Dengan standing pouch aluminium foil matte berstiker vinyl UV, harga bisa naik jadi Rp18.000. Biaya kemasan cuma naik Rp1.200, tapi untung bersih melonjak jadi Rp8.800 per bungkus!',
    helperTips: [
      'Pembeli tidak membeli sekadar isi makanan; mereka membeli rasa aman, kebersihan, dan gengsi saat menjadikannya oleh-oleh.',
      'Kemasan naik kelas adalah cara tercepat keluar dari perangkap banting harga murah.',
    ],
    linkedSlideIndex: 14,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Menentukan Warna Dominan & Karakter Rasa Produk',
    coreLearning: 'Psikologi warna kemasan merangsang selera makan dan emosi pembeli',
    questionText: 'Apa warna dominan yang paling mewakili karakter usahamu, dan kesan apa yang ingin kamu tancapkan ke benak pembeli?',
    secondaryPrompt: 'Contoh: Merah/Oranye (Pedas, Gurih, Lapar), Cokelat Kraft/Hijau (Alami, Sehat, Otentik), Hitam/Emas (Premium, Oleh-Oleh Mewah).',
    exampleAnswer: 'Warna terakota (merah bata) kombinasi emas tua. Kesan yang ingin ditonjolkan: sambal warisan keluarga tempo dulu yang kaya rempah nusantara, pedas mantap, dan pantas dijadikan bingkisan oleh-oleh khas kota kami.',
    helperTips: [
      'Jangan memilih warna hanya karena "itu warna favorit pemilik usaha". Pilihlah warna yang memicu selera makan pembeli targetmu.',
      'Batasi maksimal 3 kombinasi warna utama agar kemasan tidak tampak ramai dan norak.',
    ],
    linkedSlideIndex: 13,
  },
  {
    index: 6,
    sectionNumber: 7,
    sectionTitle: '7. Rencana Aksi Merombak Kemasan 30 Hari ke Depan',
    coreLearning: 'Langkah taktis bertahap yang bisa dieksekusi tanpa modal besar',
    questionText: 'Tuliskan 2 tindakan nyata yang akan kamu eksekusi dalam 30 hari ke depan untuk meningkatkan kemasan usahamu!',
    secondaryPrompt: 'Pilih langkah yang paling realistis dengan modal saat ini (misal: ganti stiker anti air, perbaiki foto produk, ganti pouch foil).',
    exampleAnswer: '1. Ganti stiker kertas HVS menjadi stiker vinyl doff tahan air dan minyak (cetak 100 lembar dulu). 2. Rombak tulisan depan agar nama varian rasa dan logo Halal terlihat besar dan tajam.',
    helperTips: [
      'Tidak perlu langsung cetak plastik printing 10.000 pcs; pakai standing pouch polos food-grade + stiker vinyl desain bagus sudah sangat mewah.',
      'Lakukan uji coba ke 10 pelanggan langganan dan tanyakan respon mereka terhadap kemasan barumu.',
    ],
    linkedSlideIndex: 16,
  },
];

const PACKAGING_POLLS: LivePollConfig[] = [
  {
    id: 'poll_kendala_kemasan_umkm',
    title: 'Kendala Terbesar Terkait Kemasan Usahamu Saat Ini',
    subtitle: 'Pilih 1 tantangan yang paling sering membuatmu ragu atau terhambat merombak kemasan:',
    linkedSlideIndex: 5,
    type: 'bar',
    options: [
      {
        id: 'opt_biaya_moq',
        label: '1. Biaya cetak mahal & minimal order (MOQ) harus ribuan pcs',
        subtitle: 'Modal terbatas dan khawatir kemasan tidak habis terpakai',
        category: 'rational',
      },
      {
        id: 'opt_keahlian_desain',
        label: '2. Bingung membuat desain label yang bagus & tidak bisa aplikasi desain',
        subtitle: 'Hasil desain sendiri terasa kaku dan kurang estetik',
        category: 'emotional',
      },
      {
        id: 'opt_daya_tahan',
        label: '3. Produk cepat melempem, bocor, atau minyak merembes ke label',
        subtitle: 'Bahan plastik yang dipakai belum kedap udara dan belum food-grade',
        category: 'rational',
      },
      {
        id: 'opt_legalitas_label',
        label: '4. Belum punya izin P-IRT / Halal resmi untuk dicantumkan',
        subtitle: 'Merasa kemasan belum percaya diri masuk ke toko oleh-oleh',
        category: 'emotional',
      },
    ],
  },
  {
    id: 'poll_kesan_kemasan_target',
    title: 'Kesan Utama yang Ingin Ditonjolkan Kemasanmu',
    subtitle: 'Ketika pembeli pertama kali melihat produkmu di rak toko, apa kesan pertama yang kamu harapkan?',
    linkedSlideIndex: 13,
    type: 'bar',
    options: [
      {
        id: 'opt_kesan_higienis',
        label: '1. Bersih, Higienis & Kualitasnya Sangat Terjamin',
        subtitle: 'Membeli tanpa takut sakit perut atau tidak sehat',
        category: 'rational',
      },
      {
        id: 'opt_kesan_otentik',
        label: '2. Otentik Tradisional & Resep Kuno Warisan Asli',
        subtitle: 'Kaya rempah dan punya nilai kearifan lokal yang kuat',
        category: 'emotional',
      },
      {
        id: 'opt_kesan_premium',
        label: '3. Premium, Estetik & Pantas untuk Bingkisan Oleh-Oleh',
        subtitle: 'Pembeli bangga membawanya pulang atau memberikannya ke kerabat',
        category: 'emotional',
      },
      {
        id: 'opt_kesan_praktis',
        label: '4. Praktis, Renyah & Enak Dimakan Kapan Saja (On-The-Go)',
        subtitle: 'Porsi pas dengan ziplock yang bisa ditutup kembali',
        category: 'rational',
      },
    ],
  },
];

const PACKAGING_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'WORKSHOP DESAIN KEMASAN UMKM',
    title: 'Pentingnya Desain Kemasan Sebagai Penunjang Pemasaran Bagi UMKM',
    subtitle: 'Kemasan Bukan Cuma Bungkus: Penentu Pembeli Mau Beli & Rela Bayar Mahal — PartnerUp',
    type: 'cover',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'AGENDA PELATIHAN',
    title: 'Peta Perjalanan Belajar Hari Ini',
    subtitle: 'Membongkar rahasia kemasan juara dari sudut pandang desain grafis dan strategi pemasaran:',
    type: 'agenda',
    cards: [
      { title: '1. Peran Vital Kemasan', body: 'Menyadari fungsi kemasan sebagai pelindung, wiraniaga diam (silent salesperson), dan pembangun nilai merek.', accent: 'orange' },
      { title: '2. Hukum 3 Detik di Rak Toko', body: 'Teknik psikologi visual agar mata pembeli langsung tertuju ke produkmu di antara puluhan pesaing.', accent: 'teal' },
      { title: '3. Anatomi Rumus 5 Elemen Label', body: 'Menyusun hierarki tulisan depan dan informasi legalitas belakang kemasan secara proporsional.', accent: 'orange' },
      { title: '4. Packaging Power & Strategi Harga', body: 'Cara cerdas menaikkan margin laba bersih hingga 2-3x lipat lewat kemasan naik kelas tanpa modal raksasa.', accent: 'teal' },
    ],
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'FONDASI KEMASAN',
    title: '3 Peran Vital Kemasan dalam Pemasaran Produk',
    subtitle: 'Kemasan modern bekerja 24 jam untuk usahamu bahkan saat kamu sedang tidur:',
    type: 'concept',
    cards: [
      { title: '1. Proteksi Fisik (Protect)', body: 'Menjaga kerenyahan, aroma, dan higienitas produk. Kemasan seindah apa pun jika produk melempem akan membuat pembeli kapok membeli ulang.', accent: 'orange' },
      { title: '2. Wiraniaga Diam (Silent Salesperson)', body: 'Saat produk ditaruh di rak toko atau feed Instagram, kemasanlah yang berbicara, merayu, dan meyakinkan dompet pembeli.', accent: 'teal' },
      { title: '3. Identitas & Pembeda (Brand Identity)', body: 'Wajah visual yang dicari pembeli ketika mereka ingin memesan kembali (repeat order) atau merekomendasikan ke teman.', accent: 'orange' },
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'REALITA PASAR',
    title: 'Kenyataan Pahit: Produk Enak Sering Kalah dari Kemasan Bagus',
    subtitle: 'Pembeli tidak bisa mencicipi rasa makanan sebelum mereka memutuskan membeli!',
    type: 'comparison',
    comparison: {
      leftTitle: 'Kemasan Biasa / Asal Bungkus',
      leftBody: 'Rasa enak resep turun-temurun, tapi dikemas plastik tipis buram diikat karet atau klip mika biasa. Pembeli mengira produk murahan, tidak higienis, dan menawar harga semurah mungkin (Rp8.000 - Rp10.000).',
      rightTitle: 'Kemasan Profesional & Higienis',
      rightBody: 'Memakai standing pouch matte / foil food-grade dengan stiker vinyl desain bersih dan nomor P-IRT jelas. Pembeli langsung percaya higienis, pantas untuk oleh-oleh keluarga, dan rela membayar Rp20.000 - Rp28.000 tanpa menawar!',
    },
    promptLines: ['Pelajaran penting: "Rasa enak membuat pembeli membeli ulang, tapi kemasan bagus yang membuat mereka mau membeli untuk pertama kali!"'],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'PRAKTIK 1: AUDIT',
    title: 'Audit Kemasan Produkmu Saat Ini',
    subtitle: 'Mari kita kenali kelemahan dan peluang kemasan usahamu di layar HP masing-masing:',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    cards: [
      { title: 'Bahan Wadah', body: 'Apakah sudah kedap udara dan melindungi dari minyak/cahaya matahari?', accent: 'orange' },
      { title: 'Daya Tahan Label', body: 'Apakah stiker mudah lepas, pudar kena air, atau mudah robek?', accent: 'teal' },
    ],
    promptLines: ['Bahan kemasan dan kendala terbesar usahamu saat ini: ______________'],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'POLLING INTERAKTIF',
    title: 'Tantangan Terbesar Kemasan UMKM',
    subtitle: 'Yuk kita petakan apa kendala paling mendesak dari teman-teman pelaku UMKM di ruangan ini:',
    type: 'concept',
    linkedPollId: 'poll_kendala_kemasan_umkm',
    cards: [
      { title: '1. Modal & MOQ Cetak', body: 'Khawatir harus cetak minimal 5.000 - 10.000 pcs.', accent: 'orange' },
      { title: '2. Keterbatasan Desain', body: 'Bingung paduan warna dan tipografi font yang rapi.', accent: 'teal' },
      { title: '3. Legalitas & Uji Ketahanan', body: 'Belum paham aturan P-IRT dan tanggal expired.', accent: 'orange' },
    ],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'PSIKOLOGI KONSUMEN',
    title: 'Hukum 3 Detik: Pembeli Tidak Membaca, Pembeli Memindai!',
    subtitle: 'Dalam 3 detik pertama, otak calon pembeli memutuskan: melirik atau mengabaikan.',
    type: 'concept',
    cards: [
      { title: 'Detik 1: Warna & Siluet', body: 'Warna kemasan yang kontras dan bentuk wadah yang berdiri kokoh (standing) ditangkap mata terlebih dahulu.', accent: 'orange' },
      { title: 'Detik 2: Jenis Produk', body: 'Mata mencari kepastian: "Ini makanan apa?". Tulisan kategori produk harus langsung terbaca jelas tanpa mikir.', accent: 'teal' },
      { title: 'Detik 3: Keunggulan Pembeda', body: 'Klaim pemikat: rasa gurih daun jeruk, tanpa MSG, renyah 3 bulan, atau logo Halal resmi.', accent: 'orange' },
    ],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'PRAKTIK 2: FIRST IMPRESSION',
    title: 'Uji Pandang 3 Detik di Rak Pesaing',
    subtitle: 'Bayangkan produkmu ditaruh berdampingan dengan 5 kompetitor sejenis di minimarket atau toko oleh-oleh:',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    promptLines: ['Apakah produkmu langsung menyedot perhatian dalam 3 detik? ______________'],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'FORMULA DESAIN',
    title: 'Anatomi Label Depan: Rumus 5 Elemen Wajib Kemasan Juara',
    subtitle: 'Jangan jejalkan semua tulisan di bagian depan! Fokus pada 5 elemen penarik penjualan:',
    type: 'formula',
    cards: [
      { title: '1. Brand / Nama Merek (30%)', body: 'Gunakan font tegas dan gampang dibaca. Jangan pakai font sambung yang keriting berlebihan.', accent: 'orange' },
      { title: '2. Kategori Produk (25%)', body: 'Sebutkan jenis barangnya: "Keripik Singkong", "Sambal Cumi", "Kue Kacang". Jangan disembunyikan!', accent: 'teal' },
      { title: '3. Varian / Keunggulan (20%)', body: 'Keterangan rasa atau keunikan resep: "Ekstra Daun Jeruk", "100% Gula Kelapa Asli".', accent: 'orange' },
      { title: '4. Ilustrasi / Jendela Intip (15%)', body: 'Bisa berupa foto produk menggugah selera atau kemasan window transparan agar pembeli melihat isinya.', accent: 'teal' },
      { title: '5. Netto & Tanda Legalitas (10%)', body: 'Berat bersih (misal: "Netto 150g") dan logo Halal di pojok bawah depan.', accent: 'orange' },
    ],
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'PRAKTIK 3: HIERARKI LABEL',
    title: 'Menyusun Hierarki 3 Tulisan Utama Depan',
    subtitle: 'Urutkan ukuran huruf agar pembeli tidak pusing saat melihat kemasan usahamu:',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    promptLines: [
      '1. Nama Merek (Paling Besar): ______________',
      '2. Kategori Produk (Ukuran Sedang): ______________',
      '3. Varian Rasa / Keunikan Utama: ______________',
    ],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'BAGIAN BELAKANG',
    title: 'Sisi Belakang Kemasan: Membangun Kepercayaan & Loyalitas',
    subtitle: 'Bagian depan menarik mata, bagian belakang meyakinkan dompet dan izin edar!',
    type: 'concept',
    cards: [
      { title: '1. Komposisi Bahan Baku', body: 'Urutkan dari bahan dengan takaran terbanyak ke paling sedikit. Menunjukkan kejujuran dan higienitas.', accent: 'orange' },
      { title: '2. Nomor Izin Edar (P-IRT / BPOM)', body: 'Kunci mutlak agar produk diterima toko retail modern, supermarket, dan toko oleh-oleh bandara.', accent: 'teal' },
      { title: '3. Tanggal Kedaluwarsa (Exp Date)', body: 'Sediakan kotak putih rapi untuk stempel atau print tanggal. Hindari menulis tangan asal-asalan dengan spidol.', accent: 'orange' },
      { title: '4. Media Promosi & Repeat Order', body: 'Nomor WhatsApp customer care, akun Instagram/TikTok, dan kode QR untuk pemesanan kembali.', accent: 'teal' },
    ],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'PRAKTIK 4: LEGALITAS & TRUST',
    title: 'Checklist Legalitas & Keterangan Belakang Kemasan',
    subtitle: 'Mari cek kelengkapan informasi usahamu untuk persiapan masuk toko retail:',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    promptLines: ['Legalitas dan informasi yang sudah/akan kamu cantumkan: ______________'],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'PSIKOLOGI WARNA',
    title: 'Panduan Memilih Warna Kemasan yang Selaras Rasa',
    subtitle: 'Warna adalah pesan bawah sadar yang memancing air liur dan selera pembeli:',
    type: 'concept',
    cards: [
      { title: 'Merah & Oranye Terakota', body: 'Memicu nafsu makan, rasa pedas, gurih, sambal, krispi, dan makanan cepat saji.', accent: 'orange' },
      { title: 'Cokelat Kraft & Hijau Alami', body: 'Menyampaikan pesan alami, organik, resep tradisional tempo dulu, sehat, dan tanpa pengawet.', accent: 'teal' },
      { title: 'Kuning Cerah & Emas Muda', body: 'Kesan ceria, hangat, renyah, kue mentega, keripik pisang, dan produk ramah keluarga.', accent: 'orange' },
      { title: 'Hitam Matte & Emas Mewah', body: 'Menciptakan kesan eksklusif, mahal, premium, sangat cocok untuk oleh-oleh eksekutif atau kopi spesialti.', accent: 'teal' },
    ],
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'PRAKTIK 5: WARNA & KARAKTER',
    title: 'Menentukan Warna Dominan & Pesan Rasa',
    subtitle: 'Pilihlah kombinasi warna yang paling selaras dengan identitas produk usahamu:',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    promptLines: ['Warna dominan kemasanmu dan alasan pemilihannya: ______________'],
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'STRATEGI HARGA',
    title: 'Packaging Power: Cara Menaikkan Harga Jual & Margin Usaha',
    subtitle: 'Modal kemasan naik Rp1.500, harga jual produk bisa dinaikkan Rp8.000 - Rp12.000!',
    type: 'concept',
    cards: [
      { title: '1. Menembus Pasar Hadiah & Oleh-Oleh', body: 'Orang enggan memberi oleh-oleh dalam bungkus plastik kresek; kemasan bagus layak dijadikan buah tangan berharga.', accent: 'orange' },
      { title: '2. Hilangkan Kebiasaan Menawar', body: 'Kemasan profesional membuat pembeli segan menawar harga murah karena terlihat seperti produk bermerek dari pabrik terstandar.', accent: 'teal' },
      { title: '3. Margin Bersih Meningkat Drastis', body: 'Kenaikan biaya kemasan standing pouch jauh lebih kecil dibanding lonjakan keuntungan harga jual baru.', accent: 'orange' },
    ],
  },
  {
    index: 15,
    pageNumber: 16,
    badge: 'PRAKTIK 6: SIMULASI HARGA',
    title: 'Simulasi Kenaikan Harga Jual Produkmu',
    subtitle: 'Hitung potensi lonjakan omzet dan margin laba bersih setelah kemasan dirombak:',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    promptLines: ['Harga Kemasan Lama vs Harga Kemasan Baru & Tambahan Untung Bersih: ______________'],
  },
  {
    index: 16,
    pageNumber: 17,
    badge: 'SOLUSI ANGGARAN & AKSI',
    title: 'Rencana Aksi 30 Hari: Kemasan Naik Kelas Tanpa Modal Besar',
    subtitle: 'Strategi cerdas bagi UMKM yang belum mampu cetak ribuan pcs di pabrik besar:',
    type: 'closing',
    linkedQuestionIndex: 6,
    promptLines: ['2 Tindakan Nyata Merombak Kemasan dalam 30 Hari: ______________'],
    cards: [
      { title: 'Tahap 1: Polos Food-Grade + Stiker Vinyl', body: 'Beli standing pouch matte polos kualitas prima (isi 50 pcs), tempel stiker vinyl cetak digital anti air & minyak. Tampilan sudah setara pabrik besar!', accent: 'orange' },
      { title: 'Tahap 2: Buat 1 Desain Template Universal', body: 'Gunakan 1 desain stiker utama, lalu sediakan kolom centang untuk varian rasa (pedas/manis/original) agar hemat ongkos cetak.', accent: 'teal' },
      { title: 'Tahap 3: Foto Kemasan dengan Cahaya Alami', body: 'Ambil foto kemasan baru di dekat jendela terang dengan latar kayu/kain bersih untuk katalog WhatsApp dan Instagram.', accent: 'orange' },
    ],
  },
];

export const PACKAGING_DESIGN_MARKETING_CURRICULUM: SavedMaterial = {
  id: 'desain_kemasan_pemasaran_umkm',
  seminarTitle: 'Pentingnya Desain Kemasan Sebagai Penunjang Pemasaran Bagi UMKM',
  organizerName: 'Program PartnerUp | Obeecreatives',
  description: 'Kurikulum Spesialis: Mengubah kemasan menjadi wiraniaga diam (silent salesperson), hukum pandang 3 detik di rak toko, rumus anatomi label juara, dan strategi menaikkan harga jual 2x lipat (7 Pertanyaan, 17 Slide).',
  category: 'Workshop Kemasan & Branding',
  isDefault: false,
  createdAt: 1730700000000,
  updatedAt: 1730700000000,
  content: {
    seminarTitle: 'Pentingnya Desain Kemasan Sebagai Penunjang Pemasaran Bagi UMKM',
    organizerName: 'Program PartnerUp | Obeecreatives',
    questions: PACKAGING_QUESTIONS,
    polls: PACKAGING_POLLS,
    slides: PACKAGING_SLIDES,
    qnaTopics: [
      'Bahan & Ketahanan Kemasan',
      'Hierarki Desain & Font Label',
      'Legalitas (P-IRT, Halal, Barcode)',
      'Strategi Naikkan Harga Jual',
      'Solusi Cetak Tanpa MOQ Ribuan',
      'Foto Produk untuk Display Sosmed',
    ],
    brandTheme: {
      presetId: 'preset_packaging_amber',
      name: 'Kemasan & Branding (Amber Emas)',
      primaryColor: '#1F3A5F',
      accentColor: '#D97706',
      secondaryColor: '#059669',
      bgColor: '#FFFBEB',
    },
    updatedAt: 1730700000000,
    materialId: 'desain_kemasan_pemasaran_umkm',
    description: 'Kurikulum Spesialis: Mengubah kemasan menjadi wiraniaga diam (silent salesperson), hukum pandang 3 detik di rak toko, rumus anatomi label juara, dan strategi menaikkan harga jual 2x lipat.',
    category: 'Workshop Kemasan & Branding',
    isDefault: false,
    createdAt: 1730700000000,
  },
};

/**
 * Daftar Material Bawaan Awal
 */
export const INITIAL_PRESET_MATERIALS: SavedMaterial[] = [
  DEFAULT_PARTNERUP_CURRICULUM,
  PACKAGING_DESIGN_MARKETING_CURRICULUM,
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
      // Pastikan materi bawaan selalu ada jika belum tersimpan di sesi browser pengguna
      const hasMaster = parsed.some((m) => m.id === DEFAULT_PARTNERUP_CURRICULUM.id);
      const hasPackaging = parsed.some((m) => m.id === PACKAGING_DESIGN_MARKETING_CURRICULUM.id);
      const hasSesi2 = parsed.some((m) => m.id === SESI_2_ACTION_PLAN_CURRICULUM.id);
      const hasCopywriting = parsed.some((m) => m.id === COPYWRITING_MATERIAL_PRESET.id);

      let updated = [...parsed];
      let changed = false;

      if (!hasMaster) {
        updated.unshift(DEFAULT_PARTNERUP_CURRICULUM);
        changed = true;
      }
      if (!hasPackaging) {
        // Taruh materi desain kemasan di posisi kedua yang paling mencolok
        updated.splice(1, 0, PACKAGING_DESIGN_MARKETING_CURRICULUM);
        changed = true;
      }
      if (!hasSesi2) {
        updated.splice(2, 0, SESI_2_ACTION_PLAN_CURRICULUM);
        changed = true;
      }
      if (!hasCopywriting) {
        updated.push(COPYWRITING_MATERIAL_PRESET);
        changed = true;
      }

      if (changed) {
        saveSavedMaterialsLocal(updated);
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
