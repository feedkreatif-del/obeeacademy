import {
  WorksheetQuestion,
  LivePollConfig,
  SlideDefinition,
} from './seminarData';
import { SavedMaterial } from '../types';
import { DEFAULT_BRAND_THEME } from '../brandTheme';

const SESI_4_QUESTIONS: WorksheetQuestion[] = [
  {
    index: 0,
    sectionNumber: 1,
    sectionTitle: '1. Tes Reputasi: Ingin Diingat Sebagai Apa Merekmu?',
    coreLearning:
      'Branding adalah reputasi yang tertinggal di kepala pembeli saat merekmu disebut tanpa kamu hadir di sana',
    questionText:
      'Jika pelanggan lama sedang bercerita tentang produkmu ke temannya, 3 KATA SIFAT apa yang paling ingin kamu dengar dari mulut mereka—dan 1 kebiasaan sekarang yang masih berlawanan dengan kesan itu?',
    secondaryPrompt:
      'Contoh: "Segar, higienis, ramah keluarga" (F&B) · "Rapi, estetik, cocok buat kado" (Kriya) · "Bersih, tepat waktu, bebas ribet" (Persewaan).',
    exampleAnswer:
      'Ingin diingat sebagai yoghurt rumahan yang SEGAR, HIGIENIS, dan AMAN UNTUK ANAK. Kebiasaan yang masih bertentangan: foto status WA kadang masih gelap dan label tanggal kadaluwarsa masih ditulis spidol tangan.',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa (F&B)',
    helperTips: [
      'Jangan pilih kata klise seperti "murah & enak" karena semua pesaing mengaku begitu.',
      'Pilih maksimal 3 kata sifat yang paling mudah dibuktikan lewat mata dan pengalaman pembeli.',
    ],
    linkedSlideIndex: 3,
  },
  {
    index: 1,
    sectionNumber: 2,
    sectionTitle: '2. Menetapkan Karakter & Gaya Sapaan Merek (Brand Persona)',
    coreLearning:
      'Merek yang kuat punya kepribadian konsisten sehingga terasa akrab dan tidak generik seperti toko robot',
    questionText:
      'Pilih 1 karakter kepribadian merekmu (misal: Sahabat Ibu Muda / Pengrajin Telaten / Tim Event Sigap), lalu tentukan 1 panggilan akrab & gaya sapaan wajib di semua chat dan caption!',
    secondaryPrompt:
      'Panggilan yang konsisten (contoh: "Bunda", "Kakak", "Sahabat Acara") membuat audiens langsung mengenali suara tokomu.',
    exampleAnswer:
      'Karakter: "Sahabat Ibu Cermat" (hangat, jujur, tidak menggurui). Panggilan wajib: "Bunda" dengan sapaan pembuka "Halo Bun, semoga sehat selalu ya!" di chat WA maupun caption IG.',
    exampleBusiness: 'Keripik Tempe Kriuk (F&B)',
    helperTips: [
      'Kriya/Handycraft cocok berkarakter "Hangat & Personal", seperti seniman yang merangkai karya khusus.',
      'Jasa Persewaan lebih kuat berkarakter "Sigap, Terpercaya & Tertib" agar panitia acara merasa tenang.',
    ],
    linkedSlideIndex: 5,
  },
  {
    index: 2,
    sectionNumber: 3,
    sectionTitle: '3. Mengunci Sistem Visual 3 Detik (Warna, Font & Gaya Foto)',
    coreLearning:
      'Konsistensi 2 warna inti, 1 gaya huruf, dan pencahayaan foto yang seragam menciptakan kesan profesional tanpa biaya mahal',
    questionText:
      'Kunci identitas visual merekmu hari ini: Sebutkan maksimal 2 WARNA UTAMA + 1 WARNA NETRAL, serta 1 aturan wajib gaya FOTO PRODUK agar tampilan toko tampak seragam!',
    secondaryPrompt:
      'Tips fotografi praktis: cukup manfaatkan cahaya jendela pagi/sore dengan alas meja netral (kayu/linen/putih) dan hindari lampu kuning dapur yang buram.',
    exampleAnswer:
      'Warna inti: Putih Susu (bersih) + Hijau Mint (segar), aksen Oranye Hangat untuk tombol/promo. Aturan foto: wajib foto di dekat jendela dengan alas taplak krem bersih dan botol dalam kondisi berkeringat dingin segar.',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Jangan ganti-ganti warna desain tiap ganti promo! Gunakan template warna yang sama agar orang langsung hafal dalam 3 detik.',
      'Untuk Jasa Persewaan: seragamkan sudut foto "sebelum kirim (terbungkus rapi) & sesudah terpasang rapi di lokasi".',
    ],
    linkedSlideIndex: 7,
  },
  {
    index: 3,
    sectionNumber: 4,
    sectionTitle: '4. Menutup 1 Titik Bocor Kepercayaan di Pengalaman Pembeli',
    coreLearning:
      'Kepercayaan paling sering runtuh bukan saat promo, melainkan saat barang diterima atau saat terjadi kendala kecil',
    questionText:
      'Pilih 1 titik sentuh terlemah di usahamu saat ini (Bio/Katalog, Kemasan/Unboxing, Konsistensi Mutu, atau After-Sales), lalu tulis 1 perbaikan murah yang langsung bisa dikerjakan minggu ini!',
    secondaryPrompt:
      'Contoh perbaikan murah: stiker segel tutup Rp150/pcs, kartu cara rawat/saran saji di dalam paket, atau checklist foto unit bersih sebelum dikirim.',
    exampleAnswer:
      'Titik bocor: Kemasan kirim masih pakai plastik biasa tanpa ucapan. Perbaikan minggu ini: tambah stiker segel bertuliskan "Disegel Segar Hari Ini" + sisipkan kartu kecil panduan penyimpanan & garansi ganti baru.',
    exampleBusiness: 'Tas Rajut Senja (Kriya) & Yoghurt Mbak Nisa',
    helperTips: [
      'Untuk Kriya: bungkus kain spunbond/kertas tisu + tag kartu "Dirajut tangan dengan teliti + cara mencuci" langsung menaikkan nilai hadiah.',
      'Untuk Persewaan: kirim foto unit bersih yang sudah di-wrapping ke WA penyewa H-1 acara—rasa tenangnya bernilai sangat mahal!',
    ],
    linkedSlideIndex: 10,
  },
  {
    index: 4,
    sectionNumber: 5,
    sectionTitle: '5. Merumuskan Cerita Asal & Standar Kualitas (Brand Story)',
    coreLearning:
      'Pabrik besar punya modal iklan, tetapi UMKM punya cerita manusia nyata dan ketulusan proses yang tidak bisa ditiru mesin',
    questionText:
      'Tulis 2 kalimat CERITA & STANDAR KUALITAS merekmu: [Kenapa usaha ini didirikan / untuk siapa] + [1 pantangan atau standar mutu yang tidak pernah kamu langgar]!',
    secondaryPrompt:
      'Kalimat ini bisa dipasang di Bio Instagram, Profil WhatsApp Business, atau bagian belakang kemasan.',
    exampleAnswer:
      'Berawal dari keinginan menyediakan camilan bergizi untuk anak tanpa khawatir bahan pengawet. Di dapur kami, setiap botol wajib difermentasi 12 jam dari susu segar pagi dan langsung masuk pendingin tanpa pemanis buatan.',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Sebutkan 1 hal yang "TIDAK PERNAH" kamu kompromikan (misal: tidak pakai minyak jelantah, tidak kirim unit berdebu, tidak pakai benang kasar).',
      'Cerita singkat yang jujur jauh lebih menyentuh daripada slogan berbahasa Inggris yang sulit dipahami.',
    ],
    linkedSlideIndex: 12,
  },
  {
    index: 5,
    sectionNumber: 6,
    sectionTitle: '6. Merangkum "Brand Kit Mini 1 Halaman" Usahamu',
    coreLearning:
      'Brand Kit Mini menjadi kompas agar tampilan desain, cara bicara, dan layanan usaha tetap seragam siapa pun yang mengunggahnya',
    questionText:
      'Gabungkan semua elemen di atas menjadi 1 ringkasan Brand Kit Mini usahamu: [Nama Merek & 3 Kata Sifat] + [Warna & Gaya Foto] + [1 Penguat Trust Utama]!',
    secondaryPrompt:
      'Simpan ringkasan ini sebagai pegangan wajib sebelum masuk ke strategi Marketing di Sesi 5 nanti.',
    exampleAnswer:
      'Nisa Yoghurt (Segar · Higienis · Ramah Anak) | Warna: Putih-Mint-Oranye | Foto: Cahaya natural alas krem | Sapaan: "Bunda" | Standar Trust: Segel tutup harian + garansi tukar jika kemasan bocor/asam berlebih.',
    exampleBusiness: 'Yoghurt Segar Mbak Nisa',
    helperTips: [
      'Jika kamu punya admin atau keluarga yang membantu membalas chat, tunjukkan Brand Kit 1 halaman ini agar gaya komunikasinya sama.',
      'Brand Kit yang rapi adalah pondasi wajib sebelum nanti kita mengundang banyak pembeli di Sesi 5 (Marketing).',
    ],
    linkedSlideIndex: 14,
  },
  {
    index: 6,
    sectionNumber: 7,
    sectionTitle: '7. Komitmen Pembenahan Aset Brand dalam 7 Hari',
    coreLearning:
      'Branding tidak selesai di catatan seminar; kepercayaan baru terbentuk saat aset visual & pengalaman benar-benar dirapikan',
    questionText:
      'Tuliskan 3 pembenahan aset Brand yang PASTI kamu selesaikan dalam 7 hari ke depan (sebelum menggeber promosi Marketing)!',
    secondaryPrompt:
      'Fokus pada 1 perbaikan tampilan foto/bio, 1 perbaikan kemasan/penyerahan barang, dan 1 dokumentasi bukti kualitas.',
    exampleAnswer:
      '1. Hari ke-2 foto ulang 5 produk utama pakai cahaya jendela pagi. 2. Hari ke-4 rapikan Bio WhatsApp Business & IG sesuai 2 kalimat Brand Story. 3. Hari ke-6 cetak stiker segel & kartu ucapan garansi.',
    exampleBusiness: 'Semua UMKM PartnerUp',
    helperTips: [
      'Lebih baik 3 perbaikan kecil yang langsung tayang minggu ini daripada menunggu logo baru berbulan-bulan.',
      'Setelah aset Brand rapi dalam 7 hari, usahamu siap menyambut arus calon pembeli baru pada Sesi 5 (Marketing).',
    ],
    linkedSlideIndex: 15,
  },
];

