import { Resend } from 'resend';
import { IndecopiClaimData } from '@/components/ui/IndecopiClaimSheet';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

const DEFAULT_FROM = process.env.EMAIL_FROM || 'Libro de Reclamaciones <reclamos@beapana.com>';

/**
 * Estilos globales y meta tags para compatibilidad total con Dark Mode en Gmail (Android/iOS), Apple Mail y Outlook.
 * Evita gradientes CSS que causan texto oscuro sobre fondo oscuro en clientes móviles.
 */
const EMAIL_DARK_MODE_STYLES = `
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    @media (prefers-color-scheme: dark) {
      body, .bg-body { background-color: #090d16 !important; }
      .bg-card { background-color: #131c2e !important; border-color: #24324d !important; }
      .bg-subcard { background-color: #0b1120 !important; border-color: #24324d !important; }
      .text-heading { color: #ffffff !important; }
      .text-body { color: #e2e8f0 !important; }
      .text-muted { color: #94a3b8 !important; }
      .border-line { border-color: #24324d !important; }
      .box-success { background-color: #062e22 !important; border-color: #059669 !important; color: #a7f3d0 !important; }
      .box-warning { background-color: #3b2207 !important; border-color: #d97706 !important; color: #fde68a !important; }
    }
  </style>
`;

/**
 * Genera el HTML de la Hoja de Reclamación Virtual Oficial conforme al D.S. 011-2011-PCM
 * Diseño institucional optimizado para lectura en cualquier dispositivo y modo oscuro.
 */
