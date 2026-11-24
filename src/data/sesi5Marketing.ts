import {
  WorksheetQuestion,
  LivePollConfig,
  SlideDefinition,
} from './seminarData';
import { SavedMaterial } from '../types';
import { DEFAULT_BRAND_THEME } from '../brandTheme';

const SESI_5_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Memetakan Siapa Pembeli Utama & Kolam Tempat Mereka Berkumpul',
    coreLearning:
      'Marketing menjadi hemat tenaga dan tepat sasaran ketika kita tahu persis di kolam mana calon pembeli paling banyak berkumpul',
    questionText:
      'Gambarkan 1 profil calon pembeli utamamu (usia, aktivitas, kebiasaan), lalu sebutkan 2 KOLAM tempat mereka sering berkumpul (1 Kolam Digital & 1 Kolam Nyata/Komunitas)!',
    secondaryPrompt:
      'Contoh: Ibu muda bekerja usia 25–40 tahun → Kolam Digital: grup WA sekolah/komplek & Instagram Reels menu anak; Kolam Nyata: area tunggu sekolah/PAUD & sanggar senam pagi.',
    exampleAnswer:
      'Pembeli utama: Ibu usia 27–42 tahun yang peduli camilan sehat anak. Kolam Digital: Reels/TikTok resep praktis & grup WA paguyuban wali murid. Kolam Nyata: depan TK/SD sore hari & komunitas senam ibu komplek.',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa (F&B)',
    helperTips: [
      'Hindari jawaban "Semua orang butuh produk saya"—pilih 1 kelompok yang paling cepat butuh dan sanggup bayar.',
      'Untuk Jasa Persewaan: kolam utamanya adalah grup panitia acara/kampus, WO/EO lokal, dan masjid/aula sekitar.',
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Memilih 2 Saluran Jemput Pasar yang Konsisten Dijalankan',
    coreLearning:
      'Lebih baik menguasai 2 saluran marketing yang aktif setiap minggu daripada membuka 6 akun tapi terbengkalai semua',
    questionText:
      'Pilih maksimal 2 saluran penjemput pembeli yang paling realistis kamu rawat tiap minggu (1 Online + 1 Komunitas/Mitra), lalu tulis target berapa calon pembeli baru yang diundang ke WhatsApp tiap minggu!',
    secondaryPrompt:
      'Sambungkan dengan target harian Sesi 2: ingat, untuk mendapat 5 pembeli biasanya butuh 15–20 orang chat bertanya lebih dulu.',
    exampleAnswer:
      'Saluran 1 (Online): Reels/Status WA rutin 4x seminggu mengarah ke WA. Saluran 2 (Komunitas): titip tester + brosur QR ke 2 grup wali murid/kantor setiap Jumat. Target: minimal 70 chat baru masuk per minggu.',
    exampleBusiness: 'Keripik Tempe Kriuk & Yoghurt Mbak Nisa',
    helperTips: [
      'Saluran Online membantu jangkauan luas; Saluran Komunitas/Mitra memberi tingkat kepercayaan jauh lebih cepat.',
      'Pastikan di akhir setiap saluran selalu ada ajakan jelas untuk masuk ke WhatsApp tokomu.',
    ],
    linkedSlideIndex: 5,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Merancang 3 Ide Konten Sesuai Strategi 3 Pilar (Anti-Bosan)',
    coreLearning:
      'Akun yang setiap hari hanya mengunggah "ayo beli harga sekian" mudah dilewati; keseimbangan Edukasi, Bukti, dan Penawaran membuat audiens betah mengikuti',
    questionText:
      'Tulis 3 ide konten untuk minggu ini memakai gaya visual Brand Kit Sesi 4: [1. Konten Masalah/Edukasi] + [2. Konten Bukti Proses/Testimoni] + [3. Konten Penawaran Paket]!',
    secondaryPrompt:
      'Ingat porsi seimbang 40% Masalah/Edukasi : 40% Bukti Nyata : 20% Penawaran langsung.',
    exampleAnswer:
      '1. Masalah/Edukasi: "3 tanda camilan anak terlalu tinggi gula buatan". 2. Bukti Proses: Video 20 detik proses segel botol steril & testimoni chat ibu komplek. 3. Penawaran: "Paket Keluarga 5 Botol gratis ice gel antar jam 4 sore".',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Untuk Kriya: Konten Masalah = "Bingung cari kado ulang tahun yang awet & kepakai?"; Bukti = Video tangan merajut + unboxing box kado; Penawaran = Paket Tas + Kartu Ucapan.',
      'Untuk Persewaan: Konten Masalah = "Cara cek tenda/sound aman sebelum hari-H acara"; Bukti = Video tim loading rapi & steril; Penawaran = Paket Sewa 2 Hari Hemat.',
    ],
    linkedSlideIndex: 7,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Mengubah Aktivitas Kerja Harian Jadi Konten 30 Detik + Hook',
    coreLearning:
      'Konten marketing paling meyakinkan lahir dari aktivitas dapur, workshop, atau persiapan pengiriman harian—tanpa perlu kamera mahal atau wajib tampil wajah',
    questionText:
      'Pilih 1 aktivitas rutin di usahamu yang bisa direkam HP selama 15–30 detik (fokus ke tangan/produknya), lalu tulis 1 KALIMAT PEMBUKA (HOOK) 3 detik pertamanya!',
    secondaryPrompt:
      'Gunakan rumus hook: mulai dari masalah pembeli, fakta mengejutkan proses, atau situasi spesifik yang dekat dengan keseharian mereka.',
    exampleAnswer:
      'Rekaman: Tangan menata tas rajut ke dalam box kraft & menyelipkan kartu panduan rawat (tanpa tampil wajah). Hook teks layar: "Jangan kasih kado sahabat yang ujungnya cuma disimpan di lemari—lihat detail rajutan tangan ini!"',
    exampleBusiness: 'Tas Rajut Senja (Kriya)',
    helperTips: [
      'Cukup rekam 3 potongan klip pendek masing-masing 5 detik (bahan → proses rapi → hasil jadi) di dekat cahaya jendela.',
      'Jika canggung berbicara di kamera, pakai rekaman suara (voice-over) santai atau teks besar yang jelas di layar.',
    ],
    linkedSlideIndex: 10,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Merancang 1 Aksi Kolaborasi Lokal / Referral Tanpa Iklan Mahal',
    coreLearning:
      'Menumpang kolam kepercayaan milik mitra atau pelanggan puas jauh lebih cepat menghasilkan chat berkualitas daripada menunggu algoritma dari nol',
    questionText:
      'Siapa 1 MITRA LOKAL atau KELOMPOK PELANGGAN yang punya kolam pembeli yang sama denganmu (tapi bukan pesaing langsung), dan penawaran saling menguntungkan apa yang mau kamu ajukan minggu ini?',
    secondaryPrompt:
      'Contoh mitra: Yoghurt bekerja sama dengan toko roti sehat/catering anak; Tas Rajut dengan toko bunga/kado; Jasa Sewa dengan dekorator/MC lokal.',
    exampleAnswer:
      'Kolaborasi dengan pemilik toko florist & kado lokal: Tas Rajut Senja menitipkan 3 contoh paket kado siap jual + bagi hasil 15%, sementara tiap pembeli bunga yang butuh tas hadiah diarahkan ke katalog kami.',
    exampleBusiness: 'Tas Rajut Senja & Sewa Alat Event RapiJaya',
    helperTips: [
      'Untuk F&B: Tawarkan "Program Traktir Teman / Ajak Tetangga" — pelanggan lama yang ajak 3 teman order bareng dapat bonus 1 botol/pouch gratis.',
      'Untuk Jasa Persewaan: Beri kartu partner atau fee rekomendasi jelas bagi EO/MC/panitia kampus yang mereferensikan klien baru.',
    ],
    linkedSlideIndex: 12,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Menyusun Kalender Konten & Jemput Bola 7 Hari',
    coreLearning:
      'Jadwal mingguan menghilangkan kebingungan "hari ini mau posting apa ya?" sehingga trafik masuk tetap stabil',
    questionText:
      'Isi pola rotasi Marketing 7 hari untuk usahamu minggu depan (kapan unggah Edukasi, kapan Bukti Proses, kapan sapa Mitra/Komunitas, kapan Penawaran ke WhatsApp)!',
    secondaryPrompt:
      'Tidak harus memposting video berat setiap hari; kombinasi 3–4 konten terencana + 2 aksi jemput bola komunitas sudah sangat kuat.',
    exampleAnswer:
      'Senin: Konten Masalah/Edukasi (Reels+WA) | Selasa: Foto proses dapur bersih | Rabu: Sapa & kirim sampel ke 1 PIC komunitas | Kamis: Unggah testimoni pembeli + magnet chat WA | Jumat: Penawaran Paket Bundling Weekend | Sabtu: Behind-the-scene packing | Minggu: Evaluasi jumlah chat masuk.',
    exampleBusiness: 'Semua UMKM PartnerUp',
    helperTips: [
      'Selalu tutup postingan dengan 1 alasan spesifik agar pembaca klik WA (contoh: "Balas/Chat LIST RASA untuk cek stok segar sore ini").',
      'Jangan lupa simpan nomor setiap orang yang masuk bertanya agar status WA-mu dibaca kolam pembeli yang makin besar tiap minggu.',
    ],
    linkedSlideIndex: 14,
  },
  {
    index: 6,
    sectionNumber: 7,
    sectionTitle: '7. Komitmen Target Chat Masuk & Eksekusi 7 Hari Pertama',
    coreLearning:
      'Ukuran sukses Marketing adalah aliran chat/pertanyaan calon pembeli yang relevan—yang siap dikonversi oleh teknik Selling di Sesi 6',
    questionText:
      'Tulis 3 langkah Marketing yang langsung kamu jalankan besok pagi sampai 7 hari ke depan, beserta target berapa chat calon pembeli baru yang ingin kamu capai!',
    secondaryPrompt:
      'Pastikan langkahnya terukur (contoh: posting 3 konten 3 pilar, hubungi 2 calon mitra, dan kumpulkan minimal 50 kontak baru di WA).',
    exampleAnswer:
      '1. Besok pagi rekam 1 video proses 20 detik + pasang Hook masalah. 2. Hari Rabu temui 2 koordinator arisan/guru TK untuk titip sampel + QR WA. 3. Target minggu ini minimal 45 chat baru masuk bertanya ke WhatsApp.',
    exampleBusiness: 'Semua UMKM PartnerUp',
    helperTips: [
      'Begitu chat mulai ramai berdatangan dari langkah ini, di Sesi 6 (Selling) kita akan belajar cara mengubah chat tersebut agar tidak cuma tanya lalu kabur!',
    ],
    linkedSlideIndex: 15,
  },
];

