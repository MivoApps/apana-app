import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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
    const body: RegisterTrialBody = await request.json();
    const { tokenId, storeId, plan = 'emprendedor', billingCycle = 'mensual', email, customerName, phone } = body;

    if (!tokenId || !storeId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (tokenId, storeId).' },
        { status: 400 }
      );
    }

    const targetPlan = plan === 'negocio' ? 'negocio' : 'emprendedor';
    const planName = targetPlan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor';
    const culqiSecretKey = process.env.CULQI_SECRET_KEY || '';

    let customerId = `cus_test_${Date.now()}`;
    let cardId = `crd_test_${Date.now()}`;
    let cardBrand = 'Visa';
    let cardLastFour = '4242';

    // 1. Si hay una llave secreta real de Culqi configurada, llamar a las APIs oficiales de Culqi
    const isRealCulqiKey = culqiSecretKey && !culqiSecretKey.includes('xxxxxxxx') && !culqiSecretKey.includes('demo');

    if (isRealCulqiKey) {
      try {
        // A. Crear o registrar Customer en Culqi
        const nameParts = (customerName || 'Comerciante APANA').trim().split(' ');
        const firstName = nameParts[0] || 'Comerciante';
        const lastName = nameParts.slice(1).join(' ') || 'APANA';

        const customerRes = await fetch('https://api.culqi.com/v2/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${culqiSecretKey}`,
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email || 'comerciante@apana.pe',
            address: 'Lima, Perú',
            address_city: 'Lima',
            country_code: 'PE',
            phone_number: (phone || '999999999').replace(/\D/g, '').slice(-9),
          }),
        });

        const customerData = await customerRes.json();
        if (!customerRes.ok) {
          console.warn('Culqi Customer Creation Response:', customerData);
          // Si el cliente ya existe en Culqi, buscar su id por email para reutilizarlo
          try {
            const searchEmail = email || 'comerciante@apana.pe';
            const searchRes = await fetch(`https://api.culqi.com/v2/customers?email=${encodeURIComponent(searchEmail)}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${culqiSecretKey}`,
              },
            });
            const searchData = await searchRes.json();
            if (searchData.data && searchData.data.length > 0 && searchData.data[0].id) {
              customerId = searchData.data[0].id;
            }
          } catch (searchErr) {
            console.warn('Error buscando cliente existente en Culqi:', searchErr);
          }
        } else if (customerData.id) {
          customerId = customerData.id;
        }

        // B. Asociar la Tarjeta (Card) al Customer en Culqi con el tokenId
        const cardRes = await fetch('https://api.culqi.com/v2/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${culqiSecretKey}`,
          },
          body: JSON.stringify({
            customer_id: customerId,
            token_id: tokenId,
          }),
        });

        const cardData = await cardRes.json();
        if (!cardRes.ok) {
          const errMsg = cardData.user_message || cardData.merchant_message || 'Error al vincular tu tarjeta en Culqi.';
          return NextResponse.json({ error: errMsg }, { status: 400 });
        }

        if (cardData.id) {
          cardId = cardData.id;
          cardLastFour = cardData.last_four || cardData.source?.last_four || '4242';
          cardBrand = cardData.iin?.card_brand || cardData.source?.iin?.card_brand || 'Visa';
        }
      } catch (culqiErr: any) {
        console.error('Error conectando con la API de Culqi:', culqiErr);
        return NextResponse.json(
          { error: 'Error de comunicación con la pasarela de pagos. Por favor intenta nuevamente.' },
          { status: 502 }
        );
      }
    } else {
      console.log('⚡ [Culqi Sandbox Mock] Registrando prueba gratuita con tarjeta simulada.');
    }

    // 2. Calcular las fechas de los 30 días de prueba gratuita
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const trialEndDate = now + thirtyDaysMs;

    // 3. Actualizar la tienda en Firestore
    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);

    if (!storeSnap.exists()) {
      return NextResponse.json(
        { error: 'La tienda no existe en el sistema.' },
        { status: 404 }
      );
    }

    const targetCycle = billingCycle === 'anual' ? 'anual' : 'mensual';
    const renewalAmount = targetCycle === 'anual'
      ? (targetPlan === 'negocio' ? 219.90 : 139.90)
      : (targetPlan === 'negocio' ? 39.90 : 19.90);

    const storeData = storeSnap.data();
    const updatePayload: Record<string, any> = {
      plan: targetPlan,
      subscriptionStatus: 'trial',
      billingCycle: targetCycle,
      renewalAmount,
      trialStartDate: now,
      trialEndDate: trialEndDate,
      nextBillingDate: trialEndDate,
      cancelAtPeriodEnd: false,
      hasUsedTrial: true,
      culqiCustomerId: customerId,
      culqiCardId: cardId,
      cardLastFour: cardLastFour,
      cardBrand: cardBrand,
      updatedAt: serverTimestamp(),
    };

    if (phone && (!storeData?.whatsappPhone || storeData.whatsappPhone.trim() === '')) {
      const cleanP = phone.replace(/\D/g, '');
      updatePayload.whatsappPhone = cleanP.startsWith('51') ? cleanP : `51${cleanP}`;
    }

    await updateDoc(storeRef, updatePayload);

    // 4. Registrar evento en historial de suscripción
    try {
      await addDoc(collection(db, 'subscription_events'), {
        storeId,
        type: 'trial_activated',
        plan: targetPlan,
        planName,
        billingCycle: targetCycle,
        renewalAmount,
        trialStartDate: now,
        trialEndDate: trialEndDate,
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
