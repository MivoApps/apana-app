'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, FileText, Scale, ExternalLink } from 'lucide-react';

export default function TermsPage() {
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
              <span>Documento Legal Oficial</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
              Términos, Condiciones y Declaración Jurada
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Última actualización: Agosto de 2026 • Válido para todos los usuarios y comercios de la plataforma APANA.
            </p>
          </div>

          {/* Section 1: Declaración Jurada de Titularidad */}
          <section className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base sm:text-lg">
              <Scale size={20} className="text-amber-700 shrink-0" />
              <h2>1. Declaración Jurada de Titularidad y Uso de Línea Telefónica</h2>
            </div>
            <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed">
              Al registrar una cuenta, crear una tienda o vincular un número de WhatsApp en la plataforma APANA, el usuario <strong>DECLARA BAJO JURAMENTO</strong> que:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-amber-950/90 leading-relaxed">
              <li>
                Es el titular legítimo, usuario autorizado o representante legal del número de teléfono registrado y del negocio o marca comercial ingresada.
              </li>
              <li>
                Toda la información proporcionada (nombre de comercio, productos, descripciones, precios y datos de contacto) es verídica, lícita y no vulnera derechos de propiedad de terceros.
              </li>
              <li>
                Asume plena responsabilidad legal, civil y penal por el uso que se le dé al catálogo digital y al número telefónico vinculado.
              </li>
            </ul>
          </section>

          {/* Section 2: Naturaleza del Servicio */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <FileText size={18} className="text-[#059669]" />
              2. Naturaleza del Servicio
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              APANA es un proveedor de tecnología (Software as a Service - SaaS) que facilita a los emprendedores la creación de catálogos digitales interactivos y la generación de enlaces de contacto directo hacia la aplicación WhatsApp.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>APANA no es una pasarela de pagos ni un intermediario financiero.</strong> Las transacciones comerciales, cobros, acuerdos de entrega, calidad de los productos y cumplimiento tributario son de entera y exclusiva responsabilidad entre el vendedor y el comprador final.
            </p>
          </section>

          {/* Section 3: Prohibición Estricta de Suplantación */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <FileText size={18} className="text-[#059669]" />
              3. Prohibición de Suplantación y Actividades Ilícitas
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Queda terminantemente prohibido:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <li>Registrar números de teléfono que pertenezcan a terceras personas o comercios sin su autorización expresa por escrito.</li>
              <li>Utilizar marcas comerciales registradas, logotipos o nombres comerciales protegidos de terceros con fines de engaño o estafa.</li>
              <li>Publicar o comercializar bienes o servicios prohibidos por la ley, incluyendo pero no limitándose a sustancias ilícitas, armas, material falsificado o contenido que atente contra la integridad ciudadana.</li>
            </ul>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              APANA se reserva el derecho de <strong>cancelar, suspender o bloquear de manera inmediata y sin previo aviso</strong> cualquier cuenta o tienda que infrinja estas disposiciones, así como cooperar plenamente con las autoridades judiciales y policiales en caso de investigaciones por suplantación de identidad o fraude.
            </p>
          </section>

          {/* Section 4: Limitación de Responsabilidad */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <FileText size={18} className="text-[#059669]" />
              4. Deslinde y Limitación de Responsabilidad
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              APANA no se responsabiliza por:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <li>Pérdidas económicas, daños o perjuicios resultantes de transacciones realizadas entre comerciantes y compradores por medio de WhatsApp.</li>
              <li>Fallas, interrupciones o bloqueos de cuentas causados por las políticas internas de terceros como WhatsApp, Meta o proveedores de internet.</li>
              <li>Uso fraudulento o no autorizado de credenciales por negligencia del usuario en la custodia de sus contraseñas.</li>
            </ul>
          </section>

          {/* Section 5: Modificaciones */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <FileText size={18} className="text-[#059669]" />
              5. Modificaciones a los Términos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              APANA podrá actualizar estos términos periódicamente para adecuarse a mejoras técnicas o requerimientos legales. El uso continuo de la plataforma tras la publicación de cambios constituye la aceptación plena de los mismos.
            </p>
          </section>

          {/* Section 6: Contacto y Soporte */}
          <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-[#0b1c30]">Canal de Soporte y Denuncias</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Si detectas una tienda que utiliza indebidamente tu número de teléfono o suplanta tu marca comercial, contáctanos inmediatamente a través de nuestros canales oficiales para proceder con la baja inmediata de la cuenta infractora.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-[#bccac0]/20 bg-white">
        © {new Date().getFullYear()} APANA. Todos los derechos reservados.
      </footer>
    </div>
  );
}
