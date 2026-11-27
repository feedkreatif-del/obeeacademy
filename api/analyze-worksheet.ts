import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleWorksheetAnalyzeRequest } from './_worksheetAnalyzer.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

type VercelRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type VercelResponse = ServerResponse & {
  status?: (code: number) => VercelResponse;
  json?: (payload: unknown) => void;
};

async function readJsonBody(req: VercelRequest): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return null;
      }
    }
    return req.body;
  }

  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    const maxBytes = 12 * 1024 * 1024;

    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8').trim();
      if (!raw) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });

    req.on('error', (err) => reject(err));
  });
}

function sendJson(res: VercelResponse, statusCode: number, payload: unknown) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const statusFn = res.status;
  const jsonFn = res.json;
  if (typeof statusFn === 'function' && typeof jsonFn === 'function') {
    statusFn.call(res, statusCode);
    jsonFn.call(res, payload);
    return;
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method not allowed. Gunakan POST.' });
    return;
  }

  let body: unknown;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    if (err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE') {
      sendJson(res, 413, {
        error: 'Ukuran berkas terlalu besar untuk sekali kirim. Kompres atau kurangi jumlah halaman terlebih dahulu.',
      });
      return;
    }
    sendJson(res, 400, { error: 'Gagal membaca body permintaan.' });
    return;
  }

  const rawAuth = req.headers.authorization;
  const authorizationHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;

  const result = await handleWorksheetAnalyzeRequest({
    authorizationHeader,
    body,
  });

  sendJson(res, result.status, result.body);
}
