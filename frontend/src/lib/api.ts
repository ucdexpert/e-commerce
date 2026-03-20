import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize token immediately when module loads (BEFORE any component renders)
// This prevents 401 errors in React StrictMode
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('access_token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Network status detection
if (typeof window !== 'undefined') {
  window.addEventListener('offline', () => {
    toast.error('Internet connection nahi hai. Connection check karein', { duration: 5000 });
  });

  window.addEventListener('online', () => {
    toast.success('Internet connection wapas aa gaya!');
  });
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors with friendly messages
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;
    const status = error.response?.status;
    const message = error.response?.data?.detail;

    let friendlyMessage = 'Kuch masla aa gaya, dobara try karein';

    // Network error - no response from server
    if (!error.response) {
      if (error.code === 'ERR_NETWORK') {
        friendlyMessage = 'Server se connect nahi ho saka. Internet connection check karein.';
      } else {
        friendlyMessage = 'Internet connection nahi hai. Connection check karein.';
      }
    } else if (status === 400) {
      friendlyMessage = message || 'Invalid request. Dobara try karein.';
    } else if (status === 401) {
      friendlyMessage = 'Please login karein';
      // Auto redirect to login for 401 errors
      if (!originalRequest._retry) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          originalRequest._retry = true;
          try {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });
            const { access_token, refresh_token } = response.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
      }
    } else if (status === 403) {
      friendlyMessage = 'Aapko yeh karne ki permission nahi hai';
    } else if (status === 404) {
      friendlyMessage = 'Yeh item nahi mila';
    } else if (status === 422) {
      friendlyMessage = message || 'Please sab fields sahi bharein';
    } else if (status === 429) {
      friendlyMessage = 'Bohot zyada requests. Thodi der baad try karein';
    } else if (status === 500) {
      friendlyMessage = 'Server mein masla hai. Thodi der mein try karein.';
    } else if (status === 503) {
      friendlyMessage = 'Service temporarily unavailable. Thodi der mein try karein.';
    }

    // Show toast notification for errors (except 401 which redirects)
    if (status !== 401) {
      toast.error(friendlyMessage);
    }

    return Promise.reject({
      ...error,
      friendlyMessage,
    });
  }
);

// Auth APIs
export const authApi = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  getMe: () => api.get('/auth/me'),
  updateMe: (data: Partial<User>) => api.put('/auth/me', data),
};

// Products APIs
export const productsApi = {
  getAll: (params?: ProductParams) => api.get('/products/', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  search: (q: string, params?: ProductParams) => api.get('/products/search', { params: { q, ...params } }),
  getRelated: (id: number, limit: number = 4) => api.get(`/products/${id}/related`, { params: { limit } }),
  getReviews: (productId: number) => api.get(`/products/${productId}/reviews`),
  addReview: (productId: number, data: ReviewData) =>
    api.post(`/products/${productId}/reviews`, null, { params: data }),
};

// Categories APIs
export const categoriesApi = {
  getAll: () => api.get('/categories/'),
  getAllWithChildren: () => api.get('/categories/all'),
  getById: (id: number) => api.get(`/categories/${id}`),
};

// Cart APIs
export const cartApi = {
  get: () => api.get('/cart/'),
  addItem: (data: CartItemData) => api.post('/cart/items', data),
  updateItem: (itemId: number, data: { quantity: number }) => 
    api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId: number) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart/'),
  merge: (guestCartId: number) => api.post('/cart/merge', { guest_cart_id: guestCartId }),
};

// Orders APIs
export const ordersApi = {
  getAll: (params?: OrderParams) => api.get('/orders/', { params }),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: OrderCreateData) => api.post('/orders/', data),
  cancel: (id: number, reason?: string) => 
    api.post(`/orders/${id}/cancel`, null, { params: { reason } }),
  getInvoice: (id: number) => api.get(`/orders/${id}/invoice`),
};

// Addresses APIs
export const addressesApi = {
  getAll: () => api.get('/addresses/'),
  getById: (id: number) => api.get(`/addresses/${id}`),
  create: (data: AddressData) => api.post('/addresses/', data),
  update: (id: number, data: Partial<AddressData>) => 
    api.put(`/addresses/${id}`, data),
  delete: (id: number) => api.delete(`/addresses/${id}`),
  setDefault: (id: number) => api.post(`/addresses/${id}/set-default`),
};

// Wishlist APIs
export const wishlistApi = {
  get: () => api.get('/wishlist/'),
  addItem: (productId: number) => api.post(`/wishlist/items/${productId}`),
  removeItem: (itemId: number) => api.delete(`/wishlist/items/${itemId}`),
  moveToCart: (itemId: number) => api.post(`/wishlist/move-to-cart/${itemId}`),
};

// Search APIs
export const searchApi = {
  search: (q: string, limit: number = 10) => api.get('/search/', { params: { q, limit } }),
  suggestions: (q: string, limit: number = 5) => 
    api.get('/search/suggestions', { params: { q, limit } }),
};

// Types
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  sku?: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  images: string[];
  attributes: Record<string, any>;
  variants: any[];
  rating: number;
  review_count: number;
  sold_count: number;
  view_count: number;
  categories?: Category[];
  created_at: string;
  updated_at: string;
}

export interface ProductParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_on_sale?: boolean;
  sort_by?: 'created_at' | 'price' | 'rating' | 'sold_count' | 'name';
  sort_order?: 'asc' | 'desc';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  variant?: Record<string, any>;
  product: Product;
}

export interface Cart {
  id: number;
  user_id?: number;
  items: CartItem[];
  subtotal: number;
  total: number;
}

export interface CartItemData {
  product_id: number;
  quantity: number;
  variant?: Record<string, any>;
}

export interface Address {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  address_type: 'shipping' | 'billing';
}

export interface AddressData {
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default?: boolean;
  address_type?: 'shipping' | 'billing';
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  variant?: Record<string, any>;
  subtotal: number;
  product: Product;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  currency: string;
  items: OrderItem[];
  shipping_address?: Address;
  billing_address?: Address;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderParams {
  page?: number;
  per_page?: number;
  status_filter?: string;
}

export interface OrderCreateData {
  shipping_address_id: number;
  billing_address_id?: number;
  payment_method: string;
  notes?: string;
  coupon_code?: string;
}

export interface ReviewData {
  rating: number;
  title?: string;
  comment?: string;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  created_at: string;
  product: Product;
}

export interface Wishlist {
  id: number;
  user_id: number;
  items: WishlistItem[];
}
