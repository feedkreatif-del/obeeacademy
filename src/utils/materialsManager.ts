import {
  PARTNERUP_QUESTIONS,
  LIVE_POLLS,
  SEMINAR_SLIDES,
  DEFAULT_QNA_TOPICS,
  WorksheetQuestion,
  LivePollConfig,
  SlideDefinition,
} from '../data/seminarData';
import { SESI_4_BRANDING_CURRICULUM } from '../data/sesi4Branding';
import { CustomContentDoc, SavedMaterial, BrandThemeConfig } from '../types';
export type { SavedMaterial };
import { DEFAULT_BRAND_THEME, sanitizeBrandTheme } from '../brandTheme';
import { sanitizeForFirestore } from '../firebase';
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
  organizerName: 'Seri PartnerUp | obeeAcademy',
  description: 'Kurikulum Utama Sesi 1: Merumuskan alasan rasional, emosional, audit bio toko & diferensiasi produk UMKM (8 Pertanyaan, 17 Slide).',
  category: 'Seri PartnerUp (Sesi 1)',
  isDefault: true,
  createdAt: 1729000000000,
  updatedAt: 1730000000000,
  content: {
    seminarTitle: 'Kenapa Pembeli Harus Pilih Kamu? (Value Proposition UMKM)',
    organizerName: 'Seri PartnerUp | obeeAcademy',
    questions: PARTNERUP_QUESTIONS,
    polls: LIVE_POLLS,
    slides: SEMINAR_SLIDES,
    qnaTopics: DEFAULT_QNA_TOPICS,
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1730000000000,
    materialId: 'partnerup_sesi_1_curriculum',
    description: 'Kurikulum Utama Sesi 1: Merumuskan alasan rasional, emosional, audit bio toko & diferensiasi produk UMKM.',
    category: 'Seri PartnerUp (Sesi 1)',
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
    imageUrl: '/assets/images/sesi2_target_arah_umkm_1795154804394.jpg',
    imageCaption: 'Ilustrasi: Jualan Pasrah Tanpa Arah (Kiri) vs Punya Kompas Target Menuju Toko Ramai (Kanan)',
    imagePosition: 'top',
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
    imageUrl: '/assets/images/sesi2_ongkos_janji_vp_1795154804634.jpg',
    imageCaption: 'Wujud Nyata Ongkos Jaga Janji VP: Yoghurt Segel & Pouch Keripik (F&B), Box Kado Rapi (Kriya), & Alat Steril Terawat (Persewaan)',
    imagePosition: 'top',
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
    imageUrl: '/assets/images/sesi2_margin_sehat_visual_1795154803890.jpg',
    imageCaption: 'Perbandingan Visual: Harga Murah Margin Teriris Tipis (Kiri) vs Harga Sehat VP Untung Tebal (Kanan)',
    imagePosition: 'right',
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
    cards: [
      { title: '1. Rumus Margin Sehat', body: '(Harga Jual − Total Modal VP) ÷ Harga Jual × 100%. Minimal 30% untuk F&B, 40%+ untuk Kriya & Sewa.', accent: 'orange' },
      { title: '2. Jangan Lupa Biaya VP', body: 'Sertakan harga botol segel, pouch zip, box kado, es kirim, upah kerja tangan, atau laundry alat.', accent: 'teal' },
      { title: '3. Peringatan Margin Tipis', body: 'Jika margin masih di bawah 20%, naikkan harga dengan bukti VP atau buatkan paket bundling hemat ongkir.', accent: 'orange' },
    ],
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
    imageUrl: '/assets/images/sesi2_bundling_yoghurt_kriya_1795154804662.jpg',
    imageCaption: 'Jual Satuan (Butuh 28 Orang/Hari) vs Paket Keluarga Yoghurt & Gift Set Kriya (Cukup 5–6 Pembeli/Hari!)',
    imagePosition: 'top',
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
    cards: [
      { title: 'Ide Bundling F&B', body: 'Paket Kulkas 5 Botol Yoghurt / Paket Oleh-Oleh 4 Pouch Keripik (sekali kirim, ongkir lebih ringan).', accent: 'orange' },
      { title: 'Ide Bundling Kriya', body: 'Paket Kado Siap Beri: Produk Utama + Dompet Koin + Box Pita & Kartu Ucapan (harga naik 35%).', accent: 'teal' },
      { title: 'Ide Bundling Persewaan', body: 'Paket Komplit 2–3 Hari atau Sewa Alat Utama + Ekstra Perlengkapan (nilai per acara melonjak).', accent: 'orange' },
    ],
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
    imageUrl: '/assets/images/sesi2_corong_jemput_bola_1795154803326.jpg',
    imageCaption: 'Corong Angka Jemput Bola: 100–150 Lihat Status → 15–20 Chat Tanya → 5–6 Transaksi Paket/Hari',
    imagePosition: 'right',
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
  organizerName: 'Seri PartnerUp | obeeAcademy',
  description: 'Kurikulum Lanjutan PartnerUp setelah pendalaman 3 sesi Value Proposition: Menetapkan target laba & unit harian, menghitung margin sehat F&B/Kriya/Persewaan, merancang paket bundling, & rumus copywriting penyampai VP (7 Pertanyaan, 2 Polling, 16 Slide).',
  category: 'Seri PartnerUp (Sesi 2)',
  isDefault: false,
  createdAt: 1730000000000,
  updatedAt: 1732500000000,
  content: {
    seminarTitle: 'Sesi 2 PartnerUp: Target Penjualan, Margin Ideal & Copywriting Penyampai Value Proposition',
    organizerName: 'Seri PartnerUp | obeeAcademy',
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
    updatedAt: 1732500000000,
    materialId: 'partnerup_sesi_2_action_plan',
    description: 'Kurikulum Lanjutan PartnerUp setelah pendalaman 3 sesi Value Proposition: Menetapkan target laba & unit harian, menghitung margin sehat F&B/Kriya/Persewaan, merancang paket bundling, & rumus copywriting penyampai VP.',
    category: 'Seri PartnerUp (Sesi 2)',
    isDefault: false,
    createdAt: 1730000000000,
  },
};

