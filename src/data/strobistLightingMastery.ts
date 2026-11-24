import {
  WorksheetQuestion,
  LivePollConfig,
  SlideDefinition,
} from './seminarData';
import { SavedMaterial } from '../types';

const STROBIST_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Bedah Custom Object Produk (Bentuk, Ukuran, Material, Warna)',
    coreLearning:
      'Tidak ada satu resep lighting untuk semua produk—karakter fisik objek menentukan jenis modifier, jarak lampu, dan sudut pantulan',
    questionText:
      'Pilih 1 produk yang paling sering kamu foto (atau paling sulit). Tuliskan analisis 4 variabelnya: [Bentuk & Dimensi], [Material Paling Rewel: kaca/logam/matte/tekstil], dan [Tantangan Warnanya]!',
    secondaryPrompt:
      'Contoh: Jam tangan kayu & kaca mineral dial — bentuk silinder kecil, material campuran kayu matte + bezel logam/kaca sangat reflektif, warna cokelat tua rawan hilang detail.',
    exampleAnswer:
      'Jam tangan kayu Garvinoes: Ukuran kecil (±4cm dial), bentuk melingkar berdimensi 3D. Material paling rewel: kaca dial (mudah memantulkan softbox putih) dan clasp logam mengilap, dipadukan kayu gelap yang menyerap cahaya.',
    exampleBusiness: 'Jam Tangan Kayu & Aksesori Reflektif',
    helperTips: [
      'Material kaca & logam bekerja seperti cermin: bukan lampunya yang menyorot objek, melainkan pantulan diffuser yang terekam.',
      'Material matte gelap (tumbler hitam/kain) butuh rim light agar garis tepinya tidak tenggelam ke latar.',
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Menentukan Batasan Brief & Kesepakatan Moodboard Klien',
    coreLearning:
      'Masalah terbesar fotografer komersial bukan di teknis flash, melainkan brief "terserah" yang berujung revisi tanpa batas di akhir',
    questionText:
      'Dari proyek foto produkmu terakhir: termasuk kategori mana brief-nya ([Brief by Terserah], [Brief by Discuss], atau [Brief by Principal])? Tulis 2 kesepakatan wajib yang harus dikunci sebelum motret!',
    secondaryPrompt:
      'Jika klien bilang "terserah Mas, yang penting bagus", bagaimana caramu mengarahkannya menjadi Brief by Discuss yang aman?',
    exampleAnswer:
      'Kategori awal: Brief by Terserah. Solusi saya ubah jadi Brief by Discuss: kirim 3 moodboard referensi (tone hangat kayu, angle eye-level & 45°, background krem matte) dan kunci persetujuan prop + jumlah sudut sebelum hari pemotretan.',
    exampleBusiness: 'Katalog Peralatan Dapur Kayu / Lifestyle',
    helperTips: [
      'Brief by Terserah wajib diberi maksimal 2–3 pilihan moodboard agar klien memilih arah visual sebelum sesi studio.',
      'Brief by Principal biasanya mengunci rasio crop, kode warna HEX latar, dan posisi logo—wajib cek dengan overlay tethering.',
    ],
    linkedSlideIndex: 5,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Memeriksa Ambient & Fondasi Main Light (1 Lampu Dulu)',
    coreLearning:
      'Nyalakan lampu satu per satu setelah ambient benar-benar nol agar Anda tahu persis kontribusi setiap titik cahaya',
    questionText:
      'Saat melakukan Step 1 (Kill Ambient Light) & Step 2 (Main Light): apa setting awal kamera yang biasa kamu pakai di studio, dan efek visual apa yang pertama kali harus dicek pada hasil Main Light?',
    secondaryPrompt:
      'Cek kecepatan sync flash (misal 1/160–1/200s), aperture untuk ketajaman produk (f/8–f/11), ISO dasar (ISO 100), lalu amati arah bayangan Main Light.',
    exampleAnswer:
      'Setting awal Kill Ambient: ISO 100, f/9, Shutter 1/200s hingga frame Capture One hitam total. Lalu nyalakan 1 Godox Payung Octa 80cm dari atas/samping untuk mengecek tekstur serat kayu & ketajaman jarum dial tanpa flare.',
    exampleBusiness: 'Setup Studio Jam Tangan (Tethering Capture One)',
    helperTips: [
      'Jangan pernah menyalakan 3 flash sekaligus di jepretan pertama—jika foto terlalu terang atau flat, Anda bingung lampu mana yang salah.',
      'Pastikan Shutter Speed tidak melewati max sync speed kamera jika tidak memakai HSS.',
    ],
    linkedSlideIndex: 9,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Solusi Light Blocking untuk Kaca, Kemasan Mengilap & Flare',
    coreLearning:
      'Di level Strobist Advanced, membuang cahaya liar dengan Light Blocker (negative fill / gobo) sama pentingnya dengan menambah lampu',
    questionText:
      'Bayangkan muncul pantulan putih berkabut atau flare di bagian kaca/kemasan produkmu saat lampu Fill/Scrim menyala. Di posisi mana kamu harus meletakkan Light Blocker (karton hitam / gobo)?',
    secondaryPrompt:
      'Ingat hukum "Angle of Incidence = Angle of Reflection": lihat dari sudut lensa, area mana di ruangan/scrim yang sedang memantul di permukaan kaca!',
    exampleAnswer:
      'Letakkan potongan karton hitam (gobo bulat) pada magic arm/clip tepat di jalur pantul antara lensa kamera dan bagian bawah scrim putih yang memantul di kaca dial jam, hingga pantulan kabut hilang tanpa menghalangi frame lensa.',
    exampleBusiness: 'Kaca Jam Tangan & Permukaan Mengilap',
    helperTips: [
      'Gunakan Live View atau layar laptop (Tethering) sambil menggeser-geser kartu hitam dengan tangan untuk menemukan titik pantul yang tepat.',
      'Blocker hitam di samping produk juga berfungsi menambah ketegasan garis gelap (dark line edge) pada botol kaca bening atau logam.',
    ],
    linkedSlideIndex: 12,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Merancang Resep Multi-Light & Modifier untuk Produk Spesial',
    coreLearning:
      'Kombinasi modifier (Octa, Striplight, Grid, Scrim Difusi) harus mengikuti lebar bidang dan tekstur produk',
    questionText:
      'Untuk produk berbahan sulit (misal tumbler matte hitam di latar gelap atau bezel logam sempit): komponen cahaya apa saja yang kamu aktifkan (Main, Rim, Fill, Background) dan pakai modifier apa?',
    secondaryPrompt:
      'Bayangkan skema lighting dari atas (top-down) yang nanti bisa kita gambar bersama di Papan Tulis (Flipchart).',
    exampleAnswer:
      'Tumbler matte hitam: Matikan lampu latar. Pakai 2x Godox TT600 + Striplight (kiri & kanan belakang agak serong ke samping) melewati scrim tipis untuk menciptakan gradasi rim mulus di bodi silinder, plus 1 kicker tipis ke alas batu gelap.',
    exampleBusiness: 'Tumbler Matte Hitam & Gadget Metal',
    helperTips: [
      'Bidang silinder logam/matte membutuhkan sumber cahaya vertikal yang panjang (striplight / scrim) agar pantulannya berupa garis mulus dari atas ke bawah.',
      'Untuk memunculkan tekstur batu/alas tanpa membocori background hitam, arahkan cahaya miring rendah (raking light) atau pakai grid.',
    ],
    linkedSlideIndex: 14,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Checklist Persiapan Produksi (Zero-Mistake Studio Workflow)',
    coreLearning:
      'Hasil foto komersial yang bersih di kamera memangkas waktu retouching Photoshop hingga 70%',
    questionText:
      'Tuliskan 3 langkah persiapan & eksekusi wajib yang akan langsung kamu terapkan pada sesi pemotretan produk berikutnya agar foto langsung bersih sejak di kamera!',
    secondaryPrompt:
      'Pikirkan mulai dari kebersihan fisik produk (sarung tangan katun & blower), alur 5 langkah lighting, hingga tethering.',
    exampleAnswer:
      '1) Pakai sarung tangan katun & lap mikrofiber sebelum menyentuh jam/botol kaca; 2) Wajib Kill Ambient dulu di setting ISO 100 f/9, lalu nyalakan Main → Rim → Fill satu per satu via Capture One; 3) Selesaikan pantulan kaca dengan Light Blocker sebelum menyentuh Photoshop.',
    exampleBusiness: 'SOP Pemotretan Komersial Studio',
    helperTips: [
      'Debu dan sidik jari pada kaca/logam memakan waktu retouching lebih lama daripada menyetel 1 lampu tambahan.',
      'Persiapan rapi di lokasi pemotretan membuka jalan mulus ke tahap lanjutan (Seri 2: Product Retouching A–Z).',
    ],
    linkedSlideIndex: 15,
  },
];

