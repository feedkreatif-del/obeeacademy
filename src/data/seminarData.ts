export interface WorksheetQuestion {
  index: number;
  sectionNumber: number;
  sectionTitle: string;
  coreLearning: string;
  questionText: string;
  secondaryPrompt?: string;
  exampleAnswer: string;
  exampleBusiness?: string;
  helperTips: string[];
  linkedSlideIndex: number;
}

export interface PollOption {
  id: string;
  label: string;
  subtitle: string;
  category: 'rational' | 'emotional';
}

export interface LivePollConfig {
  id: string;
  title: string;
  subtitle: string;
  linkedSlideIndex: number;
  type: 'bar' | 'wordcloud';
  options: PollOption[];
}

export interface SlideCardItem {
  title: string;
  body: string;
  extra?: string;
  accent: 'orange' | 'teal' | 'navy';
}

export type SlideImagePosition = 'right' | 'left' | 'top' | 'card';

export interface SlideDefinition {
  index: number;
  pageNumber: number;
  badge: string;
  title: string;
  subtitle?: string;
  type: 'cover' | 'agenda' | 'worksheet' | 'concept' | 'comparison' | 'formula' | 'closing';
  linkedQuestionIndex?: number;
  linkedPollId?: string;
  speakerNotes?: string;
  cards?: SlideCardItem[];
  comparison?: {
    leftTitle: string;
    leftBody: string;
    rightTitle: string;
    rightBody: string;
  };
  bottomBanner?: string;
  promptLines?: string[];
  imageUrl?: string;
  imageCaption?: string;
  imagePosition?: SlideImagePosition;
}

export const DEFAULT_QNA_TOPICS: string[] = [
  'Value Proposition',
  'Rational Value (Bukti)',
  'Emotional Value (Rasa)',
  'Strategi Harga',
  'Bio & Kemasan',
];

export interface ToughQuestionGuide {
  id: string;
  question: string;
  shortPrinciple: string;
  tacticalAnswer: string;
  coachingQuestion: string;
}

export const SPEAKER_TOUGH_QUESTIONS: ToughQuestionGuide[] = [
  {
    id: 'tq_1',
    question: '1. "Produk saya sama persis dengan penjual lain, apa yang bisa dibedakan?"',
    shortPrinciple: 'Pembeda tidak harus selalu ada di barangnya.',
    tacticalAnswer:
      'Pembeda bisa dibangun dari: (1) Siapa yang dilayani (fokus 1 segmen spesifik), (2) Cara melayani (cepat, ramah, bisa custom), (3) Kemudahan (kemasan zip, pengiriman), atau (4) Cerita & Kepercayaan (siapa pembuatnya, proses bersih, foto asli).',
    coachingQuestion:
      'Tanyakan balik ke peserta: "Selama ini, apa hal kecil yang paling sering dipuji pelanggan langgananmu?"',
  },
  {
    id: 'tq_2',
    question: '2. "Saya kan memang jual murah, apa itu bukan Value Proposition?"',
    shortPrinciple: 'Bisa jadi salah satu manfaat, tapi sangat rapuh jika berdiri sendiri.',
    tacticalAnswer:
      'Harga murah paling mudah ditiru pesaing bermodal besar dan menekan margin UMKM. Harga murah baru kuat jika digabung dengan alasan lain yang jelas (misal: paket hemat keluarga, porsi anak kos, atau hitung per pemakaian).',
    coachingQuestion:
      'Tanyakan balik: "Bisa tidak usahamu terjangkau sekaligus punya 1 alasan lain, misalnya porsi pas atau kirim lebih cepat?"',
  },
  {
    id: 'tq_3',
    question: '3. "Pembeli saya di pasar/online cuma lihat harga paling murah."',
    shortPrinciple: 'Pembeli pakai jalan pintas harga karena penjual belum memberi alasan lain.',
    tacticalAnswer:
      'Memang ada pembeli yang hanya cari termurah dan tidak semuanya wajib kita layani. Namun sering kali pembeli fokus ke harga karena kita hanya menulis "enak dan berkualitas" tanpa bukti. Saat kita beri alasan (misal: tanpa MSG untuk anak, kemasan zip, atau hitungan awet per bulan), selalu ada kelompok pembeli yang rela bayar lebih demi rasa aman.',
    coachingQuestion:
      'Contohkan kasus Keripik Tempe Rp12rb ("enak murah") vs Rp16rb ("tanpa MSG untuk anak, renyah 14 hari").',
  },
  {
    id: 'tq_4',
    question: '4. "Saya belum punya sertifikat PIRT/Halal atau ulasan, bagaimana membuktikan?"',
    shortPrinciple: 'Bukti Rational Value tidak harus menunggu sertifikat formal.',
    tacticalAnswer:
      'UMKM pemula bisa mulai membuktikan dari nol hari ini lewat 5 bukti murah: (1) Foto asli & video dapur/proses pembuatan, (2) Uji coba sampel kecil, (3) Testimoni detail pelanggan pertama, (4) Ukuran/gramasi yang konsisten, dan (5) Garansi sederhana ("Tidak puas / melempem, kami ganti baru").',
    coachingQuestion:
      'Ajak peserta memilih 1 bukti proses atau garansi sederhana yang bisa langsung mereka tampilkan besok.',
  },
  {
    id: 'tq_5',
    question: '5. "Bagaimana kalau Emotional Value terdengar berlebihan atau bohong?"',
    shortPrinciple: 'Setiap janji perasaan wajib punya pendukung fisik yang nyata.',
    tacticalAnswer:
      'Batas etika: menjanjikan "pasti sembuh" atau "ajaib" tanpa dasar bukanlah emotional value, melainkan klaim menyesatkan. Kalau menjanjikan "bikin pemberi hampers merasa bangga & tidak malu", pendukung nyatanya harus ada: kemasan kokoh, pita rapi, dan kartu ucapan.',
    coachingQuestion:
      'Lebih baik janji perasaan sederhana yang terbukti nyata daripada janji besar yang kosong.',
  },
];

export const VP_THREE_TESTS = [
  {
    title: '1. Uji "Lalu Kenapa?" (So What?)',
    question: 'Bacakan kalimatmu, lalu tanya: "Lalu kenapa pembeli harus peduli?"',
    passCriteria: 'Menjawab masalah/tugas nyata pembeli (bukan sekadar memuji produk sendiri).',
  },
  {
    title: '2. Uji "Bisa Dibantah?"',
    question: 'Apakah klaim di dalam kalimatmu bisa dicek atau dihitung?',
    passCriteria: 'Ganti kata "terbaik / berkualitas" menjadi angka, bahan, masa tahan, atau garansi.',
  },
  {
    title: '3. Uji "Bisa Ditiru Pesaing?"',
    question: 'Apakah penjual sebelah bisa menyalin kalimatmu tanpa berbohong?',
    passCriteria: 'Jika pesaing bisa menulis kalimat yang sama persis, tambahkan kekhasan usahamu.',
  },
];

export const ZERO_CERT_PROOFS = [
  {
    label: 'Foto & Video Proses Asli',
    chipText: 'dibuat segar setiap pagi (ada video proses dapur bersih)',
  },
  {
    label: 'Garansi Sederhana',
    chipText: 'garansi ganti baru jika barang rusak/melempem saat diterima',
  },
  {
    label: 'Hitung per Pemakaian',
    chipText: 'awet dipakai berbulan-bulan (jatuhnya jauh lebih hemat per hari)',
  },
  {
    label: 'Kemasan Uji Coba / Sampel',
    chipText: 'tersedia kemasan coba dulu mulai Rp10 ribu',
  },
];

