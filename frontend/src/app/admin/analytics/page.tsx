'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface AnalyticsStats {
  total_revenue: number;
  revenue_growth: number;
  total_orders: number;
  orders_growth: number;
  total_products: number;
  total_customers: number;
  average_order_value: number;
  conversion_rate: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  image: string;
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with actual API calls
      // const response = await api.get('/analytics/dashboard', { params: { range: timeRange } });
      
      // Mock data for demonstration
      setStats({
        total_revenue: 125750,
        revenue_growth: 12.5,
        total_orders: 1234,
        orders_growth: 8.3,
        total_products: 456,
        total_customers: 892,
        average_order_value: 102,
        conversion_rate: 3.2,
      });

      setSalesData([
        { date: '2026-03-01', revenue: 3200, orders: 32 },
        { date: '2026-03-02', revenue: 4100, orders: 41 },
        { date: '2026-03-03', revenue: 3800, orders: 38 },
        { date: '2026-03-04', revenue: 5200, orders: 52 },
        { date: '2026-03-05', revenue: 4800, orders: 48 },
        { date: '2026-03-06', revenue: 6100, orders: 61 },
        { date: '2026-03-07', revenue: 5800, orders: 58 },
        { date: '2026-03-08', revenue: 4200, orders: 42 },
        { date: '2026-03-09', revenue: 3900, orders: 39 },
        { date: '2026-03-10', revenue: 5500, orders: 55 },
        { date: '2026-03-11', revenue: 6200, orders: 62 },
        { date: '2026-03-12', revenue: 7100, orders: 71 },
        { date: '2026-03-13', revenue: 6800, orders: 68 },
        { date: '2026-03-14', revenue: 5200, orders: 52 },
        { date: '2026-03-15', revenue: 4900, orders: 49 },
      ]);

      setTopProducts([
        { id: 1, name: 'Premium Wireless Headphones', sales: 234, revenue: 23400, image: 'https://via.placeholder.com/48' },
        { id: 2, name: 'Smart Watch Pro', sales: 189, revenue: 18900, image: 'https://via.placeholder.com/48' },
        { id: 3, name: 'Laptop Stand Aluminum', sales: 156, revenue: 7800, image: 'https://via.placeholder.com/48' },
        { id: 4, name: 'Mechanical Keyboard RGB', sales: 142, revenue: 14200, image: 'https://via.placeholder.com/48' },
        { id: 5, name: 'USB-C Hub Multiport', sales: 128, revenue: 6400, image: 'https://via.placeholder.com/48' },
      ]);

      setCategoryData([
        { name: 'Electronics', value: 45 },
        { name: 'Clothing', value: 25 },
        { name: 'Home & Garden', value: 15 },
        { name: 'Sports', value: 10 },
        { name: 'Others', value: 5 },
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export analytics data
    console.log('Exporting analytics...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your store performance and sales</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats?.total_revenue || 0)}
          growth={stats?.revenue_growth || 0}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders || 0}
          growth={stats?.orders_growth || 0}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Products"
          value={stats?.total_products || 0}
          growth={0}
          icon={Package}
        />
        <StatCard
          title="Total Customers"
          value={stats?.total_customers || 0}
          growth={5.2}
          icon={Users}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg Order Value"
          value={formatPrice(stats?.average_order_value || 0)}
          growth={3.1}
          icon={CreditCard}
          variant="secondary"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats?.conversion_rate || 0}%`}
          growth={0.8}
          icon={TrendingUp}
          variant="secondary"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Revenue Overview</h3>
              <p className="text-sm text-muted-foreground">Daily revenue trends</p>
            </div>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" tickFormatter={(value) => value.slice(5)} />
              <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#667eea"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Orders Overview</h3>
              <p className="text-sm text-muted-foreground">Daily orders count</p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" tickFormatter={(value) => value.slice(5)} />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#764ba2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products & Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Top Products</h3>
              <p className="text-sm text-muted-foreground">Best selling products</p>
            </div>
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Category Distribution</h3>
              <p className="text-sm text-muted-foreground">Sales by category</p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  growth: number;
  icon: any;
  variant?: 'default' | 'secondary';
}

function StatCard({ title, value, growth, icon: Icon, variant = 'default' }: StatCardProps) {
  const isPositive = growth >= 0;

  return (
    <div className={`rounded-lg border p-6 ${variant === 'secondary' ? 'bg-muted/50' : 'bg-card'}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{growth}%
            </span>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'secondary' ? 'bg-primary/10' : 'bg-primary/20'}`}>
          <Icon className={`w-6 h-6 ${variant === 'secondary' ? 'text-primary' : 'text-primary'}`} />
        </div>
      </div>
    </div>
  );
}
