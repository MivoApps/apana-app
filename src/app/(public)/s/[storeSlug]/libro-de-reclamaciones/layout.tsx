import { Metadata } from 'next';
import { getStoreBySlugFromFS } from '@/lib/firebase/firestore';

interface Props {
  params: Promise<{
    storeSlug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await getStoreBySlugFromFS(storeSlug);

  if (!store) {
    return {
      title: 'Libro de Reclamaciones | APANA',
    };
  }

  return {
    title: `Libro de Reclamaciones - ${store.name} | Ley N° 29571`,
    description: `Hoja de Reclamación Virtual oficial del establecimiento ${store.name} conforme al Código de Protección y Defensa del Consumidor (INDECOPI).`,
  };
}

export default function StoreLibroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
