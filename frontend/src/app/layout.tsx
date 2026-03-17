'use client';

import { useEffect } from 'react';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
      fetchCart();
      fetchWishlist();
    }
  }, [fetchUser, fetchCart, fetchWishlist]);

  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <Toaster position="top-right" gutter={8} />
      </body>
    </html>
  );
}
