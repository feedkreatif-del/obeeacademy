import {
  WorksheetQuestion,
  LivePollConfig,
  SlideDefinition,
} from './seminarData';
import { SavedMaterial } from '../types';

const FOTO_PRODUK_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Audit Produk, Sumber Cahaya & Persiapan Lensa',
    coreLearning:
      'Hasil foto yang jernih dimulai sebelum menekan shutter: pilih 1 sumber cahaya bersih (jendela/lampu) dan matikan cahaya lain yang mengotori warna (Kill Ambient Light)',
    questionText:
      'Sebutkan 1 produk utamamu yang akan difoto minggu ini, lalu tentukan: [Sumber Cahaya Utama] (jendela pagi/sore atau lampu/lightbox) dan [Cahaya Pengganggu] yang wajib dimatikan saat memotret!',
    secondaryPrompt:
      'Contoh cahaya pengganggu: lampu plafon kuning ruangan yang membuat warna putih kemasan berubah kekuningan atau bayangan jadi ganda.',
    exampleAnswer:
      'Produk: Sambal Bawang Botol 200ml. Sumber cahaya utama: Cahaya jendela sisi timur jam 08.30–10.00 WIB dengan tirai tipis. Cahaya pengganggu yang dimatikan: Lampu neon/kuning dapur + matikan Flash bawaan HP + lap lensa kamera dulu.',
    exampleBusiness: 'Sambal & Olahan Rumahan (F&B)',
    helperTips: [
      'Selalu bersihkan kaca lensa HP dengan kain mikrofiber atau ujung baju bersih sebelum mulai memotret agar foto tidak berkabut.',
      'Jika memakai lampu belajar/LED putih, matikan lampu ruangan agar suhu warna tidak belang (kuning campur putih).',
    ],
    linkedSlideIndex: 4,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Kunci Setting Kamera Smartphone (Grid, Flash OFF & AE/AF Lock)',
    coreLearning:
      'Kamera HP mode Auto sering mengubah terang-gelap dan fokus seenaknya — mengunci Fokus + Exposure (AE/AF Lock) dan mengaktifkan Grid 3×3 membuat foto langsung rapi',
    questionText:
      'Cek aplikasi kamera di HP-mu sekarang: fitur apa saja yang sudah aktif/siap dipakai? ([Grid 3×3], [Flash OFF], [Tap Focus + AE/AF Lock / Slider EV], atau [Mode Pro: ISO, Shutter Speed, WB])!',
    secondaryPrompt:
      'Catat juga kendala kecil di HP-mu (mis. perlu tekan tahan 2 detik di layar untuk mengunci AE/AF Lock atau menggeser ikon matahari/EV sedikit ke atas).',
    exampleAnswer:
      'Grid 3×3 sudah ON, Flash sudah OFF permanen. Saat uji coba tekan tahan objek di layar muncul kunci "AE/AF Lock", lalu geser slider matahari sedikit naik (+0.3 EV) agar label botol lebih cerah tanpa membuat latar silau.',
    exampleBusiness: 'Kopi Botol / Produk Kemasan',
    helperTips: [
      'Jangan pakai fitur Zoom Digital (cubit layar 2x/3x) karena bikin gambar pecah — lebih baik dekatkan fisik HP atau pakai lensa 1x/2x optik.',
      'Kalau Mode Pro tersedia, cukup kunci ISO serendah mungkin (50–200) di tempat terang dan pilih WB Daylight/5500K agar warna foto pertama sampai kesepuluh seragam.',
    ],
    linkedSlideIndex: 5,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Menata Arah Cahaya & Membentuknya dengan Reflektor Kertas',
    coreLearning:
      'Arah cahaya samping (Side Light 45°–90°) ditambah pantulan kertas putih/styrofoam di sisi seberang membuat produk terlihat berdimensi dan profesional tanpa beli alat mahal',
    questionText:
      'Rancang tata letak meja fotomu di rumah: dari arah mana cahaya jendela/lampu datang mengenai produkmu ([Samping 45°/90°], [Belakang/Backlight], atau [Depan]), dan alat apa yang dipakai sebagai Diffuser & Reflektor?',
    secondaryPrompt:
      'Contoh alat murah: gorden putih tipis / kertas minyak sebagai Diffuser pelembut cahaya, dan kertas HVS A3 / styrofoam putih / map putih sebagai Reflektor pengisi bayangan.',
    exampleAnswer:
      'Meja ditaruh tepat di samping kanan jendela ruang tamu (Side Light 90°). Jika matahari siang terlalu terik, gorden putih ditutup sebagai Diffuser. Di sebelah kiri botol kopi diletakkan styrofoam putih bekas elektronik berdiri tegak sebagai Reflektor agar sisi kiri label tetap terbaca terang.',
    exampleBusiness: 'Skincare / Minuman Kemasan / F&B',
    helperTips: [
      'Untuk minuman segar/bening atau botol kaca, coba letakkan cahaya agak dari serong belakang (Backlight) + reflektor putih di depan agar cairan tampak berkilau segar.',
      'Hindari cahaya tepat dari depan searah kamera (seperti Flash HP) karena membuat produk terlihat gepeng tanpa bayangan dimensi.',
    ],
    linkedSlideIndex: 8,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Menentukan Sudut Emas (Angle), Grid & Properti Pendukung',
    coreLearning:
      'Setiap jenis produk punya sudut pandang terbaik: Eye Level untuk kemasan berdiri, 45° untuk makanan di piring, dan Flat Lay 90° untuk set menu atau kriya/fashion',
    questionText:
      'Pilih 1 sudut foto utama dan 1 sudut pendamping untuk produkmu ([Eye Level 0°], [Sudut Makan 45°], atau [Flat Lay 90°]), plus maksimal 2–3 properti pendukung yang relevan dan posisi Ruang Kosong (Negative Space)!',
    secondaryPrompt:
      'Pastikan properti tidak menutupi merek/produk utama, dan sisakan ruang kosong di pojok atas atau samping untuk tempat menaruh teks harga/promo.',
    exampleAnswer:
      'Sudut utama: Eye Level (sejajar tinggi toples kue kering agar label merek & isi toples terlihat penuh dan gagah). Sudut kedua: 45° untuk memperlihatkan tekstur renyah kue di piring kecil. Properti: alas kain linen krem + 2 butir bahan baku + ruang kosong di kanan atas untuk tulisan harga.',
    exampleBusiness: 'Kue Kering / Hampers / Kriya',
    helperTips: [
      'Gunakan garis Grid 3×3 untuk memastikan botol/kemasan berdiri tegak lurus (tidak miring ke kiri atau kanan).',
      'Jaga jarak objek dari dinding belakang minimal 30–50 cm agar latar belakang terlihat lebih bersih dan berdimensi.',
    ],
    linkedSlideIndex: 10,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Aturan Editing Ringan 2 Menit (Warna Jujur & Siap Katalog)',
    coreLearning:
      'Editing foto produk cukup untuk meluruskan posisi, mencerahkan bayangan, dan memastikan warna di layar tetap jujur sama dengan barang aslinya',
    questionText:
      'Tentukan standar editing ringan 2 menit yang akan kamu terapkan di HP (aplikasi bawaan Galeri / Snapseed / Lightroom Mobile): rasio potong (1:1 atau 4:5), koreksi cahaya, dan batas agar warna tetap asli!',
    secondaryPrompt:
      'Ingat: foto yang terlalu over-kontras atau warnanya berubah drastis memicu komplain pembeli saat paket tiba ("aslinya kok beda warna?").',
    exampleAnswer:
      'Pakai aplikasi Galeri HP / Lightroom Mobile: (1) Luruskan garis horizontal & crop rasio 4:5 untuk IG / 1:1 untuk Marketplace, (2) Naikkan Exposure +0.2 & Shadows +15 agar detail kemasan terlihat, (3) Pastikan White Balance/Saturasi tidak berlebihan agar warna baju/makanan tetap persis aslinya.',
    exampleBusiness: 'Fashion / Kuliner / Marketplace',
    helperTips: [
      'Simpan preset atau catat angka perubahan favoritmu (misal Exposure +0.2, Shadows +15, Sharpness +10) agar seluruh foto katalog di feed terlihat satu warna seragam.',
      'Matikan filter warna "alay" atau preset kecantikan kulit saat memotret makanan dan produk.',
    ],
    linkedSlideIndex: 12,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Komitmen Tantangan Praktik: Foto 1 Produk di Meja Rumah',
    coreLearning:
      'Pemahaman teori cahaya baru berdampak ke omzet saat langsung dipraktikkan dengan mengambil foto ulang produk terlaris minggu ini',
    questionText:
      'Tulis target aksi nyatamu dalam 3 hari ke depan: produk apa saja yang akan kamu foto ulang memakai SOP Jendela + Reflektor + 3 Sudut Emas, dan akan dipakai untuk memperbarui media mana?',
    secondaryPrompt:
      'Contoh media: Foto utama Shopee/Tokopedia, Katalog WhatsApp Business, atau 3 postingan feed Instagram/TikTok.',
    exampleAnswer:
      'Besok pagi jam 09.00 WIB langsung foto ulang 3 varian best-seller (Keripik Original, Balado, & Paket Oleh-Oleh) di meja samping jendela pakai reflektor karton putih. Hasil fotonya langsung dipakai mengganti foto lama di Katalog WhatsApp Business & foto sampul Shopee.',
    exampleBusiness: 'Rencana Eksekusi UMKM',
    helperTips: [
      'Bandingkan foto "Before" (lama) vs "After" (baru) berdampingan — perbedaan inilah yang langsung menaikkan rasa percaya calon pembeli baru.',
      'Jangan menunggu punya studio atau kamera mahal; konsistensi cahaya jendela + sudut bersih sudah cukup mengalahkan 80% kompetitor.',
    ],
    linkedSlideIndex: 13,
  },
];