const SESI_4_POLLS: LivePollConfig[] = [
  {
    id: 'poll_s4_persepsi_branding',
    title: 'Menurutmu, Apa yang Paling Sering Membuat Pembeli Mengingat Usahamu Saat Ini?',
    subtitle: 'Pilih satu kondisi yang paling jujur menggambarkan persepsi pembeli terhadap merekmu:',
    linkedSlideIndex: 2,
    type: 'bar',
    options: [
      {
        id: 'opt_cuma_harga',
        label: '1. Cuma ingat karena harganya murah / lagi ada promo saja',
        subtitle: 'Begitu ada yang lebih murah Rp1.000, pembeli mudah pindah',
        category: 'rational',
      },
      {
        id: 'opt_nama_belum_nempel',
        label: '2. Produknya dipuji enak/bagus, tapi pembeli sering lupa nama tokonya',
        subtitle: 'Sering disebut "beli di teman/ibu itu", belum punya identitas kuat',
        category: 'emotional',
      },
      {
        id: 'opt_tampilan_berubah',
        label: '3. Foto, warna desain, & gaya kemasannya masih berubah-ubah tiap posting',
        subtitle: 'Belum punya ciri visual tetap yang langsung dikenali audiens',
        category: 'rational',
      },
      {
        id: 'opt_sudah_punya_ciri',
        label: '4. Sudah punya ciri khas jelas & sering direkomendasikan ke orang lain',
        subtitle: 'Tinggal memperketat standar pengalaman agar makin kokoh',
        category: 'emotional',
      },
    ],
  },
  {
    id: 'poll_s4_audit_touchpoint',
    title: 'Di Titik Sentuh Mana Kepercayaan Pembeli Paling Sering Bocor di Usahamu?',
    subtitle: 'Dari saat melihat foto di HP hingga barang selesai dipakai, bagian mana yang paling perlu dibenahi?',
    linkedSlideIndex: 9,
    type: 'bar',
    options: [
      {
        id: 'opt_visual_katalog',
        label: '1. Foto produk masih gelap/seadanya & tampilan feed/katalog berantakan',
        subtitle: 'Kesan pertama 3 detik kurang meyakinkan pembeli baru',
        category: 'rational',
      },
      {
        id: 'opt_kemasan_unboxing',
        label: '2. Kemasan/penyerahan barang masih polos tanpa identitas & kartu pesan',
        subtitle: 'Barang bagus, tapi terlihat biasa saja saat diterima tangan pembeli',
        category: 'emotional',
      },
      {
        id: 'opt_konsistensi_mutu',
        label: '3. Konsistensi rasa, ukuran, atau ketepatan waktu kadang masih naik-turun',
        subtitle: 'Pembeli ragu apakah pesanan berikutnya sebagus yang pertama',
        category: 'rational',
      },
      {
        id: 'opt_komplain_aftersales',
        label: '4. Belum ada standar sapaan, panduan rawat, atau garansi penanganan kendala',
        subtitle: 'Pembeli masih takut kecewa bila ada masalah setelah bayar',
        category: 'emotional',
      },
    ],
  },
];

