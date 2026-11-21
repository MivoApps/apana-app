import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { verifyFirebaseAuth, isConfiguredCulqiKey } from '@/lib/firebase/verify-auth';

export const dynamic = 'force-dynamic';

interface RegisterTrialBody {
  tokenId: string;
  storeId: string;
  plan: 'emprendedor' | 'negocio';
  billingCycle?: 'mensual' | 'anual';
  email: string;
  customerName?: string;
  phone?: string;
}

export async function POST(request: Request) {
  try {
    // 1. Verificar sesión autenticada del comerciante
    const authUser = await verifyFirebaseAuth(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Sesión no válida o expirada. Inicia sesión nuevamente.' },
        { status: 401 }
      );
    }

    const body: RegisterTrialBody = await request.json();
    const {
      tokenId,
      storeId,
      plan = 'emprendedor',
      billingCycle = 'mensual',
      email,
      customerName,
      phone,
    } = body;

    if (!tokenId || !storeId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (tokenId, storeId).' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const storeRef = db.collection('stores').doc(storeId);
    const storeSnap = await storeRef.get();

    if (!storeSnap.exists) {
      return NextResponse.json(
        { error: 'La tienda no existe en el sistema.' },
        { status: 404 }
      );
    }

    const storeData = storeSnap.data() || {};

    // 2. Verificar propiedad de la tienda
    if (storeData.ownerId && storeData.ownerId !== authUser.uid && !authUser.isSuperAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para activar la prueba en esta tienda.' },
        { status: 403 }
      );
    }

    // 3. Evitar abuso de múltiples pruebas gratuitas (salvo superAdmin en dev)
    if (storeData.hasUsedTrial && !(authUser.isSuperAdmin && process.env.NODE_ENV === 'development')) {
      return NextResponse.json(
        { error: 'Esta tienda ya utilizó su periodo de prueba gratuito de 30 días.' },
        { status: 400 }
      );
    }

    const targetPlan: 'emprendedor' | 'negocio' = plan === 'negocio' ? 'negocio' : 'emprendedor';
    const planName = targetPlan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor';
    const billingEmail = (email || authUser.email || storeData.ownerEmail || 'comerciante@beapana.com').trim();

    const culqiSecretKey = process.env.CULQI_SECRET_KEY || '';
    const isRealCulqiKey = isConfiguredCulqiKey(culqiSecretKey);
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isRealCulqiKey && isProduction) {
      console.error('[/api/culqi/register-trial] CULQI_SECRET_KEY no está configurada en producción.');
      return NextResponse.json(
        { error: 'La pasarela de pagos no está configurada en este momento. Por favor contacta a soporte.' },
        { status: 503 }
      );
    }

    let customerId = `cus_dev_mock_${Date.now()}`;
    let cardId = `crd_dev_mock_${Date.now()}`;
    let cardBrand = 'Visa';
    let cardLastFour = '4242';

    // 4. Registrar Customer + Card en la bóveda de Culqi
    if (isRealCulqiKey) {
      try {
        const nameParts = (customerName || storeData.ownerName || 'Comerciante APANA').trim().split(' ');
        const firstName = nameParts[0] || 'Comerciante';
        const lastName = nameParts.slice(1).join(' ') || 'APANA';
        const cleanPhone = (phone || storeData.whatsappPhone || '999999999').replace(/\D/g, '').slice(-9) || '999999999';

        let resolvedCustomerId = storeData.culqiCustomerId || '';

        if (!resolvedCustomerId) {
          const customerRes = await fetch('https://api.culqi.com/v2/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${culqiSecretKey}`,
            },
            body: JSON.stringify({
              first_name: firstName,
              last_name: lastName,
              email: billingEmail,
              address: storeData.legalAddress || 'Lima, Perú',
              address_city: storeData.city || 'Lima',
              country_code: 'PE',
              phone_number: cleanPhone,
            }),
          });

          const customerData = await customerRes.json();
          if (customerRes.ok && customerData.id) {
            resolvedCustomerId = customerData.id;
          } else {
            // Si el cliente ya existe en Culqi, buscar su ID por email
            const searchRes = await fetch(
              `https://api.culqi.com/v2/customers?email=${encodeURIComponent(billingEmail)}`,
              {
                method: 'GET',
                headers: { Authorization: `Bearer ${culqiSecretKey}` },
              }
            );
            const searchData = await searchRes.json();
            if (searchData.data && searchData.data.length > 0 && searchData.data[0].id) {
              resolvedCustomerId = searchData.data[0].id;
            } else {
              const errMsg =
                customerData.user_message ||
                customerData.merchant_message ||
                'No pudimos registrar tu perfil en la pasarela de pagos.';
              return NextResponse.json({ error: errMsg }, { status: 400 });
            }
          }
        }

        customerId = resolvedCustomerId;

        const cardRes = await fetch('https://api.culqi.com/v2/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${culqiSecretKey}`,
          },
          body: JSON.stringify({
            customer_id: customerId,
            token_id: tokenId,
          }),
        });

        const cardData = await cardRes.json();
        if (!cardRes.ok || !cardData.id) {
          const errMsg =
            cardData.user_message ||
            cardData.merchant_message ||
            'Error al vincular tu tarjeta en Culqi.';
          return NextResponse.json({ error: errMsg }, { status: 400 });
        }

        cardId = cardData.id;
        cardLastFour = cardData.last_four || cardData.source?.last_four || '4242';
        cardBrand = cardData.iin?.card_brand || cardData.source?.iin?.card_brand || 'Visa';
      } catch (culqiErr: any) {
        console.error('Error conectando con la API de Culqi:', culqiErr);
        return NextResponse.json(
          { error: 'Error de comunicación con la pasarela de pagos. Por favor intenta nuevamente.' },
          { status: 502 }
        );
      }
    } else {
      console.log('⚡ [Culqi Dev Mock] Registrando prueba gratuita con tarjeta simulada.');
    }

    // 5. Calcular las fechas de los 30 días de prueba gratuita
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const trialEndDate = now + thirtyDaysMs;

    const targetCycle: 'mensual' | 'anual' = billingCycle === 'anual' ? 'anual' : 'mensual';
    const renewalAmount =
      targetCycle === 'anual'
        ? targetPlan === 'negocio'
          ? 219.9
          : 139.9
        : targetPlan === 'negocio'
          ? 39.9
          : 19.9;

    const updatePayload: Record<string, any> = {
      plan: targetPlan,
      subscriptionStatus: 'trial',
      billingCycle: targetCycle,
      renewalAmount,
      trialStartDate: now,
      trialEndDate,
      nextBillingDate: trialEndDate,
      cancelAtPeriodEnd: false,
      hasUsedTrial: true,
      culqiCustomerId: customerId,
      culqiCardId: cardId,
      cardLastFour,
      cardBrand,
      paymentMethodType: 'card',
      ownerEmail: storeData.ownerEmail || billingEmail,
      failedRenewalsCount: 0,
      lastPaymentError: null,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (phone && (!storeData?.whatsappPhone || storeData.whatsappPhone.trim() === '')) {
      const cleanP = phone.replace(/\D/g, '');
      updatePayload.whatsappPhone = cleanP.startsWith('51') ? cleanP : `51${cleanP}`;
    }

    await storeRef.set(updatePayload, { merge: true });

    // 6. Registrar evento en historial de suscripción
    try {
      await db.collection('subscription_events').add({
        storeId,
        ownerId: storeData.ownerId || authUser.uid,
        type: 'trial_activated',
        plan: targetPlan,
        planName,
        billingCycle: targetCycle,
        renewalAmount,
        trialStartDate: now,
        trialEndDate,
        culqiCustomerId: customerId,
        culqiCardId: cardId,
        cardLastFour,
        cardBrand,
        createdAt: now,
      });
    } catch (logErr) {
      console.warn('No se pudo registrar subscription_event:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: `¡Mes gratis activado con éxito! Tienes 30 días de ${planName} sin costo.`,
      plan: targetPlan,
      billingCycle: targetCycle,
      renewalAmount,
      trialEndDate,
      cardLastFour,
      cardBrand,
    });
  } catch (error: any) {
    console.error('Error general en /api/culqi/register-trial:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor al activar la prueba gratuita.' },
      { status: 500 }
    );
  }
}
