import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  type: 'print' | 'cartridge' | 'service';
  name: string;
  description: string;
  price: number;
  quantity: number;
  options?: {
    material?: string;
    size?: string;
    model?: string;
    [key: string]: any;
  };
  imageUrl?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  createdAt: Date;
  estimatedCompletion?: Date;
}

interface CartStore {
  items: CartItem[];
  orders: Order[];
  isOpen: boolean;
  
  // Cart actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  
  // Order actions
  createOrder: (customerInfo: Order['customerInfo']) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrder: (orderId: string) => Order | undefined;
  
  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],
      isOpen: false,

      addItem: (newItem) => {
        const id = Math.random().toString(36).substr(2, 9);
        const existingItemIndex = get().items.findIndex(
          item => 
            item.name === newItem.name && 
            JSON.stringify(item.options) === JSON.stringify(newItem.options)
        );

        if (existingItemIndex >= 0) {
          // Если товар уже есть, увеличиваем количество
          set(state => ({
            items: state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            )
          }));
        } else {
          // Добавляем новый товар
          set(state => ({
            items: [...state.items, { ...newItem, id }]
          }));
        }
      },

      removeItem: (id) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },

      createOrder: (customerInfo) => {
        const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
        const items = get().items;
        const total = get().getTotalPrice();
        
        const newOrder: Order = {
          id: orderId,
          items: [...items],
          total,
          status: 'pending',
          customerInfo,
          createdAt: new Date(),
          estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // +3 дня
        };

        set(state => ({
          orders: [...state.orders, newOrder],
          items: [] // Очищаем корзину после заказа
        }));

        return orderId;
      },

      updateOrderStatus: (orderId, status) => {
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        }));
      },

      getOrder: (orderId) => {
        return get().orders.find(order => order.id === orderId);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        orders: state.orders 
      }),
    }
  )
);