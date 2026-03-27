'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Copy, Gift, Users, DollarSign, Share2, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReferralPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/referral')
      return
    }

    const fetch = async () => {
      try {
        const [refData, refList] = await Promise.all([
          api.get('/referral/my-referral'),
          api.get('/referral/referrals')
        ])
        setData(refData.data)
        setReferrals(refList.data || [])
      } catch (e: any) {
        console.error('Referral fetch error:', e)
        toast.error(e.response?.data?.detail || 'Failed to load referral data')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [isAuthenticated])

  const copyCode = () => {
    if (data?.referral_code) {
      navigator.clipboard.writeText(data.referral_code)
      toast.success('Referral code copied!')
    }
  }

  const copyLink = () => {
    if (data?.referral_link) {
      navigator.clipboard.writeText(data.referral_link)
      toast.success('Referral link copied!')
    }
  }

  const shareWhatsApp = () => {
    if (data?.referral_code && data?.referral_link) {
      const msg = encodeURIComponent(
        `🎁 Join E-Shop using my referral code ${data.referral_code} and get amazing discounts! Sign up here: ${data.referral_link}`
      )
      window.open(`https://wa.me/?text=${msg}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Referral Program</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Invite friends and earn <strong>$10</strong> for every friend who signs up!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: Users,
            label: 'Total Referrals',
            value: data?.total_referrals || 0,
            color: 'blue'
          },
          {
            icon: Gift,
            label: 'Completed',
            value: data?.completed_referrals || 0,
            color: 'green'
          },
          {
            icon: DollarSign,
            label: 'Total Earned',
            value: `$${(data?.total_earned || 0).toFixed(2)}`,
            color: 'purple'
          }
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border p-4 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <stat.icon className={`w-6 h-6 text-${stat.color}-600 mx-auto mb-2`} />
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Referral Code Section */}
      <div className="bg-white rounded-xl border p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Your Referral Code</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <div className="flex-1 w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
            <span className="text-3xl font-bold text-blue-600 tracking-widest">
              {data?.referral_code || 'Generating...'}
            </span>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
          >
            <Copy className="w-4 h-4" /> Copy Code
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
            <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={data?.referral_link || ''}
              readOnly
              className="flex-1 text-sm text-gray-600 bg-transparent outline-none"
            />
          </div>
          <button
            onClick={copyLink}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl border p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Share Your Code',
              desc: 'Share your unique referral code with friends'
            },
            {
              step: '2',
              title: 'Friend Signs Up',
              desc: 'Your friend registers using your code'
            },
            {
              step: '3',
              title: 'Earn Reward',
              desc: 'You earn $10 for every successful referral'
            }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals List */}
      {referrals.length > 0 ? (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">
            Your Referrals ({referrals.length})
          </h2>
          <div className="space-y-3">
            {referrals.map((ref: any) => (
              <div
                key={ref.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">Referral #{ref.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(ref.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ref.status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {ref.status}
                  </span>
                  {ref.status === 'completed' && (
                    <span className="text-green-600 font-bold">+$10</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-8 text-center shadow-sm">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Referrals Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start sharing your referral code to earn rewards!
          </p>
        </div>
      )}
    </div>
  )
}
