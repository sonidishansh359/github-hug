import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockRestaurants, mockMenuItems } from '@/data/mockData';
import { Restaurant, MenuItem, OrderItem } from '@/types/auth';

export interface CartItem extends OrderItem {
  restaurantId: string;
  restaurantName: string;
  image: string;
}

export interface UserOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: CartItem[];
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: 'upi' | 'card' | 'cod';
  createdAt: string;
  estimatedDelivery: string;
  deliveryPartner?: {
    name: string;
    phone: string;
    location: { lat: number; lng: number };
  };
}

interface UserDataContextType {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  cart: CartItem[];
  orders: UserOrder[];
  activeOrder: UserOrder | null;
  addToCart: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (deliveryAddress: string, paymentMethod: 'upi' | 'card' | 'cod') => UserOrder;
  getRestaurantById: (id: string) => Restaurant | undefined;
  getMenuByRestaurantId: (restaurantId: string) => MenuItem[];
  setActiveOrder: (order: UserOrder | null) => void;
  updateOrderStatus: (orderId: string, status: UserOrder['status']) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'foodswift_user_cart';
const ORDERS_STORAGE_KEY = 'foodswift_user_orders';

// Extended restaurant data for user view
const extendedRestaurants: Restaurant[] = [
  ...mockRestaurants,
  {
    id: 'rest-2',
    ownerId: 'owner-2',
    name: 'Burger Palace',
    description: 'Juicy burgers and crispy fries made with premium ingredients.',
    cuisine: 'American',
    address: '456 Food Street, Burger Town',
    phone: '+1 234 567 8901',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    isOpen: true,
    rating: 4.8,
    deliveryTime: '20-30 min',
    minOrder: 12,
    createdAt: '2024-01-10',
  },
  {
    id: 'rest-3',
    ownerId: 'owner-3',
    name: 'Pizza Napoli',
    description: 'Authentic Italian pizzas baked in wood-fired oven.',
    cuisine: 'Italian',
    address: '789 Italian Ave, Pizza City',
    phone: '+1 234 567 8902',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    isOpen: true,
    rating: 4.7,
    deliveryTime: '25-40 min',
    minOrder: 15,
    createdAt: '2024-01-12',
  },
  {
    id: 'rest-4',
    ownerId: 'owner-4',
    name: 'Tokyo Sushi House',
    description: 'Fresh sushi and Japanese delicacies prepared by expert chefs.',
    cuisine: 'Japanese',
    address: '321 Sushi Lane, Japan Town',
    phone: '+1 234 567 8903',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    isOpen: true,
    rating: 4.9,
    deliveryTime: '30-45 min',
    minOrder: 20,
    createdAt: '2024-01-08',
  },
];

// Extended menu items
const extendedMenuItems: MenuItem[] = [
  ...mockMenuItems,
  // Burger Palace menu
  {
    id: 'menu-bp-1',
    restaurantId: 'rest-2',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with melted cheese, lettuce, tomato, and special sauce',
    price: 12.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isVeg: false,
    isAvailable: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'menu-bp-2',
    restaurantId: 'rest-2',
    name: 'Veggie Burger',
    description: 'Plant-based patty with fresh vegetables and vegan mayo',
    price: 11.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
    isVeg: true,
    isAvailable: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'menu-bp-3',
    restaurantId: 'rest-2',
    name: 'Crispy Fries',
    description: 'Golden crispy fries with seasoning',
    price: 4.99,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    isVeg: true,
    isAvailable: true,
    createdAt: '2024-01-10',
  },
  // Pizza Napoli menu
  {
    id: 'menu-pn-1',
    restaurantId: 'rest-3',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
    price: 14.99,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    isVeg: true,
    isAvailable: true,
    createdAt: '2024-01-12',
  },
  {
    id: 'menu-pn-2',
    restaurantId: 'rest-3',
    name: 'Pepperoni Pizza',
    description: 'Loaded with spicy pepperoni and melted cheese',
    price: 16.99,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    isVeg: false,
    isAvailable: true,
    createdAt: '2024-01-12',
  },
  // Tokyo Sushi menu
  {
    id: 'menu-ts-1',
    restaurantId: 'rest-4',
    name: 'California Roll',
    description: 'Crab, avocado, cucumber with sesame seeds',
    price: 12.99,
    category: 'Rolls',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    isVeg: false,
    isAvailable: true,
    createdAt: '2024-01-08',
  },
  {
    id: 'menu-ts-2',
    restaurantId: 'rest-4',
    name: 'Salmon Nigiri',
    description: 'Fresh salmon over seasoned rice (2 pieces)',
    price: 8.99,
    category: 'Nigiri',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400',
    isVeg: false,
    isAvailable: true,
    createdAt: '2024-01-08',
  },
];

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<UserOrder | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addToCart = (item: MenuItem, restaurantId: string, restaurantName: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id);
      if (existing) {
        return prev.map(c =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.name,
        quantity: 1,
        price: item.price,
        restaurantId,
        restaurantName,
        image: item.image,
      }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const updateCartQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.menuItemId === menuItemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (deliveryAddress: string, paymentMethod: 'upi' | 'card' | 'cod'): UserOrder => {
    const restaurantId = cart[0]?.restaurantId || '';
    const restaurant = extendedRestaurants.find(r => r.id === restaurantId);
    
    const newOrder: UserOrder = {
      id: `order-${Date.now()}`,
      restaurantId,
      restaurantName: restaurant?.name || 'Unknown Restaurant',
      restaurantImage: restaurant?.image || '',
      items: [...cart],
      status: 'placed',
      totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      deliveryAddress,
      paymentMethod,
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString(),
      deliveryPartner: {
        name: 'Alex Runner',
        phone: '+1 555 111 2222',
        location: { lat: 40.7128, lng: -74.0060 },
      },
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const getRestaurantById = (id: string) => extendedRestaurants.find(r => r.id === id);
  
  const getMenuByRestaurantId = (restaurantId: string) => 
    extendedMenuItems.filter(item => item.restaurantId === restaurantId);

  const updateOrderStatus = (orderId: string, status: UserOrder['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
    if (activeOrder?.id === orderId) {
      setActiveOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  return (
    <UserDataContext.Provider value={{
      restaurants: extendedRestaurants,
      menuItems: extendedMenuItems,
      cart,
      orders,
      activeOrder,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      placeOrder,
      getRestaurantById,
      getMenuByRestaurantId,
      setActiveOrder,
      updateOrderStatus,
    }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
}
