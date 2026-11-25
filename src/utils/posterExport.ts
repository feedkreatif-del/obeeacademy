import { MaterialPricingConfig, SavedMaterial, UnlockCampaignDoc } from '../types';
import { formatRupiah } from './qris';

export interface PosterRenderOptions {
  minQuota?: number;
  deadlineLabel?: string;
  slotsSummary?: string;
  ctaLabel?: string;
  customNote?: string;
  pricing?: MaterialPricingConfig;
  qrCanvas?: HTMLCanvasElement | null;
}

/**
 * Ekstrak 3-4 poin "Inti Materi" ringkas dari slide/pertanyaan sebuah modul Bank Materi
 * untuk ditampilkan di katalog Bursa Kelas maupun dicetak ke Poster PNG.
 */
export function extractMaterialCoreHighlights(material: SavedMaterial): string[] {
  const highlights: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (raw?: string) => {
    if (!raw) return;
    const cleaned = raw.replace(/\s+/g, ' ').trim();
    if (!cleaned || cleaned.length < 8) return;
    const normalized = cleaned.toLowerCase();
    if (seen.has(normalized)) return;
    seen.add(normalized);
    highlights.push(cleaned.length > 96 ? `${cleaned.slice(0, 93).trim()}...` : cleaned);
  };

  for (const q of material.content.questions || []) {
    if (highlights.length >= 4) break;
    if (q.coreLearning) {
      pushUnique(q.coreLearning);
    } else if (q.sectionTitle) {
      pushUnique(q.sectionTitle.replace(/^\d+\.\s*/, ''));
    }
  }

  if (highlights.length < 3) {
    for (const s of material.content.slides || []) {
      if (highlights.length >= 4) break;
      if (s.index === 0 || s.type === 'cover') continue;
      pushUnique(s.title);
    }
  }

  if (highlights.length === 0) {
    pushUnique('Pembahasan konsep inti disertai contoh kasus nyata');
    pushUnique('Praktik langsung menggunakan lembar kerja interaktif');
    pushUnique('Sesi tanya jawab & rencana aksi siap diterapkan');
  }

  return highlights.slice(0, 4);
}

/**
 * Ambil URL gambar utama modul (jika tersedia pada daftar slide) sebagai visual sampul poster.
 */
export function getMaterialCoverImageUrl(material: SavedMaterial): string | undefined {
  const slides = material.content.slides || [];
  const withImage =
    slides.find((s) => s.index === 0 && s.imageUrl) ||
    slides.find((s) => Boolean(s.imageUrl));
  if (!withImage?.imageUrl) return undefined;
  if (withImage.imageUrl.startsWith('/src/assets/images/')) {
    return withImage.imageUrl.replace('/src/assets/images/', '/assets/images/');
  }
  return withImage.imageUrl;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) {
        // Gabung sisa kata di baris terakhir dan potong jika kepanjangan
        const rest = [current, ...words.slice(i + 1)].join(' ');
        let clipped = rest;
        while (ctx.measureText(`${clipped}...`).width > maxWidth && clipped.length > 4) {
          clipped = clipped.slice(0, -1).trim();
        }
        lines.push(clipped !== rest ? `${clipped}...` : rest);
        return lines;
      }
    }
  }
  lines.push(current);
  return lines.slice(0, maxLines);
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(null), 5000);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Render Poster Promosi Kelas Portrait 4:5 (1080x1350 px) menjadi Data URL PNG siap unduh.
 */
