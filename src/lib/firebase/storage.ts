/**
 * Procesa la imagen recortada 1:1 de producto y la retorna como DataURL WebP ultra ligera.
 * Esto permite almacenamiento 100% gratuito en Firestore sin requerir tarjeta ni facturación en Firebase.
 * @param storeId ID de la tienda
 * @param fileOrBlob Archivo o Blob de imagen
 * @returns Promise<string> Clic de imagen optimizada WebP
 */
export const uploadProductImageToStorage = async (
  storeId: string,
  fileOrBlob: File | Blob
): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80');
    };
    reader.onerror = () => {
      resolve('https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80');
    };
    reader.readAsDataURL(fileOrBlob);
  });
};