export const PARTNERUP_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Kenalan dengan Usahamu',
    coreLearning: 'Value Proposition adalah "Jalan Pintas Keempat" agar UMKM tidak terjebak perang harga',
    questionText: 'Apa nama usaha dan produk/jasa andalanmu?',
    secondaryPrompt: 'Sudah berjualan sejak kapan, dan apa yang paling sering dipuji pelangganmu?',
    exampleAnswer: 'Keripik Apel Bu Sari — keripik apel tipis tanpa minyak berlebih. Jalan 8 bulan, pelanggan suka karena renyah sampai 2 minggu.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Di pasar/marketplace, pembeli punya 3 jalan pintas: (1) Termurah, (2) Rating tertinggi, (3) Toko teramai. UMKM kecil butuh Jalan Pintas Keempat: Alasan memilih yang jelas!',
      'Studi Kasus: Penjual Keripik Tempe A (Rp12rb: "Enak, renyah, murah") kalah dari Penjual B (Rp16rb: "Tipis tanpa MSG untuk anak, renyah 14 hari, kemasan zip").'
    ],
    linkedSlideIndex: 2,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Kenali Pembelimu & Tugasnya (Jobs to be Done)',
    coreLearning: 'Pembeli "menyewa" produkmu untuk menyelesaikan tugas tertentu & menghilangkan keraguannya',
    questionText: 'Siapa 1 kelompok pembeli spesifik yang paling sering membeli produkmu?',
    secondaryPrompt: 'Tugas apa yang ingin dia selesaikan (kebutuhannya) & apa yang membuatnya ragu/kesal?',
    exampleAnswer: 'Ibu rumah tangga yang butuh hampers/oleh-oleh cepat tanpa repot. Sering ragu soal kebersihan dan takut kemasan penyok.',
    exampleBusiness: 'Kue Kering & Hampers Bu Sari',
    helperTips: [
      'Jangan tulis "semua kalangan". Bayangkan 1 pelanggan langganan nyata yang paling sering beli di tempatmu.',
      '1 usaha bisa punya 2 VP untuk 2 pembeli: Laundry untuk Anak Kos ("Selesai 24 jam, ada nomor tiap baju") vs Ibu Bekerja ("Dijemput & diantar sampai rumah, wangi rapi").',
      'Khusus jualan online: keraguan terbesar pembeli adalah takut barang tidak sesuai foto/ukuran tidak pas.'
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Apa Itu Value Proposition?',
    coreLearning: 'VP adalah keputusan memilih siapa yang dilayani beserta buktinya (bukan slogan puitis & bukan sekadar deskripsi ukuran)',
    questionText: 'Menurutmu, kenapa pembeli memilih produkmu dibanding alternatif lain?',
    secondaryPrompt: 'Perhatikan biaya waktu, tenaga, dan risiko yang berhasil kamu kurangi untuk pembeli!',
    exampleAnswer: 'Kue kering tanpa pengawet untuk hantaran keluarga, tahan 2 bulan, sudah dikemas rapi siap kirim.',
    exampleBusiness: 'Dapur Hampers Sari',
    helperTips: [
      'Bedakan: Slogan ("Rasa yang bikin kangen") vs Deskripsi ("Keripik apel 150gr") vs Value Proposition ("Camilan apel tanpa pengawet untuk anak, tahan 3 bulan").',
      'Rumus Nilai (Kotler): Nilai = Manfaat dikurangi Total Biaya (Uang + Waktu + Tenaga + Risiko). Warung dekat & cepat (hemat waktu) bisa menang dari yang murah tapi jauh!'
    ],
    linkedSlideIndex: 6,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Rational Value (Bukti Nyata & Hitungan)',
    coreLearning: 'Relevansi mengalahkan jumlah: ubah klaim kosong menjadi angka, dampak nyata, atau hitungan per pemakaian',
    questionText: 'Sebutkan 2 keunggulan produkmu yang bisa dicek/dibuktikan pembeli!',
    secondaryPrompt: 'Belum punya sertifikat? Gunakan bukti proses asli, ukuran konsisten, hitungan per pemakaian, atau garansi tukar!',
    exampleAnswer: '1. Tanpa pengawet & tahan 3 bulan (ada video proses dapur bersih). 2. Isi 150 gram Rp15 ribu, garansi ganti baru jika melempem.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Prinsip Emas: Angka harus relevan bagi pembeli ("Tidak membuat tenggorokan gatal" lebih menggerakkan daripada sekadar "100% bahan alami").',
      'Trik Hitung per Pemakaian: Tas Rp150rb tahan 2 tahun = setara Rp6.250/bulan (jauh lebih hemat dari tas Rp80rb yang rusak dalam 3 bulan = Rp26.700/bulan).'
    ],
    linkedSlideIndex: 9,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Emotional Value (Perasaan Pribadi & Nilai Sosial)',
    coreLearning: 'Bukti angka menjadi pintu masuk agar pembeli yakin, rasa (emosi) yang membuat mereka memilihmu & kembali lagi',
    questionText: 'Perasaan apa yang didapat pembelimu, dan apa yang mereka ceritakan ke orang lain setelah membeli?',
    secondaryPrompt: 'Sebutkan hal fisik nyata (kemasan, pelayanan, suasana, rasa) yang mendukung perasaan tersebut!',
    exampleAnswer: 'Pemberi merasa perhatian dan tidak malu saat menyerahkan hadiah ke mertua/rekan kerja, karena kemasan box tebal dan ada kartu ucapan.',
    exampleBusiness: 'Dapur Hampers Sari',
    helperTips: [
      'Pancingan Mudah: "Setelah pelanggan menerima barangmu, kalimat apa yang dia ceritakan ke temannya?"',
      '3 Jenis Emosi: (1) Pribadi (tenang, percaya diri), (2) Sosial (terlihat perhatian/rapi di mata orang lain), (3) Identitas/Komunitas (bangga dukung lokal).',
      'Batas Etika: Setiap janji perasaan wajib didukung bukti fisik nyata, bukan klaim berlebihan.'
    ],
    linkedSlideIndex: 11,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Gabungkan Jadi Satu Kalimat & Uji 3 Pertanyaan',
    coreLearning: 'Satu kalimat utuh yang menjawab Pembeli + Tugas/Perasaan + Bukti Nyata dalam satu napas',
    questionText: 'Tulis kalimat Value Proposition usahamu!',
    secondaryPrompt: 'Rumus: [Produk] untuk [pembeli] yang ingin [manfaat/perasaan], karena [bukti/keunggulan].',
    exampleAnswer: 'Keripik apel asli Batu untuk orang tua yang cari camilan aman buat anak, karena tanpa pengawet dan tahan 3 bulan, mulai Rp15 ribu.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Uji dengan 3 Alat Uji: (1) "Lalu kenapa / So what?" (penting bagi pembeli?), (2) "Bisa dibantah?" (ada bukti angkanya?), (3) "Bisa ditiru pesaing?" (cukup spesifik?).',
      'Aturan fokus: Pilih 1–2 manfaat terkuat saja. Kalau memuat 5 janji sekaligus, pembeli tidak ingat satu pun.'
    ],
    linkedSlideIndex: 14,
  },
  {
    index: 6,
    sectionNumber: 7,
    sectionTitle: '7. Menerapkan & Mengecek Apakah VP Bekerja',
    coreLearning: 'Kalimat bagus di buku catatan tidak menghasilkan apa-apa sampai dipasang konsisten di titik temu pembeli',
    questionText: 'Di mana kalimat ini akan kamu pasang pertama kali, dan bagaimana cara kamu mengujinya?',
    secondaryPrompt: 'Langkah nyata apa yang akan kamu lakukan dalam 3 hari ke depan?',
    exampleAnswer: 'Pasang di Bio IG, judul marketplace, dan chat pembuka WA malam ini. Minggu depan tanya pelanggan baru kenapa mereka pilih beli di sini.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Terjemahkan ke 4 titik: (1) Bio Sosmed, (2) Judul Marketplace, (3) Foto Pertama & Kemasan, (4) Balasan Chat WA.',
      'Cara cek apakah VP bekerja: Tanya pelanggan baru "Kenapa pilih beli di sini?" atau uji 2 versi kalimat selama 2 minggu dan lihat mana yang menghasilkan lebih banyak chat.'
    ],
    linkedSlideIndex: 15,
  },
];

export const LIVE_POLLS: LivePollConfig[] = [
  {
    id: 'rational_4types',
    title: '4 Jenis Alasan Pembeli Memilih Kamu (Bagian 4)',
    subtitle: 'Dari 4 jenis keunggulan ini, mana yang PALING COCOK dan paling kuat untuk produk usahamu saat ini?',
    linkedSlideIndex: 7,
    type: 'bar',
    options: [
      {
        id: 'harga',
        label: '1. Harga & Hemat Pemakaian',
        subtitle: 'Contoh: Paket hemat / dihitung per bulan jatuhnya Rp6 ribuan (Rational - Otak)',
        category: 'rational',
      },
      {
        id: 'kualitas',
        label: '2. Kualitas & Bahan Terbukti',
        subtitle: 'Contoh: Tanpa MSG aman untuk anak, tahan 3 bulan, bahan asli (Rational - Otak)',
        category: 'rational',
      },
      {
        id: 'kemudahan',
        label: '3. Kemudahan & Penurun Risiko',
        subtitle: 'Contoh: Selesai 24 jam, jemput-antar, garansi tukar ukuran (Rational - Otak)',
        category: 'rational',
      },
      {
        id: 'pengalaman',
        label: '4. Pengalaman & Nilai Sosial',
        subtitle: 'Contoh: Kemasan hampers rapi bikin pemberi bangga & tidak malu (Emotional - Hati)',
        category: 'emotional',
      },
    ],
  },
  {
    id: 'emotional_feelings',
    title: 'Perasaan Pembeli — Emotional Value (Bagian 5)',
    subtitle: 'Perasaan utama apa yang paling ingin kamu hadirkan di hati pembeli saat memakai produkmu?',
    linkedSlideIndex: 11,
    type: 'wordcloud',
    options: [
      {
        id: 'Tenang & Aman',
        label: 'Tenang & Aman (Pribadi)',
        subtitle: 'Bebas khawatir karena camilan aman buat anak atau cucian tidak tertukar',
        category: 'emotional',
      },
      {
        id: 'Bangga & Pantas',
        label: 'Bangga & Tidak Malu (Sosial)',
        subtitle: 'Terlihat perhatian dan berkelas di mata orang lain saat memberi hampers/hadiah',
        category: 'emotional',
      },
      {
        id: 'Percaya Diri',
        label: 'Percaya Diri (Pribadi)',
        subtitle: 'Merasa tampil rapi, nyaman di kulit, dan pantas seharian',
        category: 'emotional',
      },
      {
        id: 'Praktis Bebas Repot',
        label: 'Bebas Repot (Hemat Tenaga)',
        subtitle: 'Merasa lega karena urusan rumah/makan malam beres tanpa lelah',
        category: 'emotional',
      },
      {
        id: 'Dihargai',
        label: 'Dihargai & Nyaman',
        subtitle: 'Dilayani dengan ramah, hangat, seperti punya tempat singgah ketiga (Starbucks)',
        category: 'emotional',
      },
      {
        id: 'Dukung Lokal',
        label: 'Bangga Dukung Lokal (Identitas)',
        subtitle: 'Merasa menjadi bagian dari komunitas yang memajukan usaha daerah',
        category: 'emotional',
      },
    ],
  },
];

