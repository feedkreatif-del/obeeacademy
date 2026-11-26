import {
  WorksheetQuestion,
  LivePollConfig,
  SlideDefinition,
} from './seminarData';
import { SavedMaterial } from '../types';
import { DEFAULT_BRAND_THEME } from '../brandTheme';

const VISUAL_IDENTITY_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Simple Brief: Identitas Dasar, Keunggulan & Penempatan Logo',
    coreLearning:
      'Desain visual yang kuat selalu lahir dari Simple Brief yang jelas — bukan dari selera pribadi atau "yang penting bagus"',
    questionText:
      'Susun Simple Brief singkat brand/perusahaanmu: [Nama Produk / Perusahaan], [1 Keunggulan Utama], [Target Audiens], dan [2 Media Penempatan Utama Logo]!',
    secondaryPrompt:
      'Penempatan logo (stiker botol kecil, seragam bordir, header slide korporat, atau signage pabrik) menentukan seberapa sederhana bentuk logo harus dibuat.',
    exampleAnswer:
      'Nama: Nusantara Coldbrew (atau PT Karya Logistik Mandiri). Keunggulan: Pengiriman dingin 24 jam higienis / tepat waktu. Target: Profesional muda perkotaan & mitra B2B kafe. Penempatan utama: Tutup botol 3cm, box pengiriman, dan slide penawaran PDF.',
    exampleBusiness: 'Produk F&B / Perusahaan Jasa & Industri',
    helperTips: [
      'Jika logo sering dicetak sangat kecil (stiker segel, ikon profil WA/IG, atau bordir seragam), hindari detail garis tipis yang mudah pecah.',
      'Simple Brief ini bisa langsung dipakai sebagai panduan kerja saat menugaskan desainer internal maupun vendor eksternal.',
    ],
    linkedSlideIndex: 6,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Menentukan Personality Brand pada 6 Spektrum Visual',
    coreLearning:
      'Spektrum karakter (Ekonomis–Mewah, Tradisional–Modern, Simple–Rumit) menjaga agar warna, font, dan gaya foto tidak saling bertabrakan',
    questionText:
      'Tentukan posisi karakter visual brand/perusahaanmu pada 6 spektrum berikut (pilih salah satu sisi atau tengah): [Ekonomis ↔ Mewah], [Feminin ↔ Maskulin], [Tradisional ↔ Modern], [Simple ↔ Rumit], [Monochrome ↔ Full Color], [Anak ↔ Dewasa]!',
    secondaryPrompt:
      'Contoh: "Sedikit Mewah (4/5), Netral-Maskulin (3/5), Modern (4/5), Simple (1/5), Dominan 2 Warna/Semi-Monochrome (2/5), Dewasa/Profesional (5/5)".',
    exampleAnswer:
      'Kopi & Roastery Korporat: Ekonomis–Mewah (4/5 agak premium), Feminin–Maskulin (4/5 tegas & maskulin), Tradisional–Modern (4/5 modern bersih), Simple–Rumit (1/5 sangat simple), Monochrome–Full Color (2/5 warna hijau tua + krem saja), Anak–Dewasa (5/5 profesional dewasa).',
    exampleBusiness: 'Roastery / Manufaktur & B2B',
    helperTips: [
      'Jangan menaruh semua nilai di posisi "tengah" — tentukan minimal 2 karakter yang paling menonjol sebagai pembeda dari kompetitor.',
      'Untuk skala korporasi & industri, spektrum Modern + Simple + Dewasa umumnya paling efektif membangun kesan kredibel dan rapi.',
    ],
    linkedSlideIndex: 7,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Mengunci Jenis Logo & Elemen Pembentuk Identitas',
    coreLearning:
      'Brand baru atau perusahaan dengan nama kuat paling aman memilih Logotype (Wordmark) atau Kombinasi Simbol + Teks agar langsung terbaca tanpa menebak-nebak',
    questionText:
      'Jenis logo apa yang paling tepat untuk brand/perusahaanmu saat ini (Logotype/Wordmark, Lettermark/Monogram, Logogram/Simbol, Maskot, atau Kombinasi) — dan 1 ide simbol/ikon khas apa yang mewakili bidangmu?',
    secondaryPrompt:
      'Ingat kasus "MADIUN TODAY": satu ikon geometris sederhana + blok dua warna sudah cukup membangun identitas tanpa harus menggambar ilustrasi rumit.',
    exampleAnswer:
      'Pilih Kombinasi (Simbol Geometris + Logotype): Simbol dua kotak bertumpuk yang melambangkan kolaborasi & transparansi, dipadukan nama perusahaan dengan huruf tebal modern di depan dan tipis di kata kedua agar mudah dibaca dalam 1 detik.',
    exampleBusiness: 'Media Informasi / Konsultan / UMKM',
    helperTips: [
      'Hindari memakai simbol abstrak berdiri sendiri tanpa teks jika audiens belum mengenal nama merek Anda secara luas.',
      'Pastikan logo tetap jelas dan tegas saat diubah ke versi 1 warna (hitam di kertas putih atau putih di foto gelap).',
    ],
    linkedSlideIndex: 9,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Mengunci Sistem Warna 60-30-10 (Layar & Cetak)',
    coreLearning:
      'Kesan visual yang rapi dan berkelas bukan ditentukan oleh banyaknya warna, melainkan disiplin menjaga rasio 60% Netral, 30% Warna Utama, dan 10% Aksen',
    questionText:
      'Kunci komposisi warna 60-30-10 untuk semua desainmu mulai hari ini: [60% Warna Netral/Latar], [30% Primary Color Identitas], dan [10% Accent Color Tombol/Sorotan]!',
    secondaryPrompt:
      'Cantumkan juga apakah kebutuhan cetakmu banyak (kemasan/brosur/seragam → wajib cek standar CMYK/Pantone) atau dominan layar (RGB/HEX).',
    exampleAnswer:
      '60% Latar Putih Hangat / Krem (#F7FAF7) agar materi nyaman dibaca; 30% Primary Hijau Hutan (#284D38) sebagai identitas ketenangan & keaslian; 10% Accent Oranye Amber (#E08B26) khusus untuk harga, tombol CTA, dan sorotan penting. Wajib simpan kode HEX & CMYK untuk cetak box.',
    exampleBusiness: 'Standar Visual Brand & Perusahaan',
    helperTips: [
      'Warna 10% aksen berfungsi mengarahkan mata pembaca ke informasi paling penting (tombol daftar, promo, atau angka utama).',
      'Selalu tes kontras warna tulisan di atas latar: hindari teks kuning/hijau muda di atas background putih.',
    ],
    linkedSlideIndex: 10,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Menetapkan Pasangan Tipografi (Maksimal 2 Keluarga Huruf)',
    coreLearning:
      'Menggabungkan terlalu banyak jenis huruf membuat materi tampak tidak teratur — cukup 1 Font Judul berkarakter dan 1 Font Isi yang nyaman dibaca',
    questionText:
      'Tentukan pasangan font resmimu: [1 Font Judul / Display] untuk memberi karakter dan [1 Font Isi / Body] yang mudah dibaca di layar HP maupun dokumen resmi, plus aturan ukuran minimal agar ramah dibaca semua usia!',
    secondaryPrompt:
      'Contoh aman & modern: Outfit / Montserrat Bold (Judul) + Plus Jakarta Sans / Inter Regular (Isi), atau Playfair Display (Judul Elegan) + Lato (Isi).',
    exampleAnswer:
      'Font Judul: Outfit Bold (tegas, modern, terbaca jelas dari jauh). Font Isi: Plus Jakarta Sans Regular/Medium (bersih untuk paragraf panjang di HP maupun proposal korporat). Aturan: hindari huruf sambung/latin tipis untuk paragraf atau label kecil kemasan.',
    exampleBusiness: 'Sistem Tipografi Digital & Cetak',
    helperTips: [
      'Gunakan perbedaan ketebalan (Bold vs Regular) dari 1 keluarga font yang sama jika ingin tampilan yang super bersih dan korporat (seperti contoh "MADIUN TODAY").',
      'Pastikan angka dan tanda baca terlihat jelas dan sejajar, terutama pada daftar harga, tabel teknis, dan kemasan.',
    ],
    linkedSlideIndex: 11,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Peta Aset Visual & Mini Brand Guideline 1 Halaman',
    coreLearning:
      'Mini Brand Guideline 1 halaman menyatukan seluruh keputusan visual sehingga siapa pun (tim desain, admin sosmed, maupun percetakan) menghasilkan tampilan yang seragam',
    questionText:
      'Pilih 2 aset visual paling prioritas yang akan langsung kamu seragamkan minggu ini (mis. Feed/Katalog, Kemasan, Slide Presentasi Perusahaan, Company Profile, ID Card/Seragam), lalu rangkum 1 kalimat aturan wajib di Brand Guideline-mu!',
    secondaryPrompt:
      'Checklist cepat: Logo jelas + Palet 60-30-10 + 2 Font tetap + Gaya foto/aset fisik seragam.',
    exampleAnswer:
      'Prioritas minggu ini: (1) Template Slide Presentasi & Proposal B2B, (2) Label kemasan & stiker segel pengiriman. Aturan wajib Brand Guideline: semua materi wajib memakai latar krem/putih 60%, hijau hutan #284D38, font Outfit + Plus Jakarta Sans, serta logo sudut kiri bawah tanpa efek bayangan berlebihan.',
    exampleBusiness: 'Implementasi Lintas Tim & Vendor',
    helperTips: [
      'Simpan file logo asli (PNG transparan & vektor SVG/PDF), kode warna HEX/CMYK, dan nama font di 1 folder cloud bersama tim.',
      'Semakin konsisten titik sentuh visualmu dilihat orang, semakin cepat kepercayaan dan nilai jual merekmu meningkat.',
    ],
    linkedSlideIndex: 13,
  },
];

