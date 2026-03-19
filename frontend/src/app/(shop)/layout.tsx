import type { Metadata } from 'next';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthSync from '@/components/AuthSync';

export const metadata: Metadata = {
  title: {
    default: 'E-Shop - Best Online Store for Quality Products',
    template: '%s | E-Shop'
  },
  description: 'Shop the latest products at unbeatable prices. Free shipping on orders over $100. Browse electronics, clothing, accessories, and more.',
  keywords: ['online shopping', 'e-commerce', 'electronics', 'clothing', 'accessories', 'deals'],
  authors: [{ name: 'E-Shop' }],
  creator: 'E-Shop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yoursite.com',
    siteName: 'E-Shop',
    title: 'E-Shop - Best Online Store',
    description: 'Shop the latest products at unbeatable prices. Free shipping on orders over $100.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'E-Shop - Online Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Shop - Best Online Store',
    description: 'Shop the latest products at unbeatable prices.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Auth Sync Component - Syncs NextAuth with Zustand */}
      <AuthSync />
      
      {/* Google Analytics - Only load if NEXT_PUBLIC_GA_ID is set */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      <Header />
      <main className="flex-1">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
      <CookieConsent />

      {/* Tawk.to Live Chat */}
      <Script
        id="tawk-to"
        src="https://embed.tawk.to/69ba7efbefc5d11c36928e8d/1jk0802q7"
        strategy="lazyOnload"
      />
    </div>
  );
}
