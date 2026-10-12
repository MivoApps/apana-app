/**
 * Helper de optimización de imágenes en el cliente (Browser HTML5 Canvas)
 * 1. Soporta imágenes HEIC/HEIF de celulares Android/iPhone convirtiéndolas automáticamente.
 * 2. Utiliza createImageBitmap / ObjectURL en vez de FileReader base64 gigante para no agotar la RAM en móviles.
 * 3. Redimensiona automáticamente a resolución cuadrada centrada (center-crop / cover).
 * 4. Comprime a WebP con fallback automático a JPEG si el navegador no soporta codificación WebP.
 * 5. Reduce fotos de cámara pesadas (15MB - 30MB) a ~70KB-120KB ultraligeras.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (0.75 es óptimo para WebP/JPEG)
  outputFormat?: 'image/webp' | 'image/jpeg';
}

export async function compressAndCropImage(
  file: File | Blob,
  options: OptimizeImageOptions = {}
): Promise<{ dataUrl: string; blob: Blob; originalSize: number; optimizedSize: number }> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.75,
    outputFormat = 'image/webp',
  } = options;

  const originalSize = file.size;
  let processFile: Blob = file;

  // 1. Detectar y convertir formato HEIC/HEIF (muy común en cámaras de celulares Samsung, Xiaomi, iPhone)
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    (file instanceof File && (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')));

  if (isHeic) {
    try {
      const heic2any = (await import('heic2any')).default;
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.85,
      });
      processFile = Array.isArray(converted) ? converted[0] : converted;
    } catch (heicErr) {
      console.warn('Aviso al convertir archivo HEIC con heic2any:', heicErr);
      // Continuar con el blob original por si el navegador lo soporta
    }
  }

  // 2. Obtener dimensiones y dibujar en Canvas usando createImageBitmap (más rápido y sin saturar RAM en móvil)
  // o fallback a HTMLImageElement con ObjectURL
  return new Promise(async (resolve, reject) => {
    let sourceWidth = 0;
    let sourceHeight = 0;
    let drawSource: CanvasImageSource | null = null;
    let cleanupUrl: string | null = null;

    try {
      if (typeof createImageBitmap === 'function') {
        try {
          const bitmap = await createImageBitmap(processFile);
          sourceWidth = bitmap.width;
          sourceHeight = bitmap.height;
          drawSource = bitmap;
        } catch {
          // createImageBitmap falló con este blob, intentar fallback con Image
        }
      }

      if (!drawSource) {
        const objectUrl = URL.createObjectURL(processFile);
        cleanupUrl = objectUrl;
        const img = new Image();

        await new Promise<void>((imgResolve, imgReject) => {
          img.onload = () => {
            sourceWidth = img.naturalWidth || img.width;
            sourceHeight = img.naturalHeight || img.height;
            drawSource = img;
            imgResolve();
          };
          img.onerror = (e) => {
            imgReject(new Error('El navegador no pudo decodificar el formato de esta imagen'));
          };
          img.src = objectUrl;
        });
      }

      if (!drawSource || sourceWidth === 0 || sourceHeight === 0) {
        if (cleanupUrl) URL.revokeObjectURL(cleanupUrl);
        reject(new Error('No se pudieron obtener las dimensiones de la imagen'));
        return;
      }

      // 3. Crear Canvas en memoria para recorte cuadrado (Center-Crop)
      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = maxHeight;

      const ctx = canvas.getContext('2d', { willReadFrequently: false });
      if (!ctx) {
        if (cleanupUrl) URL.revokeObjectURL(cleanupUrl);
        reject(new Error('No se pudo inicializar el contexto 2D del Canvas'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fondo blanco por defecto (evita fondos negros en transparencias PNG/WebP al convertir a JPEG)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, maxWidth, maxHeight);

      // Calcular recorte centrado proporcional
      let sx = 0;
      let sy = 0;
      let sWidth = sourceWidth;
      let sHeight = sourceHeight;

      if (sourceWidth > sourceHeight) {
        sWidth = sourceHeight;
        sx = (sourceWidth - sourceHeight) / 2;
      } else if (sourceHeight > sourceWidth) {
        sHeight = sourceWidth;
        sy = (sourceHeight - sourceWidth) / 2;
      }

      ctx.drawImage(drawSource, sx, sy, sWidth, sHeight, 0, 0, maxWidth, maxHeight);

      // Limpiar recursos del bitmap u objectUrl
      if ('close' in drawSource && typeof (drawSource as ImageBitmap).close === 'function') {
        (drawSource as ImageBitmap).close();
      }
      if (cleanupUrl) {
        URL.revokeObjectURL(cleanupUrl);
      }

      // 4. Exportar a WebP con fallback inteligente a JPEG
      let targetMime: 'image/webp' | 'image/jpeg' = outputFormat;
      let dataUrl: string = '';

      try {
        dataUrl = canvas.toDataURL(targetMime, quality);
        if (!dataUrl.startsWith(`data:${targetMime}`)) {
          targetMime = 'image/jpeg';
          dataUrl = canvas.toDataURL(targetMime, quality);
        }
      } catch {
        targetMime = 'image/jpeg';
        dataUrl = canvas.toDataURL(targetMime, quality);
      }

      // Generar Blob final
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              dataUrl,
              blob,
              originalSize,
              optimizedSize: blob.size,
            });
          } else {
            // Reintento con JPEG si WebP toBlob retornó null en este navegador
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) {
                  const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
                  resolve({
                    dataUrl: jpegDataUrl,
                    blob: jpegBlob,
                    originalSize,
                    optimizedSize: jpegBlob.size,
                  });
                } else {
                  reject(new Error('Falló la generación del archivo comprimido de la imagen'));
                }
              },
              'image/jpeg',
              quality
            );
          }
        },
        targetMime,
        quality
      );
    } catch (err) {
      if (cleanupUrl) URL.revokeObjectURL(cleanupUrl);
      reject(err);
    }
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
