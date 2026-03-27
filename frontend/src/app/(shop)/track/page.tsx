'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Calendar } from 'lucide-react'

const STATUS_STEPS = [
  { status: 'pending', label: 'Order Placed', icon: Package },
  { status: 'processing', label: 'Processing', icon: Clock },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
]

const statusMessages: Record<string, string> = {
  pending: 'Order received and pending confirmation',
  processing: 'Order is being prepared for shipment',
  shipped: 'Order has been shipped and is on its way',
  out_for_delivery: 'Order is out for delivery',
  delivered: 'Order delivered successfully',
  cancelled: 'Order has been cancelled',
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [trackingData, setTrackingData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    
    setLoading(true)
    setError('')
    setTrackingData(null)
    
    try {
      const res = await api.get(`/orders/track/${orderNumber.trim()}`)
      setTrackingData(res.data)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Order not found. Please check your order number.')
    } finally {
      setLoading(false)
    }
  }

  const getStepStatus = (stepStatus: string) => {
    const order = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered']
    const currentIndex = order.indexOf(trackingData?.status)
    const stepIndex = order.indexOf(stepStatus)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-500">
          Enter your order number to see real-time shipping updates
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="Order Number (e.g. ORD-12345678)"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={loading || !orderNumber.trim()}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          <Search className="w-5 h-5" />
          {loading ? 'Tracking...' : 'Track Order'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 flex items-start gap-3">
          <XCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Order #{trackingData.order_number}
                </h2>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Placed on {new Date(trackingData.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                trackingData.status === 'delivered' 
                  ? 'bg-green-100 text-green-700' 
                  : trackingData.status === 'cancelled' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {trackingData.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Tracking Number */}
            {trackingData.tracking_number && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                <p className="font-mono font-semibold text-gray-900">{trackingData.tracking_number}</p>
              </div>
            )}

            {/* Estimated Delivery */}
            {trackingData.estimated_delivery && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                <p className="font-semibold text-green-700">
                  {new Date(trackingData.estimated_delivery).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          {trackingData.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-6">Shipment Progress</h3>
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                <div className="space-y-6">
                  {STATUS_STEPS.map((step) => {
                    const stepStatus = getStepStatus(step.status)
                    const Icon = step.icon
                    return (
                      <div key={step.status} className="flex items-center gap-4 relative">
                        {/* Icon Circle */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-all ${
                          stepStatus === 'completed' 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                            : stepStatus === 'current' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <p className={`font-semibold ${
                            stepStatus === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {step.label}
                          </p>
                          {stepStatus === 'current' && (
                            <p className="text-sm text-blue-600 mt-0.5">In Progress</p>
                          )}
                          {stepStatus === 'completed' && (
                            <p className="text-sm text-green-600 mt-0.5">Completed</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tracking Events Timeline */}
          {trackingData.tracking_events?.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-6">Tracking History</h3>
              <div className="space-y-4">
                {[...trackingData.tracking_events].reverse().map((event: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      {i < trackingData.tracking_events.length - 1 && (
                        <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium capitalize text-gray-900">
                        {event.status?.replace(/_/g, ' ') || 'Status Update'}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">{event.message}</p>
                      {event.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </p>
                      )}
                      {event.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {trackingData.shipping_address && (
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Shipping To</h3>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  {trackingData.shipping_address.city && (
                    <p className="capitalize">{trackingData.shipping_address.city}</p>
                  )}
                  {trackingData.shipping_address.state && (
                    <p className="capitalize">{trackingData.shipping_address.state}</p>
                  )}
                  {trackingData.shipping_address.country && (
                    <p className="capitalize">{trackingData.shipping_address.country}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!trackingData && !loading && !error && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Order Tracked Yet</h3>
          <p className="text-gray-500">Enter your order number above to track its status</p>
        </div>
      )}
    </div>
  )
}