const SESI_5_POLLS: LivePollConfig[] = [
  {
    id: 'poll_s5_sumber_pembeli',
    title: 'Selama Ini, Dari Mana Pembeli Barumu Paling Sering Datang?',
    subtitle: 'Pilih satu jawaban yang paling mencerminkan sumber pemasukan utama usahamu saat ini:',
    linkedSlideIndex: 2,
    type: 'bar',
    options: [
      {
        id: 'opt_lingkaran_dekat',
        label: '1. Masih berputar di keluarga, teman dekat, & tetangga sekitar',
        subtitle: 'Belum punya mesin penarik orang asing yang belum mengenal kita',
        category: 'emotional',
      },
      {
        id: 'opt_status_wa_org',
        label: '2. Mengandalkan Status WhatsApp & pelanggan lama yang pesan ulang',
        subtitle: 'Bagus untuk repeat order, tapi jumlah kontak baru tumbuh lambat',
        category: 'rational',
      },
      {
        id: 'opt_medsos_acak',
        label: '3. Posting di IG / TikTok / FB, tapi pembelinya masih untung-untungan',
        subtitle: 'Sudah capek bikin postingan tapi jarang ada yang lanjut chat WA',
        category: 'rational',
      },
      {
        id: 'opt_kolaborasi_komunitas',
        label: '4. Sudah rutin datang dari komunitas, mitra titip, & konten terarah',
        subtitle: 'Sudah berjalan beberapa saluran dan siap diperbesar volumenya',
        category: 'rational',
      },
    ],
  },
  {
    id: 'poll_s5_hambatan_promosi',
    title: 'Apa Hambatan Terbesarmu Saat Harus Promosi Rutin Tiap Minggu?',
    subtitle: 'Jawab jujur melalui HP agar kita langsung bedah solusi praktisnya di kelas ini:',
    linkedSlideIndex: 9,
    type: 'bar',
    options: [
      {
        id: 'opt_bingung_ide',
        label: '1. Kehabisan ide mau posting apa selain foto produk yang sama terus',
        subtitle: 'Takut pengikut bosan melihat foto jualan yang berulang',
        category: 'rational',
      },
      {
        id: 'opt_malu_kamera',
        label: '2. Kurang percaya diri bicara atau tampil wajah di depan kamera',
        subtitle: 'Merasa harus tampil seperti selebgram agar video laku',
        category: 'emotional',
      },
      {
        id: 'opt_tonton_sepi',
        label: '3. View & like sedikit sehingga terasa percuma dan malas lanjut',
        subtitle: 'Sering mengukur sukses dari jumlah like, bukan jumlah chat masuk',
        category: 'emotional',
      },
      {
        id: 'opt_takut_tawar_mitra',
        label: '4. Canggung menawarkan kerja sama atau tester ke mitra/komunitas',
        subtitle: 'Takut ditolak saat mengajak kolaborasi atau masuk grup lokal',
        category: 'emotional',
      },
    ],
  },
];

