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
 * Kurikulum Lanjutan PartnerUp: Sesi 2 (Target Penjualan, Margin Ideal & Copywriting Penyampai Value Proposition)
 * Dirancang khusus melanjutkan pendalaman 3 sesi Value Proposition untuk UMKM F&B (yoghurt, keripik), Kriya (handycraft), & Jasa Persewaan
 */
const SESI_2_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Review Value Proposition & Biaya Menjaga Janji',
    coreLearning: 'Setiap janji Value Proposition punya konsekuensi kualitas/pelayanan yang harus dihitung ke dalam modal',
    questionText: 'Tulis ulang 1 kalimat Value Proposition usahamu dari sesi sebelumnya, lalu sebutkan 1 hal nyata yang wajib kamu siapkan agar janji itu selalu terbukti!',
    secondaryPrompt: 'Contoh hal nyata: botol segel & ice gel (F&B), box pelindung & kartu cerita (Kriya), atau pengecekan unit steril & antar tepat waktu (Persewaan).',
    exampleAnswer: 'Yoghurt segar tanpa pemanis buatan untuk ibu & anak, tahan dingin dengan botol segel higienis. Hal wajib disiapkan: botol food-grade + segel + ice pack saat pengiriman.',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa (F&B)',
    helperTips: [
      'Jangan hanya ingat kalimat promosinya; ingat juga "ongkos menjaga kepercayaan" di balik kalimat itu.',
      'Jika kamu jasa persewaan: janji "bersih & tepat waktu" butuh biaya cuci/steril dan cadangan waktu antar.',
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Menetapkan Target Laba Bersih Bulanan (Bukan Pasrah)',
    coreLearning: 'Target penjualan adalah kompas; tanpa target angka, strategi marketing tidak punya arah yang jelas',
    questionText: 'Berapa nominal KEUNTUNGAN BERSIH (di luar modal bahan) yang WAJIB dihasilkan usahamu dalam 1 bulan ke depan?',
    secondaryPrompt: 'Mulai dari kebutuhan operasional & penghasilan wajar pemilik yang ingin kamu capai bulan ini (contoh: Rp3.000.000 – Rp6.000.000/bulan).',
    exampleAnswer: 'Target laba bersih minimal Rp4.500.000/bulan (Rp3 juta untuk kebutuhan keluarga + Rp1,5 juta untuk tabungan tambah alat/kulkas baru).',
    exampleBusiness: 'Keripik Tempe Kriuk & Yoghurt',
    helperTips: [
      'Bedakan OMZET (uang masuk kotor) dengan LABA BERSIH (uang untung setelah dipotong semua modal & operasional).',
      'Angka ini bukan untuk bikin stres, tapi menjadi "tagihan wajib" yang menggerakkan kegiatan promosimu tiap hari.',
    ],
    linkedSlideIndex: 5,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Menghitung Harga Jual & Margin Ideal Value Proposition',
    coreLearning: 'Produk ber-Value Proposition harus menjaga margin sehat (bukan margin tipis perang harga) agar kualitas tidak turun',
    questionText: 'Hitung produk/paket andalanmu: Berapa Harga Jual, Total Modal (Bahan + Biaya Kemasan/Layanan VP), dan Untung Bersih per 1 transaksi?',
    secondaryPrompt: 'Patokan sehat: F&B (30%–50%), Kriya/Handycraft (40%–70%), Jasa Persewaan (50%–70% setelah sisihkan biaya rawat/cuci/penyusutan).',
    exampleAnswer: 'Yoghurt 250ml: Harga jual Rp15.000. Modal bahan + botol segel + stiker + es = Rp8.500. Untung bersih Rp6.500/botol (Margin 43%).',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Kriya/Handycraft wajib memasukkan ongkos waktu pengerjaan & keahlian tangan, jangan hanya hitung harga benang/kayu!',
      'Jasa persewaan wajib menyisihkan 15%–20% per sewa untuk biaya cuci, perbaikan, dan dana penggantian barang rusak.',
    ],
    linkedSlideIndex: 7,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Memecah Target Bulanan Jadi Target Harian & Paket Bundling',
    coreLearning: 'Target bulanan terasa ringan jika dipecah jadi target harian dan dipercepat dengan paket bundling',
    questionText: 'Bagi Target Laba Bulananmu dengan Untung Bersih per unit! Jadi berapa unit per hari yang harus terjual, dan paket bundling apa yang bisa mempercepatnya?',
    secondaryPrompt: 'Rumus: (Target Laba ÷ Untung per unit) ÷ 25 hari kerja = Target Harian. Lalu rancang 1 paket isi beberapa produk/durasi sewa!',
    exampleAnswer: 'Target Rp4.500.000 ÷ Rp6.500 = 692 botol/bulan (sekitar 28 botol/hari). Dengan "Paket Sehat Keluarga Isi 5 Botol Rp70.000", cukup layani 5–6 pembeli saja per hari!',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Contoh Kriya: Gabungkan tas rajut + dompet koin/gantungan kunci jadi "Paket Kado Siap Beri" agar sekali beli nilainya lebih besar.',
      'Contoh Persewaan: Buat "Paket Sewa 3 Hari Harga Lebih Hemat" atau "Paket Bundling Alat + Perlengkapan Tambahan" agar nilai per transaksi naik.',
    ],
    linkedSlideIndex: 9,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Angka Jemput Bola: Berapa Chat & Calon Pembeli yang Dibutuhkan?',
    coreLearning: 'Strategi marketing adalah jembatan matematika antara target penjualan dan aktivitas promosi harian',
    questionText: 'Untuk mencapai target transaksi harianmu, kira-kira berapa orang yang harus lihat penawaranmu & chat bertanya setiap hari, dan dari saluran mana kamu menjemput mereka?',
    secondaryPrompt: 'Patokan sederhana: biasanya dari 10 orang yang chat bertanya di WA/DM, hanya 2–3 orang yang langsung beli. Artinya butuh 3–4x lipat lebih banyak orang bertanya!',
    exampleAnswer: 'Butuh 6 pembeli/hari → artinya minimal harus ada 18–20 orang chat/lihat status WA & IG per hari. Saluran utama: Status WA harian, grup ibu komplek/kantor, dan titip tester di 3 titik.',
    exampleBusiness: 'Keripik Tempe Kriuk',
    helperTips: [
      'Jika targetmu butuh 15 chat masuk per hari tapi hari ini baru ada 2 chat, tandanya promosimu masih kurang keras—bukan produkmu yang jelek.',
      'Jangan hanya menunggu algoritma medsos; jemput bola lewat database pelanggan lama, grup komunitas, atau kerja sama mitra.',
    ],
    linkedSlideIndex: 11,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Copywriting & Konten Penyampai Value Proposition (3 Pilar)',
    coreLearning: 'Copywriting yang menjual lahir langsung dari masalah pembeli, bukti nyata, dan penawaran paket yang jelas',
    questionText: 'Tulis 1 naskah promosi (untuk Status WA / Caption IG / TikTok) menggunakan rumus 3 bagian: [1. Hook Masalah Pembeli] + [2. Bukti Nyata VP] + [3. Ajakan Paket & Cara Pesan]!',
    secondaryPrompt: 'Pakai bahasa obrolan sehari-hari seperti bicara dengan tetangga/teman, jangan kaku seperti brosur bank.',
    exampleAnswer: '[Hook]: Sering bingung cari camilan sore anak yang gak bikin serik tenggorokan? [Bukti]: Yoghurt kami difermentasi 12 jam dari susu murni segar tanpa pemanis buatan & dikirim pakai botol segel dingin. [Ajakan]: Khusus hari ini ada Paket Keluarga 5 botol Rp70rb (hemat ongkir) — balas "MAU PAKET SEHAT" untuk pengiriman sore jam 4!',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Untuk Kriya: Tonjolkan cerita ketelitian tangan/keunikan motif & kesiapan dijadikan hadiah ("Sudah termasuk box & kartu ucapan").',
      'Untuk Jasa Persewaan: Tonjolkan hilangnya rasa khawatir penyewa ("Unit sudah disterilkan sebelum kirim + garansi tukar cepat jika ada kendala").',
    ],
    linkedSlideIndex: 14,
  },
  {
    index: 6,
    sectionNumber: 7,
    sectionTitle: '7. Komitmen Aksi 14 Hari Penjemput Target',
    coreLearning: 'Konsistensi aktivitas mingguan memastikan angka target benar-benar berubah menjadi omzet di rekening',
    questionText: 'Tulis 3 jadwal tindakan promosi rutin dalam 14 hari ke depan untuk mengejar target harianmu!',
    secondaryPrompt: 'Pastikan spesifik: hari apa posting konten bukti VP, berapa pelanggan lama yang dihubungi, dan kapan mengecek hitungan target.',
    exampleAnswer: '1. Setiap pagi jam 08.00 update status WA foto proses produksi/dapur bersih + paket bundling. 2. Hari Rabu & Sabtu hubungi 15 pelanggan lama tawarkan paket repeat order. 3. Setiap Minggu malam cek total unit terjual vs target mingguan.',
    exampleBusiness: 'Semua UMKM PartnerUp',
    helperTips: [
      'Evaluasi mingguan jauh lebih penting daripada pasrah di akhir bulan saat uang sudah habis.',
      'Jika minggu ke-1 target belum tercapai, perbaiki hook copywriting-nya atau perbanyak saluran penawarannya di minggu ke-2.',
    ],
    linkedSlideIndex: 15,
  },
];

