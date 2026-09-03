'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: Props) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  React.useEffect(() => {
    // Redirigir de inmediato a la vista de edición/gestión del producto
    if (productId) {
      router.replace(`/products/${productId}/edit`);
    }
  }, [productId, router]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3 font-sans">
      <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium text-[#6d7a72]">Abriendo producto...</span>
    </div>
  );
}