/**
 * Kurikulum Lanjutan PartnerUp: Sesi 3 (Perbedaan Mendasar: Branding, Marketing, dan Selling)
 * Melanjutkan materi Sesi 2 (Target Penjualan, Margin Ideal & Copywriting Penyampai Value Proposition)
 */
const SESI_3_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Audit Kebiasaan: Selama Ini Sibuk di Bagian Mana?',
    coreLearning: 'Banyak UMKM merasa sudah melakukan semuanya, padahal sebenarnya hanya sibuk di 1 dari 3 pilar',
    questionText: 'Sebutkan 2 aktivitas jualan yang paling sering kamu lakukan minggu lalu, lalu kelompokkan jujur: apakah itu masuk BRANDING, MARKETING, atau SELLING?',
    secondaryPrompt: 'Contoh: "Bikin stiker botol = Branding", "Posting status WA/Reels = Marketing", "Balas chat & follow up transfer = Selling".',
    exampleAnswer: 'Aktivitas 1: Update Status WA & Reels IG tiap pagi (ini baru Marketing). Aktivitas 2: Cetak stiker segel botol (ini Branding). Saya ternyata hampir belum pernah melakukan follow-up chat (Selling masih bolong).',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa (F&B)',
    helperTips: [
      'Jangan terkecoh oleh rasa capek: rajin posting konten setiap hari baru menyentuh tahap Marketing, belum tentu sudah melakukan Selling.',
      'Kalau kamu hanya fokus mempercantik logo atau kemasan tanpa mencari calon pembeli baru, itu baru Branding tanpa Marketing.',
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Diagnosa Titik Macet Utama Usahamu (Jangan Salah Obat!)',
    coreLearning: 'Setiap masalah omzet punya obat yang berbeda: sepi traffic butuh Marketing, sering ditawar murah butuh Branding, banyak chat tapi batal transfer butuh Selling',
    questionText: 'Dari corong jualan usahamu sekarang, di tahap mana calon pembeli paling banyak bocor/hilang: MARKETING (sepi yang lihat/chat), BRANDING (ragu/tawar murah), atau SELLING (chat masuk banyak tapi batal beli)?',
    secondaryPrompt: 'Jelaskan gejala nyatanya agar kita tidak salah memberi obat strategi di minggu depan.',
    exampleAnswer: 'Paling bocor di SELLING: setiap minggu ada 20–30 calon penyewa chat tanya harga di WA, tapi setelah saya kirim daftar harga polos, 80% menghilang tidak membalas.',
    exampleBusiness: 'Berkah Event Rental (Persewaan)',
    helperTips: [
      'Jika gejalanya "sepi yang lihat & hampir tidak ada yang chat", jangan sibuk ganti warna logo — obati dulu MARKETING-nya.',
      'Jika gejalanya "banyak yang lihat tapi selalu membandingkan harga murahan", perkuat BUKTI BRANDING-nya.',
    ],
    linkedSlideIndex: 9,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Pilar BRANDING: 1 Bukti Kepercayaan Agar Tidak Perang Harga',
    coreLearning: 'Branding UMKM bukan sekadar logo mahal, melainkan janji kepercayaan dan bukti kualitas nyata yang membuat pembeli rela membayar margin sehat',
    questionText: 'Tentukan 1 penguat BRANDING paling nyata yang bisa langsung kamu tampilkan agar pembeli percaya kualitas usahamu tanpa menawar murah!',
    secondaryPrompt: 'Fokus pada bukti fisik, kerapian kemasan, garansi rasa/kebersihan, atau konsistensi pengalaman pelanggan (selaras dengan Value Proposition Sesi 1).',
    exampleAnswer: 'Menempelkan segel "Produksi Segar Hari Ini + Garansi Ganti Baru Jika Basi/Rusak" di botol & membuat tampilan foto dapur yang seragam bersih agar ibu-ibu yakin aman untuk anak.',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Untuk Kriya: bisa berupa kartu perawatan produk, box kado pita rapi, atau cerita keunikan jahitan tangan.',
      'Untuk Persewaan: bisa berupa bukti video sterilisasi alat H-1 dan seragam kru pengantar yang rapi.',
    ],
    linkedSlideIndex: 10,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Pilar MARKETING: 1 Cara Mengundang Orang Baru Bertanya',
    coreLearning: 'Tugas Marketing adalah mendatangkan perhatian dan pertanyaan (Traffic & Leads) dari kolam pembeli yang tepat, bukan memaksa orang langsung transfer di detik pertama',
    questionText: 'Pilih 1 aksi MARKETING paling konsisten minggu ini untuk mengundang minimal 15–20 calon pembeli baru agar mau bertanya atau mampir ke usahamu!',
    secondaryPrompt: 'Pastikan kamu menjemput kolam pembeli yang tepat, bukan sekadar menunggu algoritma medsos.',
    exampleAnswer: 'Bekerja sama dengan 3 sekolah PAUD/TK & sanggar senam ibu-ibu untuk bagi tester botol mini 100ml + brosur QR WA setiap hari Jumat pagi.',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Marketing tidak harus selalu iklan berbayar; kolaborasi komunitas, titip tester, video proses di Reels, & status WA terjadwal adalah mesin Marketing murah untuk UMKM.',
      'Ingat angka Sesi 2: tanpa arus orang bertanya dari Marketing, bagian Selling tidak punya bahan untuk di-closing.',
    ],
    linkedSlideIndex: 11,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Pilar SELLING: Skrip Ubah Chat Bertanya Jadi Transfer',
    coreLearning: 'Selling adalah seni memandu calon pembeli yang ragu menjadi yakin mengambil paket, menutup transaksi, dan kembali membeli',
    questionText: 'Tulis 1 kalimat balasan chat WA (saat orang tanya "Berapa harganya?") + 1 kalimat Follow-Up sopan H+1 agar calon pembeli mau ambil Paket Bundling!',
    secondaryPrompt: 'Hindari hanya membalas angka harga polos seperti "15rb kak". Arahkan ke kebutuhan mereka & tawarkan paket hemat!',
    exampleAnswer: 'Balasan: "Siap Kak, untuk acara berapa tamu & tanggal berapa? Biar lebih hemat & aman, kami sarankan Paket Komplit 2 Hari (sudah termasuk pasang H-1 & unit steril). Mau saya cekkan jadwal kosongnya?" | Follow-up H+1: "Halo Kak, izin konfirmasi untuk tanggal 18 kemarin masih tersisa 1 set lagi sebelum terisi acara lain."',
    exampleBusiness: 'Berkah Event Rental',
    helperTips: [
      'Rumus anti-ghosting: Jawab ramah + Tanya kebutuhan spesifik + Beri 2 pilihan paket (Satuan vs Paket Hemat) + Tutup dengan pertanyaan ringan.',
      'Selalu sapa ulang dengan sopan 1×24 jam setelah chat berhenti; 30–40% penjualan UMKM justru lahir dari follow-up kedua!',
    ],
    linkedSlideIndex: 12,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Merangkai Sinergi 3 Pilar dalam 1 Alur Penawaran Nyata',
    coreLearning: 'Marketing menarik perhatian, Branding mengunci kepercayaan, dan Selling menjemput transfer — ketiganya saling melengkapi',
    questionText: 'Rangkai 1 skenario lengkap untuk produk andalanmu: [Cara mengundang lewat MARKETING] → [Bukti yang meyakinkan di BRANDING] → [Cara menutup order di SELLING]!',
    secondaryPrompt: 'Pastikan ketiga tahap terhubung mulus dari saat orang pertama kali melihat produkmu sampai uang masuk ke rekening.',
    exampleAnswer: 'MARKETING: Reels video kerenyahan keripik tanpa minyak berlebih → BRANDING: Foto pouch aluminium zip rapi bersegel higienis + label gizi jelas → SELLING: Di chat WA langsung tawarkan "Paket Oleh-Oleh 4 Pouch Hemat Ongkir" + sapa ulang H+2.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Bayangkan perjalanan satu pembeli baru: pertama kali lihat dari mana (Marketing), kenapa langsung percaya (Branding), dan apa yang bikin dia jadi transfer hari itu juga (Selling).',
    ],
    linkedSlideIndex: 14,
  },
  {
    index: 6,
    sectionNumber: 7,
    sectionTitle: '7. Jadwal Seimbang 3 Pilar (7 Hari ke Depan)',
    coreLearning: 'Keseimbangan jadwal mingguan mencegah pemilik UMKM terjebak hanya sibuk produksi atau hanya sibuk posting tanpa ada penutupan transaksi',
    questionText: 'Susun jadwal pembagian waktu 7 hari ke depan agar BRANDING, MARKETING, dan SELLING usahamu berjalan seimbang setiap minggu!',
    secondaryPrompt: 'Pisahkan jam kapan merapikan kepercayaan produk (Branding), kapan mengundang traffic baru (Marketing), dan kapan fokus balas cepat & follow-up (Selling).',
    exampleAnswer: 'Senin & Kamis: Rapikan materi BRANDING (foto testimoni, cek segel & kemasan). Setiap Pagi: Jalankan MARKETING (Status WA + sebar ke komunitas/WO). Setiap Siang-Sore: Eksekusi SELLING (balas cepat <5 menit, tawarkan bundling, & follow-up yang belum transfer).',
    exampleBusiness: 'Tas Rajut Kreasi Mbak Dita',
    helperTips: [
      'Evaluasi setiap Minggu malam: jika chat sepi tambah porsi Marketing; jika ditawar terus tambah bukti Branding; jika chat hilang tambah disiplin Selling.',
    ],
    linkedSlideIndex: 15,
  },
];

