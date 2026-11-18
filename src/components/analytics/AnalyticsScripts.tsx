'use client';

import React, { useEffect, Suspense } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  GA_TRACKING_ID,
  META_PIXEL_ID,
  captureUtmParams,
  trackPageView,
} from '@/lib/analytics';

function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Capturar cualquier parámetro UTM si viene en la URL
    if (searchParams) {
      captureUtmParams(searchParams);
    }

    // 2. Notificar vista de página (PageView)
    const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(currentUrl);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsScripts() {
  return (
    <>
      {/* 1. Google Analytics 4 (GA4) */}
      {GA_TRACKING_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* 2. Meta Pixel (Facebook & Instagram Ads) */}
      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt="Meta Pixel"
            />
          </noscript>
        </>
      )}

      {/* 3. Escuchador de navegación para UTMs y PageViews en SPA */}
      <Suspense fallback={null}>
        <NavigationTracker />
      </Suspense>
    </>
  );
}
