import {
  WorksheetQuestion,
  LivePollConfig,
  SlideDefinition,
} from './seminarData';
import { SavedMaterial } from '../types';
import { DEFAULT_BRAND_THEME } from '../brandTheme';

const SESI_6_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Audit Chat Terakhir yang Gagal Closing',
    coreLearning:
      'Kebocoran terbesar omzet UMKM sering bukan karena produk jelek, melainkan karena cara membalas chat yang langsung memutus percakapan',
    questionText:
      'Ingat 1 chat calon pembeli terakhir yang batal membeli: Apa yang ditanyakan pembeli, bagaimana persisnya kamu menjawab saat itu, dan apa kira-kira penyebab percakapannya terhenti?',
    secondaryPrompt:
      'Contoh jujur: Pembeli tanya "Harga berapa kak?", lalu dijawab mentah "Rp15.000 kak belum ongkir" tanpa menanyakan kebutuhan atau menawarkan paket.',
    exampleAnswer:
      'Pembeli tanya "Yoghurt 250ml berapa ya?", saya cuma balas "Rp15.000 per botol kak". Setelah itu cuma dibaca (centang biru) dan tidak membalas lagi karena saya tidak menjelaskan beda kualitas & tidak menawarkan Paket Keluarga.',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa (F&B)',
    helperTips: [
      'Menjawab harga mentah memaksa otak pembeli langsung membandingkan angka dengan lapak termurah.',
      'Jangan salahkan pembeli yang menghilang; perbaiki alur jawabannya agar mereka merasa dipandu.',
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Menyusun Skrip 4 Langkah S-A-P-A + 3 Opsi Paket Bertingkat',
    coreLearning:
      'Memberikan 3 opsi paket bertingkat mengubah pertanyaan pembeli dari "Jadi beli atau tidak?" menjadi "Mau ambil paket yang mana?"',
    questionText:
      'Tulis skrip balasan WA pembuka memakai rumus S-A-P-A: [Sambut + Tanya Konteks] → [Angkat 1 Nilai Produk] → [3 Pilihan Paket: Satuan / Paling Laku / Lengkap] → [Tanya Jadwal Kirim/Ambil]!',
    secondaryPrompt:
      'Gunakan panggilan sapaan wajib dari Brand Kit Sesi 4 dan pastikan harga paket tetap menjaga margin sehat Sesi 2.',
    exampleAnswer:
      '"Halo Bun! Boleh tahu untuk stok camilan keluarga atau acara arisan ya? Yoghurt kami fermentasi 12 jam tanpa pemanis buatan & segel higienis: 1) Satuan Rp15rb | 2) Paling Laris: Paket Keluarga 5 Botol Rp70rb (gratis ice pack) | 3) Paket Hemat 10 Botol Rp135rb. Mau ikut pengiriman sore jam 4 atau besok pagi Bun?"',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Untuk Kriya: Paket 1 (Tas saja) vs Paket 2 (Tas + Dompet Koin + Box Kado) vs Paket 3 (Paket Hampers Lengkap + Kartu Nama Penerima).',
      'Untuk Persewaan: Paket 1 (Unit Saja) vs Paket 2 (Unit + Instalasi + Antar Jemput) vs Paket 3 (Paket Full 2 Hari + Cadangan Unit).',
    ],
    linkedSlideIndex: 5,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Merancang Kalimat Upsell Ringan (Naikkan Nilai Keranjang)',
    coreLearning:
      'Menawarkan tambahan kecil yang relevan saat pembeli sudah siap membayar jauh lebih mudah daripada mencari pembeli baru',
    questionText:
      'Saat pembeli hanya memesan 1 unit eceran atau paket terkecil, tulis 1 KALIMAT TAWARAN TAMBAHAN (Upsell/Cross-Sell) yang terasa membantu (bukan memaksa)!',
    secondaryPrompt:
      'Kaitkan dengan efisiensi ongkir, kelengkapan hadiah, atau keamanan acara agar pembeli merasa diuntungkan.',
    exampleAnswer:
      '"Siap Bun untuk 1 pouch Keripik Tempe Rp16rb! Sekalian tambah 1 varian Balado atau pilih Paket 3 Pouch Rp45rb biar sekalian hemat ongkir dan aman buat stok seminggu di rumah Bun?"',
    exampleBusiness: 'Keripik Tempe Kriuk (F&B)',
    helperTips: [
      'Contoh Kriya: "Mumpung masih satu box kirim, mau sekalian tambah kartu ucapan custom & gantungan kunci rajut serasi cuma nambah Rp15rb Kak?"',
      'Contoh Persewaan: "Untuk tanggal 18 masih tersedia, sekalian ambil Paket Sound + 2 Mic Wireless biar acara lebih aman gak perlu sewa terpisah Kak?"',
    ],
    linkedSlideIndex: 7,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Skrip Menjawab Keberatan ("Mahal" & "Tanya Dulu") Tanpa Diskon',
    coreLearning:
      'Kalimat "mahal" sering bukan penolakan, melainkan tanda pembeli belum melihat nilai pembedanya dibanding barang murah',
    questionText:
      'Tulis jawaban eleganmu tanpa banting harga untuk 2 keberatan paling sering muncul: [A. "Kok lebih mahal dari toko sebelah?"] dan [B. "Saya tanya suami/panitia dulu ya"]!',
    secondaryPrompt:
      'Pakai teknik L-E-G-A: Luruskan dengan empati (setujui sudut pandangnya dulu), lalu geser ke nilai pembeda atau beri opsi porsi lebih ringan.',
    exampleAnswer:
      'A (Mahal): "Betul Kak, di luar memang ada yang lebih murah. Bedanya, tas kami pakai benang katun premium lapis furing tebal & jaminan jahitan rapi siap kado—kalau mau opsi lebih hemat, ada seri Mini Pouch Rp65rb Kak!" | B (Tanya Dulu): "Siap Kak silakan didiskusikan! Biar gampang ditunjukkan ke pasangan/panitia, ini saya kirimkan ringkasan 2 opsi paket + foto detailnya ya. Slot tanggalnya saya tandai sementara sampai jam 5 sore ini."',
    exampleBusiness: 'Tas Rajut Senja & Sewa Alat Event RapiJaya',
    helperTips: [
      'Jangan pernah berdebat atau terdengar tersinggung saat ditawar—sikap tenang justru membuktikan kelas merekmu.',
      'Untuk keberatan "tanya dulu", bantu berikan ringkasan visual/teks singkat agar mudah mereka teruskan ke pengambil keputusan.',
    ],
    linkedSlideIndex: 10,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Template Follow-Up Sopan H+1 & H+3 untuk Chat Menggantung',
    coreLearning:
      'Mayoritas calon pembeli yang diam sebenarnya lupa atau sibuk—sapaan ulang yang membantu menyelamatkan puluhan persen omzet yang hilang',
    questionText:
      'Tulis 2 template pesan Follow-Up yang ramah dan tidak memaksa: [1. Follow-Up H+1 (Bantu Ingatkan Jadwal/Stok)] dan [2. Follow-Up H+3 (Beri Bukti Baru/Testimoni)]!',
    secondaryPrompt:
      'Simpan kedua kalimat ini di fitur "Quick Reply / Balas Cepat" WhatsApp Business agar bisa dikirim dalam 5 detik.',
    exampleAnswer:
      'H+1: "Halo Bun, izin meneruskan chat kemarin ya—siang ini kulkas pengiriman rute komplek Bunda mau berangkat jam 3 sore. Masih ada 2 Paket Keluarga segar, mau sekalian diselipkan?" | H+3: "Halo Bun, sekadar berbagi info kalau batch minggu ini baru matang dengan rasa stroberi segar & ada testimoni ibu-ibu PAUD kemarin. Kabari saja kalau minggu ini lagi butuh stok ya Bun!"',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Jangan pernah mengirim kata "P", "Jadi gak kak?", atau "Kok gak dibalas?" karena langsung merusak citra merek.',
      'Selalu bawa alasan baru yang bermanfaat di setiap follow-up (jadwal kirim, sisa slot, atau testimoni terbaru).',
    ],
    linkedSlideIndex: 12,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Skrip Cek Kepuasan H+2 & Sistem Repeat Order Pelanggan',
    coreLearning:
      'Biaya mempertahankan pelanggan lama jauh lebih murah daripada mencari pelanggan baru—pembelian ke-2 dan ke-3 adalah sumber laba bersih terbesar',
    questionText:
      'Tulis 1 pesan cek kepuasan H+2 setelah barang diterima + 1 jadwal sapaan Repeat Order berkala sesuai siklus habis pakai/kebutuhan usahamu!',
    secondaryPrompt:
      'Gunakan label kontak WhatsApp ([Calon Tanya], [Pernah Beli], [Langganan VIP]) agar tidak lupa menyapa kembali.',
    exampleAnswer:
      'H+2: "Halo Bun, gimana yoghurt yang kemarin diterima—aman dingin & anak-anak suka rasanya? Kalau ada masukan boleh langsung kabari ya Bun!" | Jadwal Repeat Order (Tiap Hari ke-10): Sapa khusus kontak label [Pernah Beli]: "Halo Bun, stok yoghurt di kulkas sudah mau habis ya? Khusus pelanggan lama minggu ini bebas pilih mix 5 rasa di Paket Keluarga!"',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Untuk Kriya: sapa ulang pelanggan lama menjelang momen Wisuda, Lebaran, Natal, atau tawarkan warna seri terbaru lebih dulu sebelum diunggah ke umum.',
      'Untuk Persewaan: simpan tanggal acara klien tahun ini dan sapa kembali 1–2 bulan sebelum tanggal yang sama tahun depan atau saat ada acara kantor berikutnya.',
    ],
    linkedSlideIndex: 14,
  },
  {
    index: 6,
    sectionNumber: 7,
    sectionTitle: '7. Komitmen Eksekusi Playbook Selling 7 Hari ke Depan',
    coreLearning:
      'Keseluruhan ilmu Sesi 1–6 baru berubah menjadi uang di rekening saat skrip balas chat, label database, dan follow-up rutin benar-benar dipraktikkan setiap hari',
    questionText:
      'Tulis 3 langkah Selling yang PASTI kamu terapkan dalam 7 hari ke depan (termasuk merapikan Quick Reply WA, memberi label kontak, dan menyapa ulang chat lama)!',
    secondaryPrompt:
      'Targetkan langsung hasil nyata di minggu pertama dari tumpukan chat lama yang belum sempat di-follow-up.',
    exampleAnswer:
      '1. Malam ini simpan 5 template skrip S-A-P-A, jawaban keberatan, & follow-up ke Quick Reply WhatsApp Business. 2. Besok pagi beri label 30 kontak chat terakhir yang sempat bertanya. 3. Lakukan follow-up sopan ke minimal 15 chat menggantung/pelanggan lama minggu ini.',
    exampleBusiness: 'Semua UMKM PartnerUp',
    helperTips: [
      'Ukur angka closing-mu tiap Minggu malam: dari 20 chat masuk, berapa yang berhasil transfer berkat skrip baru ini?',
      'Selamat! Dengan beresnya Sesi 1–6, kamu kini punya sistem utuh: Value Proposition → Target & Margin → Branding → Marketing → Selling.',
    ],
    linkedSlideIndex: 15,
  },
];