export const SEMINAR_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'SEMINAR PARTNERUP',
    title: 'Kenapa Pembeli Harus Pilih Kamu?',
    subtitle: 'Value Proposition, Rational Value & Emotional Value untuk UMKM — Program PartnerUp | Obeecreatives',
    type: 'cover',
    speakerNotes:
      'KERANGKA BESAR PEMATERI: Value Proposition (VP) bukan slogan puitis dan bukan sekadar deskripsi barang. VP adalah KEPUTUSAN: memilih melayani siapa, untuk masalah apa, dengan keunggulan apa, dan dibuktikan dengan apa. Rantai 5 Mata kita hari ini: Pembeli -> Masalahnya -> Solusimu -> Buktinya -> Perasaan yang menyertainya.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'KERANGKA 7 LANGKAH',
    title: 'Rantai Nilai yang Akan Kita Latih Hari Ini',
    subtitle: 'Pembeli → Masalahnya → Solusimu → Buktinya → Perasaan yang Menyertainya.',
    type: 'agenda',
    speakerNotes:
      'Tekankan bahwa setiap pilihan berarti ada yang berani kita lepas. Kalau kita mencoba menyenangkan semua orang dengan kalimat umum, hasilnya justru hambar. Tujuh langkah ini dirancang agar peserta pulang membawa 1 kalimat tajam yang langsung siap dipasang di Bio IG, Marketplace, dan WA.',
    cards: [
      { title: '1. Kenalan dengan usahamu', body: 'Membangun "Jalan Pintas Keempat" selain perang harga.', accent: 'orange' },
      { title: '2. Kenali pembelimu', body: 'Memahami Tugas (Jobs), Kesulitan (Pains), & Keraguan pembeli.', accent: 'teal' },
      { title: '3. Apa itu value proposition', body: 'Bedakan Slogan vs Deskripsi vs VP & hitung Biaya Total.', accent: 'orange' },
      { title: '4. Rational value', body: 'Bukti angka yang relevan & trik Hitung per Pemakaian.', accent: 'teal' },
      { title: '5. Emotional value', body: 'Emosi pribadi, nilai sosial, & pendukung fisik nyata.', accent: 'orange' },
      { title: '6. Gabungkan jadi satu kalimat', body: 'Rumus praktis + 3 Alat Uji ("So What?", Dibantah, Ditiru).', accent: 'teal' },
      { title: '7. Dipakai di mana?', body: 'Terapkan di 4 titik temu & uji hasilnya dalam 2 minggu.', accent: 'orange' },
    ],
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'BAGIAN 1',
    title: 'Kenapa Pembeli Butuh Alasan Memilih?',
    subtitle: 'Di marketplace/pasar, biaya pindah ke toko sebelah nyaris nol (cukup geser jari). Tanpa alasan jelas, pembeli hanya melihat harga termurah.',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    speakerNotes:
      'JALAN PINTAS KEEMPAT: Saat bingung, pembeli memakai 3 jalan pintas: (1) Harga termurah, (2) Rating tertinggi, (3) Toko paling ramai. UMKM kecil jarang menang di 3 hal itu. Maka Value Proposition adalah JALAN PINTAS KEEMPAT yang bisa kita bangun sendiri! Gunakan contoh Keripik Tempe A (Rp12rb) vs B (Rp16rb): Harga B lebih mahal Rp4rb tapi menang karena menjawab kekhawatiran ibu yang cari camilan anak tanpa MSG.',
    cards: [
      {
        title: 'Jalan Pintas 1–3 (Berat bagi UMKM)',
        body: 'Perang harga termurah, adu ribuan rating, atau toko paling ramai.',
        extra: 'UMKM baru sering kalah jika bertarung di sini.',
        accent: 'orange',
      },
      {
        title: 'Jalan Pintas Ke-4 (Milikmu!)',
        body: 'Memberi ALASAN SPESIFIK yang menjawab kekhawatiran pembeli.',
        extra: 'Membuat selisih harga Rp4.000 terasa sangat masuk akal.',
        accent: 'teal',
      },
      {
        title: 'Ujian Pertama Kita',
        body: 'Kata "enak & murah" tidak membedakanmu karena semua penjual bilang begitu.',
        extra: 'Sebutkan kekhasan produk andalanmu!',
        accent: 'orange',
      },
    ],
    comparison: {
      leftTitle: 'Penjual Keripik Tempe A (Rp12.000)',
      leftBody: '"Keripik tempe enak, renyah, murah."\n(Tidak ada alasan pembeda — akhirnya cuma diadu harga paling murah)',
      rightTitle: 'Penjual Keripik Tempe B (Rp16.000)',
      rightBody: '"Keripik tempe tipis tanpa MSG untuk anak-anak, renyah sampai hari ke-14, kemasan zip bisa ditutup lagi."\n(Lebih mahal Rp4 ribu tapi dipilih ibu-ibu!)',
    },
    promptLines: [
      'Nama usahaku & produk andalanku: ______________',
      'Sudah berjualan sejak kapan & apa yang sering dipuji pembeli: ______________',
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'BAGIAN 2',
    title: 'Kenali Pembelimu: Tugas & Keraguannya',
    subtitle: 'Orang tidak sekadar membeli barang, tapi "menyewa" produkmu untuk menyelesaikan tugas tertentu (Jobs to be Done).',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    speakerNotes:
      'STUDI KASUS MILKSHAKE PAGI (Clayton Christensen): Pengendara pagi membeli milkshake bukan sekadar ingin minuman manis, tapi butuh teman perjalanan yang tidak tumpah di mobil dan bikin kenyang sampai siang (pesaingnya pisang & donat, bukan milkshake lain!). STUDI KASUS LAUNDRY: 1 usaha yang sama bisa punya 2 VP berbeda untuk Anak Kos vs Ibu Bekerja. KHUSUS ONLINE: Keraguan terbesar adalah takut barang tidak sesuai foto -> butuh penurun risiko.',
    cards: [
      {
        title: 'Studi Kasus Nyata: Milkshake Pagi',
        body: 'Dibeli pengendara pagi agar perjalanan tidak bosan & kenyang sampai siang.',
        extra: 'Pesaing sejati ditentukan oleh TUGAS pembeli, bukan kategori produk.',
        accent: 'teal',
      },
      {
        title: 'Laundry — Target 1: Anak Kos',
        body: 'Tugas: Baju bersih sebelum kuliah lusa. Kesulitan: Takut telat & baju tertukar.',
        extra: 'VP Kuat: "Selesai 24 jam, ada nomor di tiap baju."',
        accent: 'orange',
      },
      {
        title: 'Laundry — Target 2: Ibu Bekerja',
        body: 'Tugas: Urusan cucian beres tanpa repot. Kesulitan: Tidak sempat antar-jemput.',
        extra: 'VP Kuat: "Dijemput dan diantar sampai rumah, wangi dan rapi."',
        accent: 'teal',
      },
    ],
    bottomBanner: 'Jualan Online? Keraguan terbesar pembeli adalah takut barang tak sesuai foto → Siapkan Penurun Risiko (foto asli/garansi tukar).',
    promptLines: [
      'Bayangkan 1 pelanggan langganan nyata — Siapa dia?: ______________',
      'Tugas apa yang ingin dia selesaikan & apa yang membuatnya ragu?: ______________',
    ],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'BAGIAN 3',
    title: 'Pengertian: Slogan vs Deskripsi vs Value Proposition',
    subtitle: 'Jangan tertukar! Value Proposition memuat untuk siapa, manfaat spesifik, dan buktinya.',
    type: 'concept',
    speakerNotes:
      'Bantu peserta membedakan 3 istilah yang sering tertukar: Slogan boleh puitis ("Rasa yang bikin kangen"), Deskripsi hanya menyebut fisik ("Keripik apel 150gr"), sedangkan VP menjawab manfaat spesifik + untuk siapa + bukti ("Camilan apel tanpa pengawet untuk anak, tahan 3 bulan"). Jelaskan juga teori Philip Kotler: Nilai = Manfaat dikurangi Biaya (Uang + Waktu + Tenaga + Risiko).',
    cards: [
      {
        title: 'ARTINYA',
        body: 'Janji nilai yang jelas tentang manfaat spesifik bagi pembeli tertentu beserta buktinya (bukan sekadar slogan puitis "Rasa yang bikin kangen" atau deskripsi "Isi 150gr").',
        accent: 'orange',
      },
      {
        title: 'CONTOHNYA',
        body: 'Warung Bu Sari: "Kenyang sampai pagi, Rp12 ribu, buka sampai jam 12 malam, dekat kos." Menjawab manfaat (kenyang), biaya uang (Rp12rb), dan biaya waktu/tenaga (dekat & buka larut).',
        accent: 'teal',
      },
      {
        title: 'GAMPANG DIINGAT',
        body: 'Nilai Pembeli (Kotler) = Total Manfaat dikurangi Total Biaya (Uang + Waktu + Tenaga + Risiko). Warung lebih mahal tapi dekat & cepat bisa menang dari yang murah tapi jauh!',
        accent: 'orange',
      },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'BAGIAN 3',
    title: 'Tiga Ujian untuk Menilai Value Proposition',
    subtitle: 'Sebelum memakai sebuah kalimat, uji dulu dengan 3 saringan ini:',
    type: 'concept',
    speakerNotes:
      'Tiga ujian ini adalah pisau bedah paling praktis di kelas. Saat peserta membacakan kalimatnya, ajak peserta lain menguji: (1) Apakah relevan dengan masalah pembeli? (2) Apakah penjual sebelah bisa menulis kalimat yang sama persis? Kalau bisa, berarti belum berbeda! (3) Apakah ada bukti yang bisa dicek?',
    cards: [
      {
        title: '1. Relevan (Penting bagi Pembeli?)',
        body: 'Apakah kalimatmu menjawab masalah atau kekhawatiran yang benar-benar dipedulikan pembeli, bukan sekadar membanggakan diri sendiri?',
        accent: 'orange',
      },
      {
        title: '2. Berbeda (Tidak Bisa Disalin Pesaing?)',
        body: 'Apakah pesaing di sebelah tidak bisa menulis kalimat yang sama persis? Kalau semua toko bisa mengklaim kalimat itu, berarti belum VP.',
        accent: 'teal',
      },
      {
        title: '3. Bisa Dipercaya (Ada Buktinya?)',
        body: 'Apakah ada angka, proses, atau jaminan nyata yang mendukung klaim tersebut, atau hanya klaim sepihak?',
        accent: 'orange',
      },
    ],
    bottomBanner: 'Pilih 1–2 manfaat utama saja. Memilih berarti berani menonjolkan yang terkuat agar diingat pembeli.',
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'BAGIAN 3',
    title: 'Latihan Bagian 3: Kenapa Pembeli Memilihmu?',
    subtitle: 'Temukan alasan nyata yang mengurangi biaya uang, waktu, tenaga, atau risiko pembelimu.',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    speakerNotes:
      'Dorong peserta menulis jujur 1-2 alasan utama kenapa pelanggan langganan memilih mereka. Ingatkan daftar 3 Kata Terlarang (Enak, Murah, Berkualitas) di bawah agar mereka langsung menulis alasan yang konkret.',
    cards: [
      { title: '1. Untuk Siapa & Masalah Apa?', body: 'Target pembeli yang spesifik (misal: anak kos lapar tengah malam / ibu cari hampers).', accent: 'orange' },
      { title: '2. Kurangi Biaya Apa?', body: 'Apakah hemat uang, hemat waktu (cepat), hemat tenaga (praktis), atau minim risiko?', accent: 'teal' },
      { title: '3. Apa Buktinya?', body: 'Fakta nyata yang membedakanmu dari penjual sebelah.', accent: 'orange' },
    ],
    comparison: {
      leftTitle: 'Kalimat Umum (Slogan / Klaim Kosong)',
      leftBody: '"Kue kami enak, murah, dan berkualitas tinggi."',
      rightTitle: 'Value Proposition Tajam (Jelas & Terbukti)',
      rightBody: '"Kue kering tanpa pengawet untuk hantaran keluarga, tahan 2 bulan, sudah dikemas rapi siap jadi hampers."',
    },
    promptLines: ['Menurutku pembeli memilih produkku dibanding alternatif lain karena: ______________'],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'BAGIAN 4',
    title: '4 Jenis Alasan Pembeli Memilih Kamu',
    subtitle: '3 jenis pertama = Rational (Otak / Hitungan)  |  Jenis keempat = Emotional (Hati / Perasaan)',
    type: 'worksheet',
    linkedPollId: 'rational_4types',
    speakerNotes:
      'Ajak seluruh ruangan mengikuti Live Polling di HP mereka: dari 4 jenis alasan ini, mana yang saat ini menjadi senjata utama usaha mereka? Ingatkan bahwa harga murah bukan satu-satunya jalan!',
    cards: [
      {
        title: '1. Harga & Hemat Pakai',
        body: 'Paket hemat atau harga per pemakaian lebih rendah.',
        extra: 'Contoh: Nasi goreng Rp12rb porsi kenyang / Tas awet Rp6rb/bulan.',
        accent: 'orange',
      },
      {
        title: '2. Kualitas & Bahan',
        body: 'Diterjemahkan menjadi manfaat yang dirasakan tubuh/pembeli.',
        extra: 'Contoh: "Tanpa pewarna -> Aman untuk kulit sensitif."',
        accent: 'orange',
      },
      {
        title: '3. Kemudahan & Garansi',
        body: 'Hemat waktu, tenaga, dan menurunkan risiko salah beli.',
        extra: 'Contoh: Selesai 24 jam, bisa COD, garansi tukar ukuran.',
        accent: 'orange',
      },
      {
        title: '4. Pengalaman & Rasa',
        body: 'Perasaan tenang, bangga, dan dihargai.',
        extra: 'Contoh: Kemasan hampers rapi yang bikin bangga saat diberikan.',
        accent: 'teal',
      },
    ],
    promptLines: ['POLLING INTERAKTIF: Pilih jenis keunggulan yang paling cocok untuk produkmu di HP!'],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'BAGIAN 4',
    title: 'Pendalaman Rational Value: Relevansi & Hitung per Pemakaian',
    subtitle: 'Prinsip terpenting: Relevansi mengalahkan jumlah. Angka baru berguna jika menjawab hal yang dipedulikan pembeli.',
    type: 'comparison',
    speakerNotes:
      'TRIK HITUNG PER PEMAKAIAN: Ini senjata rahasia untuk UMKM yang harga jualnya tidak murah (fashion, tas, sepatu, alat rumah tangga). Tas A Rp80rb tahan 3 bulan = Rp26.700/bln. Tas B Rp150rb tahan 2 tahun = Rp6.250/bln! Kalau hanya tulis "tas awet", pembeli tidak sadar hitungannya. Kalau ditulis "setara Rp6 ribu per bulan", rational value-nya langsung hidup! Jelaskan juga contoh Sabun 100gr untuk kulit sensitif.',
    cards: [
      {
        title: 'Terjemahkan Kualitas Jadi Dampak',
        body: 'Klaim "100% bahan alami" sering terasa abstrak. Ubah menjadi dampak yang dirasakan: "Tidak membuat tenggorokan gatal" atau "Cocok untuk kulit sensitif".',
        accent: 'orange',
      },
      {
        title: 'Studi Kasus: Sabun Buatan Sendiri',
        body: 'Awalnya: "Sabun alami, bagus untuk kulit." Dipertajam menjadi: "Sabun 100gr tanpa pewarna & pengawet, cocok untuk kulit sensitif, pakai sampai 1,5 bulan, Rp10 ribu."',
        accent: 'teal',
      },
      {
        title: '5 Bukti Tanpa Sertifikat Formal',
        body: 'Belum punya izin PIRT/Halal? Mulai dari: (1) Foto/video proses asli, (2) Sampel uji coba, (3) Testimoni detail, (4) Gramasi konsisten, (5) Garansi ganti baru.',
        accent: 'orange',
      },
    ],
    comparison: {
      leftTitle: 'Tas A — Harga Rp80.000 (Tahan 3 Bulan)',
      leftBody: 'Terlihat murah di awal, tapi cepat rusak.\nHitungan pemakaian: Rp26.700 per bulan (Jatuhnya Mahal!).',
      rightTitle: 'Tas B — Harga Rp150.000 (Tahan 2 Tahun / 24 Bulan)',
      rightBody: 'Jangan cuma tulis "Tas Awet". Tulislah:\n"Tahan 2 tahun — setara cuma Rp6.250 per bulan!" (Rational Value Hidup!)',
    },
    bottomBanner: 'Selalu tanya pada setiap angka yang kamu tulis: "Angka ini penting untuk siapa?"',
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'BAGIAN 4',
    title: 'Latihan Bagian 4: Tulis 2 Bukti Rational Value Usahamu',
    subtitle: 'Gunakan angka, masa pakai, ukuran, dampak nyata, atau bukti proses yang bisa langsung dicek pembeli.',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    speakerNotes:
      'Pandu peserta melihat Kamus Terjemahan 5 Kategori UMKM di layar. Bagi peserta yang usahanya baru mulai dan belum punya sertifikat formal, ingatkan bahwa foto dapur bersih, garansi tukar, atau hitungan pemakaian adalah bukti rasional yang sangat kuat.',
    cards: [
      { title: '1. Harga / Hitung Pakai', body: 'Paket hemat, harga per porsi/bulan', accent: 'orange' },
      { title: '2. Isi & Ukuran', body: 'Gramasi jelas, potongan konsisten', accent: 'teal' },
      { title: '3. Bahan & Dampak', body: 'Tanpa MSG, aman untuk anak/kulit sensitif', accent: 'orange' },
      { title: '4. Daya Tahan / Garansi', body: 'Tahan 3 bulan, garansi tukar jika cacat', accent: 'teal' },
      { title: '5. Kemudahan & Bukti', body: 'Kirim cepat, COD, video proses asli', accent: 'orange' },
    ],
    bottomBanner: 'Ubah kata sifat jadi bukti: "awet" → "tahan 3 bulan"  |  "bagus" → "garansi tidak puas kami ganti"',
    promptLines: [
      'Keunggulan 1 (pakai angka / hitungan / bukti nyata): ______________',
      'Keunggulan 2 (pakai angka / hitungan / bukti nyata): ______________',
    ],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'BAGIAN 5',
    title: 'Pendalaman Emotional Value: Pribadi, Sosial & Komunitas',
    subtitle: 'Perasaan yang didapat pembeli sebelum, saat, dan sesudah memakai produkmu — harus jujur dan didukung hal fisik nyata.',
    type: 'concept',
    speakerNotes:
      'STUDI KASUS NYATA STARBUCKS ("Tempat Ketiga" / Ray Oldenburg): Kenapa kopi Rp25 ribu di kafe nyaman laku dibanding kopi Rp5 ribu? Karena orang membeli suasana nyaman dan tempat singgah antara rumah dan kantor. Perhatikan bahwa emotional value Starbucks didukung hal FISIK NYATA (kursi nyaman, AC, Wi-Fi, sapaan ramah), bukan sekadar kata-kata manis! Tekankan juga Batas Etika: jangan klaim "ajaib/pasti sembuh" tanpa dasar.',
    cards: [
      {
        title: '1. Emosional Pribadi',
        body: 'Perasaan di dalam diri pembeli sendiri: merasa tenang, aman buat anak, percaya diri, lega bebas repot, atau bernostalgia.',
         extra: 'Contoh: Baju rapi yang bikin karyawati percaya diri.',
        accent: 'orange',
      },
      {
        title: '2. Nilai Sosial (Di Mata Orang Lain)',
        body: 'Bagaimana pembeli terlihat di hadapan orang lain: terlihat perhatian, menghormati, dan tidak malu saat menyerahkan hampers/oleh-oleh.',
        extra: 'Contoh: Hampers kue dengan kemasan kokoh & kartu ucapan.',
        accent: 'teal',
      },
      {
        title: '3. Rasa Memiliki & Studi Kasus Starbucks',
        body: 'Merasa jadi bagian komunitas / bangga dukung lokal. Seperti "Tempat Ketiga" Starbucks: kopi Rp25rb laku karena didukung tempat duduk nyaman & pelayanan hangat.',
        extra: 'Batas Etika: Setiap janji emosi wajib didukung bukti fisik nyata!',
        accent: 'orange',
      },
    ],
    bottomBanner: 'Tips Menggali Emosi: "Setelah pelanggan menerima barangmu, apa yang dia ceritakan ke orang lain?"',
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'BAGIAN 5',
    title: 'Latihan Bagian 5: Perasaan Pembeli & Pendukung Nyatanya',
    subtitle: 'Pancingan mudah: Setelah pelanggan menerima produkmu, kalimat apa yang dia ceritakan ke keluarga atau temannya?',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    linkedPollId: 'emotional_feelings',
    speakerNotes:
      'Gunakan contoh Hampers Kue di layar: Rational-nya adalah isi 12 potong, tahan 2 bulan, Rp85 ribu. Emotional-nya adalah pemberi merasa perhatian & tidak malu saat menyerahkan hadiah, dan itu diperkuat oleh hal nyata: kemasan rapi, kartu ucapan, dan foto yang meyakinkan.',
    cards: [
      {
        title: 'Hampers Kue (Nilai Sosial)',
        body: 'Pemberi merasa perhatian & tidak malu saat menyerahkan hadiah; penerima merasa dihargai.',
        extra: 'Pendukung nyata: Kemasan box rapi + kartu ucapan.',
        accent: 'orange',
      },
      {
        title: 'Baju Muslim (Emosi Pribadi)',
        body: 'Merasa percaya diri, rapi, dan adem seharian di kantor.',
        extra: 'Pendukung nyata: Bahan katun dingin & jahitan halus.',
        accent: 'teal',
      },
      {
        title: 'Laundry (Ketenangan)',
        body: 'Merasa tenang dan lega karena urusan cucian beres tepat waktu.',
        extra: 'Pendukung nyata: Nomor di tiap baju & antar tepat jam.',
        accent: 'orange',
      },
    ],
    promptLines: [
      'Perasaan yang didapat pembeliku (pribadi / sosial): ______________',
      'Hal fisik nyata yang mendukung perasaan itu (kemasan, rasa, layanan): ______________',
    ],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'RINGKASAN PSIKOLOGI PEMBELI',
    title: 'Bagaimana Otak dan Hati Pembeli Bekerja Bersama?',
    subtitle: 'Untuk pembeli UMKM yang sensitif harga: Bukti angka menjadi pintu masuk, perasaan yang membuat mereka memilihmu & kembali lagi.',
    type: 'comparison',
    speakerNotes:
      'PENTING DARI HALAMAN 5 PDF: Dalam psikologi keputusan (Daniel Kahneman), emosi dan intuisi memang berperan besar. Namun untuk pembeli UMKM yang sensitif harga, jangan ajarkan emosi berdiri sendiri tanpa angka! Urutan emasnya adalah: Rational Value menjadi PINTU MASUK (pembeli yakin produk ini layak dibeli), sedangkan Emotional Value yang membuat mereka memilih kita dibanding pesaing setara dan menjadi pelanggan setia.',
    comparison: {
      leftTitle: '1. Rational Value = Pintu Masuk (Agar Pembeli Yakin)',
      leftBody: 'Isi 150 gram, tanpa pengawet, tahan 3 bulan, mulai Rp15 ribu.\nMenjawab otak pembeli: "Apakah produk ini layak dibeli dan hitungannya masuk akal?"',
      rightTitle: '2. Emotional Value = Pengikat (Agar Memilihmu & Kembali Lagi)',
      rightBody: 'Camilan yang bikin orang tua tenang dan keluarga senang saat kumpul.\nMenjawab hati pembeli: "Kenapa saya lebih suka beli di toko ini daripada yang lain?"',
    },
    bottomBanner: 'Urutan Menyampaikan: Bukti dulu agar pembeli yakin, rasa agar pembeli terikat. Emosi dan angka bekerja bersama!',
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'BAGIAN 6',
    title: 'Evolusi 3 Versi Kalimat: Dari Lemah Menjadi Tajam',
    subtitle: 'Rumus: [Produk] untuk [pembeli] yang ingin [manfaat/perasaan], karena [bukti/keunggulan].',
    type: 'formula',
    speakerNotes:
      'Tampilkan satu per satu (dengan Animasi Poin PPT) bagaimana kalimat Keripik Apel berevolusi dari Versi 1 (gagal di semua ujian) -> Versi 2 (ada bukti tapi belum jelas untuk siapa) -> Versi 3 (lengkap ada pembeli, perasaan aman, dan bukti angka). Urutan rumus ini memaksa kita menyebut pembeli, tugas/perasaan, dan bukti dalam satu napas!',
    cards: [
      {
        title: 'Versi 1: Belum Lolos Uji',
        body: '"Keripik apel enak dan murah."',
        extra: 'Gagal 3 ujian: Tidak jelas untuk siapa, tidak ada bukti angka, semua pesaing bisa bilang begini.',
        accent: 'orange',
      },
      {
        title: 'Versi 2: Baru Ada Bukti',
        body: '"Keripik apel Batu tanpa pengawet, tahan 3 bulan, Rp15 ribu."',
        extra: 'Sudah ada bukti rasional, tapi belum memanggil siapa pembelinya dan belum menyentuh perasaan.',
        accent: 'teal',
      },
      {
        title: 'Versi 3: Lengkap & Siap Pakai!',
        body: '"Keripik apel asli Batu untuk orang tua yang cari camilan aman buat anak, karena tanpa pengawet dan tahan 3 bulan, mulai Rp15 ribu."',
        extra: 'Ada pembeli spesifik (orang tua), perasaan (aman buat anak), dan bukti (tanpa pengawet, 3 bln, Rp15rb)!',
        accent: 'orange',
      },
    ],
    bottomBanner: 'Aturan Fokus: Pilih 1–2 manfaat utama saja di kalimat andalan agar langsung menancap di ingatan pembeli.',
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'LATIHAN BAGIAN 6',
    title: 'Saatnya Menulis & Menguji Kalimat Usahamu!',
    subtitle: 'Setelah menulis kalimatmu, uji dengan 3 Pertanyaan Penguji di bawah ini:',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    speakerNotes:
      'Saat jawaban peserta mulai masuk di layar proyektor, pilih 2-3 kalimat peserta untuk disorot (Star), lalu ajak peserta mengujinya bersama-sama dengan 3 Alat Uji: (1) Lalu kenapa / So what?, (2) Bisa dibantah?, (3) Bisa ditiru pesaing?',
    cards: [
      {
        title: '1. Uji "Lalu Kenapa?" (So What?)',
        body: 'Bacakan kalimatmu lalu tanya: "Lalu kenapa pembeli harus peduli?" Kalau belum menyentuh kebutuhan pembeli, pertajam lagi.',
        accent: 'orange',
      },
      {
        title: '2. Uji "Bisa Dibantah?"',
        body: 'Kalau masih ada klaim sepihak yang tidak bisa diuji (misal: "terbaik / nomor 1"), ganti dengan angka atau fakta yang bisa dicek.',
        accent: 'teal',
      },
      {
        title: '3. Uji "Bisa Ditiru Pesaing?"',
        body: 'Kalau penjual sebelah bisa menyalin kalimatmu tanpa berbohong, tambahkan ciri khas proses/layananmu.',
        accent: 'orange',
      },
    ],
    promptLines: [
      'Kalimat Value Proposition usahaku: ______________',
      'Hasil cek 3 ujian (Lalu kenapa? / Bisa dibantah? / Bisa ditiru?): ______________',
    ],
  },
  {
    index: 15,
    pageNumber: 16,
    badge: 'BAGIAN 7',
    title: 'Menerapkan & Mengecek Apakah VP Bekerja',
    subtitle: 'Kalimat bagus di buku catatan tidak menghasilkan apa-apa. Nilainya muncul saat dipasang konsisten di tempat pembeli bertemu usahamu.',
    type: 'worksheet',
    linkedQuestionIndex: 6,
    speakerNotes:
      'Tunjukkan bagaimana 1 VP Kue Kering Hampers diterjemahkan ke 4 tempat berbeda (Bio IG, Judul Marketplace, Foto Pertama/Kemasan, dan Balasan Chat WA). Lalu berikan 3 cara sederhana mengecek apakah VP bekerja dalam 2 minggu ke depan!',
    cards: [
      { title: '1. Bio Sosmed (Pendek)', body: '"Kue kering hampers tanpa pengawet, tahan 2 bulan. Rapi, siap kirim."', accent: 'orange' },
      { title: '2. Judul Marketplace', body: 'Sebut manfaat utama & kata yang dicari pembeli, bukan cuma nama barang.', accent: 'teal' },
      { title: '3. Foto Pertama & Kemasan', body: 'Tunjukkan bukti secara visual (misal: foto kemasan box pita siap dihadiahkan).', accent: 'orange' },
      { title: '4. Balasan Chat WA', body: 'Siapkan salam pembuka & jawaban untuk keraguan yang sering ditanyakan.', accent: 'teal' },
      { title: '5. Uji 2 Minggu (Iterasi)', body: 'VP bukan sekali jadi — tajamkan terus dari umpan balik pelanggan.', accent: 'orange' },
    ],
    comparison: {
      leftTitle: 'Cara Cek #1: Tanya Pelanggan Baru',
      leftBody: 'Tanyakan: "Kenapa Kakak memilih beli di sini?"\nKalau jawabannya mirip dengan kalimat VP-mu, berarti pesanmu sudah sampai!',
      rightTitle: 'Cara Cek #2: Amati Chat & Uji 2 Versi',
      rightBody: 'Kalau banyak yang tanya hal sama di chat, masukkan jawabannya ke bio/foto. Uji 2 versi kalimat di 2 minggu berbeda, lihat mana yang paling banyak menghasilkan chat!',
    },
    promptLines: [
      'Tempat pertama yang akan memakai kalimatku malam ini: ______________',
      'Cara mengecek / langkah nyata dalam 3 hari ke depan: ______________',
    ],
  },
  {
    index: 16,
    pageNumber: 17,
    badge: 'PENUTUP & TANYA JAWAB',
    title: '5 Hal Inti Penguasaan Value Proposition UMKM',
    subtitle: 'Terima kasih! Silakan kirim pertanyaan di Q&A Anonim & ambil Template Bio IG / WA di HP masing-masing.',
    type: 'closing',
    speakerNotes:
      'Ini adalah 5 kesimpulan puncak dari keseluruhan seminar kita. Setelah membuka ke-5 poin ini satu per satu, buka sesi Q&A Interaktif. Gunakan contekan "5 Pertanyaan Sulit Peserta" di layar Remote HP / Meja Presenter Anda jika ada pertanyaan seputar perang harga atau produk yang mirip pesaing!',
    cards: [
      { title: '1. VP adalah Keputusan Memilih', body: 'Memilih siapa pembeli yang dilayani, masalah apa yang dibereskan, dan keunggulan apa yang ditonjolkan (bukan sekadar slogan).', accent: 'orange' },
      { title: '2. Manfaat Dikurangi Total Biaya', body: 'Pembeli menghitung manfaat dikurangi biaya uang, waktu, tenaga, dan risiko salah pilih.', accent: 'teal' },
      { title: '3. Rational Value Harus Relevan & Terbukti', body: 'Angka harus penting bagi pembeli, bisa dicek, atau dihitung per pemakaian.', accent: 'orange' },
      { title: '4. Emotional Value Jujur & Didukung Fisik Nyata', body: 'Bukti menjadi pintu masuk agar pembeli yakin; rasa nyaman/bangga membuat mereka kembali lagi.', accent: 'teal' },
      { title: '5. Lolos 3 Ujian & Dipakai Konsisten', body: 'Relevan ("So what?"), tidak bisa dibantah, tidak bisa ditiru pesaing, lalu dipasang di Bio, Foto, Kemasan & Chat.', accent: 'orange' },
    ],
  },
];

