import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { sendWhatsAppNotification, buildTrialDay23ReminderText } from '@/lib/whatsapp-notifications';

export const dynamic = 'force-dynamic';

interface RenewalProcessResult {
  storeId: string;
  storeName: string;
  action:
    | 'downgraded_trial_expired'
    | 'downgraded_paid_expired'
    | 'renewed_paid'
    | 'renewed_trial_converted'
    | 'charge_failed_grace_period'
    | 'reminder_day_23_sent'
    | 'reminder_skipped_no_phone'
    | 'reminder_send_failed'
    | 'simulation_executed'
    | 'skipped_not_due';
  previousPlan: string;
  newPlan: string;
  subscriptionStatus: string;
  nextBillingDate?: number;
  chargeId?: string;
  error?: string;
  details?: any;
}

export async function GET(request: Request) {
  return handleProcessRenewals(request);
}

export async function POST(request: Request) {
  return handleProcessRenewals(request);
}

async function handleProcessRenewals(request: Request) {
  const url = new URL(request.url);
  const authHeader = request.headers.get('authorization') || '';
  const querySecret = url.searchParams.get('secret') || url.searchParams.get('key') || '';
  const cronSecret = process.env.CRON_SECRET || 'apana_cron_secret_dev';
  const isDev = process.env.NODE_ENV === 'development';

  // 1. Validar autenticación del cron (Vercel Cron, GitHub Actions, o dev local)
  const isAuthorized =
    Boolean(cronSecret && (authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret)) ||
    isDev ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1';

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'No autorizado para ejecutar el proceso de renovación.' },
      { status: 401 }
    );
  }

  // 2. REGLA ESTRICTA DE SEGURIDAD:
  // El modo de simulación rápida está EXCLUSIVAMENTE disponible en DEV (NODE_ENV === 'development').
  // En producción (Vercel / servidor en producción), está estrictamente bloqueado.
  const simulateScenario = url.searchParams.get('scenario');
  const simulateStoreId = url.searchParams.get('storeId') || url.searchParams.get('simulateStoreId');
  const overridePhone = url.searchParams.get('phone');

  if (simulateScenario) {
    if (!isDev) {
      return NextResponse.json(
        { error: 'El modo de simulación rápida está estrictamente deshabilitado y bloqueado en entornos de producción.' },
        { status: 403 }
      );
    }

    return await handleDevSimulation({
      scenario: simulateScenario,
      storeId: simulateStoreId,
      overridePhone,
    });
  }

  const now = Date.now();
  const culqiSecretKey = process.env.CULQI_SECRET_KEY || '';
  const isRealCulqiKey = culqiSecretKey && !culqiSecretKey.includes('xxxxxxxx') && !culqiSecretKey.includes('demo');

  const results: RenewalProcessResult[] = [];

  try {
    // 3. Consultar todas las tiendas en Firestore
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    const candidateStores: any[] = [];

    storesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      const plan = data.plan || 'gratis';
      const status = data.subscriptionStatus || (plan === 'gratis' ? 'free' : 'active');

      if (plan !== 'gratis' || status === 'trial' || status === 'active' || status === 'past_due' || status === 'cancelled') {
        candidateStores.push({ id, ...data, subscriptionStatus: status });
      }
    });

    for (const store of candidateStores) {
      const storeRef = doc(db, 'stores', store.id);
      const isTrial = store.subscriptionStatus === 'trial' || (Boolean(store.hasUsedTrial) && store.trialEndDate && now <= store.trialEndDate);
      const effectiveCutoff = store.trialEndDate || store.nextBillingDate || 0;

      // RECORDATORIO WHATSAPP DÍA 23:
      // Se evalúa para comercios en prueba gratuita activa que NO hayan cancelado,
      // que aún no hayan recibido el recordatorio y cuya fecha de fin esté a 7 días o menos.
      if (isTrial && !store.cancelAtPeriodEnd && !store.trialReminderSent && store.trialEndDate) {
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const timeRemaining = store.trialEndDate - now;

        if (timeRemaining > 0 && timeRemaining <= sevenDaysMs) {
          const targetPlan = store.plan === 'negocio' ? 'negocio' : 'emprendedor';
          const planName = targetPlan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor';
          const billingCycle = store.billingCycle === 'anual' ? 'anual' : 'mensual';
          let renewalAmount = store.renewalAmount;
          if (!renewalAmount) {
            if (billingCycle === 'anual') {
              renewalAmount = targetPlan === 'negocio' ? 219.90 : 139.90;
            } else {
              renewalAmount = targetPlan === 'negocio' ? 39.90 : 19.90;
            }
          }
          const cardLastFour = store.cardLastFour || '••••';
          const phone = store.whatsappPhone || '';
          const cleanDigits = phone.replace(/\D/g, '');

          // VALIDACIÓN DEFENSIVA:
          // Si el comerciante NO configuró su WhatsApp (o el número es inválido/incompleto):
          // NO marcamos trialReminderSent como true. Marcamos trialReminderPendingPhone: true
          // para que si el comerciante configura su WhatsApp en los días restantes,
          // el próximo ciclo del cron le envíe el recordatorio de inmediato.
          if (!cleanDigits || cleanDigits.length < 9) {
            await updateDoc(storeRef, {
              trialReminderSent: false,
              trialReminderPendingPhone: true,
              trialReminderLastError: 'Número de WhatsApp no configurado o incompleto.',
              trialReminderLastAttemptAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            results.push({
              storeId: store.id,
              storeName: store.name || 'Tienda',
              action: 'reminder_skipped_no_phone',
              previousPlan: targetPlan,
              newPlan: targetPlan,
              subscriptionStatus: 'trial',
              error: 'WhatsApp no configurado. Se enviará apenas el comerciante vincule su número.',
            });
          } else {
            const renewalDateFormatted = new Date(store.trialEndDate).toLocaleDateString('es-PE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'America/Lima',
            });

            const reminderMessage = buildTrialDay23ReminderText({
              storeName: store.name || 'Tienda',
              planName,
              renewalDateFormatted,
              renewalAmount,
              cardLastFour,
            });

            const sendResult = await sendWhatsAppNotification({
              storeId: store.id,
              storeName: store.name || 'Tienda',
              phone,
              message: reminderMessage,
              type: 'TRIAL_DAY_23_REMINDER',
              metadata: {
                plan: targetPlan,
                billingCycle,
                renewalAmount,
                trialEndDate: store.trialEndDate,
              },
            });

            if (sendResult.success) {
              await updateDoc(storeRef, {
                trialReminderSent: true,
                trialReminderSentAt: serverTimestamp(),
                trialReminderPendingPhone: false,
                trialReminderLastError: null,
                updatedAt: serverTimestamp(),
              });

              results.push({
                storeId: store.id,
                storeName: store.name || 'Tienda',
                action: 'reminder_day_23_sent',
                previousPlan: targetPlan,
                newPlan: targetPlan,
                subscriptionStatus: 'trial',
              });
            } else {
              // Si falló el envío (ej. error de conexión o fallo del bot):
              // NO marcamos como enviado para permitir que el cron reintente.
              await updateDoc(storeRef, {
                trialReminderSent: false,
                trialReminderLastError: sendResult.error || 'Error enviando mensaje de WhatsApp',
                trialReminderLastAttemptAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });

              results.push({
                storeId: store.id,
                storeName: store.name || 'Tienda',
                action: 'reminder_send_failed',
                previousPlan: targetPlan,
                newPlan: targetPlan,
                subscriptionStatus: 'trial',
                error: sendResult.error || 'Error enviando notificación de WhatsApp.',
              });
            }
          }
        }
      }

      // Si la fecha de corte aún está en el futuro, no corresponde procesarla aún para cobro/expiración
      if (effectiveCutoff > now) {
        continue;
      }

      // CASO A: El usuario canceló la suscripción o prueba antes de que venciera
      // REGLA FUNDAMENTAL: Mantiene todos sus beneficios vigentes hasta el último día (effectiveCutoff <= now).
      // Al llegar esa fecha, se procede a degradar la tienda a Plan Gratis sin realizar ningún cobro.
      if (store.cancelAtPeriodEnd) {
        await updateDoc(storeRef, {
          plan: 'gratis',
          subscriptionStatus: 'free',
          cancelAtPeriodEnd: false,
          updatedAt: serverTimestamp(),
        });

        // Registrar evento de degradación limpia
        try {
          await addDoc(collection(db, 'subscription_events'), {
            storeId: store.id,
            type: isTrial ? 'trial_expired_user_cancelled' : 'subscription_expired_user_cancelled',
            previousPlan: store.plan || 'emprendedor',
            newPlan: 'gratis',
            wasTrial: isTrial,
            timestamp: now,
          });
        } catch (_) {}

        results.push({
          storeId: store.id,
          storeName: store.name || 'Tienda',
          action: isTrial ? 'downgraded_trial_expired' : 'downgraded_paid_expired',
          previousPlan: store.plan || 'emprendedor',
          newPlan: 'gratis',
          subscriptionStatus: 'free',
        });
        continue;
      }

      // CASO B: El usuario NO canceló -> Ejecutar cobro recurrente con Culqi
      // Aplica a tiendas que culminan sus 30 días gratis o tiendas activas en renovación recurrente
      const targetPlan = store.plan === 'negocio' ? 'negocio' : 'emprendedor';
      const billingCycle = store.billingCycle === 'anual' ? 'anual' : 'mensual';
      const planName = targetPlan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor';

      // Monto según ciclo oficial:
      // Emprendedor: S/ 19.90 mensual, S/ 139.90 anual
      // Negocio Pro: S/ 39.90 mensual, S/ 219.90 anual
      let renewalAmount = store.renewalAmount;
      if (!renewalAmount) {
        if (billingCycle === 'anual') {
          renewalAmount = targetPlan === 'negocio' ? 219.90 : 139.90;
        } else {
          renewalAmount = targetPlan === 'negocio' ? 39.90 : 19.90;
        }
      }

      const amountInCents = Math.round(renewalAmount * 100);
      const customerId = store.culqiCustomerId;
      const cardId = store.culqiCardId;

      // Si no tiene tarjeta guardada en bóveda Culqi, no se puede cobrar automáticamente
      if (!cardId || !customerId) {
        await updateDoc(storeRef, {
          subscriptionStatus: 'past_due',
          lastPaymentError: 'No se encontró tarjeta guardada en la bóveda de pagos.',
          updatedAt: serverTimestamp(),
        });

        results.push({
          storeId: store.id,
          storeName: store.name || 'Tienda',
          action: 'charge_failed_grace_period',
          previousPlan: targetPlan,
          newPlan: targetPlan,
          subscriptionStatus: 'past_due',
          error: 'Falta customerId o cardId en la tienda.',
        });
        continue;
      }

      let chargeSuccess = false;
      let chargeId = `chr_mock_renewal_${now}`;
      let chargeErrorMsg = '';

      if (isRealCulqiKey) {
        try {
          const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${culqiSecretKey}`,
            },
            body: JSON.stringify({
              amount: amountInCents,
              currency_code: 'PEN',
              email: store.ownerEmail || store.billingEmail || 'comerciante@apana.pe',
              customer_id: customerId,
              source_id: cardId,
              description: `Renovación ${billingCycle === 'anual' ? 'Anual' : 'Mensual'} APANA - ${planName}`,
            }),
          });

          const chargeData = await culqiRes.json();

          if (culqiRes.ok && chargeData.id) {
            chargeSuccess = true;
            chargeId = chargeData.id;
          } else {
            chargeErrorMsg = chargeData.user_message || chargeData.merchant_message || 'Cobro rechazado por la pasarela de pagos.';
          }
        } catch (fetchErr: any) {
          chargeErrorMsg = fetchErr.message || 'Error de conexión con Culqi.';
        }
      } else {
        // Modo Sandbox / Demo
        chargeSuccess = true;
        chargeId = `chr_sandbox_renewal_${now}`;
      }

      // Si el cobro fue exitoso:
      if (chargeSuccess) {
        const cycleDurationMs = billingCycle === 'anual' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
        const newNextBillingDate = now + cycleDurationMs;

        await updateDoc(storeRef, {
          plan: targetPlan,
          subscriptionStatus: 'active', // Pasa a cliente de pago activo
          nextBillingDate: newNextBillingDate,
          lastPaymentDate: now,
          lastChargeId: chargeId,
          failedRenewalsCount: 0,
          updatedAt: serverTimestamp(),
        });

        // Registrar evento en subscription_events
        try {
          await addDoc(collection(db, 'subscription_events'), {
            storeId: store.id,
            type: isTrial ? 'trial_converted_to_paid' : 'subscription_renewed',
            plan: targetPlan,
            planName,
            billingCycle,
            amount: renewalAmount,
            chargeId,
            wasTrial: isTrial,
            timestamp: now,
          });
        } catch (_) {}

        results.push({
          storeId: store.id,
          storeName: store.name || 'Tienda',
          action: isTrial ? 'renewed_trial_converted' : 'renewed_paid',
          previousPlan: store.plan || targetPlan,
          newPlan: targetPlan,
          subscriptionStatus: 'active',
          nextBillingDate: newNextBillingDate,
          chargeId,
        });
      } else {
        // Cobro falló: otorgar periodo de gracia de 3 días antes de suspender
        const failedCount = (store.failedRenewalsCount || 0) + 1;

        if (failedCount >= 3) {
          await updateDoc(storeRef, {
            plan: 'gratis',
            subscriptionStatus: 'expired',
            failedRenewalsCount: failedCount,
            lastPaymentError: chargeErrorMsg,
            updatedAt: serverTimestamp(),
          });

          results.push({
            storeId: store.id,
            storeName: store.name || 'Tienda',
            action: 'downgraded_paid_expired',
            previousPlan: targetPlan,
            newPlan: 'gratis',
            subscriptionStatus: 'expired',
            error: `Cobro fallido reiterado (${failedCount}): ${chargeErrorMsg}`,
          });
        } else {
          await updateDoc(storeRef, {
            subscriptionStatus: 'past_due',
            failedRenewalsCount: failedCount,
            lastPaymentError: chargeErrorMsg,
            updatedAt: serverTimestamp(),
          });

          results.push({
            storeId: store.id,
            storeName: store.name || 'Tienda',
            action: 'charge_failed_grace_period',
            previousPlan: targetPlan,
            newPlan: targetPlan,
            subscriptionStatus: 'past_due',
            error: chargeErrorMsg,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedAt: new Date(now).toISOString(),
      candidatesFound: candidateStores.length,
      actionsTaken: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error procesando renovaciones en /api/cron/process-renewals:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor al procesar renovaciones.' },
      { status: 500 }
    );
  }
}

/**
 * Función auxiliar para simulación rápida de escenarios en desarrollo local.
 * ESTRICTAMENTE BLOQUEADA E INACCESIBLE EN PRODUCCIÓN.
 */
async function handleDevSimulation(params: {
  scenario: string;
  storeId?: string | null;
  overridePhone?: string | null;
}) {
  const { scenario, storeId, overridePhone } = params;
  const now = Date.now();

  // 1. Obtener lista de tiendas existentes en Firestore para contexto o fallback
  const storesSnap = await getDocs(collection(db, 'stores'));
  const availableStores: any[] = [];
  storesSnap.forEach((d) => {
    const dt = d.data();
    availableStores.push({
      id: d.id,
      name: dt.name || 'Sin nombre',
      plan: dt.plan || 'gratis',
      subscriptionStatus: dt.subscriptionStatus || 'free',
      whatsappPhone: dt.whatsappPhone || 'No asignado',
      cancelAtPeriodEnd: Boolean(dt.cancelAtPeriodEnd),
      trialEndDate: dt.trialEndDate ? new Date(dt.trialEndDate).toISOString() : null,
    });
  });

  // 2. Determinar tienda objetivo
  let targetStoreId = storeId || '';
  let storeData: any = null;

  if (targetStoreId) {
    const snap = await getDoc(doc(db, 'stores', targetStoreId));
    if (snap.exists()) {
      storeData = { id: snap.id, ...snap.data() };
    }
  }

  // Si no se proporcionó storeId o no existe, intentar tomar la primera tienda de prueba disponible
  if (!storeData) {
    if (!targetStoreId && availableStores.length > 0) {
      const candidate =
        availableStores.find((s) => s.subscriptionStatus === 'trial' || s.plan !== 'gratis') ||
        availableStores[0];
      targetStoreId = candidate.id;
      const snap = await getDoc(doc(db, 'stores', targetStoreId));
      storeData = { id: snap.id, ...snap.data() };
    } else {
      return NextResponse.json(
        {
          error: `No se encontró la tienda "${targetStoreId}". Proporciona un storeId válido.`,
          tiendasDisponiblesEnDev: availableStores.slice(0, 5),
        },
        { status: 404 }
      );
    }
  }

  const storeRef = doc(db, 'stores', targetStoreId);
  const targetPlan = storeData.plan === 'negocio' ? 'negocio' : 'emprendedor';
  const planName = targetPlan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor';
  const billingCycle = storeData.billingCycle === 'anual' ? 'anual' : 'mensual';
  const renewalAmount =
    storeData.renewalAmount ||
    (billingCycle === 'anual'
      ? targetPlan === 'negocio'
        ? 219.90
        : 139.90
      : targetPlan === 'negocio'
        ? 39.90
        : 19.90);
  const cardLastFour = storeData.cardLastFour || '4242';

  switch (scenario) {
    case 'day_23': {
      // Probar recordatorio del Día 23
      const effectivePhone = overridePhone || storeData.whatsappPhone || '';
      const cleanDigits = effectivePhone.replace(/\D/g, '');

      if (!cleanDigits || cleanDigits.length < 9) {
        // Simulación: Comercio SIN WhatsApp configurado
        await updateDoc(storeRef, {
          trialReminderSent: false,
          trialReminderPendingPhone: true,
          trialReminderLastError: 'Número de WhatsApp no configurado o incompleto.',
          updatedAt: serverTimestamp(),
        });

        return NextResponse.json({
          simulation: true,
          environment: 'development',
          scenario: 'day_23',
          storeId: targetStoreId,
          storeName: storeData.name || 'Tienda',
          phoneConfigured: false,
          action: 'reminder_skipped_no_phone',
          trialReminderSent: false,
          trialReminderPendingPhone: true,
          message:
            'Simulación completada: Al no tener WhatsApp configurado, el sistema NO marcó trialReminderSent como true y preservó el estado pendiente.',
        });
      }

      const renewalDateFormatted = new Date(now + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Lima',
      });

      const reminderMessage = buildTrialDay23ReminderText({
        storeName: storeData.name || 'Tienda',
        planName,
        renewalDateFormatted,
        renewalAmount,
        cardLastFour,
      });

      const sendResult = await sendWhatsAppNotification({
        storeId: targetStoreId,
        storeName: storeData.name || 'Tienda',
        phone: effectivePhone,
        message: reminderMessage,
        type: 'TRIAL_DAY_23_REMINDER',
        metadata: {
          simulation: true,
          plan: targetPlan,
          renewalAmount,
        },
      });

      if (sendResult.success) {
        await updateDoc(storeRef, {
          trialReminderSent: true,
          trialReminderSentAt: serverTimestamp(),
          trialReminderPendingPhone: false,
          trialReminderLastError: null,
          updatedAt: serverTimestamp(),
        });
      }

      return NextResponse.json({
        simulation: true,
        environment: 'development',
        scenario: 'day_23',
        storeId: targetStoreId,
        storeName: storeData.name || 'Tienda',
        targetPhone: effectivePhone,
        sendResult,
        reminderMessage,
        message: sendResult.success
          ? 'Simulación completada con éxito: Recordatorio del Día 23 enviado por WhatsApp y registrado en Firestore.'
          : 'Simulación ejecutada: WhatsApp falló, se preservó trialReminderSent: false para reintentar.',
      });
    }

    case 'day_30_cancel': {
      // Simulación del Día 30 cuando el usuario canceló antes de que venciera
      await updateDoc(storeRef, {
        plan: 'gratis',
        subscriptionStatus: 'free',
        cancelAtPeriodEnd: false,
        trialEndDate: now - 1000,
        downgradedAt: now,
        updatedAt: serverTimestamp(),
      });

      try {
        await addDoc(collection(db, 'subscription_events'), {
          storeId: targetStoreId,
          type: 'simulation_trial_expired_user_cancelled',
          previousPlan: targetPlan,
          newPlan: 'gratis',
          wasTrial: true,
          timestamp: now,
        });
      } catch (_) {}

      return NextResponse.json({
        simulation: true,
        environment: 'development',
        scenario: 'day_30_cancel',
        storeId: targetStoreId,
        storeName: storeData.name || 'Tienda',
        action: 'downgraded_trial_expired',
        previousPlan: targetPlan,
        newPlan: 'gratis',
        subscriptionStatus: 'free',
        message:
          'Simulación completada con éxito: El usuario había cancelado. La tienda mantuvo beneficios hasta hoy y fue degradada a Plan Gratis sin cobro a su tarjeta.',
      });
    }

    case 'day_30_renew': {
      // Simulación del Día 30 con cobro automático recurrente
      const cycleDurationMs = billingCycle === 'anual' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      const newNextBillingDate = now + cycleDurationMs;
      const mockChargeId = `chr_simulated_${now}`;

      await updateDoc(storeRef, {
        plan: targetPlan,
        subscriptionStatus: 'active',
        nextBillingDate: newNextBillingDate,
        lastPaymentDate: now,
        lastChargeId: mockChargeId,
        failedRenewalsCount: 0,
        updatedAt: serverTimestamp(),
      });

      try {
        await addDoc(collection(db, 'subscription_events'), {
          storeId: targetStoreId,
          type: 'simulation_trial_converted_to_paid',
          plan: targetPlan,
          planName,
          billingCycle,
          amount: renewalAmount,
          chargeId: mockChargeId,
          wasTrial: true,
          timestamp: now,
        });
      } catch (_) {}

      return NextResponse.json({
        simulation: true,
        environment: 'development',
        scenario: 'day_30_renew',
        storeId: targetStoreId,
        storeName: storeData.name || 'Tienda',
        action: 'renewed_trial_converted',
        newPlan: targetPlan,
        subscriptionStatus: 'active',
        nextBillingDate: newNextBillingDate,
        chargeId: mockChargeId,
        amount: renewalAmount,
        message:
          'Simulación completada con éxito: Cobro recurrente procesado y tienda convertida a cliente de pago activo.',
      });
    }

    case 'reset_trial': {
      // Helper de conveniencia para resetear la tienda a estado de prueba de 30 días
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      await updateDoc(storeRef, {
        plan: 'emprendedor',
        subscriptionStatus: 'trial',
        trialStartDate: now,
        trialEndDate: now + thirtyDaysMs,
        nextBillingDate: now + thirtyDaysMs,
        cancelAtPeriodEnd: false,
        hasUsedTrial: true,
        trialReminderSent: false,
        trialReminderPendingPhone: false,
        trialReminderLastError: null,
        failedRenewalsCount: 0,
        updatedAt: serverTimestamp(),
      });

      return NextResponse.json({
        simulation: true,
        environment: 'development',
        scenario: 'reset_trial',
        storeId: targetStoreId,
        storeName: storeData.name || 'Tienda',
        message:
          'Simulación completada: Tienda reseteada a 30 días de prueba activa (Día 1) con recordatorios y flags limpios.',
      });
    }

    default: {
      return NextResponse.json(
        {
          error: `Escenario "${scenario}" no reconocido.`,
          supportedScenarios: [
            'day_23 (Prueba recordatorio WhatsApp de 7 días restantes)',
            'day_30_cancel (Prueba degradación a gratis sin cobro si el usuario canceló)',
            'day_30_renew (Prueba cobro y conversión a cliente activo)',
            'reset_trial (Devuelve la tienda al Día 1 de prueba)',
          ],
        },
        { status: 400 }
      );
    }
  }
}