const SESI_4_SLIDES: SlideDefinition[] = [
  {
    index: 0,
    pageNumber: 1,
    badge: 'SESI 4 PARTNERUP: SPESIALIS BRANDING',
    title: 'Branding UMKM: Membangun Identitas, Karakter & Kepercayaan Merek',
    subtitle:
      'Membedah Cara Membuat Merek Mudah Dikenali dalam 3 Detik, Dipercaya Pembeli & Kebal Perang Harga — PartnerUp | obeeAcademy',
    type: 'cover',
    speakerNotes:
      'Buka Sesi 4 sebagai pendalaman khusus pilar pertama dari Sesi 3 kemarin. Tegaskan bahwa di kelas ini kita tidak lagi membahas definisi dasar, melainkan langsung membangun aset nyata Brand UMKM: karakter merek, sistem visual 3 detik (warna & foto), serta titik sentuh pengalaman pembeli.',
  },
  {
    index: 1,
    pageNumber: 2,
    badge: 'PONDASI BRANDING NYATA',
    title: 'Branding Bukan Sekadar Logo Cantik, Melainkan Janji yang Konsisten',
    subtitle:
      'Logo hanyalah wajahnya. Branding yang menghasilkan uang berdiri di atas 3 lapis: Identitas Visual, Pengalaman Nyata, dan Reputasi.',
    type: 'comparison',
    imageUrl: '/assets/images/sesi4_brand_pyramid_1795487011525.jpg',
    imageCaption:
      '3 Lapis Brand UMKM: Identitas Visual Rapi (Kiri) · Pengalaman & Segel Peduli (Tengah) · Reputasi & Kepercayaan Pelanggan (Kanan)',
    imagePosition: 'top',
    speakerNotes:
      'Gunakan ilustrasi 3 lapis ini. Jelaskan kesalahan klasik UMKM yang menghabiskan jutaan untuk bikin logo rumit tapi lupa menjaga kebersihan kemasan, keteraturan foto produk, dan keramahan saat barang diterima. Branding yang kuat lahir ketika mata melihat hal yang rapi DAN hati pembeli merasakan bukti nyata.',
    comparison: {
      leftTitle: 'Salah Kaprah "Kosmetik" (Branding Rapuh)',
      leftBody:
        '• Sibuk ganti-ganti logo tapi foto produk di katalog gelap & asal jepret.\n• Pakai istilah keren/asing tapi pengiriman telat & plastik asal ikat.\n• Hasilnya: pembeli tetap menawar murah dan cepat lupa nama toko.',
      rightTitle: 'Branding Kokoh Ala UMKM Juara',
      rightBody:
        '• IDENTITAS: 2 warna & gaya foto seragam agar mudah dikenali dalam 3 detik.\n• PENGALAMAN: Segel aman, kartu sapaan/cara rawat, & ketepatan janji.\n• REPUTASI: Pembeli percaya penuh & sukarela merekomendasikan ke teman.',
    },
  },
  {
    index: 2,
    pageNumber: 3,
    badge: 'POLLING 1: CEK REPUTASI MEREK',
    title: 'Apa yang Membuat Pembeli Mengingat Usahamu Saat Ini?',
    subtitle:
      'Mari cek kondisi nyata di lapangan lewat HP masing-masing sebelum kita merancang Brand Kit usahamu:',
    type: 'concept',
    linkedPollId: 'poll_s4_persepsi_branding',
    speakerNotes:
      'Jalankan Polling 1. Amati hasilnya: jika mayoritas memilih opsi 1 (ingat karena murah) atau opsi 2 (lupa nama toko) atau opsi 3 (tampilan berubah-ubah), tunjukkan bahwa produknya sebenarnya sudah bagus—yang belum dibangun hanyalah jangkar identitas dan konsistensi visualnya.',
    cards: [
      {
        title: '1. Cuma Ingat Murahnya',
        body: 'Berbahaya untuk margin: begitu ada toko sebelah lebih murah Rp1.000, pembeli langsung pindah.',
        accent: 'orange',
      },
      {
        title: '2. Lupa Nama Tokonya',
        body: 'Produk disukai tapi tidak punya ciri nama/kemasan yang nempel—sulit mendapat repeat order.',
        accent: 'teal',
      },
      {
        title: '3. Tampilan Berubah-Ubah',
        body: 'Warna desain & kualitas foto acak membuat pembeli baru mengira toko kurang profesional.',
        accent: 'orange',
      },
      {
        title: '4. Sudah Punya Ciri Khas',
        body: 'Modal kuat! Tinggal mengunci standar visual dan pengalaman agar siap ekspansi di Marketing.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 3,
    pageNumber: 4,
    badge: 'PRAKTIK 1: TES REPUTASI',
    title: 'Ingin Diingat Sebagai Apa Saat Pembeli Menceritakan Merekmu?',
    subtitle:
      'Branding dimulai dari keputusan tegas: kesan apa yang harus melekat dan kebiasaan apa yang harus dihentikan?',
    type: 'worksheet',
    linkedQuestionIndex: 0,
    speakerNotes:
      'Beri waktu 3 menit untuk peserta menuliskan 3 kata sifat target reputasi dan 1 kebiasaan kontradiktif di HP. Sorot 2 jawaban peserta dan diskusikan betapa seringnya niat "ingin terlihat higienis/premium" dirusak oleh hal sepele seperti tulisan spidol acak atau foto buram.',
    promptLines: [
      '3 Kata Sifat Target: ____________ | 1 Kebiasaan yang Masih Bertentangan: ____________',
    ],
  },
  {
    index: 4,
    pageNumber: 5,
    badge: 'PILAR 1: BRAND POSITIONING & PERSONA',
    title: 'Karakter Merek: Jangan Tampak Sama dengan 100 Penjual Lain',
    subtitle:
      'Pilih 1 kepribadian & gaya bicara yang spesifik agar merekmu terasa seperti sosok manusia yang akrab dan dipercaya.',
    type: 'concept',
    speakerNotes:
      'Sambungkan ke Value Proposition Sesi 1: setelah tahu apa keunggulannya, kini beri "jiwa/kepribadian" pada merek itu. Jelaskan 3 contoh karakter paling efektif untuk UMKM Indonesia: Sahabat Keluarga Hangat (F&B), Pengrajin Detail Penuh Makna (Kriya), dan Partner Acara Sigap Tanpa Cemas (Persewaan).',
    cards: [
      {
        title: 'F&B: "Sahabat Keluarga Cermat"',
        body: 'Nada hangat, jujur soal bahan segar & tanggal buat, menyapa "Bunda/Kak", penuh perhatian pada kesehatan.',
        accent: 'orange',
      },
      {
        title: 'Kriya: "Pengrajin Telaten & Personal"',
        body: 'Nada ramah penuh cerita, menonjolkan ketelitian tangan, cocok untuk kado bermakna bagi orang tersayang.',
        accent: 'teal',
      },
      {
        title: 'Jasa Sewa: "Tim Sigap Anti-Cemas"',
        body: 'Nada lugas, tertib jadwal, rapi dokumentasi sterilisasi & kepastian unit aman sebelum hari acara.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 5,
    pageNumber: 6,
    badge: 'PRAKTIK 2: BRAND PERSONA',
    title: 'Tentukan Karakter & Sapaan Wajib Merekmu',
    subtitle:
      'Kunci 1 gaya kepribadian dan panggilan akrab agar seluruh konten, kemasan, dan balasan chat terdengar seragam:',
    type: 'worksheet',
    linkedQuestionIndex: 1,
    speakerNotes:
      'Minta peserta menuliskan karakter + sapaan wajibnya. Tekankan bahwa sapaan kecil yang konsisten di caption, WA, dan kartu paket membuat pelanggan merasa dilayani oleh merek yang jelas identitasnya.',
    promptLines: [
      'Karakter Merek: ____________ | Panggilan & Sapaan Wajib: ____________',
    ],
  },
  {
    index: 6,
    pageNumber: 7,
    badge: 'PILAR 2: SISTEM VISUAL 3 DETIK',
    title: 'Aturan 3 Detik Visual: 2 Warna Inti, 1 Gaya Huruf & Foto Terang',
    subtitle:
      'Otak pembeli menilai kredibilitas toko dalam 3 detik pertama sebelum membaca satu kata pun. Konsistensi mengalahkan kerumitan!',
    type: 'comparison',
    imageUrl: '/assets/images/sesi4_brand_touchpoints_clean_1795487026686.jpg',
    imageCaption:
      'Kiri: Warna acak, foto gelap, plastik polos (terlihat murah). Kanan: 2 warna konsisten, foto cahaya natural terang, segel & kartu rapi (terlihat terpercaya).',
    imagePosition: 'top',
    speakerNotes:
      'Tunjukkan perbandingan visual ini. Berikan tips fotografi & desain praktis yang langsung bisa dilakukan pakai HP: (1) Kunci maksimal 2 warna utama + 1 warna netral di Canva/desain label, (2) Pakai maksimal 2 jenis huruf (judul tegas + isi mudah dibaca), (3) Foto di sebelah jendela pagi/sore pakai alas polos bersih—jangan pakai flash HP di malam hari!',
    comparison: {
      leftTitle: 'Visual yang Menurunkan Harga Diri Produk',
      leftBody:
        '• Tiap postingan beda warna mencolok (pink, hijau stabilo, merah campur).\n• Foto gelap kekuningan di bawah lampu dapur dengan latar panci/meja penuh barang.\n• Huruf desain terlalu banyak jenis hingga susah dibaca di layar HP.',
      rightTitle: 'Rumus Visual 3 Detik (Mudah & Hemat)',
      rightBody:
        '• WARNA: Kunci 2 warna merek + 1 warna netral (krem/putih) di semua aset.\n• FOTO: Wajib cahaya alami dekat jendela + alas bersih seragam.\n• TIPOGRAFI: 1 font tegas untuk judul nama + 1 font simpel untuk keterangan.',
    },
  },
  {
    index: 7,
    pageNumber: 8,
    badge: 'PRAKTIK 3: KUNCI WARNA & GAYA FOTO',
    title: 'Kunci Palet Warna & Aturan Foto Produk Usahamu',
    subtitle:
      'Tuliskan aturan visual sederhana yang harus dipatuhi setiap kali kamu memotret atau membuat poster promosi:',
    type: 'worksheet',
    linkedQuestionIndex: 2,
    speakerNotes:
      'Arahkan peserta memilih warna yang sesuai dengan rasa/kategori produknya (misal: segar natural, hangat gurih, atau rapi profesional), sekaligus menetapkan 1 spot foto paling terang di rumah/workshop mereka.',
    promptLines: [
      '2 Warna Inti + 1 Netral: ____________ | Aturan Wajib Foto Produk: ____________',
    ],
  },
  {
    index: 8,
    pageNumber: 9,
    badge: 'PILAR 3: PETA TITIK SENTUH (TOUCHPOINTS)',
    title: '4 Titik Sentuh Tempat Kepercayaan Pembeli Dibangun (atau Runtuh)',
    subtitle:
      'Branding bekerja setiap kali pembeli bersentuhan dengan usahamu—dari layar HP sampai barang selesai dipakai di rumah.',
    type: 'formula',
    speakerNotes:
      'Ajak peserta menelusuri 4 titik sentuh berurutan. Sering kali UMKM bagus di Titik 1 & 2 (bio & chat ramah), tapi hancur di Titik 3 (kemasan bocor/kusam) atau Titik 4 (menghilang saat dikomplain). Keempat titik ini harus dijaga selaras.',
    cards: [
      {
        title: '1. Sebelum Beli (Layar HP)',
        body: 'Bio jelas, foto terang jujur, katalog rapi & testimoni nyata pelanggan.',
        accent: 'teal',
      },
      {
        title: '2. Saat Bertanya (Chat/Lapak)',
        body: 'Sapaan akrab sesuai persona, penjelasan jujur & tampilan nota/kuitansi rapi.',
        accent: 'orange',
      },
      {
        title: '3. Saat Barang Diterima',
        body: 'Segel bersih, kemasan pelindung aman, kartu ucapan + saran saji/cara rawat.',
        accent: 'teal',
      },
      {
        title: '4. Setelah Pemakaian',
        body: 'Sapaan tanya kepuasan + jaminan tukar cepat tanpa ribet jika ada cacat.',
        accent: 'orange',
      },
    ],
  },
  {
    index: 9,
    pageNumber: 10,
    badge: 'POLLING 2: AUDIT TITIK SENTUH',
    title: 'Di Titik Sentuh Mana Kepercayaan Pembeli Paling Sering Bocor?',
    subtitle:
      'Jawab jujur lewat HP untuk melihat titik mana yang paling banyak menjadi PR peserta kelas hari ini:',
    type: 'concept',
    linkedPollId: 'poll_s4_audit_touchpoint',
    speakerNotes:
      'Jalankan Polling 2 lalu bahas solusinya langsung sesuai mayoritas pilihan peserta. Pastikan setiap titik bocor diberikan contoh perbaikan berbiaya sangat murah namun berdampak besar pada kesan pembeli.',
    cards: [
      {
        title: '1. Foto & Katalog Seadanya',
        body: 'Obatnya: buat 1 sudut foto jendela tetap & kunci 2 warna template untuk semua unggahan.',
        accent: 'orange',
      },
      {
        title: '2. Kemasan Polos Tanpa Identitas',
        body: 'Obatnya: stiker segel nama merek + kartu ucapan kecil berbiaya ratusan rupiah per paket.',
        accent: 'teal',
      },
      {
        title: '3. Mutu & Waktu Naik-Turun',
        body: 'Obatnya: pakai takaran timbangan wajib & checklist QC 3 poin sebelum barang keluar dapur/toko.',
        accent: 'orange',
      },
      {
        title: '4. Belum Ada Jaminan & Sapaan',
        body: 'Obatnya: tuliskan garansi tukar jelas di kartu kemasan & sapa pelanggan 1–2 hari setelah terima.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 10,
    pageNumber: 11,
    badge: 'PRAKTIK 4: TUTUP TITIK BOCOR',
    title: 'Pilih 1 Perbaikan Titik Sentuh Paling Berdampak Minggu Ini',
    subtitle:
      'Tidak perlu langsung sempurna sekaligus—tutup 1 kebocoran kepercayaan terbesar dengan solusi yang hemat biaya:',
    type: 'worksheet',
    linkedQuestionIndex: 3,
    cards: [
      {
        title: 'Contoh F&B',
        body: 'Stiker segel tutup bertanggal + kartu "Simpan di kulkas maksimal 7 hari · Garansi ganti jika bocor".',
        accent: 'orange',
      },
      {
        title: 'Contoh Kriya',
        body: 'Tag nama merek + panduan rawat kain/kulit + pembungkus tisu/kraft rapi siap jadi kado.',
        accent: 'teal',
      },
      {
        title: 'Contoh Jasa Sewa',
        body: 'Kirim foto unit terbungkus bersih sebelum berangkat + seragam/kartu identitas teknisi rapi.',
        accent: 'orange',
      },
    ],
    promptLines: [
      'Titik Bocor Utama: ____________ | Perbaikan Murah Minggu Ini: ____________',
    ],
  },
  {
    index: 11,
    pageNumber: 12,
    badge: 'PILAR 4: CERITA & STANDAR KUALITAS',
    title: 'Brand Story: Senjata UMKM yang Tidak Bisa Ditiru Pabrik Besar',
    subtitle:
      'Pembeli masa kini menyukai produk yang jelas siapa pembuatnya, kenapa dibuat dengan peduli, dan standar apa yang dijaga.',
    type: 'concept',
    speakerNotes:
      'Jelaskan bahwa Brand Story bukan dongeng panjang membosankan. Cukup 2 kalimat jujur: (1) alasan tulus usaha ini dibuat/untuk siapa, dan (2) 1 standar mutu atau pantangan yang tidak pernah dilanggar meskipun lebih repot. Ini langsung membangun ikatan emosional.',
    cards: [
      {
        title: 'Asal Usul Jujur (Why)',
        body: 'Contoh: "Berawal dari mencari camilan sehat untuk anak sendiri tanpa pemanis buatan & pengawet."',
        accent: 'teal',
      },
      {
        title: 'Pantangan Mutu (Standard)',
        body: 'Contoh: "Pantang pakai minyak goreng berulang / pantang kirim unit tanpa proses steril lengkap."',
        accent: 'orange',
      },
      {
        title: 'Tempat Menampilkan Cerita',
        body: 'Bio IG/WA Business, bagian belakang kemasan, kartu terima kasih, dan konten proses di balik layar.',
        accent: 'teal',
      },
    ],
  },
  {
    index: 12,
    pageNumber: 13,
    badge: 'PRAKTIK 5: TULIS BRAND STORY',
    title: 'Tulis 2 Kalimat Cerita Asal & Standar Mutu Merekmu',
    subtitle:
      'Buat ringkas, tulus, dan langsung bisa ditempel ke Bio WhatsApp Business, Instagram, atau label kemasan:',
    type: 'worksheet',
    linkedQuestionIndex: 4,
    speakerNotes:
      'Minta peserta menulis 2 kalimat saja agar langsung jadi. Sorot 2 cerita terbaik di proyektor untuk menginspirasi peserta lain bahwa hal sederhana dari dapur atau bengkel kerja mereka adalah aset branding termahal.',
    promptLines: [
      'Cerita Asal & Standar Mutu Merekku (2 Kalimat): ____________________________________',
    ],
  },
  {
    index: 13,
    pageNumber: 14,
    badge: 'KAITAN DENGAN SESI 2 (MARGIN IDEAL)',
    title: 'Kenapa Branding Adalah Pelindung Terbaik Margin Usahamu',
    subtitle:
      'Di Sesi 2 kamu menghitung margin ideal 30%–70%. Brandinglah yang membuat pembeli rela membayar angka sehat itu tanpa menawar.',
    type: 'comparison',
    speakerNotes:
      'Tarik benang merah ke Sesi 2: tanpa Branding, produkmu dianggap komoditas biasa sehingga pembeli memakai standar harga termurah. Dengan Branding yang konsisten (visual rapi + pengalaman aman + cerita jujur), pembeli membandingkan nilai dan rasa tenang—bukan sekadar selisih Rp1.000.',
    comparison: {
      leftTitle: 'Tanpa Branding (Terjebak Perang Harga)',
      leftBody:
        '• Pembeli menganggap produkmu sama persis dengan lapak lain.\n• Margin terpaksa dipangkas terus demi memenangkan tawar-menawar.\n• Kualitas bahan terancam turun saat modal naik.',
      rightTitle: 'Dengan Branding Kokoh (Margin Terlindungi)',
      rightBody:
        '• Pembeli percaya standar kebersihan, keawetan, & ketepatan layananmu.\n• Pembeli berani mengambil paket bundling atau repeat order harga normal.\n• Pelanggan baru datang dari rekomendasi pelanggan puas.',
    },
  },
  {
    index: 14,
    pageNumber: 15,
    badge: 'PRAKTIK 6: BRAND KIT MINI 1 HALAMAN',
    title: 'Rangkum "Brand Kit Mini 1 Halaman" Usahamu Sekarang!',
    subtitle:
      'Satukan seluruh keputusan hari ini menjadi panduan resmi merek agar konsisten ke mana pun usahamu tampil:',
    type: 'worksheet',
    linkedQuestionIndex: 5,
    speakerNotes:
      'Minta peserta menuliskan ringkasan utuh Brand Kit Mini mereka di HP. Jelaskan bahwa dokumen ringkas ini nanti akan langsung dipakai sebagai "seragam resmi" saat kita masuk ke Sesi 5 (Marketing: menjemput traffic & kalender konten).',
    promptLines: [
      'Nama & 3 Sifat + Warna & Foto + Sapaan + 1 Penguat Trust Utama: ____________________',
    ],
  },
  {
    index: 15,
    pageNumber: 16,
    badge: 'PENUTUP & AKSI 7 HARI',
    title: 'Checklist 7 Hari Rapikan Brand Sebelum Menjemput Traffic di Sesi 5',
    subtitle:
      'Ibarat membuka toko: rapikan dulu papan nama, pencahayaan etalase, dan keramahan pelayanan sebelum mengundang ratusan tamu datang!',
    type: 'closing',
    linkedQuestionIndex: 6,
    speakerNotes:
      'Tutup Sesi 4 dengan menegaskan komitmen 7 hari pembenahan aset brand. Beri gambaran singkat tentang Sesi 5 berikutnya (Spesialis Marketing): setelah "toko dan wadah brand" kita rapi minggu ini, di Sesi 5 kita akan menyalakan mesin pengundang calon pembeli baru lewat peta kolam pasar, 3 pilar konten, dan kolaborasi lokal.',
    promptLines: [
      '3 Pembenahan Brand dalam 7 Hari ke Depan: ____________________________________',
    ],
    cards: [
      {
        title: 'Hari 1–2: Visual & Bio',
        body: 'Foto ulang produk utama di cahaya terang & rapikan Bio IG/WA dengan 2 kalimat Brand Story.',
        accent: 'orange',
      },
      {
        title: 'Hari 3–5: Kemasan & Standar',
        body: 'Siapkan stiker segel, kartu ucapan/cara rawat, atau checklist kebersihan sebelum kirim.',
        accent: 'teal',
      },
      {
        title: 'Hari 6–7: Siap Sesi 5 (Marketing)',
        body: 'Wajah brand seragam & terpercaya—siap menjemput arus calon pembeli baru di Sesi Marketing!',
        accent: 'orange',
      },
    ],
  },
];

export const SESI_4_BRANDING_CURRICULUM: SavedMaterial = {
  id: 'partnerup_sesi_4_branding_umkm',
  seminarTitle: 'Sesi 4 PartnerUp: Branding UMKM — Identitas, Karakter & Kepercayaan Merek',
  organizerName: 'Seri PartnerUp | obeeAcademy',
  description:
    'Modul Spesialis Branding (lanjutan Sesi 3): Membangun Brand Persona & positioning, aturan visual 3 detik (2 warna + foto terang), audit 4 titik sentuh kepercayaan pembeli, Brand Story jujur, dan Brand Kit Mini 1 Halaman siap pakai (7 Pertanyaan, 2 Polling, 16 Slide).',
  category: 'Seri PartnerUp (Sesi 4)',
  isDefault: false,
  createdAt: 1733500000000,
  updatedAt: 1733600000000,
  content: {
    seminarTitle: 'Sesi 4 PartnerUp: Branding UMKM — Identitas, Karakter & Kepercayaan Merek',
    organizerName: 'Seri PartnerUp | obeeAcademy',
    questions: SESI_4_QUESTIONS,
    polls: SESI_4_POLLS,
    slides: SESI_4_SLIDES,
    qnaTopics: [
      'Positioning & Karakter Merek',
      'Identitas Visual & Foto Produk',
      'Kemasan & Titik Sentuh Trust',
      'Brand Story UMKM',
      'Brand Kit & Menjaga Margin',
    ],
    brandTheme: DEFAULT_BRAND_THEME,
    updatedAt: 1733600000000,
    materialId: 'partnerup_sesi_4_branding_umkm',
    description:
      'Modul Spesialis Branding (lanjutan Sesi 3): Membangun Brand Persona, aturan visual 3 detik, audit 4 titik sentuh kepercayaan pembeli, Brand Story jujur, dan Brand Kit Mini 1 Halaman.',
    category: 'Seri PartnerUp (Sesi 4)',
    isDefault: false,
    createdAt: 1733500000000,
  },
};
