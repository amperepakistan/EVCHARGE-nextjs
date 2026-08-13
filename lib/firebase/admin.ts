import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getMessaging as getAdminMessaging, type Messaging } from 'firebase-admin/messaging';

type GoogleServiceAccountJson = ServiceAccount & {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function normalizeServiceAccount(parsed: GoogleServiceAccountJson): ServiceAccount {
  const privateKey = (parsed.privateKey || parsed.private_key || '').replace(/\\n/g, '\n');
  const projectId = parsed.projectId || parsed.project_id || 'ampere-ac9f0';
  const clientEmail = parsed.clientEmail || parsed.client_email;

  if (!privateKey || !clientEmail) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is missing private_key or client_email. Download a new key from Firebase Console → Project settings → Service accounts.',
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function getServiceAccountCredential(): ServiceAccount | null {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    try {
      return normalizeServiceAccount(JSON.parse(rawKey) as GoogleServiceAccountJson);
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY environment variable:', e);
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Paste the full service-account JSON as one line.',
      );
    }
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (filePath) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return normalizeServiceAccount(JSON.parse(fileContent) as GoogleServiceAccountJson);
      }
    } catch (e) {
      console.error(`Failed to load service account file from ${filePath}:`, e);
      throw new Error(`Failed to load FIREBASE_SERVICE_ACCOUNT_PATH: ${filePath}`);
    }
  }

  return null;
}

export function initFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const credential = getServiceAccountCredential();

  if (credential) {
    return initializeApp({
      credential: cert(credential),
      projectId: credential.projectId || 'ampere-ac9f0',
    });
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not set on the server. Add it in Vercel env vars (Firebase Console → Project settings → Service accounts → Generate new private key).',
    );
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ampere-ac9f0',
  });
}

export function getMessaging(): Messaging {
  const app = initFirebaseAdmin();
  return getAdminMessaging(app);
}
