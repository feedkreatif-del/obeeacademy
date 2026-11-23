import { jsPDF } from 'jspdf';
import {
  SlideDefinition,
  WorksheetQuestion,
  LivePollConfig,
  RATIONAL_CONVERSION_DICTIONARY,
  VP_THREE_TESTS,
} from '../data/seminarData';
import { BrandThemeConfig } from '../types';
import { DEFAULT_BRAND_THEME } from '../brandTheme';

export interface FacilitatorPdfOptions {
  materialId?: string;
  seminarTitle: string;
  organizerName: string;
  description?: string;
  slides: SlideDefinition[];
  questions: WorksheetQuestion[];
  polls?: LivePollConfig[];
  brandTheme?: BrandThemeConfig;
}

/**
 * Bersihkan karakter emoji / simbol non-Latin1 agar font standar PDF (Helvetica)
 * tercetak rapi tanpa karakter aneh atau kotak kosong.
 */
function sanitizePdfText(input: string): string {
  if (!input) return '';
  return String(input)
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/↔/g, '<->')
    .replace(/•/g, '-')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/✅/g, '[OK]')
    .replace(/❌/g, '[HINDARI]')
    .replace(/⭐/g, '[*]')
    .replace(/💡/g, '[CATATAN]')
    .replace(/📌/g, '[POIN]')
    .replace(/🎯/g, '[TARGET]')
    // Hapus emoji / surrogate pairs / karakter di luar Latin-1 (U+0020..U+00FF + newline)
    .replace(/[^\x0A\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function hexToRgb(hex?: string, fallback: [number, number, number] = [31, 58, 95]): [number, number, number] {
  if (!hex) return fallback;
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return fallback;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return fallback;
  return [r, g, b];
}

class PdfBuilder {
  public doc: jsPDF;
  public y: number = 22;
  public readonly pageWidth = 210;
  public readonly pageHeight = 297;
  public readonly margin = 16;
  public readonly contentWidth = 210 - 32; // 178mm
  public readonly bottomLimit = 278;
  public primaryRgb: [number, number, number];
  public accentRgb: [number, number, number];
  public secondaryRgb: [number, number, number];
  public headerTitle: string;

  constructor(options: {
    headerTitle: string;
    primaryRgb: [number, number, number];
    accentRgb: [number, number, number];
    secondaryRgb: [number, number, number];
  }) {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.headerTitle = sanitizePdfText(options.headerTitle);
    this.primaryRgb = options.primaryRgb;
    this.accentRgb = options.accentRgb;
    this.secondaryRgb = options.secondaryRgb;
  }

  public addPageIfNeeded(requiredHeight: number): void {
    if (this.y + requiredHeight > this.bottomLimit) {
      this.newPage();
    }
  }

  public newPage(): void {
    this.doc.addPage();
    this.y = 22;
    this.drawRunningHeader();
  }

  public drawRunningHeader(): void {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8);
    this.doc.setTextColor(120, 130, 145);
    const shortHeader =
      this.headerTitle.length > 72 ? `${this.headerTitle.slice(0, 69)}...` : this.headerTitle;
    this.doc.text(`MODUL PENDALAMAN PEMATERI | ${shortHeader}`, this.margin, 12);
    this.doc.setDrawColor(220, 226, 234);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, 14.5, this.pageWidth - this.margin, 14.5);
  }

  public drawCoverPage(params: {
    badge: string;
    title: string;
    subtitle: string;
    organizer: string;
    statsText: string;
    highlights: string[];
  }): void {
    const { doc, pageWidth, pageHeight, margin } = this;

    // Background header block (Navy full bleed upper 62%)
    doc.setFillColor(...this.primaryRgb);
    doc.rect(0, 0, pageWidth, 185, 'F');

    // Accent strip
    doc.setFillColor(...this.accentRgb);
    doc.rect(0, 185, pageWidth, 4, 'F');

    // Badge
    doc.setFillColor(...this.accentRgb);
    doc.roundedRect(margin, 28, 86, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(sanitizePdfText(params.badge).toUpperCase(), margin + 4, 33.4);

    // Main Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const titleLines = doc.splitTextToSize(sanitizePdfText(params.title), pageWidth - margin * 2);
    doc.text(titleLines, margin, 52);

    const afterTitleY = 52 + titleLines.length * 9.5 + 4;

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(225, 234, 245);
    const subLines = doc.splitTextToSize(sanitizePdfText(params.subtitle), pageWidth - margin * 2);
    doc.text(subLines, margin, afterTitleY);

    // Metadata panel inside dark cover
    const metaY = Math.max(afterTitleY + subLines.length * 6 + 14, 130);
    doc.setFillColor(20, 40, 68);
    doc.roundedRect(margin, metaY, pageWidth - margin * 2, 36, 3, 3, 'F');
    doc.setDrawColor(...this.accentRgb);
    doc.setLineWidth(0.6);
    doc.line(margin, metaY, margin, metaY + 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...this.accentRgb);
    doc.text('PENYELENGGARA & PROGRAM', margin + 6, metaY + 9);
    doc.text('CAKUPAN MODUL INI', margin + 96, metaY + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(sanitizePdfText(params.organizer).slice(0, 42), margin + 6, metaY + 16);
    doc.text(sanitizePdfText(params.statsText).slice(0, 42), margin + 96, metaY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(200, 212, 228);
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Dokumen Belajar Khusus Fasilitator · ${dateStr}`, margin + 6, metaY + 28);

    // Lower Cream Box: What you will master
    doc.setFillColor(255, 249, 240);
    doc.rect(0, 189, pageWidth, pageHeight - 189, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...this.primaryRgb);
    doc.text('FOKUS PENDALAMAN MATERI UNTUK PEMATERI:', margin, 206);

    let hy = 216;
    params.highlights.forEach((item, idx) => {
      doc.setFillColor(...this.secondaryRgb);
      doc.circle(margin + 3, hy - 1.2, 2.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(idx + 1), margin + 1.8, hy);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...this.primaryRgb);
      const lines = doc.splitTextToSize(sanitizePdfText(item), pageWidth - margin * 2 - 12);
      doc.text(lines, margin + 10, hy);
      hy += lines.length * 5.2 + 3.5;
    });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(110, 120, 135);
    doc.text(
      'Catatan: Dokumen ini dirancang sebagai bahan penguasaan konsep, angka simulasi, dan teknik menjawab pertanyaan peserta di kelas.',
      margin,
      284
    );

    this.newPage();
  }

  public addChapterHeading(chapterLabel: string, title: string): void {
    this.addPageIfNeeded(24);
    if (this.y > 26) {
      this.y += 4;
    }

    this.doc.setFillColor(...this.accentRgb);
    this.doc.roundedRect(this.margin, this.y, 28, 5.5, 1.5, 1.5, 'F');
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(sanitizePdfText(chapterLabel).toUpperCase(), this.margin + 3, this.y + 3.9);

    this.y += 9;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14.5);
    this.doc.setTextColor(...this.primaryRgb);
    const lines = this.doc.splitTextToSize(sanitizePdfText(title), this.contentWidth);
    this.doc.text(lines, this.margin, this.y);
    this.y += lines.length * 6.2 + 1.5;

    this.doc.setDrawColor(...this.accentRgb);
    this.doc.setLineWidth(0.7);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 6;
  }

  public addSubHeading(title: string): void {
    this.addPageIfNeeded(14);
    this.y += 2;
    this.doc.setFillColor(...this.primaryRgb);
    this.doc.rect(this.margin, this.y - 3.8, 2.2, 5.2, 'F');
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.setTextColor(...this.primaryRgb);
    const lines = this.doc.splitTextToSize(sanitizePdfText(title), this.contentWidth - 5);
    this.doc.text(lines, this.margin + 5, this.y);
    this.y += lines.length * 5.2 + 2.5;
  }

  public addParagraph(text: string, boldPrefix?: string): void {
    const fullText = boldPrefix ? `${boldPrefix} ${text}` : text;
    const clean = sanitizePdfText(fullText);
    if (!clean) return;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9.8);
    this.doc.setTextColor(40, 52, 70);

    const lines = this.doc.splitTextToSize(clean, this.contentWidth);
    const lineHeight = 4.9;

    for (let i = 0; i < lines.length; i++) {
      this.addPageIfNeeded(lineHeight + 2);
      this.doc.text(lines[i], this.margin, this.y);
      this.y += lineHeight;
    }
    this.y += 2.5;
  }

  public addBullets(items: Array<{ lead?: string; body: string }>): void {
    const indent = 6;
    const lineHeight = 4.8;

    items.forEach((item) => {
      const text = sanitizePdfText(item.lead ? `${item.lead}: ${item.body}` : item.body);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9.6);
      const lines = this.doc.splitTextToSize(text, this.contentWidth - indent - 2);
      this.addPageIfNeeded(lines.length * lineHeight + 3);

      this.doc.setFillColor(...this.accentRgb);
      this.doc.circle(this.margin + 2, this.y - 1.3, 1.1, 'F');

      this.doc.setTextColor(35, 48, 66);
      lines.forEach((line: string, idx: number) => {
        if (idx > 0 && this.y + lineHeight > this.bottomLimit) {
          this.newPage();
        }
        this.doc.text(line, this.margin + indent, this.y);
        this.y += lineHeight;
      });
      this.y += 1.5;
    });
    this.y += 2;
  }

  public addCalloutBox(params: {
    title: string;
    bodyLines: string[];
    tone?: 'orange' | 'teal' | 'navy';
  }): void {
    const tone = params.tone || 'orange';
    const bgColor: [number, number, number] =
      tone === 'teal'
        ? [232, 247, 244]
        : tone === 'navy'
          ? [240, 245, 252]
          : [255, 246, 234];
    const barColor: [number, number, number] =
      tone === 'teal'
        ? this.secondaryRgb
        : tone === 'navy'
          ? this.primaryRgb
          : this.accentRgb;

    const innerWidth = this.contentWidth - 10;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9.4);

    const wrappedParagraphs = params.bodyLines.map((line) =>
      this.doc.splitTextToSize(sanitizePdfText(line), innerWidth)
    );
    const totalTextLines = wrappedParagraphs.reduce((sum, arr) => sum + arr.length, 0);
    const boxHeight = 11 + totalTextLines * 4.6 + wrappedParagraphs.length * 1.6;

    this.addPageIfNeeded(Math.min(boxHeight + 4, 80));

    // If box fits on current page, draw cleanly with background; if very tall, cap per page
    if (this.y + boxHeight <= this.bottomLimit) {
      this.doc.setFillColor(...bgColor);
      this.doc.roundedRect(this.margin, this.y, this.contentWidth, boxHeight, 2.5, 2.5, 'F');
      this.doc.setFillColor(...barColor);
      this.doc.rect(this.margin, this.y, 2.5, boxHeight, 'F');

      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(9.5);
      this.doc.setTextColor(...barColor);
      this.doc.text(sanitizePdfText(params.title), this.margin + 6, this.y + 6);

      let cy = this.y + 11.5;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9.3);
      this.doc.setTextColor(35, 48, 66);
      wrappedParagraphs.forEach((lines) => {
        lines.forEach((l: string) => {
          this.doc.text(l, this.margin + 6, cy);
          cy += 4.6;
        });
        cy += 1.4;
      });

      this.y += boxHeight + 4.5;
    } else {
      // Fallback multi-page rendering for extra-long boxes
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(9.6);
      this.doc.setTextColor(...barColor);
      this.doc.text(`[${sanitizePdfText(params.title)}]`, this.margin, this.y + 4);
      this.y += 8;
      params.bodyLines.forEach((line) => {
        this.addParagraph(line);
      });
    }
  }

  public addTable(headers: string[], rows: string[][], colRatios?: number[]): void {
    const ratios = colRatios || headers.map(() => 1 / headers.length);
    const colWidths = ratios.map((r) => r * this.contentWidth);

    const drawHeader = () => {
      const headerHeight = 8.5;
      this.addPageIfNeeded(headerHeight + 10);
      this.doc.setFillColor(...this.primaryRgb);
      this.doc.rect(this.margin, this.y, this.contentWidth, headerHeight, 'F');
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(255, 255, 255);

      let cx = this.margin;
      headers.forEach((h, i) => {
        this.doc.text(sanitizePdfText(h), cx + 2.5, this.y + 5.7);
        cx += colWidths[i];
      });
      this.y += headerHeight;
    };

    drawHeader();

    rows.forEach((row, rIdx) => {
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8.6);
      const cellLines = row.map((cell, cIdx) =>
        this.doc.splitTextToSize(sanitizePdfText(cell), colWidths[cIdx] - 5)
      );
      const maxLines = Math.max(...cellLines.map((cl) => cl.length), 1);
      const rowHeight = maxLines * 4.3 + 4.2;

      if (this.y + rowHeight > this.bottomLimit) {
        this.newPage();
        drawHeader();
      }

      if (rIdx % 2 === 1) {
        this.doc.setFillColor(246, 249, 252);
        this.doc.rect(this.margin, this.y, this.contentWidth, rowHeight, 'F');
      }
      this.doc.setDrawColor(218, 225, 235);
      this.doc.setLineWidth(0.25);
      this.doc.rect(this.margin, this.y, this.contentWidth, rowHeight, 'S');

      let cx = this.margin;
      this.doc.setTextColor(35, 48, 66);
      cellLines.forEach((lines, cIdx) => {
        this.doc.setFont('helvetica', cIdx === 0 ? 'bold' : 'normal');
        let cy = this.y + 4.8;
        lines.forEach((line: string) => {
          this.doc.text(line, cx + 2.5, cy);
          cy += 4.3;
        });
        cx += colWidths[cIdx];
      });

      this.y += rowHeight;
    });

    this.y += 5;
  }

  public addPageFooters(): void {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setDrawColor(220, 226, 234);
      this.doc.setLineWidth(0.3);
      this.doc.line(this.margin, 285, this.pageWidth - this.margin, 285);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(130, 140, 155);
      this.doc.text('obeeAcademy | Modul Penguasaan Materi Khusus Pemateri', this.margin, 290);
      this.doc.text(`Halaman ${i} dari ${totalPages}`, this.pageWidth - this.margin - 24, 290);
    }
  }
}

/**
 * Bab Spesialis Khusus Sesi 2 PartnerUp:
 * Target Penjualan, Margin Ideal & Copywriting Penyampai Value Proposition
 */
function appendSesi2PartnerUpMasteryChapters(pdf: PdfBuilder): void {
  // BAB 1
  pdf.addChapterHeading('BAB 1', 'Konteks Lapangan & Psikologi Peserta PartnerUp Sesi 2');
  pdf.addParagraph(
    'Kurikulum Sesi 2 ini dirancang khusus sebagai kelanjutan langsung setelah peserta menuntaskan 3 pertemuan mendalam tentang Value Proposition (VP). Dari evaluasi kelas sebelumnya, terungkap 4 kendala nyata yang mengunci perkembangan omzet peserta:'
  );
  pdf.addBullets([
    {
      lead: 'Masalah 1 - Tidak Punya Target Penjualan (Mental Pasrah)',
      body: 'Mayoritas peserta hanya pasrah menunggu "berapa pun yang laku bulan ini". Akibatnya, saat diajak menyusun strategi marketing, mereka merasa tidak butuh karena tidak ada angka yang harus dikejar.',
    },
    {
      lead: 'Masalah 2 - Bingung Menentukan Margin Ideal Saat VP Diterapkan',
      body: 'Setelah tahu pentingnya kemasan higienis, segel, kartu garansi, atau bonus box kado, peserta takut harga jualnya kemahalan atau justru lupa memasukkan biaya VP sehingga untung tergerus habis.',
    },
    {
      lead: 'Masalah 3 - Bingung Menyusun Copywriting & Konten Penyampai VP',
      body: 'Peserta sudah menulis Value Proposition di lembar kerja Sesi 1, namun buntu saat harus mengubahnya menjadi status WhatsApp, caption Instagram/TikTok, atau skrip penawaran.',
    },
    {
      lead: 'Masalah 4 - Strategi Marketing Tidak Terarah',
      body: 'Promosi dilakukan seingatnya saja tanpa tahu berapa jumlah calon pembeli yang wajib dijemput setiap hari.',
    },
  ]);

  pdf.addCalloutBox({
    title: 'KALIMAT PEMBUKA WAJIB PEMATERI DI 10 MENIT PERTAMA',
    tone: 'orange',
    bodyLines: [
      '"Bapak/Ibu, kemarin 3 kali pertemuan kita sudah susah payah merumuskan Value Proposition. Tapi saat saya tanya berapa target penjualan per bulan, rata-rata jawabannya: terserah yang beli berapa. Hari ini kita harus jujur: kalau Bapak/Ibu tidak punya target penjualan, buat apa kita belajar marketing? Justru target penjualan itulah yang memaksa kita menyusun strategi marketing untuk mencapainya!"',
      'Tujuan kalimat ini: Memicu kesadaran emosional peserta secara santai namun menohok sebelum masuk ke hitungan angka.',
    ],
  });

  // BAB 2
  pdf.addChapterHeading('BAB 2', 'Matematika Target Penjualan & Rumus Jemput Bola (Marketing Funnel)');
  pdf.addSubHeading('2.1 Rumus Mengubah Kebutuhan Hidup Menjadi Target Unit Harian');
  pdf.addParagraph(
    'Jangan memulai target dari angka angan-angan ("ingin omzet 50 juta"). Mulailah dari berapa laba bersih yang ingin dibawa pulang ke keluarga, lalu pecah menjadi target harian agar terasa ringan dan masuk akal.'
  );

  pdf.addCalloutBox({
    title: 'RUMUS 3 LANGKAH TARGET PENJUALAN UMKM',
    tone: 'navy',
    bodyLines: [
      'Langkah 1: Target Total Beban = Target Laba Bersih Pribadi/Bulan + Biaya Tetap Usaha (listrik, kuota, sewa tempat, gaji bantu).',
      'Langkah 2: Target Unit Bulanan = Target Total Beban / Untung Bersih per 1 Unit Produk (Margin Bersih Rupiah).',
      'Langkah 3: Target Harian = Target Unit Bulanan / Jumlah Hari Jualan Efektif (misal 25 hari untuk F&B/Kriya, atau 8 hari akhir pekan untuk Persewaan).',
    ],
  });

  pdf.addSubHeading('2.2 Simulasi Nyata 3 Jenis Usaha Peserta PartnerUp');
  pdf.addTable(
    ['Jenis Usaha', 'Target Beban / Bln', 'Untung Bersih / Unit', 'Target Harian & Solusi Bundling'],
    [
      [
        'F&B (Yoghurt / Keripik)',
        'Laba Rp4,5 jt + Tetap Rp1 jt = Rp5,5 jt/bln',
        'Eceran: Rp5.000/botol | Paket 5 Botol: Rp22.000',
        'Jika jual eceran butuh 44 botol/hari (berat!). Jika dorong Paket 5 Botol, cukup laku 10 PAKET/hari (25 hari kerja).',
      ],
      [
        'Kriya / Handycraft (Tas Rajut)',
        'Laba Rp5 jt + Tetap Rp750 rb = Rp5,75 jt/bln',
        'Satuan: Rp90.000/tas | Hampers Set: Rp150.000',
        'Butuh 64 tas/bln (2-3 tas/hari). Dengan paket Hampers Kado, target turun menjadi hanya 38 paket/bln (~1-2 order/hari).',
      ],
      [
        'Jasa Persewaan (Alat Acara / Tenda / Sound)',
        'Laba Rp6 jt + Tetap Rp2 jt = Rp8 jt/bln',
        'Paket Sewa Standar: Rp250.000/acara (bersih)',
        'Butuh 32 transaksi sewa/bln. Jika fokus acara Sabtu-Minggu (8 hari puncak), targetnya adalah 4 KLIEN per hari akhir pekan.',
      ],
    ],
    [0.2, 0.25, 0.25, 0.3]
  );

  pdf.addSubHeading('2.3 Rumus Corong "Angka Jemput Bola" (Kenapa Harus Promosi Tiap Hari)');
  pdf.addParagraph(
    'Saat peserta sudah memegang Target Harian (misalnya 6 pembeli per hari), ajarkan Hukum Konversi Realistis UMKM. Tidak semua orang yang melihat iklan langsung beli.'
  );
  pdf.addBullets([
    {
      lead: 'Tahap 1 - Mata Melihat (Traffic): 100 - 150 orang/hari',
      body: 'Harus melihat status WA, Reels/TikTok, brosur titip warung, atau katalog grup. Tanpa traffic ini, mustahil ada pembeli baru.',
    },
    {
      lead: 'Tahap 2 - Orang Bertanya (Leads/Chat): 15 - 20 orang/hari',
      body: 'Sekitar 10-15% orang yang melihat akan tertarik bertanya harga, cek stok, atau minta foto detail.',
    },
    {
      lead: 'Tahap 3 - Transaksi Transfer (Closing): 3 - 6 pembeli/hari',
      body: 'Rasio closing normal via WhatsApp/DM adalah 20-30% dari yang bertanya. Artinya, jika hari ini baru ada 2 orang yang chat, peserta wajib proaktif menjemput 15+ chat lagi!',
    },
  ]);

  // BAB 3
  pdf.addChapterHeading('BAB 3', 'Bedah Margin Ideal Value Proposition & Jebakan Hitungan UMKM');
  pdf.addSubHeading('3.1 Kesalahan Fatal: Mengira Markup = Margin');
  pdf.addParagraph(
    'Banyak UMKM merasa sudah mengambil untung besar 30%, padahal kenyataannya margin mereka tipis dan habis saat memberi diskon atau biaya kemasan VP. Pemateri wajib meluruskan perbedaan dua rumus ini di papan tulis/layar:'
  );
  pdf.addCalloutBox({
    title: 'WASPADA JEBAKAN MARKUP VS MARGIN',
    tone: 'teal',
    bodyLines: [
      'Contoh Kasus Keripik: Modal total produksi Rp10.000. Pemilik menaikkan Rp3.000 sehingga dijual Rp13.000.',
      '- Markup (kenaikan dari modal) memang 30% (3.000 / 10.000).',
      '- TAPI Margin Kotor (bagian untung dari harga jual) hanyalah 3.000 / 13.000 = 23%!',
      'Dampak bahayanya: Begitu pemilik memberi diskon reseller 20% (Rp2.600), untungnya sisa Rp400 perak! Padahal masih harus bayar kuota, bensin, dan risiko bungkus kempes.',
      'Rumus Benar Mencari Harga Jual dari Target Margin: Harga Jual = Total HPP (termasuk biaya VP) / (1 - % Margin Target). Contoh HPP Rp12.000 ingin margin 40% -> Rp12.000 / 0,6 = Rp20.000.',
    ],
  });

  pdf.addSubHeading('3.2 Komponen Biaya VP & Patokan Margin Sehat per Sektor');
  pdf.addTable(
    ['Sektor Usaha', 'Patokan Margin Sehat', 'Biaya VP yang Wajib Masuk HPP', 'Strategi Paket & Bundling'],
    [
      [
        'F&B (Yoghurt, Keripik, Makanan)',
        'Margin Kotor 30% - 50%',
        'Kemasan food-grade, segel aman, stiker anti air/minyak, es gel/bubble wrap, cadangan garansi rusak 3%.',
        'Paket Hemat Mingguan (Beli 5 Gratis Ongkir Lokal / Hemat 10%), Paket Mix Varian Keluarga.',
      ],
      [
        'Kriya / Handycraft',
        'Margin Kotor 40% - 70%',
        'Bahan utama, benang/aksesoris, UPAH WAKTU PEMBUAT (jangan nol!), box kado, pita, kartu ucapan nama.',
        'Paket Kado Siap Beri (Tas + Dompet Senada + Box + Kartu Ucapan) menaikkan harga 25-35%.',
      ],
      [
        'Jasa Persewaan',
        'Margin Bersih 50% - 70% (pasca perawatan)',
        'Dana perawatan/cuci/sterilisasi & penyusutan alat 15-20% per transaksi, BBM antar-jemput, bonus cadangan alat.',
        'Paket Acara Terima Beres (Sewa alat + antar-pasang-jemput + jaminan tepat waktu 2 jam sebelum acara).',
      ],
    ],
    [0.18, 0.2, 0.32, 0.3]
  );

  // BAB 4
  pdf.addChapterHeading('BAB 4', 'Framework Copywriting & Konten Penyampai Value Proposition');
  pdf.addSubHeading('4.1 Jembatan Langsung dari Lembar Kerja VP Sesi 1 ke Konten Harian');
  pdf.addParagraph(
    'Peserta tidak perlu pintar merangkai kata puitis. Ajarkan bahwa copywriting promosi hanyalah memindahkan 3 kotak jawaban yang sudah mereka isi di Sesi 1 kemarin ke dalam struktur 3 kalimat:'
  );
  pdf.addBullets([
    {
      lead: 'Pilar 1 - HOOK Masalah / Keraguan (Dari Tugas & Kekhawatiran Pembeli)',
      body: 'Awali kalimat pertama dengan pertanyaan atau masalah yang sering ditakutkan target pembeli agar mereka merasa "Ini gue banget!". Hindari membuka status dengan "Open Order / Ready Stok".',
    },
    {
      lead: 'Pilar 2 - BUKTI NYATA VP (Dari Rational Value - Bukan Kata Sifat Kosong)',
      body: 'Dilarang memakai kata "enak, bagus, murah, berkualitas". Ganti dengan angka, proses higienis, garansi nyata, waktu ketahanan, atau layanan spesifik.',
    },
    {
      lead: 'Pilar 3 - AJAKAN PAKET / CTA (Dari Emotional Value + Bundling)',
      body: 'Berikan satu instruksi tindakan yang jelas dan alasan kenapa pesan paket bundling hari ini lebih untung/tenang.',
    },
  ]);

  pdf.addSubHeading('4.2 Bank Contoh Copywriting Sebelum vs Sesudah untuk Bedah Kelas');
  pdf.addTable(
    ['Sektor', 'Copywriting Biasa (Pembeli Cuek)', 'Copywriting Penyampai VP (Mengundang Chat)'],
    [
      [
        'F&B: Yoghurt & Keripik',
        '"Ready yoghurt homemade enak dan keripik renyah murah meriah. Minat langsung WA ya."',
        '"Sering khawatir anak jajan sembarangan? Yoghurt segar fermentasi 12 jam tanpa pemanis buatan, botol bersegel rapi + garansi ganti baru kalau asam berlebih. Ambil Paket 5 Botol untuk stok kulkas seminggu lebih hemat Rp15.000! Klik WA sekarang."',
      ],
      [
        'Kriya: Tas Rajut / Hampers',
        '"Open order tas rajut handmade cantik berkualitas. Warna banyak, yuk diorder kak."',
        '"Bingung cari kado ulang tahun yang awet & nggak pasaran? Tas rajut benang katun jahitan rapat anti-brudul, muat HP + dompet + mukena travel. Gratis box eksklusif & kartu ucapan tulis nama penerima! Chat untuk pilih warna ready hari ini."',
      ],
      [
        'Jasa Persewaan Alat Acara',
        '"Menyewakan peralatan acara / camping / sound murah area kota. Hubungi kami."',
        '"Panitia acara sering deg-degan alat datang telat atau kotor? Semua unit kami disterilkan sebelum dikirim + GARANSI TIBA 2 JAM sebelum acara dimulai. Ambil Paket Terima Beres (Antar-Pasang-Jemput) biar acara lancar tanpa capek!"',
      ],
    ],
    [0.18, 0.34, 0.48]
  );

  pdf.addCalloutBox({
    title: 'TEKNIK LIVE COACHING 60 DETIK DI PROYEKTOR',
    tone: 'orange',
    bodyLines: [
      'Saat masuk ke Praktik 6 (Menulis Copywriting VP), sorot 3 jawaban peserta di layar (masing-masing 1 dari F&B, Kriya, Persewaan).',
      '1. Puji keberanian mereka terlebih dahulu.',
      '2. Lingkari jika masih ada kata "enak/murah/bagus", lalu tanya langsung ke kelas: "Biar pembeli percaya tanpa mencicipi dulu, kata enak ini kita ganti bukti angka apa?".',
      '3. Tambahkan kalimat ajakan paket bundling di akhir kalimat. Dalam 60 detik, seluruh kelas melihat transformasi nyatanya.',
    ],
  });

  // BAB 5
  pdf.addChapterHeading('BAB 5', 'Antisipasi Pertanyaan Sulit & Rundown Mengajar (90-120 Menit)');
  pdf.addSubHeading('5.1 Jawaban Taktis Menghadapi Keberatan Peserta di Kelas');
  pdf.addTable(
    ['Pertanyaan / Keberatan Peserta', 'Cara Pemateri Menjawab dengan Tegas & Membumi'],
    [
      [
        '"Kalau biaya kemasan, segel, dan garansi dimasukkan ke harga jual, produk saya jadi lebih mahal dari tetangga. Nanti nggak laku gimana?"',
        'Justru itu fungsi Value Proposition! Tetangga jual murah tanpa kepastian kebersihan & garansi. Pembeli segmen menengah tidak mencari yang paling murah, mereka mencari yang paling aman dan praktis. Jangan jual ke orang yang cuma menawar harga termurah—jual ke pasar oleh-oleh, ibu muda, atau panitia acara yang menghargai ketenangan.',
      ],
      [
        '"Saya pasang target 400 bungkus sebulan, tapi realitanya baru laku 100. Bukannya malah bikin stres?"',
        'Target bukan untuk menyiksa diri, melainkan sebagai alarm pengingat. Kalau target 15 bungkus/hari baru tercapai 5, artinya alarm berbunyi: jumlah orang yang ditawari hari ini masih kurang banyak, atau paket bundling-nya perlu dievaluasi. Tanpa target, kita tidak pernah tahu harus berbenah.',
      ],
      [
        '"Usaha saya jasa persewaan, orderan cuma ramai pas weekend atau musim nikahan/liburan. Bagaimana bikin target hariannya?"',
        'Untuk jasa musiman, jangan dibagi 30 hari! Bagi target bulanan dengan jumlah HARI PUNCAK (misal 8 hari Sabtu-Minggu). Lalu pada hari Senin-Jumat, target hariannya bukan transaksi, melainkan target JEMPUT BOLA: menghubungi 10 calon penyelenggara acara/EO/kampus untuk booking tanggal minggu depan.',
      ],
      [
        '"Produk kriya saya rajut tangan butuh 3 hari untuk 1 tas. Tidak mungkin jual banyak unit per hari!"',
        'Kalau kapasitas produksi terbatas oleh waktu tangan, jangan kejar volume banyak dengan harga murah. Naikkan margin per unit ke 50-70% dengan positioning produk eksklusif/custom nama, gunakan sistem Pre-Order (DP 50% di muka), dan buat produk pelengkap cepat jadi (gantungan tas/dompet koin) sebagai bundling.',
      ],
      [
        '"Saya tidak pandai bikin video TikTok/Reels atau nulis panjang lebar, apakah masih bisa jalan?"',
        'Sangat bisa! 80% transaksi UMKM lokal justru terjadi di WhatsApp. Fokuskan copywriting 3 Pilar tadi untuk Status WhatsApp pagi hari, foto bersih produk dekat jendela, dan broadcast sopan ke pelanggan yang pernah membeli.',
      ],
    ],
    [0.36, 0.64]
  );

  pdf.addSubHeading('5.2 Panduan Alokasi Waktu Kelas (Total 105 Menit)');
  pdf.addTable(
    ['Segmen & Slide', 'Durasi', 'Fokus Fasilitator'],
    [
      ['Pembukaan & Polling 1 (Slide 1-3)', '15 Menit', 'Patahkan pola pikir pasrah, kaitkan 3 sesi VP ke target omzet.'],
      ['Target Laba & Praktik 1-2 (Slide 4-6)', '20 Menit', 'Bantu peserta menghitung target laba bulanan & target unit harian di HP.'],
      ['Margin Ideal VP & Bundling (Slide 7-10)', '25 Menit', 'Bedah jebakan markup vs margin, cek HPP F&B/Kriya/Sewa, & buat 1 paket bundling.'],
      ['Angka Jemput Bola & Polling 2 (Slide 11-12)', '15 Menit', 'Hitung target chat WA harian yang wajib dijemput.'],
      ['Copywriting 3 Pilar & Live Bedah (Slide 13-15)', '20 Menit', 'Tulis copywriting dari VP Sesi 1 lalu poles 3 contoh di layar proyektor.'],
      ['Komitmen Aksi 14 Hari & Penutup (Slide 16)', '10 Menit', 'Kunci jadwal rutin pagi-rabu-minggu agar langsung dipraktikkan besok.'],
    ],
    [0.36, 0.16, 0.48]
  );
}

/**
 * Bab Spesialis Khusus Sesi 3 PartnerUp:
 * Perbedaan Mendasar Branding, Marketing, dan Selling
 */
function appendSesi3PartnerUpMasteryChapters(pdf: PdfBuilder): void {
  // BAB 1
  pdf.addChapterHeading('BAB 1', 'Analogi Toko & 4 Kesalahpahaman Mendasar UMKM');
  pdf.addParagraph(
    'Kurikulum Sesi 3 ini melanjutkan langsung Sesi 2 (Target Penjualan, Margin Ideal & Copywriting). Di lapangan, banyak UMKM sudah menghitung target laba tetapi tetap kelelahan dan tidak closing karena menyamakan Branding, Marketing, dan Selling. Gunakan analogi toko fisik ini agar seluruh peserta langsung paham dalam 2 menit:'
  );
  pdf.addBullets([
    {
      lead: '1. MARKETING = Orang Ramah di Pinggir Jalan Mengundang Masuk',
      body: 'Tugasnya mencari perhatian pasar yang tepat dan membuat orang penasaran lalu bertanya atau mampir. Jika postingan mulai diklik, dikomentari, atau dibalas chat tanya harga, Marketing sudah BERHASIL—meski belum tentu langsung bayar detik itu.',
    },
    {
      lead: '2. BRANDING = Suasana Toko Bersih, Rapi, Segel Meyakinkan & Reputasi Jujur',
      body: 'Tugasnya mengunci kepercayaan sehingga saat pembeli masuk, mereka yakin kualitasnya sepadan dan tidak menawar harga murahan. Branding menjaga margin sehat 30%-70% yang dihitung di Sesi 2.',
    },
    {
      lead: '3. SELLING = Kasir / Pelayan Sigap yang Menutup Transaksi di Depan',
      body: 'Tugasnya menggali kebutuhan pembeli yang sudah bertanya, mengarahkan ke Paket Bundling hemat, menjawab keraguan, melakukan follow-up H+1, dan mengajak beli ulang.',
    },
    {
      lead: '4. Jebakan Terbesar UMKM: Rajin 1 Pilar Tapi Mengira Sudah Mengerjakan Semuanya',
      body: 'Banyak pemilik usaha merasa "sudah jualan setiap hari" padahal hanya rajin posting status (baru Marketing) atau sibuk mempercantik stiker (baru Branding) sambil membiarkan chat WA terbengkalai (Selling kosong).',
    },
  ]);

  // BAB 2
  pdf.addChapterHeading('BAB 2', 'Matriks Perbedaan Tugas, Waktu & Ukuran Keberhasilan');
  pdf.addTable(
    ['Dimensi', 'BRANDING (Jaga Nilai)', 'MARKETING (Cari Traffic)', 'SELLING (Jemput Uang)'],
    [
      [
        'Pertanyaan Inti',
        '"Kenapa saya harus percaya & mau bayar harga segini ke usahamu?"',
        '"Bagaimana calon pembeli tepat tahu produkku ada & tertarik menyapa?"',
        '"Bagaimana mengubah chat yang masuk menjadi transfer & paket lebih besar?"',
      ],
      [
        'Fokus Kerja',
        'Bukti kualitas, segel higienis, konsistensi rasa, garansi, & identitas rapi.',
        'Hook konten VP, bagi tester komunitas, kolaborasi mitra/WO, & Status WA.',
        'Respon cepat (<5 menit), gali kebutuhan, tawarkan bundling, & follow-up H+1.',
      ],
      [
        'Indikator Sukses',
        'Pembeli tidak menawar harga & berani merekomendasikan ke teman.',
        'Jumlah pasang mata yang melihat (Traffic) & jumlah chat tanya masuk (Leads).',
        'Rasio closing (% tanya jadi transfer) & nilai rata-rata order naik.',
      ],
      [
        'Horison Efek',
        'Jangka menengah-panjang: membangun reputasi & melindungi margin ideal.',
        'Harian-mingguan: menjaga keran calon pembeli baru terus mengalir.',
        'Saat ini juga: mengubah minat yang sudah hangat menjadi omzet tunai.',
      ],
    ],
    [0.16, 0.28, 0.28, 0.28]
  );

  // BAB 3
  pdf.addChapterHeading('BAB 3', 'Diagnosa "Jangan Salah Obat!" & Penerapan 3 Sektor UMKM');
  pdf.addParagraph(
    'Ajarkan peserta mendiagnosa titik bocor sebelum bekerja keras. Memberi obat yang salah hanya membuang tenaga dan biaya:'
  );
  pdf.addTable(
    ['Gejala Lapangan', 'Diagnosa Pilar Bocor', 'Obat Salah (Jangan Lakukan)', 'Obat Tepat untuk Sektor F&B, Kriya & Sewa'],
    [
      [
        'Produk bagus tapi sepi yang lihat & jarang ada chat baru bertanya.',
        'Masalah MARKETING',
        'Ganti-ganti warna logo atau banting harga.',
        'F&B: titip tester PAUD/kantor. Kriya: Reels proses rajut/jahit. Sewa: sapa rutin EO/panitia kampus.',
      ],
      [
        'Ramai yang lihat & tanya, tapi selalu dibanding-bandingkan harga murahan.',
        'Masalah BRANDING',
        'Ikut perang harga murah sampai margin habis.',
        'F&B: segel higienis + tanggal segar. Kriya: kartu rawat + box kado rapi. Sewa: bukti foto unit steril + seragam kru.',
      ],
      [
        'Banyak chat tanya harga masuk WA, tapi setelah dijawab langsung hilang (ghosting).',
        'Masalah SELLING',
        'Menyalahkan produk atau algoritma medsos.',
        'Ganti jawaban harga polos dengan skrip 3 langkah: Gali acara/kebutuhan -> Arahkan ke Paket Bundling -> Follow-up H+1.',
      ],
    ],
    [0.23, 0.17, 0.2, 0.4]
  );

  // BAB 4
  pdf.addChapterHeading('BAB 4', 'Rumus Skrip Selling Anti-Ghosting WA & Jadwal Seimbang 7 Hari');
  pdf.addCalloutBox({
    title: 'SKRIP WA ANTI-GHOSTING (LANGSUNG DIPRAKTIKKAN PESERTA DI KELAS)',
    tone: 'teal',
    bodyLines: [
      'JANGAN: "15rb kak. Mau pesan?" (Chat langsung mati, pembeli merasa hanya berhadapan dengan daftar harga).',
      '1. Sambut + Gali Kebutuhan: "Siap Kak! Boleh dibantu infonya, ini untuk konsumsi keluarga sendiri atau acara kado/kantor tanggal berapa?"',
      '2. Arahkan 2 Opsi Paket Bundling: "Biar lebih hemat & aman, paling banyak pelanggan ambil Paket 5 Botol Bonus Ice Pack (Rp70rb) dibanding eceran Rp15rb/botol. Lebih pas yang mana Kak?"',
      '3. Follow-Up Sopan H+1: "Halo Kak, izin mengingatkan kembali untuk slot pengiriman besok/tanggal 18 masih tersisa 1 paket lagi ya Kak."',
    ],
  });

  pdf.addSubHeading('Panduan Alokasi Waktu Kelas Sesi 3 (Total 100 Menit)');
  pdf.addTable(
    ['Segmen & Slide', 'Durasi', 'Fokus Fasilitator'],
    [
      ['Pembukaan, Analogi Toko & Polling 1 (Slide 1-4)', '20 Menit', 'Patahkan anggapan "rajin posting = sudah lengkap", lakukan audit aktivitas minggu lalu.'],
      ['Bedah 3 Pilar & Matriks Strategi (Slide 5-8)', '20 Menit', 'Sambungkan Branding ke VP Sesi 1, Marketing ke Target Sesi 2, & peran Selling.'],
      ['Polling 2 & Diagnosa Jangan Salah Obat (Slide 9-10)', '15 Menit', 'Sorot 3 peserta berbeda titik bocor agar kelas paham cara memilih obat tepat.'],
      ['Praktik Branding, Marketing & Skrip Selling (Slide 11-13)', '25 Menit', 'Polis langsung balasan chat WA peserta di layar proyektor agar bebas ghosting.'],
      ['Sinergi 3 Roda Gigi & Jadwal Seimbang 7 Hari (Slide 14-16)', '20 Menit', 'Rangkai 1 alur utuh + kunci jadwal mingguan agar 3 roda berjalan seimbang.'],
    ],
    [0.38, 0.14, 0.48]
  );
}

/**
 * Bab Spesialis Khusus Materi Desain Kemasan Pemasaran UMKM
 */
function appendPackagingMasteryChapters(pdf: PdfBuilder): void {
  pdf.addChapterHeading('BAB 1', 'Pendalaman Konsep: Kemasan Sebagai Wiraniaga Diam (Silent Salesperson)');
  pdf.addParagraph(
    'Untuk audiens UMKM daerah (seperti pelaku makanan ringan, keripik, sambal, dan oleh-oleh khas), hambatan terbesar bukan kurangnya kelezatan produk, melainkan kemasan yang membuat produk terlihat murahan dan mudah ditawar. Pemateri perlu menekankan 4 prinsip inti ini:'
  );
  pdf.addBullets([
    {
      lead: 'Hukum Pandang 3 Detik di Rak Retail',
      body: 'Di toko oleh-oleh atau minimarket, pembeli hanya butuh 3 detik untuk melirik atau melewati rak. Warna kontras, nama produk besar, dan transparansi produk menentukan apakah tangan pembeli mengambil produk kita.',
    },
    {
      lead: 'Anatomi 5 Elemen Label Depan',
      body: 'Urutan mata pembeli: (1) Nama Merek besar di atas, (2) Jenis Produk yang langsung terbaca jelas, (3) Varian Rasa/Keunggulan utama, (4) Jendela bening atau foto produk menggugah selera, (5) Label legalitas dasar (Halal/P-IRT/Berat Bersih).',
    },
    {
      lead: 'Efek Pengali Harga Jual (Packaging Power)',
      body: 'Tambahan biaya kemasan standing pouch + stiker vinyl umumnya hanya Rp1.000 - Rp1.800 per bungkus, namun membuka akses ke pasar oleh-oleh/bingkisan dengan kenaikan harga jual Rp5.000 - Rp12.000 per bungkus.',
    },
    {
      lead: 'Solusi Cetak Hemat Tanpa MOQ Ribuan',
      body: 'Jangan menunggu modal jutaan untuk cetak printing pabrik (minimal 5.000 pcs). Ajarkan solusi praktis: beli pouch polos food-grade isi 50-100 pcs + cetak stiker vinyl tahan air/minyak ukuran A3+ di percetakan digital lokal.',
    },
  ]);
}

/**
 * Bab Spesialis Khusus Materi Sesi 1 Value Proposition
 */
function appendSesi1VpMasteryChapters(pdf: PdfBuilder): void {
  pdf.addChapterHeading('BAB 1', 'Pendalaman Konsep: Merumuskan Value Proposition yang Tajam');
  pdf.addParagraph(
    'Inti dari Sesi 1 adalah membimbing UMKM keluar dari perang harga dan klaim kosong ("enak, murah, berkualitas") menuju alasan rasional dan emosional yang dapat dibuktikan secara nyata.'
  );
  pdf.addTable(
    ['Alat Uji Ketajaman VP', 'Pertanyaan Uji di Kelas', 'Kriteria Lolos'],
    VP_THREE_TESTS.map((t) => [t.title, t.question, t.passCriteria]),
    [0.24, 0.38, 0.38]
  );
  pdf.addSubHeading('Kamus Konversi Kata Sifat Umum -> Bukti Angka Spesifik');
  pdf.addTable(
    ['Hindari Klaim Umum', 'Ganti Dengan Bukti Spesifik / Angka'],
    RATIONAL_CONVERSION_DICTIONARY.map((d) => [d.vagueWord, d.concreteProof]),
    [0.35, 0.65]
  );
}

/**
 * Generate and download crisp multi-page A4 Facilitator Deep-Dive PDF (.pdf)
 */
export function exportFacilitatorDeepDivePdf(options: FacilitatorPdfOptions): void {
  const {
    materialId = '',
    seminarTitle,
    organizerName,
    description,
    slides,
    questions,
    polls = [],
    brandTheme,
  } = options;

  const theme = brandTheme || DEFAULT_BRAND_THEME;
  const primaryRgb = hexToRgb(theme.primaryColor, [31, 58, 95]);
  const accentRgb = hexToRgb(theme.accentColor, [242, 140, 40]);
  const secondaryRgb = hexToRgb(theme.secondaryColor, [42, 157, 143]);

  const isSesi2PartnerUp =
    materialId === 'partnerup_sesi_2_action_plan' ||
    seminarTitle.toLowerCase().includes('target penjualan') ||
    seminarTitle.toLowerCase().includes('margin ideal');
  const isSesi3PartnerUp =
    materialId === 'partnerup_sesi_3_branding_marketing_selling' ||
    (seminarTitle.toLowerCase().includes('branding') && seminarTitle.toLowerCase().includes('selling')) ||
    seminarTitle.toLowerCase().includes('sesi 3');
  const isPackaging =
    materialId === 'desain_kemasan_pemasaran_umkm' ||
    seminarTitle.toLowerCase().includes('desain kemasan');
  const isSesi1 =
    materialId === 'partnerup_sesi_1_curriculum' ||
    seminarTitle.toLowerCase().includes('kenapa pembeli harus pilih kamu');

  const pdf = new PdfBuilder({
    headerTitle: seminarTitle,
    primaryRgb,
    accentRgb,
    secondaryRgb,
  });

  const highlights: string[] = isSesi2PartnerUp
    ? [
        'Menghubungkan 3 pertemuan Value Proposition ke aksi jualan & target omzet harian.',
        'Simulasi hitungan target laba, margin sehat, dan bundling untuk F&B, Kriya, & Jasa Persewaan.',
        'Mengubah rumus Value Proposition Sesi 1 menjadi Copywriting 3 Pilar siap posting.',
        'Panduan menjawab 5 keberatan paling sulit dari peserta di kelas + skrip tiap slide (Slide 1-16).',
      ]
    : isSesi3PartnerUp
    ? [
        'Meluruskan kesalahpahaman klasik UMKM lewat Analogi Toko (Branding vs Marketing vs Selling).',
        'Panduan diagnosa "Jangan Salah Obat!" untuk sektor F&B, Kriya, dan Jasa Persewaan.',
        'Rumus Skrip Selling WhatsApp Anti-Ghosting untuk mengubah chat tanya menjadi transfer paket.',
        'Peta sinergi 3 roda gigi & jadwal eksekusi seimbang 7 hari + skrip Slide 1-16.',
      ]
    : [
        'Penguasaan konsep mendalam agar pemateri tampil percaya diri dan menguasai panggung.',
        'Panduan memandu setiap soal lembar kerja peserta & contoh jawaban ideal UMKM.',
        'Strategi memantik diskusi pada polling interaktif di kelas.',
        `Bedah lengkap ${slides.length} slide presentasi beserta catatan pembicara (speaker notes).`,
      ];

  pdf.drawCoverPage({
    badge: 'Modul Pendalaman Khusus Pemateri',
    title: seminarTitle,
    subtitle:
      description ||
      'Panduan lengkap penguasaan konsep, hitungan bisnis, teknik live coaching, dan skrip presentasi slide per slide untuk fasilitator UMKM.',
    organizer: organizerName || 'obeeAcademy | Obeecreatives',
    statsText: `${slides.length} Slide · ${questions.length} Lembar Kerja · ${polls.length} Polling`,
    highlights,
  });

  // Bab pendalaman khusus sesuai kurikulum
  if (isSesi2PartnerUp) {
    appendSesi2PartnerUpMasteryChapters(pdf);
  } else if (isSesi3PartnerUp) {
    appendSesi3PartnerUpMasteryChapters(pdf);
  } else if (isPackaging) {
    appendPackagingMasteryChapters(pdf);
  } else if (isSesi1) {
    appendSesi1VpMasteryChapters(pdf);
  }

  // Lampiran / Bab Bedah Lembar Kerja & Polling
  const worksheetChapterLabel = isSesi2PartnerUp ? 'BAB 6' : isSesi3PartnerUp ? 'BAB 5' : 'BAB 2';
  pdf.addChapterHeading(
    worksheetChapterLabel,
    `Panduan Membimbing Lembar Kerja (${questions.length} Soal) & Polling (${polls.length} Sesi)`
  );
  pdf.addParagraph(
    'Gunakan panduan berikut saat peserta mengisi lembar kerja di smartphone masing-masing agar jawaban yang masuk tajam, spesifik, dan layak disorot di layar proyektor:'
  );

  questions.forEach((q, idx) => {
    pdf.addCalloutBox({
      title: `LATIHAN ${idx + 1}: ${q.sectionTitle}`,
      tone: idx % 2 === 0 ? 'teal' : 'orange',
      bodyLines: [
        `Pertanyaan Utama: ${q.questionText}`,
        q.secondaryPrompt ? `Pertanyaan Lanjutan: ${q.secondaryPrompt}` : '',
        `Inti Pembelajaran (Core Learning): ${q.coreLearning}`,
        `Contoh Jawaban Ideal: ${q.exampleAnswer}`,
        ...(q.helperTips || []).map((t) => `Tips Coaching Pemateri: ${t}`),
      ].filter(Boolean),
    });
  });

  if (polls.length > 0) {
    pdf.addSubHeading('Panduan Diskusi Live Polling Kelas');
    pdf.addTable(
      ['Judul Polling', 'Pertanyaan / Arahan ke Peserta', 'Opsi Pilihan di Layar HP'],
      polls.map((p) => [
        p.title,
        p.subtitle,
        p.options.map((o) => `- ${o.label}${o.subtitle ? ` (${o.subtitle})` : ''}`).join('\n'),
      ]),
      [0.24, 0.34, 0.42]
    );
  }

  // Lampiran Terakhir: Bedah Slide per Slide + Speaker Notes Lengkap
  const slideChapterLabel = isSesi2PartnerUp ? 'BAB 7' : isSesi3PartnerUp ? 'BAB 6' : 'BAB 3';
  pdf.addChapterHeading(
    slideChapterLabel,
    `Bedah Slide per Slide & Naskah Pembicara (${slides.length} Slide)`
  );
  pdf.addParagraph(
    'Pelajari alur narasi, poin kartu, perbandingan sebelum-sesudah, dan catatan panggung (speaker notes) tiap slide di bawah ini sebelum tampil mengajar:'
  );

  slides.forEach((s, idx) => {
    const bodyLines: string[] = [];
    if (s.subtitle) {
      bodyLines.push(`Subjudul: ${s.subtitle}`);
    }
    if (s.cards && s.cards.length > 0) {
      bodyLines.push('Poin Materi di Layar:');
      s.cards.forEach((c) => {
        bodyLines.push(`- ${c.title}: ${c.body.replace(/\n/g, ' ')}`);
      });
    }
    if (s.comparison) {
      bodyLines.push(`Perbandingan Kiri (${s.comparison.leftTitle}): ${s.comparison.leftBody.replace(/\n/g, ' | ')}`);
      bodyLines.push(`Perbandingan Kanan (${s.comparison.rightTitle}): ${s.comparison.rightBody.replace(/\n/g, ' | ')}`);
    }
    if (s.promptLines && s.promptLines.length > 0) {
      bodyLines.push(`Instruksi Latihan: ${s.promptLines.join(' | ')}`);
    }
    if (s.bottomBanner) {
      bodyLines.push(`Kesimpulan Bawah: ${s.bottomBanner}`);
    }
    if (s.speakerNotes) {
      bodyLines.push(`SKRIP / CATATAN PEMATERI: ${s.speakerNotes}`);
    }

    pdf.addCalloutBox({
      title: `SLIDE ${idx + 1} [${s.badge}] - ${s.title}`,
      tone: s.type === 'cover' || s.type === 'closing' ? 'navy' : s.type === 'worksheet' ? 'teal' : 'orange',
      bodyLines,
    });
  });

  pdf.addPageFooters();

  const safeSlug =
    sanitizePdfText(seminarTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'materi-obeeacademy';

  pdf.doc.save(`pendalaman-materi-pemateri-${safeSlug}.pdf`);
}