const SESI_6_POLLS: LivePollConfig[] = [
  {
    id: 'poll_s6_momen_chat_mati',
    title: 'Di Titik Mana Calon Pembeli Paling Sering Menghilang Saat Chat?',
    subtitle: 'Pilih situasi yang paling sering terjadi di WhatsApp atau DM tokomu selama ini:',
    linkedSlideIndex: 2,
    type: 'bar',
    options: [
      {
        id: 'opt_tanya_harga_ilang',
        label: '1. Baru tanya harga, setelah saya jawab langsung dibaca saja (ghosting)',
        subtitle: 'Chat terputus tepat setelah angka harga dikirim',
        category: 'rational',
      },
      {
        id: 'opt_bilang_mahal',
        label: '2. Sering membandingkan harga: "Kok lebih mahal dari toko sebelah?"',
        subtitle: 'Terpaksa menurunkan harga atau kehilangan pembeli karena ragu jawabnya',
        category: 'rational',
      },
      {
        id: 'opt_nanti_kabari',
        label: '3. Bilang "Nanti saya kabari lagi ya", lalu menghilang selamanya',
        subtitle: 'Canggung menyapa ulang karena takut dikira memaksa/mengemis',
        category: 'emotional',
      },
      {
        id: 'opt_beli_cuma_sekali',
        label: '4. Sudah closing, tapi cuma ambil 1 pcs & belum pernah pesan ulang',
        subtitle: 'Belum punya sistem naik paket (upsell) dan follow-up repeat order',
        category: 'rational',
      },
    ],
  },
  {
    id: 'poll_s6_keberatan_tersulit',
    title: 'Keberatan Pembeli Mana yang Paling Sulit Kamu Jawab Tanpa Potong Harga?',
    subtitle: 'Pilih satu pertanyaan/komentar pembeli yang paling sering membuatmu ragu membalas:',
    linkedSlideIndex: 9,
    type: 'bar',
    options: [
      {
        id: 'opt_keberatan_mahal',
        label: '1. "Di sebelah harganya jauh lebih murah kak!"',
        subtitle: 'Bingung membela kualitas tanpa terdengar marah atau defensif',
        category: 'rational',
      },
      {
        id: 'opt_keberatan_ongkir',
        label: '2. "Duh ongkirnya mahal ya, bisa gratis ongkir gak?"',
        subtitle: 'Takut untung habis terpotong ongkos kirim',
        category: 'rational',
      },
      {
        id: 'opt_keberatan_tanya_pasangan',
        label: '3. "Saya tanya suami / istri / panitia dulu ya kak"',
        subtitle: 'Chat berhenti karena pengambil keputusannya orang lain',
        category: 'emotional',
      },
      {
        id: 'opt_keberatan_ragu_kualitas',
        label: '4. "Takut rasanya gak cocok / barang aslinya gak sesuai ekspektasi"',
        subtitle: 'Calon pembeli masih ragu melakukan transaksi pertama kali',
        category: 'emotional',
      },
    ],
  },
];