export const FORBIDDEN_VAGUE_WORDS = [
  {
    vague: '"Enak & Lezat"',
    reason: 'Semua penjual makanan bilang enak. Pembeli belum pernah mencicipi sebelum beli.',
    better: '"Tanpa MSG aman untuk anak, renyah sampai hari ke-14, kemasan zip"',
  },
  {
    vague: '"Murah & Terjangkau"',
    reason: 'Harga murah mudah ditiru pesaing dan menekan margin. Gunakan alasan hemat yang terukur.',
    better: '"Rp12 ribu kenyang sampai pagi / Tahan 2 tahun (setara Rp6.250 per bulan)"',
  },
  {
    vague: '"Berkualitas / Alami"',
    reason: 'Terlalu abstrak. Terjemahkan menjadi dampak yang langsung dirasakan pembeli.',
    better: '"Tanpa pewarna (aman untuk kulit sensitif) / Garansi tukar ukuran jika tidak pas"',
  },
];

export const RATIONAL_CONVERSION_DICTIONARY = [
  {
    category: 'Kuliner & Camilan',
    vagueWord: '"Enak, renyah, murah"',
    concreteProof: 'Tipis tanpa MSG untuk anak · Renyah sampai hari ke-14 · Kemasan zip rapat',
    chipText: 'tanpa MSG aman untuk anak, tahan renyah 14 hari dengan kemasan zip',
  },
  {
    category: 'Jasa & Laundry',
    vagueWord: '"Cepat, bersih, rapi"',
    concreteProof: 'Selesai 24 jam · Ada nomor di tiap baju (anti tertukar) · Jemput & antar ke rumah',
    chipText: 'selesai 24 jam tepat waktu, ada nomor di tiap baju & gratis antar-jemput',
  },
  {
    category: 'Fashion, Tas & Kerajinan',
    vagueWord: '"Bahan bagus & awet"',
    concreteProof: 'Tahan pakai 2 tahun (setara Rp6.250/bulan) · Garansi tukar ukuran jika tidak pas',
    chipText: 'tahan pakai 2 tahun (setara Rp6 ribuan/bulan) & garansi tukar ukuran',
  },
  {
    category: 'Perawatan & Herbal',
    vagueWord: '"100% bahan alami"',
    concreteProof: '100 gram tanpa pewarna · Cocok untuk kulit sensitif · Pakai sampai 1,5 bulan Rp10rb',
    chipText: 'tanpa pewarna sehingga aman untuk kulit sensitif, awet 1,5 bulan',
  },
  {
    category: 'Bukti UMKM Pemula (Tanpa Sertifikat)',
    vagueWord: '"Dijamin terpercaya"',
    concreteProof: 'Ada video proses dapur bersih · Tersedia sampel coba dulu · Garansi ganti baru',
    chipText: 'ada video proses pembuatan asli & garansi tidak puas kami ganti baru',
  },
];

