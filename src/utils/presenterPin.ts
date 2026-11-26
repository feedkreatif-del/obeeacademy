import { User } from 'firebase/auth';
import { doc, Firestore, getDoc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';
import { sanitizeForFirestore } from '../firebase';
import { FlipchartBoardDoc } from '../types';

export interface PresenterPinConfig {
  version: 2;
  salt: string;
  pinHash: string;
  updatedAt: number;
  updatedBy?: string;
}

const PIN_CONFIG_DOC_ID = 'presenter_auth_config';
const PIN_CONFIG_SOURCE_ID = 'obeeacademy_auth';
const PIN_CONFIG_LOCAL_KEY = 'obee_presenter_pin_cfg_v2';
const LEGACY_PLAINTEXT_PIN_KEY = 'partnerup_remote_pin_v1';
const PIN_ATTEMPTS_KEY = 'obee_pin_attempts_v1';
const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_MS = 30_000;

export const AUTHORIZED_MENTOR_EMAIL = 'feedkreatif@gmail.com';

export function isAuthorizedMentorUser(user: User | null | undefined): boolean {
  return Boolean(
    user?.email &&
      user.email.toLowerCase() === AUTHORIZED_MENTOR_EMAIL &&
      user.emailVerified
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest('SHA-256', encoded);
  return toHex(digest);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function parsePinConfig(raw: unknown): PresenterPinConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<PresenterPinConfig>;
  if (
    obj.version === 2 &&
    typeof obj.salt === 'string' &&
    obj.salt.length >= 16 &&
    typeof obj.pinHash === 'string' &&
    obj.pinHash.length === 64
  ) {
    return {
      version: 2,
      salt: obj.salt,
      pinHash: obj.pinHash,
      updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now(),
      updatedBy: typeof obj.updatedBy === 'string' ? obj.updatedBy : undefined,
    };
  }
  return null;
}

export function loadPresenterPinConfigLocal(): PresenterPinConfig | null {
  try {
    // Clean up any insecure legacy plaintext PIN entry if still present
    window.localStorage.removeItem(LEGACY_PLAINTEXT_PIN_KEY);
    const raw = window.localStorage.getItem(PIN_CONFIG_LOCAL_KEY);
    if (!raw) return null;
    return parsePinConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePresenterPinConfigLocal(cfg: PresenterPinConfig | null): void {
  try {
    window.localStorage.removeItem(LEGACY_PLAINTEXT_PIN_KEY);
    if (!cfg) {
      window.localStorage.removeItem(PIN_CONFIG_LOCAL_KEY);
      return;
    }
    window.localStorage.setItem(PIN_CONFIG_LOCAL_KEY, JSON.stringify(cfg));
  } catch {
    // ignore storage failures
  }
}

export async function loadPresenterPinConfig(db: Firestore): Promise<PresenterPinConfig | null> {
  const local = loadPresenterPinConfigLocal();
  try {
    const snap = await getDoc(doc(db, 'flipchart', PIN_CONFIG_DOC_ID));
    if (snap.exists()) {
      const data = snap.data() as Partial<FlipchartBoardDoc>;
      if (typeof data.pagesJson === 'string' && data.pagesJson.trim().startsWith('{')) {
        const parsed = parsePinConfig(JSON.parse(data.pagesJson));
        if (parsed) {
          savePresenterPinConfigLocal(parsed);
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Gagal memuat konfigurasi PIN dari Cloud Firestore:', err);
  }
  return local;
}

export function subscribePresenterPinConfig(
  db: Firestore,
  onUpdate: (cfg: PresenterPinConfig | null) => void
): Unsubscribe {
  onUpdate(loadPresenterPinConfigLocal());
  const ref = doc(db, 'flipchart', PIN_CONFIG_DOC_ID);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<FlipchartBoardDoc>;
        if (typeof data.pagesJson === 'string' && data.pagesJson.trim().startsWith('{')) {
          try {
            const parsed = parsePinConfig(JSON.parse(data.pagesJson));
            if (parsed) {
              savePresenterPinConfigLocal(parsed);
              onUpdate(parsed);
              return;
            }
          } catch {
            // ignore malformed JSON
          }
        }
      }
      onUpdate(loadPresenterPinConfigLocal());
    },
    (err) => {
      console.warn('Listener konfigurasi PIN fallback ke lokal:', err);
    }
  );
}

export async function setPresenterPin(
  db: Firestore,
  rawPin: string,
  updatedBy?: string
): Promise<PresenterPinConfig> {
  const cleaned = rawPin.trim();
  if (cleaned.length < 6 || cleaned.length > 16) {
    throw new Error('PIN harus terdiri dari 6 hingga 16 karakter/angka.');
  }

  const salt = generateSalt();
  const pinHash = await sha256Hex(`${salt}:${cleaned}`);
  const cfg: PresenterPinConfig = {
    version: 2,
    salt,
    pinHash,
    updatedAt: Math.trunc(Date.now()),
    ...(updatedBy ? { updatedBy } : {}),
  };

  savePresenterPinConfigLocal(cfg);

  const boardPayload: FlipchartBoardDoc = sanitizeForFirestore({
    isOpen: false,
    syncToProjector: false,
    activePageIndex: 0,
    pagesJson: JSON.stringify(cfg),
    sourceDeviceId: PIN_CONFIG_SOURCE_ID,
    updatedAt: Math.trunc(Date.now()),
  });

  await setDoc(doc(db, 'flipchart', PIN_CONFIG_DOC_ID), boardPayload);
  return cfg;
}

export async function verifyPresenterPin(
  rawPin: string,
  config: PresenterPinConfig | null
): Promise<boolean> {
  if (!config) return false;
  const cleaned = rawPin.trim();
  if (!cleaned) return false;
  const candidateHash = await sha256Hex(`${config.salt}:${cleaned}`);
  return constantTimeEqual(candidateHash, config.pinHash);
}

interface AttemptState {
  count: number;
  cooldownUntil: number;
}

function readAttemptState(): AttemptState {
  try {
    const raw = window.sessionStorage.getItem(PIN_ATTEMPTS_KEY);
    if (!raw) return { count: 0, cooldownUntil: 0 };
    const parsed = JSON.parse(raw) as Partial<AttemptState>;
    return {
      count: typeof parsed.count === 'number' ? parsed.count : 0,
      cooldownUntil: typeof parsed.cooldownUntil === 'number' ? parsed.cooldownUntil : 0,
    };
  } catch {
    return { count: 0, cooldownUntil: 0 };
  }
}

export function getPinCooldownRemainingMs(): number {
  const state = readAttemptState();
  const remaining = state.cooldownUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

export function recordFailedPinAttempt(): { locked: boolean; remainingMs: number; attemptsLeft: number } {
  const prev = readAttemptState();
  const now = Date.now();
  if (prev.cooldownUntil > now) {
    return { locked: true, remainingMs: prev.cooldownUntil - now, attemptsLeft: 0 };
  }
  const nextCount = prev.count + 1;
  if (nextCount >= MAX_FAILED_ATTEMPTS) {
    const cooldownUntil = now + COOLDOWN_MS;
    try {
      window.sessionStorage.setItem(
        PIN_ATTEMPTS_KEY,
        JSON.stringify({ count: 0, cooldownUntil })
      );
    } catch {
      // ignore
    }
    return { locked: true, remainingMs: COOLDOWN_MS, attemptsLeft: 0 };
  }
  try {
    window.sessionStorage.setItem(
      PIN_ATTEMPTS_KEY,
      JSON.stringify({ count: nextCount, cooldownUntil: 0 })
    );
  } catch {
    // ignore
  }
  return { locked: false, remainingMs: 0, attemptsLeft: MAX_FAILED_ATTEMPTS - nextCount };
}

export function clearFailedPinAttempts(): void {
  try {
    window.sessionStorage.removeItem(PIN_ATTEMPTS_KEY);
  } catch {
    // ignore
  }
}