const VISUAL_IDENTITY_POLLS: LivePollConfig[] = [
  {
    id: 'poll_vi_tantangan_utama',
    title: 'Masalah Visual Identity Apa yang Paling Sering Terjadi Saat Ini?',
    subtitle: 'Pilih 1 kondisi yang paling mendekati tampilan brand/perusahaan Anda sekarang:',
    linkedSlideIndex: 1,
    type: 'bar',
    options: [
      {
        id: 'opt_vi_warna_font_berubah',
        label: 'Warna & Font Gonta-Ganti Tiap Bikin Desain',
        subtitle: 'Belum punya palet warna 60-30-10 & aturan huruf tetap',
        category: 'rational',
      },
      {
        id: 'opt_vi_mirip_kompetitor',
        label: 'Tampilan Terlihat Mirip dengan Kompetitor',
        subtitle: 'Belum punya ciri khas visual yang mudah dikenali dalam 3 detik',
        category: 'emotional',
      },
      {
        id: 'opt_vi_logo_pecah_kecil',
        label: 'Logo Sulit Terbaca di Media Kecil / Kemasan / Slide',
        subtitle: 'Terlalu rumit atau belum punya varian logo adaptif',
        category: 'rational',
      },
      {
        id: 'opt_vi_beda_online_offline',
        label: 'Tampilan Medsos/Digital Beda dengan Kemasan/Kantor',
        subtitle: 'Aset digital dan aset fisik belum terasa satu kesatuan',
        category: 'emotional',
      },
    ],
  },
  {
    id: 'poll_vi_jenis_logo',
    title: 'Jenis Logo Mana yang Paling Sesuai untuk Identitas Anda Sekarang?',
    subtitle: 'Pilih jenis logo yang menurut Anda paling efektif dibaca audiens target:',
    linkedSlideIndex: 8,
    type: 'bar',
    options: [
      {
        id: 'opt_logo_logotype',
        label: 'Logotype / Wordmark (Berbasis Tulisan Nama)',
        subtitle: 'Fokus keterbacaan nama brand langsung seperti Google / FedEx',
        category: 'rational',
      },
      {
        id: 'opt_logo_kombinasi',
        label: 'Kombinasi Simbol (Logogram) + Teks Nama',
        subtitle: 'Paling fleksibel untuk kemasan, slide korporat & medsos',
        category: 'rational',
      },
      {
        id: 'opt_logo_monogram',
        label: 'Lettermark / Monogram Inisial (HBO, IBM, BUMN)',
        subtitle: 'Ringkas untuk nama perusahaan/brand yang panjang',
        category: 'emotional',
      },
      {
        id: 'opt_logo_maskot',
        label: 'Maskot / Ilustrasi Karakter',
        subtitle: 'Ramah & mudah diingat untuk segmen konsumen/keluarga',
        category: 'emotional',
      },
    ],
  },
];

