import {
  WorksheetQuestion,
  LivePollConfig,
  SlideDefinition,
} from './seminarData';
import { SavedMaterial } from '../types';
import { DEFAULT_BRAND_THEME } from '../brandTheme';

const LAPORAN_KEUANGAN_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Pemisahan Kas Pribadi vs Usaha & Gaji Pemilik',
    coreLearning:
      'Selama uang dapur dan uang toko masih di satu dompet/rekening, pemilik tidak akan pernah tahu apakah usahanya benar-benar untung atau hanya sibuk memutar uang pribadi',
    questionText:
      'Tentukan skema pemisahan kas usahamu mulai minggu ini: [Rekening / Dompet Khusus Usaha], [Nominal Gaji Tetap Pemilik per Bulan/Minggu], dan [1 Kebiasaan Ambil Uang Laci yang Akan Dihentikan]!',
    secondaryPrompt:
      'Contoh: Rekening BCA terpisah khusus usaha; gaji pemilik Rp2.500.000/bulan diambil tiap tanggal 1; berhenti membayar belanja rumah tangga langsung dari uang kasir.',
    exampleAnswer:
      'Rekening khusus usaha: Bank Jago/BCA Bisnis terpisah dari rekening pribadi. Gaji pemilik tetap: Rp3.000.000/bulan (diambil tiap tanggal 5). Kebiasaan dihentikan: tidak lagi memakai uang tunai laci harian untuk jajan/keperluan rumah tangga tanpa dicatat.',
    exampleBusiness: 'Kuliner Rumahan / Retail UMKM',
    helperTips: [
      'Jika belum sempat buka rekening baru, pakai e-wallet/kantong digital terpisah atau 2 kotak uang fisik berlabel jelas (Kas Usaha vs Dompet Pribadi).',
      'Gaji pemilik wajib masuk pos biaya operasional agar Anda bisa melihat apakah usaha masih untung setelah membayar tenaga Anda sendiri.',
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Hitung HPP Asli & Harga Jual Aman (Termasuk Kemasan & Admin)',
    coreLearning:
      'Banyak UMKM merasa sudah untung 40%, padahal lupa memasukkan kemasan, stiker, gas/listrik, penyusutan alat, admin marketplace, dan ongkos promo',
    questionText:
      'Pilih 1 produk/layanan andalanmu, lalu rinci: [Modal Bahan Baku], [Kemasan + Label + Biaya Tak Langsung (Gas/Alat/Admin)], [Total HPP per Unit], dan [Harga Jual + Laba Kotor per Unit]!',
    secondaryPrompt:
      'Pastikan komponen kecil (plastik, sendok, bubble wrap, fee QRIS/ojol/marketplace) ikut dihitung agar harga jual tidak menggerus modal saat ramai order.',
    exampleAnswer:
      'Produk: Kopi Susu Aren 250ml. Bahan baku (kopi, susu, aren, es) = Rp5.200. Kemasan + stiker + sedotan + gas/air = Rp2.300. Total HPP = Rp7.500/botol. Harga jual langsung = Rp15.000 (Laba kotor Rp7.500 / 50%). Untuk jualan di aplikasi ojol dinaikkan ke Rp19.500 agar setelah potongan admin 20% tetap aman.',
    exampleBusiness: 'Minuman Kemasan / F&B UMKM',
    helperTips: [
      'Pisahkan harga jual langsung (WA/toko) vs harga aplikasi/marketplace agar komisi 15%–25% tidak memakan margin Anda.',
      'Untuk produk kriya/jasa, masukkan nilai upah waktu pengerjaan dan biaya perawatan alat ke dalam HPP.',
    ],
    linkedSlideIndex: 6,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Audit Arus Kas Mingguan (Uang Masuk vs Bocor Halus)',
    coreLearning:
      'Laba di kertas belum tentu berarti kas di tangan aman — Arus Kas (Cash Flow) menjaga usaha tidak kehabisan napas saat stok menumpuk atau piutang telat dibayar',
    questionText:
      'Catat 3 pos pengeluaran terbesar usahamu dalam 7 hari terakhir (Belanja Bahan, Operasional/Ongkir, atau Pengeluaran Kecil Tak Terduga), lalu tandai 1 pos yang paling rawan "bocor halus"!',
    secondaryPrompt:
      'Bocor halus biasanya muncul dari belanja eceran mendadak, bahan sisa terbuang (waste), ongkir kecil yang sering, atau barang contoh/bonus tanpa anggaran.',
    exampleAnswer:
      '3 pos terbesar minggu ini: (1) Belanja bahan baku Rp2.800.000, (2) Kemasan & ongkir eceran Rp450.000, (3) Uang makan/kopi harian & beli bahan dadakan di minimarket Rp380.000. Bocor halus paling terasa: beli bahan dadakan di minimarket karena stok tidak direkap mingguan (lebih mahal 20%).',
    exampleBusiness: 'Katering & Frozen Food UMKM',
    helperTips: [
      'Biasakan catat keluar-masuk kas cukup 5 menit setiap malam sebelum tutup toko (pakai template 1 halaman atau aplikasi kasir/catatan HP).',
      'Kumpulkan bukti pengeluaran kecil dalam satu map atau foto di grup WA pribadi khusus nota usaha.',
    ],
    linkedSlideIndex: 9,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Laba Rugi Sederhana 1 Halaman & Alokasi Untung Bersih',
    coreLearning:
      'Rumus inti UMKM sehat: Omzet − HPP = Laba Kotor; lalu Laba Kotor − Biaya Operasional Tetap (Sewa, Listrik, Gaji, Iklan) = Laba Bersih',
    questionText:
      'Estimasikan angka bulanan usahamu sekarang: [Perkiraan Omzet/Bulan], [Total Modal/HPP], [Biaya Operasional Tetap], dan [Pembagian % Laba Bersih] (mis. Cadangan Kas, Tambah Modal/Alat, & Bagi Hasil Pemilik)!',
    secondaryPrompt:
      'Jika belum punya angka pasti bulan lalu, gunakan estimasi rata-rata minggu ini dikali 4 sebagai titik awal audit.',
    exampleAnswer:
      'Estimasi Omzet: Rp18.000.000/bulan. Total HPP bahan & kemasan (50%): Rp9.000.000 → Laba Kotor Rp9.000.000. Biaya tetap (Gaji pemilik + admin paruh waktu + listrik/internet + iklan): Rp5.500.000. Sisa Laba Bersih Usaha: Rp3.500.000. Alokasi laba bersih: 50% Dana Cadangan & Tambah Alat, 30% Tambah Stok Produk Laris, 20% Bonus/Tabungan Pemilik.',
    exampleBusiness: 'Fashion & Produk Kriya',
    helperTips: [
      'Jangan habiskan 100% Laba Bersih untuk konsumsi pribadi — sisihkan minimal 20%–30% sebagai Dana Cadangan Usaha.',
      'Jika Laba Bersih ternyata sangat tipis atau minus, periksa 3 hal: naikkan harga/paket bundling, tekan pemborosan bahan, atau fokus jual produk bermargin tertinggi.',
    ],
    linkedSlideIndex: 11,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Menghitung BEP Harian & Rencana Aksi Keuangan 7 Hari',
    coreLearning:
      'Mengetahui angka Titik Impas (BEP) membuat pemilik tahu persis berapa minimal penjualan harian agar toko tidak nombok sebelum mengejar target laba',
    questionText:
      'Hitung Titik Impas (BEP) usahamu: [Biaya Tetap Bulanan ÷ Untung Kotor per Unit] = berapa unit minimal per bulan / per hari agar balik modal? Lalu tulis 1 aksi keuangan paling mendesak minggu ini!',
    secondaryPrompt:
      'Contoh: Biaya tetap Rp5.000.000 ÷ untung kotor Rp10.000/pcs = 500 pcs/bulan (20 pcs/hari kerja agar impas; pcs ke-21 dst baru jadi untung bersih!).',
    exampleAnswer:
      'Biaya tetap bulanan (gaji + listrik + internet + sewa): Rp5.500.000. Untung kotor rata-rata per paket: Rp18.000. BEP = 5.500.000 ÷ 18.000 = 306 paket/bulan (sekitar 12 paket/hari untuk 26 hari kerja). Aksi 7 hari ke depan: buat buku kas 1 halaman di HP & rapikan harga 3 produk best-seller agar margin minimal 40%.',
    exampleBusiness: 'Skema Target Harian UMKM',
    helperTips: [
      'Tempel angka BEP Harian di dekat meja kasir atau papan kerja sebagai kompas tim penjualan setiap hari.',
      'Gunakan strategi paket bundling agar pelanggan membeli lebih banyak per transaksi tanpa menambah biaya pengiriman atau admin.',
    ],
    linkedSlideIndex: 13,
  },
];

