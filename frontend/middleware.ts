import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/profile',
  '/orders',
  '/checkout',
  '/wishlist',
  '/cart',
  '/admin',
];

// Routes that require admin role
const adminRoutes = [
  '/admin',
  '/admin/products',
  '/admin/orders',
  '/admin/users',
  '/admin/categories',
  '/admin/coupons',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookie
  const token = request.cookies.get('access_token')?.value;
  
  // Get user role from cookie (stored during login)
  const userRole = request.cookies.get('user_role')?.value;
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if route requires admin access
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Redirect to login if no token and trying to access protected route
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect to home if not admin and trying to access admin route
  if (isAdminRoute && token && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirect to admin dashboard if admin tries to access login/register
  if (token && userRole === 'admin') {
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  // Redirect to profile if regular user tries to access login/register
  if (token && userRole === 'customer') {
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