const SESI_3_POLLS: LivePollConfig[] = [
  {
    id: 'poll_s3_salah_kaprah_umkm',
    title: 'Selama Ini, Mana yang Paling Sering Kamu Kira Sudah Mewakili "Semuanya"?',
    subtitle: 'Pilih 1 kebiasaan yang paling menyita waktumu selama berjualan (jawaban jujur untuk evaluasi bersama):',
    linkedSlideIndex: 2,
    type: 'bar',
    options: [
      {
        id: 'opt_s3_rajin_posting',
        label: '1. Rajin posting status WA / IG tiap hari — saya kira itu sudah jualan lengkap',
        subtitle: 'Padahal baru mengerjakan Marketing, belum tentu Selling & Branding-nya kuat',
        category: 'rational',
      },
      {
        id: 'opt_s3_sibuk_kemasan',
        label: '2. Fokus bikin logo, kemasan bagus, & jaga kualitas — tinggal nunggu pembeli datang',
        subtitle: 'Padahal baru membangun Branding, mesin Marketing belum dijalankan',
        category: 'emotional',
      },
      {
        id: 'opt_s3_kasih_diskon',
        label: '3. Sering kasih diskon / obral harga murah supaya cepat laku hari ini',
        subtitle: 'Fokus Selling jangka pendek tanpa membangun Branding & margin sehat',
        category: 'rational',
      },
      {
        id: 'opt_s3_campur_aduk',
        label: '4. Masih bingung membedakan batas tugas Branding, Marketing, dan Selling',
        subtitle: 'Sering mencampuradukkan ketiganya sehingga capek tapi omzet stagnan',
        category: 'emotional',
      },
    ],
  },
  {
    id: 'poll_s3_titik_bocor_terbesar',
    title: 'Melihat Usahamu Seminggu Terakhir, di Tahap Mana Pembeli Paling Banyak Bocor?',
    subtitle: 'Pilih gejala yang paling terasa menghambat target penjualanmu:',
    linkedSlideIndex: 8,
    type: 'bar',
    options: [
      {
        id: 'opt_s3_bocor_marketing',
        label: '1. Sepi yang lihat & jarang ada chat baru bertanya (Masalah MARKETING)',
        subtitle: 'Pintu toko masih sepi karena belum banyak yang tahu & tertarik mampir',
        category: 'rational',
      },
      {
        id: 'opt_s3_bocor_branding',
        label: '2. Banyak yang lihat tapi ragu, membandingkan, & tawar harga murah (Masalah BRANDING)',
        subtitle: 'Pembeli belum melihat bukti pembeda & alasan kenapa produkmu layak lebih bernilai',
        category: 'emotional',
      },
      {
        id: 'opt_s3_bocor_selling',
        label: '3. Lumayan banyak yang chat tanya harga, tapi hilang tidak transfer (Masalah SELLING)',
        subtitle: 'Belum ada teknik menjawab, mengarahkan paket, & follow-up yang tepat',
        category: 'rational',
      },
      {
        id: 'opt_s3_bocor_repeat',
        label: '4. Sudah pernah beli 1x tapi jarang kembali beli ulang / repeat order',
        subtitle: 'Perlu penguatan pengalaman Branding & penawaran Selling berkala',
        category: 'emotional',
      },
    ],
  },
];

