import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface WhatsAppNotificationPayload {
  storeId: string;
  storeName: string;
  phone: string;
  message: string;
  type: 'TRIAL_DAY_23_REMINDER' | 'PAYMENT_FAILED_GRACE_PERIOD' | 'SUBSCRIPTION_RENEWED';
  metadata?: Record<string, any>;
}

/**
 * Normaliza un número telefónico al estándar internacional de WhatsApp para Perú (519XXXXXXXX).
 */
export function normalizeWhatsAppPhone(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';

  // Si ya tiene código de país Perú (51)
  if (digits.startsWith('51') && digits.length >= 11) {
    return digits;
  }

  // Si es un celular peruano de 9 dígitos que empieza en 9
  if (digits.length === 9) {
    return `51${digits}`;
  }

  return digits;
}

/**
 * Construye el mensaje oficial del Día 23 (Opción A aprobada).
 * Claro, transparente, con formato WhatsApp (*negritas*) y cero cobros sorpresa.
 */
export function buildTrialDay23ReminderText(params: {
  storeName: string;
  planName: string;
  renewalDateFormatted: string;
  renewalAmount: number;
  cardLastFour: string;
  manageUrl?: string;
}): string {
  const { storeName, planName, renewalDateFormatted, renewalAmount, cardLastFour, manageUrl } = params;
  const link = manageUrl || 'https://beapana.com/plans';

  return `¡Hola ${storeName || 'Emprendedor'}! 👋 Te avisamos que te quedan *7 días* de prueba gratis en APANA (*${planName}*).\n\n` +
    `🗓️ *Renovación:* ${renewalDateFormatted}\n` +
    `💳 *Monto:* S/ ${renewalAmount.toFixed(2)} *(tarjeta •••• ${cardLastFour || '••••'})*\n\n` +
    `Como prometimos, cero cobros sorpresa: si deseas continuar no tienes que hacer nada. Si prefieres cancelar sin costo, puedes hacerlo en 1 clic aquí:\n` +
    `👉 ${link}\n\n` +
    `¡Gracias por impulsar tu tienda con nosotros! 🚀`;
}

/**
 * Envia o encola una notificación de WhatsApp registrándola en la colección
 * "whatsapp_notifications" de Firestore y, si el bot HTTP está activo, despachándola en tiempo real.
 */
export async function sendWhatsAppNotification(
  payload: WhatsAppNotificationPayload
): Promise<{ success: boolean; notificationId?: string; sentViaBot?: boolean; error?: string }> {
  const cleanPhone = normalizeWhatsAppPhone(payload.phone);

  if (!cleanPhone || cleanPhone.length < 9) {
    console.warn(`[WhatsApp Notification] Teléfono inválido o vacío para la tienda ${payload.storeId}: "${payload.phone}"`);
    return { success: false, error: 'Número de WhatsApp inválido o no configurado.' };
  }

  try {
    // 1. Registrar notificación en la cola de Firestore
    const docRef = await addDoc(collection(db, 'whatsapp_notifications'), {
      storeId: payload.storeId,
      storeName: payload.storeName,
      phone: cleanPhone,
      message: payload.message,
      type: payload.type,
      status: 'pending', // 'pending' | 'sent' | 'failed'
      metadata: payload.metadata || {},
      createdAt: serverTimestamp(),
    });

    const notificationId = docRef.id;

    // 2. Si existe URL de webhook del bot configurada en entorno, invocar el microservicio
    const botUrl = process.env.WHATSAPP_BOT_URL || process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL;
    const botApiKey = process.env.BOT_API_KEY || 'apana_bot_secret_dev';

    if (botUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const response = await fetch(`${botUrl.replace(/\/$/, '')}/api/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${botApiKey}`,
          },
          body: JSON.stringify({
            phone: cleanPhone,
            message: payload.message,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const resData = await response.json();
          // Actualizar estado a 'sent' en Firestore
          await updateDoc(doc(db, 'whatsapp_notifications', notificationId), {
            status: 'sent',
            sentAt: serverTimestamp(),
            botResponse: resData,
            updatedAt: serverTimestamp(),
          });

          return { success: true, notificationId, sentViaBot: true };
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`[WhatsApp Notification] Bot HTTP respondió status ${response.status}:`, errData);
          await updateDoc(doc(db, 'whatsapp_notifications', notificationId), {
            status: 'pending', // Queda en pending para reintento por listener
            lastError: errData?.error || `HTTP ${response.status}`,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (fetchErr: any) {
        console.warn(`[WhatsApp Notification] Error contactando bot HTTP (${botUrl}):`, fetchErr?.message);
        // Queda en estado 'pending' en la colección de Firestore
      }
    }

    return { success: true, notificationId, sentViaBot: false };
  } catch (error: any) {
    console.error('[WhatsApp Notification] Error encolando notificación en Firestore:', error);
    return { success: false, error: error?.message || 'Error guardando notificación' };
  }
}
