import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn Callback:', {
        email: user?.email,
        provider: account?.provider,
      });

      try {
        if (account?.provider === "google") {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

          console.log('Calling backend social-login...');

          const response = await fetch(`${API_URL}/auth/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email!,
              name: user.name || profile?.name || "",
              provider: account.provider,
              provider_id: account.providerAccountId,
              picture: profile?.picture || user.image || null,
            }),
          })

          console.log('Backend response status:', response.status);

          if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            console.error("Social login error:", error)
            return false
          }

          const data = await response.json()
          console.log('Backend response data:', { 
            hasToken: !!data.access_token,
            hasUser: !!data.user 
          });

          // Store backend token and user
          if (data.access_token) {
            user.backendToken = data.access_token
            user.backendUser = data.user || user
          }

          return true
        }
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },

    async jwt({ token, user, account }) {
      console.log('JWT Callback:', { 
        hasUser: !!user, 
        hasAccount: !!account,
        hasBackendToken: !!user?.backendToken 
      });

      // Persist backend token from sign in
      if (user?.backendToken) {
        token.backendToken = user.backendToken as string
        token.backendUser = user.backendUser
      }

      // Handle token refresh on initial sign in
      if (account && user) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

          const response = await fetch(`${API_URL}/auth/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email!,
              name: user.name || "",
              provider: account.provider,
              provider_id: account.providerAccountId,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            token.backendToken = data.access_token
            token.backendUser = data.user
          }
        } catch (error) {
          console.error('JWT callback error:', error)
        }
      }

      return token
    },

    async session({ session, token, user }) {
      console.log('Session Callback:', { 
        hasToken: !!token.backendToken,
        hasUser: !!token.backendUser 
      });

      // Add backend token and user to session
      session.backendToken = token.backendToken as string
      session.backendUser = token.backendUser
      session.user = {
        ...session.user,
        ...token.backendUser,
        accessToken: token.backendToken as string,
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
