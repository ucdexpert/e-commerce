'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  Download,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

// Helper to safely render error messages
const getErrorMessage = (message: any, defaultMessage: string = 'Invalid field'): string => {
  if (typeof message === 'string') return message;
  return defaultMessage;
};

// Product schema
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().optional().or(z.literal('')),
  price: z.number().min(0, 'Price must be positive'),
  compare_price: z.number().optional().or(z.literal(0)),
  sku: z.string().optional().or(z.literal('')),
  stock_quantity: z.number().min(0, 'Stock must be positive'),
  category_ids: z.array(z.number()).min(1, 'Select at least one category'),
  images: z.array(z.string()).optional(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  is_on_sale: z.boolean(),
  // Flash Sale fields
  flash_sale_price: z.number().optional().or(z.literal(0)),
  flash_sale_start: z.string().optional().or(z.literal('')),
  flash_sale_end: z.string().optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema> & {
  is_featured: boolean;
  is_active: boolean;
  is_on_sale: boolean;
};

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  sku?: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  images: string[];
  categories: { id: number; name: string }[];
  created_at: string;
  flash_sale_price?: number | null;
  flash_sale_start?: string | null;
  flash_sale_end?: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Import/Export state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      short_description: '',
      price: 0,
      compare_price: undefined,
      sku: '',
      stock_quantity: 0,
      category_ids: [],
      images: [],
      is_featured: false,
      is_active: true,
      is_on_sale: false,
      flash_sale_price: undefined,
      flash_sale_start: '',
      flash_sale_end: '',
    },
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, search, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 12,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      if (search) params.search = search;
      if (categoryFilter) params.category_id = categoryFilter;
      if (statusFilter === 'active') params.is_active = true;
      if (statusFilter === 'inactive') params.is_active = false;

      const response = await api.get('/products/', { params });
      setProducts(response.data.products || []);
      setTotalPages(response.data.total_pages || 1);
      setTotalProducts(response.data.total || 0);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      reset({
        name: product.name,
        slug: product.slug,
        description: '',
        short_description: '',
        price: product.price,
        compare_price: product.compare_price,
        sku: product.sku,
        stock_quantity: product.stock_quantity,
        category_ids: product.categories.map((c) => c.id),
        images: product.images || [],
        is_featured: product.is_featured,
        is_active: product.is_active,
        is_on_sale: product.is_on_sale,
        flash_sale_price: product.flash_sale_price || undefined,
        flash_sale_start: product.flash_sale_start ? new Date(product.flash_sale_start).toISOString().slice(0, 16) : '',
        flash_sale_end: product.flash_sale_end ? new Date(product.flash_sale_end).toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingProduct(null);
      reset({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        price: 0,
        compare_price: undefined,
        sku: '',
        stock_quantity: 0,
        category_ids: [],
        images: [],
        is_featured: false,
        is_active: true,
        is_on_sale: false,
        flash_sale_price: undefined,
        flash_sale_start: '',
        flash_sale_end: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    // Auto-generate slug if not editing or if slug is empty
    if (!editingProduct || !watch('slug')) {
      setValue('slug', generateSlug(name));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const currentImages = watch('images') || [];
    const newImages: string[] = [...currentImages];

    try {
      // Upload files to Cloudinary via backend
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrls = response.data.urls || [];
      const allImages = [...currentImages, ...uploadedUrls];
      setValue('images', allImages);
      
      setUploadingImages(false);
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error: any) {
      console.error('Image upload failed:', error);
      setUploadingImages(false);
      toast.error('Failed to upload images. Please try again.');
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Ensure category_ids is an array of numbers
      const submitData = {
        ...data,
        category_ids: Array.isArray(data.category_ids)
          ? data.category_ids.map(id => Number(id))
          : [],
      };

      if (editingProduct) {
        // Update existing product
        await api.put(`/products/${editingProduct.id}`, submitData);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        await api.post('/products/', submitData);
        toast.success('Product created successfully');
      }
      handleCloseModal();
      fetchProducts();
    } catch (error: any) {
      // Parse validation errors from backend
      let errorMessage = 'Failed to save product';
      if (error.response?.status === 422) {
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          // Pydantic validation errors
          errorMessage = detail
            .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
            .join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (detail && typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      } else if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : JSON.stringify(error.response.data.detail);
      }
      
      console.error('Error Message:', errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setIsDeleting(true);
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Delete ${selectedProducts.length} products?`)) return;

    try {
      setIsDeleting(true);
      await Promise.all(selectedProducts.map((id) => api.delete(`/products/${id}`)));
      toast.success(`${selectedProducts.length} products deleted`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error: any) {
      console.error('Bulk delete failed:', error);
      toast.error('Failed to delete products');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await api.put(`/products/${product.id}`, { is_active: !product.is_active });
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'}`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleSelectProduct = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  // Import/Export handlers
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await api.get('/bulk/products/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Products exported successfully!');
    } catch (e: any) {
      console.error('Export failed:', e);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      const res = await api.post('/bulk/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setImportResult(res.data);
      toast.success(res.data.message || 'Import completed!');
      
      if (res.data.errors && res.data.errors.length > 0) {
        console.error('Import errors:', res.data.errors);
        toast.error(`${res.data.errors.length} rows had errors. Check console.`);
      }
      
      fetchProducts();
      setImportFile(null);
    } catch (e: any) {
      console.error('Import failed:', e);
      toast.error(e.response?.data?.detail || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = 'name,slug,description,short_description,price,compare_price,cost,sku,barcode,stock_quantity,low_stock_threshold,is_active,is_featured,is_on_sale,weight\n';
    const sample = 'Sample Product,sample-product,Full description of the product goes here,Short description,99.99,129.99,50.00,SKU001,BAR001,100,10,true,false,false,0.5\n';
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Upload className="w-4 h-4" /> Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </label>
          
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
      </div>

      {/* Import File Status */}
      {importFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">{importFile.name}</p>
              <p className="text-sm text-blue-600">{(importFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportFile(null)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>
        </div>
      )}

      {/* Template Download */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Bulk Import Products</p>
            <p className="text-sm text-gray-600">
              Download the CSV template, fill in your products, then upload using the Import button above.
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
          >
            <Download className="w-4 h-4" /> Download Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {selectedProducts.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete ({selectedProducts.length})
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="min-w-[700px] w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left font-semibold">Product</th>
                <th className="p-4 text-left font-semibold">Category</th>
                <th className="p-4 text-left font-semibold">Price</th>
                <th className="p-4 text-left font-semibold">Stock</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b animate-pulse">
                    <td className="p-4"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-10 w-32 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
                    <td className="p-4"><div className="h-8 w-24 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400 m-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sku || 'No SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {product.categories?.[0]?.name || 'Uncategorized'}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{formatPrice(product.price)}</p>
                        {product.compare_price && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(product.compare_price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-sm font-medium',
                          product.stock_quantity <= 10
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        )}
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={cn(
                          'px-3 py-1 rounded-full text-sm font-medium',
                          product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
              Showing {(currentPage - 1) * 12 + 1} to {Math.min(currentPage * 12, totalProducts)} of{' '}
              {totalProducts} products
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

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product Name *
                  </label>
                  <input
                    {...register('name')}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {getErrorMessage(errors.name.message, 'Name is required')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Slug (URL-friendly name)
                  </label>
                  <input
                    {...register('slug')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                    placeholder="product-name"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated from product name
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Product description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {getErrorMessage(errors.description.message, 'Description is required')}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {getErrorMessage(errors.price.message, 'Price must be positive')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sale Price (Rs.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('compare_price', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <input
                      {...register('sku')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="SKU-123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      {...register('stock_quantity', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.stock_quantity && (
                      <p className="text-red-500 text-sm mt-1">
                        {getErrorMessage(errors.stock_quantity.message, 'Stock is required')}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Categories *</label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No categories available. Create categories first.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {categories.map((cat) => {
                          const isSelected = watch('category_ids')?.includes(cat.id) || false;
                          return (
                            <label
                              key={cat.id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={cat.id}
                                checked={isSelected}
                                onChange={(e) => {
                                  const current = watch('category_ids') || [];
                                  if (e.target.checked) {
                                    setValue('category_ids', [...current, cat.id]);
                                  } else {
                                    setValue(
                                      'category_ids',
                                      current.filter((id) => id !== cat.id)
                                    );
                                  }
                                }}
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <span className="text-sm font-medium">{cat.name}</span>
                              {isSelected && (
                                <Check className="w-4 h-4 text-green-600 ml-auto" />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Select one or more categories
                  </p>
                  {errors.category_ids && (
                    <p className="text-red-500 text-sm mt-1">
                      {typeof errors.category_ids.message === 'string' 
                        ? errors.category_ids.message 
                        : 'Select at least one category'}
                    </p>
                  )}
                  {watch('category_ids') && watch('category_ids')!.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watch('category_ids')!.map((catId) => {
                        const cat = categories.find((c) => c.id === catId);
                        return cat ? (
                          <span
                            key={catId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                          >
                            {cat.name}
                            <button
                              type="button"
                              onClick={() => {
                                setValue(
                                  'category_ids',
                                  watch('category_ids')!.filter((id) => id !== catId)
                                );
                              }}
                              className="hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Product Images</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="mt-4"
                      disabled={uploadingImages}
                    />
                    {uploadingImages && (
                      <p className="text-sm text-primary mt-2">Uploading...</p>
                    )}
                  </div>
                </div>

                {watch('images') && watch('images')!.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {watch('images')!.map((img, idx) => (
                      <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = watch('images')!.filter((_, i) => i !== idx);
                            setValue('images', newImages);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Settings</h3>
                
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Is Featured</span>
                  <input
                    type="checkbox"
                    {...register('is_featured')}
                    className="w-5 h-5 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Is On Sale</span>
                  <input
                    type="checkbox"
                    {...register('is_on_sale')}
                    className="w-5 h-5 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Is Active</span>
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-5 h-5 rounded"
                  />
                </label>
              </div>

              {/* Flash Sale Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">⚡ Flash Sale</h3>
                  <span className="text-xs bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                    Limited Time Deal
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Set a special flash sale price with a countdown timer. The sale will automatically end when the timer expires.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Flash Sale Price (Rs.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('flash_sale_price', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Special flash sale price"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to disable flash sale
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register('flash_sale_start')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      When the flash sale begins
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register('flash_sale_end')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      When the flash sale ends
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Flash sales create urgency and boost conversions. 
                    Set the end time 24-48 hours from now for best results. 
                    Products with active flash sales will show a countdown timer and FLASH badge.
                  </p>
                </div>
              </div>

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
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
