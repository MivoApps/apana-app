/**
 * Helper centralizado para roles y permisos administrativos en APANA.
 * 
 * Reglas de SuperAdmin según el entorno:
 * - DEV (desarrollo local / apana-dev):
 *   Únicamente 'angelo@mivo.pe' cuenta con rol SuperAdmin.
 *   'angelocastellanos99@gmail.com' opera como un usuario/comerciante regular.
 * 
 * - PROD (producción / apana-app-edf1a):
 *   Tanto 'angelo@mivo.pe' como 'angelocastellanos99@gmail.com' son SuperAdmins oficiales.
 */

export function isDevEnvironment(): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'apana-dev') return true;
  return false;
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();

  // 'angelo@mivo.pe' es SuperAdmin en dev y prod
  if (cleanEmail === 'angelo@mivo.pe') return true;

  // En producción, 'angelocastellanos99@gmail.com' también es SuperAdmin
  if (!isDevEnvironment() && cleanEmail === 'angelocastellanos99@gmail.com') {
    return true;
  }

  return false;
}

export function getSuperAdminEmails(): string[] {
  if (isDevEnvironment()) {
    return ['angelo@mivo.pe'];
  }
  return ['angelo@mivo.pe', 'angelocastellanos99@gmail.com'];
}
