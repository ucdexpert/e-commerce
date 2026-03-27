'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';

interface OrderTracking {
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimated_delivery: string;
  current_location?: string;
  tracking_number?: string;
  courier?: string;
  timeline: TimelineEvent[];
  items: OrderItem[];
  shipping_address: Address;
  total: number;
}

interface TimelineEvent {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
  icon: any;
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Address {
  name: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setTracking({
        order_number: 'ORD-12345678',
        status: 'out_for_delivery',
        estimated_delivery: '2026-03-26',
        current_location: 'Local Delivery Hub - Your City',
        tracking_number: 'TRK123456789',
        courier: 'TCS',
        timeline: [
          {
            status: 'pending',
            title: 'Order Placed',
            description: 'Your order has been placed successfully',
            timestamp: '2026-03-20T10:30:00Z',
            completed: true,
            current: false,
            icon: Package,
          },
          {
            status: 'processing',
            title: 'Order Processing',
            description: 'Your order is being prepared',
            timestamp: '2026-03-21T09:00:00Z',
            completed: true,
            current: false,
            icon: Clock,
          },
          {
            status: 'shipped',
            title: 'Order Shipped',
            description: 'Your order has been shipped',
            timestamp: '2026-03-22T14:00:00Z',
            completed: true,
            current: false,
            icon: Truck,
          },
          {
            status: 'out_for_delivery',
            title: 'Out for Delivery',
            description: 'Your order is out for delivery',
            timestamp: '2026-03-26T08:00:00Z',
            completed: false,
            current: true,
            icon: MapPin,
          },
          {
            status: 'delivered',
            title: 'Delivered',
            description: 'Your order has been delivered',
            timestamp: '',
            completed: false,
            current: false,
            icon: CheckCircle,
          },
        ],
        items: [
          { id: 1, product_name: 'Premium Wireless Headphones', quantity: 1, price: 99.99, image: 'https://via.placeholder.com/80' },
          { id: 2, product_name: 'USB-C Cable', quantity: 2, price: 19.99, image: 'https://via.placeholder.com/80' },
        ],
        shipping_address: {
          name: 'John Doe',
          address_line1: '123 Main Street',
          city: 'Lahore',
          state: 'Punjab',
          postal_code: '54000',
          phone: '0300-1234567',
        },
        total: 139.97,
      });
      setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground">Invalid order number</p>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    out_for_delivery: 'bg-orange-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
        <p className="text-muted-foreground mt-2">Order #{tracking.order_number}</p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-2xl p-8 text-white ${statusColors[tracking.status]}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {tracking.status.replace(/_/g, ' ').toUpperCase()}
            </h2>
            <p className="text-white/90">
              {tracking.current_location && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {tracking.current_location}
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Estimated Delivery</p>
            <p className="text-2xl font-bold">
              {new Date(tracking.estimated_delivery).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-bold mb-6">Order Timeline</h2>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted"></div>

          <div className="space-y-8">
            {tracking.timeline.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      event.completed || event.current
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                      {event.timestamp && (
                        <Badge variant={event.current ? 'default' : 'outline'}>
                          {formatDate(event.timestamp)}
                        </Badge>
                      )}
                    </div>
                    {event.current && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        Current Status
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tracking Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Courier Info */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-bold mb-4">Shipping Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Courier</p>
              <p className="font-medium">{tracking.courier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tracking Number</p>
              <p className="font-mono">{tracking.tracking_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-medium">{new Date(tracking.estimated_delivery).toLocaleDateString()}</p>
            </div>
          </div>
          <button className="w-full mt-4 text-primary hover:underline text-sm font-medium">
            Track on Courier Website →
          </button>
        </div>

        {/* Shipping Address */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-bold mb-4">Shipping Address</h3>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{tracking.shipping_address.name}</p>
            <p className="text-muted-foreground">{tracking.shipping_address.address_line1}</p>
            <p className="text-muted-foreground">
              {tracking.shipping_address.city}, {tracking.shipping_address.state}{' '}
              {tracking.shipping_address.postal_code}
            </p>
            <p className="text-muted-foreground">{tracking.shipping_address.phone}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-bold mb-4">Order Items</h3>
        <div className="space-y-4">
          {tracking.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.product_name}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
          <div className="border-t pt-4 flex items-center justify-between">
            <p className="font-bold">Total</p>
            <p className="font-bold text-xl">{formatPrice(tracking.total)}</p>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h3 className="font-bold mb-2">Need Help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Have questions about your order? Contact our support team.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="text-primary hover:underline text-sm font-medium">
            Contact Support
          </button>
          <span className="text-muted-foreground">•</span>
          <button className="text-primary hover:underline text-sm font-medium">
            FAQ
          </button>
          <span className="text-muted-foreground">•</span>
          <button className="text-primary hover:underline text-sm font-medium">
            Return Policy
          </button>
        </div>
      </div>
    </div>
  );
}
