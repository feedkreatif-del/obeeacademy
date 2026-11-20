import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  firestoreDatabaseId:
    import.meta.env.VITE_FIRESTORE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

export function getOrCreateParticipantId(): string {
  const key = 'partnerup_participant_id';
  try {
    let existing = window.localStorage.getItem(key);
    if (existing && /^[a-zA-Z0-9_\-]+$/.test(existing)) {
      return existing.slice(0, 64);
    }
    const generated = 'umkm_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    window.localStorage.setItem(key, generated);
    return generated;
  } catch {
    return 'umkm_guest_' + Math.random().toString(36).substring(2, 10);
  }
}

/**
 * Recursively strips `undefined` properties so Firestore setDoc never rejects optional fields.
 */
export function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = sanitizeForFirestore(v);
      }
    }
    return out as T;
  }
  return value;
}

interface FirestoreRestValue {
  stringValue?: string;
  integerValue?: string | number;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreRestValue[] };
  mapValue?: { fields?: Record<string, FirestoreRestValue> };
}

function decodeFirestoreRestValue(val: FirestoreRestValue): unknown {
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) {
    const n = Number(val.integerValue);
    return Number.isNaN(n) ? 0 : n;
  }
  if ('doubleValue' in val) return val.doubleValue;
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    return (val.arrayValue?.values || []).map((item) => decodeFirestoreRestValue(item));
  }
  if ('mapValue' in val) {
    const res: Record<string, unknown> = {};
    const fields = val.mapValue?.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      res[k] = decodeFirestoreRestValue(v);
    }
    return res;
  }
  return undefined;
}

/**
 * Direct HTTP server read (cache: 'no-store') as zero-cache fallback for mobile QR WebViews.
 */
export async function fetchFirestoreDocRest<T>(
  collectionPath: string,
  docId: string
): Promise<T | null> {
  if (!docId || !/^[a-zA-Z0-9_\-]+$/.test(docId)) return null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      firebaseConfig.projectId
    )}/databases/${encodeURIComponent(
      firebaseConfig.firestoreDatabaseId
    )}/documents/${encodeURIComponent(collectionPath)}/${encodeURIComponent(
      docId
    )}?_t=${Date.now()}`;
    const resp = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
    if (!resp.ok) return null;
    const json = (await resp.json()) as { fields?: Record<string, FirestoreRestValue> };
    if (!json?.fields) return null;
    const decoded: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(json.fields)) {
      decoded[k] = decodeFirestoreRestValue(v);
    }
    return decoded as T;
  } catch {
    return null;
  }
}