export function generateConsumerClaimEmailHtml(claim: IndecopiClaimData): string {
  const dateObj = new Date(claim.createdAt || Date.now());
  const dateFormatted = dateObj.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeFormatted = dateObj.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isReclamo = claim.claimType === 'reclamo';
  const claimTypeBadge = isReclamo ? 'RECLAMO' : 'QUEJA';
  const badgeBg = isReclamo ? '#fef3c7' : '#dcfce7';
  const badgeColor = isReclamo ? '#92400e' : '#166534';
  const badgeBorder = isReclamo ? '#fde68a' : '#bbf7d0';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hoja de Reclamación N° ${claim.claimCode}</title>
  ${EMAIL_DARK_MODE_STYLES}
</head>
<body class="bg-body" style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="bg-body" style="background-color: #f1f5f9; padding: 20px 10px;">
    <tr>
      <td align="center">
        <!-- Tarjeta Principal con borde superior esmeralda -->
        <table role="presentation" width="100%" class="bg-card" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; border-top: 6px solid #059669; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
          
          <!-- Encabezado Institucional en Fondo Claro (Resistente a inversión de Gmail Dark Mode) -->
          <tr>
            <td style="padding: 24px 28px 18px 28px; background-color: #ffffff;" class="bg-card">
              <table role="presentation" width="100%">
                <tr>
                  <td style="vertical-align: top;">
                    <div class="text-heading" style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; margin-bottom: 2px;">
                      ${claim.storeName}
                    </div>
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #059669;">
                      LIBRO DE RECLAMACIONES VIRTUAL
                    </div>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="display: inline-block; padding: 5px 12px; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-weight: 800; font-size: 11px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${claimTypeBadge}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Caja del Código Correlativo Oficial -->
              <table role="presentation" width="100%" class="bg-subcard border-line" style="margin-top: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td>
                    <div class="text-muted" style="font-size: 10px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">
                      CÓDIGO OFICIAL DE ATENCIÓN
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #059669; font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; letter-spacing: 0.5px;">
                      ${claim.claimCode}
                    </div>
                    <div class="text-muted" style="font-size: 11px; color: #64748b; margin-top: 4px;">
                      Fecha y Hora: <strong class="text-heading" style="color: #0f172a;">${dateFormatted} • ${timeFormatted}</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Aviso Legal de Recepción con Plazo de 15 Días -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table role="presentation" width="100%" class="box-success" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; border-radius: 10px; padding: 12px 16px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
                      <strong>✓ Constancia fehaciente de recepción:</strong> Conforme al D.S. 011-2011-PCM y la Ley N° 29571, el proveedor tiene un plazo legal improrrogable de <strong>quince (15) días hábiles</strong> para emitir respuesta formal por escrito.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido Principal con Tablas Institucionales -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              
              <!-- 1. Proveedor -->
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin: 0 0 8px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;" class="border-line">
                1. Identificación del Proveedor / Establecimiento
              </div>
              <table role="presentation" width="100%" style="font-size: 13px; margin-bottom: 18px; line-height: 1.6;">
                <tr>
                  <td width="35%" class="text-muted" style="color: #64748b; padding: 3px 0;">Establecimiento:</td>
                  <td class="text-heading" style="color: #0f172a; font-weight: 700;">${claim.storeName}</td>
                </tr>
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0;">Razón Social / Titular:</td>
                  <td class="text-heading" style="color: #0f172a; font-weight: 600;">${claim.storeLegalName || claim.storeName}</td>
                </tr>
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0;">${claim.storeTaxIdType || 'RUC / DNI'}:</td>
                  <td class="text-heading" style="color: #0f172a; font-family: monospace; font-weight: 700;">${claim.storeTaxId || 'Comercio Digital'}</td>
                </tr>
                ${claim.storeAddress ? `
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0;">Domicilio Fiscal / Local:</td>
                  <td class="text-body" style="color: #334155;">${claim.storeAddress}</td>
                </tr>` : ''}
              </table>

              <!-- 2. Consumidor Reclamante -->
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin: 0 0 8px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;" class="border-line">
                2. Identificación del Consumidor Reclamante
              </div>
              <table role="presentation" width="100%" style="font-size: 13px; margin-bottom: 18px; line-height: 1.6;">
                <tr>
                  <td width="35%" class="text-muted" style="color: #64748b; padding: 3px 0;">Nombre Completo:</td>
                  <td class="text-heading" style="color: #0f172a; font-weight: 700;">${claim.fullName}</td>
                </tr>
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0;">${claim.docType}:</td>
                  <td class="text-heading" style="color: #0f172a; font-family: monospace; font-weight: 700;">${claim.docNumber}</td>
                </tr>
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0;">Teléfono / WhatsApp:</td>
                  <td class="text-body" style="color: #334155;">${claim.phone}</td>
                </tr>
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0;">Correo Electrónico:</td>
                  <td class="text-heading" style="color: #059669; font-weight: 700;">${claim.email}</td>
                </tr>
                ${claim.address ? `
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0;">Domicilio:</td>
                  <td class="text-body" style="color: #334155;">${claim.address}${claim.city ? ` (${claim.city})` : ''}</td>
                </tr>` : ''}
                ${claim.isMinor && claim.parentName ? `
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0;">Padre / Madre / Tutor:</td>
                  <td class="text-body" style="color: #334155;">${claim.parentName}</td>
                </tr>` : ''}
              </table>

              <!-- 3. Bien Contratado -->
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin: 0 0 8px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;" class="border-line">
                3. Identificación del Bien Contratado
              </div>
              <table role="presentation" width="100%" style="font-size: 13px; margin-bottom: 18px; line-height: 1.6;">
                <tr>
                  <td width="35%" class="text-muted" style="color: #64748b; padding: 3px 0;">Tipo de Contratación:</td>
                  <td class="text-heading" style="color: #0f172a; font-weight: 700; text-transform: capitalize;">${claim.contractType}</td>
                </tr>
                ${claim.amount ? `
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0;">Monto Reclamado:</td>
                  <td class="text-heading" style="color: #0f172a; font-weight: 700;">S/ ${claim.amount}</td>
                </tr>` : ''}
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 3px 0; vertical-align: top;">Descripción:</td>
                  <td class="text-body bg-subcard border-line" style="color: #0f172a; background-color: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    ${claim.goodDescription}
                  </td>
                </tr>
              </table>

              <!-- 4. Detalle y Pedido -->
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin: 0 0 8px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;" class="border-line">
                4. Detalle de la Reclamación y Pedido
              </div>
              
              <div style="margin-bottom: 14px;">
                <span class="text-muted" style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px;">
                  Detalle de los Hechos (${claimTypeBadge}):
                </span>
                <div class="bg-subcard text-body border-line" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${isReclamo ? '#d97706' : '#059669'}; padding: 12px 14px; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${claim.detail}</div>
              </div>

              <div style="margin-bottom: 20px;">
                <span class="text-muted" style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px;">
                  Pedido Concreto del Consumidor:
                </span>
                <div class="bg-subcard text-body border-line" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #059669; padding: 12px 14px; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #064e3b; font-weight: 600; white-space: pre-wrap;">${claim.consumerRequest}</div>
              </div>

              <!-- Base Legal y Plazo -->
              <div class="bg-subcard border-line" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 11px; color: #64748b; line-height: 1.5;">
                <strong class="text-heading" style="color: #0f172a;">Aviso Legal:</strong> Conforme al artículo 24° de la Ley N° 29571 y el D.S. 011-2011-PCM, el proveedor debe dar respuesta por escrito al consumidor en un plazo no mayor a quince (15) días hábiles mediante el correo electrónico consignado. Conserve este correo como constancia válida.
              </div>

            </td>
          </tr>

          <!-- Footer Institucional -->
          <tr>
            <td class="bg-subcard border-line" style="padding: 18px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p class="text-muted" style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                Infraestructura provista por <strong>APANA (beapana.com)</strong>.
              </p>
              <p class="text-muted" style="margin: 0; font-size: 10px; color: #94a3b8;">
                Conforme al Reglamento del Libro de Reclamaciones del Código de Protección y Defensa del Consumidor.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Genera el HTML de la Alerta de Notificación para el Comerciante (dueño de la tienda)
 * Con diseño limpio y contraste asegurado en Dark Mode.
 */
export function generateMerchantClaimEmailHtml(claim: IndecopiClaimData, dashboardUrl: string): string {
  const isReclamo = claim.claimType === 'reclamo';
  const typeLabel = isReclamo ? 'RECLAMO' : 'QUEJA';
  const typeColor = isReclamo ? '#b45309' : '#047857';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo ${typeLabel} Registrado - ${claim.storeName}</title>
  ${EMAIL_DARK_MODE_STYLES}
</head>
<body class="bg-body" style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="bg-body" style="background-color: #f1f5f9; padding: 20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" class="bg-card" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; border-top: 6px solid #d97706; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
          
          <!-- Encabezado Alerta -->
          <tr>
            <td style="padding: 24px 28px 16px 28px; background-color: #ffffff;" class="bg-card">
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #d97706; display: block; margin-bottom: 4px;">
                ALERTA OFICIAL • LIBRO DE RECLAMACIONES
              </span>
              <div class="text-heading" style="font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 4px;">
                Nuevo ${typeLabel} Registrado: ${claim.claimCode}
              </div>
              <p class="text-muted" style="margin: 0; font-size: 13px; color: #64748b;">
                Tienda: <strong class="text-heading" style="color: #0f172a;">${claim.storeName}</strong>
              </p>
            </td>
          </tr>

          <!-- Alerta Plazo 15 Días -->
          <tr>
            <td style="padding: 0 28px 18px 28px;">
              <table role="presentation" width="100%" class="box-warning" style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 10px; padding: 12px 16px;">
                <tr>
                  <td width="26" style="vertical-align: top; font-size: 18px;">⏱️</td>
                  <td style="font-size: 13px; color: #92400e; line-height: 1.5;">
                    <strong>Plazo Legal de 15 días hábiles:</strong> Según INDECOPI (Ley N° 29571), debes atender y emitir respuesta formal por escrito a este ${typeLabel.toLowerCase()} dentro del plazo legal.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Resumen del Reclamo -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <div class="text-heading" style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 0 0 10px 0;">
                Datos del Consumidor Reclamante:
              </div>

              <div class="bg-subcard text-body border-line" style="background-color: #f8fafc; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6;">
                <div><strong>Nombre:</strong> ${claim.fullName}</div>
                <div><strong>Documento:</strong> ${claim.docType} ${claim.docNumber}</div>
                <div><strong>WhatsApp:</strong> <a href="https://wa.me/${claim.phone.replace(/\D/g, '')}" style="color: #059669; font-weight: 700; text-decoration: none;">${claim.phone}</a></div>
                <div><strong>Email:</strong> <a href="mailto:${claim.email}" style="color: #059669; font-weight: 700; text-decoration: none;">${claim.email}</a></div>
              </div>

              <div class="text-heading" style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 0 0 10px 0;">
                Resumen de los Hechos:
              </div>

              <div class="bg-subcard text-body border-line" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${typeColor}; padding: 12px 14px; border-radius: 8px; font-size: 13px; line-height: 1.5; color: #1e293b; margin-bottom: 12px;">
                <strong>Bien:</strong> ${claim.contractType.toUpperCase()} ${claim.amount ? `(S/ ${claim.amount})` : ''}<br>
                <strong>Descripción:</strong> ${claim.goodDescription}
              </div>

              <div class="bg-subcard text-body border-line" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #64748b; padding: 12px 14px; border-radius: 8px; font-size: 13px; line-height: 1.5; color: #1e293b; margin-bottom: 22px;">
                <strong>Pedido del Cliente:</strong><br>
                ${claim.consumerRequest}
              </div>

              <!-- Botón Acción Principal -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 13px 26px; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; border-radius: 10px; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);">
                      Ver y Responder en mi Panel de Reclamos ➔
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="bg-subcard border-line" style="padding: 16px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
              Notificación oficial generada para el comercio <strong>${claim.storeName}</strong> vía APANA.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Genera el HTML de la Respuesta Oficial de la Tienda al Consumidor (Resolución Formal INDECOPI)
 */
export function generateClaimResponseEmailHtml({
  claim,
  responseNotes,
}: {
  claim: IndecopiClaimData;
  responseNotes: string;
}): string {
  const isReclamo = claim.claimType === 'reclamo';
  const typeLabel = isReclamo ? 'Reclamo' : 'Queja';
  const dateFormatted = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Respuesta Oficial a su ${typeLabel} N° ${claim.claimCode}</title>
  ${EMAIL_DARK_MODE_STYLES}
</head>
<body class="bg-body" style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="bg-body" style="background-color: #f1f5f9; padding: 20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" class="bg-card" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; border-top: 6px solid #059669; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
          
          <!-- Encabezado -->
          <tr>
            <td style="padding: 24px 28px 18px 28px; background-color: #ffffff;" class="bg-card">
              <table role="presentation" width="100%">
                <tr>
                  <td style="vertical-align: top;">
                    <div class="text-heading" style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
                      ${claim.storeName}
                    </div>
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #059669;">
                      LIBRO DE RECLAMACIONES VIRTUAL • RESPUESTA OFICIAL
                    </div>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="display: inline-block; padding: 5px 12px; background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; font-weight: 800; font-size: 11px; border-radius: 9999px; text-transform: uppercase;">
                      ATENDIDO
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Caja del Código Correlativo -->
              <table role="presentation" width="100%" class="bg-subcard border-line" style="margin-top: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td>
                    <div class="text-muted" style="font-size: 10px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">
                      RESPUESTA FORMAL A LA HOJA N°
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #059669; font-family: monospace;">
                      ${claim.claimCode}
                    </div>
                    <div class="text-muted" style="font-size: 11px; color: #64748b; margin-top: 4px;">
                      Fecha de Respuesta: <strong class="text-heading" style="color: #0f172a;">${dateFormatted}</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Saludo y Mensaje -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <p class="text-body" style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
                Estimado(a) <strong class="text-heading" style="color: #0f172a;">${claim.fullName}</strong>:
              </p>
              <p class="text-body" style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0 0 18px 0;">
                En cumplimiento del artículo 24° de la Ley N° 29571 (Código de Protección y Defensa del Consumidor) y el D.S. 011-2011-PCM, <strong>${claim.storeName}</strong> le hace llegar la respuesta formal y las medidas adoptadas respecto a su disconformidad:
              </p>

              <!-- Caja Destacada de Resolución -->
              <div class="bg-subcard border-line" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; border-radius: 10px; padding: 16px 18px; margin-bottom: 22px;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #166534; margin-bottom: 8px;">
                  ACCIONES TOMADAS Y RESPUESTA DEL ESTABLECIMIENTO:
                </div>
                <div class="text-heading" style="font-size: 13px; line-height: 1.6; color: #0f172a; white-space: pre-wrap; font-weight: 500;">${responseNotes}</div>
              </div>

              <!-- Resumen de los Hechos Originales -->
              <div class="text-heading" style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #059669; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;" class="border-line">
                Resumen de su Reclamación Original
              </div>
              <table role="presentation" width="100%" style="font-size: 12px; margin-bottom: 18px; line-height: 1.6;">
                <tr>
                  <td width="35%" class="text-muted" style="color: #64748b; padding: 2px 0;">Bien Contratado:</td>
                  <td class="text-heading" style="color: #0f172a; font-weight: 600;">${claim.goodDescription}</td>
                </tr>
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 2px 0; vertical-align: top;">Su Detalle:</td>
                  <td class="text-body" style="color: #334155;">${claim.detail}</td>
                </tr>
                <tr>
                  <td class="text-muted" style="color: #64748b; padding: 2px 0; vertical-align: top;">Su Pedido:</td>
                  <td class="text-body" style="color: #334155; font-weight: 600;">${claim.consumerRequest}</td>
                </tr>
              </table>

              <!-- Conclusión Legal -->
              <div class="bg-subcard border-line" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 11px; color: #64748b; line-height: 1.5;">
                La presente comunicación constituye la respuesta formal por escrito requerida por la normativa vigente de protección al consumidor. Agradecemos su comunicación, la cual nos ayuda a mejorar continuamente nuestros productos y servicios.
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="bg-subcard border-line" style="padding: 16px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
              Establecimiento: <strong>${claim.storeName}</strong> • Infraestructura provista por <strong>APANA (beapana.com)</strong>.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Función principal para despachar ambos correos iniciales de registro de reclamo
 */
export async function sendClaimEmails({
  claim,
  merchantEmail,
  storeSlug,
}: {
  claim: IndecopiClaimData;
  merchantEmail?: string;
  storeSlug?: string;
}): Promise<{
  success: boolean;
  consumerEmailSent: boolean;
  merchantEmailSent: boolean;
  simulated?: boolean;
  error?: string;
}> {
  const resend = getResendClient();
  const consumerHtml = generateConsumerClaimEmailHtml(claim);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beapana.com';
  const dashboardClaimsUrl = `${siteUrl}/claims`;
  const merchantHtml = generateMerchantClaimEmailHtml(claim, dashboardClaimsUrl);

  if (!resend) {
    console.log('\n========================================================');
    console.log(`[EMAIL SIMULADO] RESEND_API_KEY no detectada. Modo seguro activo.`);
    console.log(`✓ Correo 1 (Consumidor): ${claim.email}`);
    console.log(`  Asunto: Constancia de Reclamación N° ${claim.claimCode} - ${claim.storeName}`);
    if (merchantEmail) {
      console.log(`✓ Correo 2 (Comerciante): ${merchantEmail}`);
      console.log(`  Asunto: ⚠️ Nuevo Reclamo N° ${claim.claimCode} - ${claim.storeName}`);
    }
    console.log('========================================================\n');
    return {
      success: true,
      consumerEmailSent: true,
      merchantEmailSent: Boolean(merchantEmail),
      simulated: true,
    };
  }

  let consumerEmailSent = false;
  let merchantEmailSent = false;
  let lastError = '';

  // 1. Enviar correo al consumidor reclamante
  try {
    const isReclamo = claim.claimType === 'reclamo';
    const typeLabel = isReclamo ? 'Reclamo' : 'Queja';
    const consumerRes = await resend.emails.send({
      from: DEFAULT_FROM,
      to: claim.email,
      subject: `Constancia Oficial de ${typeLabel} N° ${claim.claimCode} - ${claim.storeName}`,
      html: consumerHtml,
    });
    if (!consumerRes.error) {
      consumerEmailSent = true;
    } else {
      console.error('Error enviando correo a consumidor:', consumerRes.error);
      lastError = consumerRes.error.message;
    }
  } catch (err: any) {
    console.error('Excepción enviando correo a consumidor:', err);
    lastError = err?.message || 'Error desconocido';
  }

  // 2. Enviar correo de alerta al comerciante
  if (merchantEmail) {
    try {
      const merchantRes = await resend.emails.send({
        from: DEFAULT_FROM,
        to: merchantEmail,
        subject: `⚠️ [15 Días Hábiles] Nuevo ${claim.claimType.toUpperCase()} N° ${claim.claimCode} - ${claim.storeName}`,
        html: merchantHtml,
      });
      if (!merchantRes.error) {
        merchantEmailSent = true;
      } else {
        console.error('Error enviando correo a comerciante:', merchantRes.error);
      }
    } catch (err) {
      console.error('Excepción enviando correo a comerciante:', err);
    }
  }

  return {
    success: consumerEmailSent,
    consumerEmailSent,
    merchantEmailSent,
    error: lastError || undefined,
  };
}

/**
 * Despacha el correo formal de resolución/respuesta al consumidor cuando el comerciante atiende el reclamo
 */
export async function sendClaimResolutionEmail({
  claim,
  responseNotes,
}: {
  claim: IndecopiClaimData;
  responseNotes: string;
}): Promise<{
  success: boolean;
  error?: string;
  simulated?: boolean;
}> {
  const resend = getResendClient();
  const emailHtml = generateClaimResponseEmailHtml({ claim, responseNotes });
  const isReclamo = claim.claimType === 'reclamo';
  const typeLabel = isReclamo ? 'Reclamo' : 'Queja';

  if (!resend) {
    console.log(`[EMAIL SIMULADO] Respuesta Formal enviada a: ${claim.email}`);
    return { success: true, simulated: true };
  }

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM,
      to: claim.email,
      subject: `Respuesta Formal a su ${typeLabel} N° ${claim.claimCode} - ${claim.storeName}`,
      html: emailHtml,
    });

    if (res.error) {
      console.error('Error enviando respuesta formal al consumidor:', res.error);
      return { success: false, error: res.error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Excepción enviando respuesta formal:', err);
    return { success: false, error: err?.message || 'Error desconocido' };
  }
}