const SESI_3_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'SESI 3 PARTNERUP: PETA STRATEGI EKSEKUSI',
    title: 'Perbedaan Mendasar: Branding, Marketing & Selling',
    subtitle: 'Melanjutkan Target Penjualan & Margin Ideal: Memahami Tugas Berbeda untuk Membangun Kepercayaan, Mengundang Pembeli, dan Menutup Transaksi — PartnerUp',
    type: 'cover',
    speakerNotes: 'Buka sesi dengan menyambungkan materi Sesi 2 kemarin (Target Penjualan, Margin Ideal, dan Copywriting). Tekankan bahwa banyak UMKM sudah punya angka target, tapi di lapangan masih capek tanpa hasil karena mencampuradukkan Branding, Marketing, dan Selling sebagai satu hal yang sama.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'ANALOGI SEDERHANA TOKO UMKM',
    title: 'Mengapa Rajin Posting Belum Tentu Closing? (Analogi Toko)',
    subtitle: 'Branding, Marketing, dan Selling adalah 3 pekerjaan berbeda dengan tujuan dan cara kerja yang berbeda pula!',
    type: 'comparison',
    imageUrl: '/assets/images/sesi3_analogi_toko_1795422841754.jpg',
    imageCaption: 'Analogi Toko: Marketing Mengundang Masuk (Kiri) · Branding Membangun Kepercayaan (Tengah) · Selling Menutup Pembayaran di Kasir (Kanan)',
    imagePosition: 'top',
    speakerNotes: 'Gunakan analogi toko fisik agar langsung melekat di benak UMKM: (1) Marketing itu orang yang berdiri di pinggir jalan membagikan brosur/teriak ramah mengundang orang MAMPIR. (2) Branding itu suasana toko yang bersih, rapi, & reputasi jujur sehingga begitu masuk orang langsung PERCAYA. (3) Selling itu kasir/pelayan yang sigap menyapa, menjelaskan pilihan paket, dan membuat orang jadi BAYAR bawa pulang barang.',
    comparison: {
      leftTitle: 'Kesalahpahaman Umum UMKM',
      leftBody: '• Menganggap "yang penting posting tiap hari = sudah Branding & Selling".\n• Menganggap "bikin logo bagus = otomatis ramai pembeli".\n• Saat jualan sepi, solusinya selalu banting harga / kasih diskon.',
      rightTitle: 'Cara Pandang Bisnis yang Tepat',
      rightBody: '• MARKETING bertugas mengundang orang baru datang & bertanya.\n• BRANDING bertugas membuat orang percaya & rela bayar margin sehat.\n• SELLING bertugas mengubah rasa tertarik menjadi uang masuk & beli ulang.',
    },
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'POLLING 1: CEK KEBIASAAN',
    title: 'Selama Ini, Mana yang Paling Sering Kamu Kira Sudah "Semuanya"?',
    subtitle: 'Jawab jujur melalui HP masing-masing agar kita tahu kebiasaan yang paling dominan di kelas hari ini:',
    type: 'concept',
    linkedPollId: 'poll_s3_salah_kaprah_umkm',
    speakerNotes: 'Jalankan Polling 1. Biasanya mayoritas UMKM memilih opsi 1 (rajin posting dikira sudah lengkap) atau opsi 4 (masih bingung membedakan ketiganya). Gunakan hasil polling untuk memvalidasi bahwa sesi ini akan meluruskan peta kerja harian mereka.',
    cards: [
      { title: '1. Rajin Posting Konten', body: 'Sibuk upload status & Reels, tapi lupa cara mengonversi chat menjadi transaksi.', accent: 'orange' },
      { title: '2. Fokus Kemasan & Logo', body: 'Produk sudah rapi & enak, tapi menunggu pembeli datang tanpa jemput bola.', accent: 'teal' },
      { title: '3. Main Diskon Terus', body: 'Kejar laku cepat hari ini, tapi margin tergerus dan pembeli hilang saat harga normal.', accent: 'orange' },
      { title: '4. Mencampur Ketiganya', body: 'Bingung batas kerja harian, sehingga capek bekerja tanpa tahu pilar mana yang macet.', accent: 'teal' },
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'PRAKTIK 1: AUDIT AKTIVITAS',
    title: 'Kelompokkan Aktivitas Jualanmu Minggu Lalu',
    subtitle: 'Mari cek secara jujur: kegiatan yang menyita waktumu selama ini sebenarnya masuk pilar mana?',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    speakerNotes: 'Berikan waktu 3 menit agar peserta menuliskan 2 aktivitas minggu lalu di HP. Sorot 2–3 jawaban di proyektor dan tunjukkan pilar mana yang masih kosong di bisnis mereka.',
    promptLines: ['Aktivitas 1 (masuk pilar ___): ______________ | Aktivitas 2 (masuk pilar ___): ______________'],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'PILAR 1: BRANDING (KEPERCAYAAN)',
    title: 'BRANDING: Membuat Pembeli Percaya & Tidak Menawar Murah',
    subtitle: 'Branding bukan soal logo mahal — Branding adalah kesan & janji bukti yang tertanam di kepala pembeli saat mendengar namamu!',
    type: 'concept',
    speakerNotes: 'Hubungkan langsung ke materi Sesi 1 (Value Proposition) dan Sesi 2 (Margin Sehat). Jelaskan bahwa tanpa Branding yang kuat, pembeli tidak melihat alasan kenapa harus bayar Rp15.000 jika di sebelah ada Rp10.000. Branding melindungi margin sehat kita!',
    cards: [
      { title: 'Pertanyaan yang Dijawab', body: '"Kenapa saya harus percaya & mau bayar harga segini ke usahamu dibanding produk sebelah?"', accent: 'orange' },
      { title: 'Wujud Nyata di UMKM', body: 'Konsistensi rasa/mutu, botol segel higienis, box kado rapi, foto jujur, garansi ganti baru, & sapaan ramah.', accent: 'teal' },
      { title: 'Ukuran Keberhasilan', body: 'Pembeli tidak menawar harga, berani rekomendasikan ke teman, dan ingat merekmu saat butuh.', accent: 'orange' },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'PILAR 2: MARKETING (MENGUNDANG)',
    title: 'MARKETING: Mengundang Orang Baru Datang & Bertanya',
    subtitle: 'Marketing adalah aktivitas menjemput perhatian pasar yang tepat — tugasnya membuat orang PENASARAN & BERTANYA, belum tentu langsung beli!',
    type: 'concept',
    speakerNotes: 'Hubungkan ke rumus Corong Jemput Bola Sesi 2 (150 orang lihat → 20 chat masuk). Tegaskan: jangan kecewa kalau posting Reels atau bagi brosur tidak langsung menghasilkan transfer detik itu juga! Jika orang mulai klik, komentar, atau chat tanya, berarti MARKETING sudah BERHASIL.',
    cards: [
      { title: 'Pertanyaan yang Dijawab', body: '"Bagaimana caranya calon pembeli yang tepat tahu kalau produkku ada dan tertarik menyapa?"', accent: 'teal' },
      { title: 'Wujud Nyata di UMKM', body: 'Konten hook masalah, video proses produksi, bagi tester di komunitas/sekolah, kolaborasi WO, & Status WA rutin.', accent: 'orange' },
      { title: 'Ukuran Keberhasilan', body: 'Jumlah orang baru yang melihat penawaran (Traffic) & jumlah chat/pertanyaan masuk per hari (Leads).', accent: 'teal' },
    ],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'PILAR 3: SELLING (MENUTUP TRANSAKSI)',
    title: 'SELLING: Mengubah Pertanyaan Jadi Transfer & Paket Lebih Besar',
    subtitle: 'Begitu calon pembeli sudah chat atau berdiri di depan lapakmu, tugas Marketing selesai — sekarang giliran SELLING bekerja!',
    type: 'concept',
    speakerNotes: 'Jelaskan kenapa banyak UMKM kehilangan 70% omzet justru di tahap Selling: balas chat lambat, cuma jawab "Rp15rb kak" tanpa mengarahkan paket, takut menjawab keberatan harga, dan tidak pernah follow-up calon pembeli yang diam.',
    cards: [
      { title: 'Pertanyaan yang Dijawab', body: '"Bagaimana membimbing pembeli yang masih ragu agar yakin transfer sekarang & ambil paket hemat?"', accent: 'orange' },
      { title: 'Wujud Nyata di UMKM', body: 'Respon cepat ramah, gali kebutuhan pembeli, tawarkan 2 opsi paket (Satuan vs Bundling), & follow-up sopan H+1.', accent: 'teal' },
      { title: 'Ukuran Keberhasilan', body: 'Rasio closing (% yang tanya berubah jadi transfer) dan nilai rata-rata per transaksi (Repeat & Upsell).', accent: 'orange' },
    ],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'MATRIKS PERBEDAAN MENDASAR',
    title: 'Peta Perbedaan Strategi: Branding vs Marketing vs Selling',
    subtitle: 'Pegang tabel ringkas ini agar kamu tidak lagi mencampuradukkan target dan cara kerjanya:',
    type: 'comparison',
    speakerNotes: 'Ajak peserta membaca perbedaan waktu dan fokus masing-masing pilar. Branding bersifat jangka panjang menjaga reputasi & margin; Marketing mencari perhatian & chat masuk harian; Selling fokus eksekusi percakapan & penawaran hari ini agar jadi uang.',
    comparison: {
      leftTitle: 'BRANDING (Jaga Nilai) vs MARKETING (Cari Traffic)',
      leftBody: '• BRANDING:\n  Fokus: Kepercayaan, pembeda, & kesan premium.\n  Efek: Pembeli rela bayar margin ideal tanpa menawar.\n\n• MARKETING:\n  Fokus: Menjangkau mata & telinga target pasar.\n  Efek: Ramai yang melihat, klik, mencicipi, & chat tanya.',
      rightTitle: 'SELLING (Ubah Minat Jadi Uang Masuk)',
      rightBody: '• SELLING:\n  Fokus: Komunikasi 1-on-1, negosiasi nilai, & penawaran paket.\n  Contoh F&B: "Ambil Paket 5 Botol gratis ice pack ya Kak?"\n  Contoh Kriya: "Sekalian box kado & kartu ucapan nama?"\n  Contoh Sewa: "Untuk tanggal 18 masih ada 1 set, mau kami kunci?"\n  Efek: Chat berubah jadi transfer & repeat order.',
    },
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'POLLING 2 & DIAGNOSA PENYAKIT',
    title: 'Jangan Salah Obat! Kenali di Mana Usahamu Paling Bocor',
    subtitle: 'Salah mendiagnosa masalah membuatmu capek kerja keras di bagian yang sebenarnya sudah cukup baik:',
    type: 'concept',
    linkedPollId: 'poll_s3_titik_bocor_terbesar',
    imageUrl: '/assets/images/sesi3_macet_tiga_tahap_1795422840467.jpg',
    imageCaption: '3 Gejala Bocor Berbeda: Sepi Pengunjung (Marketing) · Ragu/Tawar Murah (Branding) · Chat Dianggurkan/Kabur (Selling)',
    imagePosition: 'right',
    speakerNotes: 'Jalankan Polling 2 lalu bahas analogi "Jangan Salah Obat": kalau sakit perut (Marketing kurang traffic) jangan dikasih obat sakit kepala (ganti logo/kemasan terus). Kalau banyak yang tanya harga lalu kabur (Selling lemah), obatnya perbaiki skrip balas chat WA — bukan malah banting harga! Jika yang dipilih opsi 4 (jarang repeat order), obati dengan menjaga konsistensi kualitas Branding + sapa ulang Selling berkala.',
    cards: [
      { title: 'Gejala: Sepi yang Tanya', body: 'Jangan ubah logo terus — perbanyak aktivitas MARKETING menjemput kolam target pasar!', accent: 'teal' },
      { title: 'Gejala: Ditawar Terus', body: 'Jangan buru-buru diskon — perkuat bukti BRANDING (kemasan, segel, testimoni, garansi)!', accent: 'orange' },
      { title: 'Gejala: Chat Hilang', body: 'Jangan salahkan produknya — perbaiki cara SELLING, arahkan ke paket bundling, & follow-up!', accent: 'teal' },
      { title: 'Gejala: Jarang Beli Ulang', body: 'Jaga kepuasan pengalaman BRANDING setelah barang diterima + jadwal sapa SELLING berkala!', accent: 'orange' },
    ],
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'PRAKTIK 2: DIAGNOSA TITIK BOCOR',
    title: 'Tentukan Titik Bocor Paling Mendesak di Usahamu',
    subtitle: 'Pilih 1 dari 3 pilar yang saat ini paling menghambat target penjualanmu agar segera diobati minggu ini:',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    speakerNotes: 'Minta peserta jujur mendiagnosa titik bocornya di HP. Pilih 3 jawaban berbeda (1 bocor Marketing, 1 bocor Branding, 1 bocor Selling) untuk dibahas singkat di layar.',
    promptLines: ['Tahap paling bocor di usahaku saat ini: ___________ | Gejala nyatanya: ______________'],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'PRAKTIK 3: EKSEKUSI BRANDING',
    title: 'Tetapkan 1 Bukti Nyata BRANDING Minggu Ini',
    subtitle: 'Apa 1 perbaikan kecil pada produk, kemasan, atau pelayanan yang langsung menaikkan rasa percaya pembeli?',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    speakerNotes: 'Tekankan bahwa penguatan Branding UMKM harus murah tapi terlihat nyata: stiker segel higienis (F&B), kartu perawatan & box rapi (Kriya), atau checklist sterilisasi & seragam rapi (Persewaan).',
    cards: [
      { title: 'F&B (Yoghurt / Keripik)', body: 'Segel tutup, label tanggal produksi segar, foto dapur bersih, atau garansi ganti jika rusak.', accent: 'orange' },
      { title: 'Kriya (Handycraft)', body: 'Tag merek rapi, panduan rawat rajutan/kulit, & kemasan box yang pantas langsung jadi kado.', accent: 'teal' },
      { title: 'Jasa Persewaan', body: 'Foto unit rapi terbungkus bersih sebelum kirim & bukti ketepatan waktu di lokasi acara.', accent: 'orange' },
    ],
    promptLines: ['1 Penguat BRANDING yang langsung saya terapkan minggu ini: ______________'],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'PRAKTIK 4: EKSEKUSI MARKETING',
    title: 'Rancang 1 Aksi MARKETING Penjemput Target Harian',
    subtitle: 'Pilih 1 saluran nyata untuk memastikan 15–20 calon pembeli yang tepat mengenal & menyapa usahamu tiap minggu:',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    speakerNotes: 'Ingatkan peserta agar tidak pasif menunggu orang menemukan toko mereka. Arahkan mereka memilih saluran yang cocok dengan target pembelinya: komunitas ibu sekolah (F&B), reels proses pembuatan/mitra kado (Kriya), atau sapa langsung WO/panitia kampus (Persewaan).',
    cards: [
      { title: 'F&B (Yoghurt / Keripik)', body: 'Bagi tester botol/kemasan mini di PAUD, sanggar senam, & kantor terdekat + brosur QR WA.', accent: 'teal' },
      { title: 'Kriya (Handycraft)', body: 'Reels proses rajut/jahit di balik layar & kerja sama toko kado/florist lokal.', accent: 'orange' },
      { title: 'Jasa Persewaan', body: 'Reels bukti loading & sterilisasi alat + sapa rutin 15 panitia acara/EO lokal tiap Senin.', accent: 'teal' },
    ],
    promptLines: ['1 Aksi MARKETING konsisten + siapa kolam target yang dituju: ______________'],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'PRAKTIK 5: SKRIP SELLING ANTI-GHOSTING',
    title: 'Rumus 3 Langkah SELLING di WhatsApp (Ubah Tanya Jadi Transfer)',
    subtitle: 'Berhenti membalas chat tanya harga dengan angka mentah! Pakai rumus sederhana ini agar closing melonjak:',
    type: 'formula',
    linkedQuestionIndex: 4,
    speakerNotes: 'Ini sesi praktik yang paling cepat menghasilkan uang keesokan harinya. Beri contoh nyata kenapa membalas "Rp15.000 kak" membuat chat langsung mati, sedangkan membalas dengan pertanyaan + rekomendasi paket bundling membuat pembeli merasa dibantu.',
    cards: [
      { title: '1. Sambut + Gali Kebutuhan', body: '"Siap Kak! Boleh tahu untuk acara kapan / dikonsumsi keluarga sendiri atau untuk kado?"', accent: 'orange' },
      { title: '2. Arahkan ke Paket Bundling', body: '"Biar lebih hemat & aman, paling banyak yang ambil Paket 5 Botol / Paket Kado (include box)..."', accent: 'teal' },
      { title: '3. Kunci + Follow-Up H+1', body: '"Mau dikirim sore ini atau besok pagi?" → Jika diam, sapa ulang besoknya dengan sopan!', accent: 'orange' },
    ],
    promptLines: ['Skrip Balas Chat Paket Bundling + Kalimat Follow-Up H+1 usahaku: ______________'],
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'SINERGI 3 RODA GIGI USAHA',
    title: 'Bagaimana Ketiganya Bekerja Bersama Mengejar Target Sesi 2',
    subtitle: 'Marketing membawa orang ke depan pintu, Branding membuat mereka yakin membayar harga sehat, dan Selling mengantar uang masuk ke kasir!',
    type: 'concept',
    imageUrl: '/assets/images/sesi3_sinergi_tri_pilar_1795422840690.jpg',
    imageCaption: '3 Roda Gigi Saling Menggerakkan: Marketing (Teal) + Branding (Navy) + Selling (Amber) = Target Laba UMKM Tercapai',
    imagePosition: 'top',
    speakerNotes: 'Tunjukkan ilustrasi 3 roda gigi ini dan tarik benang merah dari Sesi 1 sampai Sesi 3: Sesi 1 memberi nilai pembeda (bahan bakar Branding), Sesi 2 memberi target laba, margin sehat, & copywriting (kompas & peluru Marketing), dan Sesi 3 menyatukan ketiganya hingga menjadi transaksi closing (Selling).',
    cards: [
      { title: 'Roda Marketing', body: 'Mengisi corong atas: 100–150 pasang mata → 15–20 chat masuk/hari.', accent: 'teal' },
      { title: 'Roda Branding', body: 'Menjaga margin sehat 30%–70% agar pembeli tidak lari ke barang murahan.', accent: 'orange' },
      { title: 'Roda Selling', body: 'Mengunci closing 5–6 transaksi paket/hari + menjaga pelanggan repeat order.', accent: 'orange' },
    ],
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'PRAKTIK 6: RANGKAIAN UTUH 3 PILAR',
    title: 'Sambungkan Marketing → Branding → Selling untuk 1 Produk Andalan',
    subtitle: 'Tulis satu alur perjalanan pembeli dari pertama melihat promosimu sampai transfer paket bundling:',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    speakerNotes: 'Ajak peserta merangkai 1 skenario utuh dari awal hingga akhir. Sorot 2–3 jawaban terbaik di layar proyektor dan berikan apresiasi langsung.',
    promptLines: ['Alur 1 Produk: [Marketing]: _______ → [Branding]: _______ → [Selling]: _______'],
  },
  {
    index: 15,
    pageNumber: 16,
    badge: 'PENUTUP & JADWAL SEIMBANG',
    title: 'Jadwal Seimbang 7 Hari: Jangan Pincang di Satu Roda Saja!',
    subtitle: 'Atur ritme mingguan agar waktumu sebagai pemilik UMKM terbagi cerdas untuk menjaga kepercayaan, mengundang pembeli, dan menutup transaksi.',
    type: 'closing',
    linkedQuestionIndex: 6,
    speakerNotes: 'Tutup Sesi 3 PartnerUp dengan menegaskan aturan emas: jangan pernah mengerjakan 1 pilar saja selama sebulan penuh. Bagi hari atau jam untuk Branding, Marketing, dan Selling. Minta peserta menuliskan jadwal 7 hari ke depan di HP masing-masing sebagai komitmen eksekusi besok pagi.',
    promptLines: ['Jadwal 7 Hari Seimbang (Branding / Marketing / Selling) usahaku: ______________'],
    cards: [
      { title: '2 Hari/Minggu: BRANDING', body: 'Rapikan foto testimoni, cek standar kemasan/segel, & dokumentasikan kualitas produksi.', accent: 'orange' },
      { title: 'Setiap Pagi: MARKETING', body: 'Sebar konten hook VP + sapa komunitas/mitra untuk menjemput calon pembeli baru.', accent: 'teal' },
      { title: 'Setiap Siang–Sore: SELLING', body: 'Balas cepat chat masuk, arahkan ke paket bundling, & follow-up sopan calon pembeli kemarin.', accent: 'orange' },
    ],
  },
];

