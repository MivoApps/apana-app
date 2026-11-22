import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { verifyFirebaseAuth, isConfiguredCulqiKey } from '@/lib/firebase/verify-auth';
import { sendPaymentConfirmationEmails } from '@/lib/email/payment-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAN_PRICES_CENTS: Record<'emprendedor' | 'negocio', Record<'mensual' | 'anual', number>> = {
  emprendedor: {
    mensual: 1990,
    anual: 13990,
  },
  negocio: {
    mensual: 3990,
    anual: 21990,
  },
};

export async function POST(request: Request) {
  try {
    // 1. Verificar sesión autenticada del comerciante
    const authUser = await verifyFirebaseAuth(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Sesión no válida o expirada. Inicia sesión nuevamente para completar el pago.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tokenId, storeId, email, plan = 'emprendedor', billingCycle = 'mensual' } = body;

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
        { error: 'No tienes permisos para realizar pagos en esta tienda.' },
        { status: 403 }
      );
    }

    // 3. Calcular monto estrictamente en el servidor (nunca confiar en el monto del cliente)
    const targetPlan: 'emprendedor' | 'negocio' = plan === 'negocio' ? 'negocio' : 'emprendedor';
    const targetCycle: 'mensual' | 'anual' = billingCycle === 'anual' ? 'anual' : 'mensual';
    const planName = targetPlan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor';
    const finalAmount = PLAN_PRICES_CENTS[targetPlan][targetCycle];
    const billingEmail = (email || authUser.email || storeData.ownerEmail || 'cliente@beapana.com').trim();

    const culqiSecretKey = process.env.CULQI_SECRET_KEY || '';
    const isRealCulqiKey = isConfiguredCulqiKey(culqiSecretKey);
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isRealCulqiKey && isProduction) {
      console.error('[/api/culqi/charge] CULQI_SECRET_KEY no está configurada en producción.');
      return NextResponse.json(
        { error: 'La pasarela de pagos no está configurada en este momento. Por favor contacta a soporte.' },
        { status: 503 }
      );
    }

    let chargeResult: any = null;
    let savedCustomerId: string | null = storeData.culqiCustomerId || null;
    let savedCardId: string | null = storeData.culqiCardId || null;
    let savedCardBrand: string | null = storeData.cardBrand || null;
    let savedCardLastFour: string | null = storeData.cardLastFour || null;
    let paymentMethodType: 'card' | 'yape' | 'other' = 'card';

    const isYapeToken = typeof tokenId === 'string' && tokenId.startsWith('ype_');
    if (isYapeToken) {
      paymentMethodType = 'yape';
    }

    // 4. Procesar cobro en Culqi
    if (isRealCulqiKey) {
      let chargeSourceId = tokenId;

      // Si es pago con tarjeta (no Yape), crear Customer + Card para habilitar renovación automática
      if (!isYapeToken) {
        try {
          let customerId = savedCustomerId;

          if (!customerId) {
            const rawName = (storeData.ownerName || storeData.name || 'Comerciante APANA').trim();
            const nameParts = rawName.split(' ');
            const firstName = nameParts[0] || 'Comerciante';
            const lastName = nameParts.slice(1).join(' ') || 'APANA';
            const rawPhone = (storeData.whatsappPhone || '999999999').replace(/\D/g, '').slice(-9) || '999999999';

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
                phone_number: rawPhone,
              }),
            });

            const customerData = await customerRes.json();
            if (customerRes.ok && customerData.id) {
              customerId = customerData.id;
            } else {
              // Buscar cliente existente por email si ya estaba registrado en Culqi
              const searchRes = await fetch(
                `https://api.culqi.com/v2/customers?email=${encodeURIComponent(billingEmail)}`,
                {
                  method: 'GET',
                  headers: { Authorization: `Bearer ${culqiSecretKey}` },
                }
              );
              const searchData = await searchRes.json();
              if (searchData.data && searchData.data.length > 0 && searchData.data[0].id) {
                customerId = searchData.data[0].id;
              }
            }
          }

          if (customerId) {
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
            if (cardRes.ok && cardData.id) {
              savedCustomerId = customerId;
              savedCardId = cardData.id;
              savedCardLastFour = cardData.last_four || cardData.source?.last_four || savedCardLastFour;
              savedCardBrand = cardData.iin?.card_brand || cardData.source?.iin?.card_brand || savedCardBrand;
              chargeSourceId = cardData.id;
            } else {
              console.warn('[/api/culqi/charge] No se pudo guardar tarjeta para recurrencia, se cobrará con token directo:', cardData);
            }
          }
        } catch (vaultErr) {
          console.warn('[/api/culqi/charge] Error opcional guardando tarjeta en bóveda Culqi:', vaultErr);
        }
      }

      const culqiChargeBody: Record<string, any> = {
        amount: finalAmount,
        currency_code: 'PEN',
        email: billingEmail,
        source_id: chargeSourceId,
        description: `Suscripción ${targetCycle === 'anual' ? 'Anual' : 'Mensual'} APANA - ${planName}`,
        metadata: {
          storeId,
          plan: targetPlan,
          billingCycle: targetCycle,
        },
      };

      if (savedCustomerId && chargeSourceId === savedCardId) {
        culqiChargeBody.customer_id = savedCustomerId;
      }

      const culqiResponse = await fetch('https://api.culqi.com/v2/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${culqiSecretKey}`,
        },
        body: JSON.stringify(culqiChargeBody),
      });

      chargeResult = await culqiResponse.json();

      if (!culqiResponse.ok || !chargeResult.id) {
        return NextResponse.json(
          {
            error:
              chargeResult.user_message ||
              chargeResult.merchant_message ||
              'Error al procesar el pago con Culqi.',
          },
          { status: 400 }
        );
      }

      if (chargeResult.source?.iin?.card_brand) {
        savedCardBrand = chargeResult.source.iin.card_brand;
      }
      if (chargeResult.source?.last_four) {
        savedCardLastFour = chargeResult.source.last_four;
      }
    } else {
      // Modo Mock permitido únicamente en desarrollo local
      chargeResult = {
        id: `chr_dev_mock_${Date.now()}`,
        outcome: { type: 'venta_exitosa' },
        amount: finalAmount,
      };
    }

    // 5. Calcular periodo de vigencia (365 días anual, 30 días mensual)
    const now = Date.now();
    const durationMs =
      targetCycle === 'anual'
        ? 365 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;
    const nextBillingDate = now + durationMs;

    // 6. Actualizar la tienda en Firestore usando Admin SDK
    const storeUpdatePayload: Record<string, any> = {
      plan: targetPlan,
      subscriptionStatus: 'active',
      billingCycle: targetCycle,
      renewalAmount: finalAmount / 100,
      cancelAtPeriodEnd: false,
      subscriptionStartDate: now,
      nextBillingDate,
      lastPaymentDate: now,
      lastPaymentAmount: finalAmount / 100,
      lastCulqiChargeId: chargeResult.id,
      lastChargeId: chargeResult.id,
      paymentMethodType,
      failedRenewalsCount: 0,
      lastPaymentError: null,
      downgradedAt: null,
      dataRetentionUntil: null,
      ownerEmail: storeData.ownerEmail || billingEmail,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (savedCustomerId) storeUpdatePayload.culqiCustomerId = savedCustomerId;
    if (savedCardId) storeUpdatePayload.culqiCardId = savedCardId;
    if (savedCardBrand) storeUpdatePayload.cardBrand = savedCardBrand;
    if (savedCardLastFour) storeUpdatePayload.cardLastFour = savedCardLastFour;

    await storeRef.set(storeUpdatePayload, { merge: true });

    // 7. Guardar registro oficial en payment_records (con datos fiscales para SUNAT SOL)
    const billingDocType = (storeData.legalTaxIdType === 'RUC' || storeData.legalTaxIdType === 'DNI')
      ? storeData.legalTaxIdType
      : '';
    const billingDocNumber = storeData.legalTaxId || '';
    const billingLegalName = storeData.legalBusinessName || storeData.ownerName || storeData.name || 'Tienda';
    const billingAddress = storeData.legalAddress || '';

    try {
      await db.collection('payment_records').add({
        storeId,
        ownerId: storeData.ownerId || authUser.uid,
        storeName: storeData.name || 'Tienda',
        amount: finalAmount / 100,
        currency: 'PEN',
        email: billingEmail,
        culqiChargeId: chargeResult.id,
        paymentMethodType,
        status: 'approved',
        type: 'direct_charge',
        plan: targetPlan,
        planName,
        billingCycle: targetCycle,
        billingDocType,
        billingDocNumber,
        billingLegalName,
        billingAddress,
        invoiceStatus: 'pending_sunat',
        createdAt: now,
      });
    } catch (e) {
      console.warn('No se pudo crear payment_record:', e);
    }

    // 8. Enviar constancia de pago al comerciante y alerta de emisión SUNAT al admin
    await sendPaymentConfirmationEmails({
      storeId,
      storeName: storeData.name || 'Tienda',
      merchantEmail: billingEmail,
      planName,
      billingCycle: targetCycle,
      amountTotal: finalAmount / 100,
      chargeId: chargeResult.id,
      paidAt: now,
      nextBillingDate,
      paymentType: 'direct_charge',
      billingDocType,
      billingDocNumber,
      billingLegalName,
      billingAddress,
    }).catch((mailErr) => console.warn('Aviso enviando correos de pago:', mailErr));

    // 9. Registrar evento en subscription_events
    try {
      await db.collection('subscription_events').add({
        storeId,
        ownerId: storeData.ownerId || authUser.uid,
        type: 'subscription_paid',
        plan: targetPlan,
        planName,
        billingCycle: targetCycle,
        amount: finalAmount / 100,
        chargeId: chargeResult.id,
        paymentMethodType,
        createdAt: now,
      });
    } catch (e) {
      console.warn('No se pudo crear subscription_event:', e);
    }

    return NextResponse.json({
      success: true,
      chargeId: chargeResult.id,
      nextBillingDate,
      billingCycle: targetCycle,
      amount: finalAmount / 100,
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
