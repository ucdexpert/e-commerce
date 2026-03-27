'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Mail,
  Users,
  CheckCircle,
  XCircle,
  Download,
  Send,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string;
}

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  by_source: { source: string; count: number }[];
  recent_subscriptions: number;
}

interface SubscribersResponse {
  subscribers: Subscriber[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  stats: {
    total: number;
    active: number;
    unsubscribed: number;
  };
}

export default function AdminNewsletterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [subscribersStats, setSubscribersStats] = useState<{ total: number; active: number; unsubscribed: number } | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [sourceFilter, setSourceFilter] = useState('');
  
  // Campaign modal
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignContent, setCampaignContent] = useState('');
  const [campaignTestEmail, setCampaignTestEmail] = useState('');
  const [sendingCampaign, setSendingCampaign] = useState(false);
  
  // Export loading
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin');
      return;
    }
    
    if (status === 'authenticated') {
      fetchSubscribers();
      fetchStats();
    }
  }, [status, page, search, statusFilter, sourceFilter]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: perPage };
      
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status_filter = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      
      const response = await api.get('/newsletter/admin/subscribers', { params });
      setSubscribers(response.data.subscribers);
      setTotalPages(response.data.total_pages);
      setTotalSubscribers(response.data.total);
      setSubscribersStats(response.data.stats);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/newsletter/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status_filter = statusFilter;
      
      const response = await api.get('/newsletter/admin/export', {
        params,
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Subscribers exported successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to export subscribers');
    } finally {
      setExporting(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignSubject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    
    if (!campaignContent.trim()) {
      toast.error('Please enter email content');
      return;
    }

    try {
      setSendingCampaign(true);
      
      const params: any = {
        subject: campaignSubject,
        content: campaignContent
      };
      
      if (campaignTestEmail) {
        params.send_test_to = campaignTestEmail;
      }
      
      const response = await api.post('/newsletter/admin/send-campaign', null, { params });
      
      toast.success(response.data.message || 'Campaign sent successfully!');
      setShowCampaignModal(false);
      setCampaignSubject('');
      setCampaignContent('');
      setCampaignTestEmail('');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send campaign');
    } finally {
      setSendingCampaign(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage subscribers and send campaigns</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export CSV
          </button>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Send Campaign
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Subscribers"
          value={subscribersStats?.total || stats?.total || 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Subscribers"
          value={subscribersStats?.active || stats?.active || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Unsubscribed"
          value={subscribersStats?.unsubscribed || stats?.unsubscribed || 0}
          icon={XCircle}
          color="red"
        />
        <StatsCard
          title="Last 7 Days"
          value={stats?.recent_subscriptions || 0}
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="footer">Footer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-48" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 bg-gray-200 rounded w-20" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32" />
                    </td>
                  </tr>
                ))
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No subscribers found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {subscriber.name || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge active={subscriber.is_active} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-600 capitalize text-sm">{subscriber.source}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      {formatDate(subscriber.subscribed_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalSubscribers)} of {totalSubscribers} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Send Newsletter Campaign</h2>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Test Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send Test To (Optional)
                </label>
                <input
                  type="email"
                  value={campaignTestEmail}
                  onChange={(e) => setCampaignTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Send a test email before sending to all subscribers
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content (HTML) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  placeholder="<h1>Hello!</h1><p>Check out our latest offers...</p>"
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags to format your email content
                </p>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Campaign Details</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This will be sent to <strong>{subscribersStats?.active || stats?.active || 0}</strong> active subscribers.
                      Make sure to send a test email first to verify the formatting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCampaign}
                disabled={sendingCampaign || !campaignSubject || !campaignContent}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingCampaign ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: 'blue' | 'green' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        </div>
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        active
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-green-500' : 'bg-red-500')} />
      {active ? 'Active' : 'Unsubscribed'}
    </span>
  );
}
