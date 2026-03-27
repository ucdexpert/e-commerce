'use client'

import { useState, useEffect } from 'react'
import { X, Shield, Smartphone } from 'lucide-react'

interface TwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: string) => Promise<void>
  isLoading?: boolean
}

export default function TwoFactorModal({
  isOpen,
  onClose,
  onVerify,
  isLoading = false
}: TwoFactorModalProps) {
  const [code, setCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === 6) {
      await onVerify(code)
      setCode('')
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-500">Enter your verification code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">Open your authenticator app</p>
              <p className="text-sm text-blue-700 mt-1">
                Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              autoFocus
            />
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${timeLeft > 10 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-500">
                Code expires in {timeLeft}s
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={code.length !== 6 || isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Can&apos;t access your authenticator app?{' '}
          <button className="text-blue-600 hover:underline font-medium">
            Contact support
          </button>
        </p>
      </div>
    </div>
  )
}
