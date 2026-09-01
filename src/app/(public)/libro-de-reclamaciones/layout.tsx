import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones Virtual | APANA',
  description: 'Libro de Reclamaciones Virtual conforme a las disposiciones del Código de Protección y Defensa del Consumidor (Ley N° 29571) e INDECOPI.',
  alternates: {
    canonical: 'https://beapana.com/libro-de-reclamaciones',
  },
};

export default function LibroReclamacionesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