export const SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM: SavedMaterial = {
  id: 'partnerup_sesi_3_branding_marketing_selling',
  seminarTitle: 'Sesi 3 PartnerUp: Perbedaan Mendasar Branding, Marketing & Selling',
  organizerName: 'Seri PartnerUp | obeeAcademy',
  description: 'Kurikulum Lanjutan PartnerUp setelah Target Penjualan & Copywriting: Membedah perbedaan peran Branding (bangun trust & jaga margin), Marketing (undang traffic & chat), dan Selling (skrip closing WA & repeat order) lengkap dengan diagnosa titik bocor UMKM (7 Pertanyaan, 2 Polling, 16 Slide).',
  category: 'Seri PartnerUp (Sesi 3)',
  isDefault: false,
  createdAt: 1732600000000,
  updatedAt: 1733100000000,
  content: {
    seminarTitle: 'Sesi 3 PartnerUp: Perbedaan Mendasar Branding, Marketing & Selling',
    organizerName: 'Seri PartnerUp | obeeAcademy',
    questions: SESI_3_QUESTIONS,
    polls: SESI_3_POLLS,
    slides: SESI_3_SLIDES,
    qnaTopics: [
      'Branding vs Marketing vs Selling',
      'Diagnosa Titik Bocor Penjualan',
      'Penguat Trust & Jaga Margin',
      'Jemput Traffic Tepat Sasaran',
      'Strategi Selling & Closing WA',
    ],
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1733100000000,
    materialId: 'partnerup_sesi_3_branding_marketing_selling',
    description: 'Kurikulum Lanjutan PartnerUp setelah Target Penjualan & Copywriting: Membedah perbedaan peran Branding (bangun trust & jaga margin), Marketing (undang traffic & chat), dan Selling (skrip closing WA & repeat order).',
    category: 'Seri PartnerUp (Sesi 3)',
    isDefault: false,
    createdAt: 1732600000000,
  },
};

