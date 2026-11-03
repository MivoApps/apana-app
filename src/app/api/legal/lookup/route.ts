import { NextResponse } from 'next/server';

/**
 * Algoritmo oficial de validación de RUC de SUNAT (Módulo 11)
 * Longitud: 11 dígitos. Prefijos válidos: 10, 15, 16, 17, 20.
 */
function isValidRUC(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc)) return false;
  const validPrefixes = ['10', '15', '16', '17', '20'];
  if (!validPrefixes.some((p) => ruc.startsWith(p))) return false;

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(ruc.charAt(i), 10) * weights[i];
  }
  const remainder = sum % 11;
  let checkDigit = 11 - remainder;
  if (checkDigit === 10) checkDigit = 0;
  else if (checkDigit === 11) checkDigit = 1;

  return parseInt(ruc.charAt(10), 10) === checkDigit;
}

/**
 * Validación de DNI peruano (8 dígitos numéricos válidos)
 */
function isValidDNI(dni: string): boolean {
  return /^\d{8}$/.test(dni) && dni !== '00000000';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type')?.toUpperCase();
  const number = searchParams.get('number')?.trim();

  if (!type || !number) {
    return NextResponse.json(
      { success: false, error: 'Parámetros incompletos. Se requiere type (DNI o RUC) y number.' },
      { status: 400 }
    );
  }

  // 1. Validaciones sintácticas y matemáticas oficiales
  if (type === 'DNI') {
    if (!isValidDNI(number)) {
      return NextResponse.json(
        { success: false, error: 'El DNI debe contener exactamente 8 dígitos numéricos válidos.' },
        { status: 400 }
      );
    }
  } else if (type === 'RUC') {
    if (!isValidRUC(number)) {
      return NextResponse.json(
        { success: false, error: 'El RUC no es válido. Debe tener 11 dígitos y cumplir con el dígito de control de SUNAT.' },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { success: false, error: 'Tipo de documento inválido. Solo se admite DNI o RUC.' },
      { status: 400 }
    );
  }

  // 2. Consulta a servicios oficiales / pasarelas de identidad peruanas
  const apiToken = process.env.PERU_LEGAL_API_TOKEN || process.env.APIS_NET_PE_TOKEN || '';

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`;
    }

    if (type === 'RUC') {
      // Intentar consulta a servicio SUNAT (v1 abierto o v2 con token)
      const rucUrl = apiToken
        ? `https://api.apis.net.pe/v2/sunat/ruc?numero=${number}`
        : `https://api.apis.net.pe/v1/ruc?numero=${number}`;

      const res = await fetch(rucUrl, {
        headers,
        next: { revalidate: 86400 }, // Cache 24h
      });

      if (res.ok) {
        const data = await res.json();
        const businessName = data.razonSocial || data.nombre || '';
        const addressBase = data.direccion || data.direccionCompleta || '';
        const location = [data.distrito, data.provincia, data.departamento].filter(Boolean).join(', ');
        const fullAddress = addressBase && location && !addressBase.includes(location)
          ? `${addressBase.trim()}, ${location}`
          : addressBase.trim();
        const status = data.estado || 'ACTIVO';
        const condition = data.condicion || 'HABIDO';

        if (status && status !== 'ACTIVO') {
          return NextResponse.json({
            success: false,
            error: `El RUC se encuentra en estado "${status}" en SUNAT. Solo se admiten RUCs activos.`,
            status,
          });
        }

        if (businessName) {
          return NextResponse.json({
            success: true,
            type: 'RUC',
            number,
            businessName: businessName.trim().toUpperCase(),
            address: fullAddress,
            status,
            condition,
            source: 'SUNAT',
          });
        }
      }
    } else if (type === 'DNI') {
      // Consulta a servicio RENIEC (v1 abierto o v2 con token)
      const dniUrl = apiToken
        ? `https://api.apis.net.pe/v2/reniec/dni?numero=${number}`
        : `https://api.apis.net.pe/v1/dni?numero=${number}`;

      const res = await fetch(dniUrl, {
        headers,
        next: { revalidate: 86400 }, // Cache 24h
      });

      if (res.ok) {
        const data = await res.json();
        const names = data.nombres || '';
        const firstSurname = data.apellidoPaterno || '';
        const secondSurname = data.apellidoMaterno || '';
        const fullName = data.nombre || data.nombreCompleto || `${names} ${firstSurname} ${secondSurname}`.trim();
        const address = data.direccion || '';

        if (fullName) {
          return NextResponse.json({
            success: true,
            type: 'DNI',
            number,
            businessName: fullName.trim().toUpperCase(),
            address: address.trim(),
            source: 'RENIEC',
          });
        }
      }
    }
  } catch (err) {
    console.warn(`Aviso consultando API legal peruana (${type} ${number}):`, err);
  }

  // 3. Fallback en caso de que la API pública esté inaccesible o requiera token en producción
  // Informamos que el formato matemático es 100% válido para permitir guardado sin bloquear al usuario
  return NextResponse.json({
    success: true,
    type,
    number,
    businessName: '',
    address: '',
    validFormat: true,
    isManualFallback: true,
    message: 'Formato verificado correctamente. Por favor completa los datos de tu titularidad.',
  });
}
