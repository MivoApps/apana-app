import { create } from 'zustand';
import { CartItem, Product } from '@/types/store';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => set((state) => {
    const existingIndex = state.items.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const updatedItems = [...state.items];
      updatedItems[existingIndex].quantity += 1;
      return { items: updatedItems };
    }
    return { items: [...state.items, { product, quantity: 1 }] };
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.product.id !== productId)
  })),
  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(item => item.product.id !== productId) };
    }
    return {
      items: state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    };
  }),
  clearCart: () => set({ items: [] }),
  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0),
}));
