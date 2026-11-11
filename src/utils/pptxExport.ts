import PptxGenJS from 'pptxgenjs';
import { SlideDefinition, WorksheetQuestion } from '../data/seminarData';
import { BrandThemeConfig } from '../types';
import { DEFAULT_BRAND_THEME } from '../brandTheme';

/**
 * Convert an image URL to a base64 data URL so PptxGenJS embeds it directly
 * into the PPTX archive reliably on all platforms (web, mobile, offline).
 */
async function toBase64DataUrl(url: string): Promise<string | null> {
  try {
    // If already data URL, return as-is
    if (url.startsWith('data:')) return url;

    // Normalisasi url path
    let normalized = url;
    if (normalized.startsWith('/src/assets/images/')) {
      normalized = normalized.replace('/src/assets/images/', '/assets/images/');
    }

    const res = await fetch(normalized);
    if (!res.ok) {
      // Fallback coba path alternatif
      if (normalized.startsWith('/assets/images/')) {
        const altRes = await fetch(normalized.replace('/assets/images/', '/src/assets/images/'));
        if (altRes.ok) {
          const blob = await altRes.blob();
          return await blobToDataUrl(blob);
        }
      }
      return null;
    }
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  } catch (err) {
    console.warn('Gagal mengonversi gambar ke base64 untuk PPTX:', url, err);
    return null;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function stripHex(color?: string, fallback: string = '1F3A5F'): string {
  if (!color) return fallback;
  return color.replace('#', '').toUpperCase();
}

export interface PptxExportOptions {
  seminarTitle: string;
  organizerName: string;
  slides: SlideDefinition[];
  questions?: WorksheetQuestion[];
  brandTheme?: BrandThemeConfig;
  fileName?: string;
}

/**
 * Ekspor kurikulum lengkap menjadi file Microsoft PowerPoint (.pptx)
 * Berisi 16:9 widescreen layout, tata letak kartu visual, tabel perbandingan,
 * foto pendukung tersemat, dan catatan pemateri (speaker notes) komprehensif.
 */
export async function exportCurriculumToPowerPoint(options: PptxExportOptions): Promise<void> {
  const {
    seminarTitle,
    organizerName,
    slides,
    brandTheme,
    fileName,
  } = options;

  const theme = brandTheme || DEFAULT_BRAND_THEME;
  const primaryColor = stripHex(theme.primaryColor, '1F3A5F');
  const accentColor = stripHex(theme.accentColor, 'F28C28');
  const secondaryColor = stripHex(theme.secondaryColor, '2A9D8F');
  const creamBg = 'FFF8F5';
  const white = 'FFFFFF';
  const darkNavy = '1F3A5F';
  const softCardBg = 'FFFFFF';
  const textDark = '1F3A5F';
  const textMuted = '64748B';

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pptx.author = organizerName;
  pptx.company = organizerName;
  pptx.title = seminarTitle;
  pptx.subject = 'Materi Pelatihan Interaktif UMKM';

  for (let idx = 0; idx < slides.length; idx++) {
    const slide = slides[idx];
    const pptxSlide = pptx.addSlide();

    const isCover = slide.type === 'cover';
    const isClosing = slide.type === 'closing';
    const isDarkBg = isCover || isClosing;

    // 1. Background
    pptxSlide.background = { color: isDarkBg ? darkNavy : creamBg };

    // 2. Add Speaker Notes if available
    let notesText = '';
    if (slide.speakerNotes) {
      notesText += `[PANDUAN PEMATERI]:\n${slide.speakerNotes}\n\n`;
    }
    if (slide.type === 'worksheet' && typeof slide.linkedQuestionIndex === 'number') {
      notesText += `[LEMBAR KERJA PESERTA]:\nSlide ini terhubung dengan lembar kerja interaktif peserta di HP. Mintalah peserta membuka smartphone mereka untuk menjawab latihan ini.\n\n`;
    }
    if (slide.linkedPollId) {
      notesText += `[POLLING LIVE]:\nSlide ini memiliki live polling. Ajak seluruh peserta memilih opsi di smartphone mereka lalu tampilkan hasil grafik di layar proyektor.\n\n`;
    }
    if (notesText) {
      pptxSlide.addNotes(notesText.trim());
    }

    // 3. Header Badge & Title
    if (isCover) {
      // COVER SLIDE (Eksklusif & Berwibawa)
      pptxSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.0,
        w: 3.2,
        h: 0.45,
        fill: { color: accentColor },
        rectRadius: 0.1,
      });
      pptxSlide.addText(slide.badge.toUpperCase(), {
        x: 0.8,
        y: 1.0,
        w: 3.2,
        h: 0.45,
        fontSize: 11,
        bold: true,
        color: white,
        align: 'center',
        valign: 'middle',
      });

      pptxSlide.addText(slide.title, {
        x: 0.8,
        y: 1.65,
        w: 8.4,
        h: 1.8,
        fontSize: 28,
        bold: true,
        color: white,
        valign: 'top',
        breakLine: true,
      });

      if (slide.subtitle) {
        pptxSlide.addText(slide.subtitle, {
          x: 0.8,
          y: 3.5,
          w: 8.4,
          h: 0.9,
          fontSize: 15,
          color: 'CBD5E1',
          valign: 'top',
        });
      }

      pptxSlide.addText(`Diselenggarakan oleh: ${organizerName}`, {
        x: 0.8,
        y: 4.65,
        w: 8.4,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: accentColor,
      });

      continue;
    }

    // CONTENT SLIDES (Slide 2 - 17)
    // Top Badge Pill
    pptxSlide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 0.35,
      w: 2.2,
      h: 0.35,
      fill: { color: primaryColor },
      rectRadius: 0.08,
    });
    pptxSlide.addText(slide.badge, {
      x: 0.6,
      y: 0.35,
      w: 2.2,
      h: 0.35,
      fontSize: 9,
      bold: true,
      color: white,
      align: 'center',
      valign: 'middle',
    });

    // Top Title
    pptxSlide.addText(slide.title, {
      x: 0.6,
      y: 0.75,
      w: 8.8,
      h: 0.6,
      fontSize: 18,
      bold: true,
      color: isDarkBg ? white : textDark,
      valign: 'middle',
    });

    // Subtitle
    if (slide.subtitle) {
      pptxSlide.addText(slide.subtitle, {
        x: 0.6,
        y: 1.35,
        w: 8.8,
        h: 0.38,
        fontSize: 11,
        color: isDarkBg ? '94A3B8' : textMuted,
        valign: 'top',
      });
    }

    // Process image if available
    let base64Image: string | null = null;
    if (slide.imageUrl) {
      base64Image = await toBase64DataUrl(slide.imageUrl);
    }

    const hasImage = Boolean(base64Image);
    const contentWidth = hasImage ? 5.2 : 8.8;
    const contentStartX = 0.6;
    const contentStartY = slide.subtitle ? 1.8 : 1.5;

    // Render Cards / Comparison / Content
    if (slide.comparison) {
      // Comparison: Left (Merah) vs Right (Hijau)
      const compWidth = hasImage ? 2.5 : 4.25;
      const compGap = 0.25;

      // Left Box (Kemasan Biasa)
      pptxSlide.addShape(pptx.ShapeType.roundRect, {
        x: contentStartX,
        y: contentStartY,
        w: compWidth,
        h: 2.7,
        fill: { color: 'FDE8E8' },
        line: { color: 'FCA5A5', width: 1.5 },
        rectRadius: 0.12,
      });
      pptxSlide.addText(`❌ ${slide.comparison.leftTitle}`, {
        x: contentStartX + 0.15,
        y: contentStartY + 0.15,
        w: compWidth - 0.3,
        h: 0.4,
        fontSize: 11,
        bold: true,
        color: '991B1B',
      });
      pptxSlide.addText(slide.comparison.leftBody, {
        x: contentStartX + 0.15,
        y: contentStartY + 0.55,
        w: compWidth - 0.3,
        h: 2.0,
        fontSize: 9.5,
        color: '7F1D1D',
        valign: 'top',
        breakLine: true,
      });

      // Right Box (Kemasan Juara)
      const rightX = contentStartX + compWidth + compGap;
      pptxSlide.addShape(pptx.ShapeType.roundRect, {
        x: rightX,
        y: contentStartY,
        w: compWidth,
        h: 2.7,
        fill: { color: 'E6F4EA' },
        line: { color: '86EFAC', width: 1.5 },
        rectRadius: 0.12,
      });
      pptxSlide.addText(`⭐ ${slide.comparison.rightTitle}`, {
        x: rightX + 0.15,
        y: contentStartY + 0.15,
        w: compWidth - 0.3,
        h: 0.4,
        fontSize: 11,
        bold: true,
        color: '166534',
      });
      pptxSlide.addText(slide.comparison.rightBody, {
        x: rightX + 0.15,
        y: contentStartY + 0.55,
        w: compWidth - 0.3,
        h: 2.0,
        fontSize: 9.5,
        color: '14532D',
        valign: 'top',
        breakLine: true,
      });
    } else if (slide.cards && slide.cards.length > 0) {
      // Cards Grid Layout
      const count = slide.cards.length;
      let cols = 1;
      let rows = count;

      if (count === 2) {
        cols = 2;
        rows = 1;
      } else if (count === 3) {
        cols = hasImage ? 1 : 3;
        rows = hasImage ? 3 : 1;
      } else if (count === 4) {
        cols = 2;
        rows = 2;
      } else if (count >= 5) {
        cols = hasImage ? 2 : 3;
        rows = Math.ceil(count / cols);
      }

      const totalH = 2.75;
      const cardGap = 0.18;
      const cardW = (contentWidth - cardGap * (cols - 1)) / cols;
      const cardH = (totalH - cardGap * (rows - 1)) / rows;

      slide.cards.forEach((card, cIdx) => {
        const colIdx = cIdx % cols;
        const rowIdx = Math.floor(cIdx / cols);
        const cardX = contentStartX + colIdx * (cardW + cardGap);
        const cardY = contentStartY + rowIdx * (cardH + cardGap);

        const cardAccent = card.accent === 'teal' ? secondaryColor : accentColor;

        // Card Container
        pptxSlide.addShape(pptx.ShapeType.roundRect, {
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardH,
          fill: { color: softCardBg },
          line: { color: cardAccent, width: 1.5 },
          rectRadius: 0.1,
        });

        // Accent top bar
        pptxSlide.addShape(pptx.ShapeType.roundRect, {
          x: cardX + 0.15,
          y: cardY + 0.12,
          w: 0.6,
          h: 0.08,
          fill: { color: cardAccent },
          rectRadius: 0.04,
        });

        // Card Title
        pptxSlide.addText(card.title, {
          x: cardX + 0.15,
          y: cardY + 0.22,
          w: cardW - 0.3,
          h: 0.35,
          fontSize: count >= 4 ? 10.5 : 12,
          bold: true,
          color: textDark,
          valign: 'middle',
        });

        // Card Body
        pptxSlide.addText(card.body, {
          x: cardX + 0.15,
          y: cardY + 0.58,
          w: cardW - 0.3,
          h: cardH - 0.7,
          fontSize: count >= 4 ? 8.5 : 9.5,
          color: '334155',
          valign: 'top',
          breakLine: true,
        });
      });
    }

    // Render Image on the right side if present
    if (hasImage && base64Image) {
      const imgX = 6.0;
      const imgY = contentStartY;
      const imgW = 3.4;
      const imgH = 2.65;

      // Image Card Frame
      pptxSlide.addShape(pptx.ShapeType.roundRect, {
        x: imgX,
        y: imgY,
        w: imgW,
        h: imgH,
        fill: { color: 'FFFFFF' },
        line: { color: primaryColor, width: 1.5 },
        rectRadius: 0.12,
      });

      // Embed Image
      pptxSlide.addImage({
        data: base64Image,
        x: imgX + 0.06,
        y: imgY + 0.06,
        w: imgW - 0.12,
        h: imgH - (slide.imageCaption ? 0.6 : 0.12),
      });

      // Caption below image
      if (slide.imageCaption) {
        pptxSlide.addText(slide.imageCaption, {
          x: imgX + 0.1,
          y: imgY + imgH - 0.55,
          w: imgW - 0.2,
          h: 0.48,
          fontSize: 7.5,
          bold: true,
          color: textDark,
          align: 'center',
          valign: 'middle',
        });
      }
    }

    // Prompt Lines / Lembar Kerja Reminder at bottom
    if (slide.promptLines && slide.promptLines.length > 0) {
      pptxSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 4.65,
        w: 8.8,
        h: 0.45,
        fill: { color: 'FFF2E2' },
        line: { color: accentColor, width: 1 },
        rectRadius: 0.08,
      });
      pptxSlide.addText(`✍️ PRAKTIK PESERTA: ${slide.promptLines.join(' | ')}`, {
        x: 0.75,
        y: 4.65,
        w: 8.5,
        h: 0.45,
        fontSize: 8.5,
        bold: true,
        color: '9A3412',
        valign: 'middle',
      });
    }

    // Footer with Page Number & Organizer
    pptxSlide.addText(`${organizerName} — Slide ${idx + 1} dari ${slides.length}`, {
      x: 0.6,
      y: 5.2,
      w: 8.8,
      h: 0.3,
      fontSize: 8,
      color: isDarkBg ? '94A3B8' : '64748B',
      align: 'right',
      valign: 'bottom',
    });
  }

  // Trigger file download in browser
  const cleanTitle = (fileName || seminarTitle || 'Materi_Desain_Kemasan_UMKM')
    .replace(/[^\w\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '_');

  await pptx.writeFile({ fileName: `${cleanTitle}.pptx` });
}
