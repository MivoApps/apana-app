/**
 * Helper de optimización de imágenes en el cliente (Browser HTML5 Canvas)
 * 1. Redimensiona automáticamente la imagen subida a una resolución cuadrada recomendada (ej. 800x800 px).
 * 2. Aplica recorte al centro (center-crop / object-fit cover) si la imagen original no es cuadrada.
 * 3. Comprime el resultado a formato WebP/JPEG con calidad ajustada.
 * 4. Reduce drásticamente el peso del archivo (ej. de 8MB o 15MB de foto de cámara a ~80KB-150KB) sin perder calidad visible.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (0.85 es óptimo para WebP/JPEG)
  outputFormat?: 'image/webp' | 'image/jpeg';
}

export function compressAndCropImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<{ dataUrl: string; blob: Blob; originalSize: number; optimizedSize: number }> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    outputFormat = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const img = new Image();

      img.onerror = (err) => reject(err);
      img.onload = () => {
        // Crear elemento Canvas HTML5 en memoria
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto 2D del Canvas'));
          return;
        }

        // Habilitar suavizado de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calcular recorte centrado (Center-Crop / Aspect Square)
        const sourceWidth = img.width;
        const sourceHeight = img.height;
        let sx = 0;
        let sy = 0;
        let sWidth = sourceWidth;
        let sHeight = sourceHeight;

        if (sourceWidth > sourceHeight) {
          // Imagen apaisada (Horizontal): Recortar los lados
          sWidth = sourceHeight;
          sx = (sourceWidth - sourceHeight) / 2;
        } else if (sourceHeight > sourceWidth) {
          // Imagen vertical (Retrato): Recortar arriba y abajo
          sHeight = sourceWidth;
          sy = (sourceHeight - sourceWidth) / 2;
        }

        // Dibujar en Canvas con recorte y escalado perfecto a 800x800
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, maxWidth, maxHeight);

        // Convertir a DataURL y Blob comprimido
        const dataUrl = canvas.toDataURL(outputFormat, quality);

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
              reject(new Error('Falló la generación del Blob de la imagen'));
            }
          },
          outputFormat,
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
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