const SESI_2_POLLS: LivePollConfig[] = [
  {
    id: 'poll_target_penjualan_umkm',
    title: 'Sejujurnya, Bagaimana Kondisi Target Penjualan Usahamu Saat Ini?',
    subtitle: 'Pilih satu jawaban yang paling menggambarkan kebiasaan di usahamu selama ini:',
    linkedSlideIndex: 2,
    type: 'bar',
    options: [
      {
        id: 'opt_pasrah_mengalir',
        label: '1. Belum punya angka target — yang penting laku & mengalir saja',
        subtitle: 'Berapa pun yang terjual hari ini disyukuri tanpa patokan',
        category: 'emotional',
      },
      {
        id: 'opt_target_dikepala',
        label: '2. Punya keinginan di kepala, tapi belum pernah hitung unit & marginnya',
        subtitle: 'Tahu pengen ramai, tapi tidak tahu harus jual berapa pcs/hari',
        category: 'rational',
      },
      {
        id: 'opt_bingung_strategi',
        label: '3. Sudah tulis target omzet, tapi bingung cara marketing mencapainya',
        subtitle: 'Tidak tahu harus posting apa atau cari pembeli dari mana',
        category: 'rational',
      },
      {
        id: 'opt_sudah_terukur',
        label: '4. Sudah punya target bulanan/harian & rutin dievaluasi tiap minggu',
        subtitle: 'Sudah punya kompas angka yang jelas',
        category: 'rational',
      },
    ],
  },
  {
    id: 'poll_titik_macet_marketing',
    title: 'Di Titik Mana Penjualanmu Paling Sering Macet Saat Ini?',
    subtitle: 'Setelah tahu target dan margin, bagian mana yang paling terasa menghambat omzetmu?',
    linkedSlideIndex: 10,
    type: 'bar',
    options: [
      {
        id: 'opt_sepi_traffic',
        label: '1. Sepi yang melihat — jarang ada calon pembeli baru yang bertanya',
        subtitle: 'Pembeli masih berputar di orang yang itu-itu saja',
        category: 'rational',
      },
      {
        id: 'opt_macet_copywriting',
        label: '2. Bingung menulis kata-kata promosi & konten yang bikin orang tertarik',
        subtitle: 'Sudah foto produk tapi mentok saat mau nulis caption/WA',
        category: 'emotional',
      },
      {
        id: 'opt_macet_margin',
        label: '3. Barang laku, tapi uang untungnya terasa tipis atau cepat habis',
        subtitle: 'Khawatir salah hitung margin setelah menambah kualitas VP',
        category: 'rational',
      },
      {
        id: 'opt_macet_bundling',
        label: '4. Pembeli cuma ambil eceran 1 pcs atau sewa durasi tersingkat',
        subtitle: 'Belum punya paket hemat/bundling yang menggiurkan',
        category: 'emotional',
      },
    ],
  },
];

