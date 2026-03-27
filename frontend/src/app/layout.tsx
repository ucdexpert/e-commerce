import { Metadata } from 'next';
import Providers from './providers';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ||
    'https://e-commerce-mu-wheat-87.vercel.app';

export const metadata: Metadata = {
    metadataBase: new URL(APP_URL),
    title: {
        default: 'CartHub - Your One-Stop Destination for Quality Products',
        template: '%s | CartHub'
    },
    description: 'Shop quality products at amazing prices. We offer the best selection with unbeatable customer service. Free shipping on orders over $100!',
    keywords: [
        'e-commerce',
        'online shopping',
        'Pakistan',
        'buy online',
        'shopping',
        'products',
        'deals',
        'discounts'
    ],
    authors: [{ name: 'CartHub' }],
    creator: 'CartHub',
    publisher: 'CartHub',
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
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: APP_URL,
        title: 'CartHub - Your One-Stop Destination for Quality Products',
        description: 'Shop quality products at amazing prices. Free shipping on orders over $100!',
        siteName: 'CartHub',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CartHub - Your One-Stop Destination for Quality Products',
        description: 'Shop quality products at amazing prices. Free shipping on orders over $100!',
        creator: '@carthub',
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    alternates: {
        canonical: APP_URL,
    },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CartHub',
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-317-0219387',
      contactType: 'customer service',
    },
    sameAs: [
      'https://www.facebook.com/uzairkhilji.uzairkhilji',
      'https://www.instagram.com/uzairkhilji.uzairkhilji',
      'https://x.com/UzairKhilj60869',
    ],
  };

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-screen">
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