export const INITIAL_SEED_ANSWERS = [
  {
    q: 0,
    text: 'Keripik Apel Bu Sari — Keripik apel asli Batu potongan tebal tanpa minyak berlebih.',
    subText: 'Jalan 1 tahun. Pelanggan paling sering memuji kerenyahannya yang tahan 2 minggu walau sudah dibuka.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 8,
    mentorNote: 'Bagus! Sudah menemukan pujian pelanggan (tahan renyah 2 minggu) sebagai modal Jalan Pintas Keempat.',
    ts: Date.now() - 3600000,
  },
  {
    q: 0,
    text: 'Sabun Alami Kemuning — Sabun mandi batang 100gr tanpa pewarna untuk kulit sensitif.',
    subText: 'Baru mulai 3 bulan lalu lewat WhatsApp.',
    businessName: 'Sabun Alami Kemuning',
    participantId: 'seed_kemuning',
    status: 'approved' as const,
    star: false,
    likes: 5,
    mentorNote: '',
    ts: Date.now() - 3400000,
  },
  {
    q: 0,
    text: 'Laundry Kilat Berkah — Cuci setrika harian khusus mahasiswa & anak kos.',
    subText: 'Sudah jalan 2 tahun dekat kampus.',
    businessName: 'Laundry Kilat Berkah',
    participantId: 'seed_berkah',
    status: 'approved' as const,
    star: false,
    likes: 4,
    mentorNote: '',
    ts: Date.now() - 3200000,
  },
  {
    q: 1,
    text: 'Orang tua muda yang cari camilan sore aman untuk anak tanpa khawatir batuk.',
    subText: 'Tugasnya: camilan praktis di rumah. Keraguannya: takut ada MSG, pemanis buatan, atau cepat melempem.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'kecil' as const,
    likes: 6,
    mentorNote: 'Sangat tajam! Tugas pembeli (camilan praktis anak) dan keraguannya (takut MSG/batuk) sangat spesifik.',
    ts: Date.now() - 3000000,
  },
  {
    q: 2,
    text: 'Kue kering tanpa pengawet untuk hantaran keluarga, tahan 2 bulan, kemasan box tebal bebas penyok.',
    subText: 'Bukan sekadar slogan atau berat gram, tapi alasan kenapa pembeli memilih produk kami.',
    businessName: 'Dapur Hampers Sari',
    participantId: 'seed_dapurhampers',
    status: 'approved' as const,
    star: false,
    likes: 5,
    mentorNote: '',
    ts: Date.now() - 2800000,
  },
  {
    q: 3,
    text: '1. Tanpa pengawet & tahan 3 bulan. 2. Kemasan zip 150 gram Rp15 ribu (garansi ganti baru jika melempem).',
    subText: 'Ada video proses penggorengan vakum bersih di highlight Instagram.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 9,
    mentorNote: 'Semua poin bisa dicek pembeli: berat 150gr, masa simpan 3 bulan, harga Rp15rb, plus garansi penurun risiko!',
    ts: Date.now() - 2500000,
  },
  {
    q: 4,
    text: 'Orang tua merasa tenang memberi camilan ke anak, dan bangga tidak malu saat membawanya sebagai oleh-oleh.',
    subText: 'Didukung kemasan standing pouch tebal ber-zip dan potongan apel asli yang rapi.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: false,
    likes: 7,
    mentorNote: 'Menggabungkan Emosi Pribadi (tenang buat anak) dan Nilai Sosial (bangga saat bawa oleh-oleh) dengan pendukung fisik nyata!',
    ts: Date.now() - 2000000,
  },
  {
    q: 5,
    text: 'Keripik apel asli Batu untuk orang tua yang cari camilan aman buat anak, karena tanpa pengawet dan tahan 3 bulan, mulai Rp15 ribu.',
    subText: 'Lolos 3 Ujian: Jelas untuk orang tua, bukti angka tidak bisa dibantah, dan punya garansi renyah.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 14,
    mentorNote: 'Kalimat Versi 3 yang sempurna — menjawab siapa pembelinya, perasaannya, dan buktinya dalam satu napas!',
    ts: Date.now() - 1500000,
  },
  {
    q: 6,
    text: 'Pasang di Bio Instagram, foto pertama katalog WA, & salam pembuka chat malam ini. Minggu depan tanya 5 pembeli baru alasan mereka memilih kami.',
    subText: 'Fokus uji coba 7 hari untuk melihat kenaikan jumlah chat yang bertanya.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'kecil' as const,
    likes: 8,
    mentorNote: 'Langkah eksekusi yang jelas dan langsung menguji apakah VP bekerja di lapangan.',
    ts: Date.now() - 1200000,
  },
];

