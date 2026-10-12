import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenId, storeId, email, amount, plan = 'emprendedor', billingCycle = 'mensual' } = body;

    if (!tokenId || !storeId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (tokenId, storeId).' },
        { status: 400 }
      );
    }

    const targetPlan = plan === 'negocio' ? 'negocio' : 'emprendedor';
    const targetCycle: 'mensual' | 'anual' = billingCycle === 'anual' ? 'anual' : 'mensual';
    const planName = targetPlan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor';
    const culqiSecretKey = process.env.CULQI_SECRET_KEY || 'sk_test_demo_key';

    // Determinar monto según ciclo si no viene especificado
    const defaultAmountInCents = targetCycle === 'anual'
      ? (targetPlan === 'negocio' ? 21990 : 13990)
      : (targetPlan === 'negocio' ? 3990 : 1990);
    const finalAmount = amount !== undefined ? amount : defaultAmountInCents;

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
          amount: finalAmount,
          currency_code: 'PEN',
          email: email || 'cliente@apana.app',
          source_id: tokenId,
          description: `Suscripción ${targetCycle === 'anual' ? 'Anual' : 'Mensual'} APANA - ${planName}`,
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

    // 2. Calcular los días de suscripción (365 días para anual, 30 días para mensual)
    const now = Date.now();
    const durationMs = targetCycle === 'anual'
      ? 365 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;
    const nextBillingDate = now + durationMs;

    // 3. Actualizar la tienda en Firestore con el Plan Seleccionado
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      plan: targetPlan,
      subscriptionStatus: 'active',
      billingCycle: targetCycle,
      renewalAmount: finalAmount / 100,
      cancelAtPeriodEnd: false,
      subscriptionStartDate: now,
      nextBillingDate: nextBillingDate,
      lastPaymentDate: now,
      lastPaymentAmount: finalAmount / 100,
      lastCulqiChargeId: chargeResult.id,
      downgradedAt: null,
      dataRetentionUntil: null,
      updatedAt: serverTimestamp(),
    });

    // 4. Guardar registro en el historial de pagos
    try {
      await addDoc(collection(db, 'payment_records'), {
        storeId,
        amount: finalAmount / 100,
        currency: 'PEN',
        email,
        culqiChargeId: chargeResult.id,
        status: 'approved',
        plan: targetPlan,
        billingCycle: targetCycle,
        createdAt: now,
      });
    } catch (e) {
      console.warn('No se pudo crear payment_record:', e);
    }

    return NextResponse.json({
      success: true,
      chargeId: chargeResult.id,
      nextBillingDate,
      billingCycle: targetCycle,
      message: `¡${planName} activado exitosamente por ${targetCycle === 'anual' ? '1 año' : '30 días'}!`,
    });
  } catch (error: any) {
    console.error('Error en /api/culqi/charge:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor al procesar suscripción.' },
      { status: 500 }
    );
  }
}