const LAPORAN_KEUANGAN_POLLS: LivePollConfig[] = [
  {
    id: 'poll_lk_kendala_keuangan',
    title: 'Kebocoran Keuangan Mana yang Paling Sering Terjadi di Usahamu?',
    subtitle: 'Pilih 1 kondisi yang paling jujur menggambarkan situasi keuangan usaha Anda saat ini:',
    linkedSlideIndex: 1,
    type: 'bar',
    options: [
      {
        id: 'opt_lk_uang_tercampur',
        label: 'Uang Usaha & Pribadi Masih Tercampur',
        subtitle: 'Omzet ramai tapi pas mau kulakan ulang uangnya sering kurang',
        category: 'rational',
      },
      {
        id: 'opt_lk_hpp_tebakan',
        label: 'Harga Jual & HPP Masih Pakai Kira-Kira',
        subtitle: 'Takut salah hitung kemasan, listrik, atau potongan marketplace/ojol',
        category: 'rational',
      },
      {
        id: 'opt_lk_malas_catat',
        label: 'Belum Konsisten Mencatat Kas Harian',
        subtitle: 'Sibuk produksi dan melayani pembeli sampai lupa rekap nota',
        category: 'emotional',
      },
      {
        id: 'opt_lk_promo_boncos',
        label: 'Sudah Catat Tapi Bingung Baca Untung Bersih & Batas Promo',
        subtitle: 'Ragu saat mau pasang diskon, iklan berbayar, atau rekrut karyawan',
        category: 'emotional',
      },
    ],
  },
  {
    id: 'poll_lk_posisi_pencatatan',
    title: 'Bagaimana Cara Pencatatan Keuangan Usahamu Saat Ini?',
    subtitle: 'Pilih metode yang paling dominan Anda gunakan selama 30 hari terakhir:',
    linkedSlideIndex: 7,
    type: 'bar',
    options: [
      {
        id: 'opt_lk_ingatan',
        label: 'Mengandalkan Ingatan & Mutasi Rekening Saja',
        subtitle: 'Belum ada buku kas atau catatan rutin terstruktur',
        category: 'emotional',
      },
      {
        id: 'opt_lk_buku_tulis',
        label: 'Buku Tulis Harian (Masuk–Keluar Saja)',
        subtitle: 'Sudah dicatat manual tapi belum direkap menjadi Laba Rugi bulanan',
        category: 'rational',
      },
      {
        id: 'opt_lk_aplikasi_excel',
        label: 'Spreadsheet / Excel / Aplikasi Pencatatan HP',
        subtitle: 'Sudah pakai alat digital tapi masih perlu dirapikan pos biayanya',
        category: 'rational',
      },
      {
        id: 'opt_lk_pisah_lengkap',
        label: 'Rekening Terpisah + Arus Kas + Laba Rugi Rutin',
        subtitle: 'Sudah berjalan rapi dan siap evaluasi margin & ekspansi',
        category: 'rational',
      },
    ],
  },
];

