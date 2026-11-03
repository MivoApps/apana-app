import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { Auth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

export function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // 1. Intentar cargar desde variable JSON completa (ideal para Vercel)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      let raw = serviceAccountJson.trim();
      // Si fue codificado en base64 para evitar saltos de línea en Vercel
      if (raw.startsWith('ey') || (!raw.startsWith('{') && raw.length > 50)) {
        try {
          raw = Buffer.from(raw, 'base64').toString('utf-8').trim();
        } catch (_) {}
      }
      const parsed = JSON.parse(raw);
      return initializeApp({
        credential: cert(parsed),
      });
    } catch (e) {
      console.error('[Firebase Admin] Error parseando FIREBASE_SERVICE_ACCOUNT_JSON:', e);
    }
  }

  // 2. Intentar cargar desde archivo local service-account.json si existe en la raíz
  const localKeyPath = path.join(process.cwd(), 'service-account.json');
  if (fs.existsSync(localKeyPath)) {
    try {
      const fileContent = fs.readFileSync(localKeyPath, 'utf-8');
      const parsed = JSON.parse(fileContent);
      return initializeApp({
        credential: cert(parsed),
      });
    } catch (e) {
      console.error('[Firebase Admin] Error leyendo service-account.json local:', e);
    }
  }

  // 3. Intentar cargar desde variables individuales
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (clientEmail && privateKey && projectId) {
    privateKey = privateKey.replace(/\\n/g, '\n');
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // 4. Fallback: inicializar con projectId básico
  return initializeApp({
    projectId: projectId || 'apana-dev',
  });
}

export function getAdminFirestore(): Firestore {
  if (!adminDb) {
    adminApp = getAdminApp();
    const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || '(default)';
    adminDb = getFirestore(adminApp, databaseId);
    // Configuración para ignorar propiedades indefinidas como en el cliente
    adminDb.settings({ ignoreUndefinedProperties: true });
  }
  return adminDb;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminApp = getAdminApp();
    adminAuth = getAuth(adminApp);
  }
  return adminAuth;
}
