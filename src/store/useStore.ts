import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Order, Product, User } from '../types';

interface Store {
  cart: CartItem[];
  orders: Order[];
  currentUser: User | null;
  addToCart: (product: Product, color: string, size: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCurrentUser: (user: User | null) => void;
  placeOrder: (customerInfo: Order['customerInfo']) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], riderId?: string) => void;
  initialize: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      cart: [],
      orders: [],
      currentUser: null,

      addToCart: (product, color, size) => set((state) => {
        const existingItem = state.cart.find(
          item => item.product._id === product._id && 
                  item.selectedColor === color && 
                  item.selectedSize === size
        );

        if (existingItem) {
          return {
            cart: state.cart.map(item =>
              item === existingItem
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          };
        }

        return {
          cart: [...state.cart, { product, quantity: 1, selectedColor: color, selectedSize: size }]
        };
      }),

      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.product._id !== productId)
      })),

      updateCartItemQuantity: (productId, quantity) => set((state) => ({
        cart: quantity === 0
          ? state.cart.filter(item => item.product._id !== productId)
          : state.cart.map(item =>
              item.product._id === productId
                ? { ...item, quantity }
                : item
            )
      })),

      clearCart: () => set({ cart: [] }),

      setCurrentUser: (user) => {
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
          localStorage.removeItem('currentUser');
        }
        set({ currentUser: user });
      },

      placeOrder: (customerInfo) => set((state) => {
        const newOrder: Order = {
          id: `ORD${Date.now()}`,
          items: [...state.cart],
          status: 'paid',
          totalAmount: state.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0),
          customerInfo: {
            ...customerInfo,
            email: state.currentUser?.email || ''
          }
        };

        return {
          orders: [...state.orders, newOrder],
          cart: []
        };
      }),

      updateOrderStatus: (orderId, status, riderId) => set((state) => ({
        orders: state.orders.map(order =>
          order.id === orderId
            ? { ...order, status, riderId }
            : order
        )
      })),

      initialize: async () => {
        const storedUser = localStorage.getItem('currentUser');
        
        if (!storedUser) {
          set({ currentUser: null });
          return;
        }

        try {
          const response = await fetch('https://conditioningdhamakabackend.onrender.com/auth/me', {
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.authenticated && data.user) {
            set({
              currentUser: {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role
              }
            });
          } else {
            // Clear stored user if session is invalid
            localStorage.removeItem('currentUser');
            set({ currentUser: null });
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('currentUser');
          set({ currentUser: null });
        }
      }
    }),
    {
      name: 'zustand-store',
      partialize: (state) => ({
        cart: state.cart // Only persist cart, not auth state
      })
    }
  )
);