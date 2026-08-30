import QRCode from 'qrcode';

export interface GenerateQrOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  logoSizeRatio?: number; // ratio respecto al ancho total, ej. 0.22 (22%)
}

// Contenido SVG del logotipo oficial de APANA inline (sin depender de fetch de red o problemas de CORS/Image en canvas)
const APANA_LOGO_SVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;">
  <g transform="matrix(1,0,0,1,1,33)">
    <path d="M356,288L356,238C356,153 425,84 512,84C599,84 668,153 668,238L668,288" style="fill:none;fill-rule:nonzero;stroke:rgb(11,28,48);stroke-width:58px;"/>
  </g>
  <g transform="matrix(1,0,0,1,-10,0)">
    <path d="M178,530L846,530L846,822C846,873 805,914 754,914L270,914C219,914 178,873 178,822L178,530Z" style="fill:rgb(11,28,48);fill-rule:nonzero;"/>
  </g>
  <path d="M160,314L864,314L928,516C938,548 908,640 670,516L354,516C301.086,564.41 259.414,601.643 224.168,606.964C97.861,626.032 88.252,540.795 96,516L160,314Z" style="fill:rgb(5,150,105);fill-rule:nonzero;"/>
  <path d="M160,314L393,314L354,516L145,580C110,580 86,548 96,516L160,314Z" style="fill:rgb(16,185,129);fill-opacity:0.72;fill-rule:nonzero;"/>
  <path d="M393,314L631,314L670,516L354,516L393,314Z" style="fill:rgb(4,120,87);fill-opacity:0.62;fill-rule:nonzero;"/>
  <path d="M631,314L864,314L928,516C938,548 914,580 879,580L670,516L631,314Z" style="fill:rgb(16,185,129);fill-opacity:0.72;fill-rule:nonzero;"/>
  <path d="M96,516L354,516L354,522C354,592 298,648 225,648C152,648 96,592 96,522L96,516Z" style="fill:rgb(5,150,105);fill-rule:nonzero;"/>
  <path d="M354,516L670,516L670,522C670,592 614,648 512,648C410,648 354,592 354,522L354,516Z" style="fill:rgb(4,120,87);fill-rule:nonzero;"/>
  <path d="M670,516L928,516L928,522C928,592 872,648 799,648C738.876,648 690.284,610.012 675.013,557.503C671.742,546.258 670,534.347 670,522L670,516Z" style="fill:rgb(5,150,105);fill-rule:nonzero;"/>
  <g transform="matrix(1,0,0,1,-10,0)">
    <path d="M364,914L364,748C364,671 430,608 512,608C594,608 660,671 660,748L660,914L364,914Z" style="fill:white;fill-rule:nonzero;"/>
  </g>
  <g transform="matrix(1,0,0,1,-21,2)">
    <path d="M433,850L491,693C497,677 508,668 523,668C538,668 549,677 555,693L613,850" style="fill:none;fill-rule:nonzero;stroke:rgb(11,28,48);stroke-width:62px;stroke-linejoin:round;"/>
  </g>
  <g transform="matrix(1,0,0,1,-10,0)">
    <path d="M459,801L566,801" style="fill:none;fill-rule:nonzero;stroke:rgb(11,28,48);stroke-width:62px;"/>
  </g>
  <g transform="matrix(1,0,0,1,-10,0)">
    <circle cx="512" cy="748" r="13" style="fill:rgb(5,150,105);"/>
  </g>
  <g transform="matrix(1,0,0,1,-10,13)">
    <circle cx="512" cy="849" r="24" style="fill:rgb(16,185,129);"/>
  </g>
