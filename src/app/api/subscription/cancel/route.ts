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

    if (action === 'cancel') {
      await updateDoc(storeRef, {
        cancelAtPeriodEnd: true,
        subscriptionStatus: 'cancelled',
        updatedAt: serverTimestamp(),
      });

      // Log de evento de cancelación
      try {
        await addDoc(collection(db, 'subscription_events'), {
          storeId,
          type: 'cancellation_requested',
          previousPlan: storeData.plan || 'emprendedor',
          nextBillingDate: storeData.nextBillingDate || null,
          createdAt: Date.now(),
        });
      } catch (e) {
        console.warn('No se pudo registrar subscription_event:', e);
      }

      return NextResponse.json({
        success: true,
        message: 'Cancelación programada exitosamente. Mantendrás tus beneficios hasta el fin de tu ciclo.',
        cancelAtPeriodEnd: true,
        subscriptionStatus: 'cancelled',
      });
    } else if (action === 'reactivate') {
      await updateDoc(storeRef, {
        cancelAtPeriodEnd: false,
        subscriptionStatus: 'active',
        updatedAt: serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: '¡Suscripción reactivada! Tu plan continuará renovándose automáticamente.',
        cancelAtPeriodEnd: false,
        subscriptionStatus: 'active',
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
