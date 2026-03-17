'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  TicketPercent,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Percent,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(0, 'Must be positive'),
  min_order_amount: z.number().min(0).optional(),
  max_discount_amount: z.number().min(0).optional(),
  usage_limit: z.number().min(1).optional(),
  expires_at: z.string().optional(),
  is_active: z.boolean(),
});

type CouponFormData = z.infer<typeof couponSchema> & { is_active: boolean };

interface Coupon {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 0,
      max_discount_amount: undefined,
      usage_limit: undefined,
      expires_at: '',
      is_active: true,
    },
  });

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/coupons', {
        params: { page: currentPage, per_page: 15 },
      });
      setCoupons(response.data || []);
      setTotalPages(Math.ceil((response.data.length || 0) / 15));
      setTotalCoupons(response.data.length || 0);
    } catch (error: any) {
      console.error('Failed to fetch coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SAVE';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('code', code);
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      reset({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount,
        max_discount_amount: coupon.max_discount_amount,
        usage_limit: coupon.usage_limit,
        expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
        is_active: coupon.is_active,
      });
    } else {
      setEditingCoupon(null);
      reset({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 0,
        max_discount_amount: undefined,
        usage_limit: undefined,
        expires_at: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const onSubmit = async (data: CouponFormData) => {
    try {
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, data);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/admin/coupons', data);
        toast.success('Coupon created successfully');
      }
      handleCloseModal();
      fetchCoupons();
    } catch (error: any) {
      console.error('Failed to save coupon:', error);
      toast.error(error.response?.data?.detail || 'Failed to save coupon');
    }
  };

  const handleDelete = async (couponId: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      setIsDeleting(true);
      await api.delete(`/admin/coupons/${couponId}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error: any) {
      console.error('Failed to delete coupon:', error);
      toast.error('Failed to delete coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage discount codes and promotions
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Coupons</p>
              <p className="text-2xl font-bold">{totalCoupons}</p>
            </div>
            <TicketPercent className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Coupons</p>
              <p className="text-2xl font-bold">
                {coupons.filter((c) => c.is_active && !isExpired(c.expires_at)).length}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Coupons</p>
              <p className="text-2xl font-bold">
                {coupons.filter((c) => isExpired(c.expires_at)).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">Code</th>
                <th className="p-4 text-left font-semibold">Discount</th>
                <th className="p-4 text-left font-semibold">Min Order</th>
                <th className="p-4 text-left font-semibold">Usage</th>
                <th className="p-4 text-left font-semibold">Expiry</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b animate-pulse">
                    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
                    <td className="p-4"><div className="h-8 w-24 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No coupons found. Create your first coupon to get started.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {coupon.discount_type === 'percentage' ? (
                          <Percent className="w-4 h-4 text-blue-600" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-green-600" />
                        )}
                        <span className="font-semibold">
                          {coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}%`
                            : `Rs. ${coupon.discount_value}`}
                        </span>
                      </div>
                      {coupon.max_discount_amount && (
                        <p className="text-xs text-gray-500">
                          Max: Rs. {coupon.max_discount_amount}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm">
                        {coupon.min_order_amount > 0
                          ? `Rs. ${coupon.min_order_amount}`
                          : 'No minimum'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <span className="font-medium">{coupon.used_count}</span>
                        {coupon.usage_limit && (
                          <span className="text-gray-500"> / {coupon.usage_limit}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {coupon.expires_at ? (
                        <div className={cn('text-sm', isExpired(coupon.expires_at) && 'text-red-600')}>
                          {formatDate(coupon.expires_at)}
                          {isExpired(coupon.expires_at) && (
                            <span className="text-xs text-red-600 block">Expired</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No expiry</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-sm font-medium capitalize',
                          coupon.is_active && !isExpired(coupon.expires_at)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {coupon.is_active && !isExpired(coupon.expires_at) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(coupon)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          disabled={isDeleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * 15 + 1} to {Math.min(currentPage * 15, totalCoupons)} of{' '}
              {totalCoupons} coupons
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Coupon Code *
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('code')}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    placeholder="SAVE20"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Generate
                  </button>
                </div>
                {errors.code && (
                  <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 20% off on all electronics"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Type *
                  </label>
                  <select
                    {...register('discount_type')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('discount_value', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={watch('discount_type') === 'percentage' ? '20' : '100'}
                  />
                  {errors.discount_value && (
                    <p className="text-red-500 text-sm mt-1">{errors.discount_value.message}</p>
                  )}
                </div>
              </div>

              {/* Min Order Amount */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum Order Amount (Rs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('min_order_amount', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave as 0 for no minimum
                </p>
              </div>

              {/* Max Discount */}
              {watch('discount_type') === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Maximum Discount Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('max_discount_amount', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cap the discount for percentage coupons
                  </p>
                </div>
              )}

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  {...register('usage_limit', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for unlimited uses
                </p>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  {...register('expires_at')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no expiry
                </p>
              </div>

              {/* Is Active */}
              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                <span className="font-medium">Active</span>
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-5 h-5 rounded"
                />
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
