import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const headers = request.headers;

  // Intentar leer headers provistos por Cloudflare, Vercel, o GCP Load Balancers
  const cfCountry = headers.get('cf-ipcountry');
  const cfCity = headers.get('cf-ipcity');
  const vercelCountry = headers.get('x-vercel-ip-country');
  const vercelCity = headers.get('x-vercel-ip-city');

  // IP del cliente
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');

  let country = cfCountry || vercelCountry || '';
  let city = cfCity || vercelCity || '';

  // Si no está en Cloudflare/Vercel (ej. localhost o VM sin headers de proxy geo), consultar servicio ligero gratis
  if (!country && ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        country = data.country_code || data.country || '';
        city = data.city || '';
      }
    } catch {
      // Si falla o hay rate limit, fallback silencioso
    }
  }

  // Fallback por defecto si estamos en entorno local de pruebas
  if (!country) {
    country = 'PE';
    city = 'Lima';
  }

  return NextResponse.json({
    ip,
    country: country.toUpperCase(),
    city: city || 'Lima',
  });
}
