/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com https://embed.tawk.to https://*.tawk.to https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.stripe.com https://embed.tawk.to https://*.tawk.to",
              "font-src 'self' data: https://fonts.gstatic.com https://embed.tawk.to https://*.tawk.to",
              "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://via.placeholder.com https://images.unsplash.com https://*.stripe.com https://embed.tawk.to https://*.tawk.to",
              "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://*.hf.space https://*.huggingface.co https://*.vercel.app ws://localhost:3000 wss://localhost:3000 https://api.stripe.com https://*.stripe.com wss://*.tawk.to https://*.tawk.to https://embed.tawk.to",
              "frame-src 'self' https://js.stripe.com https://*.stripe.com https://hooks.stripe.com https://embed.tawk.to https://*.tawk.to",
              "worker-src 'self' blob:",
              "media-src 'self' https://*.tawk.to",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;