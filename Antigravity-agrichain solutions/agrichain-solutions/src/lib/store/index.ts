import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, User, Notification } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => {
        set({ isLoading: true });
        set({ isLoading: false });
        throw new Error("Use NextAuth signIn instead of local store login");
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: "agrichain-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);
          if (!existing) return { items: [...state.items, { product, quantity }] };

          return {
            items: state.items.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            ),
          };
        });
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "agrichain-cart" }
  )
);

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const nextNotification: Notification = {
      ...notification,
      id: `n_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    set((state) => ({
      notifications: [nextNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
      unreadCount: Math.max(0, get().notifications.filter((notification) => !notification.read && notification.id !== id).length),
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
      unreadCount: 0,
    }));
  },
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  simpleMode: boolean;
  pageLoading: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  toggleSimpleMode: () => void;
  setPageLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      simpleMode: false,
      pageLoading: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleSimpleMode: () => set((state) => ({ simpleMode: !state.simpleMode })),
      setPageLoading: (loading: boolean) => set({ pageLoading: loading }),
    }),
    {
      name: "agrichain-ui",
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, simpleMode: state.simpleMode }),
    }
  )
);