const STROBIST_POLLS: LivePollConfig[] = [
  {
    id: 'poll_strobist_material_tersulit',
    title: 'Material Produk Apa yang Paling Sering Bikin Gagal Saat Dipotret?',
    subtitle: 'Pilih 1 jenis material yang paling sering memicu pantulan liar atau warna meleset:',
    linkedSlideIndex: 2,
    type: 'bar',
    options: [
      {
        id: 'opt_kaca_botol',
        label: 'Kaca / Botol Bening / Jam Tangan',
        subtitle: 'Pantulan softbox & lampu studio ikut masuk ke kaca',
        category: 'rational',
      },
      {
        id: 'opt_logam_stainless',
        label: 'Logam Mengilap / Chrome / Bezel HP',
        subtitle: 'Permukaan seperti cermin & muncul hotspot tajam',
        category: 'rational',
      },
      {
        id: 'opt_matte_hitam',
        label: 'Matte Hitam / Produk Gelap',
        subtitle: 'Tepi produk menyatu & hilang ditelan bayangan latar',
        category: 'emotional',
      },
      {
        id: 'opt_kemasan_plastik',
        label: 'Kemasan Plastik / Foil / Pouch',
        subtitle: 'Silau garis cahaya menutupi tulisan label brand',
        category: 'emotional',
      },
    ],
  },
  {
    id: 'poll_strobist_tebak_efek',
    title: 'Tebak Setup: Perubahan Utama dari Step 2 ke Step 3?',
    subtitle: 'Amati tepi luar jam tangan kayu pada foto — komponen apa yang baru dinyalakan?',
    linkedSlideIndex: 10,
    type: 'bar',
    options: [
      {
        id: 'opt_rim_light',
        label: 'Rim Light (Garis Tepi Bezel & Strap)',
        subtitle: 'Memisahkan kontur luar produk dari latar belakang',
        category: 'rational',
      },
      {
        id: 'opt_fill_light',
        label: 'Fill Light Depan Lensa',
        subtitle: 'Menerangi seluruh bayangan depan secara merata',
        category: 'rational',
      },
      {
        id: 'opt_kill_ambient',
        label: 'Naikkan ISO / Turunkan Shutter Speed',
        subtitle: 'Memasukkan lebih banyak cahaya lampu ruangan',
        category: 'emotional',
      },
      {
        id: 'opt_edit_preset',
        label: 'Preset Lightroom / Tambah Clarity',
        subtitle: 'Efek olah digital pasca-pemotretan',
        category: 'emotional',
      },
    ],
  },
];

