import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Inicializar Firebase (Singleton para evitar múltiples instancias en SSR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Configuración optimizada de Firestore:
// 1. experimentalAutoDetectLongPolling: true elimina el timeout fantasma de 60s de WebChannel en Chrome/Safari y redes móviles.
// 2. persistentLocalCache: Permite carga instantánea desde IndexedDB y soporte offline multi-pestaña en el navegador.
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  experimentalAutoDetectLongPolling: true,
  localCache: typeof window !== 'undefined'
    ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    : undefined,
});
export const storage = getStorage(app);

export default app;
