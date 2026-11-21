import { getAdminAuth } from '@/lib/firebase/admin';
import { isSuperAdminEmail } from '@/lib/auth-helpers';

export interface VerifiedAuthUser {
  uid: string;
  email: string;
  isSuperAdmin: boolean;
}

/**
 * Verifica el Firebase ID Token enviado en el header Authorization: Bearer <token>.
 * Retorna los datos verificados del usuario o null si no es válido.
 */
export async function verifyFirebaseAuth(request: Request): Promise<VerifiedAuthUser | null> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authHeader.slice(7).trim();
  if (!idToken) {
    return null;
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const email = (decoded.email || '').toLowerCase().trim();
    return {
      uid: decoded.uid,
      email,
      isSuperAdmin: isSuperAdminEmail(email),
    };
  } catch (err) {
    console.warn('[verifyFirebaseAuth] Token inválido o expirado:', err);
    return null;
  }
}

/**
 * Determina si una llave de Culqi es real (test o live) y no un placeholder/demo.
 */
export function isConfiguredCulqiKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (!trimmed) return false;
  if (trimmed.includes('xxxxxxxx') || trimmed.includes('demo')) return false;
  return trimmed.startsWith('sk_live_') || trimmed.startsWith('sk_test_') || trimmed.startsWith('pk_live_') || trimmed.startsWith('pk_test_');
}