const STROBIST_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'SERI FOTOGRAFI PRODUK 1 • STROBIST ADVANCED',
    title: 'Strobist Advanced: Product Lighting Mastery',
    subtitle:
      'Menjinakkan Cahaya Buatan untuk Fotografi Produk Komersial — Dari Analisis Custom Object, Strategi Brief, hingga 5 Langkah Strobist Lighting — Karya Lalu Mahendra | obeecreatives',
    type: 'cover',
    imageUrl: '/assets/images/strobist/01_cover_product.jpg',
    imageCaption:
      'Garvinoes Pastel & Olive Series pada blok geometris matte gelap | Photo by Lalu Mahendra / obeecreatives',
    speakerNotes:
      'Buka sesi dengan menegaskan bahwa seluruh foto di materi ini adalah karya asli dari proyek nyata klien. Tekankan mindset utama: Strobist Advanced bukan tentang punya lampu paling mahal, melainkan tahu persis KENAPA dan DI MANA meletakkan cahaya serta memblokir cahaya liar.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'PETA WORKSHOP HARI INI',
    title: 'Workflow Fotografer Produk: Dari Objek hingga Final Shot',
    subtitle: 'Enam tahapan terstruktur sebelum menyentuh tombol shutter hingga siap retouching:',
    type: 'agenda',
    speakerNotes:
      'Jelaskan gambaran besar 6 tahap ini agar peserta paham bahwa fotografer komersial bekerja dengan sistem berurutan (Pre-Shoot Mindset → Object Placement → Kill Ambient → Main → Rim → Fill & Blocker), bukan asal tembak.',
    cards: [
      {
        title: 'Custom Object Analysis',
        body: 'Memahami 4 karakter fisik: Bentuk, Ukuran, Material, dan Warna produk.',
        accent: 'orange',
      },
      {
        title: '3 Kategori Brief Klien',
        body: 'Mengelola Brief Terserah, Brief by Discuss, hingga Brief by Principal.',
        accent: 'teal',
      },
      {
        title: 'Object Placement & Angle',
        body: 'Kunci komposisi terlebih dahulu karena angle menentukan sudut pantulan.',
        accent: 'orange',
      },
      {
        title: 'Step 1–2: Kill Ambient & Main',
        body: 'Menolkan cahaya ruangan lalu membentuk eksposur utama dengan 1 lampu.',
        accent: 'teal',
      },
      {
        title: 'Step 3–5: Rim, Fill & Blocker',
        body: 'Memahat outline produk, menjaga rasio kontras, & membuang flare kaca.',
        accent: 'orange',
      },
      {
        title: 'Studi Kasus Material Ekstrem',
        body: 'Penerapan pada jam tangan kayu-kaca, bezel logam, & tumbler matte hitam.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'FONDASI 1 • MINDSET OBJEK',
    title: 'Produk Adalah "Custom Object" — Butuh Pendekatan Berbeda',
    subtitle:
      'Tidak ada satu resep lighting untuk semua produk. Empat variabel fisik menentukan seluruh setup studio:',
    type: 'concept',
    linkedPollId: 'poll_strobist_material_tersulit',
    imageUrl: '/assets/images/strobist/02_why_product.jpg',
    imagePosition: 'left',
    imageCaption:
      'Konsep kreatif VTG Brodo: memadukan tekstur kanvas, kulit, & properti kertas robek | Photo by Lalu Mahendra / obeecreatives',
    speakerNotes:
      'Luncurkan Live Polling pertama kepada peserta untuk memetakan material apa yang paling sering gagal mereka foto. Lalu jelaskan mengapa 4 faktor (Bentuk, Ukuran, Material, Warna) memaksa kita menyesuaikan ukuran modifier & jarak lampu.',
    cards: [
      {
        title: '1. Bentuk & Ukuran Objek',
        body: 'Produk kecil (jam tangan/cincin) butuh sumber cahaya relatif besar dekat objek agar transisi lembut; objek besar butuh jarak & scrim lebar.',
        accent: 'orange',
      },
      {
        title: '2. Karakter Material',
        body: 'Matte (kayu/kain) menyerap cahaya; sedangkan Glossy, Kaca, & Logam memantulkan lingkungan studio seperti cermin.',
        accent: 'teal',
      },
      {
        title: '3. Warna & Tingkat Kegelapan',
        body: 'Produk gelap butuh separasi tepi (rim light) lebih tegas; warna cerah/neon rawan color cast jika eksposur berlebih.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'PRAKTIK 1 • DIAGNOSIS PRODUK',
    title: 'Bedah 4 Karakteristik Produk Pilihanmu',
    subtitle:
      'Sebelum menyiapkan light stand, petakan dulu titik paling "rewel" dari objek yang akan dipotret:',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    imageUrl: '/assets/images/strobist/04_custom_material.jpg',
    imagePosition: 'right',
    imageCaption:
      'Studi Material Campuran: kayu natural, ring bezel emas reflektif, dial hijau, & kaca jam | Photo by Lalu Mahendra / obeecreatives',
    speakerNotes:
      'Minta peserta menuliskan analisis 1 produk mereka di HP. Gunakan contoh foto jam tangan kayu-emas-hijau ini: ada 4 material berbeda dalam 1 frame (kayu hangat matte, logam emas mengilap, dial hijau gelap, dan kaca cermin).',
    promptLines: [
      'Produk & Bentuk/Ukuran: __________________ | Material Tersulit: __________________',
      'Tantangan Warna / Pantulan: __________________',
    ],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'FONDASI 2 • KATEGORI BRIEF KLIEN',
    title: 'Market, Positioning & 3 Kategori Brief Pemotretan',
    subtitle:
      'Pencahayaan yang "bagus" secara teknis tetap dianggap gagal jika tidak menjawab positioning brand & brief klien:',
    type: 'concept',
    imageUrl: '/assets/images/strobist/16_smartphone_creative_brief.jpg',
    imagePosition: 'right',
    imageCaption:
      'Eksekusi konsep warna senada & efek melayang sesuai positioning produk teknologi modern | Photo by Lalu Mahendra / obeecreatives',
    speakerNotes:
      'Jelaskan 3 kategori brief dari pengalaman nyata Anda menghadapi klien: (1) Brief by Terserah (paling berbahaya jika tidak dikunci pakai moodboard), (2) Brief by Discuss (kolaborasi sehat fotografer-klien), dan (3) Brief by Principal (brand besar sudah punya visual guideline ketat).',
    cards: [
      {
        title: '1. Brief by "Terserah"',
        body: 'Klien menyerahkan 100% konsep ke fotografer. Wajib ubah ke opsi moodboard terukur agar tidak muncul revisi dadakan di akhir.',
        accent: 'orange',
      },
      {
        title: '2. Brief by Discuss',
        body: 'Fotografer & pemilik brand berdiskusi menyepakati konsep, palet warna, properti pendukung, dan arah target pasar.',
        accent: 'teal',
      },
      {
        title: '3. Brief by Principal',
        body: 'Panduan visual, angle wajib, rasio katalog, hingga jarak bayangan sudah ditetapkan oleh brand pusat/agensi.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'PRAKTIK 2 • MANAJEMEN BRIEF',
    title: 'Mengunci Arah Konsep & Moodboard Sebelum Hari H',
    subtitle:
      'Susun batasan kesepakatan klien agar sesi studio berjalan efisien dan bebas salah paham:',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    imageUrl: '/assets/images/strobist/05_brief_discuss.jpg',
    imagePosition: 'left',
    imageCaption:
      'Hasil nyata Brief by Discuss: koleksi peralatan kayu dengan penataan bertingkat & tone hangat harmonis | Photo by Lalu Mahendra',
    speakerNotes:
      'Tunjukkan foto peralatan dapur kayu ini sebagai contoh sukses Brief by Discuss: pemilik brand ingin kesan hangat natural untuk segmen keluarga/homeliving, sehingga properti podium kayu dan lighting lembut dipilih senada.',
    promptLines: [
      'Kategori Brief Proyekmu: __________________ | 2 Poin Kesepakatan Awal Klien: __________________',
    ],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'STARTING POINT • KOMPOSISI',
    title: 'Object Placement & Angle Komposisi Menentukan Setup Lighting',
    subtitle:
      'Urutan wajib di studio: Kunci posisi objek & kamera DULU, baru posisikan lampu & modifier!',
    type: 'concept',
    imageUrl: '/assets/images/strobist/07_angle_komposisi.jpg',
    imagePosition: 'right',
    imageCaption:
      'Sudut 3/4 presisi menonjolkan ketebalan case, kontur kayu zebra, & rantai secara 3 dimensi | Photo by Lalu Mahendra',
    speakerNotes:
      'Banyak pemula memasang lampu dulu lalu memutar-mutar produk atau kamera. Jelaskan mengapa itu keliru: setiap pergeseran sudut kamera beberapa derajat mengubah sudut pantul cahaya ke lensa dan posisi bayangan pada komponen lighting.',
    cards: [
      {
        title: '1. Kunci Tripod & Framing Terlebih Dahulu',
        body: 'Tentukan angle terbaik untuk menampilkan bentuk produk (eye-level, 45°, atau flatlay) lalu kunci tripod + tethering ke laptop.',
        accent: 'orange',
      },
      {
        title: '2. Hukum Sudut Datang = Sudut Pantul',
        body: 'Posisi modifier, diffuser, dan aksesori blocker mengikuti sudut pandang lensa terhadap bidang kaca/logam produk.',
        accent: 'teal',
      },
      {
        title: '3. Kebersihan & Penyangga Produk',
        body: 'Gunakan sarung tangan katun putih, blower, & penyangga akrilik/clay agar produk berdiri kokoh tanpa sidik jari.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'PETA 4 KOMPONEN CAHAYA',
    title: 'Anatomi Setup Strobist: 4 Peran Cahaya di Studio',
    subtitle:
      'Membedah setup BTS nyata di balik pemotretan jam tangan komersial Garvinoes:',
    type: 'concept',
    imageUrl: '/assets/images/strobist/06_komponen_cahaya_bts.jpg',
    imagePosition: 'left',
    imageCaption:
      'BTS Studio obeecreatives: Payung Octa 80cm di atas, 2x Godox Striplight + scrim putih kanan-kiri, & Light Blocker di depan kamera | Photo by Lalu Mahendra',
    speakerNotes:
      'Bedah foto BTS asli Anda di sini! Tunjukkan kepada peserta bagaimana posisi dua kain scrim putih memeluk meja pemotretan, payung Octa 80cm di atas, dua lampu Godox dengan striplight di kanan-kiri, kamera terhubung tethering ke Capture One di laptop, dan satu alat kecil penting: lingkaran hitam Light Blocker yang dijepit di arm samping kamera!',
    cards: [
      {
        title: '1. Main Light (Key)',
        body: 'Sumber cahaya utama pembentuk eksposur dan arah bayangan karakter produk.',
        accent: 'orange',
      },
      {
        title: '2. Rim Light',
        body: 'Cahaya pemisah dari belakang/samping untuk mempertegas garis tepi (outline) objek.',
        accent: 'teal',
      },
      {
        title: '3. Fill Light',
        body: 'Mengisi sisi bayangan gelap agar detail tetap terbaca dengan rasio kontras terjaga.',
        accent: 'orange',
      },
      {
        title: '4. Background Light / Blocker',
        body: 'Mengatur terang-gelap latar serta menahan pantulan liar pada permukaan kaca.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'LIGHTING STEP 1 • KONTROL MUTLAK',
    title: 'Step 1: Kill Ambient Light (Nol-kan Cahaya Ruangan)',
    subtitle:
      'Tidak memasukkan cahaya lampu ruangan atau jendela ke dalam sensor kamera sebelum flash menyala.',
    type: 'comparison',
    imageUrl: '/assets/images/strobist/09_step1_kill_ambient.png',
    imagePosition: 'top',
    imageCaption:
      'Capture One Tethering (Step 1): Frame hitam pekat — bukti 100% cahaya ambient sudah di-kill | Photo by Lalu Mahendra / obeecreatives',
    speakerNotes:
      'Tunjukkan screenshot Capture One asli ini! Di pojok kanan terlihat Garvinoes September 202105577.JPG yang gelap total. Jelaskan bahwa dengan mematikan pengaruh ambient via Shutter Speed (misal 1/200s), Aperture (f/8–f/11), & ISO 100, fotografer memegang kendali penuh atas warna dan bayangan.',
    comparison: {
      leftTitle: 'Jika Ambient Tidak Di-Kill',
      leftBody:
        'Warna produk terkontaminasi lampu neon/ruangan (green/yellow tint), ketajaman bayangan goyah, dan hasil foto berubah-ubah setiap jepretan.',
      rightTitle: 'Setelah Kill Ambient (Frame Gelap Total)',
      rightBody:
        'Sensor hanya merekam 100% cahaya flash strobist Anda. Warna akurat, bayangan presisi, dan konsisten untuk puluhan SKU katalog.',
    },
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'LIGHTING STEP 2 • EKSPOSUR UTAMA',
    title: 'Step 2: Main Light — Membentuk Eksposur & Tekstur Produk',
    subtitle:
      'Nyalakan HANYA 1 lampu utama terlebih dahulu melalui diffuser/scrim untuk membaca arah jatuh cahaya.',
    type: 'concept',
    linkedQuestionIndex: 2,
    imageUrl: '/assets/images/strobist/10_step2_main_light.png',
    imagePosition: 'right',
    imageCaption:
      'Step 2 (Main Light): Serat kayu jam & dial sudah terekspos bersih dari kegelapan | Photo by Lalu Mahendra / obeecreatives',
    speakerNotes:
      'Ajak peserta membandingkan Step 1 dan Step 2 di panel kanan Capture One (5577.JPG → 5561.JPG). Jelaskan fungsi Main Light menggunakan Godox TT685 + Payung Octa 80cm / Scrim untuk menghasilkan transisi cahaya yang lembut pada bodi kayu, sekaligus mencatat di mana area yang masih terasa "mati" (sisi kanan bezel dan area gelap).',
    cards: [
      {
        title: 'Satu Lampu, Satu Fokus Evaluasi',
        body: 'Pastikan kekuatan (power) dan arah Main Light sudah pas mengekspos material utama sebelum menyentuh lampu kedua.',
        accent: 'orange',
      },
      {
        title: 'Baca Area yang Masih Terlalu Gelap',
        body: 'Perhatikan pinggiran kanan bezel & sisi belakang tali jam—area itulah target yang nanti kita pecahkan di Step 3 & Step 4.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'LIGHTING STEP 3 • GARIS TEPI & DIMENSI',
    title: 'Step 3: Rim Light — Mempertegas Outline & Tepi Produk',
    subtitle:
      'Menambahkan sorotan tipis terarah pada sisi pinggir agar produk terasa bervolume dan terpisah dari latar.',
    type: 'concept',
    linkedPollId: 'poll_strobist_tebak_efek',
    imageUrl: '/assets/images/strobist/11_step3_rim_light.png',
    imagePosition: 'left',
    imageCaption:
      'Step 3 (Rim Light): Garis cahaya tegas menyala di tepi kanan bezel & lingkar casing kayu | Photo by Lalu Mahendra / obeecreatives',
    speakerNotes:
      'Aktifkan Live Polling #2 ("Tebak perubahan dari Step 2 ke Step 3") sebelum membongkar jawabannya! Arahkan perhatian peserta ke lingkaran bezel kanan dan tekstur tepi tali jam pada frame 5578.JPG—terlihat kilau outline tipis yang langsung membuat jam terasa 3D.',
    cards: [
      {
        title: 'Fungsi Sculpting (Memahat Bentuk)',
        body: 'Rim light menciptakan garis terang tipis di pinggiran bezel, botol, atau kemasan sehingga bentuk produk langsung "pop out".',
        accent: 'orange',
      },
      {
        title: 'Modifier Pilihan: Striplight + Scrim',
        body: 'Gunakan Godox TT600 + Striplight dari samping-belakang atau pantulkan lewat scrim tipis agar highlight tepi tidak pecah.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'LIGHTING STEP 4 • RASIO BAYANGAN',
    title: 'Step 4: Fill Light — Mengisi Shadow Tanpa Membuat Foto Flat',
    subtitle:
      'Mengangkat detail pada sisi bayangan (bagian kiri/bawah jam), sekaligus mewaspadai munculnya efek samping!',
    type: 'concept',
    imageUrl: '/assets/images/strobist/12_step4_fill_light.png',
    imagePosition: 'right',
    imageCaption:
      'Step 4 (Fill Light): Detail kayu di sisi kiri lebih terang—NAMUN muncul kabut pantulan putih di bagian bawah kaca dial! | Photo by Lalu Mahendra',
    speakerNotes:
      'Ini momen "Aha!" penting di kelas Advanced! Tunjukkan kepada peserta bahwa setelah Fill Light masuk, detail tali kiri memang membaik—TAPI perhatikan kaca dial bagian bawah (angka 5–7): muncul kabut putih (veiling flare / glare) yang menurunkan kontras dial hitam! Mengapa? Karena cahaya fill/scrim memantul langsung ke lensa. Inilah alasan kita butuh Step 5!',
    cards: [
      {
        title: 'Jaga Rasio Main vs Fill',
        body: 'Fill light harus selalu lebih lemah (1–2 stop di bawah Main Light) atau memakai bounce reflector agar dimensi terang-gelap tidak hilang.',
        accent: 'orange',
      },
      {
        title: 'Deteksi Masalah Baru: Glare / Flare Kaca',
        body: 'Perhatikan kaca dial bagian bawah—cahaya lembut yang melebar justru memantul menjadi kabut putih di permukaan kaca!',
        accent: 'teal',
      },
    ],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'LIGHTING STEP 5 • TEKNIK SPESIALIS',
    title: 'Step 5: Light Blocker — Membuang Pantulan Liar Langsung di Kamera',
    subtitle:
      'Gear Setup Nyata: Godox TT685 + Payung Octa 80cm, 2x Godox TT600 + Striplight, & Gobo / Light Blocker hitam.',
    type: 'concept',
    linkedQuestionIndex: 3,
    imageUrl: '/assets/images/strobist/14_gear_blocker_bts.jpg',
    imagePosition: 'left',
    imageCaption:
      'BTS Light Blocker: Karton hitam bulat di boom arm tepat di jalur pantul depan kamera—memblokir flare tanpa masuk frame | Photo by Lalu Mahendra',
    speakerNotes:
      'Tunjukkan foto BTS close-up ini! Jelaskan posisi kartu hitam bulat (Light Blocker) yang dijepit dengan clamp besi tepat di jalur pantul antara lensa dan kaca jam tangan. Tekankan ke peserta: pemula mencoba menghapus kabut kaca di Photoshop (dan warna jarum tetap kusam); fotografer Advanced menyelesaikannya dalam 10 detik di lokasi menggunakan gobo/blocker!',
    cards: [
      {
        title: '1. Setup Gear di Foto Ini',
        body: 'Main Light: Godox TT685 + Payung Octa 80cm | Rim & Fill: 2x Godox TT600 + Striplight | Kontrol pantul: Scrim putih & Light Blocker hitam.',
        accent: 'orange',
      },
      {
        title: '2. Cara Menemukan Titik Blocker',
        body: 'Lihat Live View / layar Tethering, gerakkan karton hitam di antara kamera dan scrim sampai kabut putih pada kaca dial seketika menghilang.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'PERBANDINGAN HASIL AKHIR',
    title: 'Before vs After Light Blocking (Straight Out of Camera)',
    subtitle:
      'Perubahan drastis ketajaman warna dial hitam & jarum detik merah hanya dengan menambahkan 1 Light Blocker hitam:',
    type: 'comparison',
    imageUrl: '/assets/images/strobist/15_final_strobist_shot.png',
    imagePosition: 'top',
    imageCaption:
      'Final Strobist Shot (Step 5): Kaca dial sebening kristal, indeks angka & tekstur kayu kontras tajam sebelum masuk retouching | Photo by Lalu Mahendra',
    speakerNotes:
      'Bandingkan Step 4 (kabut di dial) dengan Step 5 Final Shot ini (5559.JPG / 5584.JPG). Minta peserta mengamati tulisan GARVINOES, jarum detik merah, dan refleksi lembut di alas akrilik putih. Jelaskan bahwa foto bersih seperti ini membuat pekerjaan post-production di modul berikutnya jauh lebih ringan dan cepat.',
    comparison: {
      leftTitle: 'Tanpa Light Blocker (Step 4)',
      leftBody:
        'Bagian kaca dial tampak berkabut keabuan, warna hitam sub-dial terlihat pudar, dan refleksi scrim menimpa logo.',
      rightTitle: 'Dengan Light Blocker (Step 5 Final)',
      rightBody:
        'Kaca bersih transparan tanpa kabut, kontras hitam-kayu-merah sangat tajam, dan highlight bezel tetap terjaga utuh.',
    },
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'STUDI KASUS MATERIAL EKSTREM',
    title: 'Penerapan pada Logam Mengilap & Produk Matte Hitam',
    subtitle:
      'Prinsip Striplight + Scrim + Negative Fill berlaku universal untuk produk elektronik maupun kemasan gelap:',
    type: 'concept',
    linkedQuestionIndex: 4,
    imageUrl: '/assets/images/strobist/19_tumbler_matte_black.jpg',
    imagePosition: 'right',
    imageCaption:
      'Tumbler Matte Hitam di atas batu gelap: gradasi halus striplight & rim tepi memisahkan objek hitam dari latar hitam | Photo by Lalu Mahendra',
    speakerNotes:
      'Gunakan foto Tumbler Matte Hitam ini (ditambah contoh bezel smartphone metal kuning di foto aset 17 jika ingin dibahas lisan/digambar di Flipchart). Ajak peserta membedah di Papan Tulis (Flipchart): bagaimana cara menembakkan striplight pada permukaan silinder hitam tanpa membuat background ikut berubah menjadi abu-abu!',
    cards: [
      {
        title: '1. Gradasi Halus di Bodi Silinder & Metal',
        body: 'Letakkan diffuser/scrim vertikal rapat di samping lampu agar kilau pada sisi tumbler/bezel HP mengalir mulus (smooth gradient), bukan garis patah.',
        accent: 'orange',
      },
      {
        title: '2. Hitam di Atas Latar Hitam',
        body: 'Jauhkan produk dari latar belakang, arahkan rim/strip light dari samping-belakang agar garis siluet kiri-kanan menyala bersih sementara latar tetap pekat.',
        accent: 'teal',
      },
      {
        title: '3. Simulasi Skema di Papan Tulis',
        body: 'Aktifkan Flipchart sekarang untuk menggambar diagram arah lampu (Top-Down Diagram) untuk studi kasus tumbler hitam ini!',
        accent: 'orange',
      },
    ],
  },
  {
    index: 15,
    pageNumber: 16,
    badge: 'PENUTUP & AKSI PRAKTIK',
    title: 'Practice Makes Improvement: Siap Eksekusi di Studio!',
    subtitle:
      'Kunci foto produk kelas komersial adalah disiplin alur cahaya di kamera sebelum masuk ke tahap Retouching A–Z:',
    type: 'closing',
    linkedQuestionIndex: 5,
    imageUrl: '/assets/images/strobist/18_closing_practice.jpg',
    imageCaption:
      'Final Studio Shot: Matte black presenter dengan rim highlight simetris & floor reflection | Photo by Lalu Mahendra / obeecreatives',
    speakerNotes:
      'Tutup sesi dengan foto ikonik presenter hitam berlatar gelap dengan pantulan merah halus di bagian bawah. Minta peserta menuliskan 3 komitmen SOP studio di HP mereka, buka sesi Q&A bila ada kendala gear/ruangan sempit, dan sampaikan bahwa langkah selanjutnya adalah Modul 2: Commercial Product Retouching A–Z (Dari RAW ke Final Image).',
    promptLines: [
      '3 Checklist Wajib Sesi Pemotretan Berikutnya: ____________________________________',
    ],
    cards: [
      {
        title: '1. Kunci Brief & Angle Dulu',
        body: 'Pahami 4 karakter Custom Object & kunci framing tripod sebelum menyalakan satu pun flash.',
        accent: 'orange',
      },
      {
        title: '2. Bangun Cahaya Bertahap',
        body: 'Kill Ambient → Main → Rim → Fill → Light Blocker. Evaluasi tiap langkah lewat Tethering.',
        accent: 'teal',
      },
      {
        title: '3. Lanjut ke Seri 2: Retouching A–Z',
        body: 'Dari file RAW bersih kamera menuju Final Image siap iklan (hapus tali, rapikan gradient, & brand polish).',
        accent: 'orange',
      },
    ],
  },
];

export const STROBIST_LIGHTING_CURRICULUM: SavedMaterial = {
  id: 'strobist_advanced_product_lighting_1',
  seminarTitle: 'Seri Fotografi 1: Strobist Advanced — Product Lighting Mastery',
  organizerName: 'obeeAcademy | obeecreatives Visual Maker',
  description:
    'Modul Spesialis Fotografi Produk Komersial oleh Lalu Mahendra (obeecreatives) dengan studi foto karya asli: Analisis Custom Object, 3 Kategori Brief Klien, Object Placement, serta 5 Langkah Strobist Lighting (Kill Ambient, Main, Rim, Fill, Light Blocker) dengan Godox & Capture One (6 Pertanyaan, 2 Polling, 16 Slide).',
  category: 'Seri Fotografi Produk (Modul 1)',
  isDefault: false,
  createdAt: 1734100000000,
  updatedAt: 1734200000000,
  content: {
    seminarTitle: 'Seri Fotografi 1: Strobist Advanced — Product Lighting Mastery',
    organizerName: 'obeeAcademy | obeecreatives Visual Maker',
    questions: STROBIST_QUESTIONS,
    polls: STROBIST_POLLS,
    slides: STROBIST_SLIDES,
    qnaTopics: [
      'Kill Ambient & Sync Speed',
      'Modifier (Octa, Striplight, Scrim)',
      'Light Blocker & Pantulan Kaca',
      'Komposisi & Angle Produk',
      'Manajemen Brief Klien',
    ],
    brandTheme: {
      presetId: 'preset_strobist_studio',
      name: 'Studio Fotografi (Dark Slate & Crimson)',
      primaryColor: '#171E2B',
      accentColor: '#C81E32',
      secondaryColor: '#0F766E',
      bgColor: '#F8FAFC',
    },
    updatedAt: 1734200000000,
    materialId: 'strobist_advanced_product_lighting_1',
    description:
      'Modul Spesialis Fotografi Produk oleh Lalu Mahendra (obeecreatives) menggunakan foto karya asli: Custom Object, Kategori Brief, Kill Ambient, Main/Rim/Fill Light, & Light Blocker.',
    category: 'Seri Fotografi Produk (Modul 1)',
    isDefault: false,
    createdAt: 1734100000000,
  },
};
