import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  variant?: string;
  quantity: number;
  maxStock?: number;
  categoryId?: number;
}

export interface Coupon {
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minSpend: number;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  addItem: (item: CartItem) => boolean; // Return success status
  removeItem: (id: number, variant?: string) => void;
  updateQuantity: (id: number, quantity: number, variant?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getDiscountAmount: () => number;
  getFinalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      
      addItem: (newItem) => {
        let success = true;
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === newItem.id && item.variant === newItem.variant
          );

          if (existingItemIndex > -1) {
            const currentQuantity = state.items[existingItemIndex].quantity;
            const maxStock = newItem.maxStock ?? Infinity;
            
            if (currentQuantity + newItem.quantity > maxStock) {
              success = false;
              return state; // Do nothing if limit exceeded
            }

            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += newItem.quantity;
            // Update maxStock if provided
            if (newItem.maxStock !== undefined) {
               newItems[existingItemIndex].maxStock = newItem.maxStock;
            }
            // Update categoryId if provided (should be same but good to ensure)
            if (newItem.categoryId !== undefined) {
               newItems[existingItemIndex].categoryId = newItem.categoryId;
            }
            return { items: newItems };
          }

          // New item check
          if (newItem.quantity > (newItem.maxStock ?? Infinity)) {
             success = false;
             return state;
          }

          return { items: [...state.items, newItem] };
        });
        return success;
      },

      removeItem: (id, variant) => set((state) => ({
        items: state.items.filter(
          (item) => !(item.id === id && item.variant === variant)
        ),
      })),

      updateQuantity: (id, quantity, variant) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(
              (item) => !(item.id === id && item.variant === variant)
            ),
          };
        }
        
        // Check maxStock
        const item = state.items.find(i => i.id === id && i.variant === variant);
        if (item && item.maxStock !== undefined && quantity > item.maxStock) {
           return state; // Do nothing if exceeds
        }

        return {
          items: state.items.map((item) =>
            item.id === id && item.variant === variant
              ? { ...item, quantity }
              : item
          ),
        };
      }),

      clearCart: () => set({ items: [], coupon: null }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      applyCoupon: (coupon) => set({ coupon }),
      
      removeCoupon: () => set({ coupon: null }),

      getDiscountAmount: () => {
        const { coupon, items } = get();
        if (!coupon) return 0;
        
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        if (total < coupon.minSpend) return 0;

        if (coupon.discountType === 'fixed') {
          return Math.min(coupon.discountValue, total);
        } else {
          return Math.floor((total * coupon.discountValue) / 100);
        }
      },

      getFinalPrice: () => {
        const { getTotalPrice, getDiscountAmount } = get();
        return Math.max(0, getTotalPrice() - getDiscountAmount());
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