const SESI_2_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'SESI 2 PARTNERUP: DARI VP JADI OMZET',
    title: 'Target Penjualan, Margin Ideal & Copywriting Penyampai Value Proposition',
    subtitle: 'Mengubah Kalimat Value Proposition Menjadi Angka Target, Harga Sehat & Promosi yang Menghasilkan — PartnerUp',
    type: 'cover',
    speakerNotes: 'Buka sesi dengan mengapresiasi antusiasme peserta selama 3 pertemuan membedah Value Proposition. Tegaskan bahwa hari ini kita masuk ke babak penentu: bagaimana kalimat VP yang sudah susah payah dirumuskan benar-benar menghasilkan laba nyata di rekening, khusus untuk karakter usaha F&B (yoghurt, keripik), kriya/handycraft, dan jasa persewaan.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'TAMPARAN REALITA',
    title: 'Kalau Tidak Punya Target Penjualan, Buat Apa Belajar Marketing?',
    subtitle: 'Marketing tanpa angka target ibarat naik ojek tanpa menyebutkan alamat tujuan!',
    type: 'comparison',
    speakerNotes: 'Sampaikan refleksi tajam dari diskusi kemarin: "Kemarin saat ditanya berapa target penjualan per bulan, rata-rata masih pasrah—terjual berapapun ya sudah. Padahal justru TARGET PENJUALAN itulah yang memaksa otak kita menyusun strategi marketing! Tanpa target, bikin konten cuma semangat 2 hari lalu berhenti."',
    comparison: {
      leftTitle: 'Pola Lama: Jualan "Mengalir / Pasrah"',
      leftBody: '• Tidak tahu bulan ini wajib untung berapa.\n• Promosi hanya kalau lagi sempat atau lagi mood.\n• Kalau sepi, cuma diam menunggu pembeli lewat.\n• Belajar banyak ilmu marketing tapi bingung memakainya.',
      rightTitle: 'Pola Baru: Jualan Berbasis Target',
      rightBody: '• Tahu persis berapa unit/sewa wajib keluar tiap hari.\n• Tahu kenapa hari ini HARUS posting dan jemput bola.\n• Bisa langsung tahu: "Oh, target hari ini kurang 4 pcs lagi!"\n• Semua strategi VP, harga, & konten punya tujuan jelas.',
    },
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'POLLING 1: CEK KONDISI',
    title: 'Bagaimana Kondisi Target Penjualan Usahamu Selama Ini?',
    subtitle: 'Mari jawab dengan jujur lewat HP masing-masing sebagai titik awal perbaikan bersama:',
    type: 'concept',
    linkedPollId: 'poll_target_penjualan_umkm',
    speakerNotes: 'Jalankan polling live pertama. Biasanya opsi 1 dan 2 akan sangat tinggi. Gunakan hasilnya untuk melegakan peserta bahwa mereka tidak sendirian, dan hari ini mereka akan pulang membawa angka target yang sangat jelas.',
    cards: [
      { title: '1. Tanpa Target', body: 'Berjualan sesuai arus, yang penting dapur jalan.', accent: 'orange' },
      { title: '2. Target di Kepala', body: 'Ada harapan ramai, tapi belum dihitung per hari.', accent: 'teal' },
      { title: '3. Bingung Cara Capai', body: 'Sudah ada angka omzet, tapi bingung langkah marketingnya.', accent: 'orange' },
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'JEMBATAN SESI 1 → SESI 2',
    title: 'Review Value Proposition & "Ongkos Menjaga Janji"',
    subtitle: 'Setiap janji kehebatan produk butuh biaya nyata agar pembeli tidak merasa dibohongi.',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    speakerNotes: 'Minta peserta mengingat kembali hasil 3 sesi VP kemarin (Latihan 1). Tekankan bahwa ketika kita menjanjikan nilai tambah—misal yoghurt botol segel tanpa pengawet, kerajinan rapi siap kado, atau unit sewa selalu wangi & steril—ada biaya menjaga janji yang wajib dihitung ke modal.',
    cards: [
      { title: 'F&B (Yoghurt / Keripik)', body: 'Janji "segar & renyah" butuh biaya botol segel, ice pack, atau standing pouch kedap udara.', accent: 'orange' },
      { title: 'Kriya (Handycraft)', body: 'Janji "rapi & pantas jadi hadiah" butuh biaya finishing teliti, box kado, & kartu ucapan.', accent: 'teal' },
      { title: 'Jasa Persewaan', body: 'Janji "aman, bersih & tepat waktu" butuh biaya cuci/steril, cadangan waktu, & perawatan rutin.', accent: 'orange' },
    ],
    promptLines: ['1 kalimat VP + 1 hal nyata yang wajib disiapkan agar janji terbukti: ______________'],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'LANGKAH 1: MENENTUKAN TARGET',
    title: 'Jangan Mulai dari "Pengen Omzet Besar" — Mulai dari Target Laba Bersih!',
    subtitle: 'Omzet Rp20 juta tidak ada gunanya kalau setelah dipotong modal, untungnya cuma cukup buat bensin.',
    type: 'concept',
    speakerNotes: 'Ajarkan cara paling membumi menentukan target penjualan bagi UMKM: jangan menebak angka omzet khayalan. Mulai dari pertanyaan: "Bulan ini usaha saya wajib menghasilkan UANG BERSIH berapa untuk hidup & mengembangkan usaha?"',
    cards: [
      { title: '1. Kebutuhan Pribadi/Gaji Pemilik', body: 'Pemilik usaha wajib digaji secara layak, jangan asal ambil uang laci jualan.', accent: 'orange' },
      { title: '2. Biaya Tetap & Pengembangan', body: 'Sisihkan target tabungan beli alat baru, sewa tempat, listrik, atau tambah modal bahan.', accent: 'teal' },
      { title: 'Contoh Hitungan Sederhana', body: 'Gaji pemilik Rp3 juta + Tabungan alat Rp1,5 juta = Target Laba Bersih Rp4.500.000/bulan.', accent: 'orange' },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'PRAKTIK 2: ANGKA TARGET LABA',
    title: 'Tentukan Target Laba Bersih Bulan Ini',
    subtitle: 'Tuliskan angka target keuntungan bersih yang masuk akal dan wajib kamu perjuangkan bulan ini:',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    speakerNotes: 'Beri waktu 2–3 menit agar peserta menuliskan angka laba bersih bulanan mereka di HP. Pastikan mereka tidak menulis angka ngawang seperti "100 juta" jika saat ini modalnya masih harian.',
    promptLines: ['Target KEUNTUNGAN BERSIH usahaku bulan ini: Rp ______________'],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'LANGKAH 2: MARGIN IDEAL VP',
    title: 'Berapa Margin Ideal Saat Value Proposition Diterapkan?',
    subtitle: 'Karena kamu TIDAK ikut perang harga murah, marginmu wajib cukup tebal untuk menjaga kualitas & promosi!',
    type: 'formula',
    speakerNotes: 'Jawab pertanyaan krusial peserta kemarin: "Berapa margin yang ideal kalau VP diterapkan?". Jelaskan patokan sehat per jenis usaha mereka: F&B 30–50%, Kriya 40–70%, Jasa Persewaan 50–70% setelah cadangan perawatan. Ingatkan: margin tipis di bawah 20% sangat berbahaya karena sekali produk rusak atau ada biaya VP, bisnis langsung tekor.',
    cards: [
      { title: 'F&B (Yoghurt, Keripik, Olahan)', body: 'Ideal: 30% – 50% dari harga jual. Wajib sudah memasukkan biaya kemasan kedap udara, stiker, gas/listrik, & risiko susut.', accent: 'orange' },
      { title: 'Kriya / Handycraft', body: 'Ideal: 40% – 70% dari harga jual. Karena menjual keahlian tangan, waktu pengerjaan, & nilai estetika, bukan sekadar harga bahan baku.', accent: 'teal' },
      { title: 'Jasa Persewaan', body: 'Ideal: 50% – 70% per transaksi sewa, SETELAH menyisihkan 15%–20% untuk biaya cuci, perawatan, & dana penyusutan beli unit baru.', accent: 'orange' },
    ],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'PRAKTIK 3: CEK MARGIN SEHAT',
    title: 'Hitung Modal Nyata & Margin Bersih Produkmu',
    subtitle: 'Masukkan biaya "jaga janji VP" (kemasan, tenaga, perawatan alat) agar marginmu tidak menipu diri sendiri:',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    speakerNotes: 'Bimbing peserta menghitung 1 produk unggulannya di HP. Sorot jawaban yang ternyata masih lupa memasukkan biaya kemasan atau ongkos tenaga kerja sendiri, lalu bantu koreksi langsung di kelas.',
    promptLines: [
      'Harga Jual: Rp _______ | Total Modal + Biaya VP: Rp _______ | Untung Bersih: Rp _______',
    ],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'LANGKAH 3: PECAH JADI HARIAN',
    title: 'Pecah Target Bulanan Jadi Target Harian + Jurus Paket Bundling',
    subtitle: 'Angka besar terasa menakutkan; angka harian terasa ringan & bisa langsung dikejar hari ini!',
    type: 'formula',
    speakerNotes: 'Tunjukkan keajaiban memecah angka dan memakai Paket Bundling. Misal untung bersih Yoghurt Rp6.500/botol dan target laba Rp4.500.000 -> butuh 28 botol/hari! Kalau jual satuan susah cari 28 pembeli, buatlah Paket Keluarga isi 5 botol -> cukup cari 5–6 pembeli saja per hari!',
    cards: [
      { title: 'Rumus Target Harian', body: 'Target Laba ÷ Untung per Unit ÷ 25 Hari Kerja = Jumlah Unit Wajib Terjual Setiap Hari.', accent: 'orange' },
      { title: 'Contoh Yoghurt / Keripik', body: 'Jual ecer 1 botol butuh 28 orang. Jual "Paket Keluarga Isi 5" cukup cari 6 pembeli/hari!', accent: 'teal' },
      { title: 'Contoh Kriya & Persewaan', body: 'Kriya: Paket Hampers (Tas + Dompet). Persewaan: Paket Sewa 3 Hari / Paket Lengkap + Perlengkapan.', accent: 'orange' },
    ],
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'PRAKTIK 4: HITUNG HARIAN & BUNDLING',
    title: 'Hitung Target Harianmu & Rancang 1 Paket Bundling',
    subtitle: 'Semakin pintar kamu membuat paket bundling, semakin sedikit jumlah pembeli yang harus kamu kejar tiap hari!',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    speakerNotes: 'Ajak peserta menghitung target hariannya di tempat. Tanyakan langsung ke 2–3 orang peserta secara lisan: "Ibu jualan apa? Berapa target hariannya? Kalau dibuat paket, jadi butuh berapa pembeli saja per hari?".',
    promptLines: ['Target Unit/Hari: _______ pcs | Ide Paket Bundling untuk Mempercepat Target: ______________'],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'JEMBATAN KE STRATEGI MARKETING',
    title: 'Dari Target Harian Lahirlah Strategi Marketing (Rumus Jemput Bola)',
    subtitle: 'Sekarang kamu tahu KENAPA strategi marketing & konten itu wajib ada setiap hari!',
    type: 'concept',
    linkedPollId: 'poll_titik_macet_marketing',
    speakerNotes: 'Ini adalah momen pencerahan utama! Jelaskan hukum angka sederhana: tidak semua orang yang melihat statusmu atau chat WA pasti beli. Biasanya dari 10 orang tanya harga, cuma 2–3 yang transfer. Jadi kalau butuh 6 pembeli/hari, kamu WAJIB menciptakan minimal 20 orang chat/tertarik tiap hari! Sekarang buka Polling ke-2 untuk melihat di mana titik macet mereka.',
    cards: [
      { title: '1. Orang Melihat (Traffic)', body: 'Minimal 100–150 pasang mata melihat status WA, IG, etalase, atau brosurmu tiap hari.', accent: 'orange' },
      { title: '2. Orang Bertanya (Chat/Tanya)', body: 'Minimal 15–20 orang tertarik mengklik, bertanya harga, atau mencicipi.', accent: 'teal' },
      { title: '3. Transfer Pembayaran (Closing)', body: 'Hasil akhirnya: 5–6 pembeli mengambil paket bundling → Target Harian LUNAS!', accent: 'orange' },
    ],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'PRAKTIK 5: ANGKA JEMPUT BOLA',
    title: 'Berapa Chat & Calon Pembeli yang Wajib Kamu Kejar Tiap Hari?',
    subtitle: 'Tuliskan target jumlah orang bertanya harianmu dan saluran mana yang paling realistis untuk menjemput mereka:',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    speakerNotes: 'Bimbing peserta agar tidak lagi berkata "terserah yang beli berapa". Mereka sekarang punya angka aktivitas marketing harian yang bisa dikontrol sendiri.',
    promptLines: ['Target Chat/Tanya Masuk per Hari: _______ orang | Saluran Andalan: ______________'],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'LANGKAH 4: COPYWRITING PENYAMPAI VP',
    title: 'Rumus Copywriting & Konten 3 Pilar (Langsung dari Value Proposition)',
    subtitle: 'Tidak perlu jago sastra! Ambil saja bahan yang sudah kamu tulis selama 3 sesi VP kemarin:',
    type: 'formula',
    speakerNotes: 'Jawab masalah #1 peserta ("Bingung menyusun copywriting & konten untuk menyampaikan VP"). Tunjukkan bahwa copywriting tidak perlu mengarang dari nol—cukup tempel 3 elemen dari lembar kerja VP mereka kemarin: Baris 1 Masalah Pembeli, Baris 2 Bukti Nyata, Baris 3 Ajakan Paket.',
    cards: [
      { title: '1. HOOK (Pancingan Masalah)', body: 'Ambil dari VP Bagian 2 (Tugas & Keraguan Pembeli). Sentuh ketakutan atau kebutuhan harian mereka di kalimat pertama.', accent: 'orange' },
      { title: '2. BUKTI NYATA (Rational Value)', body: 'Ambil dari VP Bagian 4. Tunjukkan angka, proses dapur bersih, ketahanan, bahan asli, atau garansi—bukan klaim "enak & terbaik".', accent: 'teal' },
      { title: '3. AJAKAN PAKET (CTA & Emosi)', body: 'Ambil dari VP Bagian 5 + Paket Bundling. Beri alasan jelas kenapa mereka harus pesan atau sewa HARI INI.', accent: 'orange' },
    ],
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'CONTOH NYATA 3 JENIS USAHA',
    title: 'Bedah Copywriting Biasa vs Copywriting Value Proposition',
    subtitle: 'Lihat perbedaan cara menulis promosi untuk F&B, Kriya/Handycraft, dan Jasa Persewaan:',
    type: 'comparison',
    speakerNotes: 'Bacakan perbandingan ini dengan intonasi kontras! Tanyakan peserta: "Sebagai pembeli, mana yang bikin kamu langsung percaya dan kepengen chat?". Tekankan bahwa penulisan yang kuat selalu menjawab rasa ragu pembeli sejak kalimat pertama.',
    comparison: {
      leftTitle: 'Copywriting Biasa (Bikin Pembeli Cuek)',
      leftBody: '• F&B: "Ready yoghurt & keripik enak murah, minat DM."\n• Kriya: "Open order tas rajut handmade bagus berkualitas, yuk diorder."\n• Persewaan: "Menyewakan perlengkapan acara murah meriah area kota, hubungi WA kami."',
      rightTitle: 'Copywriting Penyampai VP (Mengundang Chat)',
      rightBody: '• F&B: "Cari camilan aman buat anak tanpa pemanis buatan? Yoghurt segar fermentasi 12 jam, kemasan segel + garansi ganti jika rusak. Ambil Paket 5 Botol lebih hemat!"\n• Kriya: "Bingung cari kado unik yang gak pasaran? Tas rajut jahitan rapat anti-brudul, sudah termasuk box kado & kartu ucapan nama."\n• Persewaan: "Takut alat acara kotor atau telat datang? Unit kami disterilkan sebelum kirim + garansi tiba 2 jam sebelum acara dimulai!"',
    },
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'PRAKTIK 6: MENULIS COPYWRITING VP',
    title: 'Tulis 1 Copywriting Promosi Usahamu Sekarang!',
    subtitle: 'Gabungkan Hook Masalah + Bukti Nyata VP + Ajakan Paket Bundling untuk Status WA / Caption Sosmed hari ini:',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    speakerNotes: 'Ini sesi praktik paling penting untuk mengatasi kebingungan konten. Beri waktu 5 menit. Pilih 3 jawaban peserta di proyektor (1 F&B, 1 Kriya, 1 Persewaan) dan poles bersama-sama di layar agar makin tajam!',
    promptLines: ['Hook Masalah + Bukti Nyata VP + Ajakan Paket Bundling: ______________'],
  },
  {
    index: 15,
    pageNumber: 16,
    badge: 'PENUTUP & AKSI 14 HARI',
    title: 'Jadwal Aksi 14 Hari Penjemput Target Penjualan',
    subtitle: 'Target tanpa tindakan harian hanya jadi tulisan di kertas. Mari kunci rutinitas promosimu sekarang!',
    type: 'closing',
    linkedQuestionIndex: 6,
    speakerNotes: 'Tutup sesi PartnerUp Sesi 2 dengan penuh semangat. Ingatkan kembali: sekarang setiap peserta sudah punya kompas (Target Laba & Target Unit Harian), mesin sehat (Margin Ideal VP + Bundling), dan peluru (Copywriting VP). Minta mereka menuliskan 3 komitmen aksi 14 hari di layar HP dan saling menyemangati untuk melaporkan pencapaian minggu depan.',
    promptLines: ['3 Komitmen Rutin 14 Hari untuk Mengejar Target Harian: ______________'],
    cards: [
      { title: 'Pagi (Jam 08.00): Status Bukti', body: 'Upload foto/video singkat proses bersih, pengerjaan kriya, atau sterilisasi unit + kalimat copywriting VP.', accent: 'orange' },
      { title: 'Rabu & Sabtu: Jemput Bola', body: 'Kirim sapaan ramah ke 10–15 pelanggan lama untuk tawarkan Paket Bundling tanpa memaksa.', accent: 'teal' },
      { title: 'Minggu Malam: Cek Kompas', body: 'Hitung total unit & laba bersih minggu ini, lalu bandingkan dengan target yang sudah ditetapkan.', accent: 'orange' },
    ],
  },
];

