import { initializeApp, getApps, cert, applicationDefault, type App, type ServiceAccount } from 'firebase-admin/app';
import { getMessaging as getAdminMessaging, type Messaging } from 'firebase-admin/messaging';

function getServiceAccountCredential(): ServiceAccount | null {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    try {
      return JSON.parse(rawKey) as ServiceAccount;
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY environment variable:', e);
    }
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (filePath) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent) as ServiceAccount;
      }
    } catch (e) {
      console.error(`Failed to load service account file from ${filePath}:`, e);
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

  return initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ampere-ac9f0',
  });
}

export function getMessaging(): Messaging {
  const app = initFirebaseAdmin();
  return getAdminMessaging(app);
}
