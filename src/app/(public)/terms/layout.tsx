import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Servicio | APANA',
  description: 'Términos de uso, políticas de servicio y declaración de no intermediación financiera de APANA en Perú.',
  alternates: {
    canonical: 'https://beapana.com/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
