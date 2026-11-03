import { NextResponse } from 'next/server';
import { sendClaimEmails } from '@/lib/email/claim-email';
import { IndecopiClaimData } from '@/components/ui/IndecopiClaimSheet';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { claim, merchantEmail, storeSlug } = body as {
      claim: IndecopiClaimData;
      merchantEmail?: string;
      storeSlug?: string;
    };

    if (!claim || !claim.email || !claim.claimCode) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios del reclamo o correo del consumidor.' },
        { status: 400 }
      );
    }

    const result = await sendClaimEmails({
      claim,
      merchantEmail,
      storeSlug,
    });

    return NextResponse.json({
      success: result.success,
      consumerEmailSent: result.consumerEmailSent,
      merchantEmailSent: result.merchantEmailSent,
      simulated: result.simulated ?? false,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error en /api/legal/claims/notify:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error procesando envío de correos.' },
      { status: 500 }
    );
  }
}
