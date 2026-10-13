/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExportQrPosterOptions {
  joinUrl: string;
  seminarTitle?: string;
  organizerName?: string;
  variant?: 'poster' | 'qr-only';
  filename?: string;
}

/**
 * Downloads the QR Code as high-resolution PNG (either branded poster card or clean QR code)
 */
export async function downloadQrCodeAsPng(
  svgElementId: string,
  options: ExportQrPosterOptions
): Promise<void> {
  const svgEl = document.getElementById(svgElementId);
  if (!svgEl) {
    console.error(`SVG element #${svgElementId} not found`);
    return;
  }

  const svgData = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const blobURL = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const isPoster = options.variant !== 'qr-only';

        if (isPoster) {
          // Poster Card Canvas: 900 x 1200 px (3:4 ratio, optimal for WhatsApp, Telegram & A4 print)
          const canvas = document.createElement('canvas');
          canvas.width = 900;
          canvas.height = 1200;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(blobURL);
            return reject(new Error('Canvas context unavailable'));
          }

          // 1. Background Fill (#FFF7EC soft warm tone)
          ctx.fillStyle = '#FFF7EC';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 2. Header Navy Card Banner
          ctx.fillStyle = '#1F3A5F';
          ctx.beginPath();
          ctx.roundRect(40, 40, canvas.width - 80, 200, 24);
          ctx.fill();

          // Header Accent Badge
          ctx.fillStyle = '#F28C28';
          ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            (options.organizerName || 'PROGRAM PARTNERUP | OBEE CREATIVES').toUpperCase(),
            canvas.width / 2,
            90
          );

          // Header Title
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 36px system-ui, -apple-system, sans-serif';
          ctx.fillText('Scan HP untuk Menjawab', canvas.width / 2, 140);

          // Header Subtitle
          ctx.fillStyle = '#E2E8F0';
          ctx.font = '500 20px system-ui, -apple-system, sans-serif';
          const titleSnippet = options.seminarTitle || 'Platform Seminar Interaktif UMKM';
          ctx.fillText(titleSnippet.length > 55 ? titleSnippet.slice(0, 52) + '...' : titleSnippet, canvas.width / 2, 185);

          // 3. Central White QR Card Box
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(31, 58, 95, 0.12)';
          ctx.shadowBlur = 25;
          ctx.shadowOffsetY = 12;
          ctx.beginPath();
          ctx.roundRect(140, 270, canvas.width - 280, 620, 28);
          ctx.fill();

          // Reset Shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

          // Draw Border on White Box
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Draw QR Image inside White Box (centered, 480x480)
          const qrSize = 480;
          const qrX = (canvas.width - qrSize) / 2;
          const qrY = 310;
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

          // URL Text below QR
          ctx.fillStyle = '#1F3A5F';
          ctx.font = 'bold 22px monospace';
          ctx.textAlign = 'center';
          const displayUrl = options.joinUrl.replace(/^https?:\/\//, '');
          ctx.fillText(displayUrl, canvas.width / 2, 840);

          // 4. Instructions Card Box
          ctx.fillStyle = '#2A9D8F';
          ctx.beginPath();
          ctx.roundRect(70, 920, canvas.width - 140, 120, 20);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
          ctx.fillText('✓ Tanpa Perlu Install Aplikasi   ·   ✓ Tanpa Buat Akun', canvas.width / 2, 970);
          ctx.font = '500 19px system-ui, -apple-system, sans-serif';
          ctx.fillText('Arahkan kamera smartphone ke QR Code di atas untuk mulai mengisi', canvas.width / 2, 1005);

          // 5. Footer Branding
          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
          ctx.fillText('PartnerUp Live · Interaktif Seminar UMKM oleh Obeecreatives', canvas.width / 2, 1140);

          // Trigger download
          triggerDownload(
            canvas.toDataURL('image/png'),
            options.filename || 'QR-Peserta-Scan-HP-PartnerUp.png'
          );
        } else {
          // Clean Standalone QR Code Canvas: 800 x 800 px
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 800;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(blobURL);
            return reject(new Error('Canvas context unavailable'));
          }

          // Crisp white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw QR Code centered with 50px border
          const pad = 50;
          ctx.drawImage(img, pad, pad, canvas.width - pad * 2, canvas.height - pad * 2);

          // Trigger download
          triggerDownload(
            canvas.toDataURL('image/png'),
            options.filename || 'QR-Code-Peserta.png'
          );
        }

        URL.revokeObjectURL(blobURL);
        resolve();
      } catch (err) {
        URL.revokeObjectURL(blobURL);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(blobURL);
      reject(err);
    };

    img.src = blobURL;
  });
}

/**
 * Downloads the raw SVG vector file directly
 */
export function downloadQrCodeAsSvg(svgElementId: string, filename = 'QR-Peserta-Vektor.svg'): void {
  const svgEl = document.getElementById(svgElementId);
  if (!svgEl) {
    console.error(`SVG element #${svgElementId} not found`);
    return;
  }
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Triggers a browser file download using an anchor element
 */
function triggerDownload(dataUrlOrBlob: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrlOrBlob;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Builds formatted text and WhatsApp share link for participants
 */
export function buildQrWhatsAppShareUrl(joinUrl: string, seminarTitle: string): string {
  const text = `Halo Bapak/Ibu Peserta Seminar UMKM!\n\nSilakan buka tautan lembar kerja interaktif PartnerUp berikut untuk langsung menjawab dari smartphone Anda:\n\n👉 ${joinUrl}\n\n*${seminarTitle}*\n(Tanpa perlu instal aplikasi dan tanpa perlu login/buat akun)`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
