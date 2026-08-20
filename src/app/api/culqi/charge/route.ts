import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenId, storeId, email, amount = 1990 } = body; // amount en céntimos: 1990 = S/ 19.90

    if (!tokenId || !storeId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (tokenId, storeId).' },
        { status: 400 }
      );
    }

    const culqiSecretKey = process.env.CULQI_SECRET_KEY || 'sk_test_demo_key';

    // 1. Simulación o llamada real a la API de Culqi Charges
    let chargeResult: any = null;

    if (culqiSecretKey && !culqiSecretKey.includes('demo')) {
      // Llamada oficial a la API de Cargos de Culqi
      const culqiResponse = await fetch('https://api.culqi.com/v2/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${culqiSecretKey}`,
        },
        body: JSON.stringify({
          amount: amount,
          currency_code: 'PEN',
          email: email || 'cliente@apana.app',
          source_id: tokenId,
          description: 'Suscripción Mensual APANA - Plan Emprendedor',
        }),
      });

      chargeResult = await culqiResponse.json();

      if (!culqiResponse.ok) {
        return NextResponse.json(
          { error: chargeResult.user_message || chargeResult.merchant_message || 'Error al procesar el pago con Culqi.' },
          { status: 400 }
        );
      }
    } else {
      // Modo Mock / Sandbox si no hay clave secreta configurada
      chargeResult = {
        id: `chr_test_${Date.now()}`,
        outcome: { type: 'venta_exitosa' },
        amount: amount,
      };
    }

    // 2. Calcular los 30 días de suscripción
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const nextBillingDate = now + thirtyDaysMs;

    // 3. Actualizar la tienda en Firestore con Plan Emprendedor
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      plan: 'emprendedor',
      subscriptionStatus: 'active',
      subscriptionStartDate: now,
      nextBillingDate: nextBillingDate,
      lastPaymentDate: now,
      lastPaymentAmount: amount / 100, // S/ 19.90
      lastCulqiChargeId: chargeResult.id,
      updatedAt: serverTimestamp(),
    });

    // 4. Guardar registro en el historial de pagos
    try {
      await addDoc(collection(db, 'payment_records'), {
        storeId,
        amount: amount / 100,
        currency: 'PEN',
        email,
        culqiChargeId: chargeResult.id,
        status: 'approved',
        plan: 'emprendedor',
        createdAt: now,
      });
    } catch (e) {
      console.warn('No se pudo crear payment_record:', e);
    }

    return NextResponse.json({
      success: true,
      chargeId: chargeResult.id,
      nextBillingDate,
      message: '¡Plan Emprendedor activado exitosamente por 30 días!',
    });
  } catch (error: any) {
    console.error('Error en /api/culqi/charge:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor al procesar suscripción.' },
      { status: 500 }
    );
  }
}
