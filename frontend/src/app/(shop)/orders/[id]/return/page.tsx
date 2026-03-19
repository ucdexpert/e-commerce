'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import { RotateCcw, ChevronLeft, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const returnReasons = [
  { value: 'defective_damaged', label: 'Defective/Damaged', icon: '🔨', color: 'red' },
  { value: 'wrong_item', label: 'Wrong item received', icon: '📦', color: 'orange' },
  { value: 'not_as_described', label: 'Not as described', icon: '📝', color: 'yellow' },
  { value: 'quality_issue', label: 'Quality issue', icon: '⭐', color: 'blue' },
  { value: 'changed_mind', label: 'Changed my mind', icon: '💭', color: 'purple' },
  { value: 'size_issue', label: 'Size/Fit issue', icon: '📏', color: 'green' },
  { value: 'late_delivery', label: 'Late delivery', icon: '⏰', color: 'gray' },
  { value: 'other', label: 'Other', icon: '❓', color: 'gray' },
];

export default function ReturnRequestPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await ordersApi.getById(Number(orderId));
        setOrder(response.data);
        
        // Pre-select all items
        if (response.data?.items) {
          setSelectedItems(response.data.items.map((item: any) => item.product_id));
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleItemToggle = (productId: number) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + uploadedFiles.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    const newFiles = files.slice(0, 5 - uploadedFiles.length);
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    if (!reason) {
      toast.error('Please select a return reason');
      return;
    }

    if (description.trim().length < 20) {
      toast.error('Please provide a detailed description (at least 20 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token');

      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('items', JSON.stringify(selectedItems));
      formData.append('reason', reason);
      formData.append('description', description);

      uploadedFiles.forEach(file => {
        formData.append('photos', file);
      });

      await axios.post(`${API_URL}/orders/${orderId}/return-request`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(
        <div>
          <p className="font-semibold">Return request submitted!</p>
          <p className="text-sm">We\'ll send you a prepaid return label via email.</p>
        </div>,
        { duration: 5000 }
      );

      // Redirect to order detail page
      setTimeout(() => {
        router.push(`/orders/${orderId}?return_submitted=true`);
      }, 2000);

    } catch (error: any) {
      console.error('Failed to submit return request:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit return request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you\'re looking for doesn\'t exist.</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const canReturn = order.status === 'delivered';
  const returnWindow = 30; // days
  const deliveryDate = new Date(order.updated_at);
  const daysSinceDelivery = Math.floor(
    (new Date().getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(0, returnWindow - daysSinceDelivery);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Order</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request a Return</h1>
              <p className="text-sm text-gray-600">Order #{order.order_number}</p>
            </div>
          </div>
        </div>

        {/* Return Window Alert */}
        {canReturn && daysRemaining > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Return Window Available</p>
                <p className="text-sm text-blue-700 mt-1">
                  You have <span className="font-bold">{daysRemaining}</span> days remaining to return this order.
                </p>
              </div>
            </div>
          </div>
        )}

        {!canReturn && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Return Not Available</p>
                <p className="text-sm text-red-700 mt-1">
                  This order cannot be returned in its current status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <label
                key={item.product_id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedItems.includes(item.product_id)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.product_id)}
                  onChange={() => handleItemToggle(item.product_id)}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                />
                
                <img
                  src={item.product?.images?.[0] || 'https://via.placeholder.com/60x60'}
                  alt={item.product?.name || 'Product'}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.product?.name || 'Product'}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="text-sm font-medium text-blue-600">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Selected items: <span className="font-semibold">{selectedItems.length}</span>
          </p>
        </div>

        {/* Return Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Return Reason</h2>
            <p className="text-sm text-gray-600 mb-4">Why do you want to return these items?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {returnReasons.map((reasonOption) => (
                <button
                  key={reasonOption.value}
                  type="button"
                  onClick={() => setReason(reasonOption.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    reason === reasonOption.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reasonOption.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{reasonOption.label}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide more details about why you're returning this item..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all"
                required
                minLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 20 characters. Current: {description.length}
              </p>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Upload Photos <span className="text-gray-400 font-normal">(Optional)</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload photos to help us understand the issue better (max 5 photos)
            </p>

            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB each)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploadedFiles.length >= 5}
                />
              </label>
            </div>

            {/* Photo Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push(`/orders/${orderId}`)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !canReturn || selectedItems.length === 0 || !reason}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5" />
                  Submit Return Request
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By submitting this request, you agree to our Return Policy.
            You\'ll receive a prepaid return label via email within 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
