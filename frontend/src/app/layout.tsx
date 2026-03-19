import { Metadata } from 'next';
import Providers from './providers';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 
    'https://e-commerce-mu-wheat-87.vercel.app';

export const metadata: Metadata = {
    metadataBase: new URL(APP_URL),
    title: {
        default: 'E-Shop - Your One-Stop Destination for Quality Products',
        template: '%s | E-Shop'
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
    authors: [{ name: 'E-Shop' }],
    creator: 'E-Shop',
    publisher: 'E-Shop',
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
        title: 'E-Shop - Your One-Stop Destination for Quality Products',
        description: 'Shop quality products at amazing prices. Free shipping on orders over $100!',
        siteName: 'E-Shop',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'E-Shop - Your One-Stop Destination for Quality Products',
        description: 'Shop quality products at amazing prices. Free shipping on orders over $100!',
        creator: '@eshop',
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
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
