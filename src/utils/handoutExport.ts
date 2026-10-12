import {
  SlideDefinition,
  WorksheetQuestion,
  RATIONAL_CONVERSION_DICTIONARY,
  VP_THREE_TESTS,
} from '../data/seminarData';
import { AnswerDoc, BrandThemeConfig } from '../types';
import { DEFAULT_BRAND_THEME } from '../brandTheme';

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function triggerIframePrint(htmlContent: string) {
  const existingFrame = document.getElementById('partnerup-print-iframe') as HTMLIFrameElement | null;
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'partnerup-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Print fallback triggered:', err);
      window.print();
    }
  }, 350);
}

/**
 * 1. CETAK / SIMPAN PDF SELURUH SLIDE MATERI (A4 LANDSCAPE)
 */
export function printSlideDeckHandout(params: {
  slides: SlideDefinition[];
  seminarTitle: string;
  organizerName: string;
  brandTheme?: BrandThemeConfig;
}) {
  const { slides, seminarTitle, organizerName, brandTheme } = params;
  const theme = brandTheme || DEFAULT_BRAND_THEME;

  const slidesHtml = slides
    .map((slide, idx) => {
      const cardsHtml =
        slide.cards && slide.cards.length > 0
          ? `<div class="cards-grid cards-count-${slide.cards.length}">
              ${slide.cards
                .map(
                  (c) => `
                <div class="card card-${c.variant || 'white'}">
                  <div class="card-title">${escapeHtml(c.title)}</div>
                  <div class="card-body">${escapeHtml(c.body).replace(/\n/g, '<br/>')}</div>
                </div>`
                )
                .join('')}
            </div>`
          : '';

      const comparisonHtml = slide.comparison
        ? `<div class="comparison-grid">
            <div class="comp-box comp-left">
              <div class="comp-title">${escapeHtml(slide.comparison.leftTitle)}</div>
              <div class="comp-body">${escapeHtml(slide.comparison.leftBody).replace(/\n/g, '<br/>')}</div>
            </div>
            <div class="comp-box comp-right">
              <div class="comp-title">${escapeHtml(slide.comparison.rightTitle)}</div>
              <div class="comp-body">${escapeHtml(slide.comparison.rightBody).replace(/\n/g, '<br/>')}</div>
            </div>
          </div>`
        : '';

      const bannerHtml = slide.bottomBanner
        ? `<div class="bottom-banner">${escapeHtml(slide.bottomBanner)}</div>`
        : '';

      const promptHtml =
        slide.promptLines && slide.promptLines.length > 0
          ? `<div class="prompt-box">
              <div class="prompt-label">LATIHAN PESERTA:</div>
              ${slide.promptLines.map((line) => `<div class="prompt-line">• ${escapeHtml(line)}</div>`).join('')}
            </div>`
          : '';

      const isCoverOrClosing = slide.type === 'cover' || slide.type === 'closing';

      return `
        <section class="slide-page ${isCoverOrClosing ? 'slide-dark' : 'slide-light'}">
          <header class="slide-header">
            <div>
              <div class="slide-badge">${escapeHtml(slide.badge)}</div>
              <h2 class="slide-title">${escapeHtml(slide.title)}</h2>
              ${slide.subtitle ? `<p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>` : ''}
            </div>
            <div class="slide-num">Slide ${idx + 1} / ${slides.length}</div>
          </header>

          <div class="slide-body">
            ${cardsHtml}
            ${comparisonHtml}
            ${bannerHtml}
            ${promptHtml}
          </div>

          <footer class="slide-footer">
            <span>${escapeHtml(seminarTitle)} · ${escapeHtml(organizerName)}</span>
            <span>Halaman ${idx + 1} dari ${slides.length}</span>
          </footer>
        </section>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Materi Slide - ${escapeHtml(seminarTitle)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${theme.primaryColor};
      background: #ffffff;
    }
    .slide-page {
      width: 100%;
      min-height: 185mm;
      border: 2px solid ${theme.primaryColor};
      border-radius: 14px;
      padding: 16px 22px;
      margin-bottom: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      background: ${theme.bgColor};
    }
    .slide-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .slide-dark {
      background: ${theme.primaryColor};
      color: #ffffff;
    }
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      border-bottom: 2px solid rgba(0,0,0,0.1);
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .slide-dark .slide-header {
      border-bottom-color: rgba(255,255,255,0.2);
    }
    .slide-badge {
      display: inline-block;
      background: ${theme.accentColor};
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 3px 10px;
      border-radius: 999px;
      margin-bottom: 5px;
    }
    .slide-title {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      line-height: 1.25;
    }
    .slide-subtitle {
      margin: 4px 0 0 0;
      font-size: 13px;
      opacity: 0.85;
    }
    .slide-num {
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      opacity: 0.75;
    }
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 10px;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .cards-count-3 {
      grid-template-columns: repeat(3, 1fr);
    }
    .card {
      background: #ffffff;
      color: ${theme.primaryColor};
      border: 1.5px solid rgba(31,58,95,0.2);
      border-radius: 10px;
      padding: 10px 12px;
    }
    .card-navy {
      background: ${theme.primaryColor};
      color: #ffffff;
    }
    .card-teal {
      background: #E3F5F2;
      color: ${theme.primaryColor};
      border-color: ${theme.secondaryColor};
    }
    .card-orange {
      background: #FFF7EC;
      color: ${theme.primaryColor};
      border-color: ${theme.accentColor};
    }
    .card-title {
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 4px;
      color: inherit;
    }
    .card-body {
      font-size: 11.5px;
      line-height: 1.42;
      opacity: 0.92;
    }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .comp-box {
      border-radius: 10px;
      padding: 10px 12px;
      background: #ffffff;
      color: ${theme.primaryColor};
      border: 1.5px solid rgba(31,58,95,0.2);
    }
    .comp-right {
      border: 2px solid ${theme.secondaryColor};
      background: #E3F5F2;
    }
    .comp-title {
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .comp-body {
      font-size: 11.5px;
      line-height: 1.4;
    }
    .bottom-banner {
      background: ${theme.primaryColor};
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
    }
    .prompt-box {
      background: #ffffff;
      color: ${theme.primaryColor};
      border: 2px solid ${theme.accentColor};
      border-radius: 10px;
      padding: 9px 12px;
      font-size: 11.5px;
    }
    .prompt-label {
      font-weight: 800;
      color: ${theme.accentColor};
      margin-bottom: 3px;
      font-size: 10.5px;
    }
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      font-weight: 600;
      padding-top: 8px;
      margin-top: 10px;
      border-top: 1px solid rgba(0,0,0,0.12);
      opacity: 0.8;
    }
    .slide-dark .slide-footer {
      border-top-color: rgba(255,255,255,0.2);
    }
  </style>
</head>
<body>
  ${slidesHtml}
</body>
</html>`;

  triggerIframePrint(html);
}

/**
 * 2. CETAK / SIMPAN BUKU SAKU PDF PESERTA (MATERI + JAWABAN PRIBADI + BIO IG & WA)
 */
export function printParticipantWorkbookHandout(params: {
  seminarTitle: string;
  organizerName: string;
  businessName: string;
  questions: WorksheetQuestion[];
  slides: SlideDefinition[];
  myAnswers: AnswerDoc[];
  finalVpSentence: string;
  generatedInstagramBio: string;
  generatedWhatsappGreeting: string;
  generatedPackagingSticker: string;
  brandTheme?: BrandThemeConfig;
}) {
  const {
    seminarTitle,
    organizerName,
    businessName,
    questions,
    slides,
    myAnswers,
    finalVpSentence,
    generatedInstagramBio,
    generatedWhatsappGreeting,
    generatedPackagingSticker,
    brandTheme,
  } = params;

  const theme = brandTheme || DEFAULT_BRAND_THEME;
  const umkmTitle = businessName.trim() || 'Usaha UMKM Saya';
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const questionsHtml = questions
    .map((q, idx) => {
      const ans = myAnswers.find((a) => a.q === idx);
      return `
        <div class="q-item">
          <div class="q-meta">Bagian ${idx + 1} · ${escapeHtml(q.sectionTitle)}</div>
          <div class="q-title">${escapeHtml(q.questionText)}</div>
          <div class="q-answer">
            ${
              ans
                ? `<strong>Jawaban Saya:</strong> ${escapeHtml(ans.text)}${
                    ans.subText ? `<br/><span class="q-sub">Keterangan: ${escapeHtml(ans.subText)}</span>` : ''
                  }`
                : `<span class="q-empty">Belum diisi saat sesi berlangsung (Contoh: "${escapeHtml(q.exampleAnswer)}")</span>`
            }
          </div>
        </div>
      `;
    })
    .join('');

  const dictionaryHtml = RATIONAL_CONVERSION_DICTIONARY.map(
    (d) => `
      <tr>
        <td class="bad-word">❌ ${escapeHtml(d.vagueWord)}</td>
        <td class="good-word">✅ ${escapeHtml(d.concreteProof)}</td>
      </tr>
    `
  ).join('');

  const slideDigestHtml = slides
    .filter((s) => s.type !== 'cover')
    .map(
      (s, i) => `
      <div class="digest-card">
        <div class="digest-title">${i + 1}. ${escapeHtml(s.title)} <span class="digest-badge">(${escapeHtml(s.badge)})</span></div>
        ${
          s.cards && s.cards.length > 0
            ? `<ul class="digest-list">
                ${s.cards
                  .map(
                    (c) =>
                      `<li><strong>${escapeHtml(c.title)}:</strong> ${escapeHtml(c.body).replace(/\n/g, ' ')}</li>`
                  )
                  .join('')}
              </ul>`
            : ''
        }
        ${s.bottomBanner ? `<div class="digest-banner">💡 ${escapeHtml(s.bottomBanner)}</div>` : ''}
      </div>
    `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Buku Saku & Lembar Kerja - ${escapeHtml(umkmTitle)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${theme.primaryColor};
      line-height: 1.45;
      font-size: 12px;
    }
    .header-banner {
      background: ${theme.primaryColor};
      color: #ffffff;
      padding: 18px 20px;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .header-tag {
      color: ${theme.accentColor};
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .header-title {
      margin: 4px 0;
      font-size: 20px;
      font-weight: 800;
    }
    .header-meta {
      font-size: 11px;
      opacity: 0.85;
    }
    .vp-highlight {
      background: ${theme.bgColor};
      border: 2px solid ${theme.accentColor};
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 16px;
    }
    .vp-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: ${theme.accentColor};
      margin-bottom: 4px;
    }
    .vp-sentence {
      font-size: 15px;
      font-weight: 800;
      margin: 0;
    }
    .kit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    .kit-box {
      border: 1.5px solid rgba(31,58,95,0.2);
      border-radius: 10px;
      padding: 10px 12px;
      background: #ffffff;
    }
    .kit-box-title {
      font-size: 11px;
      font-weight: 800;
      color: ${theme.secondaryColor};
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .kit-pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 11px;
      margin: 0;
      background: ${theme.bgColor};
      padding: 8px;
      border-radius: 6px;
    }
    .section-heading {
      font-size: 14px;
      font-weight: 800;
      border-bottom: 2px solid ${theme.primaryColor};
      padding-bottom: 4px;
      margin: 18px 0 10px 0;
    }
    .q-item {
      border: 1px solid rgba(31,58,95,0.2);
      border-radius: 8px;
      padding: 9px 12px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .q-meta {
      font-size: 10px;
      font-weight: 700;
      color: ${theme.accentColor};
      text-transform: uppercase;
    }
    .q-title {
      font-size: 12px;
      font-weight: 700;
      margin: 2px 0 5px 0;
    }
    .q-answer {
      background: #E3F5F2;
      padding: 7px 10px;
      border-radius: 6px;
      font-size: 11.5px;
    }
    .q-empty {
      color: #666;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 11px;
    }
    th, td {
      border: 1px solid rgba(31,58,95,0.2);
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background: ${theme.primaryColor};
      color: #ffffff;
    }
    .bad-word {
      color: #b91c1c;
      font-weight: 600;
    }
    .good-word {
      color: #0f766e;
      font-weight: 700;
    }
    .digest-card {
      border: 1px solid rgba(31,58,95,0.18);
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .digest-title {
      font-weight: 800;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .digest-badge {
      font-weight: 600;
      font-size: 10.5px;
      color: ${theme.accentColor};
    }
    .digest-list {
      margin: 4px 0;
      padding-left: 16px;
      font-size: 11px;
    }
    .digest-banner {
      margin-top: 4px;
      font-size: 11px;
      font-weight: 700;
      color: ${theme.secondaryColor};
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="header-tag">${escapeHtml(organizerName)} · BUKU SAKU & RENCANA AKSI PESERTA</div>
    <h1 class="header-title">${escapeHtml(seminarTitle)}</h1>
    <div class="header-meta">Nama Usaha: <strong>${escapeHtml(umkmTitle)}</strong> · Tanggal: ${escapeHtml(dateStr)}</div>
  </div>

  <div class="vp-highlight">
    <div class="vp-label">Kalimat Value Proposition Utama (${escapeHtml(umkmTitle)})</div>
    <p class="vp-sentence">"${escapeHtml(finalVpSentence)}"</p>
  </div>

  <div class="kit-grid">
    <div class="kit-box">
      <div class="kit-box-title">1. Bio Instagram / Shopee / TikTok</div>
      <pre class="kit-pre">${escapeHtml(generatedInstagramBio)}</pre>
    </div>
    <div class="kit-box">
      <div class="kit-box-title">2. Salam Otomatis WhatsApp Business</div>
      <pre class="kit-pre">${escapeHtml(generatedWhatsappGreeting)}</pre>
    </div>
  </div>

  <div class="kit-box" style="margin-bottom: 14px;">
    <div class="kit-box-title">3. Tagline Stiker Kemasan / Banner Lapak</div>
    <pre class="kit-pre">${escapeHtml(generatedPackagingSticker)}</pre>
  </div>

  <h2 class="section-heading">A. Rekap Jawaban Lembar Kerja Saya (Bagian 1–${questions.length})</h2>
  ${questionsHtml}

  <h2 class="section-heading">B. Kamus Konversi: Ubah Kata Sifat Umum Jadi Bukti Angka</h2>
  <table>
    <thead>
      <tr>
        <th>Hindari Klaim Umum Ini</th>
        <th>Ganti Dengan Bukti Spesifik / Angka Ini</th>
      </tr>
    </thead>
    <tbody>
      ${dictionaryHtml}
    </tbody>
  </table>

  <h2 class="section-heading">C. Intisari Materi Seminar (${slides.length} Slide)</h2>
  ${slideDigestHtml}
</body>
</html>`;

  triggerIframePrint(html);
}

/**
 * 3. UNDUH FILE TEKS (.TXT) LENGKAP (MATERI + JAWABAN PRIBADI)
 */
export function downloadParticipantTxtHandout(params: {
  seminarTitle: string;
  organizerName: string;
  businessName: string;
  questions: WorksheetQuestion[];
  slides: SlideDefinition[];
  myAnswers: AnswerDoc[];
  finalVpSentence: string;
  generatedInstagramBio: string;
  generatedWhatsappGreeting: string;
  generatedPackagingSticker: string;
}) {
  const {
    seminarTitle,
    organizerName,
    businessName,
    questions,
    slides,
    myAnswers,
    finalVpSentence,
    generatedInstagramBio,
    generatedWhatsappGreeting,
    generatedPackagingSticker,
  } = params;

  const umkmTitle = businessName.trim() || 'Usaha UMKM Saya';
  const lines: string[] = [
    '====================================================================',
    `BUKU SAKU MATERI & LEMBAR KERJA PESERTA`,
    `${seminarTitle.toUpperCase()}`,
    `Penyelenggara: ${organizerName}`,
    `Nama Usaha: ${umkmTitle}`,
    '====================================================================',
    '',
    '1. KALIMAT VALUE PROPOSITION UTAMA:',
    `"${finalVpSentence}"`,
    '',
    '--------------------------------------------------------------------',
    '2. FORMAT BIO INSTAGRAM / PROFIL TOKO:',
    generatedInstagramBio,
    '',
    '--------------------------------------------------------------------',
    '3. SALAM OTOMATIS WHATSAPP BUSINESS:',
    generatedWhatsappGreeting,
    '',
    '--------------------------------------------------------------------',
    '4. TAGLINE STIKER KEMASAN / BANNER LAPAK:',
    generatedPackagingSticker,
    '',
    '====================================================================',
    `REKAP JAWABAN LEMBAR KERJA SAYA (BAGIAN 1 - ${questions.length})`,
    '====================================================================',
  ];

  questions.forEach((q, idx) => {
    const myAns = myAnswers.find((a) => a.q === idx);
    lines.push(`\n[Bagian ${idx + 1}] ${q.sectionTitle}`);
    lines.push(`Pertanyaan : ${q.questionText}`);
    lines.push(`Jawaban    : ${myAns ? myAns.text : `(Belum diisi - Contoh: ${q.exampleAnswer})`}`);
    if (myAns?.subText) {
      lines.push(`Catatan    : ${myAns.subText}`);
    }
  });

  lines.push(
    '',
    '====================================================================',
    'KAMUS KONVERSI KATA SIFAT -> BUKTI ANGKA SPESIFIK',
    '===================================================================='
  );
  RATIONAL_CONVERSION_DICTIONARY.forEach((d) => {
    lines.push(`• Jangan tulis "${d.vagueWord}" -> Ganti dengan: "${d.concreteProof}"`);
  });

  lines.push(
    '',
    '====================================================================',
    '3 ALAT UJI KALIMAT VALUE PROPOSITION',
    '===================================================================='
  );
  VP_THREE_TESTS.forEach((t, i) => {
    lines.push(`${i + 1}. ${t.title}: ${t.question} (${t.passCriteria})`);
  });

  lines.push(
    '',
    '====================================================================',
    `RINGKASAN MATERI SLIDE SEMINAR (${slides.length} HALAMAN)`,
    '===================================================================='
  );
  slides.forEach((s, idx) => {
    lines.push(`\nSLIDE #${idx + 1}: ${s.title} [${s.badge}]`);
    if (s.subtitle) lines.push(`Subjudul: ${s.subtitle}`);
    (s.cards || []).forEach((c) => {
      lines.push(`  - ${c.title}: ${c.body.replace(/\n/g, ' ')}`);
    });
    if (s.bottomBanner) {
      lines.push(`  * Kesimpulan: ${s.bottomBanner}`);
    }
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = umkmTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'peserta';
  link.href = url;
  link.setAttribute('download', `buku-saku-materi-dan-jawaban-${safeName}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 4. BUAT TAUTAN KIRIM KE WHATSAPP PRIBADI / GRUP UMKM
 */
export function buildWhatsAppShareUrl(params: {
  seminarTitle: string;
  businessName: string;
  questions: WorksheetQuestion[];
  myAnswers: AnswerDoc[];
  finalVpSentence: string;
  generatedInstagramBio: string;
  generatedWhatsappGreeting: string;
}): string {
  const {
    seminarTitle,
    businessName,
    questions,
    myAnswers,
    finalVpSentence,
    generatedInstagramBio,
    generatedWhatsappGreeting,
  } = params;

  const umkmTitle = businessName.trim() || 'Usaha UMKM Saya';
  const answerLines = questions
    .map((q, idx) => {
      const a = myAnswers.find((ans) => ans.q === idx);
      return `${idx + 1}. *${q.sectionTitle}:* ${a ? a.text : '-'}`;
    })
    .join('\n');

  const message = [
    `📌 *RINGKASAN MATERI & RENCANA AKSI UMKM*`,
    `*${seminarTitle}*`,
    `Usaha: *${umkmTitle}*`,
    ``,
    `🎯 *Kalimat Value Proposition Utama:*`,
    `"${finalVpSentence}"`,
    ``,
    `📱 *Format Bio Instagram / Toko:*`,
    generatedInstagramBio,
    ``,
    `💬 *Salam Otomatis WhatsApp Business:*`,
    generatedWhatsappGreeting,
    ``,
    `📝 *Rekap Jawaban Lembar Kerja (1-${questions.length}):*`,
    answerLines,
    ``,
    `💡 *Rumus Inti Value Proposition:*`,
    `_[Nama Produk] untuk [Target Pembeli Spesifik] yang ingin [Perasaan Emosional], karena [Bukti Angka Rasional]._`,
  ].join('\n');

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