export const INITIAL_SEED_QNA = [
  {
    text: 'Kak, produk saya sama persis dengan penjual sebelah (sama-sama jual keripik singkong), apa yang bisa saya bedakan kalau barangnya mirip?',
    authorName: 'Anonim (UMKM Camilan)',
    isAnonymous: true,
    topicTag: 'Value Proposition',
    upvotes: 14,
    status: 'approved' as const,
    star: true,
    participantId: 'seed_qna_1',
    ts: Date.now() - 1800000,
  },
  {
    text: 'Kalau usaha saya baru mulai dari rumah dan belum punya sertifikat PIRT/Halal atau ratusan ulasan marketplace, bagaimana cara membuktikan Rational Value?',
    authorName: 'Dapur Kue Mbak Rini',
    isAnonymous: false,
    topicTag: 'Rational Value (Bukti)',
    upvotes: 11,
    status: 'approved' as const,
    star: false,
    participantId: 'seed_qna_2',
    ts: Date.now() - 1400000,
  },
  {
    text: 'Pembeli di tempat saya rata-rata cuma tanya "Berapa harganya? Kok lebih mahal Rp3.000 dari toko sebelah?". Bagaimana cara menghadapi pembeli yang cuma lihat harga?',
    authorName: 'Anonim',
    isAnonymous: true,
    topicTag: 'Strategi Harga',
    upvotes: 9,
    status: 'approved' as const,
    star: false,
    participantId: 'seed_qna_3',
    ts: Date.now() - 900000,
  },
];

// ============================================================================
// PANDUAN & SIMULASI KHUSUS SESI 2 PARTNERUP (Target, Margin, Copywriting VP)
// ============================================================================

export const SESI_2_MARGIN_BENCHMARKS = [
  {
    sector: 'F&B (Yoghurt, Keripik, Olahan)',
    healthyRange: 'Margin Ideal: 30% – 50%',
    costReminder: 'Wajib hitung: bahan baku + kemasan segel/zip + stiker + es/gas + susut.',
    chipText: 'Harga jual Rp15.000, Total modal + kemasan VP Rp8.500, Untung bersih Rp6.500 (Margin 43%)',
  },
  {
    sector: 'Kriya / Handycraft',
    healthyRange: 'Margin Ideal: 40% – 70%',
    costReminder: 'Wajib hitung: bahan + ongkos kerja tangan per jam + box kado & kartu ucapan.',
    chipText: 'Harga jual Rp125.000, Total modal + upah jahit + box kado Rp55.000, Untung bersih Rp70.000 (Margin 56%)',
  },
  {
    sector: 'Jasa Persewaan',
    healthyRange: 'Margin Ideal: 50% – 70%',
    costReminder: 'Sisihkan 15%–20% per transaksi untuk biaya cuci/steril, antar, & dana perbaikan alat.',
    chipText: 'Tarif sewa Rp350.000/hari, Biaya steril + bensin + cadangan rawat Rp110.000, Untung bersih Rp240.000 (Margin 68%)',
  },
];

export const SESI_2_BUNDLING_TEMPLATES = [
  {
    sector: 'F&B (Yoghurt / Keripik)',
    idea: 'Paket Sehat Keluarga / Hampers Camilan (Isi 4–5 pcs)',
    chipText: 'Target 25 unit/hari — bikin "Paket Keluarga Isi 5 Botol/Pouch" cukup cari 5 pembeli/hari!',
  },
  {
    sector: 'Kriya (Tas / Kerajinan)',
    idea: 'Paket Kado Siap Beri (Produk Utama + Dompet Kecil + Box & Kartu)',
    chipText: 'Target 2 set/hari — gabungkan "Tas Rajut + Dompet Koin dalam Box Kado" agar nilai transaksi naik 40%!',
  },
  {
    sector: 'Jasa Persewaan',
    idea: 'Paket Sewa 3 Hari Hemat / Paket Lengkap Acara + Ekstra Perlengkapan',
    chipText: 'Target 4 paket/minggu — tawarkan "Paket Komplit 2 Hari Free Setup" agar penyewa tidak ambil satuan!',
  },
];

export const SESI_2_COPYWRITING_TEMPLATES = [
  {
    sector: 'F&B (Yoghurt / Keripik)',
    chipText: '[Hook]: Sering khawatir jajan anak di luar pakai pemanis buatan? [Bukti]: Yoghurt segar fermentasi 12 jam tanpa pengawet, botol segel + tahan dingin 7 hari. [Ajakan]: Ambil Paket Keluarga 5 botol Rp70rb hari ini — balas MAU PAKET!',
  },
  {
    sector: 'Kriya (Handycraft)',
    chipText: '[Hook]: Cari kado unik buat sahabat yang gak gampang rusak & gak pasaran? [Bukti]: Tas rajut tangan jahitan rapat anti-brudul, sudah termasuk box kado & kartu ucapan nama. [Ajakan]: Slot custom minggu ini sisa 4 pcs — chat WA sekarang!',
  },
  {
    sector: 'Jasa Persewaan',
    chipText: '[Hook]: Takut alat acara datang telat atau kotor pas hari H? [Bukti]: Semua unit kami disterilkan & dicek fungsi 1 hari sebelumnya + garansi tiba 2 jam sebelum acara! [Ajakan]: Cek tanggal kosong & Paket Komplit hemat via WA di bio!',
  },
];

export const SESI_2_THREE_CHECKS = [
  {
    title: '1. Ada Hook Masalah?',
    question: 'Apakah kalimat pertama langsung menyentuh kekhawatiran atau kebutuhan pembelimu?',
    passCriteria: 'Jangan buka dengan "Ready stock...", mulailah dengan situasi pembelimu.',
  },
  {
    title: '2. Ada Bukti Nyata VP?',
    question: 'Apakah tertulis angka, masa tahan, proses dapur/steril, atau jaminan layanan?',
    passCriteria: 'Pembeli percaya pada bukti terukur, bukan kata "murah" atau "terbaik".',
  },
  {
    title: '3. Jelas Paket & Ajakan?',
    question: 'Apakah pembaca tahu paket bundling apa yang harus dipilih & cara chatnya sekarang?',
    passCriteria: 'Tambahkan batas waktu/slot hari ini agar pembeli langsung menghubungi WA.',
  },
];

