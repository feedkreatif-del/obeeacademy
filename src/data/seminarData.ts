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

export interface SlideDefinition {
  index: number;
  pageNumber: number;
  badge: string;
  title: string;
  subtitle?: string;
  type: 'cover' | 'agenda' | 'worksheet' | 'concept' | 'comparison' | 'formula' | 'closing';
  linkedQuestionIndex?: number;
  linkedPollId?: string;
  cards?: {
    title: string;
    body: string;
    extra?: string;
    accent: 'orange' | 'teal' | 'navy';
  }[];
  comparison?: {
    leftTitle: string;
    leftBody: string;
    rightTitle: string;
    rightBody: string;
  };
  bottomBanner?: string;
  promptLines?: string[];
}

export const PARTNERUP_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Kenalan dengan Usahamu',
    coreLearning: 'Kenapa pembeli perlu alasan untuk memilih',
    questionText: 'Apa nama usaha dan produk andalanmu?',
    secondaryPrompt: 'Sudah berjualan sejak kapan (atau belum mulai)?',
    exampleAnswer: 'Keripik Apel Bu Sari — keripik apel renyah tanpa minyak berlebih. Sudah jalan 8 bulan.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Sebutkan 1 produk/jasa yang paling sering dicari pembeli.',
      'Kalau ada 20 penjual produk yang sama dan semua bilang "enak dan murah", pembeli bingung memilih.'
    ],
    linkedSlideIndex: 2,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Kenali Pembelimu',
    coreLearning: 'Jualan untuk semua orang berarti tidak ada yang merasa dipanggil',
    questionText: 'Siapa pembeli yang paling sering membeli produkmu?',
    secondaryPrompt: 'Apa yang paling dia butuhkan & apa yang sering membuatnya ragu?',
    exampleAnswer: 'Ibu rumah tangga yang cari oleh-oleh/hampers cepat. Ragu soal kebersihan dan kemasan.',
    exampleBusiness: 'Kue Kering & Hampers Bu Sari',
    helperTips: [
      'Hindari menjawab "semua orang dari anak-anak sampai dewasa".',
      'Contoh spesifik: "Anak kos & pekerja sibuk yang takut cucian telat atau baju hilang."'
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Apa Itu Value Proposition?',
    coreLearning: 'Alasan jelas kenapa pembeli memilih kamu, bukan penjual lain',
    questionText: 'Menurutmu, kenapa pembeli memilih produkmu dibanding penjual lain?',
    secondaryPrompt: 'Tulis jujur 1–2 alasan utama (tidak ada jawaban salah)',
    exampleAnswer: 'Kue kering tanpa pengawet, tahan 2 bulan, dan sudah dikemas rapi siap jadi hampers.',
    exampleBusiness: 'Dapur Hampers Sari',
    helperTips: [
      'Lemah: "Kue kami enak dan berkualitas." (Semua penjual bilang begini)',
      'Kuat: "Kue kering tanpa pengawet, tahan 2 bulan, siap jadi hampers."'
    ],
    linkedSlideIndex: 6,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Rational Value (Bukti & Angka)',
    coreLearning: 'Keunggulan nyata yang bisa dihitung dan dibuktikan oleh pembeli',
    questionText: 'Sebutkan 2 keunggulan produkmu yang bisa dibuktikan (pakai angka/fakta)!',
    secondaryPrompt: 'Ubah kata sifat menjadi angka: "awet" → "tahan 3 bulan", "murah" → "mulai Rp10 ribu"',
    exampleAnswer: '1. Tanpa pengawet & tahan 3 bulan (ada izin PIRT). 2. Isi 150 gram harga Rp15 ribu.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Rational = Otak. Pembeli berpikir: "Untungnya apa buat saya? Hitungannya masuk nggak?"',
      'Pilih dari: Harga (mulai Rp10rb), Isi (150 gr), Kualitas (tanpa pengawet/halal), Tahan lama (3 bulan), atau Kemudahan (gratis ongkir/COD).'
    ],
    linkedSlideIndex: 9,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Emotional Value (Perasaan Pembeli)',
    coreLearning: 'Perasaan yang didapat pembeli setelah membeli atau memakai produkmu',
    questionText: 'Setelah membeli, perasaan apa yang ingin dirasakan pembelimu?',
    secondaryPrompt: 'Perasaan itu muncul karena apa? (kemasan, rasa, pelayanan, atau cerita)',
    exampleAnswer: 'Merasa tenang, bangga, dan terlihat perhatian saat memberi oleh-oleh ke keluarga.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Emotional = Hati. Pembeli bertanya: "Setelah beli, saya akan merasa apa?"',
      'Contoh perasaan: Bangga, Tenang, Percaya diri, Dihargai, Dekat keluarga, Dukung lokal.'
    ],
    linkedSlideIndex: 11,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Gabungkan Jadi Satu Kalimat',
    coreLearning: 'Value proposition kuat = Rational (bukti) + Emotional (rasa)',
    questionText: 'Tulis kalimat Value Proposition usahamu!',
    secondaryPrompt: 'Rumus: [Produk] untuk [pembeli] yang ingin [manfaat/perasaan], karena [bukti/keunggulan].',
    exampleAnswer: 'Keripik apel asli Batu untuk pembeli yang cari oleh-oleh sehat dan bikin keluarga senang, karena tanpa pengawet, tahan 3 bulan, mulai Rp15 ribu.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Cek 3 hal: (1) Apakah jelas untuk siapa? (2) Apakah ada angka/fakta? (3) Apakah ada perasaan yang disentuh?',
      'Tips: Pilih 1–2 manfaat utama saja agar tidak membingungkan.'
    ],
    linkedSlideIndex: 14,
  },
  {
    index: 6,
    sectionNumber: 7,
    sectionTitle: '7. Dipakai di Mana?',
    coreLearning: 'Menerapkan kalimat di bio Instagram, deskripsi produk, caption, atau kemasan',
    questionText: 'Di mana kalimat ini akan kamu pakai pertama kali?',
    secondaryPrompt: 'Langkah apa yang akan kamu lakukan dalam 3 hari ke depan?',
    exampleAnswer: 'Pasang di Bio Instagram & pesan pembuka WhatsApp Business malam ini.',
    exampleBusiness: 'Keripik Apel Bu Sari',
    helperTips: [
      'Tempat penerapan: Bio / Nama Toko, Deskripsi Produk Marketplace, Caption Sosmed, Kemasan / Spanduk, atau Balas Chat Pembeli.'
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
        label: '1. Harga (Lebih Terjangkau / Paket Hemat)',
        subtitle: 'Contoh: Nasi goreng Rp12 ribu porsi besar (Rational - Otak)',
        category: 'rational',
      },
      {
        id: 'kualitas',
        label: '2. Kualitas (Bahan / Hasil Lebih Unggul)',
        subtitle: 'Contoh: Kue tanpa pengawet, bahan asli, bersertifikat PIRT/Halal (Rational - Otak)',
        category: 'rational',
      },
      {
        id: 'kemudahan',
        label: '3. Kemudahan (Mudah Beli & Terima)',
        subtitle: 'Contoh: Gratis ongkir, bisa COD, antar cepat hari yang sama (Rational - Otak)',
        category: 'rational',
      },
      {
        id: 'pengalaman',
        label: '4. Pengalaman (Perasaan Puas & Nyaman)',
        subtitle: 'Contoh: Kemasan rapi yang bikin senang saat dibuka (Emotional - Hati)',
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
        id: 'Bangga',
        label: 'Bangga',
        subtitle: 'Merasa berkelas saat menyajikan atau memberikan hadiah',
        category: 'emotional',
      },
      {
        id: 'Tenang',
        label: 'Tenang & Aman',
        subtitle: 'Bebas khawatir karena bahan sehat atau urusan beres tepat waktu',
        category: 'emotional',
      },
      {
        id: 'Percaya Diri',
        label: 'Percaya Diri',
        subtitle: 'Merasa tampil rapi, nyaman, dan pantas seharian',
        category: 'emotional',
      },
      {
        id: 'Dihargai',
        label: 'Dihargai',
        subtitle: 'Merasa dilayani dengan ramah, hangat, dan diperhatikan',
        category: 'emotional',
      },
      {
        id: 'Dekat Keluarga',
        label: 'Dekat Keluarga',
        subtitle: 'Menciptakan momen hangat bersama orang tersayang di rumah',
        category: 'emotional',
      },
      {
        id: 'Dukung Lokal',
        label: 'Dukung Lokal',
        subtitle: 'Senang ikut memajukan produk asli daerah sendiri',
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
    subtitle: 'Value Proposition & Rational Value untuk UMKM Pemula — Program PartnerUp | Obeecreatives',
    type: 'cover',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'PEMBUKA',
    title: 'Hari Ini Kamu Akan...',
    subtitle: 'Pulang membawa 1 kalimat yang bikin pembeli memilih usahamu.',
    type: 'agenda',
    cards: [
      { title: '1. Kenalan dengan usahamu', body: 'Menemukan produk andalan utama.', accent: 'orange' },
      { title: '2. Kenali pembelimu', body: 'Siapa yang paling sering beli & apa keraguannya.', accent: 'teal' },
      { title: '3. Apa itu value proposition', body: 'Alasan jelas kenapa pembeli memilih kamu.', accent: 'orange' },
      { title: '4. Rational value', body: 'Keunggulan nyata yang bisa dihitung & dibuktikan.', accent: 'teal' },
      { title: '5. Emotional value', body: 'Perasaan yang didapat pembeli setelah membeli.', accent: 'orange' },
      { title: '6. Gabungkan jadi satu kalimat', body: 'Rumus praktis Rational + Emotional.', accent: 'teal' },
      { title: '7. Dipakai di mana?', body: 'Terapkan di bio, caption, kemasan, dan chat.', accent: 'orange' },
    ],
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'BAGIAN 1',
    title: 'Kenalan dengan Usahamu',
    subtitle: 'Bayangkan ada 20 penjual produk yang sama. Kalau semua bilang "enak dan murah", pembeli bingung memilih.',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    promptLines: [
      'Nama usahaku: ______________',
      'Produk/jasa andalanku: ______________',
      'Sudah berjualan sejak kapan (atau belum mulai): ______________',
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'BAGIAN 2',
    title: 'Kenali Pembelimu',
    subtitle: 'Jualan untuk semua orang = tidak ada yang merasa dipanggil.',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    cards: [
      {
        title: 'Kue kering',
        body: 'Pembeli: ibu rumah tangga cari hampers cepat.',
        extra: 'Ragu: kebersihan dan kemasan.',
        accent: 'orange',
      },
      {
        title: 'Baju muslim',
        body: 'Pembeli: karyawati butuh baju rapi dan nyaman.',
        extra: 'Ragu: ukuran tidak pas.',
        accent: 'teal',
      },
      {
        title: 'Laundry',
        body: 'Pembeli: anak kos dan pekerja sibuk.',
        extra: 'Kesal: telat atau baju hilang.',
        accent: 'orange',
      },
    ],
    promptLines: [
      'Pembeli yang paling sering beli produkku: ______________',
      'Yang paling dia butuhkan: ______________',
      'Yang membuat dia ragu membeli: ______________',
    ],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'BAGIAN 3',
    title: 'Pengertian: Value Proposition',
    type: 'concept',
    cards: [
      {
        title: 'ARTINYA',
        body: 'Alasan jelas kenapa pembeli harus memilih kamu, bukan penjual lain.',
        accent: 'orange',
      },
      {
        title: 'CONTOHNYA',
        body: 'Warung Bu Sari: nasi goreng porsi besar, Rp12 ribu, buka sampai tengah malam. Anak kos langsung tahu kenapa harus makan di sini.',
        accent: 'teal',
      },
      {
        title: 'GAMPANG DIINGAT',
        body: 'Value proposition = jawaban untuk pertanyaan pembeli: "Kenapa saya harus beli di kamu?"',
        accent: 'orange',
      },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'BAGIAN 3',
    title: 'Kenapa Perlu Alasan yang Jelas?',
    type: 'concept',
    cards: [
      {
        title: '1. Beda dari yang lain',
        body: 'Kalau semua bilang "enak dan murah", pembeli bingung. Alasan jelas membuatmu mudah diingat.',
        accent: 'orange',
      },
      {
        title: '2. Harga lebih mudah diterima',
        body: 'Kalau pembeli paham manfaatnya, mereka tidak hanya mencari yang termurah.',
        accent: 'teal',
      },
      {
        title: '3. Pesan jadi konsisten',
        body: 'Satu alasan yang sama dipakai di bio, caption, dan kemasan.',
        accent: 'orange',
      },
    ],
    bottomBanner: 'Pilih 1–2 manfaat utama saja. Terlalu banyak janji malah membingungkan.',
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'BAGIAN 3',
    title: 'Apa Itu Value Proposition?',
    subtitle: 'Alasan jelas kenapa pembeli harus memilih kamu.',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    cards: [
      { title: '1. Jual apa?', body: 'Produk atau layanan utama yang spesifik.', accent: 'orange' },
      { title: '2. Untuk siapa?', body: 'Target pembeli yang paling membutuhkan.', accent: 'teal' },
      { title: '3. Apa bedanya?', body: 'Keunggulan nyata dibanding penjual lain.', accent: 'orange' },
    ],
    comparison: {
      leftTitle: 'Lemah',
      leftBody: '"Kue kami enak dan berkualitas."',
      rightTitle: 'Kuat',
      rightBody: '"Kue kering tanpa pengawet, tahan 2 bulan, siap jadi hampers."',
    },
    promptLines: ['Menurutku pembeli memilih produkku karena: ______________'],
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'BAGIAN 4',
    title: '4 Jenis Alasan Pembeli Memilih Kamu',
    subtitle: '3 jenis pertama = rational (otak)  |  jenis keempat = emotional (hati)',
    type: 'worksheet',
    linkedPollId: 'rational_4types',
    cards: [
      {
        title: 'Harga',
        body: 'Lebih terjangkau.',
        extra: 'Contoh: nasi goreng Rp12 ribu, porsi besar.',
        accent: 'orange',
      },
      {
        title: 'Kualitas',
        body: 'Bahan atau hasil lebih unggul.',
        extra: 'Contoh: kue tanpa pengawet.',
        accent: 'orange',
      },
      {
        title: 'Kemudahan',
        body: 'Mudah beli dan terima.',
        extra: 'Contoh: gratis ongkir, bisa COD.',
        accent: 'orange',
      },
      {
        title: 'Pengalaman',
        body: 'Perasaan puas dan nyaman.',
        extra: 'Contoh: kemasan yang bikin senang membukanya.',
        accent: 'teal',
      },
    ],
    promptLines: ['POLLING INTERAKTIF: Jenis yang paling cocok untuk produkku'],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'BAGIAN 4',
    title: 'Pengertian: Rational Value',
    type: 'concept',
    cards: [
      {
        title: 'ARTINYA',
        body: 'Keuntungan nyata yang bisa dihitung atau dibuktikan oleh pembeli.',
        accent: 'orange',
      },
      {
        title: 'CONTOHNYA',
        body: 'Sabun buatan sendiri: isi 100 gram, Rp10 ribu, tanpa pewarna, tahan 1 tahun. Semua bisa dicek pembeli.',
        accent: 'teal',
      },
      {
        title: 'GAMPANG DIINGAT',
        body: 'Rational = otak. Pembeli berpikir: "Untungnya apa buat saya? Hitungannya masuk nggak?"',
        accent: 'orange',
      },
    ],
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'BAGIAN 4',
    title: 'Rational Value: Bisa Dibuktikan',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    cards: [
      { title: 'Harga', body: 'Lebih terjangkau, paket hemat', accent: 'orange' },
      { title: 'Isi', body: 'Lebih banyak, ukuran jelas', accent: 'teal' },
      { title: 'Kualitas', body: 'Tanpa pengawet, PIRT, halal', accent: 'orange' },
      { title: 'Tahan lama', body: 'Masa simpan atau garansi', accent: 'teal' },
      { title: 'Kemudahan', body: 'Gratis ongkir, COD, kirim cepat', accent: 'orange' },
    ],
    bottomBanner: 'Ubah kata jadi angka: "awet" → "tahan 3 bulan"  |  "murah" → "mulai Rp10 ribu"',
    promptLines: [
      'Keunggulan 1 (pakai angka/bukti): ______________',
      'Keunggulan 2 (pakai angka/bukti): ______________',
    ],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'BAGIAN 5',
    title: 'Pengertian: Emotional Value',
    type: 'concept',
    cards: [
      {
        title: 'ARTINYA',
        body: 'Perasaan yang didapat pembeli setelah membeli atau memakai produkmu.',
        accent: 'orange',
      },
      {
        title: 'CONTOHNYA',
        body: 'Kopi Rp25 ribu di kafe yang nyaman: yang dibeli bukan hanya kopi, tapi juga rasa santai dan merasa keren.',
        accent: 'teal',
      },
      {
        title: 'GAMPANG DIINGAT',
        body: 'Emotional = hati. Pembeli bertanya: "Setelah beli, saya akan merasa apa?"',
        accent: 'orange',
      },
    ],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'BAGIAN 5',
    title: 'Emotional Value: Perasaan Pembeli',
    subtitle: 'Perasaan yang didapat pembeli setelah membeli atau memakai produkmu.',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    linkedPollId: 'emotional_feelings',
    cards: [
      {
        title: 'Hampers kue',
        body: 'Merasa perhatian dan berkelas saat memberi hadiah.',
        accent: 'orange',
      },
      {
        title: 'Baju muslim',
        body: 'Merasa percaya diri dan nyaman seharian.',
        accent: 'teal',
      },
      {
        title: 'Laundry',
        body: 'Merasa tenang karena urusan baju beres.',
        accent: 'orange',
      },
    ],
    promptLines: [
      'Pembeli akan merasa: ______________',
      'Perasaan itu muncul karena (kemasan, rasa, pelayanan, cerita): ______________',
    ],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'RINGKASAN',
    title: 'Otak dan Hati Pembeli',
    subtitle: 'Contoh produk yang sama: keripik apel',
    type: 'comparison',
    comparison: {
      leftTitle: 'Rational (otak)',
      leftBody: 'Isi 150 gram, tanpa pengawet, tahan 3 bulan, Rp15 ribu.\nPertanyaan pembeli: untungnya apa, hitungannya masuk?',
      rightTitle: 'Emotional (hati)',
      rightBody: 'Oleh-oleh yang bikin keluarga senang dan kamu terlihat perhatian.\nPertanyaan pembeli: aku akan merasa apa?',
    },
    bottomBanner: 'Pembeli tertarik karena rasa, lalu yakin karena angka.',
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'BAGIAN 6',
    title: 'Gabungkan Jadi Satu Kalimat',
    subtitle: 'Value proposition kuat = Rational (bukti) + Emotional (rasa)',
    type: 'formula',
    bottomBanner: 'Rumus: [Produk] untuk [pembeli] yang ingin [manfaat/perasaan], karena [bukti/keunggulan].',
    comparison: {
      leftTitle: 'Sebelum',
      leftBody: '"Keripik apel enak dan murah."',
      rightTitle: 'Sesudah',
      rightBody: '"Keripik apel asli Batu untuk pembeli yang cari oleh-oleh sehat dan bikin keluarga senang, karena tanpa pengawet, tahan 3 bulan, mulai Rp15 ribu."',
    },
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'LATIHAN',
    title: 'Saatnya Menulis Kalimatmu!',
    subtitle: 'Cek kalimatmu: (1) Jelas untuk siapa? (2) Ada angka/fakta? (3) Ada perasaan yang disentuh?',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    promptLines: [
      'Kalimat versi pertamaku: ______________',
      'Versi setelah dicek 3 pertanyaan: ______________',
    ],
  },
  {
    index: 15,
    pageNumber: 16,
    badge: 'BAGIAN 7',
    title: 'Dipakai di Mana?',
    type: 'worksheet',
    linkedQuestionIndex: 6,
    cards: [
      { title: 'Bio / nama toko', body: 'Profil Instagram, Shopee, atau TikTok Shop.', accent: 'orange' },
      { title: 'Deskripsi produk', body: 'Baris pertama penjelasan produk.', accent: 'teal' },
      { title: 'Caption sosmed', body: 'Kalimat pembuka postingan promosi.', accent: 'orange' },
      { title: 'Kemasan / spanduk', body: 'Label stiker toples atau banner lapak.', accent: 'teal' },
      { title: 'Balas chat pembeli', body: 'Pesan sambutan otomatis WhatsApp Business.', accent: 'orange' },
    ],
    promptLines: [
      'Tempat pertama yang akan memakai kalimatku: ______________',
      'Langkah yang kulakukan dalam 3 hari ke depan: ______________',
    ],
  },
  {
    index: 16,
    pageNumber: 17,
    badge: 'PENUTUP & TANYA JAWAB',
    title: '3 Pesan Kunci Seminar PartnerUp',
    subtitle: 'Terima kasih! Sesi tanya jawab interaktif & voting pertanyaan dipersilakan.',
    type: 'closing',
    cards: [
      { title: '1. Kenali pembelimu', body: 'Panggil target pembeli yang spesifik, bukan semua orang.', accent: 'orange' },
      { title: '2. Tunjukkan buktinya', body: 'Gunakan angka, gramasi, durasi tahan, atau jaminan nyata.', accent: 'teal' },
      { title: '3. Tambahkan rasa', body: 'Sentuh perasaan tenang, bangga, atau dekat dengan keluarga.', accent: 'orange' },
    ],
  },
];

export const INITIAL_SEED_ANSWERS = [
  {
    q: 0,
    text: 'Keripik Apel Bu Sari — Keripik apel asli Malang potongan tebal.',
    subText: 'Sudah berjualan sejak 1 tahun lalu di rumah.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: true,
    likes: 8,
    mentorNote: 'Spesifik! Menyebutkan bahan asli Malang dan tekstur potongan tebal.',
    ts: Date.now() - 3600000,
  },
  {
    q: 0,
    text: 'Sabun Alami Kemuning — Sabun mandi cair daun kelor & madu.',
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
    text: 'Laundry Kilat Berkah — Cuci setrika harian untuk mahasiswa.',
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
    text: 'Ibu rumah tangga usia 30-50 tahun yang cari oleh-oleh sehat buat keluarga.',
    subText: 'Butuh cemilan tanpa MSG, sering ragu takut keripiknya melempem atau berminyak.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: true,
    likes: 6,
    mentorNote: 'Contoh tepat! Masalah keraguan pembeli (takut melempem) langsung teridentifikasi.',
    ts: Date.now() - 3000000,
  },
  {
    q: 3,
    text: '1. Tanpa pengawet & digoreng vakum, tahan renyah 3 bulan. 2. Kemasan 150 gram cuma Rp15 ribu.',
    subText: 'Sudah ada nomor PIRT dan sertifikat Halal di kemasan.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: true,
    likes: 9,
    mentorNote: 'Ada 3 angka terukur: 3 bulan, 150 gram, Rp15 ribu.',
    ts: Date.now() - 2500000,
  },
  {
    q: 4,
    text: 'Merasa tenang memberikan cemilan sehat untuk anak & bangga saat bawa oleh-oleh.',
    subText: 'Muncul dari kemasan standing pouch tebal yang rapi dan rasa apel asli.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: false,
    likes: 7,
    mentorNote: '',
    ts: Date.now() - 2000000,
  },
  {
    q: 5,
    text: 'Keripik apel asli Batu untuk ibu-ibu yang cari oleh-oleh sehat dan bikin keluarga senang, karena tanpa pengawet, tahan 3 bulan, mulai Rp15 ribu.',
    subText: 'Sudah lolos cek 3 pertanyaan: Pembeli jelas, Bukti angka jelas, Perasaan jelas.',
    businessName: 'Keripik Apel Bu Sari',
    participantId: 'seed_busari',
    status: 'approved' as const,
    star: true,
    likes: 14,
    mentorNote: 'Kalimat Value Proposition yang siap langsung dipasang di Bio Instagram!',
    ts: Date.now() - 1500000,
  },
];

export const INITIAL_SEED_QNA = [
  {
    text: 'Kak, kalau produk saya masih baru banget dan belum punya izin PIRT, apa yang bisa dijadikan Rational Value (bukti angka) agar pembeli tetap percaya?',
    authorName: 'Anonim (Usaha Sambal Rumahan)',
    isAnonymous: true,
    topicTag: 'Rational Value',
    upvotes: 12,
    status: 'approved' as const,
    star: true,
    participantId: 'seed_qna_1',
    ts: Date.now() - 1800000,
  },
  {
    text: 'Bagaimana cara menyusun kalimat kalau produk kami ada banyak varian (misal jual 10 macam kue basah)? Apakah harus buat 10 kalimat berbeda?',
    authorName: 'Dapur Kue Mbak Rini',
    isAnonymous: false,
    topicTag: 'Value Proposition',
    upvotes: 9,
    status: 'approved' as const,
    star: false,
    participantId: 'seed_qna_2',
    ts: Date.now() - 1400000,
  },
  {
    text: 'Kalau pesaing di sebelah warung banting harga lebih murah Rp2.000, apakah kita harus ikut turunkan harga atau fokus tonjolkan ukuran porsi & kebersihan?',
    authorName: 'Anonim',
    isAnonymous: true,
    topicTag: 'Strategi Harga',
    upvotes: 7,
    status: 'pending' as const,
    star: false,
    participantId: 'seed_qna_3',
    ts: Date.now() - 900000,
  },
];
