import { Resend } from 'resend';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

const BILLING_FROM = process.env.EMAIL_BILLING_FROM || process.env.EMAIL_FROM || 'APANA Pagos <pagos@beapana.com>';
const ADMIN_BILLING_EMAIL = process.env.ADMIN_BILLING_EMAIL || 'angelo@mivo.pe';

export interface PaymentEmailPayload {
  storeId: string;
  storeName: string;
  merchantEmail: string;
  planName: string;
  billingCycle: 'mensual' | 'anual';
  amountTotal: number; // En soles (ej. 19.90)
  chargeId: string;
  paidAt: number;
  nextBillingDate: number;
  paymentType: 'direct_charge' | 'renewal' | 'trial_conversion';
  billingDocType?: 'RUC' | 'DNI' | '';
  billingDocNumber?: string;
  billingLegalName?: string;
  billingAddress?: string;
}

function formatPen(val: number): string {
  return `S/ ${val.toFixed(2)}`;
}

function formatDatePe(ts: number): string {
  return new Date(ts).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Lima',
  });
}

function buildMerchantReceiptHtml(data: PaymentEmailPayload): string {
  const baseImponible = data.amountTotal / 1.18;
  const igv = data.amountTotal - baseImponible;
  const docLabel = data.billingDocType === 'RUC' ? 'Factura Electrónica' : 'Boleta de Venta Electrónica';
  const cycleLabel = data.billingCycle === 'anual' ? 'Anual (12 meses)' : 'Mensual (30 días)';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Constancia de Pago - APANA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; border-top: 6px solid #059669;">
          <tr>
            <td style="padding: 28px;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #059669; margin-bottom: 6px;">
                APANA • CONSTANCIA DE PAGO
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #0f172a;">
                ¡Gracias por tu pago, ${data.storeName}!
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                Confirmamos que tu suscripción de <strong>${data.planName}</strong> se encuentra activa. Aquí tienes el resumen de tu operación:
              </p>

              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Plan contratado</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${data.planName} (${cycleLabel})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Fecha de pago</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #0f172a;">${formatDatePe(data.paidAt)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Próxima renovación</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #0f172a;">${formatDatePe(data.nextBillingDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Código de operación</td>
                  <td align="right" style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #334155;">${data.chargeId}</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 10px;"></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #64748b;">Op. Gravada (Subtotal)</td>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #475569;">${formatPen(baseImponible)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #64748b;">IGV (18%)</td>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #475569;">${formatPen(igv)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0 0 0; font-size: 15px; font-weight: 800; color: #0f172a;">Total Pagado</td>
                  <td align="right" style="padding: 8px 0 0 0; font-size: 18px; font-weight: 800; color: #059669;">${formatPen(data.amountTotal)}</td>
                </tr>
              </table>

              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
                <div style="font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 4px;">
                  Comprobante electrónico SUNAT (${docLabel})
                </div>
                <div style="font-size: 12px; color: #15803d; line-height: 1.5;">
                  Tu comprobante oficial emitido por <strong>Mivo E.I.R.L.</strong> será enviado a este mismo correo dentro de las próximas 24 horas hábiles. Si necesitas emitir Factura con RUC y aún no registraste tu RUC, actualízalo en <strong>Configuración → Datos Legales</strong> de tu panel APANA.
                </div>
              </div>

              <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                APANA es una plataforma operada por Mivo E.I.R.L. • <a href="https://beapana.com/plans" style="color: #059669; text-decoration: none;">Administrar mi suscripción</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAdminSunatAlertHtml(data: PaymentEmailPayload): string {
  const baseImponible = data.amountTotal / 1.18;
  const igv = data.amountTotal - baseImponible;
  const comprobanteSugerido = data.billingDocType === 'RUC' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
  const concept = `Suscripción ${data.billingCycle === 'anual' ? 'Anual' : 'Mensual'} APANA - ${data.planName}`;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Nuevo Pago - Emitir en SUNAT SOL</title></head>
<body style="margin:0;padding:20px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-top:5px solid #d97706;border-radius:12px;padding:24px;">
    <div style="font-size:11px;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:1px;">
      ACCIÓN PENDIENTE • EMITIR EN SUNAT SOL
    </div>
    <h2 style="margin:6px 0 12px 0;font-size:19px;">Nuevo pago aprobado: ${formatPen(data.amountTotal)}</h2>
    <p style="font-size:13px;color:#475569;margin:0 0 16px 0;">
      Copia estos datos en <strong>SUNAT Operaciones en Línea (SOL)</strong> para emitir el comprobante y luego márcalo como emitido en <strong>/admin</strong>:
    </p>
    <table width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;font-size:13px;">
      <tr><td style="padding:4px 0;color:#64748b;">Comprobante:</td><td align="right" style="font-weight:800;color:#0f172a;">${comprobanteSugerido}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Tienda:</td><td align="right" style="font-weight:700;">${data.storeName}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Documento (${data.billingDocType || 'Sin DNI/RUC'}):</td><td align="right" style="font-family:monospace;font-weight:700;">${data.billingDocNumber || 'Clientes Varios (sin doc)'}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Razón Social / Nombre:</td><td align="right">${data.billingLegalName || data.storeName}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Correo cliente:</td><td align="right">${data.merchantEmail}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Descripción SUNAT:</td><td align="right">${concept}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Valor Unitario (sin IGV):</td><td align="right" style="font-family:monospace;">S/ ${baseImponible.toFixed(2)}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">IGV (18%):</td><td align="right" style="font-family:monospace;">S/ ${igv.toFixed(2)}</td></tr>
      <tr><td style="padding:6px 0 0 0;font-weight:800;">Total con IGV:</td><td align="right" style="font-weight:800;color:#059669;">${formatPen(data.amountTotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Culqi Charge ID:</td><td align="right" style="font-family:monospace;font-size:11px;">${data.chargeId}</td></tr>
    </table>
    <p style="margin:16px 0 0 0;font-size:12px;color:#64748b;">
      <a href="https://beapana.com/admin" style="color:#059669;font-weight:700;">Ir al Panel Admin de APANA →</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * Envía en paralelo:
 * 1) Constancia de pago al comerciante.
 * 2) Alerta interna a Mivo E.I.R.L. con los datos listos para emitir en SUNAT SOL.
 */
export async function sendPaymentConfirmationEmails(data: PaymentEmailPayload): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[payment-email] RESEND_API_KEY no configurada; se omite envío de constancia de pago.');
    return;
  }

  const tasks: Promise<unknown>[] = [];

  if (data.merchantEmail && data.merchantEmail.includes('@')) {
    tasks.push(
      resend.emails
        .send({
          from: BILLING_FROM,
          to: data.merchantEmail,
          subject: `Constancia de pago APANA - ${data.planName} (${formatPen(data.amountTotal)})`,
          html: buildMerchantReceiptHtml(data),
        })
        .catch((err) => console.warn('[payment-email] Error enviando constancia al comerciante:', err))
    );
  }

  if (ADMIN_BILLING_EMAIL && ADMIN_BILLING_EMAIL.includes('@')) {
    tasks.push(
      resend.emails
        .send({
          from: BILLING_FROM,
          to: ADMIN_BILLING_EMAIL,
          subject: `[Emitir SUNAT] Pago ${formatPen(data.amountTotal)} - ${data.storeName}`,
          html: buildAdminSunatAlertHtml(data),
        })
        .catch((err) => console.warn('[payment-email] Error enviando alerta SUNAT al admin:', err))
    );
  }

  await Promise.allSettled(tasks);
}