export const SESI_2_SEED_ANSWERS = [
  // Q0: Review Value Proposition & Biaya Menjaga Janji
  {
    q: 0,
    text: 'Yoghurt segar tanpa pemanis buatan untuk ibu & anak, tahan dingin 7 hari. Hal wajib: botol segel higienis + ice pack kirim.',
    subText: 'F&B — Biaya botol segel & ice gel Rp1.800/pesanan sudah masuk perhitungan.',
    businessName: 'Yoghurt Segar Mbak Nisa',
    participantId: 'seed_s2_nisa',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 9,
    mentorNote: 'Mantap! Janji tanpa pemanis buatan langsung dikawal biaya botol segel dan ice gel agar kualitas tidak turun.',
    ts: Date.now() - 3600000,
  },
  {
    q: 0,
    text: 'Tas rajut handmade jahitan rapat untuk kado spesial. Hal wajib: box tebal + pita + kartu ucapan custom gratis.',
    subText: 'Kriya — Menjaga kesan pantas jadi hadiah tanpa terlihat murahan.',
    businessName: 'Tas Rajut Kreasi Mbak Dita',
    participantId: 'seed_s2_dita',
    status: 'approved' as const,
    star: false,
    likes: 6,
    mentorNote: '',
    ts: Date.now() - 3500000,
  },
  {
    q: 0,
    text: 'Sewa perlengkapan piknik & acara bersih wangi bebas repot. Hal wajib: cuci steril tiap kembali + tiba 2 jam sebelum acara.',
    subText: 'Jasa Persewaan — Cadangan waktu kirim dan laundry unit selalu dihitung.',
    businessName: 'Berkah Event Rental',
    participantId: 'seed_s2_berkah',
    status: 'approved' as const,
    star: false,
    likes: 5,
    mentorNote: '',
    ts: Date.now() - 3400000,
  },
  // Q1: Target Laba Bersih Bulanan
  {
    q: 1,
    text: 'Target laba bersih Rp4.500.000/bulan (Rp3 juta gaji saya pribadi + Rp1,5 juta tabungan beli chiller display baru).',
    subText: 'Dihitung dari 25 hari produksi efektif per bulan.',
    businessName: 'Yoghurt Segar Mbak Nisa',
    participantId: 'seed_s2_nisa',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'kecil' as const,
    likes: 8,
    mentorNote: 'Contoh kompas yang sangat sehat! Memisahkan gaji pemilik dan tabungan ekspansi alat.',
    ts: Date.now() - 3100000,
  },
  {
    q: 1,
    text: 'Target laba bersih Rp3.500.000/bulan agar tidak perlu kerja sambilan lagi dan bisa tambah stok benang premium.',
    subText: 'Kriya rumahan dikerjakan berdua dengan asisten jahit.',
    businessName: 'Tas Rajut Kreasi Mbak Dita',
    participantId: 'seed_s2_dita',
    status: 'approved' as const,
    star: false,
    likes: 5,
    mentorNote: '',
    ts: Date.now() - 3000000,
  },
  {
    q: 1,
    text: 'Target laba bersih Rp5.000.000/bulan di luar dana perawatan tenda & kursi.',
    subText: 'Fokus sewa akhir pekan (Jumat–Minggu) + acara kantor hari kerja.',
    businessName: 'Berkah Event Rental',
    participantId: 'seed_s2_berkah',
    status: 'approved' as const,
    star: false,
    likes: 6,
    mentorNote: '',
    ts: Date.now() - 2900000,
  },
  // Q2: Harga Jual, Total Modal + Biaya VP, & Margin Bersih
  {
    q: 2,
    text: 'Harga jual Rp15.000/botol. Total modal bahan + botol segel + stiker + es = Rp8.500. Untung bersih Rp6.500/botol (Margin 43%).',
    subText: 'Lolos batas sehat F&B (30%–50%), masih aman kasih diskon paket 5 botol.',
    businessName: 'Yoghurt Segar Mbak Nisa',
    participantId: 'seed_s2_nisa',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 11,
    mentorNote: 'Margin 43% sangat ideal! Ongkos jaga janji VP (segel & es) sudah masuk sebelum untung.',
    ts: Date.now() - 2600000,
  },
  {
    q: 2,
    text: 'Keripik Apel 150gr harga jual Rp18.000. Modal apel + minyak vakum + pouch zip foil + stiker = Rp10.500. Untung bersih Rp7.500 (Margin 41%).',
    subText: 'Dulu jual Rp12rb modal plastik biasa untungnya habis dimakan ongkos kirim & kemasan penyok.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_s2_busari',
    status: 'approved' as const,
    star: false,
    likes: 7,
    mentorNote: '',
    ts: Date.now() - 2500000,
  },
  {
    q: 2,
    text: 'Tas Rajut Kado harga jual Rp135.000. Modal benang + furing + upah rajut + box pita = Rp65.000. Untung bersih Rp70.000 (Margin 52%).',
    subText: 'Upah tangan sendiri sudah saya hitung Rp30.000 per tas.',
    businessName: 'Tas Rajut Kreasi Mbak Dita',
    participantId: 'seed_s2_dita',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'kecil' as const,
    likes: 9,
    mentorNote: 'Bagus sekali Mbak Dita sudah memasukkan upah kerja tangan sendiri ke dalam modal!',
    ts: Date.now() - 2400000,
  },
  // Q3: Target Harian & Paket Bundling
  {
    q: 3,
    text: 'Target 28 botol/hari (Rp4,5jt ÷ Rp6.500 ÷ 25 hari). Bikin "Paket Sehat Keluarga Isi 5 Botol Rp70rb", cukup cari 5–6 pembeli/hari!',
    subText: 'Lebih mudah closing 6 ibu rumah tangga ambil paket keluarga daripada cari 28 orang beli satuan.',
    businessName: 'Yoghurt Segar Mbak Nisa',
    participantId: 'seed_s2_nisa',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 12,
    mentorNote: 'Rumus bundling yang cemerlang: beban harian turun dari 28 pembeli jadi cukup 6 transaksi paket!',
    ts: Date.now() - 2100000,
  },
  {
    q: 3,
    text: 'Target 2 tas/hari. Bikin "Paket Kado Sahabat" (Tas Rajut + Dompet Koin + Box Kartu Ucapan Rp165rb, hemat Rp15rb).',
    subText: 'Membantu target bulanan tercapai lebih cepat dengan jumlah kiriman lebih ringkas.',
    businessName: 'Tas Rajut Kreasi Mbak Dita',
    participantId: 'seed_s2_dita',
    status: 'approved' as const,
    star: false,
    likes: 7,
    mentorNote: '',
    ts: Date.now() - 2000000,
  },
  // Q4: Angka Jemput Bola (Traffic & Chat Harian)
  {
    q: 4,
    text: 'Butuh 6 closing paket/hari → minimal harus ada 20 orang chat WA bertanya tiap hari, lewat Status WA jam 8 pagi, grup sekolah anak, & titip 3 warung sehat.',
    subText: 'Tidak lagi pasrah menunggu notif HP berbunyi sendiri.',
    businessName: 'Yoghurt Segar Mbak Nisa',
    participantId: 'seed_s2_nisa',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'kecil' as const,
    likes: 9,
    mentorNote: 'Angka aktivitas hariannya jelas: kejar 20 chat masuk/hari demi mengamankan 6 transaksi!',
    ts: Date.now() - 1700000,
  },
  {
    q: 4,
    text: 'Butuh 4 sewa paket/minggu → target 15–20 calon penyewa tanya tanggal tiap minggu via Reels IG + kerja sama 5 WO & dekor lokal.',
    subText: 'Fokus jemput bola ke penyelenggara acara rutin kantor & keluarga.',
    businessName: 'Berkah Event Rental',
    participantId: 'seed_s2_berkah',
    status: 'approved' as const,
    star: false,
    likes: 6,
    mentorNote: '',
    ts: Date.now() - 1600000,
  },
  // Q5: Naskah Copywriting 3 Pilar Penyampai VP
  {
    q: 5,
    text: '[Hook]: Sering bingung cari camilan sore anak yang gak bikin serik tenggorokan? [Bukti]: Yoghurt kami difermentasi 12 jam dari susu murni tanpa pemanis buatan, kemasan segel dingin. [Ajakan]: Hari ini ada Paket Keluarga 5 botol Rp70rb — balas "MAU PAKET" sebelum jam 3 sore!',
    subText: 'Langsung siap diposting ke Status WA dan caption Instagram pagi ini.',
    businessName: 'Yoghurt Segar Mbak Nisa',
    participantId: 'seed_s2_nisa',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 15,
    mentorNote: 'Copywriting 3 Pilar yang sangat lengkap! Hook menyentuh hati ibu, bukti terukur 12 jam & tanpa pemanis, ditutup CTA paket bundling.',
    ts: Date.now() - 1200000,
  },
  {
    q: 5,
    text: '[Hook]: Takut alat tenda & sound acara datang kotor atau molor pas hari H? [Bukti]: Setiap unit Berkah Rental disterilkan & dicek H-1, garansi tiba 2 jam sebelum acara! [Ajakan]: Paket Komplit 2 Hari lebih hemat 20% — chat WA sekarang untuk kunci tanggalmu.',
    subText: 'Cocok untuk brosur WhatsApp & penawaran ke panitia acara/WO.',
    businessName: 'Berkah Event Rental',
    participantId: 'seed_s2_berkah',
    status: 'approved' as const,
    star: false,
    likes: 10,
    mentorNote: '',
    ts: Date.now() - 1100000,
  },
  // Q6: Komitmen Aksi 14 Hari
  {
    q: 6,
    text: '1. Jam 08.00 WIB update Status WA video produksi bersih + Paket 5 Botol. 2. Rabu & Sabtu chat 15 pelanggan lama tawarkan isi kulkas. 3. Minggu malam hitung total botol vs target.',
    subText: 'Siap setor progres omzet minggu depan di grup PartnerUp!',
    businessName: 'Yoghurt Segar Mbak Nisa',
    participantId: 'seed_s2_nisa',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 11,
    mentorNote: 'Komitmen yang terukur dengan jam dan hari eksekusi yang pasti!',
    ts: Date.now() - 800000,
  },
  {
    q: 6,
    text: '1. Tiap Selasa & Jumat upload Reels proses rajutan tangan + box kado. 2. Follow up 10 pembeli lama untuk paket hampers akhir bulan.',
    subText: 'Kriya — fokus menaikkan pesanan Paket Kado Sahabat.',
    businessName: 'Tas Rajut Kreasi Mbak Dita',
    participantId: 'seed_s2_dita',
    status: 'approved' as const,
    star: false,
    likes: 7,
    mentorNote: '',
    ts: Date.now() - 700000,
  },
];

