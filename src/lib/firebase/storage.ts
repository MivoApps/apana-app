import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Sube una imagen (Blob o File) a Firebase Cloud Storage y retorna su URL pública de CDN.
 * Configura Cache-Control agresivo para que Google Cloud CDN y el navegador almacenen la imagen
 * y no consuman cuotas de descarga en visitas repetidas.
 */
export async function uploadImageToStorage(fileOrBlob: Blob | File, storagePath: string): Promise<string> {
  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: fileOrBlob.type || 'image/webp',
      cacheControl: 'public, max-age=31536000, immutable',
    };
    const snapshot = await uploadBytes(storageRef, fileOrBlob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Error al subir imagen a Firebase Storage:', error);
    throw error;
  }
}

/**
 * Convierte una cadena DataURL (Base64) a un Blob binario para subida eficiente a Storage.
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/webp';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Elimina una imagen de Firebase Storage dado su path o URL completa.
 */
export async function deleteImageFromStorageByUrl(fileUrl: string): Promise<void> {
  try {
    if (!fileUrl || !fileUrl.includes('firebasestorage.googleapis.com')) return;
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('No se pudo eliminar la imagen previa de Storage:', error);
  }
}
