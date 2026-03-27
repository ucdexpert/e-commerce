'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Mail, Lock, User, Eye, EyeOff, Gift } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    // Auto-fill referral code from URL if present
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend password validation
    const password = formData.password;
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || undefined,
        phone: formData.phone || undefined,
        referral_code: referralCode || undefined,
      });
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.detail;

      if (msg?.includes('email already') || msg?.includes('Email')) {
        setError('Yeh email pehle se registered hai');
      } else if (msg?.includes('username')) {
        setError('Yeh username already le liya gaya hai');
      } else if (msg) {
        setError(msg);
      } else {
        setError('Account nahi ban saka. Dobara try karein');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-600">Sign up to start shopping</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Name (Optional)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One lowercase letter</li>
                <li>• One number</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="ABCD1234"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase tracking-widest font-mono"
                />
              </div>
              {referralCode && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Gift className="w-3 h-3" /> Your referrer will earn $10 when you sign up!
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