export async function renderMaterialPosterDataUrl(
  material: SavedMaterial,
  options: PosterRenderOptions = {}
): Promise<string> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia di browser ini.');
  }

  const theme = material.content.brandTheme;
  const primary = theme?.primaryColor || '#1F3A5F';
  const accent = theme?.accentColor || '#F28C28';
  const secondary = theme?.secondaryColor || '#2A9D8F';
  const minQuota = options.minQuota ?? 15;
  const deadlineLabel = options.deadlineLabel?.trim() || 'Voting dibuka sampai kuota terpenuhi';
  const slotsSummary =
    options.slotsSummary?.trim() || 'Pilihan jadwal tersedia di link voting';
  const ctaLabel =
    options.ctaLabel?.trim() || 'Scan QR / Klik Link untuk Voting & Kunci Kursi';

  // 1. Background editorial gradient + soft surface card
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, W, H);

  // Subtle decorative glow in top-right & bottom-left
  const topGlow = ctx.createRadialGradient(W * 0.88, 110, 20, W * 0.88, 110, 420);
  topGlow.addColorStop(0, `${accent}3D`);
  topGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

  const bottomGlow = ctx.createRadialGradient(140, H - 180, 20, 140, H - 180, 460);
  bottomGlow.addColorStop(0, `${secondary}33`);
  bottomGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, 0, W, H);

  // 2. Top Identity Row
  ctx.fillStyle = accent;
  drawRoundedRect(ctx, 64, 52, 10, 44, 5);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(material.organizerName || 'obeeAcademy | PartnerUp', 92, 82);

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  const catText = `${material.category || 'Modul Kelas'} · ${material.content.slides.length} Slide`;
  const catWidth = ctx.measureText(catText).width;
  ctx.fillText(catText, W - 64 - catWidth, 82);

  // 3. Cover Visual Frame (1080 - 128 = 952 wide x 340 tall)
  const imgX = 64;
  const imgY = 124;
  const imgW = W - 128;
  const imgH = 340;
  const coverUrl = getMaterialCoverImageUrl(material);
  const loadedImg = coverUrl ? await loadImageSafe(coverUrl) : null;

  ctx.save();
  drawRoundedRect(ctx, imgX, imgY, imgW, imgH, 28);
  ctx.clip();

  if (loadedImg && loadedImg.naturalWidth > 0 && loadedImg.naturalHeight > 0) {
    const imgRatio = loadedImg.naturalWidth / loadedImg.naturalHeight;
    const boxRatio = imgW / imgH;
    let sx = 0;
    let sy = 0;
    let sw = loadedImg.naturalWidth;
    let sh = loadedImg.naturalHeight;
    if (imgRatio > boxRatio) {
      sw = loadedImg.naturalHeight * boxRatio;
      sx = (loadedImg.naturalWidth - sw) / 2;
    } else {
      sh = loadedImg.naturalWidth / boxRatio;
      sy = (loadedImg.naturalHeight - sh) / 2;
    }
    ctx.drawImage(loadedImg, sx, sy, sw, sh, imgX, imgY, imgW, imgH);
    const scrim = ctx.createLinearGradient(0, imgY + imgH * 0.35, 0, imgY + imgH);
    scrim.addColorStop(0, 'rgba(15, 23, 42, 0.05)');
    scrim.addColorStop(1, 'rgba(15, 23, 42, 0.72)');
    ctx.fillStyle = scrim;
    ctx.fillRect(imgX, imgY, imgW, imgH);
  } else {
    // Intentional editorial geometric motif fallback when module has no cover image
    const fallbackGrad = ctx.createLinearGradient(imgX, imgY, imgX + imgW, imgY + imgH);
    fallbackGrad.addColorStop(0, '#0F243E');
    fallbackGrad.addColorStop(1, '#1E466E');
    ctx.fillStyle = fallbackGrad;
    ctx.fillRect(imgX, imgY, imgW, imgH);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    for (let gx = imgX; gx < imgX + imgW; gx += 48) {
      ctx.beginPath();
      ctx.moveTo(gx, imgY);
      ctx.lineTo(gx, imgY + imgH);
      ctx.stroke();
    }
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(imgX + imgW - 140, imgY + 120, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = '800 34px system-ui, -apple-system, sans-serif';
    ctx.fillText('KANDIDAT BURSA KELAS UMKM', imgX + 44, imgY + imgH / 2 - 6);
    ctx.fillStyle = accent;
    ctx.font = '700 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `${material.content.slides.length} Slide Interaktif · ${material.content.questions.length} Lembar Kerja`,
      imgX + 44,
      imgY + imgH / 2 + 34
    );
  }

  // Quota badge anchored inside visual bottom-left
  ctx.fillStyle = accent;
  drawRoundedRect(ctx, imgX + 24, imgY + imgH - 64, 386, 42, 12);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(`SYARAT KELAS DIBUKA: MIN. ${minQuota} PESERTA`, imgX + 42, imgY + imgH - 36);

  // Price badge anchored inside visual top-right (GRATIS vs BERBAYAR)
  const isPaidClass = Boolean(options.pricing?.isPaid && (options.pricing?.price || 0) > 0);
  const priceLabel = isPaidClass
    ? `BERBAYAR · ${formatRupiah(options.pricing!.price)}`
    : 'KELAS GRATIS UMKM';
  ctx.font = '800 21px system-ui, -apple-system, sans-serif';
  const badgeTextW = ctx.measureText(priceLabel).width;
  const badgeW = badgeTextW + 40;
  const badgeX = imgX + imgW - 24 - badgeW;
  const badgeY = imgY + 22;
  ctx.fillStyle = isPaidClass ? '#F28C28' : '#059669';
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, 44, 12);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(priceLabel, badgeX + 20, badgeY + 29);

  if (
    isPaidClass &&
    options.pricing?.originalPrice &&
    options.pricing.originalPrice > options.pricing.price
  ) {
    const origText = formatRupiah(options.pricing.originalPrice);
    ctx.font = '700 18px system-ui, -apple-system, sans-serif';
    const origW = ctx.measureText(origText).width;
    const origPillW = origW + 24;
    const origX = imgX + imgW - 24 - origPillW;
    const origY = badgeY + 52;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    drawRoundedRect(ctx, origX, origY, origPillW, 30, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.fillText(origText, origX + 12, origY + 21);
    ctx.strokeStyle = '#FCA5A5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origX + 10, origY + 15);
    ctx.lineTo(origX + 12 + origW + 2, origY + 15);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Main Cream Content Sheet
  const sheetY = 492;
  const sheetH = 650;
  ctx.fillStyle = '#FFF9F0';
  drawRoundedRect(ctx, 64, sheetY, W - 128, sheetH, 32);
  ctx.fill();

  // Headline
  ctx.fillStyle = primary;
  ctx.font = '800 40px system-ui, -apple-system, sans-serif';
  const titleLines = wrapTextLines(ctx, material.seminarTitle, W - 200, 2);
  let cursorY = sheetY + 68;
  for (const line of titleLines) {
    ctx.fillText(line, 100, cursorY);
    cursorY += 48;
  }

  // Short Hook / Description
  const descSource =
    options.customNote?.trim() ||
    material.description ||
    'Pelatihan interaktif langsung praktik untuk membantu UMKM berkembang terukur.';
  ctx.fillStyle = '#475569';
  ctx.font = '500 23px system-ui, -apple-system, sans-serif';
  const descLines = wrapTextLines(ctx, descSource, W - 200, 2);
  cursorY += 4;
  for (const dLine of descLines) {
    ctx.fillText(dLine, 100, cursorY);
    cursorY += 31;
  }

  // Divider
  cursorY += 14;
  ctx.strokeStyle = 'rgba(31, 58, 95, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, cursorY);
  ctx.lineTo(W - 100, cursorY);
  ctx.stroke();

  // Section Label: INTI MATERI
  cursorY += 40;
  ctx.fillStyle = secondary;
  ctx.font = '800 21px system-ui, -apple-system, sans-serif';
  ctx.fillText('INTI MATERI YANG AKAN DIBAHAS:', 100, cursorY);
  cursorY += 28;

  const highlights = extractMaterialCoreHighlights(material).slice(0, 3);
  for (let idx = 0; idx < highlights.length; idx++) {
    const bulletText = highlights[idx];
    // Number circle
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(118, cursorY + 14, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(String(idx + 1), 113, cursorY + 20);

    ctx.fillStyle = '#1E293B';
    ctx.font = '600 23px system-ui, -apple-system, sans-serif';
    const bLines = wrapTextLines(ctx, bulletText, W - 260, 2);
    for (let li = 0; li < bLines.length; li++) {
      ctx.fillText(bLines[li], 150, cursorY + 21 + li * 29);
    }
    cursorY += bLines.length > 1 ? 74 : 52;
  }

  // Bottom callout inside cream card: Schedule & Rule
  const infoBoxY = sheetY + sheetH - 122;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, 100, infoBoxY, W - 200, 92, 18);
  ctx.fill();
  ctx.strokeStyle = `${accent}66`;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = primary;
  ctx.font = '800 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('MEKANISME BURSA KELAS:', 124, infoBoxY + 34);

  ctx.fillStyle = '#334155';
  ctx.font = '600 19px system-ui, -apple-system, sans-serif';
  const mechLine1 = `Topik suara terbanyak + jadwal dengan min. ${minQuota} peserta terkonfirmasi resmi jalan!`;
  const mechLine2 = `${slotsSummary} · ${deadlineLabel}`;
  const mechL1 = wrapTextLines(ctx, mechLine1, W - 250, 1)[0] || mechLine1;
  const mechL2 = wrapTextLines(ctx, mechLine2, W - 250, 1)[0] || mechLine2;
  ctx.fillText(mechL1, 124, infoBoxY + 60);
  ctx.fillStyle = '#64748B';
  ctx.font = '500 17px system-ui, -apple-system, sans-serif';
  ctx.fillText(mechL2, 124, infoBoxY + 82);

  // 5. Footer CTA & QR Area
  const footY = 1170;
  ctx.fillStyle = accent;
  ctx.font = '800 22px system-ui, -apple-system, sans-serif';
  const footerKicker = isPaidClass
    ? options.pricing?.paymentMode === 'direct_pay'
      ? `KELAS SPESIALIS ${formatRupiah(options.pricing!.price)} · QRIS OTOMATIS`
      : `KELAS BERBAYAR ${formatRupiah(options.pricing!.price)} · BAYAR SAAT KUOTA GO!`
    : 'GRATIS UNTUK UMKM · BURSA VOTING KELAS';
  ctx.fillText(footerKicker, 64, footY + 34);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 30px system-ui, -apple-system, sans-serif';
  const ctaLines = wrapTextLines(ctx, ctaLabel, options.qrCanvas ? W - 310 : W - 128, 2);
  ctaLines.forEach((l, i) => {
    ctx.fillText(l, 64, footY + 74 + i * 36);
  });

  if (options.qrCanvas) {
    const qrBoxSize = 148;
    const qrX = W - 64 - qrBoxSize;
    const qrY = footY - 8;
    ctx.fillStyle = '#FFFFFF';
    drawRoundedRect(ctx, qrX, qrY, qrBoxSize, qrBoxSize, 18);
    ctx.fill();
    ctx.drawImage(options.qrCanvas, qrX + 10, qrY + 10, qrBoxSize - 20, qrBoxSize - 20);
  }

  return canvas.toDataURL('image/png');
}

export async function downloadMaterialPosterPng(
  material: SavedMaterial,
  options: PosterRenderOptions = {}
): Promise<void> {
  const dataUrl = await renderMaterialPosterDataUrl(material, options);
  const slug = material.seminarTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `Poster_${slug || 'kelas_umkm'}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Buat teks siap salin untuk broadcast ke Grup WhatsApp UMKM.
 */
export function buildBursaBroadcastText(
  campaign: UnlockCampaignDoc,
  materials: SavedMaterial[],
  votingUrl: string
): string {
  const candidates = campaign.candidateMaterialIds
    .map((id) => materials.find((m) => m.id === id))
    .filter((m): m is SavedMaterial => Boolean(m));

  const topicLines = candidates
    .map((mat, idx) => {
      const inti = extractMaterialCoreHighlights(mat).slice(0, 2).join(' · ');
      const pricing = campaign.materialPricing?.[mat.id];
      const priceTag =
        pricing?.isPaid && pricing.price > 0
          ? `[Berbayar ${formatRupiah(pricing.price)}]`
          : '[Gratis]';
      return `${idx + 1}. *${mat.seminarTitle}* ${priceTag}\n   Inti: ${inti}`;
    })
    .join('\n\n');

  const slotLines = campaign.timeSlots
    .map((s) => `• ${s.label} (${s.dateText}, ${s.timeText})`)
    .join('\n');

  return [
    `*${campaign.title}*`,
    campaign.subtitle,
    '',
    `Supaya waktu belajar kita efektif & ramai, kelas akan *RESMI DIBUKA (GO!)* jika mencapai minimal *${campaign.minQuota} peserta berkomitmen hadir* pada topik suara terbanyak dan jadwal yang paling banyak cocok.`,
    '',
    '*KANDIDAT MATERI YANG BISA DIPILIH:*',
    topicLines,
    '',
    '*OPSI JADWAL TERSEDIA:*',
    slotLines,
    '',
    `Batas voting: *${campaign.deadlineLabel}*`,
    `Silakan pilih topik & centang semua jam yang Anda bisa di tautan ini:`,
    votingUrl,
  ].join('\n');
}