/**
 * Kurikulum Praktik: Copywriting & Foto Produk Sosmed UMKM
 */
export const COPYWRITING_MATERIAL_PRESET: SavedMaterial = {
  id: 'copywriting_foto_sosmed_umkm',
  seminarTitle: 'Cara Menulis Caption & Foto Produk yang Bikin Pembeli Langsung Chat',
  organizerName: 'obeeAcademy | Obeecreatives',
  description: 'Materi Praktik Singkat: Merombak Bio profil toko, merangkai hook caption promosi, dan Call to Action di sosmed (3 Pertanyaan, 5 Slide).',
  category: 'Workshop Khusus',
  isDefault: false,
  createdAt: 1729500000000,
  updatedAt: 1730000000000,
  content: {
    seminarTitle: 'Cara Menulis Caption & Foto Produk yang Bikin Pembeli Langsung Chat',
    organizerName: 'obeeAcademy | Obeecreatives',
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
  organizerName: 'obeeAcademy | Obeecreatives',
  description: 'Kurikulum Spesialis: Mengubah kemasan menjadi wiraniaga diam (silent salesperson), hukum pandang 3 detik di rak toko, rumus anatomi label juara, dan strategi menaikkan harga jual 2x lipat (7 Pertanyaan, 17 Slide).',
  category: 'Workshop Kemasan & Branding',
  isDefault: false,
  createdAt: 1730700000000,
  updatedAt: 1730700000000,
  content: {
    seminarTitle: 'Pentingnya Desain Kemasan Sebagai Penunjang Pemasaran Bagi UMKM',
    organizerName: 'obeeAcademy | Obeecreatives',
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
  SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM,
  SESI_4_BRANDING_CURRICULUM,
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
      const hasSesi3 = parsed.some((m) => m.id === SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM.id);
      const hasSesi4 = parsed.some((m) => m.id === SESI_4_BRANDING_CURRICULUM.id);
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
            currentSesi2.updatedAt < 1732500000000 ||
            !currentSesi2?.content?.polls?.some((p: LivePollConfig) => p.id === 'poll_target_penjualan_umkm') ||
            !currentSesi2?.content?.slides?.[1]?.imageUrl;
          if (needsSesi2Refresh && currentSesi2) {
            updated[sesi2Idx] = SESI_2_ACTION_PLAN_CURRICULUM;
            changed = true;
          }
        }
      }
      if (!hasSesi3) {
        updated.splice(3, 0, SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM);
        changed = true;
      } else {
        const sesi3Idx = updated.findIndex((m) => m.id === SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM.id);
        if (sesi3Idx >= 0) {
          const currentSesi3 = updated[sesi3Idx];
          const needsSesi3Refresh =
            !currentSesi3?.updatedAt ||
            currentSesi3.updatedAt < 1733100000000 ||
            !currentSesi3?.content?.polls?.some((p: LivePollConfig) => p.id === 'poll_s3_salah_kaprah_umkm');
          if (needsSesi3Refresh && currentSesi3) {
            updated[sesi3Idx] = SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM;
            changed = true;
          }
        }
      }
      if (!hasSesi4) {
        const sesi3Pos = updated.findIndex((m) => m.id === SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM.id);
        updated.splice(sesi3Pos >= 0 ? sesi3Pos + 1 : 4, 0, SESI_4_BRANDING_CURRICULUM);
        changed = true;
      } else {
        const sesi4Idx = updated.findIndex((m) => m.id === SESI_4_BRANDING_CURRICULUM.id);
        if (sesi4Idx >= 0) {
          const currentSesi4 = updated[sesi4Idx];
          const needsSesi4Refresh =
            !currentSesi4?.updatedAt ||
            currentSesi4.updatedAt < 1733600000000 ||
            !currentSesi4?.content?.polls?.some((p: LivePollConfig) => p.id === 'poll_s4_persepsi_branding');
          if (needsSesi4Refresh && currentSesi4) {
            updated[sesi4Idx] = SESI_4_BRANDING_CURRICULUM;
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
          organizerName: data.organizerName || 'obeeAcademy | Obeecreatives',
          description: data.description || '',
          category: data.category || 'Materi Kustom',
          isDefault: Boolean(data.isDefault),
          createdAt: data.createdAt || data.updatedAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
          content: {
            seminarTitle: data.seminarTitle,
            organizerName: data.organizerName || 'obeeAcademy | Obeecreatives',
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
      // Gabungkan data remote dan lokal (versi dengan updatedAt lebih baru menang)
      const mergedMap = new Map<string, SavedMaterial>();
      localList.forEach((m) => mergedMap.set(m.id, m));
      remoteDocs.forEach((m) => {
        const existing = mergedMap.get(m.id);
        if (!existing || (m.updatedAt || 0) >= (existing.updatedAt || 0)) {
          mergedMap.set(m.id, m);
        }
      });
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
    const cleanDocPayload = sanitizeForFirestore({
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
    await setDoc(doc(db, 'custom_content', material.id), cleanDocPayload);

    // Jika diminta aktifkan, perbarui juga custom_content/active
    if (setAsActive) {
      await setDoc(doc(db, 'custom_content', 'active'), cleanDocPayload);
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
  organizerName: string = 'obeeAcademy | Obeecreatives',
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
  const fileName = `Semua_Bank_Materi_obeeAcademy_${new Date().toISOString().slice(0, 10)}.json`;
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