const LAPORAN_KEUANGAN_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'PILAR BISNIS & KEUANGAN • MODUL PRAKTIS UMKM',
    title: 'Laporan Keuangan Praktis UMKM: Pisah Kas, Hitung HPP & Laba Rugi 1 Halaman',
    subtitle:
      'Mengubah catatan keuangan dari beban administrasi yang rumit menjadi kompas keputusan bisnis harian — Disusun oleh Lalu Mahendra | obeeAcademy & obeecreatives',
    type: 'cover',
    speakerNotes:
      'Buka kelas dengan meyakinkan peserta bahwa materi ini bukan kuliah akuntansi debit-kredit yang bikin pusing. Fokus kita hari ini sangat praktis: memastikan usaha yang sudah ramai pembelinya benar-benar menyisakan uang tunai sehat, margin terjaga, dan siap naik kelas.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'DIAGNOSIS AWAL • KENAPA UANG MENGHILANG?',
    title: 'Omzet Ramai, Kenapa Akhir Bulan Uang Kas Terasa Kosong?',
    subtitle:
      'Perbedaan paling nyata antara UMKM yang hanya sibuk berjualan dengan UMKM yang keuangannya sehat dan siap berkembang:',
    type: 'comparison',
    linkedPollId: 'poll_lk_kendala_keuangan',
    speakerNotes:
      'Jalankan Polling 1 terlebih dahulu untuk memetakan kondisi kelas. Setelah hasil polling muncul, jelaskan paradoks UMKM: banyak pemilik usaha jago bikin produk dan promosi, tapi karena uang laci langsung dipakai kebutuhan rumah dan harga jual ditebak-tebak, semakin ramai order justru semakin capek tanpa tabungan.',
    comparison: {
      leftTitle: 'Mengandalkan Perasaan ("Asal Laku & Ramai")',
      leftBody:
        '• Uang usaha dan uang belanja keluarga keluar masuk dari dompet yang sama.\n• Harga jual ikut-ikutan kompetitor tanpa menghitung ongkos kemasan, admin, dan penyusutan.\n• Baru sadar rugi saat waktunya belanja bahan ulang tetapi kas mendadak kosong.',
      rightTitle: 'Memakai Sistem Laporan Keuangan 1 Halaman',
      rightBody:
        '• Kas usaha terpisah rapi dengan gaji pemilik yang jelas setiap bulan.\n• Setiap produk diketahui persis HPP asli dan batas aman diskonnya.\n• Pemilik berani ambil keputusan tambah stok, pasang iklan, atau ajukan pembiayaan berbasis angka.',
    },
    bottomBanner:
      'Prinsip Utama: Omzet adalah kebanggaan (vanity), Laba adalah kewarasan (sanity), dan Arus Kas adalah oksigen (reality) bagi UMKM.',
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'KESADARAN KEUANGAN • 5 BOCOR HALUS',
    title: '5 Bocor Halus yang Diam-Diam Menggerogoti Untung UMKM',
    subtitle:
      'Sebelum menyusun laporan, kenali dulu 5 lubang kebocoran kas yang paling sering tidak terasa:',
    type: 'concept',
    speakerNotes:
      'Bahas kelima bocor halus ini satu per satu dengan contoh nyata F&B, retail, dan jasa. Tanyakan ke audiens siapa yang pernah mengalami minimal 2 dari 5 poin ini—biasanya hampir seluruh ruangan mengangkat tangan.',
    cards: [
      {
        title: '1. "Ambil Laci" Tanpa Catatan',
        body: 'Uang kasir langsung dipakai beli bensin, pulsa, atau jajan keluarga sehingga modal kerja perlahan menyusut.',
        accent: 'orange',
      },
      {
        title: '2. HPP Lupa Biaya Kemasan & Alat',
        body: 'Hanya menghitung harga bahan baku utama, tapi melupakan plastik, stiker, gas, listrik, dan penyusutan alat.',
        accent: 'teal',
      },
      {
        title: '3. Obral Diskon & Gratis Ongkir',
        body: 'Ikut promo marketplace atau potongan harga tanpa menghitung ulang sisa margin bersih setelah fee aplikasi.',
        accent: 'orange',
      },
      {
        title: '4. Pemilik Tidak Digaji + Piutang Macet',
        body: 'Tenaga pemilik dianggap gratis, sementara barang yang diambil reseller/klien tempo tidak ditagih terjadwal.',
        accent: 'teal',
      },
    ],
    bottomBanner:
      'Kabar Baiknya: Menutup 2 saja dari 5 bocor halus di atas sering langsung menyelamatkan 10%–20% laba bulanan tanpa perlu mencari pembeli baru.',
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'LANGKAH 1 • PEMISAHAN KAS',
    title: 'Aturan Wajib #1: Pisah Rekening & Tetapkan Gaji Pemilik',
    subtitle:
      'Fondasi pertama keuangan UMKM yang sehat bukan langsung bikin neraca, melainkan memutus pencampuran uang pribadi dan usaha:',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    speakerNotes:
      'Minta peserta membuka Lembar Kerja 1 di HP. Tekankan bahwa meski usahanya masih rumahan atau dikerjakan sendiri, pemilik tetap harus menerima gaji tetap di tanggal tertentu, dan uang sisanya tetap tinggal di rekening usaha sebagai modal berputar.',
    cards: [
      {
        title: 'Rekening 1: Kas Operasional Usaha',
        body: 'Semua uang penjualan masuk ke sini; hanya boleh keluar untuk belanja bahan, kemasan, gaji, listrik, dan promosi.',
        accent: 'teal',
      },
      {
        title: 'Rekening 2: Rekening Pribadi Pemilik',
        body: 'Hanya menerima transfer "Gaji Pemilik" (dan bagi hasil laba di akhir bulan) sesuai jadwal yang sudah disepakati.',
        accent: 'orange',
      },
      {
        title: 'Rekening 3: Kantong Cadangan & Pajak',
        body: 'Menyisihkan 10%–20% laba bersih untuk perbaikan alat rusak, musim sepi, atau pengembangan produk baru.',
        accent: 'teal',
      },
    ],
    promptLines: [
      'Rekening Khusus Usaha: ____________________________',
      'Gaji Pemilik per Bulan: Rp ________________________',
      'Kebiasaan Ambil Kas yang Dihentikan: _______________',
    ],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'PENJERNIHAN ISTILAH • ANTI BINGUNG',
    title: 'Bedakan 4 Angka Sakral Keuangan UMKM (Jangan Tertukar!)',
    subtitle:
      'Banyak konflik hitung-hitungan terjadi karena pemilik masih menganggap omzet besar berarti uang di rekening bebas dipakai:',
    type: 'concept',
    speakerNotes:
      'Gunakan analogi sederhana warung kopi atau keripik dengan angka bulat (Omzet Rp10 juta, HPP Rp5 juta -> Laba Kotor Rp5 juta, Biaya Tetap Rp3 juta -> Laba Bersih Rp2 juta) agar langsung klik di kepala peserta non-akuntansi.',
    cards: [
      {
        title: '1. Omzet (Penjualan Kotor)',
        body: 'Total uang penjualan yang masuk sebelum dipotong apa pun. Belum boleh dianggap sebagai uang milik pribadi!',
        accent: 'orange',
      },
      {
        title: '2. HPP (Harga Pokok Penjualan)',
        body: 'Total biaya langsung untuk memproduksi/menyiapkan barang atau jasa yang laku terjual hari itu.',
        accent: 'teal',
      },
      {
        title: '3. Laba Kotor vs Laba Bersih',
        body: 'Laba Kotor = Omzet − HPP. Laba Bersih = Laba Kotor − Biaya Operasional Tetap (gaji, sewa, listrik, iklan).',
        accent: 'orange',
      },
      {
        title: '4. Arus Kas (Cash Flow)',
        body: 'Catatan keluar-masuknya uang tunai nyata agar operasional tetap lancar meski ada stok atau tagihan tempo.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'LANGKAH 2 • RUMUS HPP ASLI',
    title: 'Rumus Hitung HPP & Harga Jual Aman Anti-Boncos',
    subtitle:
      'Jangan menetapkan harga jual hanya dari feeling atau meniru harga toko sebelah yang belum tentu biaya produksinya sama:',
    type: 'formula',
    speakerNotes:
      'Jelaskan rumus 3 lapis HPP agar peserta tidak lagi lupa komponen tersembunyi. Tunjukkan bagaimana menaikkan harga di aplikasi pesan-antar/marketplace dihitung menggunakan pembagi (1 − % fee) bukan sekadar ditambah % fee!',
    cards: [
      {
        title: 'Komponen A: Bahan Baku Langsung',
        body: 'Seluruh bahan utama & bumbu/komponen yang habis terpakai dalam 1 unit atau 1 porsi produk.',
        accent: 'teal',
      },
      {
        title: 'Komponen B: Kemasan & Tenaga Kerja Langsung',
        body: 'Wadah, stiker label, segel, sendok/tas belanja, plus upah langsung/estimasi waktu produksi per unit.',
        accent: 'orange',
      },
      {
        title: 'Komponen C: Overhead & Penyesuaian Platform',
        body: 'Gas/listrik, penyusutan alat (3%–5%), plus rumus harga aplikasi: Harga Normal ÷ (1 − % Komisi Platform).',
        accent: 'teal',
      },
    ],
    bottomBanner:
      'Rumus Harga Jual Sehat: HPP per Unit + Target Margin (minimal 35%–50% untuk F&B/retail, 50%–70% untuk kriya/jasa).',
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'PRAKTIK 2 • HITUNG HPP PRODUK ANDALAN',
    title: 'Bedah HPP Nyata 1 Produk Andalan Usahamu Sekarang',
    subtitle:
      'Angka perkiraan sering menipu. Mari hitung ulang 1 produk terlarismu dari bahan baku sampai biaya kemasannya:',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    speakerNotes:
      'Bimbing peserta mengisi Lembar Kerja 2 di HP. Berjalan keliling atau cek jawaban yang masuk di Layar Proyektor—sorot (spotlight) 1–2 contoh perhitungan peserta untuk dikoreksi bersama jika ada biaya kemasan atau tenaga yang terlewat.',
    cards: [
      {
        title: 'Contoh F&B (Kopi Susu 250ml)',
        body: 'Bahan Rp5.200 + Botol/Stiker/Gas Rp2.300 = HPP Rp7.500. Jual langsung Rp15.000 (margin Rp7.500).',
        accent: 'orange',
      },
      {
        title: 'Contoh Kriya / Jasa',
        body: 'Kain/Bahan Rp25.000 + Upah Jahit/Desain Rp20.000 + Packaging Rp5.000 = HPP Rp50.000. Jual Rp95.000.',
        accent: 'teal',
      },
    ],
    promptLines: [
      'Produk Andalan: ___________________________________',
      'Bahan + Kemasan + Biaya Lain = HPP: Rp ____________',
      'Harga Jual & Laba Kotor per Unit: Rp ______________',
    ],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'STRATEGI MARGIN • BATAS PROMO & IKLAN',
    title: 'Cek Kesehatan Pencatatan & Batas Aman Memberi Diskon',
    subtitle:
      'Sebelum membakar anggaran iklan atau memberi potongan harga, pastikan margin kotor Anda cukup tebal untuk menanggungnya:',
    type: 'comparison',
    linkedPollId: 'poll_lk_posisi_pencatatan',
    speakerNotes:
      'Jalankan Polling 2 untuk melihat metode pencatatan yang sedang dipakai peserta. Lalu tunjukkan bahaya diskon pada margin tipis: jika margin Anda hanya 20% lalu memberi diskon 15%, laba Anda bukan turun sedikit—tetapi anjlok 75%!',
    comparison: {
      leftTitle: 'Margin Tipis (≤ 20%) — Rawan Boncos',
      leftBody:
        '• Diskon 10% saja langsung memotong separuh keuntungan bersih Anda.\n• Tidak sanggup menanggung biaya iklan berbayar, komisi reseller, atau komplain barang rusak.\n• Terjebak perang harga dan kelelahan fisik karena harus jual volume sangat besar.',
      rightTitle: 'Margin Sehat (35% – 60%) — Ruang Gerak Luas',
      rightBody:
        '• Punya ruang aman 10%–15% untuk biaya promosi, paket bundling, atau afiliator tanpa menyentuh modal.\n• Lebih tahan menghadapi kenaikan harga bahan baku musiman.\n• Sisa laba bersih cukup untuk menggaji tim & meningkatkan kualitas kemasan.',
    },
    bottomBanner:
      'Tips Praktis: Daripada memotong harga satuan terlalu dalam, gunakan bonus produk pendamping ber-HPP rendah atau paket bundling minimal beli 2–3 pcs.',
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'DOKUMEN WAJIB #1 • ARUS KAS',
    title: 'Laporan Arus Kas 1 Halaman (Cukup 5 Menit Setiap Malam)',
    subtitle:
      'Anda tidak butuh software akuntansi mahal. Cukup catat 5 kolom sederhana ini di Google Sheets, Excel, atau buku kas HP:',
    type: 'concept',
    speakerNotes:
      'Tunjukkan betapa ringkasnya struktur 5 kolom Arus Kas: Tanggal, Keterangan Transaksi, Kategori (Penjualan / Bahan / Operasional / Prive), Uang Masuk, Uang Keluar, dan Saldo Akhir. Tekankan konsistensi mencocokkan saldo catatan dengan isi laci/rekening setiap minggu.',
    cards: [
      {
        title: '1. Kas Masuk Operasional',
        body: 'Catat total penjualan tunai harian, transfer QRIS, dan pencairan dana dari marketplace/aplikasi.',
        accent: 'teal',
      },
      {
        title: '2. Kas Keluar Bahan & Operasional',
        body: 'Kelompokkan belanja bahan baku, kemasan, ongkir, listrik/kuota, gaji, serta biaya promosi secara terpisah.',
        accent: 'orange',
      },
      {
        title: '3. Cek Saldo Nyata Mingguan',
        body: 'Cocokkan saldo akhir di catatan dengan jumlah uang riil di rekening + kotak kasir setiap Minggu malam.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'PRAKTIK 3 • AUDIT KAS MINGGUAN',
    title: 'Menemukan Pos Pengeluaran Paling Rawan Bocor Minggu Ini',
    subtitle:
      'Dengan mengelompokkan uang keluar selama 7 hari saja, pemilik langsung melihat ke mana sebagian besar uang tunai mengalir:',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    speakerNotes:
      'Arahkan peserta mengisi Lembar Kerja 3 di HP. Ajak mereka jujur mengidentifikasi pengeluaran rutin kecil yang kalau dikumpulkan 30 hari ternyata sangat besar (seperti belanja bahan eceran mendadak atau biaya kirim berulang).',
    cards: [
      {
        title: 'Belanja Bahan Terjadwal',
        body: 'Belanja grosir seminggu sekali biasanya menghemat 10%–25% dibanding beli dadakan tiap hari di warung/minimarket.',
        accent: 'orange',
      },
      {
        title: 'Kendali Biaya Kecil Harian',
        body: 'Catat sekecil apa pun uang keluar dari kas usaha—uang Rp15 ribu yang tidak dicatat tiap hari = Rp450 ribu hilang sebulan.',
        accent: 'teal',
      },
    ],
    promptLines: [
      '3 Pos Pengeluaran Terbesar (7 Hari): _______________',
      'Pos Paling Rawan Bocor Halus: ______________________',
    ],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'DOKUMEN WAJIB #2 • LABA RUGI BULANAN',
    title: 'Menyusun Laporan Laba Rugi Sederhana dalam 10 Menit',
    subtitle:
      'Di akhir bulan, cukup jumlahkan kategori dari catatan kas harian ke dalam 4 baris ringkasan Laba Rugi berikut:',
    type: 'concept',
    speakerNotes:
      'Jelaskan alur 4 baris ini pelan-pelan. Ingatkan juga catatan penting: belanja alat/mesin baru yang awet > 1 tahun (kulkas, oven, kamera) jangan langsung dibebankan penuh sebagai rugi bulan itu, melainkan disusutkan bertahap supaya angka Laba Rugi tidak terlihat anjlok palsu.',
    cards: [
      {
        title: 'Baris 1: Total Penjualan (Omzet)',
        body: 'Jumlah seluruh penjualan produk/jasa selama 1 bulan penuh (tunai maupun transfer).',
        accent: 'teal',
      },
      {
        title: 'Baris 2: Dikurangi Total Modal HPP',
        body: 'Belanja bahan & kemasan yang terpakai untuk penjualan bulan tersebut → menghasilkan LABA KOTOR.',
        accent: 'orange',
      },
      {
        title: 'Baris 3: Dikurangi Biaya Operasional Tetap',
        body: 'Gaji pemilik & karyawan, sewa tempat, listrik/air/internet, biaya iklan, & perawatan → menghasilkan LABA BERSIH.',
        accent: 'teal',
      },
      {
        title: 'Baris 4: Alokasi Untung Bersih (3 Pos)',
        body: 'Bagi Laba Bersih secara disiplin: Dana Cadangan Usaha, Ekspansi/Stok Produk Laris, dan Bagi Hasil Pemilik.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'PRAKTIK 4 • SIMULASI LABA RUGI & ALOKASI',
    title: 'Hitung Estimasi Laba Bersih & Aturan Pembagian Untungmu',
    subtitle:
      'Jangan menunggu akhir tahun untuk mengecek usaha untung atau buntung — simulasikan peta Laba Rugi usahamu sekarang:',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    speakerNotes:
      'Minta peserta mengisi Lembar Kerja 4. Jika ada peserta yang belum hafal total omzet/biaya persisnya, izinkan mengisi angka estimasi paling mendekati agar mereka paham alur hitung dan aturan alokasi labanya.',
    cards: [
      {
        title: 'Rekomendasi Alokasi Laba Bersih',
        body: '40%–50% Cadangan Kas & Tambah Modal Kerja · 30% Pengembangan Produk/Alat · 20%–30% Dividen Pemilik.',
        accent: 'teal',
      },
      {
        title: 'Cek Rasio Sehat UMKM',
        body: 'Idealnya HPP maks 45%–55% dari omzet, biaya operasional maks 25%–30%, sehingga Laba Bersih tertinggal 15%–25%.',
        accent: 'orange',
      },
    ],
    promptLines: [
      'Omzet − HPP − Biaya Tetap = Laba Bersih: Rp ________',
      'Pembagian % Cadangan / Ekspansi / Pemilik: __________',
    ],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'LANGKAH 3 • TITIK IMPAS (BEP)',
    title: 'Rumus Titik Impas (BEP) & Target Penjualan Harian',
    subtitle:
      'Angka BEP menjawab pertanyaan paling krusial setiap pagi saat membuka toko: "Hari ini minimal harus laku berapa agar tidak rugi?"',
    type: 'formula',
    speakerNotes:
      'Peragakan rumus BEP sederhana yang mudah dihitung di kalkulator HP: Total Biaya Tetap Bulanan dibagi Laba Kotor rata-rata per unit. Lalu bagi dengan jumlah hari jualan (misal 25 atau 26 hari) menjadi Target Harian yang konkret.',
    cards: [
      {
        title: '1. Hitung Biaya Tetap Bulanan',
        body: 'Jumlahkan gaji pemilik, karyawan, sewa, listrik, kuota, dan cicilan alat yang tetap keluar walau toko sepi.',
        accent: 'teal',
      },
      {
        title: '2. Bagi dengan Untung Kotor / Unit',
        body: 'Rumus BEP Unit = Biaya Tetap ÷ (Harga Jual − HPP). Itulah batas minimum penjualan agar usaha balik modal.',
        accent: 'orange',
      },
      {
        title: '3. Pecah Jadi Target Harian',
        body: 'BEP Unit ÷ 25 Hari Kerja = Minimal Order Harian. Penjualan di atas angka inilah yang menjadi Laba Bersih!',
        accent: 'teal',
      },
    ],
    bottomBanner:
      'Rumus Cek Cepat: Begitu angka BEP harian tercapai di minggu ketiga, seluruh sisa hari di minggu keempat menghasilkan keuntungan bersih berlipat!',
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'PRAKTIK 5 • KOMPAS HARIAN & AKSI 7 HARI',
    title: 'Kunci Target BEP Harian & 1 Langkah Keuangan Minggu Ini',
    subtitle:
      'Ilmu keuangan baru berdampak saat dipraktikkan. Tentukan angka BEP harianmu dan 1 perubahan paling mendesak dalam 7 hari:',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    speakerNotes:
      'Minta peserta menuntaskan Lembar Kerja 5. Sorot beberapa jawaban peserta terbaik di Layar Proyektor dan berikan umpan balik singkat apakah target hariannya masuk akal atau perlu dipercepat dengan paket bundling.',
    cards: [
      {
        title: 'Cara Cepat Melampaui BEP Harian',
        body: 'Gabungkan produk terlaris dengan produk margin tinggi dalam Paket Bundling agar nilai per transaksi langsung naik.',
        accent: 'orange',
      },
      {
        title: 'Rutinitas 15 Menit Akhir Pekan',
        body: 'Setiap Minggu sore: cocokan kas, cek 3 produk paling untung, dan tentukan belanja bahan minggu depan.',
        accent: 'teal',
      },
    ],
    promptLines: [
      'BEP Harian Usahaku: _______ unit / transaksi per hari',
      '1 Aksi Keuangan dalam 7 Hari: _____________________',
    ],
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'PENUTUP & SKEMA LANJUTAN 3 JENJANG',
    title: 'Rangkuman: Usaha Tumbuh Kuat Dimulai dari Angka yang Jujur',
    subtitle:
      'Tiga kebiasaan keuangan sederhana ini menjaga keuntungan hasil branding, foto produk, dan penjualan Anda tidak menguap sia-sia:',
    type: 'closing',
    speakerNotes:
      'Tutup sesi dengan merangkum 3 pilar (Pisah Kas + Hitung HPP Asli + Cek Laba Rugi & BEP). Jelaskan juga pilihan pendalaman materi ini bagi peserta yang ingin praktik lebih jauh di kelas Workshop atau Coaching bedah angka usaha pribadi.',
    cards: [
      {
        title: '1. Seminar (Fondasi & Diagnosis)',
        body: 'Memahami 5 bocor halus, memisahkan rekening pribadi/usaha, serta cek kesehatan margin harga jual.',
        accent: 'teal',
      },
      {
        title: '2. Workshop (Praktik Template 1 Halaman)',
        body: 'Mengisi langsung kalkulator HPP, Arus Kas harian, Laba Rugi bulanan, dan simulasi diskon aman pakai angka usaha sendiri.',
        accent: 'orange',
      },
      {
        title: '3. Coaching (Bedah Laporan & Target)',
        body: 'Audit catatan transaksi 1 bulan terakhir, tetapkan gaji pemilik, batas anggaran iklan, & peta target laba 90 hari.',
        accent: 'teal',
      },
    ],
    bottomBanner:
      'Terima kasih telah mengikuti kelas Laporan Keuangan Praktis UMKM — obeeAcademy | obeecreatives. Mari tutup dengan sesi Tanya Jawab!',
  },
];

export const LAPORAN_KEUANGAN_UMKM_CURRICULUM: SavedMaterial = {
  id: 'laporan_keuangan_umkm_master_1',
  seminarTitle: 'Laporan Keuangan Praktis UMKM: Pisah Kas, Hitung HPP & Laba Rugi 1 Halaman',
  organizerName: 'obeeAcademy | obeecreatives',
  description:
    'Modul lengkap keuangan UMKM anti-rumit: 5 bocor halus kas, pemisahan rekening & gaji pemilik, rumus HPP asli + biaya admin platform, Arus Kas 5 menit/hari, Laba Rugi 1 halaman, batas diskon/iklan, hingga Target BEP Harian (5 Lembar Kerja, 2 Polling Live, 15 Slide).',
  category: 'Pilar Bisnis & Keuangan',
  isDefault: false,
  createdAt: 1735100000000,
  updatedAt: 1735100000000,
  content: {
    seminarTitle: 'Laporan Keuangan Praktis UMKM: Pisah Kas, Hitung HPP & Laba Rugi 1 Halaman',
    organizerName: 'obeeAcademy | obeecreatives',
    questions: LAPORAN_KEUANGAN_QUESTIONS,
    polls: LAPORAN_KEUANGAN_POLLS,
    slides: LAPORAN_KEUANGAN_SLIDES,
    qnaTopics: [
      'Pisah Rekening & Gaji Pemilik',
      'Hitung HPP & Harga Jual',
      'Arus Kas & Laba Rugi',
      'Promo, Diskon & Biaya Iklan',
      'BEP Harian & Modal Kerja',
    ],
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1735100000000,
    materialId: 'laporan_keuangan_umkm_master_1',
    description:
      'Modul keuangan praktis UMKM: Pisah Kas, Gaji Pemilik, Hitung HPP Asli, Arus Kas 1 Halaman, Laba Rugi Sederhana, & Target BEP Harian.',
    category: 'Pilar Bisnis & Keuangan',
    isDefault: false,
    createdAt: 1735100000000,
  },
};
