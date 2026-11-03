import { NextResponse } from 'next/server';
import { sendClaimResolutionEmail } from '@/lib/email/claim-email';
import { IndecopiClaimData } from '@/components/ui/IndecopiClaimSheet';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { claim, responseNotes } = body as {
      claim: IndecopiClaimData;
      responseNotes: string;
    };

    if (!claim || !claim.email || !claim.claimCode) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios del reclamo o correo del consumidor.' },
        { status: 400 }
      );
    }

    if (!responseNotes || !responseNotes.trim()) {
      return NextResponse.json(
        { success: false, error: 'Debe incluir una respuesta formal o detalle de acciones tomadas.' },
        { status: 400 }
      );
    }

    const result = await sendClaimResolutionEmail({
      claim,
      responseNotes: responseNotes.trim(),
    });

    return NextResponse.json({
      success: result.success,
      simulated: result.simulated ?? false,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error en /api/legal/claims/respond:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error procesando respuesta formal por correo.' },
      { status: 500 }
    );
  }
}
