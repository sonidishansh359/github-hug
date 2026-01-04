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
  // Extended properties
  email?: string;
  website?: string;
  deliveryFee?: number;
  taxRate?: number;
  commissionRate?: number;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  openingTime?: string;
  closingTime?: string;
  openOnWeekends?: boolean;
  acceptCash?: boolean;
  acceptCard?: boolean;
  acceptDigital?: boolean;
  hasWifi?: boolean;
  hasOutdoor?: boolean;
  hasParking?: boolean;
  hasDelivery?: boolean;
  hasTakeaway?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  apiKey?: string;
  apiSecret?: string;
  categories?: string[];
  discount?: number;
  hasOffers?: boolean;
  isNew?: boolean;
  healthyOptions?: boolean;
  isPremium?: boolean;
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
  // Extended properties
  preparationTime?: number;
  calories?: number;
  ingredients?: string;
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
  vehicle?: string;
}

export interface EarningsData {
  date: string;
  orders: number;
  revenue: number;
}
