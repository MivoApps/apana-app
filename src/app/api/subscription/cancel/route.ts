import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { verifyFirebaseAuth } from '@/lib/firebase/verify-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Verificar sesión autenticada
    const authUser = await verifyFirebaseAuth(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Sesión no válida o expirada. Inicia sesión nuevamente.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { storeId, action = 'cancel' } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: 'Falta el parámetro requerido (storeId).' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const storeRef = db.collection('stores').doc(storeId);
    const storeSnap = await storeRef.get();

    if (!storeSnap.exists) {
      return NextResponse.json(
        { error: 'La tienda no existe.' },
        { status: 404 }
      );
    }

    const storeData = storeSnap.data() || {};

    // 2. Verificación estricta del propietario usando el UID verificado del token
    if (storeData.ownerId && storeData.ownerId !== authUser.uid && !authUser.isSuperAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta suscripción.' },
        { status: 403 }
      );
    }

    const isCurrentlyInTrial =
      storeData.subscriptionStatus === 'trial' ||
      Boolean(storeData.trialEndDate && Date.now() < storeData.trialEndDate);

    if (action === 'cancel') {
      await storeRef.set(
        {
          cancelAtPeriodEnd: true,
          // Si está en periodo de prueba, conservar 'trial' para no quitarle los beneficios hasta el último día
          subscriptionStatus: isCurrentlyInTrial ? 'trial' : 'cancelled',
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Log de evento de cancelación
      try {
        await db.collection('subscription_events').add({
          storeId,
          ownerId: storeData.ownerId || authUser.uid,
          type: isCurrentlyInTrial ? 'trial_cancellation_requested' : 'cancellation_requested',
          previousPlan: storeData.plan || 'emprendedor',
          isTrial: isCurrentlyInTrial,
          effectiveEndDate: storeData.trialEndDate || storeData.nextBillingDate || null,
          createdAt: Date.now(),
        });
      } catch (e) {
        console.warn('No se pudo registrar subscription_event:', e);
      }

      return NextResponse.json({
        success: true,
        message: isCurrentlyInTrial
          ? 'Prueba cancelada exitosamente. Mantendrás todos tus beneficios premium sin cobros hasta el fin de tus 30 días.'
          : 'Cancelación programada exitosamente. Mantendrás tus beneficios hasta el fin de tu ciclo.',
        cancelAtPeriodEnd: true,
        subscriptionStatus: isCurrentlyInTrial ? 'trial' : 'cancelled',
      });
    } else if (action === 'reactivate') {
      const targetStatus = isCurrentlyInTrial ? 'trial' : 'active';
      await storeRef.set(
        {
          cancelAtPeriodEnd: false,
          subscriptionStatus: targetStatus,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      try {
        await db.collection('subscription_events').add({
          storeId,
          ownerId: storeData.ownerId || authUser.uid,
          type: isCurrentlyInTrial ? 'trial_reactivated' : 'subscription_reactivated',
          plan: storeData.plan || 'emprendedor',
          createdAt: Date.now(),
        });
      } catch (e) {
        console.warn('No se pudo registrar subscription_event:', e);
      }

      return NextResponse.json({
        success: true,
        message: isCurrentlyInTrial
          ? '¡Renovación reactivada! Tu plan continuará activo y se renovará automáticamente al culminar tus 30 días.'
          : '¡Suscripción reactivada! Tu plan continuará renovándose automáticamente.',
        cancelAtPeriodEnd: false,
        subscriptionStatus: targetStatus,
      });
    } else {
      return NextResponse.json(
        { error: 'Acción no válida. Usa "cancel" o "reactivate".' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error en /api/subscription/cancel:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor al procesar la cancelación.' },
      { status: 500 }
    );
  }
}