const SESI_5_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'SESI 5 PARTNERUP: SPESIALIS MARKETING',
    title: 'Marketing UMKM: Menjemput Pasar, Strategi 3 Pilar Konten & Kolaborasi Lokal',
    subtitle:
      'Setelah Brand Kit Rapi di Sesi 4: Cara Memetakan Kolam Pembeli, Menyusun Konten Anti-Bosan & Mengalirkan Chat Masuk ke WhatsApp — PartnerUp | obeeAcademy',
    type: 'cover',
    speakerNotes:
      'Buka Sesi 5 dengan menyambungkan hasil Sesi 4 kemarin (Brand Kit Mini & tampilan toko yang sudah rapi). Tegaskan tugas utama MARKETING hari ini: mengisi corong atas dengan calon pembeli baru yang tepat sasaran lewat 3 jalur (Konten 3 Pilar, Kolam Komunitas/Mitra, dan Corong ke WhatsApp) tanpa harus membakar uang iklan besar.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'PETA KOLAM PASAR UMKM',
    title: 'Berhenti Menunggu Algoritma! Bangun 3 Jembatan Menuju Kolam Pembelimu',
    subtitle:
      'Marketing bukan sekadar rajin unggah foto lalu berharap keajaiban. Marketing adalah menyambungkan toko Anda langsung ke tempat pembeli berkumpul.',
    type: 'comparison',
    imageUrl: '/assets/images/sesi5_kolam_pasar_1795487802230.jpg',
    imageCaption:
      'Dari Lapak UMKM ke 3 Kolam Utama: Kolam Komunitas Sekolah/Kantor (Atas) · Kolam Konten Video Medsos (Tengah) · Kolam Mitra Toko Lokal (Bawah)',
    imagePosition: 'top',
    speakerNotes:
      'Gunakan ilustrasi 3 jembatan ini. Jelaskan kenapa banyak UMKM merasa sudah "promosi tiap hari" tapi tetap sepi: karena mereka hanya berteriak di depan rumah sendiri tanpa berjalan menuju kolam tempat target pembelinya berkumpul (seperti sekolah/kantor, grup komunitas, feed video masalah, dan toko mitra).',
    comparison: {
      leftTitle: 'Marketing Pasif ("Lempar Jala di Gelap")',
      leftBody:
        '• Asal unggah foto produk tiap hari tanpa jelas menyasar siapa.\n• Hanya mengandalkan kontak lama keluarga & teman itu-itu saja.\n• Saat postingan sepi like, langsung berhenti promosi berminggu-minggu.',
      rightTitle: 'Marketing Terarah Ala UMKM Juara',
      rightBody:
        '• Memetakan 1 profil pembeli utama + 2 kolam tempat mereka berkumpul.\n• Menyeimbangkan 3 pilar konten agar orang baru tertarik menyimak.\n• Menggabungkan jalur digital, komunitas, & mitra menuju 1 pintu WhatsApp.',
    },
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'POLLING 1: SUMBER CALON PEMBELI',
    title: 'Selama Ini, Dari Mana Calon Pembeli Barumu Paling Banyak Datang?',
    subtitle:
      'Pilih jawaban paling jujur di HP masing-masing agar kita tahu kolam mana yang masih tertutup di usahamu:',
    type: 'concept',
    linkedPollId: 'poll_s5_sumber_pembeli',
    speakerNotes:
      'Jalankan Polling 1. Jika mayoritas berada di Opsi 1 (keluarga/teman) atau Opsi 2 (hanya status WA lama), beri penekanan bahwa kolam mereka sudah jenuh—pelajaran hari ini dirancang untuk membuka keran orang baru di luar lingkaran keluarga.',
    cards: [
      {
        title: '1. Lingkaran Dekat Saja',
        body: 'Aman di awal berdiri, tapi cepat mentok jika tidak mulai masuk ke kolam pasar yang lebih luas.',
        accent: 'orange',
      },
      {
        title: '2. Status WA Pelanggan Lama',
        body: 'Bagus untuk repeat order, namun butuh saluran baru untuk menambah kontak WhatsApp tiap minggu.',
        accent: 'teal',
      },
      {
        title: '3. Medsos Masih Untung-Untungan',
        body: 'Tandanya konten masih terlalu fokus jualan keras & belum memakai hook masalah + ajakan ke WA.',
        accent: 'orange',
      },
      {
        title: '4. Sudah Ada Komunitas & Mitra',
        body: 'Pola paling sehat! Hari ini kita rapikan kalender & sistem kolaborasinya supaya makin stabil.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'PRAKTIK 1: PETAKAN KOLAM PASAR',
    title: 'Siapa Pembeli Utamamu & Di Kolam Mana Mereka Berkumpul?',
    subtitle:
      'Jangan memancing ikan tuna di kolam lele! Tentukan dulu siapa target utamamu dan di mana mereka paling mudah ditemui:',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    speakerNotes:
      'Beri waktu 3 menit agar peserta mengisi 1 profil pembeli utama + 2 kolam konkret (1 digital, 1 komunitas nyata). Ingatkan peserta agar menyebut nama tempat/grup yang nyata ada di kota mereka, bukan istilah umum.',
    promptLines: [
      'Profil Pembeli Utama: ____________ | Kolam Digital & Kolam Nyata: ____________',
    ],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'PILAR 1: ARSITEKTUR SALURAN',
    title: 'Rumus 3 Kolam Saluran: Digital, Komunitas & Mitra Lokal',
    subtitle:
      'Bisnis UMKM paling tangguh tidak pernah bergantung pada satu algoritma media sosial saja. Kombinasikan 3 jalur berikut:',
    type: 'concept',
    speakerNotes:
      'Bandingkan karakter ketiga kolam: Kolam Digital butuh konsistensi konten agar menjangkau luas; Kolam Komunitas (ibu sekolah, pengajian, hobi, kantor) punya tingkat kepercayaan 5x lebih tinggi; Kolam Mitra (titip produk/paket gabungan) meminjam keramaian toko orang lain yang sudah ramai.',
    cards: [
      {
        title: '1. Kolam Digital (Skala Luas)',
        body: 'Video singkat IG Reels / TikTok + Profil WA Business & Google Maps agar mudah dicari warga sekitar.',
        accent: 'teal',
      },
      {
        title: '2. Kolam Komunitas (Trust Cepat)',
        body: 'Grup wali murid, komplek, ibu kantor, komunitas hobi, & organisasi pengajian/sosial lokal.',
        accent: 'orange',
      },
      {
        title: '3. Kolam Mitra (Tukar Audiens)',
        body: 'Titip display/brosur atau paket bundling di toko oleh-oleh, florist, kafe, atau vendor acara.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'PRAKTIK 2: PILIH 2 SALURAN UTAMA',
    title: 'Pilih 2 Saluran Penjemput Target yang Sanggup Kamu Rawat',
    subtitle:
      'Ingat hitungan Corong Sesi 2: untuk menutup target penjualan harian, berapa chat masuk yang harus dikejar dari kedua saluran ini?',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    speakerNotes:
      'Ajak peserta mengaitkan saluran pilihannya dengan angka target chat dari Sesi 2. Pilih 2 peserta dengan jenis usaha berbeda untuk membacakan kombinasi 2 saluran andalan mereka.',
    promptLines: [
      'Saluran Online + Saluran Komunitas/Mitra: ____________ | Target Chat/Minggu: ____',
    ],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'PILAR 2: STRATEGI 3 PILAR KONTEN',
    title: 'Pola 40 : 40 : 20 — Rahasia Konten Menarik yang Tidak Bikin Pembeli Kabur',
    subtitle:
      'Jika isi akun jualanmu 100% hanya brosur harga, orang cepat bosan. Bagi kontenmu menjadi 3 peran yang saling melengkapi:',
    type: 'concept',
    imageUrl: '/assets/images/sesi5_tiga_pilar_konten_1795487800958.jpg',
    imageCaption:
      'Kiri (40%): Konten Pancingan Masalah & Edukasi · Tengah (40%): Konten Bukti Proses & Testimoni · Kanan (20%): Konten Penawaran Paket Jelas',
    imagePosition: 'top',
    speakerNotes:
      'Tunjukkan gambar 3 pilar konten ini dan tekankan porsi 40:40:20. Jelaskan peran masing-masing: Pilar 1 memancing orang baru berhenti scroll lewat masalah yang mereka alami; Pilar 2 memamerkan standar kualitas & bukti nyata dari Brand Kit Sesi 4; Pilar 3 barulah memanen chat dengan penawaran paket bundling yang jelas.',
    cards: [
      {
        title: '40% — Masalah & Edukasi',
        body: 'Tips, salah kaprah, atau situasi harian pembeli. Tujuannya membuat orang baru berhenti scroll & merasa relate.',
        accent: 'orange',
      },
      {
        title: '40% — Proses & Bukti Nyata',
        body: 'Dapur higienis, ketelitian tangan, packing pesanan, & tangkapan layar testimoni agar keraguan hilang.',
        accent: 'teal',
      },
      {
        title: '20% — Penawaran Paket Jelas',
        body: 'Foto rapi + manfaat + pilihan Paket Bundling + tombol/kalimat ajakan langsung ke chat WhatsApp.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'PRAKTIK 3: 3 IDE KONTEN MINGGUAN',
    title: 'Buat 3 Ide Konten Sesuai Pilar 40 : 40 : 20',
    subtitle:
      'Terapkan warna & gaya visual Brand Kit Sesi 4 ke dalam 3 ide konten spesifik untuk usahamu minggu ini:',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    speakerNotes:
      'Beri contoh singkat untuk F&B, Kriya, dan Persewaan. Dorong peserta menulis judul atau topik spesifik (bukan sekadar "bikin video promosi", tapi apa kalimat intinya).',
    promptLines: [
      '1. Masalah/Edukasi: _________ | 2. Proses/Bukti: _________ | 3. Penawaran: _________',
    ],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'TEKNIK HOOK 3 DETIK PERTAMA',
    title: 'Rumus 3 Detik Pertama: Cara Menghentikan Jempol Penonton di Layar HP',
    subtitle:
      'Di media sosial maupun Status WA, 3 detik pertama menentukan apakah orang lanjut membaca/menonton atau langsung menggeser pergi.',
    type: 'formula',
    speakerNotes:
      'Berikan 3 pola Hook yang tinggal pakai tanpa pusing memikirkan kata-kata puitis. Ingatkan kembali: gunakan hasil Workshop Foto/Caption yang terang dan fokus pada sudut detail agar gambar pembukanya ikut mencuri perhatian.',
    cards: [
      {
        title: 'Pola 1: Tanya Masalah Spesifik',
        body: '"Sering kecewa beli keripik baru dibuka sehari sudah melempem?" / "Bingung cari kado yang gak pasaran?"',
        accent: 'orange',
      },
      {
        title: 'Pola 2: Bongkar Rahasia Proses',
        body: '"Ini alasan kenapa yoghurt kami butuh 12 jam fermentasi tanpa tambahan pemanis buatan..."',
        accent: 'teal',
      },
      {
        title: 'Pola 3: Panggil Situasi Pembeli',
        body: '"Khusus panitia acara minggu depan yang butuh tenda & kursi bersih tiba tepat waktu..."',
        accent: 'orange',
      },
    ],
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'POLLING 2: HAMBATAN PROMOSI',
    title: 'Apa Kendala Terbesarmu Saat Harus Konsisten Promosi Tiap Minggu?',
    subtitle:
      'Pilih satu kendala yang paling sering menghentikan langkahmu selama ini:',
    type: 'concept',
    linkedPollId: 'poll_s5_hambatan_promosi',
    speakerNotes:
      'Jalankan Polling 2 lalu langsung beri jalan keluar bebas stres: kalau malu kamera -> pakai video tangan (POV) saat packing/masak; kalau view sedikit -> ukur keberhasilan dari chat WA masuk (100 views dari ibu komplek lebih berharga dari 10.000 views penonton luar kota yang tidak bisa beli!); kalau canggung ke mitra -> bawa paket kolaborasi saling untung, bukan mengemis.',
    cards: [
      {
        title: '1. Kehabisan Ide Posting',
        body: 'Solusi: pakai rotasi 3 pilar + dokumentasikan pesanan pelanggan nyata setiap hari.',
        accent: 'teal',
      },
      {
        title: '2. Malu Tampil di Kamera',
        body: 'Solusi: tidak wajib tampil wajah! Rekam tangan meracik, membungkus, atau menyusun alat acara.',
        accent: 'orange',
      },
      {
        title: '3. View/Like Sedikit',
        body: 'Solusi: jangan kejar viral kosong—kejar 100 pasang mata yang tepat agar 15–20 orang chat WA.',
        accent: 'teal',
      },
      {
        title: '4. Canggung Ajak Mitra',
        body: 'Solusi: tawarkan konsep "saling mengisi produk/pelanggan", bukan sekadar minta dibantu.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'PRAKTIK 4: KONTEN 30 DETIK TANPA DRAMA',
    title: 'Ubah 1 Aktivitas Kerja Harian Jadi Video 30 Detik + Hook',
    subtitle:
      'Kamu tidak butuh studio! Gunakan momen kerja nyata hari ini, rekam 3 klip pendek dengan HP, lalu pasangkan 1 Hook pembuka:',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    speakerNotes:
      'Minta peserta memilih 1 aktivitas hariannya. Contohkan betapa menariknya klip tangan memotong tempe tipis, mengikat pita tas rajut, atau mengelap bersih kursi acara dengan teks hook yang tepat di atas layar.',
    promptLines: [
      'Aktivitas Harian yang Direkam: ____________ | Teks Hook 3 Detik: ____________',
    ],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'PILAR 3: KOLABORASI LOKAL & REFERRAL',
    title: 'Jurus Cepat Tanpa Budget Iklan: Tukar Kolam, Tester Terarah & Referral',
    subtitle:
      'Pelanggan paling mudah percaya saat mendengar rekomendasi dari tempat atau orang yang sudah mereka kenal sebelumnya.',
    type: 'concept',
    speakerNotes:
      'Jelaskan strategi kolaborasi spesifik per kategori bisnis peserta agar langsung terbayang eksekusinya minggu ini. Tekankan perbedaan "bagi tester asal di jalan" (buang modal) vs "tester terarah ke koordinator komunitas" (tinggi konversi).',
    cards: [
      {
        title: 'F&B: Tester Terarah + Ajak Tetangga',
        body: 'Berikan 5 sampel mini khusus ke koordinator arisan/guru/admin kantor + bonus 1 botol jika ajak 3 teman pesan bareng.',
        accent: 'orange',
      },
      {
        title: 'Kriya: Paket Hampers Lintas UMKM',
        body: 'Gabung dengan penjual kue kering/kopi/florist membuat 1 paket kado bersama sehingga saling tukar daftar pembeli.',
        accent: 'teal',
      },
      {
        title: 'Jasa Sewa: Partner Vendor Acara',
        body: 'Gandeng MC, katering, & dekorator lokal dengan kartu partner atau fee rekomendasi yang jelas tiap proyek masuk.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'PRAKTIK 5: RENCANA KOLABORASI / REFERRAL',
    title: 'Siapa 1 Mitra / Kelompok Pelanggan yang Siap Diajak Kolaborasi?',
    subtitle:
      'Tentukan mitra bukan-pesaing yang melayani pembeli yang sama denganmu, dan siapkan penawaran saling menguntungkan:',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    speakerNotes:
      'Dorong peserta menuliskan nama mitra spesifik (toko, komunitas, atau vendor di kotanya) agar tidak berhenti di angan-angan. Tanyakan siapa yang berani langsung menghubungi mitranya minggu ini.',
    promptLines: [
      'Nama Calon Mitra/Komunitas: ____________ | Konsep Saling Menguntungkan: ____________',
    ],
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'TARIK PENONTON KE KOLAM WHATSAPP',
    title: 'Jangan Biarkan Penonton Pergi! Pasang "Alasan Chat" ke WhatsApp',
    subtitle:
      'Like dan komentar belum menjadi omzet. Setiap aktivitas marketing harus menggiring calon pembeli masuk & menyimpan nomor WhatsApp-mu!',
    type: 'formula',
    speakerNotes:
      'Jelaskan konsep "Magnet Chat": jangan cuma tulis "Order WA: 0812xxx", tapi beri alasan spesifik kenapa orang perlu chat detik ini juga. Begitu mereka chat, simpan nama + asal produknya di kontak HP agar Status WA harianmu menjadi mesin marketing gratis jangka panjang!',
    cards: [
      {
        title: 'Magnet Chat F&B',
        body: '"Chat kata LIST SEGAR untuk cek rasa yang baru matang hari ini & rute gratis antar sore!"',
        accent: 'teal',
      },
      {
        title: 'Magnet Chat Kriya',
        body: '"Chat kata KATALOG KADO untuk lihat pilihan warna ready stock + gratis kartu ucapan tulis tangan!"',
        accent: 'orange',
      },
      {
        title: 'Magnet Chat Jasa Sewa',
        body: '"Chat kata CEK TANGGAL + lokasi acara untuk kunci jadwal & hitung paket hemat sekaligus!"',
        accent: 'teal',
      },
    ],
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'PRAKTIK 6: KALENDER KONTEN & AKSI 7 HARI',
    title: 'Susun "Jadwal Marketing 7 Hari" yang Rapi & Bebas Stres',
    subtitle:
      'Atur ritme harianmu agar tidak bingung lagi tiap pagi memikirkan apa yang harus diunggah atau siapa yang harus disapa:',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    speakerNotes:
      'Beri waktu 4 menit untuk peserta mengisi jadwal rotasi 7 hari versi mereka. Pastikan di dalam jadwal sudah memuat konten 3 pilar DAN minimal 1 hari aksi jemput bola komunitas/mitra serta 1 hari evaluasi angka chat masuk.',
    promptLines: [
      'Jadwal Marketing 7 Hari (Senin–Minggu) Usahaku: ____________________________',
    ],
  },
  {
    index: 15,
    pageNumber: 16,
    badge: 'PENUTUP & JEMBATAN KE SESI 6 (SELLING)',
    title: 'Target 15–20 Chat Baru/Hari Siap Mengalir — Berikutnya Kita Tutup di Sesi 6!',
    subtitle:
      'Marketing sukses saat orang baru mulai berdatangan dan bertanya. Di Sesi 6 nanti, kita kuasai seni mengubah chat masuk itu menjadi transfer & repeat order!',
    type: 'closing',
    linkedQuestionIndex: 6,
    speakerNotes:
      'Tutup Sesi 5 dengan mengunci komitmen eksekusi 7 hari pertama peserta. Berikan teaser untuk Sesi 6 (Spesialis Selling): begitu konten 3 pilar dan kolaborasi mitra mulai mendatangkan banyak chat tanya harga, jangan sampai bocor karena salah membalas chat atau kalah menghadapi kalimat "mahal ya" / "pikir-pikir dulu". Itu yang akan kita tuntaskan di Sesi 6!',
    promptLines: [
      '3 Aksi Marketing Besok–7 Hari ke Depan + Target Chat Masuk/Minggu: ________________',
    ],
    cards: [
      {
        title: 'Tugas 1: Jalankan 3 Konten',
        body: 'Unggah 1 konten Masalah, 1 konten Bukti Proses, & 1 Penawaran Paket dengan Hook 3 detik.',
        accent: 'orange',
      },
      {
        title: 'Tugas 2: Jemput Kolam Mitra',
        body: 'Hubungi minimal 1 komunitas atau calon mitra lokal untuk kerja sama tukar audiens/tester.',
        accent: 'teal',
      },
      {
        title: 'Menuju Sesi 6: SELLING',
        body: 'Kumpulkan semua chat masuk minggu ini—di Sesi 6 kita pelajari skrip closing & repeat order!',
        accent: 'orange',
      },
    ],
  },
];

export const SESI_5_MARKETING_CURRICULUM: SavedMaterial = {
  id: 'partnerup_sesi_5_marketing_umkm',
  seminarTitle: 'Sesi 5 PartnerUp: Marketing UMKM — Menjemput Pasar, Konten & Kolaborasi',
  organizerName: 'Seri PartnerUp | obeeAcademy',
  description:
    'Modul Spesialis Marketing (lanjutan Sesi 4 Branding): Memetakan 3 kolam pasar (Digital, Komunitas, Mitra), strategi 3 pilar konten 40:40:20, rumus Hook 3 detik, jurus kolaborasi tanpa iklan mahal, magnet chat ke WhatsApp, dan Kalender Marketing 7 Hari (7 Pertanyaan, 2 Polling, 16 Slide).',
  category: 'Seri PartnerUp (Sesi 5)',
  isDefault: false,
  createdAt: 1733700000000,
  updatedAt: 1733800000000,
  content: {
    seminarTitle: 'Sesi 5 PartnerUp: Marketing UMKM — Menjemput Pasar, Konten & Kolaborasi',
    organizerName: 'Seri PartnerUp | obeeAcademy',
    questions: SESI_5_QUESTIONS,
    polls: SESI_5_POLLS,
    slides: SESI_5_SLIDES,
    qnaTopics: [
      'Peta Kolam Target Pasar',
      'Strategi Konten 40:40:20',
      'Hook 3 Detik & Video Tanpa Wajah',
      'Kolaborasi Mitra & Referral',
      'Menggiring Traffic ke WhatsApp',
    ],
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1733800000000,
    materialId: 'partnerup_sesi_5_marketing_umkm',
    description:
      'Modul Spesialis Marketing (lanjutan Sesi 4 Branding): Memetakan 3 kolam pasar, strategi 3 pilar konten 40:40:20, Hook 3 detik, kolaborasi tanpa iklan mahal, magnet chat WhatsApp, & Kalender 7 Hari.',
    category: 'Seri PartnerUp (Sesi 5)',
    isDefault: false,
    createdAt: 1733700000000,
  },
};
