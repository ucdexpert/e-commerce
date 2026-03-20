'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';

export function useSyncAuth() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only run for Google OAuth sessions (NextAuth authenticated)
    if (status !== 'authenticated') return;
    if (!session?.backendToken) return;

    const backendToken = session.backendToken as string;

    // Check if we already have this token saved
    const existingToken = localStorage.getItem('access_token');
    if (existingToken === backendToken) return;

    // Save Google OAuth backend token
    localStorage.setItem('access_token', backendToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;

    // Update store with user from session
    if (session.backendUser) {
      useAuthStore.setState({
        isAuthenticated: true,
        user: session.backendUser as any,
      });
    }

  }, [session, status]);
}
