'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  AlertCircle,
  Search,
  Filter,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReturnItem {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  reason: string;
  refund: number;
}

interface ReturnOrder {
  id: number;
  return_number: string;
  order_id: number;
  user_id: number;
  guest_email: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'completed';
  reason: string;
  reason_detail: string;
  items: ReturnItem[];
  refund_amount: number;
  refund_method: string;
  images: string[];
  admin_notes: string;
  created_at: string;
  reviewed_at: string;
  completed_at: string;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  processed: { label: 'Processed', color: 'bg-blue-500', icon: Truck },
  completed: { label: 'Completed', color: 'bg-purple-500', icon: CheckCircle },
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnOrder | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReturns();
  }, [filter]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      // const response = await api.get(`/returns/admin/all?status=${filter}`);
      
      setReturns([
        {
          id: 1,
          return_number: 'RET-12345678',
          order_id: 1001,
          user_id: 5,
          guest_email: 'customer@example.com',
          status: 'pending',
          reason: 'damaged',
          reason_detail: 'Product arrived with scratches on the surface',
          items: [
            { order_item_id: 1, product_id: 10, product_name: 'Premium Wireless Headphones', quantity: 1, reason: 'damaged', refund: 99.99 }
          ],
          refund_amount: 99.99,
          refund_method: 'original',
          images: ['https://via.placeholder.com/100'],
          admin_notes: '',
          created_at: '2026-03-20T10:30:00Z',
          reviewed_at: '',
          completed_at: '',
        },
        {
          id: 2,
          return_number: 'RET-12345679',
          order_id: 1002,
          user_id: 6,
          guest_email: 'user2@example.com',
          status: 'approved',
          reason: 'wrong_item',
          reason_detail: 'Received blue instead of red',
          items: [
            { order_item_id: 2, product_id: 20, product_name: 'Smart Watch Pro', quantity: 1, reason: 'wrong_item', refund: 149.99 }
          ],
          refund_amount: 149.99,
          refund_method: 'store_credit',
          images: [],
          admin_notes: 'Approved for store credit',
          created_at: '2026-03-19T14:20:00Z',
          reviewed_at: '2026-03-19T16:00:00Z',
          completed_at: '',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (returnId: number, action: 'approve' | 'reject') => {
    try {
      // API call here
      // await api.post(`/returns/admin/${returnId}/${action}`, { admin_notes: adminNotes });
      
      fetchReturns();
      setShowDialog(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to process return:', error);
    }
  };

  const openActionDialog = (returnOrder: ReturnOrder, action: 'approve' | 'reject') => {
    setSelectedReturn(returnOrder);
    setActionType(action);
    setShowDialog(true);
  };

  const filteredReturns = returns.filter((ret) => {
    const matchesFilter = filter === 'all' || ret.status === filter;
    const matchesSearch = ret.return_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ret.guest_email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Returns Management</h1>
          <p className="text-muted-foreground mt-1">Manage customer return requests</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="processed">Processed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search returns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 bg-background"
          />
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Return #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Order #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Refund</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReturns.map((ret) => {
                const StatusIcon = statusConfig[ret.status].icon;
                return (
                  <tr key={ret.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-mono text-sm">{ret.return_number}</td>
                    <td className="px-4 py-4 text-sm">#{ret.order_id}</td>
                    <td className="px-4 py-4 text-sm">{ret.guest_email}</td>
                    <td className="px-4 py-4 text-sm">{ret.items.length} items</td>
                    <td className="px-4 py-4 font-medium">${ret.refund_amount.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <Badge className={`${statusConfig[ret.status].color} text-white`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[ret.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(ret.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReturn(ret)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {ret.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openActionDialog(ret, 'approve')}
                              className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openActionDialog(ret, 'reject')}
                              className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No returns found</p>
          </div>
        )}
      </div>

      {/* Return Details Dialog */}
      <Dialog open={!!selectedReturn && !showDialog} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Return Details - {selectedReturn?.return_number}</DialogTitle>
            <DialogDescription>
              Created on {selectedReturn && formatDate(selectedReturn.created_at)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReturn && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge className={`${statusConfig[selectedReturn.status].color} text-white`}>
                  {statusConfig[selectedReturn.status].label}
                </Badge>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p>{selectedReturn.guest_email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order #:</span>
                    <p>#{selectedReturn.order_id}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Return Items</h4>
                <div className="space-y-2">
                  {selectedReturn.items.map((item, idx) => (
                    <div key={idx} className="p-3 border rounded-md">
                      <p className="font-medium">{item.product_name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span>Refund: ${item.refund.toFixed(2)}</span>
                        <span>Reason: {item.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <h4 className="font-semibold mb-2">Return Reason</h4>
                <p className="text-sm">{selectedReturn.reason_detail}</p>
              </div>

              {/* Images */}
              {selectedReturn.images.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Attached Images</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReturn.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Refund Info */}
              <div>
                <h4 className="font-semibold mb-2">Refund Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-semibold">${selectedReturn.refund_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Method:</span>
                    <p className="capitalize">{selectedReturn.refund_method.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedReturn.admin_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Admin Notes</h4>
                  <p className="text-sm p-3 bg-muted rounded-md">{selectedReturn.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showDialog} onOpenChange={() => setShowDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Return' : 'Reject Return'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'This will approve the return and process the refund.'
                : 'This will reject the return request.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Admin Notes (Optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedReturn && handleAction(selectedReturn.id, actionType!)}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
