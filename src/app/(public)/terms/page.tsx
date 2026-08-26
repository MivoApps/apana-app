'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, FileText, Scale, RefreshCw, BookOpen } from 'lucide-react';

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
              2. Naturaleza del Servicio y Titularidad
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              La plataforma tecnológica, marca y software denominado <strong>APANA</strong> es de titularidad, desarrollo y operación exclusiva de <strong>MIVO (Mivo E.I.R.L.)</strong> con domicilio legal en Lima, Perú.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              APANA es un proveedor de tecnología en la nube (Software as a Service - SaaS) que facilita a emprendedores y comercios la creación de catálogos digitales interactivos y la generación de enlaces de contacto directo hacia la aplicación WhatsApp.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>APANA no es una pasarela de pagos ni un intermediario financiero.</strong> Las transacciones comerciales, cobros de productos, acuerdos de entrega, calidad de los artículos comercializados y obligaciones tributarias son de entera y exclusiva responsabilidad entre el comercio vendedor y su cliente comprador final.
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
              <li>Publicar o comercializar bienes o servicios prohibidos por la ley peruana, incluyendo sustancias ilícitas, armas, productos falsificados o contenido que atente contra el orden público y las buenas costumbres.</li>
            </ul>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              APANA se reserva el derecho de <strong>cancelar, suspender o bloquear de manera inmediata y sin previo aviso</strong> cualquier cuenta o catálogo que infrinja estas disposiciones, así como cooperar plenamente con las autoridades judiciales y policiales competentes.
            </p>
          </section>

          {/* Section 4: Limitación de Responsabilidad */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <FileText size={18} className="text-[#059669]" />
              4. Deslinde y Limitación de Responsabilidad
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              APANA no se responsabiliza por pérdidas económicas, daños o perjuicios resultantes de transacciones acordadas entre comerciantes y compradores a través de WhatsApp, ni por interrupciones atribuibles a proveedores de telecomunicaciones o políticas internas de Meta / WhatsApp.
            </p>
          </section>

          {/* Section 5: Política de Cancelaciones y Reembolsos */}
          <section className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <RefreshCw size={18} className="text-[#059669]" />
              5. Política de Cancelación de Suscripción y Reembolsos
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                <strong>5.1. Cancelación de Suscripción:</strong> Los planes de pago de APANA (Plan Emprendedor y Plan Negocio Pro) operan bajo modalidad de suscripción mensual recurrente <strong>sin contratos de permanencia obligatoria</strong>. El usuario puede cancelar su suscripción en cualquier momento y con un solo clic desde la sección <em>Planes</em> de su panel de administración.
              </p>
              <p>
                <strong>5.2. Efecto de la Cancelación:</strong> Al cancelar la suscripción, el usuario conservará el acceso ininterrumpido a todas las funciones de su plan hasta el término exacto del periodo mensual facturado. Posteriormente, su cuenta pasará automáticamente al Plan Gratis sin cargos adicionales.
              </p>
              <p>
                <strong>5.3. Reembolsos y Devoluciones:</strong> Al tratarse de un servicio de software en la nube de consumo y activación inmediata (SaaS), los periodos ya iniciados y facturados no son sujetos a reembolso proporcional, excepto en situaciones donde se demuestre una falla técnica crítica atribuible directamente a la plataforma que haya impedido el uso total del servicio, solicitada dentro de los primeros 7 (siete) días calendario posteriores al cobro respectivo a través de <a href="mailto:soporte@beapana.com" className="text-[#059669] font-bold hover:underline">soporte@beapana.com</a>.
              </p>
            </div>
          </section>

          {/* Section 6: Contacto y Soporte */}
          <section className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
            <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
              <BookOpen size={18} className="text-[#059669]" />
              6. Datos de Contacto y Libro de Reclamaciones
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Para consultas contractuales, soporte técnico, facturación o reportes de uso indebido:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#0b1c30] font-medium pt-1">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">Razón Social / Operador:</span>
                <strong className="text-emerald-950 font-bold">Mivo E.I.R.L.</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">Ubicación Legal:</span>
                <strong>Lima, Perú</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">Correo Electrónico:</span>
                <a href="mailto:soporte@beapana.com" className="text-[#059669] font-bold hover:underline">
                  soporte@beapana.com
                </a>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">WhatsApp Oficial de Atención:</span>
                <a href="https://wa.me/51920030074" target="_blank" className="text-[#059669] font-bold hover:underline">
                  +51 920 030 074
                </a>
              </div>
            </div>
            <div className="pt-2">
              <Link 
                href="/libro-de-reclamaciones" 
                className="inline-flex items-center gap-2 text-xs font-bold text-[#006c49] hover:underline"
              >
                <span>📖 Acceder al Libro de Reclamaciones Virtual conforme a INDECOPI ➔</span>
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
