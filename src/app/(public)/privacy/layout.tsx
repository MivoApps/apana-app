import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Protección de Datos | APANA',
  description: 'Conoce cómo APANA y Mivo E.I.R.L. protegen y tratan los datos personales de comerciantes y visitantes conforme a la Ley N° 29733 de Perú.',
  alternates: {
    canonical: 'https://beapana.com/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
