'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';

interface ProvidersProps {
    children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    const fetchUser = useAuthStore((state) => state.fetchUser);
    const fetchCart = useCartStore((state) => state.fetchCart);
    const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Set axios header FIRST before making any API calls
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Then fetch data
            fetchUser();
            fetchCart();
            fetchWishlist();
        }
    }, [fetchUser, fetchCart, fetchWishlist]);

    return (
        <SessionProvider>
            {children}
            <Toaster
                position="top-center"
                gutter={8}
                toastOptions={{
                    style: { maxWidth: '90vw' }
                }}
            />
        </SessionProvider>
    );
}