const SESI_6_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'SESI 6 PARTNERUP: SPESIALIS SELLING & CLOSING',
    title: 'Selling UMKM: Seni Percakapan Closing, Atasi Keberatan & Mesin Repeat Order',
    subtitle:
      'Setelah Chat Masuk Ramai dari Sesi 5: Cara Mengubah Pertanyaan Jadi Transfer Tanpa Banting Harga, Menaikkan Nilai Keranjang & Mengunci Pembelian Ulang — PartnerUp | obeeAcademy',
    type: 'cover',
    speakerNotes:
      'Buka Sesi 6 sebagai babak final penentu arus kas dari rangkaian PartnerUp. Tarik benang merah cepat: Sesi 4 (Branding) sudah bikin wajah toko terpercaya; Sesi 5 (Marketing) sudah mendatangkan chat masuk ke WhatsApp. Hari ini tugas SELLING adalah memastikan setiap chat masuk diolah dengan elegan menjadi transfer paket bundling dan pelanggan repeat order.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'DIAGNOSA KASIR PASIF VS PEMANDU SOLUSI',
    title: 'Kenapa Chat Masuk Ramai Tapi Rekening Tetap Sepi?',
    subtitle:
      'Kesalahan terbesar UMKM di garis finis: sudah susah payah memancing orang chat, tetapi membalasnya seperti robot pembaca daftar harga!',
    type: 'comparison',
    imageUrl: '/assets/images/sesi6_alur_closing_wa_1795488348753.jpg',
    imageCaption:
      'Kiri: Membalas chat dengan harga mentah membuat pembeli langsung pergi. Kanan: Percakapan hangat + 3 pilihan paket mengunci transaksi closing.',
    imagePosition: 'top',
    speakerNotes:
      'Gunakan ilustrasi kiri vs kanan ini. Jelaskan bedanya penjual pasif yang cuma melempar angka ("Rp15.000 kak") dengan Pemandu Solusi: begitu kita membalas dengan pertanyaan ringan, mengangkat nilai pembeda, dan menyodorkan 3 opsi paket, pembeli merasa dibantu memilih, bukan sekadar ditagih uang.',
    comparison: {
      leftTitle: 'Gaya "Mesin Jawab Harga" (Sering Ghosting)',
      leftBody:
        '• Pembeli tanya harga → langsung dijawab angka mentah tanpa penjelasan nilai.\n• Tidak menggali acara/kebutuhan pembeli.\n• Saat pembeli diam, dibiarkan begitu saja tanpa follow-up.',
      rightTitle: 'Gaya "Pemandu Solusi" (Tinggi Closing)',
      rightBody:
        '• Menyambut hangat sesuai karakter merek & menggali kebutuhan.\n• Menyajikan 3 pilihan paket bertingkat agar nilai transaksi lebih besar.\n• Menutup percakapan dengan pilihan jadwal kirim/transfer yang jelas.',
    },
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'POLLING 1: PETA KEBOCORAN CHAT',
    title: 'Di Kalimat Mana Calon Pembelimu Paling Sering Menghilang Saat Chat?',
    subtitle:
      'Jawab jujur lewat HP agar kita membedah titik kebocoran closing yang paling banyak dialami kelas hari ini:',
    type: 'concept',
    linkedPollId: 'poll_s6_momen_chat_mati',
    speakerNotes:
      'Jalankan Polling 1. Validasi pengalaman peserta: hampir semua UMKM pernah merasakan keempat momen ini. Tunjukkan bahwa masing-masing gejala punya "skrip obatnya" masing-masing yang akan kita praktikkan hari ini.',
    cards: [
      {
        title: '1. Tanya Harga Lalu Ghosting',
        body: 'Obatnya: tahan dulu angka mentahnya—sambut, tanya kebutuhan, & tunjukkan nilai baru paketnya.',
        accent: 'orange',
      },
      {
        title: '2. Dibandingkan Toko Sebelah',
        body: 'Obatnya: jangan balas emosi/diskon—pakai teknik L-E-G-A menjelaskan pembeda & opsi hemat.',
        accent: 'teal',
      },
      {
        title: '3. "Nanti Saya Kabari Lagi"',
        body: 'Obatnya: jangan biarkan menggantung—pasang skrip Follow-Up sopan H+1 & H+3 di Quick Reply.',
        accent: 'orange',
      },
      {
        title: '4. Cuma Beli 1x & Eceran',
        body: 'Obatnya: tawarkan upsell paket saat checkout + sapaan H+2 & jadwal Repeat Order berkala.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'PRAKTIK 1: AUDIT CHAT TERAKHIR',
    title: 'Bedah 1 Chat Terakhirmu yang Tidak Jadi Transfer',
    subtitle:
      'Lihat ulang riwayat WhatsApp/DM terakhirmu secara objektif: apa kalimat terakhir yang kamu kirim sebelum pembeli menghilang?',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    speakerNotes:
      'Minta peserta membuka HP mereka sebentar dan mengingat/melihat 1 chat batal beli terakhir. Minta 2 orang membacakannya secara sukarela untuk langsung dibedah bersama di depan kelas.',
    promptLines: [
      'Pertanyaan Pembeli: _________ | Balasanku Saat Itu: _________ | Penyebab Terhenti: _________',
    ],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'PILAR 1: RUMUS CLOSING 4 LANGKAH (S-A-P-A)',
    title: 'Rumus S-A-P-A: Mengubah "Tanya Harga" Menjadi "Kunci Pesanan"',
    subtitle:
      'Gunakan urutan 4 langkah sederhana ini setiap kali ada chat atau pembeli baru datang bertanya:',
    type: 'formula',
    speakerNotes:
      'Pecah rumus S-A-P-A satu per satu di papan tulis. Tekankan aturan emas huruf terakhir ("A — Arahkan Keputusan"): JANGAN pernah mengakhiri chat dengan kalimat pasif seperti "Silakan kabari kalau minat ya kak". Akhiri dengan pertanyaan 2 pilihan ("Mau dikirim sore ini atau besok pagi?").',
    cards: [
      {
        title: 'S — Sambut & Gali Konteks',
        body: '"Halo Bun! Boleh tahu untuk stok camilan anak di rumah atau buat acara kumpul ya?"',
        accent: 'teal',
      },
      {
        title: 'A — Angkat Nilai Sebelum Angka',
        body: '"Yoghurt kami tanpa pemanis buatan & segel dingin harian, Bun. Pilihannya ada 3:"',
        accent: 'orange',
      },
      {
        title: 'P — Pilihan 3 Paket Bertingkat',
        body: '1) Satuan Rp15rb | 2) Paket Paling Laris 5 Botol Rp70rb (+ice gel) | 3) Paket 10 Botol Rp135rb.',
        accent: 'teal',
      },
      {
        title: 'A — Arahkan Keputusan Cepat',
        body: '"Bunda lebih pas yang Paket 5 Botol atau 10 Botol? Mau diantar jam 4 sore ini atau besok?"',
        accent: 'orange',
      },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'PRAKTIK 2: SUSUN SKRIP S-A-P-A',
    title: 'Tulis Skrip S-A-P-A + 3 Pilihan Paket untuk Produk Andalanmu',
    subtitle:
      'Pastikan kamu menyematkan sapaan dari Brand Kit Sesi 4 dan hitungan paket bundling bermargin sehat dari Sesi 2:',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    speakerNotes:
      'Beri waktu 4 menit agar peserta menulis skrip lengkap untuk produk andalannya. Sorot contoh dari kategori F&B, Kriya, dan Jasa Persewaan untuk memastikan ketiganya punya 3 tingkat pilihan paket yang menarik.',
    promptLines: [
      'Skrip S-A-P-A Lengkap (Sambut → Nilai → 3 Paket → Pertanyaan Kunci): ________________',
    ],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'STRATEGI PSIKOLOGI PAKET & UPSELL',
    title: 'Trik 3 Pilihan Paket & Upsell Ringan: Naikkan Omzet 30%–50% Tanpa Pembeli Baru',
    subtitle:
      'Pembeli tidak suka dipaksa membeli lebih banyak, tapi mereka sangat suka merasa "lebih untung" saat memilih paket tengah!',
    type: 'concept',
    speakerNotes:
      'Jelaskan cara kerja psikologi 3 pilihan: opsi termurah jadi pembanding dasar, opsi termahal jadi jangkar kualitas, sehingga sebagian besar pembeli otomatis memilih Opsi Tengah (Paket Bundling Paling Laris). Tambahkan contoh kalimat upsell ringan di detik sebelum transfer.',
    cards: [
      {
        title: 'F&B: Hemat Ongkir & Stok Kulkas',
        body: 'Paket 5 Botol + free ice pack vs satuan. Upsell ringan: "Sekalian tambah 1 keripik tempe biar gak kena ongkir ulang ya Bun?"',
        accent: 'orange',
      },
      {
        title: 'Kriya: Siap Jadi Kado Bermakna',
        body: 'Tas saja vs Tas + Dompet + Box Kado. Upsell ringan: "Tambah Rp15rb sudah siap kado pakai pita & kartu ucapan nama lho Kak!"',
        accent: 'teal',
      },
      {
        title: 'Jasa Sewa: Bebas Repot Acara',
        body: 'Unit saja vs Paket Lengkap + Antar Pasang + Cadangan. Upsell ringan: "Sekalian tambah 2 hari sewa cuma nambah setengah harga harian Kak."',
        accent: 'orange',
      },
    ],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'PRAKTIK 3: KALIMAT UPSELL CERDAS',
    title: 'Rancang 1 Kalimat Upsell yang Terdengar Membantu Pembeli',
    subtitle:
      'Tulis 1 kalimat penawaran tambahan yang langsung bisa diselipkan saat pembeli memesan varian satuan/terkecil:',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    speakerNotes:
      'Tekankan kata kuncinya: alasan upsell harus selalu menguntungkan pembeli (hemat ongkir, siap kado, atau bikin acara aman)—bukan semata keinginan penjual menambah omzet.',
    promptLines: [
      'Kalimat Upsell Ringan (Alasan Menguntungkan Pembeli): ____________________________',
    ],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'PILAR 2: ATASI KEBERATAN TANPA DISKON',
    title: 'Teknik L-E-G-A: Menjawab "Mahal Ya" & "Pikir-Pikir Dulu" Tanpa Banting Harga',
    subtitle:
      'Menurunkan harga di tengah chat hanya membuktikan bahwa hargamu sebelumnya memang terlalu mahal. Hadapi dengan tenang dan terstruktur!',
    type: 'comparison',
    speakerNotes:
      'Ajarkan rumus L-E-G-A (Luruskan dengan Empati → Edukasi Pembeda Nyata → Geser ke Hitungan Manfaat/Alternatif → Ajak Langkah Kecil). Tegaskan bahwa jika memang budget pembeli terbatas, tawarkan ukuran/paket yang lebih kecil (down-sell), JANGAN potong harga produk utama!',
    comparison: {
      leftTitle: 'Kesalahan Saat Ditawar Pembeli',
      leftBody:
        '• Tersinggung & membela diri kaku ("Bahan kami asli memang mahal kak!").\n• Langsung panik membanting harga hingga margin habis.\n• Membiarkan pembeli pergi tanpa menawarkan opsi ukuran yang sesuai budget.',
      rightTitle: 'Teknik L-E-G-A (Tenang & Menjaga Margin)',
      rightBody:
        '• EMPATI: "Betul Kak, memang ada selisih harga di pasaran..."\n• EDUKASI: "Selisih Rp3rb itu untuk segel higienis & garansi ganti baru bila rusak."\n• ALTERNATIF: "Kalau mau hemat ongkir/harga, ambil Paket 5 jadi Rp14rb/botol—atau coba dulu Paket Trial 3 botol!"',
    },
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'POLLING 2: KEBERATAN TERSULIT',
    title: 'Keberatan Pembeli Mana yang Paling Sering Bikin Negosiasi Mandek?',
    subtitle:
      'Pilih tantangan negosiasi paling berat menurutmu saat ini agar kita susun jawaban jitunya bersama:',
    type: 'concept',
    linkedPollId: 'poll_s6_keberatan_tersulit',
    speakerNotes:
      'Jalankan Polling 2 lalu tampilkan masing-masing jurus jawabnya: untuk Ongkir mahal -> ubah jadi syarat minimum gratis/subsidi ongkir lewat paket bundling; untuk Tanya Pasangan/Panitia -> kirim ringkasan 1 gambar + 2 opsi paket siap forward; untuk Ragu Kualitas -> tawarkan Paket Trial kecil + garansi ganti baru.',
    cards: [
      {
        title: '1. "Sebelah Lebih Murah"',
        body: 'Jawab dengan L-E-G-A: validasi, tunjukkan 1 bukti pembeda fisik, & tawarkan paket hemat/trial.',
        accent: 'orange',
      },
      {
        title: '2. "Ongkirnya Mahal Ya"',
        body: 'Jadikan pemicu bundling: "Ambil Paket 5 kami subsidi ongkir Rp10rb, jadi jauh lebih hemat Kak!"',
        accent: 'teal',
      },
      {
        title: '3. "Tanya Suami/Panitia Dulu"',
        body: 'Bantu dengan 1 kartu ringkasan paket siap diteruskan + beri batas pegang slot waktu yang sopan.',
        accent: 'orange',
      },
      {
        title: '4. "Takut Gak Cocok"',
        body: 'Tunjukkan 1 testimoni nyata + tawarkan Paket Trial kecil yang dilengkapi garansi kepuasan.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'PRAKTIK 4: BANK JAWABAN KEBERATAN',
    title: 'Tulis Jawaban Siap Pakai untuk 2 Keberatan Terbanyak Usahamu',
    subtitle:
      'Siapkan kalimat tenang dan berkelas agar saat pembeli menguji harga, kamu tinggal klik kirim tanpa bimbang:',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    speakerNotes:
      'Minta peserta menuliskan 2 skrip jawaban keberatan paling sering di bisnisnya. Ajak 2 peserta berpasangan berlatih membaca dialog ini dengan nada ramah agar terasa natural.',
    promptLines: [
      'Jawaban A (Saat Bilang Mahal): _________ | Jawaban B (Saat Tanya Pasangan/Panitia): _________',
    ],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'PILAR 3: FOLLOW-UP SOPAN PENYELAMAT OMZET',
    title: 'Jangan Takut Sapa Ulang! Jurus Follow-Up H+1 & H+3 yang Tetap Berkelas',
    subtitle:
      'Sebagian besar chat batal beli bukan karena mereka membenci produkmu, melainkan karena chat tenggelam saat mereka mengurus kerjaan atau anak!',
    type: 'formula',
    speakerNotes:
      'Hapus ketakutan peserta bahwa follow-up itu "mengemis". Bedakan antara tagihan memaksa ("Jadi gak kak?") dengan follow-up bernilai tambah yang sopan: selalu bawa informasi baru (jadwal pengiriman rute mereka, stok segar baru matang, atau foto testimoni terbaru) dan beri ruang mundur yang elegan di H+7.',
    cards: [
      {
        title: 'H+1: Kabari Jadwal Kirim/Stok',
        body: '"Halo Bun, siang ini ada kiriman arah komplek Bunda jam 3 sore. Masih ada 2 Paket Keluarga segar, mau sekalian diselipkan?"',
        accent: 'teal',
      },
      {
        title: 'H+3: Bagikan Bukti/Testimoni',
        body: '"Halo Kak, baru saja selesai packing pesanan kado batch hari ini (kirim foto rapi). Kabari saja kalau minggu ini sudah siap pilih warnanya ya!"',
        accent: 'orange',
      },
      {
        title: 'H+7: Tutup Sopan & Jaga Pintu',
        body: '"Jika minggu ini belum sempat, nomor kami siap disimpan ya Kak. Kapan pun ada acara nanti, langsung chat saja!"',
        accent: 'teal',
      },
    ],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'PRAKTIK 5: QUICK REPLY FOLLOW-UP',
    title: 'Buat 2 Template Follow-Up H+1 & H+3 untuk Quick Reply WhatsApp',
    subtitle:
      'Tulis dengan bahasa natural khas tokomu agar besok pagi kamu siap menyapa kembali chat yang menggantung minggu ini:',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    speakerNotes:
      'Ingatkan peserta untuk langsung memindahkan dua skrip ini ke fitur Quick Reply (Balas Cepat) WhatsApp Business setelah kelas selesai nanti malam.',
    promptLines: [
      'Template Follow-Up H+1: _______________ | Template Follow-Up H+3: _______________',
    ],
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'PILAR 4: MESIN REPEAT ORDER & DATABASE WA',
    title: 'Uang Terbesar Ada di Pembelian Kedua! Bangun Mesin Repeat Order',
    subtitle:
      'Menjual lagi ke pelanggan yang sudah puas jauh lebih mudah dan berbiaya Rp0 dibanding terus-terusan mencari orang asing!',
    type: 'concept',
    imageUrl: '/assets/images/sesi6_mesin_repeat_order_1795488350504.jpg',
    imageCaption:
      'Siklus Repeat Order UMKM: Penyerahan Paket Rapi → Sapaan Cek Kepuasan H+2 → Pembeli Puas Pesan Lagi → Catat Label Kontak & Ajak Teman',
    imagePosition: 'top',
    speakerNotes:
      'Tunjukkan roda siklus Repeat Order ini. Ajarkan 3 kebiasaan sederhana yang membuat WhatsApp UMKM berubah menjadi mesin uang jangka panjang: (1) Beri label kontak 3 warna ([Calon Tanya], [Pernah Beli], [Langganan VIP]), (2) Wajib chat cek kepuasan H+2 setelah barang diterima (ini juga memanen testimoni asli!), (3) Sapa kembali sesuai siklus habis pakai produknya.',
    cards: [
      {
        title: '1. Label 3 Status Kontak WA',
        body: 'Pisahkan [Calon Tanya], [Pernah Beli], & [Langganan VIP] supaya pesan penawaranmu tepat sasaran.',
        accent: 'orange',
      },
      {
        title: '2. Sapaan Cek Kepuasan H+2',
        body: '"Halo Bun, paket kemarin aman & cocok rasanya?" — menjaga kepercayaan sekaligus memanen testimoni.',
        accent: 'teal',
      },
      {
        title: '3. Sapa Ulang Sesuai Siklus Produk',
        body: 'F&B setiap 10 hari (stok habis); Kriya jelang hari raya/momen kado; Sewa H-45 event berulang klien.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'PRAKTIK 6: ALUR H+2 & REPEAT ORDER',
    title: 'Susun Pesan Cek Kepuasan H+2 & Jadwal Sapaan Repeat Order Usahamu',
    subtitle:
      'Kapan biasanya produkmu habis atau pelanggan lamamu butuh lagi? Tetapkan jadwal sapaannya dari sekarang:',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    speakerNotes:
      'Minta peserta menuliskan pesan H+2 + siklus hari keberapa pelanggan mereka idealnya disapa ulang. Beri penekanan untuk kategori Kriya & Jasa Persewaan bahwa pelanggan lama juga bisa diajak program referral teman jika produknya awet bertahun-tahun.',
    promptLines: [
      'Pesan Cek Kepuasan H+2: _____________ | Siklus & Pesan Repeat Order: _____________',
    ],
  },
  {
    index: 15,
    pageNumber: 16,
    badge: 'PENUTUP TRILOGI PARTNERUP (SESI 1–6)',
    title: 'Playbook Selling Selesai! Saatnya Putar Mesin Omzet Usahamu Mulai Besok',
    subtitle:
      'Selamat! Dari Value Proposition (Sesi 1), Target & Margin (Sesi 2), Peta BMS (Sesi 3), Branding (Sesi 4), Marketing (Sesi 5), hingga Selling (Sesi 6)—semua rantai kini tersambung utuh!',
    type: 'closing',
    linkedQuestionIndex: 6,
    speakerNotes:
      'Tutup keseluruhan seri dengan penuh energi dan apresiasi. Ajak peserta melihat gambaran besar yang sudah mereka bangun selama 6 sesi, lalu kunci komitmen aksi Selling 7 hari ke depan: pasang Quick Reply di WA Business, rapikan label kontak, dan langsung eksekusi follow-up ke 15 chat/pelanggan lama minggu ini agar hasilnya langsung terasa di rekening!',
    promptLines: [
      '3 Komitmen Eksekusi Playbook Selling dalam 7 Hari ke Depan: ____________________',
    ],
    cards: [
      {
        title: 'Aksi 1: Quick Reply WA',
        body: 'Simpan 5 template S-A-P-A, Upsell, L-E-G-A, & Follow-Up ke Balas Cepat WA Business malam ini.',
        accent: 'orange',
      },
      {
        title: 'Aksi 2: Label Database Kontak',
        body: 'Kelompokkan minimal 30 kontak terakhir ke [Calon Tanya], [Pernah Beli], & [Langganan VIP].',
        accent: 'teal',
      },
      {
        title: 'Aksi 3: Panen Chat Menggantung',
        body: 'Sapa ulang 15 calon pembeli/pelanggan lama minggu ini dengan skrip sopan & ukur closing-nya!',
        accent: 'orange',
      },
    ],
  },
];

export const SESI_6_SELLING_CURRICULUM: SavedMaterial = {
  id: 'partnerup_sesi_6_selling_closing_umkm',
  seminarTitle: 'Sesi 6 PartnerUp: Selling UMKM — Closing Chat WA, Keberatan & Repeat Order',
  organizerName: 'Seri PartnerUp | obeeAcademy',
  description:
    'Modul Spesialis Selling (penutup trilogi Sesi 4–6): Rumus percakapan 4 langkah S-A-P-A, psikologi 3 pilihan paket & upsell, teknik L-E-G-A atasi keberatan tanpa diskon, skrip follow-up sopan H+1/H+3, dan mesin Repeat Order WhatsApp Business (7 Pertanyaan, 2 Polling, 16 Slide).',
  category: 'Seri PartnerUp (Sesi 6)',
  isDefault: false,
  createdAt: 1733900000000,
  updatedAt: 1734000000000,
  content: {
    seminarTitle: 'Sesi 6 PartnerUp: Selling UMKM — Closing Chat WA, Keberatan & Repeat Order',
    organizerName: 'Seri PartnerUp | obeeAcademy',
    questions: SESI_6_QUESTIONS,
    polls: SESI_6_POLLS,
    slides: SESI_6_SLIDES,
    qnaTopics: [
      'Skrip Closing S-A-P-A',
      'Paket Bundling & Upsell',
      'Atasi Keberatan Tanpa Diskon',
      'Follow-Up H+1 & H+3',
      'Database WA & Repeat Order',
    ],
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1734000000000,
    materialId: 'partnerup_sesi_6_selling_closing_umkm',
    description:
      'Modul Spesialis Selling (penutup trilogi Sesi 4–6): Rumus S-A-P-A, 3 pilihan paket & upsell, teknik L-E-G-A atasi keberatan tanpa diskon, follow-up H+1/H+3, & mesin Repeat Order WhatsApp.',
    category: 'Seri PartnerUp (Sesi 6)',
    isDefault: false,
    createdAt: 1733900000000,
  },
};
