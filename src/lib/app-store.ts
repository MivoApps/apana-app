'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Store, Product, StoreStyle } from '@/types/store';

// Helper para convertir cualquier nombre a un slug amigable de URL (ej. "Panadería Don José!" => "panaderia-don-jose")
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, 'n')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface MultiStoreState {
  // Tiendas creadas por el comerciante (Key: slug)
  stores: Record<string, Store>;
  // Lista de productos asociadas por storeId
  productsByStore: Record<string, Product[]>;
  // Slug de la tienda activa seleccionada por el comerciante en su panel
  activeStoreSlug: string;

  // Acciones
  createOrUpdateStore: (data: {
    name: string;
    whatsappPhone: string;
    themeStyle: StoreStyle;
    primaryColor: string;
    description?: string;
  }) => Store;

  getStoreBySlug: (slug: string) => Store | undefined;
  getProductsByStoreId: (storeId: string) => Product[];

  addProductToActiveStore: (product: Omit<Product, 'id' | 'storeId' | 'createdAt'>) => Product;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  toggleProductStock: (productId: string) => void;
}

export const useAppStore = create<MultiStoreState>()(
  persist(
    (set, get) => ({
      stores: {},
      productsByStore: {},
      activeStoreSlug: '',

      createOrUpdateStore: ({ name, whatsappPhone, themeStyle, primaryColor, description }) => {
        const generatedSlug = slugify(name) || 'mi-tienda';
        const existingStore = get().stores[generatedSlug];

        const storeId = existingStore ? existingStore.id : `store-${Date.now()}`;
        const updatedStore: Store = {
          id: storeId,
          slug: generatedSlug,
          name: name.trim() || 'Mi Tienda APANA',
          description: description || 'Bienvenido a mi tienda digital.',
          whatsappPhone: whatsappPhone ? whatsappPhone.trim() : '',
          ownerId: 'user-merchant',
          status: 'activa',
          themeStyle,
          primaryColor,
          createdAt: existingStore ? existingStore.createdAt : Date.now(),
        };

        set((state) => ({
          stores: {
            ...state.stores,
            [generatedSlug]: updatedStore,
          },
          productsByStore: {
            ...state.productsByStore,
            [storeId]: state.productsByStore[storeId] || [],
          },
          activeStoreSlug: generatedSlug,
        }));

        return updatedStore;
      },

      getStoreBySlug: (slug: string) => {
        return get().stores[slug];
      },

      getProductsByStoreId: (storeId: string) => {
        return get().productsByStore[storeId] || [];
      },

      addProductToActiveStore: (productData) => {
        const activeSlug = get().activeStoreSlug;
        const activeStore = get().stores[activeSlug];
        const storeId = activeStore?.id || 'temp-store';

        const newProduct: Product = {
          ...productData,
          id: `p-${Date.now()}`,
          storeId,
          createdAt: Date.now(),
        };

        set((state) => {
          const currentProducts = state.productsByStore[storeId] || [];
          return {
            productsByStore: {
              ...state.productsByStore,
              [storeId]: [newProduct, ...currentProducts],
            },
          };
        });

        return newProduct;
      },

      updateProduct: (productId, updates) => {
        const activeSlug = get().activeStoreSlug;
        const activeStore = get().stores[activeSlug];
        if (!activeStore) return;

        set((state) => {
          const currentProducts = state.productsByStore[activeStore.id] || [];
          const updated = currentProducts.map((p) =>
            p.id === productId ? { ...p, ...updates } : p
          );
          return {
            productsByStore: {
              ...state.productsByStore,
              [activeStore.id]: updated,
            },
          };
        });
      },

      deleteProduct: (productId) => {
        const activeSlug = get().activeStoreSlug;
        const activeStore = get().stores[activeSlug];
        if (!activeStore) return;

        set((state) => {
          const currentProducts = state.productsByStore[activeStore.id] || [];
          const filtered = currentProducts.filter((p) => p.id !== productId);
          return {
            productsByStore: {
              ...state.productsByStore,
              [activeStore.id]: filtered,
            },
          };
        });
      },

      toggleProductStock: (productId) => {
        const activeSlug = get().activeStoreSlug;
        const activeStore = get().stores[activeSlug];
        if (!activeStore) return;

        set((state) => {
          const currentProducts = state.productsByStore[activeStore.id] || [];
          const updated = currentProducts.map((p) =>
            p.id === productId ? { ...p, inStock: !p.inStock } : p
          );
          return {
            productsByStore: {
              ...state.productsByStore,
              [activeStore.id]: updated,
            },
          };
        });
      },
    }),
    {
      name: 'apana-multi-store-storage',
    }
  )
);
