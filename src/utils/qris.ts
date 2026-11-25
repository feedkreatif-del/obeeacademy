import jsQR from 'jsqr';

export const DEFAULT_GOPAY_QRIS_PAYLOAD =
  '00020101021126610014COM.GO-JEK.WWW01189360091437852474020210G7852474020303UMI51440014ID.CO.QRIS.WWW0215ID10265793199910303UMI5204899953033605802ID5924obeecreatives, Digital &6004BATU61056531462140703A0111036216304E7A5';

export const DEFAULT_GOPAY_MERCHANT_NAME = 'OBEECREATIVES, DIGITAL & KREATIF';
export const DEFAULT_GOPAY_MERCHANT_NMID = 'ID1026579319991';
export const DEFAULT_GOPAY_QRIS_IMAGE =
  '/assets/aistudio/WhatsApp_Image_2026-11-25_at_10.06.42_6544371c.jpeg';

interface EmvTlvNode {
  tag: string;
  value: string;
}

/**
 * Hitung CRC-16/CCITT-FALSE (4 digit hex uppercase) sesuai standar EMVCo QRIS Indonesia
 */
export function computeQrisCrc16(payloadUpTo6304: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payloadUpTo6304.length; i++) {
    crc ^= payloadUpTo6304.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function parseEmvTlvList(raw: string): EmvTlvNode[] {
  const nodes: EmvTlvNode[] = [];
  let cursor = 0;
  const clean = (raw || '').trim();
  while (cursor + 4 <= clean.length) {
    const tag = clean.slice(cursor, cursor + 2);
    const lenStr = clean.slice(cursor + 2, cursor + 4);
    const len = parseInt(lenStr, 10);
    if (Number.isNaN(len) || len < 0 || cursor + 4 + len > clean.length) {
      return [];
    }
    const value = clean.slice(cursor + 4, cursor + 4 + len);
    nodes.push({ tag, value });
    cursor += 4 + len;
  }
  return nodes;
}

function serializeEmvTlvList(nodes: EmvTlvNode[]): string {
  return nodes
    .map((n) => {
      const len = String(n.value.length).padStart(2, '0');
      return `${n.tag}${len}${n.value}`;
    })
    .join('');
}

export function isValidQrisPayload(payload?: string): boolean {
  if (!payload) return false;
  const clean = payload.trim();
  if (!clean.startsWith('000201') || clean.length < 40) return false;
  const nodes = parseEmvTlvList(clean);
  if (nodes.length < 5) return false;
  const hasCurrencyOrCountry =
    nodes.some((n) => n.tag === '53' && n.value === '360') ||
    nodes.some((n) => n.tag === '58' && n.value === 'ID');
  return hasCurrencyOrCountry;
}

export function extractQrisMetadata(payload?: string): {
  merchantName: string;
  merchantCity: string;
  nmid: string;
} {
  const fallback = {
    merchantName: DEFAULT_GOPAY_MERCHANT_NAME,
    merchantCity: 'BATU',
    nmid: DEFAULT_GOPAY_MERCHANT_NMID,
  };
  if (!payload) return fallback;
  const nodes = parseEmvTlvList(payload);
  if (nodes.length === 0) return fallback;

  const merchantName = nodes.find((n) => n.tag === '59')?.value?.trim() || fallback.merchantName;
  const merchantCity = nodes.find((n) => n.tag === '60')?.value?.trim() || fallback.merchantCity;
  let nmid = fallback.nmid;
  const tag51 = nodes.find((n) => n.tag === '51')?.value;
  if (tag51) {
    const sub51 = parseEmvTlvList(tag51);
    const sub02 = sub51.find((s) => s.tag === '02')?.value?.trim();
    if (sub02) nmid = sub02;
  }
  return { merchantName, merchantCity, nmid };
}

/**
 * Injeksi nominal IDR ke payload QRIS Statis menjadi Dynamic QRIS (Tag 01 = '12', Tag 54 = nominal, Tag 63 = CRC baru).
 */
export function buildDynamicQrisPayload(
  staticPayload: string,
  amountIdr: number
): string {
  const basePayload = isValidQrisPayload(staticPayload)
    ? staticPayload.trim()
    : DEFAULT_GOPAY_QRIS_PAYLOAD;

  const cleanAmount = Math.max(0, Math.round(amountIdr));
  if (cleanAmount <= 0) return basePayload;

  const nodes = parseEmvTlvList(basePayload).filter(
    (n) => n.tag !== '63' && n.tag !== '54'
  );
  if (nodes.length === 0) return basePayload;

  const amountStr = String(cleanAmount);
  const nextNodes: EmvTlvNode[] = [];
  let insertedAmount = false;

  for (const node of nodes) {
    if (node.tag === '01') {
      nextNodes.push({ tag: '01', value: '12' });
      continue;
    }
    nextNodes.push(node);
    if (node.tag === '53' && !insertedAmount) {
      nextNodes.push({ tag: '54', value: amountStr });
      insertedAmount = true;
    }
  }

  if (!insertedAmount) {
    const idx58 = nextNodes.findIndex((n) => n.tag === '58');
    if (idx58 >= 0) {
      nextNodes.splice(idx58, 0, { tag: '54', value: amountStr });
    } else {
      nextNodes.push({ tag: '54', value: amountStr });
    }
  }

  const bodyWith6304 = `${serializeEmvTlvList(nextNodes)}6304`;
  const crc = computeQrisCrc16(bodyWith6304);
  return `${bodyWith6304}${crc}`;
}

/**
 * Hasilkan kode unik deterministik 2-3 digit (11..199) per peserta agar mutasi GoPay Merchant mudah dicocokkan.
 */
export function deriveUniquePaymentCode(
  participantId: string,
  campaignId: string = 'active'
): number {
  const seedStr = `${campaignId}:${participantId}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return 11 + (hash % 189); // 11..199
}

export function formatRupiah(amount: number): string {
  const clean = Math.max(0, Math.round(amount || 0));
  return `Rp${clean.toLocaleString('id-ID')}`;
}

/**
 * Decode payload string QRIS langsung di browser dari file gambar PNG/JPG yang diunggah mentor.
 */
export async function decodeQrisFromImageFile(file: File): Promise<string | null> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal memuat gambar QRIS'));
      el.src = objectUrl;
    });

    const targetWidths = [img.naturalWidth, 1200, 800].filter(
      (w, idx, arr) => w > 100 && arr.indexOf(w) === idx
    );

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    for (const targetW of targetWidths) {
      const scale = targetW / img.naturalWidth;
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const decoded = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
      if (decoded?.data && isValidQrisPayload(decoded.data)) {
        return decoded.data.trim();
      }
    }
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