const FOTO_PRODUK_POLLS: LivePollConfig[] = [
  {
    id: 'poll_fp_kendala_utama',
    title: 'Masalah Apa yang Paling Sering Bikin Foto Produkmu Kurang Menarik?',
    subtitle: 'Pilih 1 kendala yang paling sering kamu alami saat memotret produk dengan HP:',
    linkedSlideIndex: 1,
    type: 'bar',
    options: [
      {
        id: 'opt_fp_gelap_kuning',
        label: '1. Foto Terlihat Gelap, Kusam, atau Kekuningan Lampu Ruangan',
        subtitle: 'Warna produk aslinya segar tapi di foto tampak buram',
        category: 'rational',
      },
      {
        id: 'opt_fp_background_ramai',
        label: '2. Bingung Menata Alas & Latar (Terlihat Berantakan / Ramai)',
        subtitle: 'Tidak tahu properti apa yang cocok tanpa menutupi produk',
        category: 'emotional',
      },
      {
        id: 'opt_fp_blur_flash',
        label: '3. Foto Kurang Tajam / Kena Pantulan Flash Silau di Kemasan',
        subtitle: 'Tulisan merek di plastik/kaca memantul cahaya atau agak goyang',
        category: 'rational',
      },
      {
        id: 'opt_fp_bingung_sudut',
        label: '4. Bingung Memilih Sudut Foto (Angle) Biar Terlihat Menggiurkan',
        subtitle: 'Semua produk difoto dari sudut yang sama hingga terlihat datar',
        category: 'emotional',
      },
    ],
  },
  {
    id: 'poll_fp_sudut_produk',
    title: 'Sudut Pengambilan Gambar Mana yang Paling Pas untuk Produk Utamamu?',
    subtitle: 'Pilih sudut kamera yang menurutmu paling menonjolkan keunggulan produkmu:',
    linkedSlideIndex: 9,
    type: 'bar',
    options: [
      {
        id: 'opt_fp_eye_level',
        label: 'Eye Level (0° Sejajar Produk) — Botol, Toples, Box & Kemasan Berdiri',
        subtitle: 'Menampilkan tinggi kemasan dan label depan secara gagah & lurus',
        category: 'rational',
      },
      {
        id: 'opt_fp_45_degree',
        label: 'Sudut 45° (Sudut Mata Alami) — Makanan Piring, Mangkuk & Minuman Gelas',
        subtitle: 'Memperlihatkan isi hidangan sekaligus bentuk wadah dengan natural',
        category: 'emotional',
      },
      {
        id: 'opt_fp_flat_lay',
        label: 'Flat Lay (90° Tegak dari Atas) — Hampers, Set Menu, Fashion & Kriya',
        subtitle: 'Menampilkan seluruh isi paket, motif kain, atau tata letak meja rapi',
        category: 'rational',
      },
      {
        id: 'opt_fp_kombinasi_angle',
        label: 'Kombinasi Ketiganya (Slide Katalog Marketplace & Medsos)',
        subtitle: 'Slide 1 Eye Level/45°, Slide 2 Flat Lay isi paket, Slide 3 Detail Tekstur',
        category: 'emotional',
      },
    ],
  },
];

