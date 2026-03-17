'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { addressesApi, ordersApi, Address, Order } from '@/lib/api';
import { User, Mail, Phone, MapPin, Edit2, LogOut, Package, Heart, ShoppingBag } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout, fetchUser } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Set form values
    setValue('username', user.username);
    setValue('email', user.email);
    setValue('full_name', user.full_name || '');
    setValue('phone', user.phone || '');

    // Fetch addresses and orders
    fetchAddresses();
    fetchRecentOrders();
  }, [user, router, setValue]);

  const fetchAddresses = async () => {
    try {
      const response = await addressesApi.getAll();
      setAddresses(response.data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await ordersApi.getAll({ per_page: 5 });
      setRecentOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleProfileUpdate = async (data: any) => {
    try {
      await updateUser({
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-2">
          {/* Profile Info */}
          <div className="bg-white p-6 rounded-xl border mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="w-6 h-6" />
                Profile Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    {...register('username', { required: true })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                    type="email"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    {...register('full_name')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    {...register('phone')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user.full_name || user.username}</p>
                    <p className="text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6" />
                Recent Orders
              </h2>
              <button
                onClick={() => router.push('/orders')}
                className="text-primary hover:underline text-sm"
              >
                View All
              </button>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <div>
                      <p className="font-medium">Order #{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total.toFixed(2)}</p>
                      <p className="text-sm capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/orders')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
              >
                <Package className="w-5 h-5" />
                My Orders
              </button>
              <button
                onClick={() => router.push('/wishlist')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </button>
              <button
                onClick={() => router.push('/products')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Products
              </button>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Addresses
              </h2>
              <button
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-primary hover:underline text-sm"
              >
                {isEditingAddress ? 'Cancel' : '+ Add'}
              </button>
            </div>
            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-lg border ${
                      addr.is_default ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {addr.first_name} {addr.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {addr.address_line1}, {addr.city}
                        </p>
                        <p className="text-sm text-gray-500">
                          {addr.state} {addr.postal_code}
                        </p>
                      </div>
                      {addr.is_default && (
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No addresses saved</p>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
