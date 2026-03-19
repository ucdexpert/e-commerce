'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided');
            return;
        }

        axios.get(`${API_URL}/auth/verify-email?token=${token}`)
            .then((response) => {
                setStatus('success');
                setMessage(response.data.message);
                // Redirect to login after 3 seconds
                setTimeout(() => router.push('/login'), 3000);
            })
            .catch((error) => {
                setStatus('error');
                setMessage(error.response?.data?.detail || 'Verification failed. Link may be expired.');
            });
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                {status === 'loading' && (
                    <>
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Verifying Your Email...
                        </h2>
                        <p className="text-gray-500">
                            Please wait while we verify your email address
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-xl font-bold text-green-600 mb-2">
                            Email Verified!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {message}
                        </p>
                        <div className="w-full bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
                            <p className="text-green-700 text-sm">
                                Redirecting to login...
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-5xl mb-4">❌</div>
                        <h2 className="text-xl font-bold text-red-600 mb-2">
                            Verification Failed
                        </h2>
                        <p className="text-gray-500 mb-4">
                            {message}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Go to Login
                            </button>
                            <button
                                onClick={() => router.push('/register')}
                                className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Create New Account
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
