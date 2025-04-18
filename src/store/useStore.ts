import { create } from 'zustand';
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
}

export const useStore = create<Store>((set) => ({
  cart: [],
  orders: [],
  currentUser: null,

  addToCart: (product, color, size) => set((state) => {
    const existingItem = state.cart.find(
      item => item.product.id === product.id && 
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
    cart: state.cart.filter(item => item.product.id !== productId)
  })),

  updateCartItemQuantity: (productId, quantity) => set((state) => ({
    cart: quantity === 0
      ? state.cart.filter(item => item.product.id !== productId)
      : state.cart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
  })),

  clearCart: () => set({ cart: [] }),

  setCurrentUser: (user) => set({ currentUser: user }),

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
  }))
}));