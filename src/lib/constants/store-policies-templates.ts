/**
 * Plantillas Oficiales de Políticas y Términos Comerciales por Rubro
 * Conforme al Código de Protección y Defensa del Consumidor de la República del Perú (Ley N° 29571)
 */

export interface PolicyTemplate {
  categoryId: string;
  categoryLabel: string;
  badge: string;
  summary: string;
  content: string;
}

export const STORE_POLICY_TEMPLATES: Record<string, PolicyTemplate> = {
  comida: {
    categoryId: 'comida',
    categoryLabel: 'Comida, Bebidas y Alimentos',
    badge: 'Salubridad e Inocuidad',
    summary: 'No admite devoluciones tras la entrega. Reclamos inmediatos el mismo día por WhatsApp.',
    content: `1. NATURALEZA DE LOS PRODUCTOS Y SALUBRIDAD
Por tratarse de alimentos preparados, perecibles o bebidas de consumo inmediato, y en estricto cumplimiento de las normas sanitarias y de salubridad vigentes en el Perú, los productos una vez entregados no admiten devoluciones ni cancelaciones por arrepentimiento.

2. RECLAMOS, ERRORES O PEDIDOS INCOMPLETOS
Si tu pedido llegó en condiciones no aptas (empaque dañado, producto frío cuando debía ser caliente, mal estado), incompleto o con ítems diferentes a los solicitados, el cliente debe comunicarse de manera INMEDIATA el mismo día de la recepción a través de nuestro WhatsApp oficial de atención adjuntando fotografía o video del pedido y boleta/comprobante de compra.

3. REEMPLAZO O REEMBOLSO
Una vez verificada la disconformidad reportada de inmediato:
• Se gestionará el envío prioritario del reemplazo correcto sin costo adicional para el cliente, o
• Se procederá con el reembolso equivalente mediante el método de pago acordado (Yape, Plin, transferencia bancaria).

4. DESPACHO Y RECOJO
Los tiempos de entrega son aproximados y pueden variar según demanda o condiciones climáticas. Para pedidos con recojo en tienda, el cliente debe apersonarse dentro del horario acordado para garantizar la frescura del producto.`,
  },

  ropa: {
    categoryId: 'ropa',
    categoryLabel: 'Ropa, Calzado y Moda',
    badge: 'Cambio de Talla (7 días)',
    summary: 'Cambios por talla o modelo dentro de 7 días con prendas intactas y etiquetas.',
    content: `1. POLÍTICA DE CAMBIOS DE TALLA O MODELO
Aceptamos cambios de talla o modelo dentro de un plazo máximo de 7 (siete) días calendario contados desde la recepción de tu pedido.

2. CONDICIONES PARA EL CAMBIO
Para hacer efectivo cualquier cambio, la prenda o calzado debe:
• Estar completamente nueva, sin uso, sin lavar y sin olores.
• Conservar intactas todas sus etiquetas, marquillas y empaques originales.
• Presentar el comprobante de compra o número de pedido.
Nota importante sobre costos de envío: Si el cambio es por preferencia o error de talla del cliente, el costo de transporte/delivery para el cambio es asumido por el comprador. Si el cambio se debe a una falla de confección o envío erróneo de nuestra parte, el transporte será 100% gratuito.

3. EXCEPCIONES LEGALES POR HIGIENE
Por razones estrictas de higiene y salud, NO se admiten cambios ni devoluciones de ropa interior, trajes de baño, bodys ni medias, salvo falla evidente de fábrica reportada al recibir el paquete.

4. REEMBOLSOS
Solo se efectúan reembolsos de dinero en caso de que la prenda presente una falla de fábrica no reparable o no exista stock disponible para el reemplazo.`,
  },

  accesorios: {
    categoryId: 'accesorios',
    categoryLabel: 'Accesorios y Joyería',
    badge: 'Garantía y Cuidados',
    summary: 'Cambios dentro de 7 días en empaque original. Joyería con aretes exenta por higiene.',
    content: `1. CAMBIOS Y DEVOLUCIONES
Se admiten solicitudes de cambio de accesorios dentro de los 7 (siete) días calendario posteriores a la entrega del producto. El accesorio debe encontrarse sin uso, sin raspaduras y en su empaque/estuche original.

2. EXCEPCIÓN DE HIGIENE (ARETES Y PIERCINGS)
Por disposiciones sanitarias, los aretes, aros, piercings o accesorios de perforación corporal no están sujetos a cambio ni devolución una vez retirados de su empaque sellado.

3. GARANTÍA POR DEFECTO DE FABRICACIÓN
Todos nuestros accesorios cuentan con una garantía de 30 días calendario ante defectos de fabricación (broches rotos, engastes defectuosos). La garantía no cubre daños por caídas, golpes, contacto con agua, perfumes, cremas, alcohol u oxidación atribuible al uso indebido o PH de la piel.`,
  },

  cosmeticos: {
    categoryId: 'cosmeticos',
    categoryLabel: 'Cosméticos, Belleza y Cuidado Personal',
    badge: 'Precinto Intacto',
    summary: 'Solo se admiten cambios si el precinto de seguridad no ha sido abierto.',
    content: `1. CONDICIONES SANITARIAS ESTRICTAS (DIGEMID / SALUD)
Por tratarse de productos cosméticos, fórmulas para la piel, maquillaje y artículos de uso personal íntimo, NO se aceptan cambios ni devoluciones una vez que el producto haya sido abierto o su precinto de seguridad de fábrica haya sido retirado o vulnerado.

2. CONDICIONES PARA ADMITIR CAMBIO
Únicamente se aceptará el cambio o devolución si:
• El producto conserva su precinto de seguridad original totalmente intacto, sin señales de apertura ni manipulación.
• La solicitud se efectúa dentro de los 7 (siete) días calendario de recibido el pedido.

3. PRODUCTOS DEFECTUOSOS O CON REACCIÓN ADVERSA
En caso de que el dispensador o frasco presente falla de fábrica demostrable, el cliente deberá remitir fotos y video del lote del producto a nuestro WhatsApp dentro de las 48 horas de recibido para coordinar el reemplazo del producto.`,
  },

  tecnologia: {
    categoryId: 'tecnologia',
    categoryLabel: 'Tecnología, Gadgets y Electrónica',
    badge: 'Garantía Técnica',
    summary: 'Devolución por arrepentimiento (7 días sellado) y Garantía por falla de fábrica.',
    content: `1. DERECHO DE RETRACTO / DESISTIMIENTO (7 DÍAS)
El cliente podrá solicitar la devolución del producto dentro de los 7 (siete) días calendario posteriores a la compra, siempre y cuando el artículo se encuentre 100% NUEVO, con el empaque de fábrica SELLADO, con manuales, cables y todos sus accesorios completos sin abrir.

2. GARANTÍA POR FALLA DE FÁBRICA
Todos los dispositivos electrónicos cuentan con una garantía técnica de [especificar tiempo ej. 3 a 6 meses] por defectos atribuibles a fabricación.
Para hacer válida la garantía:
• Presentar el comprobante de compra o número de pedido.
• El producto pasará por una revisión técnica para descartar daños por mala manipulación (sobrevoltaje, golpes, rotura de pantalla, contacto con líquidos, sellos de seguridad violentados o software no autorizado).

3. PROCESO DE ATENCIÓN DE GARANTÍA
Una vez diagnosticada la falla de fábrica en el servicio técnico autorizado, se procederá con la reparación, el reemplazo por un equipo nuevo idéntico o la emisión de una nota de crédito/reembolso si no hubiera stock de reposición.`,
  },

  artesanias: {
    categoryId: 'artesanias',
    categoryLabel: 'Artesanías y Productos Personalizados',
    badge: 'Productos Hechos a Mano',
    summary: 'Bienes personalizados no admiten devolución por retracto, salvo falla en el transporte.',
    content: `1. PRODUCTOS HECHOS A MEDIDA O PERSONALIZADOS
De conformidad con las normas de protección al consumidor, los productos elaborados bajo pedido, hechos a mano, grabados, pintados o personalizados con nombres, medidas o especificaciones particulares del cliente NO admiten devolución ni cambios por arrepentimiento tras haberse iniciado o culminado la producción.

2. CARÁCTER ARTESANAL Y PIEZAS ÚNICAS
Las piezas artesanales pueden presentar ligeras variaciones naturales en tonos, vetas, texturas o acabados propios del trabajo manual y los materiales naturales (madera, arcilla, cuero, fibras textiles), las cuales no constituyen defectos de fabricación sino atributos de exclusividad de cada pieza.

3. DAÑOS DURANTE EL TRANSPORTE O ENVÍO
Si el producto artesanal llega quebrado, rajado o dañado durante el transporte, el cliente debe reportarlo dentro de las 24 horas de recibido con fotos claras del paquete y la pieza al WhatsApp de la tienda para reponer la pieza sin costo adicional.`,
  },

  mascotas: {
    categoryId: 'mascotas',
    categoryLabel: 'Mascotas y Veterinaria',
    badge: 'Salud Animal',
    summary: 'Alimentos solo en empaque cerrado y sellado. Accesorios sin uso hasta 7 días.',
    content: `1. ALIMENTOS Y SNACKS PARA MASCOTAS
Por seguridad sanitaria de las mascotas, los sacos de alimento balanceado, golosinas y snacks solo admiten cambio o devolución si el empaque original se encuentra 100% CERRADO y SELLADO de fábrica, dentro de los 7 días de recibido. No se aceptan bolsas abiertas o manipuladas.

2. ACCESORIOS, CORREAS Y CAMITAS
Se admiten cambios de talla en arneses, ropa o camitas dentro de los 7 (siete) días calendario de entrega, siempre que el producto no tenga pelos, manchas, mordeduras ni olores, y cuente con sus etiquetas originales.

3. PRODUCTOS DE HIGIENE Y FARMACOLOGÍA
Por razones sanitarias, los productos antipulgas, medicamentos, champús abiertos o productos de aseo usados no tienen derecho a cambio ni devolución.`,
  },

  hogar: {
    categoryId: 'hogar',
    categoryLabel: 'Hogar, Muebles y Decoración',
    badge: 'Garantía de Entrega',
    summary: 'Revisión en la entrega. Cambios por falla dentro de los 7 días con empaque original.',
    content: `1. REVISIÓN EN LA ENTREGA
Para artículos de vidrio, cerámica, espejos o muebles, recomendamos revisar el estado exterior del producto al momento de la entrega o recepción.

2. POLÍTICA DE CAMBIOS (7 DÍAS)
Aceptamos solicitudes de cambio dentro de los 7 (siete) días calendario de recibido el producto. El artículo debe estar sin uso, con todos sus manuales, herrajes y empaque original de protección.

3. GARANTÍA POR FALLA O ROTURA EN EL TRASLADO
Si el producto presenta un defecto de fabricación o sufrió un daño durante el transporte atribuible a la entrega, nos comprometemos a reemplazar la pieza o el producto sin costo alguno para el comprador, reportándolo dentro de las 48 horas de recibido.`,
  },

  otro: {
    categoryId: 'otro',
    categoryLabel: 'Comercio General',
    badge: 'Estándar INDECOPI',
    summary: 'Política comercial estándar de cambios en 7 días calendario con empaque intacto.',
    content: `1. POLÍTICA DE CAMBIOS Y DEVOLUCIONES
Se aceptan solicitudes de cambio de productos dentro de un plazo de 7 (siete) días calendario a partir de la fecha de entrega.

2. CONDICIONES DEL PRODUCTO
Para proceder con el cambio, el producto debe:
• Encontrarse en perfecto estado, sin señales de uso ni desgaste.
• Conservar sus empaques originales, etiquetas y accesorios completos.
• Acompañarse del comprobante de compra o número de pedido.

3. GARANTÍAS Y RECLAMOS
Cualquier falla atribuible a defectos de fabricación será atendida de manera prioritaria mediante reparación, reemplazo o reembolso según evaluación técnica. El cliente puede canalizar sus consultas o requerimientos a través de nuestro número oficial de WhatsApp.`,
  },
};

