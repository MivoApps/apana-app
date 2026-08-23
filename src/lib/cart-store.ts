import { create } from 'zustand';
import { CartItem, Product, SelectedOption } from '@/types/store';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, selectedOptions?: SelectedOption[]) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product, selectedOptions) => set((state) => {
    const optionsKey = (selectedOptions && selectedOptions.length > 0)
      ? selectedOptions.map(o => `${o.groupTitle}:${o.valueName}`).sort().join('|')
      : '';
    const cartItemId = optionsKey ? `${product.id}-${optionsKey}` : product.id;

    const optionsDelta = (selectedOptions || []).reduce((acc, opt) => acc + (opt.priceDifference || 0), 0);
    const calculatedPrice = Math.max(0, product.price + optionsDelta);

    const existingIndex = state.items.findIndex(item => item.id === cartItemId);
    if (existingIndex > -1) {
      const updatedItems = [...state.items];
      updatedItems[existingIndex].quantity += 1;
      return { items: updatedItems };
    }

    return { 
      items: [
        ...state.items, 
        { 
          id: cartItemId, 
          product, 
          selectedOptions: selectedOptions && selectedOptions.length > 0 ? selectedOptions : undefined,
          calculatedPrice,
          quantity: 1 
        }
      ] 
    };
  }),
  removeItem: (cartItemId) => set((state) => ({
    items: state.items.filter(item => item.id !== cartItemId && item.product.id !== cartItemId)
  })),
  updateQuantity: (cartItemId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(item => item.id !== cartItemId && item.product.id !== cartItemId) };
    }
    return {
      items: state.items.map(item =>
        (item.id === cartItemId || item.product.id === cartItemId) ? { ...item, quantity } : item
      )
    };
  }),
  clearCart: () => set({ items: [] }),
  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.calculatedPrice * item.quantity), 0),
}));
