'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { authApi } from '@/lib/api';

export function useSyncAuth() {
  const { data: session } = useSession();

  useEffect(() => {
    const syncLogin = async () => {
      if (session?.backendToken) {
        console.log('Syncing auth state from NextAuth session:', {
          hasToken: !!session.backendToken,
          hasUser: !!session.backendUser,
        });

        try {
          const token = session.backendToken as string

          // Save tokens to localStorage (same as normal login)
          localStorage.setItem('access_token', token)
          
          // Note: Social login doesn't return refresh_token
          // We'll save it as empty string for consistency
          localStorage.setItem('refresh_token', '')

          // Fetch user data from backend (same as normal login)
          const userResponse = await authApi.getMe()
          const user = userResponse.data

          console.log('User fetched:', user)

          // Save user info (same as normal login)
          localStorage.setItem('user', JSON.stringify(user))

          // Set cookies for middleware (same as normal login)
          document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
          document.cookie = `user_role=${user.is_superuser ? 'admin' : 'customer'}; path=/; max-age=${60 * 60 * 24 * 7}`

          // Update Zustand store (same as normal login)
          useAuthStore.setState({
            user,
            isAuthenticated: true,
          })

          console.log('Auth state updated successfully:', {
            isAuthenticated: useAuthStore.getState().isAuthenticated,
            user: useAuthStore.getState().user,
          })
        } catch (error) {
          console.error('Failed to sync auth state:', error)
          
          // Clear any partial state on error
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          useAuthStore.setState({
            isAuthenticated: false,
            user: null,
          })
        }
      }
    }

    syncLogin()
  }, [session?.backendToken])
}