const VISUAL_IDENTITY_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'MODUL DESAIN & BRANDING • VISUAL IDENTITY',
    title: 'Visual Identity: Membangun Wajah Brand & Korporasi yang Konsisten',
    subtitle:
      'Informasi grafis, warna, tipografi, hingga foto yang mengekspresikan identitas brand serta membedakannya dari kompetitor — Disusun oleh Lalu Mahendra | obeeAcademy & obeecreatives',
    type: 'cover',
    imageUrl: '/assets/images/visual_identity_cover_1795656930653.jpg',
    imageCaption:
      'Sistem Identitas Visual Terpadu: Logo, Palet Warna, Tipografi, Stationery, hingga Kemasan | obeecreatives',
    speakerNotes:
      'Buka sesi dengan menegaskan bahwa Visual Identity bukan sekadar "bikin logo bagus", melainkan seluruh informasi grafis (termasuk foto, warna, tipografi, dan aset fisik) yang membuat orang langsung mengenali brand atau perusahaan kita dalam 3 detik pertama.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'URGENSI BISNIS • PERSEPSI NILAI',
    title: 'Isi Sama, Wajah Beda: Mengapa Visual Identity Menentukan Nilai Jual',
    subtitle:
      'Dua produk atau perusahaan dengan kualitas mutu yang sama persis bisa diperlakukan sangat berbeda oleh pasar hanya karena konsistensi visualnya:',
    type: 'comparison',
    linkedPollId: 'poll_vi_tantangan_utama',
    speakerNotes:
      'Buka diskusi dengan polling tantangan visual saat ini, lalu tekankan realita bisnis & korporasi: tanpa visual identity, setiap postingan atau proposal baru harus membangun ulang kepercayaan dari nol ("reset trust"), membuat produk mudah ditawar murah, dan tim bingung saat memproduksi desain.',
    comparison: {
      leftTitle: 'Tanpa Visual Identity (Reset Trust Terus-Menerus)',
      leftBody:
        '• Warna, font, dan gaya desain berubah tiap minggu—audiens gagal mengingat siapa Anda meski sering melihat promosi.\n• Kesan acak memicu keraguan terhadap profesionalisme & mutu layanan (sering ditawar murah / kalah tender).\n• Tim internal & vendor cetak bingung karena tidak ada acuan pasti.',
      rightTitle: 'Dengan Visual Identity Konsisten (Naik Perceived Value)',
      rightBody:
        '• Audiens mengenali merek/perusahaan dalam 3 detik bahkan sebelum membaca tulisan panjang.\n• Tampilan tertata memberi sinyal mutu terjaga sehingga harga pantas lebih mudah diterima pasar & B2B.\n• Biaya & waktu produksi desain lebih hemat karena semua divisi memakai sistem yang sama.',
    },
    bottomBanner:
      'Fakta Pasar: Pelanggan menilai kredibilitas usaha dari apa yang terlihat oleh mata jauh sebelum mereka sempat mencoba kualitas produk atau layanan Anda.',
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'PENJERNIHAN KONSEP • HIERARKI BRAND',
    title: 'Bedakan 3 Hal Ini: Brand, Visual Identity, dan Logo',
    subtitle:
      'Banyak pemilik usaha & tim masih menyamakan identitas visual hanya sebatas logo—padahal ketiganya punya peran berbeda yang saling mengunci:',
    type: 'concept',
    speakerNotes:
      'Luruskan kesalahpahaman paling umum di kelas: logo hanyalah salah satu tanda pengenal. Brand adalah reputasi di kepala audiens, sedangkan Visual Identity adalah keseluruhan wajah, seragam, warna, huruf, dan gaya visual yang membuat reputasi itu tampak konsisten di mata publik.',
    cards: [
      {
        title: '1. Brand (Reputasi & Makna)',
        body: 'Apa yang dirasakan, dipercaya, dan diingat orang di kepala mereka saat menyebut nama produk atau perusahaan Anda.',
        accent: 'teal',
      },
      {
        title: '2. Visual Identity (Wajah & Seragam)',
        body: 'Sistem visual terpadu—warna, tipografi, simbol, gaya foto, hingga aset fisik—yang membuat reputasi itu terlihat nyata dan konsisten.',
        accent: 'orange',
      },
      {
        title: '3. Logo & Desain Harian (Alat Eksekusi)',
        body: 'Logo adalah tanda pengenal utamanya; desain poster, kemasan, dan slide adalah terapan harian dari sistem Visual Identity.',
        accent: 'teal',
      },
    ],
    bottomBanner:
      'Analogi Mudah: Jika Brand adalah karakter & reputasi seseorang, maka Visual Identity adalah gaya berpakaian, kerapian, dan pembawaan dirinya di depan umum.',
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'FONDASI 1 • MENGAPA PENTING',
    title: '4 Alasan Visual Identity Dibutuhkan Bisnis & Korporasi',
    subtitle:
      'Tanpa sistem visual yang konsisten, biaya promosi & materi komunikasi perusahaan bekerja jauh lebih berat:',
    type: 'concept',
    speakerNotes:
      'Tekankan 4 alasan utama: awareness/recognition, diferensiasi dari kompetitor, kedekatan emosional dengan target audiens, serta kepercayaan instan di kesan pertama.',
    cards: [
      {
        title: '1. Brand Awareness & Recognition',
        body: 'Membuat audiens langsung mengenali merek atau institusi Anda hanya dari sekilas warna, gaya foto, dan bentuk visualnya.',
        accent: 'teal',
      },
      {
        title: '2. Pembeda Jelas dari Kompetitor',
        body: 'Di pasar yang produk/jasanya mirip, identitas visual menjadi pembeda tercepat agar Anda tidak tenggelam di keramaian.',
        accent: 'orange',
      },
      {
        title: '3. Target Audiens Merasa Relate',
        body: 'Bahasa visual yang selaras dengan karakter audiens membuat calon pembeli atau mitra B2B merasa "ini cocok untuk saya".',
        accent: 'teal',
      },
      {
        title: '4. Kepercayaan Instan Sejak Detik Pertama',
        body: 'Tampilan yang rapi dan seragam memberi sinyal profesionalisme, standar mutu terjaga, dan kesiapan dipercaya klien lebih besar.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'FONDASI 2 • TUJUAN STRATEGIS',
    title: 'Tujuan Utama Visual Identity Dibentuk',
    subtitle:
      'Visual Identity berfungsi menjembatani strategi bisnis dengan pengalaman nyata yang dilihat oleh audiens:',
    type: 'agenda',
    speakerNotes:
      'Jelaskan bahwa seluruh materi promosi—mulai dari feed Instagram, katalog produk, company profile, hingga kemasan dan seragam—harus menyatu dalam 3 tujuan utama ini.',
    cards: [
      {
        title: 'Menciptakan Ikatan Emosional',
        body: 'Visual bukan hanya soal estetika, tetapi membangun rasa aman, bangga, dan kedekatan emosional pada audiens.',
        accent: 'orange',
      },
      {
        title: 'Menyampaikan Informasi Terstruktur',
        body: 'Memudahkan audiens menangkap siapa Anda, apa keunggulan Anda, dan informasi penting lain secara cepat tanpa bingung.',
        accent: 'teal',
      },
      {
        title: 'Menyatukan Bisnis dengan Visual Konsisten',
        body: 'Memastikan pesan di slide presentasi, media sosial, kemasan produk, dan aset kantor berbicara dalam satu suara visual yang sama.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'ANATOMI IDENTITAS • STUDI KASUS',
    title: 'Bedah Anatomi Visual Identity: Studi Kasus "MADIUN TODAY"',
    subtitle:
      'Bagaimana sebuah identitas dibangun bukan dari 1 elemen, melainkan kombinasi terukur dari Warna, Simbol, Ikon, dan Tipografi:',
    type: 'concept',
    imageUrl: '/assets/images/visual_identity_touchpoints_1795656930908.jpg',
    imagePosition: 'right',
    imageCaption:
      'Kesatuan elemen identitas visual saat diterapkan ke media digital maupun aset fisik organisasi',
    speakerNotes:
      'Gunakan studi kasus MADIUN TODAY dari materi asli: tunjukkan bagaimana 2 blok geometris sederhana (Primary Color hijau tua + Secondary Color hijau sage), 1 Icon siku kecil, serta permainan ketebalan Typography ("MADIUN" tebal + "TODAY" ringan, sampel Aa Bb Cc Dd) langsung melahirkan identitas yang rapi dan berwibawa.',
    cards: [
      {
        title: 'Primary & Secondary Color',
        body: 'Hijau Hutan Tua sebagai warna utama berwibawa, dipadu Hijau Sage yang memberi kedalaman dan keseimbangan visual.',
        accent: 'teal',
      },
      {
        title: 'Symbol & Icon Geometris',
        body: 'Bentuk geometris bertumpuk + ikon sudut kecil yang mudah diskalakan untuk watermark foto, favicon, hingga pin seragam.',
        accent: 'orange',
      },
      {
        title: 'Typography Contrast',
        body: 'Memadukan ketebalan huruf Bold ("MADIUN") dan Light ("TODAY") dengan hierarki baca Aa Bb Cc Dd yang bersih dan modern.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'PRAKTIK 1 • SIMPLE BRIEF',
    title: 'Mulai dari Simple Brief Sebelum Mendesain Apa Pun',
    subtitle:
      'Brief sederhana mencegah revisi tanpa ujung dan memastikan visual identity tepat sasaran untuk bisnis maupun perusahaan:',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    speakerNotes:
      'Minta peserta membuka Lembar Kerja 1 di HP. Tekankan bahwa sebelum memilih warna atau menggambar logo, 5 poin Simple Brief ini wajib terjawab dulu agar desain punya arah bisnis yang jelas.',
    cards: [
      {
        title: '1. Nama Produk / Perusahaan',
        body: 'Menentukan panjang teks, kemudahan pelafalan, dan kebutuhan inisial/singkatan.',
        accent: 'orange',
      },
      {
        title: '2. Keunggulan & Positioning',
        body: 'Nilai pembeda utama yang ingin langsung terasa saat orang melihat visual Anda.',
        accent: 'teal',
      },
      {
        title: '3. Target Market & Penempatan Logo',
        body: 'Siapa pembacanya dan di mana logo paling sering tampil (stiker kecil, slide B2B, atau signage).',
        accent: 'orange',
      },
    ],
    promptLines: [
      'Nama Produk / Perusahaan: ________________________',
      'Keunggulan Utama & Target: ________________________',
      'Media Penempatan Utama: ___________________________',
    ],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'PRAKTIK 2 • BRAND PERSONALITY',
    title: 'Menetapkan Personality Brand Lewat 6 Spektrum Visual',
    subtitle:
      'Agar desainer, tim internal, dan pemilik usaha sepaham, terjemahkan karakter merek ke dalam skala 6 kutub berikut:',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    speakerNotes:
      'Bimbing peserta mengisi Lembar Kerja 2 di HP dengan menentukan posisi di 6 spektrum dari materi Simple Brief Anda: Ekonomis–Mewah, Feminin–Maskulin, Tradisional–Modern, Simple–Rumit, Monochrome–Full Color, dan Anak–Dewasa.',
    cards: [
      {
        title: 'Posisi Nilai & Audiens',
        body: 'Ekonomis ↔ Mewah · Feminin ↔ Maskulin · Anak ↔ Dewasa (menentukan mood foto & gaya bahasa).',
        accent: 'teal',
      },
      {
        title: 'Gaya Eksekusi Visual',
        body: 'Tradisional ↔ Modern · Simple ↔ Rumit · Monochrome ↔ Full Color (menentukan bentuk logo & jumlah warna).',
        accent: 'orange',
      },
    ],
    promptLines: [
      'Ekonomis [1–5] Mewah · Tradisional [1–5] Modern',
      'Simple [1–5] Rumit · Monochrome [1–5] Full Color',
    ],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'ELEMEN 1 • ANATOMI LOGO',
    title: 'Jenis Logo: Logotype vs Logogram (Plus Monogram & Maskot)',
    subtitle:
      'Memilih bentuk logo yang tepat mempercepat pengenalan audiens sekaligus memudahkan penerapan di berbagai ukuran media:',
    type: 'comparison',
    linkedPollId: 'poll_vi_jenis_logo',
    speakerNotes:
      'Jelaskan klasifikasi jenis logo secara jernih (sekalian meluruskan kategori Maskot vs Abstrak): (1) Logotype/Wordmark berbasis tulisan (Google, FedEx, Gojek teks), (2) Lettermark/Monogram inisial (HBO, IBM, BRI), (3) Logogram/Symbol & Abstrak (Apple, Nike, Pertamina), dan (4) Maskot karakter (KFC).',
    comparison: {
      leftTitle: 'Logotype & Lettermark (Berbasis Teks / Inisial)',
      leftBody:
        '• Logotype (Wordmark): Nama merek dijadikan bentuk huruf khas yang langsung terbaca jelas (contoh: Google, FedEx, Kopi Kenangan).\n• Lettermark (Monogram): Singkatan inisial untuk nama perusahaan yang panjang agar ringkas (contoh: IBM, HBO, PLN, BCA).\n• Paling aman untuk merek baru agar audiens tidak salah baca.',
      rightTitle: 'Logogram / Simbol, Abstrak & Maskot (Berbasis Ikon)',
      rightBody:
        '• Symbol & Abstrak: Ikon atau bentuk geometris khas yang mewakili filosofi/gerak merek (contoh: Apple, Nike, Pertamina).\n• Maskot (Character): Ilustrasi tokoh/karakter ramah yang membangun kedekatan emosional (contoh: KFC, Mie Gaga/maskot F&B).\n• Paling kuat jika dipasangkan dulu bersama teks nama (Kombinasi).',
    },
    bottomBanner:
      'Aturan Emas: Brand bertumbuh paling aman memakai Logo Kombinasi (Simbol + Teks), lalu pastikan punya versi Simbol/Monogram untuk ikon profil kecil.',
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'PRAKTIK 3 • 4 ELEMEN VISUAL',
    title: '4 Elemen Inti Pembentuk Sistem Visual Identity',
    subtitle:
      'Logo hanyalah pintu masuk — kekonsistenan merek dijaga oleh 4 elemen berikut secara bersamaan:',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    speakerNotes:
      'Minta peserta mengisi Lembar Kerja 3 (menetapkan jenis logo + ide simbol). Ingatkan bahwa keempat elemen ini (Warna, Tipografi, Symbol/Icon, Aset Fisik & Digital) harus bergerak serentak.',
    cards: [
      {
        title: '1. Warna (Color System)',
        body: 'Membangun suasana emosional & daya ingat tercepat sebelum teks sempat dibaca.',
        accent: 'orange',
      },
      {
        title: '2. Tipografi (Typography)',
        body: 'Suara visual merek — menunjukkan apakah merek terasa tegas, klasik, ramah, atau teknis.',
        accent: 'teal',
      },
      {
        title: '3. Symbol / Icon & Motif',
        body: 'Ikonografi, garis aksen, dan supergraphic khas pengikat seluruh layout desain.',
        accent: 'orange',
      },
      {
        title: '4. Aset Fisik & Digital',
        body: 'Bukti nyata di tangan pelanggan: kemasan, kartu nama, seragam, hingga slide & feed medsos.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'PENGAYAAN KORPORASI • WARNA 60-30-10',
    title: 'Aturan Warna 60-30-10 & Konsistensi Layar (RGB) vs Cetak (CMYK)',
    subtitle:
      'Kunci tampilan profesional tanpa terlihat ramai seperti "poster warna-warni": disiplin pada proporsi warna dan format produksinya:',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    speakerNotes:
      'Ini pengayaan krusial bagi UMKM yang mencetak kemasan maupun perusahaan yang mencetak company profile/seragam: ajarkan rumus 60-30-10 dan ingatkan perbedaan warna layar (RGB/HEX yang menyala terang) dengan tinta cetak (CMYK) agar hasil cetak tidak kusam meleset.',
    cards: [
      {
        title: '60% Warna Netral / Latar',
        body: 'Putih, krem, atau abu-abu lembut sebagai ruang bernapas agar teks & foto produk menonjol.',
        accent: 'teal',
      },
      {
        title: '30% Primary Color (Identitas)',
        body: 'Warna utama merek/perusahaan untuk header, blok identitas, seragam, atau elemen struktur.',
        accent: 'orange',
      },
      {
        title: '10% Accent Color (Fokus Aksi)',
        body: 'Warna kontras khusus tombol CTA, harga promo, badge penting, atau angka sorotan.',
        accent: 'teal',
      },
    ],
    bottomBanner:
      'Catatan Produksi: Simpan kode HEX/RGB untuk medsos & slide presentasi, serta konversi CMYK/Pantone untuk cetak kemasan, brosur, & seragam.',
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'PENGAYAAN KORPORASI • TIPOGRAFI',
    title: 'Tipografi & Hierarki Baca: Cukup 2 Keluarga Huruf',
    subtitle:
      'Desain yang baik tidak pernah memaksa pembaca menebak tulisan. Gunakan sistem 2 font yang kontras namun harmonis:',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    speakerNotes:
      'Bimbing peserta mengisi Lembar Kerja 5. Jelaskan bahwa 1 Font Display (Judul) + 1 Font Sans-Serif Bersih (Isi) jauh lebih rapi dan cepat dikerjakan oleh tim mana pun dibanding memakai 4–5 jenis font dalam satu poster.',
    cards: [
      {
        title: 'Font 1: Headline / Display',
        body: 'Tebal, berkarakter, bertugas menghentikan pandangan audiens dalam 2 detik pertama.',
        accent: 'orange',
      },
      {
        title: 'Font 2: Body / Keterangan',
        body: 'Bersih, jarak huruf lega, wajib nyaman dibaca di layar HP maupun dokumen PDF perusahaan.',
        accent: 'teal',
      },
      {
        title: 'Hierarki Ukuran & Kontras',
        body: 'Judul 2x lebih besar dari isi; hindari tulisan tipis/dekoratif untuk informasi teknis & harga.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'PENERAPAN LINTAS SEGMEN • TOUCHPOINTS',
    title: 'Aset Fisik & Digital: Skala UMKM vs Korporasi & Industri',
    subtitle:
      'Prinsip Visual Identity sama kuatnya di dua skala usaha — yang berbeda hanyalah daftar titik sentuh (touchpoints) prioritasnya:',
    type: 'comparison',
    imageUrl: '/assets/images/visual_identity_touchpoints_1795656930908.jpg',
    imagePosition: 'top',
    speakerNotes:
      'Tunjukkan gambar touchpoints: baik UMKM maupun perusahaan industri sama-sama butuh keseragaman antara tampilan layar dan aset fisik yang dipegang klien.',
    comparison: {
      leftTitle: 'Skala UMKM & Brand Bertumbuh',
      leftBody:
        '• Digital: Foto profil, bio & template grid Instagram, foto produk dengan pencahayaan seragam, katalog WhatsApp.\n• Fisik: Stiker segel kemasan, box/pouch berlabel rapi, kartu ucapan/cara pakai di dalam paket, apron/booth bazar.',
      rightTitle: 'Skala Korporasi, B2B & Industri',
      rightBody:
        '• Digital: Deck slide presentasi bisnis, company profile PDF, signature email resmi, template pengumuman HR/Marcom.\n• Fisik: ID card & lanyard karyawan, seragam kerja, map/amplop resmi, signage pabrik/kantor, hingga booth pameran dagang.',
    },
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'OUTPUT WAJIB • BRAND GUIDELINE',
    title: 'Merangkum Mini Brand Guideline 1 Halaman',
    subtitle:
      'Satukan hasil Simple Brief, Personality, Logo, Warna 60-30-10, dan Font ke dalam 1 dokumen pegangan tim:',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    speakerNotes:
      'Minta peserta menyelesaikan Lembar Kerja 6. Jelaskan bahwa Mini Brand Guideline 1 halaman adalah "kitab aturan main" yang menghemat waktu briefing ke desainer, admin media sosial, maupun vendor percetakan.',
    cards: [
      {
        title: '1. File Logo Master & Aturan Jarak',
        body: 'Simpan versi penuh, horizontal, ikon profil, plus versi putih/monokrom di 1 folder rapi.',
        accent: 'teal',
      },
      {
        title: '2. Kode Warna & Nama Font Tetap',
        body: 'Cantumkan kode HEX/CMYK 60-30-10 serta nama 2 font resmi beserta ketebalannya.',
        accent: 'orange',
      },
      {
        title: '3. Gaya Foto & Contoh Benar/Salah',
        body: 'Sertakan 2–3 contoh tata letak yang disetujui agar semua divisi tetap seragam.',
        accent: 'teal',
      },
    ],
    promptLines: [
      '2 Aset Prioritas Minggu Ini: _______________________',
      'Aturan Wajib Brand Guideline: ______________________',
    ],
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'PENUTUP & RENCANA AKSI',
    title: 'Kesimpulan: Konsistensi Mengalahkan Desain Rumit',
    subtitle:
      'Identitas visual yang sederhana tetapi dipakai konsisten di semua media selalu menang atas desain rumit yang berubah setiap minggu:',
    type: 'closing',
    speakerNotes:
      'Tutup sesi dengan mengajak peserta menerapkan minimal 1 perubahan nyata minggu ini dari Mini Brand Guideline mereka, lalu buka sesi Tanya Jawab dan bedah contoh tampilan brand/perusahaan peserta.',
    cards: [
      {
        title: '1. Kunci Simple Brief & Personality',
        body: 'Desain selalu mengikuti target audiens, keunggulan bisnis, dan media penempatannya.',
        accent: 'orange',
      },
      {
        title: '2. Disiplin 60-30-10 & 2 Font',
        body: 'Dua aturan sederhana ini langsung menaikkan kelas tampilan UMKM maupun slide korporasi.',
        accent: 'teal',
      },
      {
        title: '3. Terapkan Lintas Touchpoints',
        body: 'Pastikan tampilan media sosial, dokumen penawaran, kemasan, dan aset fisik berbicara dalam satu identitas.',
        accent: 'orange',
      },
    ],
  },
];

export const VISUAL_IDENTITY_CURRICULUM: SavedMaterial = {
  id: 'visual_identity_master_1',
  seminarTitle: 'Visual Identity: Membangun Identitas Visual Brand & Korporasi yang Konsisten',
  organizerName: 'obeeAcademy | obeecreatives',
  description:
    'Modul lengkap penyusunan Identitas Visual (adaptasi MJC Madiun + pengayaan korporasi & industri): Urgensi Persepsi Nilai, Beda Brand vs Visual Identity vs Logo, Anatomi Elemen, Jenis Logo (Logotype/Logogram/Monogram/Maskot), Aturan Warna 60-30-10, Tipografi 2 Font, Simple Brief & Brand Personality Slider, hingga Mini Brand Guideline 1 Halaman (6 Lembar Kerja, 2 Polling, 15 Slide).',
  category: 'Seri Desain & Branding',
  isDefault: false,
  createdAt: 1734300000000,
  updatedAt: 1734500000000,
  content: {
    seminarTitle: 'Visual Identity: Membangun Identitas Visual Brand & Korporasi yang Konsisten',
    organizerName: 'obeeAcademy | obeecreatives',
    questions: VISUAL_IDENTITY_QUESTIONS,
    polls: VISUAL_IDENTITY_POLLS,
    slides: VISUAL_IDENTITY_SLIDES,
    qnaTopics: [
      'Urgensi & Nilai Jual Visual Identity',
      'Simple Brief & Brand Personality',
      'Pemilihan Jenis Logo',
      'Palet Warna 60-30-10 & RGB/CMYK',
      'Tipografi & Implementasi Korporasi',
    ],
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1734500000000,
    materialId: 'visual_identity_master_1',
    description:
      'Modul Visual Identity untuk UMKM maupun Korporasi & Industri: Simple Brief, Personality Brand, Jenis Logo, Warna 60-30-10, Tipografi, & Mini Brand Guideline 1 Halaman.',
    category: 'Seri Desain & Branding',
    isDefault: false,
    createdAt: 1734300000000,
  },
};