</svg>`;

/**
 * Genera un código QR de alta resolución con el logo oficial de APANA centrado en un badge circular blanco.
 * Usa nivel de corrección de error 'H' (30% de redundancia) para lectura instantánea y segura.
 */
export async function generateQrWithLogo(
  text: string,
  options: GenerateQrOptions = {}
): Promise<string> {
  const {
    width = 1024,
    margin = 2,
    darkColor = '#0b1c30',
    lightColor = '#ffffff',
    logoSizeRatio = 0.22,
  } = options;

  // Si estamos en entorno servidor/SSR donde no hay Canvas disponible
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return QRCode.toDataURL(text, {
      width,
      margin,
      errorCorrectionLevel: 'H',
      color: { dark: darkColor, light: lightColor },
    });
  }

  // 1. Crear Canvas en memoria
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = width;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return QRCode.toDataURL(text, {
      width,
      margin,
      errorCorrectionLevel: 'H',
      color: { dark: darkColor, light: lightColor },
    });
  }

  // 2. Renderizar QR base en el canvas con nivel de corrección 'H'
  await QRCode.toCanvas(canvas, text, {
    width,
    margin,
    errorCorrectionLevel: 'H',
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });

  // 3. Cargar y superponer el Logo de APANA en el centro
  try {
    const svgBlob = new Blob([APANA_LOGO_SVG], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);

    const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = blobUrl;
    });

    const center = width / 2;
    const badgeRadius = (width * logoSizeRatio * 1.25) / 2;
    const logoDrawSize = width * logoSizeRatio;

    // Dibujar fondo protector blanco circular con borde sutil
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, badgeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(11, 28, 48, 0.18)';
    ctx.shadowBlur = width * 0.015;
    ctx.fill();
    ctx.lineWidth = width * 0.008;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();
    ctx.restore();

    // Dibujar logo centrado dentro del badge circular
    ctx.drawImage(
      logoImg,
      center - logoDrawSize / 2,
      center - logoDrawSize / 2,
      logoDrawSize,
      logoDrawSize
    );

    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Error al incrustar el logo en el QR Canvas:', err);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Genera la imagen completa del STICKER optimizada para Mini Impresoras Térmicas (Fun Print / 200 DPI).
 * Con textos grandes, ultra legibles y alto contraste sin márgenes excesivos.
 */
export async function generateFullStickerImage(
  storeName: string,
  qrDataUrl: string
): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return qrDataUrl;
  }

  // 1000x1000 px (Cuadrado 1:1 de alta densidad para papel térmico de 50mm a 200 DPI)
  const size = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return qrDataUrl;

  // 1. Fondo blanco puro con esquinas ligeramente redondeadas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // 2. Cabecera: "— MIRA Y PIDE AQUÍ —" (Más grande, grueso y nítido)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Líneas decorativas
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 270, 70);
  ctx.lineTo(size / 2 - 185, 70);
  ctx.moveTo(size / 2 + 185, 70);
  ctx.lineTo(size / 2 + 270, 70);
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('MIRA Y PIDE AQUÍ', size / 2, 70);

  // Nombre de la Tienda (Texto extra grande y destacado)
  ctx.fillStyle = '#000000';
  ctx.font = '900 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const cleanName = (storeName || 'Mi Tienda').toUpperCase();
  ctx.fillText(cleanName.length > 18 ? cleanName.substring(0, 16) + '...' : cleanName, size / 2, 140);

  // 3. Dibujar QR HD con Logo APANA al centro (Ocupando el tamaño óptimo de escaneo)
  try {
    const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = qrDataUrl;
    });

    const qrSize = 580;
    const qrX = (size - qrSize) / 2;
    const qrY = 195;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (e) {
    console.error('Error dibujando QR en sticker completo:', e);
  }

  // 4. Pie de sticker: "📱 Escanea para pedir" (Grande y en negrita pura)
  ctx.fillStyle = '#000000';
  ctx.font = '900 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('📱 Escanea para pedir', size / 2, 840);

  // Línea divisoria central
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 100, 895);
  ctx.lineTo(size / 2 + 100, 895);
  ctx.stroke();

  // "Una tienda online de APANA" (Nítido y legible para impresión térmica)
  ctx.fillStyle = '#000000';
  ctx.font = '800 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Una tienda online de APANA', size / 2, 940);

  return canvas.toDataURL('image/png');
}
