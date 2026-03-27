'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Package, AlertTriangle, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InventoryLog {
  id: number;
  product_id: number;
  product_name: string;
  quantity_change: number;
  stock_before: number;
  stock_after: number;
  reason: string;
  created_by: string;
  created_at: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  image: string;
}

export default function InventoryPage() {
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LowStockProduct | null>(null);
  const [adjustment, setAdjustment] = useState({ quantity: 0, reason: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API calls
      setLowStockProducts([
        {
          id: 1,
          name: 'Wireless Earbuds Pro',
          sku: 'WEP-001',
          stock_quantity: 5,
          low_stock_threshold: 10,
          image: 'https://via.placeholder.com/48',
        },
        {
          id: 2,
          name: 'USB-C Cable 2m',
          sku: 'USBC-2M',
          stock_quantity: 8,
          low_stock_threshold: 15,
          image: 'https://via.placeholder.com/48',
        },
      ]);

      setInventoryLogs([
        {
          id: 1,
          product_id: 1,
          product_name: 'Wireless Earbuds Pro',
          quantity_change: -2,
          stock_before: 7,
          stock_after: 5,
          reason: 'Order #1234',
          created_by: 'System',
          created_at: '2026-03-24T10:30:00Z',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    try {
      // API call here
      // await api.post('/inventory/adjust', { product_id: selectedProduct?.id, ...adjustment });
      
      fetchInventory();
      setShowAdjustDialog(false);
      setAdjustment({ quantity: 0, reason: '' });
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    }
  };

  const openAdjustDialog = (product: LowStockProduct) => {
    setSelectedProduct(product);
    setShowAdjustDialog(true);
  };

  const filteredProducts = lowStockProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage stock levels</p>
        </div>
        <Button onClick={() => setShowAdjustDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adjust Stock
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Products</p>
              <p className="text-2xl font-bold">{lowStockProducts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">456</p>
            </div>
            <Package className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stock Alerts</p>
              <p className="text-2xl font-bold">{lowStockProducts.filter(p => p.stock_quantity < 5).length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Low Stock Alert</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Current Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Threshold</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">{product.sku}</td>
                  <td className="px-4 py-4">
                    <span className={`font-semibold ${product.stock_quantity < 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{product.low_stock_threshold}</td>
                  <td className="px-4 py-4">
                    <Badge variant={product.stock_quantity < 5 ? 'destructive' : 'warning'}>
                      {product.stock_quantity < 5 ? 'Critical' : 'Low Stock'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAdjustDialog(product)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Adjust
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Inventory Logs */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Stock Movements</h2>
        <div className="space-y-2">
          {inventoryLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">{log.product_name}</p>
                <p className="text-sm text-muted-foreground">{log.reason} • {log.created_by}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${log.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                </p>
                <p className="text-sm text-muted-foreground">
                  {log.stock_before} → {log.stock_after}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>
              Manually adjust stock quantity for a product
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Select Product</Label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = lowStockProducts.find(p => p.id === parseInt(e.target.value));
                  setSelectedProduct(product || null);
                }}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Choose a product...</option>
                {lowStockProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Current: {p.stock_quantity})</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Quantity Adjustment</Label>
              <Input
                type="number"
                value={adjustment.quantity}
                onChange={(e) => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Positive to add, negative to remove"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Reason</Label>
              <Textarea
                value={adjustment.reason}
                onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                placeholder="e.g., Damaged items, Found extra stock, etc."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustStock}>
              Adjust Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
