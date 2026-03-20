import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, Product, User, Wishlist } from '@/lib/api';
import { cartApi, wishlistApi, authApi } from '@/lib/api';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const { access_token, refresh_token, user } = response.data;

          if (!access_token || !refresh_token) {
            throw new Error('Invalid response from login API');
          }

          // Save tokens to localStorage
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          // Set axios header IMMEDIATELY
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          // Use user from login response (don't call getMe again - providers.tsx will call fetchUser)
          const userData = user;

          // Save user info including role
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));

            // Set cookies for middleware
            document.cookie = `access_token=${access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
            document.cookie = `user_role=${userData.is_superuser ? 'admin' : 'customer'}; path=/; max-age=${60 * 60 * 24 * 7}`;

            set({ user: userData, isAuthenticated: true, isLoading: false });
          } else {
            // No user in response - will be fetched by providers.tsx
            set({ isLoading: false });
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          await authApi.register(data);
          await get().login(data.email, data.password);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authApi.logout();
        // Clear all auth data from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          const response = await authApi.getMe();
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: async (data: Partial<User>) => {
        const response = await authApi.updateMe(data);
        set({ user: response.data });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number, variant?: Record<string, any>) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await cartApi.get();
          set({ cart: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      addToCart: async (productId: number, quantity: number, variant?: Record<string, any>) => {
        set({ isLoading: true });
        try {
          await cartApi.addItem({ product_id: productId, quantity, variant });
          await get().fetchCart();
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to add to cart:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateCartItem: async (itemId: number, quantity: number) => {
        set({ isLoading: true });
        try {
          await cartApi.updateItem(itemId, { quantity });
          await get().fetchCart();
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to update cart item:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      removeFromCart: async (itemId: number) => {
        set({ isLoading: true });
        try {
          await cartApi.removeItem(itemId);
          await get().fetchCart();
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to remove from cart:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await cartApi.clear();
          await get().fetchCart();
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

interface WishlistState {
  wishlist: Wishlist | null;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (itemId: number) => Promise<void>;
  moveToCart: (itemId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  wishlist: null,
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await wishlistApi.get();
      set({ wishlist: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (productId: number) => {
    set({ isLoading: true });
    try {
      await wishlistApi.addItem(productId);
      await get().fetchWishlist();
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeFromWishlist: async (itemId: number) => {
    set({ isLoading: true });
    try {
      await wishlistApi.removeItem(itemId);
      await get().fetchWishlist();
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  moveToCart: async (itemId: number) => {
    set({ isLoading: true });
    try {
      await wishlistApi.moveToCart(itemId);
      await get().fetchWishlist();
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  isInWishlist: (productId: number) => {
    const { wishlist } = get();
    return wishlist?.items.some((item) => item.product_id === productId) ?? false;
  },
}));

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  recentlyViewed: Product[];
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  closeMobileMenu: () => void;
  closeSearch: () => void;
  addToRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isMobileMenuOpen: false,
      isSearchOpen: false,
      recentlyViewed: [],

      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      closeSearch: () => set({ isSearchOpen: false }),
      
      addToRecentlyViewed: (product: Product) => set((state) => {
        // Filter out the product if it already exists
        const filtered = state.recentlyViewed.filter(p => p.id !== product.id);
        // Add to beginning and limit to 10 items
        return {
          recentlyViewed: [product, ...filtered].slice(0, 10)
        };
      }),
      
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ recentlyViewed: state.recentlyViewed }),
    }
  )
);