/**
 * Retorna la plantilla recomendada según el rubro de la tienda.
 * Si no coincide, retorna la plantilla de comercio general ('otro').
 */
export const getPolicyTemplateByCategory = (category?: string): PolicyTemplate => {
  if (!category) return STORE_POLICY_TEMPLATES.otro;
  const normalized = category.toLowerCase().trim();

  // Mapeos inteligentes para sinónimos frecuentes
  if (['comida', 'restaurante', 'alimentos', 'bebidas', 'pasteleria', 'panaderia', 'cafeteria'].some(k => normalized.includes(k))) {
    return STORE_POLICY_TEMPLATES.comida;
  }
  if (['ropa', 'calzado', 'moda', 'textil', 'vestimenta', 'zapatos'].some(k => normalized.includes(k))) {
    return STORE_POLICY_TEMPLATES.ropa;
  }
  if (['cosmeticos', 'belleza', 'maquillaje', 'skincare', 'cuidado personal'].some(k => normalized.includes(k))) {
    return STORE_POLICY_TEMPLATES.cosmeticos;
  }
  if (['tecnologia', 'gadgets', 'computo', 'celulares', 'electronica'].some(k => normalized.includes(k))) {
    return STORE_POLICY_TEMPLATES.tecnologia;
  }
  if (['artesanias', 'artesania', 'personalizados', 'regalos', 'hecho a mano'].some(k => normalized.includes(k))) {
    return STORE_POLICY_TEMPLATES.artesanias;
  }
  if (['mascotas', 'pet', 'veterinaria'].some(k => normalized.includes(k))) {
    return STORE_POLICY_TEMPLATES.mascotas;
  }
  if (['hogar', 'muebles', 'decoracion', 'bazar'].some(k => normalized.includes(k))) {
    return STORE_POLICY_TEMPLATES.hogar;
  }
  if (['accesorios', 'joyeria', 'relojes'].some(k => normalized.includes(k))) {
    return STORE_POLICY_TEMPLATES.accesorios;
  }

  return STORE_POLICY_TEMPLATES[normalized] || STORE_POLICY_TEMPLATES.otro;
};
