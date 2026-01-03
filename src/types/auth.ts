export type UserRole = 'user' | 'owner' | 'delivery';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  image: string;
  isOpen: boolean;
  rating: number;
  deliveryTime: string;
  minOrder: number;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  userId: string;
  deliveryBoyId?: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'picked_up' 
  | 'delivered' 
  | 'cancelled';

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
}

export interface EarningsData {
  date: string;
  orders: number;
  revenue: number;
}
