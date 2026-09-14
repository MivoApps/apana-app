'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, UserCheck, BookOpen } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#bccac0]/30 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-[#006c49] hover:text-[#00855d] transition-colors">
            <ArrowLeft size={18} />
            <span>Volver a APANA</span>
          </Link>
          <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
            <Image
              src="/logo_lockup.svg"
              alt="APANA"
              width={125}
              height={28}
              className="h-7 w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#bccac0]/30 shadow-xs space-y-8">
          
          {/* Header */}
          <div className="border-b border-gray-100 pb-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#006c49] text-xs font-bold rounded-full border border-emerald-200/60">
              <ShieldCheck size={14} />
              <span>Privacidad y Protección de Datos</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
              Política de Privacidad
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Última actualización: Septiembre de 2026 • Conforme a la Ley N° 29733 (Ley de Protección de Datos Personales de la República del Perú).
            </p>
          </div>

          {/* Section 1: Identidad del Responsable */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <UserCheck size={18} className="text-[#059669]" />
              1. Identidad y Domicilio del Responsable del Tratamiento
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              El titular y responsable del tratamiento de los bancos de datos personales recopilados a través del sitio web y plataforma <strong>APANA</strong> es <strong>MIVO (Mivo E.I.R.L.)</strong>, con domicilio legal en la ciudad de Lima, Perú, y correo electrónico oficial de contacto: <a href="mailto:soporte@beapana.com" className="text-[#059669] font-bold hover:underline">soporte@beapana.com</a>.
            </p>
          </section>

          {/* Section 2: Datos que recopilamos */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <Database size={18} className="text-[#059669]" />
              2. Datos Personales Recopilados
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dependiendo del rol con el que interactúes en APANA, recopilamos la siguiente información estrictamente necesaria:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-2">
                <strong className="text-xs text-[#0b1c30] block font-bold">Comerciantes / Usuarios Registrados:</strong>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                  <li>Nombre completo y correo electrónico.</li>
                  <li>Número de teléfono celular (vinculado a WhatsApp Business o personal).</li>
                  <li>Nombre del comercio o marca y catálogo de productos.</li>
                  <li>Credenciales seguras de acceso cifradas (mediante Google Firebase Authentication).</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-2">
                <strong className="text-xs text-[#0b1c30] block font-bold">Compradores / Visitantes de Tiendas:</strong>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                  <li>Datos de checkout voluntario (Nombre, distrito/dirección de entrega, método de pago de preferencia).</li>
                  <li>Mensajes generados para el enlace directo a WhatsApp.</li>
                  <li>Dirección IP aproximada (país/ciudad) con fines estrictos de seguridad y prevención de abusos.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Finalidad del Tratamiento */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <Eye size={18} className="text-[#059669]" />
              3. Finalidad del Tratamiento de Datos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Los datos personales son tratados con las siguientes finalidades explícitas y legítimas:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <li>Permitir la creación, configuración y publicación de catálogos digitales interactivos.</li>
              <li>Generar los enlaces automatizados que facilitan la comunicación directa de pedidos vía WhatsApp entre compradores y vendedores.</li>
              <li>Prevenir fraudes, suplantaciones de identidad, ciberdelitos y asegurar el cumplimiento de nuestros Términos de Servicio.</li>
              <li>Brindar soporte técnico y atención al usuario cuando este lo solicite.</li>
            </ul>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
              APANA no vende, arrienda ni comercializa bajo ninguna circunstancia los datos personales de sus usuarios ni de los clientes de las tiendas a empresas de telemercadeo o terceros no autorizados.
            </p>
          </section>

          {/* Section 4: Seguridad y Almacenamiento */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <Lock size={18} className="text-[#059669]" />
              4. Medidas de Seguridad y Transferencia a Terceros
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              APANA utiliza infraestructura cloud segura de clase mundial con protocolos de cifrado en tránsito (HTTPS/TLS) y en reposo provistos por <strong>Google Cloud Platform</strong> y <strong>Google Firebase</strong>.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Solo se realizan transferencias técnicas de datos a proveedores de infraestructura esenciales para la operatividad del servicio (alojamiento web, base de datos y envío de notificaciones del sistema), quienes mantienen altos estándares internacionales de ciberseguridad.
            </p>
          </section>

          {/* Section 5: Derechos ARCO */}
          <section className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#059669]" />
              5. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              De acuerdo con la legislación vigente en Perú, todo titular de datos personales tiene derecho a acceder a la información que APANA mantiene sobre él, solicitar su actualización o rectificación cuando sea inexacta, o requerir la cancelación definitiva o eliminación de su cuenta y catálogo.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Para ejercer cualquiera de estos derechos, el titular puede enviar una solicitud formal por correo electrónico a <a href="mailto:soporte@beapana.com" className="text-[#059669] font-bold hover:underline">soporte@beapana.com</a> indicando su nombre completo, el correo asociado a su cuenta y el derecho que desea ejercer. Las solicitudes son atendidas dentro de los plazos legales establecidos.
            </p>
          </section>

          {/* Section 6: Cookies */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <Database size={18} className="text-[#059669]" />
              6. Uso de Cookies y Almacenamiento Local
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              APANA emplea tecnologías de almacenamiento local en el navegador (Local Storage y Session Storage) exclusivamente para propósitos operativos y técnicos: mantener la sesión activa del comerciante, recordar los artículos agregados al carrito de compra de una tienda y acelerar los tiempos de carga visual. No utilizamos cookies de rastreo publicitario invasivo entre terceros.
            </p>
          </section>

          {/* Section 7: Enlaces cruzados */}
          <section className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
            <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
              <BookOpen size={18} className="text-[#059669]" />
              Documentos Relacionados
            </h3>
            <div className="flex flex-wrap gap-4 pt-1 text-xs font-bold text-[#006c49]">
              <Link href="/terms" className="hover:underline flex items-center gap-1">
                <span>📄 Términos y Condiciones de Servicio ➔</span>
              </Link>
              <Link href="/libro-de-reclamaciones" className="hover:underline flex items-center gap-1">
                <span>📖 Libro de Reclamaciones Virtual ➔</span>
              </Link>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-[#bccac0]/20 bg-white">
        © {new Date().getFullYear()} APANA • Operado por Mivo E.I.R.L. • Lima, Perú.
      </footer>
    </div>
  );
}