const FOTO_PRODUK_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'SERI FOTOGRAFI PRODUK • SMARTPHONE',
    title: 'Belajar Foto Produk Dasar dengan Smartphone',
    subtitle:
      'Menguasai Cahaya, Pengaturan Kamera HP, Komposisi & 3 Sudut Emas untuk Foto Katalog Siap Jual Cukup dari Meja Rumah — Disusun oleh Lalu Mahendra | obeeAcademy & obeecreatives',
    type: 'cover',
    imageUrl: '/assets/images/foto_produk_window_setup_1795658758428.jpg',
    imageCaption:
      'Setup Praktis Foto Produk UMKM: Meja Dekat Jendela, Reflektor Kertas Putih & Smartphone | obeecreatives',
    speakerNotes:
      'Buka kelas dengan meyakinkan peserta bahwa kamera HP di genggaman mereka sudah lebih dari cukup untuk menghasilkan foto katalog yang layak jual. Rahasianya bukan di harga HP atau studio mahal, melainkan pemahaman cara cahaya bekerja.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'URGENSI VISUAL • ETALASE DIGITAL',
    title: 'Di Era Online, Foto Produk adalah Kesan Pertama & Penentu Klik',
    subtitle:
      'Pembeli tidak bisa mencicipi rasa atau meraba tekstur bahan lewat layar HP — mata mereka menilai kualitas usahamu dari fotonya terlebih dahulu:',
    type: 'comparison',
    linkedPollId: 'poll_fp_kendala_utama',
    speakerNotes:
      'Jalankan Polling 1 terlebih dahulu untuk memetakan kendala terbesar peserta di kelas. Setelah hasil polling muncul, tekankan bahwa 90% kendala tersebut (foto gelap/kuning, flash mantul, latar berantakan) bukan salah HP-nya, melainkan karena kebiasaan memotret tanpa mengatur cahaya.',
    comparison: {
      leftTitle: 'Foto Seadanya (Membuat Pembeli Ragu & Scroll Lewat)',
      leftBody:
        '• Difoto di bawah lampu ruangan kuning + flash HP menembak langsung (label kemasan silau putih).\n• Latar belakang penuh barang dapur/meja ramai sehingga produk utama tenggelam.\n• Hasil tampak kusam sehingga produk berkualitas tetap terlihat murah.',
      rightTitle: 'Foto Produk Terarah (Mengundang Klik & Kepercayaan)',
      rightBody:
        '• Cahaya jendela lembut dari samping membuat warna kemasan & makanan tampak segar alami.\n• Fokus tajam pada produk utama dengan alas bersih dan ruang napas untuk teks promo.\n• Tampilan seragam di marketplace & IG langsung menaikkan nilai jual.',
    },
    bottomBanner:
      'Prinsip Dasar: Pembeli membeli gambarnya terlebih dahulu di layar HP sebelum akhirnya memutuskan membeli produk aslinya.',
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'DEFINISI INTI • MELUKIS DENGAN CAHAYA',
    title: 'Photography: Melukis dengan Cahaya & 2 Syarat Terciptanya Gambar',
    subtitle:
      'Berasal dari kata Yunani Phos (Cahaya) + Graphein (Melukis): memotret adalah merekam pantulan cahaya yang mengenai objek pada sensor kamera:',
    type: 'concept',
    speakerNotes:
      'Gunakan definisi inti dari materi asli (Phos = Cahaya, Graphein = Melukis). Tekankan bahwa kamera tidak merekam benda secara langsung, melainkan merekam pantulan cahaya dari benda tersebut. Karena itu ada 2 syarat mutlak terciptanya gambar yang baik.',
    cards: [
      {
        title: 'Arti Photography (Phos + Graphein)',
        body: 'Proses menghasilkan gambar dengan merekam pantulan cahaya yang mengenai objek pada media yang sensitif terhadap cahaya (sensor HP).',
        accent: 'orange',
      },
      {
        title: 'Syarat 1: Tersedia Sumber Cahaya',
        body: 'Tanpa cahaya yang cukup dan terarah (alami dari matahari/jendela atau buatan dari lampu/flash), detail warna dan tekstur produk tidak akan muncul.',
        accent: 'teal',
      },
      {
        title: 'Syarat 2: Cahaya Diterima Baik oleh Sensor',
        body: 'Ada cahaya saja belum cukup — sensor kamera HP wajib diatur agar cahaya masuk dalam takaran pas (tidak terlalu gelap atau silau berlebihan).',
        accent: 'orange',
      },
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'SYARAT 1 • SUMBER CAHAYA',
    title: 'Memilih Sumber Cahaya: Cahaya Alami (Jendela) vs Cahaya Buatan',
    subtitle:
      'Keduanya bisa menghasilkan foto produk berkelas selama kamu tahu cara menempatkan produk dan menjaga keseragaman warnanya:',
    type: 'comparison',
    speakerNotes:
      'Jelaskan perbandingan Cahaya Alami (contoh foto botol susu kurma & jamu dengan cahaya matahari sore) melawan Cahaya Buatan (lightbox kardus DIY, lampu LED putih, atau flash eksternal). Ingatkan: untuk pemula tanpa biaya alat, jendela rumah di pagi/sore hari adalah studio terbaik.',
    comparison: {
      leftTitle: 'Cahaya Alami / Natural (Gratis & Warna Paling Segar)',
      leftBody:
        '• Sumber terbaik: jendela atau teras teduh pada pagi (08.00–10.30) dan sore (15.00–17.00).\n• Keunggulan: warna makanan, minuman, dan kulit tampak sangat natural & segar.\n• Catatan: hindari matahari siang bolong tepat di atas kepala karena bayangan terlalu keras; tutup tirai putih jika terlalu terik.',
      rightTitle: 'Cahaya Buatan (Stabil Kapan Saja, Termasuk Malam)',
      rightBody:
        '• Pilihan praktis UMKM: Lightbox kardus berlapis kertas putih/kalkir + lampu LED putih netral (5500K) atau video light mini.\n• Keunggulan: hasil foto malam hari tetap konsisten seragam untuk puluhan varian produk.\n• Pantangan: jangan pakai lampu kilat (Flash) bawaan HP langsung dari depan ke kemasan mengilap!',
    },
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'SYARAT 2 & PRAKTIK 1 • KONTROL SENSOR',
    title: 'Cahaya Diterima Sensor: Teknik Kill Ambient Light & Kebersihan Lensa',
    subtitle:
      'Kesalahan paling sering saat foto di rumah adalah membiarkan lampu kuning ruangan bercampur dengan cahaya jendela atau lampu foto:',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    speakerNotes:
      'Angkat teknik "Kill Ambient Light" dari materi asli dengan bahasa sederhana: matikan cahaya sekitar yang mengganggu agar hanya 1 sumber cahaya bersih yang masuk ke sensor HP. Lalu minta peserta membuka Lembar Kerja 1 di HP untuk mengaudit sumber cahaya & kebersihan lensa mereka.',
    cards: [
      {
        title: '1. Wajib Lap Kaca Lensa HP',
        body: 'Sidik jari dan minyak di kamera HP adalah penyebab #1 foto terlihat berkabut, pucat, dan cahaya berpendar.',
        accent: 'orange',
      },
      {
        title: '2. Matikan Cahaya Pengganggu',
        body: 'Saat memotret di samping jendela atau lightbox, matikan lampu plafon kuning ruangan agar warna putih kemasan tidak berubah kekuningan.',
        accent: 'teal',
      },
      {
        title: '3. Fokus pada 1 Sumber Cahaya Utama',
        body: 'Satu arah cahaya utama yang jelas menciptakan bayangan rapi dan warna murni, tidak belang atau bercabang.',
        accent: 'orange',
      },
    ],
    promptLines: [
      'Produk Utama: ________________ | Sumber Cahaya Utama: ________________',
      'Cahaya Pengganggu yang Dimatikan: ________________________',
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'KENALI ALAT • KAMERA SMARTPHONE',
    title: 'Kenali Fitur Wajib Kamera Smartphone (Mode Auto Pro-Lock & Mode Pro)',
    subtitle:
      'Semua smartphone modern sudah punya tombol kontrol cahaya — kenali 6 fitur ini agar HP tidak memotret seenaknya:',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    speakerNotes:
      'Tunjukkan 6 elemen tampilan kamera HP dari slide PDF Anda (Flash, Grid, Speed, ISO, White Balance, Focus) ditambah kunci praktis AE/AF Lock & EV Slider untuk HP yang tidak punya Mode Pro lengkap. Beri waktu peserta mengecek aplikasi kamera HP mereka masing-masing dan mengisi Lembar Kerja 2.',
    cards: [
      {
        title: 'Flash OFF & Grid 3×3 ON',
        body: 'Matikan Flash bawaan agar kemasan tidak memantul silau; nyalakan Grid 3×3 agar posisi botol & garis meja selalu lurus.',
        accent: 'teal',
      },
      {
        title: 'Tap Focus + AE/AF Lock + EV',
        body: 'Tekan & tahan objek utama hingga muncul kunci AE/AF Lock, lalu geser ikon matahari (EV) naik-turun hingga terang pas.',
        accent: 'orange',
      },
      {
        title: 'Mode Pro: ISO, Speed & White Balance',
        body: 'Atur ISO serendah mungkin (100–200), Speed cukup cepat agar tidak goyang, dan kunci WB (Daylight) agar warna katalog seragam.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'MENGELOLA CAHAYA • SEGITIGA EXPOSURE',
    title: 'Mengelola Intensitas Cahaya: Segitiga Exposure Versi Smartphone',
    subtitle:
      'Tujuannya satu: menjaga gambar berada di zona NORMAL (detail tetap utuh, tidak Terlalu Gelap dan tidak Terlalu Terang):',
    type: 'formula',
    speakerNotes:
      'Jelaskan konsep Segitiga Exposure dari materi PDF Anda (ISO, Shutter Speed, Diafragma) sambil meluruskan satu hal penting: pada mayoritas HP, bukaan lensa (Diafragma/Aperture) bersifat tetap/fixed, sehingga pengaturan terang-gelap di HP lebih banyak dikendalikan lewat ISO, Shutter Speed, dan Slider EV/Brightness.',
    cards: [
      {
        title: '1. ISO (Kepekaan Sensor)',
        body: 'Menaikkan ISO membuat foto lebih terang, tapi jika terlalu tinggi memunculkan bintik kasar (noise). Di dekat jendela terang, cukup pakai ISO 50–200.',
        accent: 'orange',
      },
      {
        title: '2. Shutter Speed (Durasi Tangkap)',
        body: 'Semakin lambat Speed (mis. 1/15 detik), cahaya masuk makin banyak tapi tangan mudah goyang/blur. Gunakan sandaran atau tripod mini jika Speed lambat.',
        accent: 'teal',
      },
      {
        title: '3. Diafragma HP (Fixed) & Slider EV',
        body: 'Berbeda dari DSLR, bukaan lensa HP umumnya tetap (fixed). Jadi atur terang-gelap dengan menggeser EV (Exposure Value) tepat di zona Normal!',
        accent: 'orange',
      },
    ],
    bottomBanner:
      'Patokan Intensitas: Jika latar belakang putih mulai hilang detailnya (Terlalu Terang/Over), turunkan slider EV sedikit hingga tekstur kemasan kembali terbaca.',
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'PRAKTIK CAHAYA • ARAH SUMBER CAHAYA',
    title: '4 Pengaruh Arah Cahaya pada Bentuk & Tekstur Produk (Studi Telur)',
    subtitle:
      'Produk yang sama persis bisa terlihat datar seperti stiker atau terlihat menggugah & berdimensi hanya dengan memutar arah cahaya:',
    type: 'concept',
    speakerNotes:
      'Gunakan ilustrasi klasik 4 arah cahaya pada telur dari materi PDF Anda: (1) Front Light membuat produk rata tanpa tekstur, (2) Side Light 45°–90° memunculkan volume & tekstur paling menggoda, (3) Backlight memberi efek siluet/kilau tembus cahaya pada minuman botol/kaca, dan (4) Diffused/Soft Light memberi kesan bersih merata untuk katalog.',
    cards: [
      {
        title: '1. Front Light (Dari Depan)',
        body: 'Bayangan jatuh ke belakang, detail label terbaca rata, tetapi tekstur makanan/kriya cenderung terlihat datar (2 dimensi).',
        accent: 'teal',
      },
      {
        title: '2. Side Light 45°–90° (Terbaik & Berdimensi)',
        body: 'Memunculkan sisi terang dan bayangan lembut sehingga bentuk kemasan, kerenyahan gorengan, atau serat kain terlihat sangat nyata.',
        accent: 'orange',
      },
      {
        title: '3. Backlight (Dari Belakang)',
        body: 'Sangat ampuh untuk botol kaca, sirup, jamu, atau es kopi agar tampak berkilau segar (wajib ditambah pantulan cahaya dari depan).',
        accent: 'teal',
      },
      {
        title: '4. Soft Diffused Light (Cahaya Lembut)',
        body: 'Cahaya dilewatkan tirai putih/kalkir sehingga transisi terang ke gelap halus tanpa bayangan hitam tajam.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'PRAKTIK 2 • MEMBENTUK CAHAYA',
    title: 'Membentuk Cahaya Murah Meriah: Tirai (Diffuser) & Kertas HVS (Reflector)',
    subtitle:
      'Untuk membentuk cahaya lembut dengan gradasi rapi seperti foto studio, kamu cukup memakai dua alat yang sudah ada di rumah:',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    imageUrl: '/assets/images/foto_produk_window_setup_1795658758428.jpg',
    imagePosition: 'top',
    imageCaption:
      'Resep Meja Jendela: Jendela di Satu Sisi + Produk di Tengah + Kertas/Styrofoam Putih di Sisi Berlawanan sebagai Reflektor',
    speakerNotes:
      'Tunjukkan setup meja jendela di layar! Jelaskan kenapa sisi produk yang membelakangi jendela sering terlihat terlalu gelap, dan bagaimana selembar styrofoam putih atau kertas HVS A3 langsung memantulkan cahaya jendela untuk mengisi bayangan itu. Minta peserta mengisi Lembar Kerja 3.',
    cards: [
      {
        title: 'Diffuser (Pelembut Cahaya)',
        body: 'Tirai putih tipis, kertas kalkir, atau kain kasa di depan jendela/lampu untuk mengubah bayangan keras tajam menjadi lembut.',
        accent: 'orange',
      },
      {
        title: 'Reflector (Pengisi Bayangan)',
        body: 'Kertas karton putih, styrofoam, atau papan tulis kecil di seberang jendela untuk menerangi sisi gelap produk & merapikan label.',
        accent: 'teal',
      },
      {
        title: 'Blocker / Bendera Hitam (Opsional)',
        body: 'Karton hitam di sisi samping botol kaca/produk gelap untuk menajamkan garis tegas dan kesan elegan.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'LANJUTAN MODUL • SUDUT PENGAMBILAN GAMBAR',
    title: '3 Sudut Emas (Camera Angle) Wajib untuk Foto Produk',
    subtitle:
      'Melanjutkan bagian Sudut Pengambilan Gambar: jangan memotret semua jenis produk dari posisi yang sama — pilih sudut sesuai bentuk produknya:',
    type: 'comparison',
    linkedPollId: 'poll_fp_sudut_produk',
    imageUrl: '/assets/images/foto_produk_angles_guide_1795658758303.jpg',
    imagePosition: 'top',
    imageCaption:
      'Perbandingan 3 Sudut Kamera: Eye Level (0°) · Dining Perspective (45°) · Overhead Flat Lay (90°)',
    speakerNotes:
      'Ini adalah penyempurnaan langsung dari slide penutup PDF asli ("Sudut Pengambilan Gambar"). Jalankan Polling 2 lalu jelaskan kapan memakai Eye Level (0°), sudut 45°, dan Flat Lay (90°) agar setiap foto langsung menonjolkan bentuk terbaik produk peserta.',
    comparison: {
      leftTitle: 'Eye Level (0°) & Sudut 45° (Produk Berdiri & Kuliner)',
      leftBody:
        '• Eye Level (0° sejajar objek): Wajib untuk botol minuman, skincare, toples kue, dan box berdiri agar label terbaca tegak gagah.\n• Sudut 45° (Sudut pandang orang duduk makan): Terbaik untuk makanan di mangkuk/piring, burger, & gelas kopi agar isi dan tingginya sama-sama terlihat.',
      rightTitle: 'Flat Lay (90° Tegak Lurus dari Atas) & Detail Close-Up',
      rightBody:
        '• Flat Lay (90° Bird’s Eye): Ideal untuk hampers/paket bundling, set meja makan, produk fashion/kain, aksesori, & kriya agar seluruh komponen terlihat rapi.\n• Tips HP Flat Lay: pastikan HP benar-benar rata sejajar meja (aktifkan fitur waterpass/level jika ada) dan jauhkan bayangan tangan dari cahaya jendela.',
    },
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'PRAKTIK 3 • KOMPOSISI & PROPERTI',
    title: 'Komposisi Bersih: Grid 3×3, Negative Space & Batas Properti',
    subtitle:
      'Foto katalog yang mudah dipakai untuk poster promosi selalu menyisakan ruang bernapas dan tidak menenggelamkan produk dengan dekorasi:',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    speakerNotes:
      'Bimbing peserta mengisi Lembar Kerja 4 (menentukan sudut emas + properti + ruang kosong). Tekankan aturan maksimal 2–3 properti pendukung yang berhubungan langsung dengan bahan atau cara pakai produk (mis. biji kopi/sendok kayu untuk kopi, bukan bunga plastik yang tidak nyambung).',
    cards: [
      {
        title: '1. Ikuti Garis Grid 3×3',
        body: 'Taruh titik fokus produk (logo label atau topping utama) tepat di perpotongan garis atau tengah simetris yang tegak lurus.',
        accent: 'teal',
      },
      {
        title: '2. Sisakan Negative Space (Ruang Kosong)',
        body: 'Jangan penuhi 100% layar dengan produk — sisakan ruang polos di atas/samping untuk menaruh tulisan harga, nama varian, atau logo.',
        accent: 'orange',
      },
      {
        title: '3. Maksimal 2–3 Properti Relevan',
        body: 'Gunakan properti penguat cerita (bahan mentah, sendok, box kemasan) dengan ukuran lebih kecil dan sedikit buram dibanding produk utama.',
        accent: 'teal',
      },
    ],
    promptLines: [
      'Sudut Utama & Kedua: ________________ | Posisi Ruang Kosong: ________________',
      'Maksimal 2–3 Properti Pendukung: ________________________',
    ],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'PENERAPAN KATEGORI • RESEP CEPAT',
    title: 'Resep Praktis Setting Foto Berdasarkan Kategori Produk',
    subtitle:
      'Sesuaikan gaya pencahayaan dan sudut kamera dengan karakter barang dagangan atau layananmu:',
    type: 'comparison',
    speakerNotes:
      'Berikan contekan cepat sesuai bidang peserta di kelas (F&B kuliner, kemasan/skincare, serta kriya/fashion/jasa) agar mereka tidak bingung saat pulang nanti.',
    comparison: {
      leftTitle: 'Kuliner / F&B & Kemasan Siap Jual',
      leftBody:
        '• Kuliner Basah/Piring: Cahaya samping/serong belakang agar kuah/minyak berkilau segar + Sudut 45° + taburan segar sesaat sebelum jepret.\n• Kemasan Pouch / Botol / Skincare: Eye Level 0° tegak lurus + reflektor putih di kiri-kanan agar tulisan label terbaca tajam tanpa silau.',
      rightTitle: 'Kriya / Fashion / Produk Jasa & Korporat',
      rightBody:
        '• Kriya & Fashion: Cahaya jendela samping lembut (Side Light) agar tekstur rajutan/jahitan muncul + Flat Lay 90° untuk paket lengkap & Close-up 1×1 untuk detail.\n• Jasa / B2B: Foto aktivitas proses kerja bersih atau unit peralatan rapi dengan pencahayaan seragam + Grid lurus profesional.',
    },
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'FINISHING • EDITING RINGAN 2 MENIT',
    title: 'Editing Ringan di Smartphone: Rapi, Terang & Tetap Jujur Warna',
    subtitle:
      'Jangan ubah foto produk sampai aslinya tidak dikenali pembeli — lakukan 3 koreksi tipis ini saja selama 2 menit:',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    speakerNotes:
      'Minta peserta mengisi Lembar Kerja 5. Tegaskan bahwa fungsi editing foto produk bukan memalsukan bentuk atau warna (yang memicu rating bintang 1 karena barang tidak sesuai foto), melainkan meluruskan kemiringan, memotong rasio platform (1:1 atau 4:5), dan menaikkan kecerahan bayangan tipis.',
    cards: [
      {
        title: '1. Straighten & Crop Rasio Tepat',
        body: 'Luruskan garis meja/botol yang miring 1–2 derajat, lalu potong rasio 1:1 (Marketplace/WA) atau 4:5 (Feed Instagram agar memenuhi layar).',
        accent: 'orange',
      },
      {
        title: '2. Koreksi Cahaya Secukupnya',
        body: 'Naikkan sedikit Exposure/Shadows agar kemasan terlihat bersih; turunkan Highlights jika bagian putih terlalu silau.',
        accent: 'teal',
      },
      {
        title: '3. Jaga Kejujuran Warna (No Filter Berat)',
        body: 'Pastikan warna baju, keripik, atau saus tetap identik dengan aslinya agar tingkat kepuasan & repeat order pembeli terjaga.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'SOP PRAKTIK • 5 LANGKAH SEBELUM JEPRET',
    title: 'Checklist 5 Langkah Foto Produk Sebelum Menekan Tombol Shutter',
    subtitle:
      'Jadikan 5 urutan singkat ini kebiasaan wajib setiap kali memotret produk baru maupun konten harian:',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    speakerNotes:
      'Ajak peserta menyelesaikan Lembar Kerja 6 (komitmen foto ulang 1–3 produk minggu ini). Bacakan bersama 5 checklist praktis agar mudah diingat di luar kepala saat praktik di rumah.',
    cards: [
      {
        title: '1. Lap Lensa & Kill Ambient Light',
        body: 'Bersihkan kaca kamera dan matikan lampu kuning ruangan yang mencemari warna.',
        accent: 'teal',
      },
      {
        title: '2. Taruh Samping Jendela + Reflektor',
        body: 'Posisikan sumber cahaya di samping 45°–90° lalu pasang kertas/styrofoam putih di sisi berlawanan.',
        accent: 'orange',
      },
      {
        title: '3. Grid ON, Flash OFF & AE/AF Lock',
        body: 'Aktifkan Grid 3×3, pastikan Flash mati, tekan-tahan fokus di produk, lalu atur EV di zona Normal.',
        accent: 'teal',
      },
      {
        title: '4. Ambil 3 Sudut & Sisakan Ruang Teks',
        body: 'Ambil varian Eye Level, 45°, dan Flat Lay dengan maksimal 2–3 properti relevan.',
        accent: 'orange',
      },
      {
        title: '5. Editing Tipis 2 Menit (Warna Asli)',
        body: 'Luruskan, crop 1:1 atau 4:5, cerahkan secukupnya, lalu langsung unggah ke katalog!',
        accent: 'teal',
      },
    ],
    promptLines: [
      'Produk yang Difoto Ulang Minggu Ini: _______________________',
      'Media yang Langsung Diperbarui: ___________________________',
    ],
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'PENUTUP & RENCANA AKSI',
    title: 'Kamera Terbaik adalah HP di Tanganmu — Asal Paham Cahaya',
    subtitle:
      'Jangan menunggu kamera mahal untuk mulai memperbaiki etalase usahamu — foto rapi hari ini langsung meningkatkan kepercayaan calon pembeli:',
    type: 'closing',
    speakerNotes:
      'Tutup kelas dengan menyemangati peserta untuk mempraktikkan minimal 1 foto produk di rumah besok pagi saat cahaya jendela sedang bagus, lalu buka sesi Tanya Jawab & bedah contoh foto produk peserta secara langsung.',
    cards: [
      {
        title: '1. Cahaya Jendela + Reflektor Kertas',
        body: 'Modal nol rupiah namun langsung mengubah kesan foto rumahan menjadi sekelas katalog profesional.',
        accent: 'orange',
      },
      {
        title: '2. Disiplin Setting Kamera HP',
        body: 'Lap lensa, Flash OFF, Grid ON, & AE/AF Lock memastikan seluruh foto katalog tetap tajam dan seragam.',
        accent: 'teal',
      },
      {
        title: '3. Konsisten di 3 Sudut Emas',
        body: 'Pilih Eye Level, 45°, atau Flat Lay sesuai jenis produk dan perbarui katalog WhatsApp serta marketplace minggu ini.',
        accent: 'orange',
      },
    ],
  },
];

export const FOTO_PRODUK_DASAR_CURRICULUM: SavedMaterial = {
  id: 'foto_produk_dasar_smartphone_1',
  seminarTitle: 'Belajar Foto Produk Dasar dengan Smartphone',
  organizerName: 'obeeAcademy | obeecreatives',
  description:
    'Modul praktik fotografi produk dengan smartphone (adaptasi Klinik Usaha Mikro Diskopindag Malang + panduan sudut & workflow rumah): Konsep Melukis dengan Cahaya, Sumber Alami vs Buatan, Kill Ambient Light, Fitur Pro & AE/AF Lock HP, Segitiga Exposure versi HP, 4 Arah Cahaya & Reflektor Kertas, 3 Sudut Emas (Eye Level, 45°, Flat Lay), Komposisi Grid 3×3, hingga Editing Ringan 2 Menit (6 Lembar Kerja, 2 Polling, 15 Slide).',
  category: 'Seri Fotografi & Konten',
  isDefault: false,
  createdAt: 1734700000000,
  updatedAt: 1734700000000,
  content: {
    seminarTitle: 'Belajar Foto Produk Dasar dengan Smartphone',
    organizerName: 'obeeAcademy | obeecreatives',
    questions: FOTO_PRODUK_QUESTIONS,
    polls: FOTO_PRODUK_POLLS,
    slides: FOTO_PRODUK_SLIDES,
    qnaTopics: [
      'Setting Cahaya Jendela & Lampu Rumah',
      'Pengaturan Kamera HP (AE/AF Lock & Pro)',
      'Memilih Sudut Foto (Eye Level / 45° / Flat Lay)',
      'Alas, Properti & Komposisi Katalog',
      'Editing Cepat & Warna Jujur',
    ],
    brandTheme: {
      presetId: 'foto_produk_coral_navy',
      name: 'Foto Produk Dasar (Navy & Coral)',
      primaryColor: '#1E293B',
      accentColor: '#E11D48',
      secondaryColor: '#F59E0B',
      bgColor: '#FFFBEB',
    },
    updatedAt: 1734700000000,
    materialId: 'foto_produk_dasar_smartphone_1',
    description:
      'Modul praktik foto produk dengan smartphone: cahaya jendela, reflektor kertas, kontrol sensor & AE/AF Lock, 4 arah cahaya, 3 sudut emas, dan editing ringan 2 menit.',
    category: 'Seri Fotografi & Konten',
    isDefault: false,
    createdAt: 1734700000000,
  },
};