export const SESI_2_SEED_QNA = [
  {
    text: 'Kalau pelanggan lama kaget saat harga naik demi menjaga margin sehat 40% dan kualitas kemasan VP, bagaimana cara menjelaskannya tanpa ditinggal?',
    authorName: 'Dapur Yoghurt Mbak Nisa',
    isAnonymous: false,
    topicTag: 'Margin Ideal F&B, Kriya & Jasa',
    upvotes: 13,
    status: 'approved' as const,
    star: true,
    participantId: 'seed_qna_s2_1',
    ts: Date.now() - 1800000,
  },
  {
    text: 'Untuk usaha kriya made-by-order yang pengerjaannya makan waktu berhari-hari, bagaimana cara menentukan batas target unit harian yang realistis?',
    authorName: 'Anonim (UMKM Kriya)',
    isAnonymous: true,
    topicTag: 'Menetapkan Target Penjualan',
    upvotes: 10,
    status: 'approved' as const,
    star: false,
    participantId: 'seed_qna_s2_2',
    ts: Date.now() - 1400000,
  },
  {
    text: 'Bagaimana cara menyusun kalimat follow-up WA yang sopan supaya calon pembeli yang sudah tanya harga Paket Bundling mau langsung transfer tanpa merasa diteror?',
    authorName: 'Anonim (Jasa Persewaan)',
    isAnonymous: true,
    topicTag: 'Copywriting Penyampai VP',
    upvotes: 9,
    status: 'approved' as const,
    star: false,
    participantId: 'seed_qna_s2_3',
    ts: Date.now() - 900000,
  },
];

// ============================================================================
// SIMULASI KHUSUS MATERI DESAIN KEMASAN UMKM (Lengkap Q0–Q6)
// ============================================================================

export const PACKAGING_SEED_ANSWERS = [
  {
    q: 0,
    text: 'Standing pouch plastik bening biasa + stiker kertas HVS tempel. Kendalanya stiker sering luntur kena minyak sambal dan produk tampak sama di rak.',
    subText: 'Keripik & Sambal Rumahan — siap ganti ke stiker vinyl anti minyak.',
    businessName: 'Dapoer Mak Renyah',
    participantId: 'seed_pkg_makrenyah',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 8,
    mentorNote: 'Audit yang sangat jujur! Mengganti stiker HVS ke vinyl anti minyak langsung menaikkan kesan higienis.',
    ts: Date.now() - 3600000,
  },
  {
    q: 1,
    text: 'Pakai warna kuning kunyit menyala & badge tegas "Pedas Gurih Daun Jeruk" supaya langsung kontras di antara deretan kemasan putih/bening di rak.',
    subText: 'Uji pandang 3 detik dari jarak 1,5 meter.',
    businessName: 'Dapoer Mak Renyah',
    participantId: 'seed_pkg_makrenyah',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'kecil' as const,
    likes: 7,
    mentorNote: 'Warna kontras adalah pemenang hukum 3 detik pertama di rak toko oleh-oleh.',
    ts: Date.now() - 3200000,
  },
  {
    q: 2,
    text: '1. BRAND: Dapoer Mak Renyah (Paling Besar) — 2. KATEGORI: Keripik Usus Krispi — 3. VARIAN: Ekstra Daun Jeruk Tanpa Amis.',
    subText: 'Ditambah jendela intip di tengah agar tekstur renyah terlihat jelas.',
    businessName: 'Dapoer Mak Renyah',
    participantId: 'seed_pkg_makrenyah',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 9,
    mentorNote: 'Hierarki ukuran huruf sudah tepat dan terbaca dalam 3 detik!',
    ts: Date.now() - 2800000,
  },
  {
    q: 3,
    text: 'Sudah ada Logo Halal & nomor WhatsApp pesanan. Target bulan ini: melengkapi nomor P-IRT resmi & kotak stempel rapi untuk Tanggal Kedaluwarsa.',
    subText: 'Siap masuk etalase toko oleh-oleh modern & pusat wisata Blitar.',
    businessName: 'Dapoer Mak Renyah',
    participantId: 'seed_pkg_makrenyah',
    status: 'approved' as const,
    star: false,
    likes: 6,
    mentorNote: 'P-IRT dan tanggal expired yang rapi membuka pintu masuk ke jaringan toko modern.',
    ts: Date.now() - 2400000,
  },
  {
    q: 4,
    text: 'Kemasan lama plastik klip Rp10.000 (margin Rp3.000). Pakai standing pouch foil matte + stiker vinyl harga naik jadi Rp18.000 — biaya naik Rp1.200 tapi untung melonjak jadi Rp8.800/pcs!',
    subText: 'Pembeli tidak menawar karena tampilan terlihat higienis dan pantas untuk oleh-oleh.',
    businessName: 'Dapoer Mak Renyah',
    participantId: 'seed_pkg_makrenyah',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 12,
    mentorNote: 'Pricing power nyata: tambah modal kemasan Rp1.200 menaikkan untung bersih hampir 3x lipat!',
    ts: Date.now() - 2000000,
  },
  {
    q: 5,
    text: 'Warna terakota (merah bata) kombinasi emas tua — menampilkan kesan sambal resep warisan keluarga yang kaya rempah, pedas mantap, & mewah untuk bingkisan.',
    subText: 'Dibatasi 2 warna dominan + putih agar tulisan tetap bersih dibaca.',
    businessName: 'Sambal Mbok Darmi',
    participantId: 'seed_pkg_mbokdarmi',
    status: 'approved' as const,
    star: false,
    likes: 8,
    mentorNote: 'Psikologi warna hangat sangat efektif memicu selera makan.',
    ts: Date.now() - 1600000,
  },
  {
    q: 6,
    text: '1. Cetak 100 lembar stiker vinyl anti minyak di percetakan digital minggu ini. 2. Ganti wadah plastik klip ke standing pouch kraft berjendela.',
    subText: 'Eksekusi bertahap tanpa harus keluar modal jutaan cetak kemasan massal.',
    businessName: 'Dapoer Mak Renyah',
    participantId: 'seed_pkg_makrenyah',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'kecil' as const,
    likes: 10,
    mentorNote: 'Langkah paling realistis dan cepat dieksekusi UMKM tanpa beban MOQ ribuan!',
    ts: Date.now() - 1200000,
  },
];

export const PACKAGING_SEED_QNA = [
  {
    text: 'Untuk UMKM pemula yang modal cetaknya masih terbatas, apakah wajib langsung cetak kemasan full printing ribuan pcs atau boleh pakai pouch polos + stiker vinyl dulu?',
    authorName: 'Anonim (UMKM Camilan)',
    isAnonymous: true,
    topicTag: 'Solusi Cetak Tanpa MOQ Ribuan',
    upvotes: 12,
    status: 'approved' as const,
    star: true,
    participantId: 'seed_qna_pkg_1',
    ts: Date.now() - 1500000,
  },
  {
    text: 'Supaya foto produk ber-kemasan baru terlihat profesional untuk Instagram/WA meski cuma pakai HP, pencahayaan dan sudut foto apa yang paling aman?',
    authorName: 'Kue Basah Bu Sri',
    isAnonymous: false,
    topicTag: 'Foto Produk untuk Display Sosmed',
    upvotes: 9,
    status: 'approved' as const,
    star: false,
    participantId: 'seed_qna_pkg_2',
    ts: Date.now() - 1100000,
  },
];

// ============================================================================
// SIMULASI KHUSUS MATERI COPYWRITING & FOTO PRODUK SOSMED (Q0–Q2)
// ============================================================================

export const COPYWRITING_SEED_ANSWERS = [
  {
    q: 0,
    text: 'Sedia aneka kue basah & tumpeng mini segar tanpa pengawet · Area Sidoarjo–Surabaya · Pesan H-1 klik link WA di bio.',
    subText: 'Sudah menyebutkan jenis produk, keunggulan, lokasi, dan cara pesan dalam 3 detik.',
    businessName: 'Pawon Kue Bu Rina',
    participantId: 'seed_cw_burina',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 9,
    mentorNote: 'Bio sangat jernih! Pembeli baru langsung tahu jualan apa, lokasinya di mana, dan cara pesannya.',
    ts: Date.now() - 2400000,
  },
  {
    q: 1,
    text: 'Bingung cari hantaran arisan atau rapat kantor yang tampil mewah tapi budget tetap hemat di bawah Rp35 ribu per kotak?',
    subText: 'Menyentuh situasi panitia acara daripada langsung menulis "Ready kue enak murah".',
    businessName: 'Pawon Kue Bu Rina',
    participantId: 'seed_cw_burina',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'kecil' as const,
    likes: 11,
    mentorNote: 'Hook pertanyaan ini langsung menghentikan jempol ibu-ibu panitia arisan saat scroll!',
    ts: Date.now() - 1800000,
  },
  {
    q: 2,
    text: 'Amankan kuota pengiriman Jumat pagi sekarang (tersisa 6 box paket hemat gratis ongkir dalam kota) — balas "MAU HANTARAN" ke WA di bio!',
    subText: 'Ada alasan jelas untuk segera chat hari ini + perintah ketik yang mudah.',
    businessName: 'Pawon Kue Bu Rina',
    participantId: 'seed_cw_burina',
    status: 'approved' as const,
    star: true,
    spotlightSize: 'besar' as const,
    likes: 10,
    mentorNote: 'CTA yang sangat kuat: memberi alasan kuota terbatas dan kata kunci balasan WA.',
    ts: Date.now() - 1200000,
  },
];

export const COPYWRITING_SEED_QNA = [
  {
    text: 'Kalau sudah tulis hook & CTA di caption Instagram tapi yang like sedikit, apakah sebaiknya tetap posting rutin di jam yang sama atau ubah gaya fotonya dulu?',
    authorName: 'Anonim (Kuliner Rumahan)',
    isAnonymous: true,
    topicTag: 'Copywriting Caption',
    upvotes: 10,
    status: 'approved' as const,
    star: true,
    participantId: 'seed_qna_cw_1',
    ts: Date.now() - 1400000,
  },
];

export function getSeedDataForCurriculum(
  materialId?: string,
  seminarTitle?: string
): {
  answers: typeof INITIAL_SEED_ANSWERS;
  qna: typeof INITIAL_SEED_QNA;
} {
  const titleLower = (seminarTitle || '').toLowerCase();
  if (
    materialId === 'partnerup_sesi_2_action_plan' ||
    titleLower.includes('target penjualan') ||
    titleLower.includes('margin ideal') ||
    titleLower.includes('sesi 2')
  ) {
    return {
      answers: SESI_2_SEED_ANSWERS,
      qna: SESI_2_SEED_QNA,
    };
  }
  if (
    materialId === 'desain_kemasan_pemasaran_umkm' ||
    materialId === 'desain_kemasan_umkm' ||
    titleLower.includes('desain kemasan')
  ) {
    return {
      answers: PACKAGING_SEED_ANSWERS,
      qna: PACKAGING_SEED_QNA,
    };
  }
  if (
    materialId === 'copywriting_foto_sosmed_umkm' ||
    titleLower.includes('caption & foto produk')
  ) {
    return {
      answers: COPYWRITING_SEED_ANSWERS,
      qna: COPYWRITING_SEED_QNA,
    };
  }
  return {
    answers: INITIAL_SEED_ANSWERS,
    qna: INITIAL_SEED_QNA,
  };
}


