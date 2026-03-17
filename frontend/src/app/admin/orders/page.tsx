'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Package,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { cn, formatPrice, formatDate } from '@/lib/utils';

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  items_count: number;
  created_at: string;
  items?: OrderItem[];
  shipping_address?: Address;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

interface Address {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

const statusTabs = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 15,
      };

      if (statusFilter !== 'all') {
        params.status_filter = statusFilter;
      }

      if (search) {
        params.search = search;
      }

      const response = await api.get('/admin/orders', { params });
      setOrders(response.data.orders || []);
      setTotalPages(response.data.total_pages || 1);
      setTotalOrders(response.data.total || 0);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: number) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
      
      // Update selected order if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Customer', 'Email', 'Total', 'Status', 'Date'];
    const csvData = orders.map((order) => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.total,
      order.status,
      order.created_at,
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Orders exported successfully');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      paid: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors',
              statusFilter === tab.value
                ? `bg-${tab.color}-500 text-white`
                : 'bg-white border hover:bg-gray-50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="min-w-[800px] w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">Order</th>
                <th className="p-4 text-left font-semibold">Customer</th>
                <th className="p-4 text-left font-semibold">Items</th>
                <th className="p-4 text-left font-semibold">Total</th>
                <th className="p-4 text-left font-semibold">Payment</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Date</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b animate-pulse">
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-8 w-24 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-semibold">#{order.order_number}</p>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{order.items_count} items</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">{formatPrice(order.total)}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm capitalize">{order.payment_method}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-sm font-medium capitalize',
                          getStatusColor(order.status)
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
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
              Showing {(currentPage - 1) * 15 + 1} to {Math.min(currentPage * 15, totalOrders)} of{' '}
              {totalOrders} orders
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

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Order #{selectedOrder.order_number}</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium capitalize',
                      getStatusColor(selectedOrder.status)
                    )}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium capitalize',
                      getStatusColor(selectedOrder.payment_status)
                    )}
                  >
                    {selectedOrder.payment_status}
                  </span>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Update Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    disabled={isUpdatingStatus}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{selectedOrder.customer_email}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Method:</span>{' '}
                      <span className="font-medium capitalize">{selectedOrder.payment_method}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Status:</span>{' '}
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium capitalize',
                          getStatusColor(selectedOrder.payment_status)
                        )}
                      >
                        {selectedOrder.payment_status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {selectedOrder.shipping_address.first_name}{' '}
                      {selectedOrder.shipping_address.last_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedOrder.shipping_address.address_line1}
                    </p>
                    {selectedOrder.shipping_address.address_line2 && (
                      <p className="text-sm text-gray-600">
                        {selectedOrder.shipping_address.address_line2}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{' '}
                      {selectedOrder.shipping_address.postal_code}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.shipping_address.country}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Phone className="w-4 h-4" />
                      <span>{selectedOrder.shipping_address.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold">Product</th>
                        <th className="p-3 text-center text-sm font-semibold">Qty</th>
                        <th className="p-3 text-right text-sm font-semibold">Price</th>
                        <th className="p-3 text-right text-sm font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            <p className="font-medium">{item.product_name}</p>
                          </td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">{formatPrice(item.price)}</td>
                          <td className="p-3 text-right font-semibold">
                            {formatPrice(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {selectedOrder.shipping_cost === 0 ? 'Free' : formatPrice(selectedOrder.shipping_cost)}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between py-2 text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t mt-2">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