export const SESI_2_ACTION_PLAN_CURRICULUM: SavedMaterial = {
  id: 'partnerup_sesi_2_action_plan',
  seminarTitle: 'Sesi 2 PartnerUp: Target Penjualan, Margin Ideal & Copywriting Penyampai Value Proposition',
  organizerName: 'Program PartnerUp | Obeecreatives',
  description: 'Kurikulum Lanjutan PartnerUp setelah pendalaman 3 sesi Value Proposition: Menetapkan target laba & unit harian, menghitung margin sehat F&B/Kriya/Persewaan, merancang paket bundling, & rumus copywriting penyampai VP (7 Pertanyaan, 2 Polling, 16 Slide).',
  category: 'Sesi 2 PartnerUp (Lanjutan VP)',
  isDefault: false,
  createdAt: 1730000000000,
  updatedAt: 1732000000000,
  content: {
    seminarTitle: 'Sesi 2 PartnerUp: Target Penjualan, Margin Ideal & Copywriting Penyampai Value Proposition',
    organizerName: 'Program PartnerUp | Obeecreatives',
    questions: SESI_2_QUESTIONS,
    polls: SESI_2_POLLS,
    slides: SESI_2_SLIDES,
    qnaTopics: [
      'Menetapkan Target Penjualan',
      'Margin Ideal F&B, Kriya & Jasa',
      'Strategi Paket & Bundling',
      'Copywriting Penyampai VP',
      'Cara Jemput Pembeli & Closing WA',
    ],
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1732000000000,
    materialId: 'partnerup_sesi_2_action_plan',
    description: 'Kurikulum Lanjutan PartnerUp setelah pendalaman 3 sesi Value Proposition: Menetapkan target laba & unit harian, menghitung margin sehat F&B/Kriya/Persewaan, merancang paket bundling, & rumus copywriting penyampai VP.',
    category: 'Sesi 2 PartnerUp (Lanjutan VP)',
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
    speakerNotes: 'Buka sesi dengan menyapa para pemilik UMKM dengan hangat dan penuh empati. Tegaskan pesan utama: "Kemasan bukan sekadar biaya atau bungkus pelindung, melainkan wiraniaga diam (silent salesperson) nomor satu yang bekerja 24 jam memikat pembeli bahkan saat kita sedang tidur."',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'AGENDA PELATIHAN',
    title: 'Peta Perjalanan Belajar Hari Ini',
    subtitle: 'Membongkar rahasia kemasan juara dari sudut pandang desain grafis dan strategi pemasaran:',
    type: 'agenda',
    speakerNotes: 'Jelaskan 4 tahapan belajar hari ini. Tekankan bahwa materi ini dirancang sangat praktis: peserta tidak hanya mendengarkan teori, melainkan langsung mengevaluasi dan merombak kemasannya melalui lembar kerja interaktif di HP masing-masing.',
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
    speakerNotes: 'Uraikan 3 peran vital ini dengan contoh nyata. Tanyakan ke audiens: "Siapa di sini yang rasa produknya enak banget tapi bingung kenapa penjualannya lambat?". Jawabannya sering kali ada pada kemasan yang belum berbicara ke calon pembeli.',
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
    imageUrl: '/assets/images/kemasan_umkm_perbandingan_1793832957331.jpg',
    imageCaption: 'Perbandingan Nyata: Plastik Karet Buram (Kiri) vs Standing Pouch Rapi & Higienis (Kanan)',
    imagePosition: 'right',
    speakerNotes: 'Arahkan perhatian peserta ke foto perbandingan di layar! Tekankan: "Pembeli tidak punya lidah di matanya. Sebelum mereka bisa mencicipi bumbu rahasia warisan keluarga kita, mata mereka harus jatuh cinta dulu pada kemasannya. Kemasan biasa membuat produk dicap murahan, sedangkan kemasan standing pouch matte langsung dipercaya higienis dan pantas berharga mahal."',
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
    imageUrl: '/assets/images/wadah_kemasan_modern_1793832959142.jpg',
    imageCaption: 'Pilihan Wadah Food-Grade UMKM: Standing Pouch Kraft Berjendela, Black Pouch, dan Toples Kaca Minimalis',
    imagePosition: 'right',
    speakerNotes: 'Instruksikan peserta membuka smartphone mereka untuk menjawab Latihan 1. Beri waktu 3 menit. Tunjukkan foto pilihan wadah modern di layar sebagai inspirasi bahwa kemasan naik kelas itu sangat terjangkau dan banyak dijual eceran.',
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
    speakerNotes: 'Ajak audiens memilih opsi di HP mereka. Pantau grafik suara yang masuk secara real-time di layar. Tanggapi opsi tertinggi: jika modal/MOQ tinggi mendominasi, tenangkan mereka bahwa nanti di akhir sesi ada solusi cetak stiker digital satuan tanpa modal jutaan.',
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
    imageUrl: '/assets/images/display_rak_kemasan_1793832958364.jpg',
    imageCaption: 'Display di Rak Retail: Kemasan yang Tegak dan Berwarna Kontras Menghentikan Langkah Pembeli',
    imagePosition: 'right',
    speakerNotes: 'Jelaskan foto display rak retail: bayangkan pembeli sedang mendorong troli belanja dengan langkah cepat. Otak mereka tidak membaca cerpen di kemasan; mereka memindai dalam 3 detik: Detik 1 tertumbuk warna kontras; Detik 2 membaca jenis makanan apa; Detik 3 tertarik keunggulan rasa atau logo Halal.',
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
    speakerNotes: 'Mintalah peserta mengetik di HP: jika produk mereka dijejerkan di rak toko oleh-oleh bersama 5 produk serupa, apa 1 hal yang membuat pembeli langsung melirik ke produk mereka? Highlight beberapa jawaban menarik di proyektor.',
    promptLines: ['Apakah produkmu langsung menyedot perhatian dalam 3 detik? ______________'],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'FORMULA DESAIN',
    title: 'Anatomi Label Depan: Rumus 5 Elemen Wajib Kemasan Juara',
    subtitle: 'Jangan jejalkan semua tulisan di bagian depan! Fokus pada 5 elemen penarik penjualan:',
    type: 'formula',
    imageUrl: '/assets/images/anatomi_label_kemasan_1793832958314.jpg',
    imageCaption: 'Contoh Anatomi Label Juara: Brand Tegas di Atas, Kategori Makanan Jelas, Badge Varian Rasa, Jendela Intip, dan Legalitas di Bawah',
    imagePosition: 'right',
    speakerNotes: 'Tunjukkan foto kemasan Kriuk Nusantara sebagai blueprint emas! Ajarkan proporsinya: 1. Nama Brand 30% (font tegas gampang dibaca), 2. Kategori Produk 25% (langsung tahu makanan apa), 3. Varian Rasa 20% (badge menggoda), 4. Jendela Intip 15% (bukti tekstur asli), 5. Legalitas 10% (Halal & Netto di pojok bawah).',
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
    speakerNotes: 'Ajak peserta menyusun 3 baris tulisan di bagian depan kemasannya. Ingatkan jangan sampai nama varian rasa lebih besar dari nama merek atau jenis makanannya.',
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
    speakerNotes: 'Jelaskan perbedaan fungsi depan vs belakang: Bagian depan adalah pemikat visual, sedangkan sisi belakang adalah penuntas keraguan. Pembeli yang membalik kemasan ingin memastikan kebersihan, izin edar resmi, tanggal kedaluwarsa, dan kontak untuk pesan ulang.',
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
    speakerNotes: 'Beri waktu peserta mencatat legalitas apa saja yang sudah dimiliki dan apa target berikutnya (P-IRT, Sertifikasi Halal gratis BPJPH, atau cetak stempel expired date rapi).',
    promptLines: ['Legalitas dan informasi yang sudah/akan kamu cantumkan: ______________'],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'PSIKOLOGI WARNA',
    title: 'Panduan Memilih Warna Kemasan yang Selaras Rasa',
    subtitle: 'Warna adalah pesan bawah sadar yang memancing air liur dan selera pembeli:',
    type: 'concept',
    speakerNotes: 'Bahas psikologi warna: Ingatkan bahwa warna kemasan bukan ditentukan oleh warna kesukaan pemilik usaha, melainkan sensasi rasa yang ingin dipicu ke lidah pembeli. Merah/oranye memicu rasa lapar & pedas; Cokelat/hijau menguatkan kesan alami & tanpa pengawet.',
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
    speakerNotes: 'Minta peserta menuliskan warna dominan yang paling mewakili karakter produknya dan kesan apa yang ingin mereka tancapkan ke benak konsumen.',
    promptLines: ['Warna dominan kemasanmu dan alasan pemilihannya: ______________'],
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'STRATEGI HARGA',
    title: 'Packaging Power: Cara Menaikkan Harga Jual & Margin Usaha',
    subtitle: 'Modal kemasan naik Rp1.500, harga jual produk bisa dinaikkan Rp8.000 - Rp12.000!',
    type: 'concept',
    speakerNotes: 'Bedah ilmu bisnis penting ini: Mengapa kemasan bagus bisa melipatgandakan keuntungan? Karena kemasan bagus membuka pasar baru (pasar oleh-oleh & bingkisan) dan menghilangkan budaya tawar-menawar dari pembeli.',
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
    speakerNotes: 'Ajak peserta menghitung langsung di HP: Berapa harga jual kemasan lama vs harga jual kemasan baru. Tunjukkan bahwa kemasan naik kelas adalah jalan keluar terbaik dari perangkap banting harga murah.',
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
    speakerNotes: 'Tutup sesi materi dengan motivasi kuat dan langkah eksekusi nyata: Jangan menunggu punya modal 10 juta untuk cetak di pabrik besar. Beli standing pouch polos food-grade isi 50 pcs + stiker vinyl tahan air & minyak cetak digital satuan. Kualitasnya sudah setara pabrik besar! Mintalah seluruh peserta berkomitmen mengeksekusi 2 tindakan dalam 30 hari.',
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
      } else {
        // Perbarui slide kemasan jika versi lama di browser belum memiliki foto atau speaker notes
        const pkgIdx = updated.findIndex((m) => m.id === PACKAGING_DESIGN_MARKETING_CURRICULUM.id);
        if (pkgIdx >= 0) {
          const currentPkg = updated[pkgIdx];
          const needsRefresh =
            !currentPkg?.content?.slides?.some((s: SlideDefinition) => Boolean(s.speakerNotes)) ||
            currentPkg?.content?.slides?.some((s: SlideDefinition) => s.imageUrl?.startsWith('/src/assets/'));
          if (needsRefresh && currentPkg) {
            updated[pkgIdx] = {
              ...currentPkg,
              content: {
                ...currentPkg.content,
                slides: PACKAGING_SLIDES,
              },
            };
            changed = true;
          }
        }
      }
      if (!hasSesi2) {
        updated.splice(2, 0, SESI_2_ACTION_PLAN_CURRICULUM);
        changed = true;
      } else {
        const sesi2Idx = updated.findIndex((m) => m.id === SESI_2_ACTION_PLAN_CURRICULUM.id);
        if (sesi2Idx >= 0) {
          const currentSesi2 = updated[sesi2Idx];
          const needsSesi2Refresh =
            !currentSesi2?.updatedAt ||
            currentSesi2.updatedAt < 1732000000000 ||
            !currentSesi2?.content?.polls?.some((p: LivePollConfig) => p.id === 'poll_target_penjualan_umkm');
          if (needsSesi2Refresh && currentSesi2) {
            updated[sesi2Idx] = SESI_2_ACTION_PLAN_CURRICULUM;
            changed = true;
          }
        }
      }
      if (!hasCopywriting) {
        updated.push(COPYWRITING_MATERIAL_PRESET);
        changed = true;
      }

      // Normalisasi semua path imageUrl dari /src/assets/images/ ke /assets/images/
      updated = updated.map((m) => ({
        ...m,
        content: {
          ...m.content,
          slides: m.content.slides.map((s: SlideDefinition) => {
            if (s.imageUrl && s.imageUrl.startsWith('/src/assets/images/')) {
              changed = true;
              return {
                ...s,
                imageUrl: s.imageUrl.replace('/src/assets/images/', '/assets/images/'),
              };
            }
            return s;
          }),
        },
      }));

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
