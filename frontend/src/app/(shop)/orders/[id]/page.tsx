'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter, Link } from 'next/navigation';
import { ordersApi, Order } from '@/lib/api';
import { ChevronLeft, Package, CreditCard, Truck, Calendar, Download, FileText, RotateCcw, X } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';

const returnReasons = [
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'damaged', label: 'Item damaged' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed mind' },
  { value: 'other', label: 'Other' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnData, setReturnData] = useState({
    reason: 'wrong_item',
    description: '',
  });

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await ordersApi.getById(Number(orderId));
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleDownloadInvoice = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const link = document.createElement('a');
    link.href = `${API_URL}/orders/${orderId}/invoice`;
    link.download = `invoice-${order?.order_number}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRequestReturn = () => {
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingReturn(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      await axios.post(`${API_URL}/orders/${orderId}/return-request`, {
        reason: returnData.reason,
        description: returnData.description,
      });

      toast.success('Return request submitted! We\'ll send you a prepaid return label via email.');
      setShowReturnModal(false);
      setReturnData({ reason: 'wrong_item', description: '' });
      
      // Refresh order data
      const response = await ordersApi.getById(Number(orderId));
      setOrder(response.data);
    } catch (error: any) {
      console.error('Failed to submit return request:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit return request');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Check if return is eligible
  const isReturnEligible = () => {
    if (order?.status !== 'delivered') return false;
    
    const deliveryDate = order.updated_at ? new Date(order.updated_at) : new Date();
    const now = new Date();
    const daysSinceDelivery = (now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceDelivery <= 30;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <button
          onClick={() => router.push('/orders')}
          className="px-6 py-2 bg-primary text-white rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Orders
      </button>

      {/* Order Header */}
      <div className="bg-white p-6 rounded-xl border mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Order #{order.order_number}</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={cn("px-4 py-2 rounded-full font-medium capitalize", getStatusColor(order.status))}>
              <Package className="w-4 h-4 inline mr-1" />
              {order.status}
            </span>
            <span className={cn("px-4 py-2 rounded-full font-medium capitalize", getStatusColor(order.payment_status))}>
              <CreditCard className="w-4 h-4 inline mr-1" />
              {order.payment_status}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium
                     hover:bg-primary-dark transition-all active:scale-95 shadow-md shadow-primary/20"
          >
            <Download className="w-4 h-4" />
            Download Invoice PDF
          </button>

          {isReturnEligible() && (
            <Link
              href={`/orders/${order.id}/return`}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium
                       hover:bg-amber-600 transition-all active:scale-95 shadow-md shadow-amber-500/30"
            >
              <RotateCcw className="w-4 h-4" />
              Request Return
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl border mb-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <img
                    src={item.product.images?.[0] || 'https://via.placeholder.com/100x100'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    {item.variant && Object.keys(item.variant).length > 0 && (
                      <p className="text-sm text-gray-500">
                        {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </p>
                    )}
                    <div className="flex justify-between mt-2">
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-bold text-primary">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-xl border mb-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {order.shipping_address && (
            <div className="bg-white p-6 rounded-xl border mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Address
              </h2>
              <address className="not-italic text-gray-600">
                <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                <p>{order.shipping_address.country}</p>
                <p>{order.shipping_address.phone}</p>
              </address>
            </div>
          )}
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white p-6 rounded-xl border mt-6">
        <h2 className="text-xl font-bold mb-4">Order Timeline</h2>
        <div className="flex flex-wrap gap-4">
          <div className={cn("flex-1 min-w-[150px] p-4 rounded-lg text-center", 
            order.created_at ? "bg-green-50" : "bg-gray-50"
          )}>
            <p className="text-sm text-gray-500">Order Placed</p>
            <p className="font-semibold">{formatDate(order.created_at)}</p>
          </div>
          {order.status !== 'pending' && order.status !== 'cancelled' && (
            <div className="flex-1 min-w-[150px] p-4 rounded-lg text-center bg-green-50">
              <p className="text-sm text-gray-500">Processing</p>
              <p className="font-semibold">{formatDate(order.updated_at)}</p>
            </div>
          )}
          {order.status === 'delivered' && (
            <>
              <div className="flex-1 min-w-[150px] p-4 rounded-lg text-center bg-green-50">
                <p className="text-sm text-gray-500">Shipped</p>
                <p className="font-semibold">{formatDate(order.shipped_at || order.updated_at)}</p>
              </div>
              <div className="flex-1 min-w-[150px] p-4 rounded-lg text-center bg-green-50">
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="font-semibold">{formatDate(order.delivered_at || order.updated_at)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Request Return</h2>
              <button
                onClick={() => setShowReturnModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReturn} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Order #{order?.order_number}</strong><br />
                  Total: {formatPrice(order?.total || 0)}
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return <span className="text-red-500">*</span>
                </label>
                <select
                  value={returnData.reason}
                  onChange={(e) => setReturnData({ ...returnData, reason: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {returnReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={returnData.description}
                  onChange={(e) => setReturnData({ ...returnData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Please provide more details about your return request..."
                />
              </div>

              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <p className="font-medium mb-2">What happens next?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>We'll review your request within 24 hours</li>
                  <li>You'll receive a prepaid return label via email</li>
                  <li>Pack the item securely and ship it back</li>
                  <li>Refund processed within 5-7 business days</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
