import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, action = 'cancel', userId } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: 'Falta el parámetro requerido (storeId).' },
        { status: 400 }
      );
    }

    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);

    if (!storeSnap.exists()) {
      return NextResponse.json(
        { error: 'La tienda no existe.' },
        { status: 404 }
      );
    }

    const storeData = storeSnap.data();

    // Verificación de seguridad del propietario
    if (userId && storeData.ownerId && storeData.ownerId !== userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta suscripción.' },
        { status: 403 }
      );
    }

    const isCurrentlyInTrial = storeData.subscriptionStatus === 'trial' || (storeData.trialEndDate && Date.now() < storeData.trialEndDate);

    if (action === 'cancel') {
      await updateDoc(storeRef, {
        cancelAtPeriodEnd: true,
        // Si está en periodo de prueba, conservar 'trial' para no quitarle los beneficios hasta el último día
        subscriptionStatus: isCurrentlyInTrial ? 'trial' : 'cancelled',
        updatedAt: serverTimestamp(),
      });

      // Log de evento de cancelación
      try {
        await addDoc(collection(db, 'subscription_events'), {
          storeId,
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
      await updateDoc(storeRef, {
        cancelAtPeriodEnd: false,
        subscriptionStatus: targetStatus,
        updatedAt: serverTimestamp(),
      });

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
