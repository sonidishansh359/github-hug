import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types/auth';

export interface DeliveryOrder extends Order {
  restaurantName: string;
  restaurantAddress: string;
  distance: string;
  estimatedEarning: number;
  pickupTime?: string;
}

export interface DeliveryProfile {
  name: string;
  phone: string;
  email: string;
  vehicleType: 'bike' | 'scooter' | 'car';
  vehicleNumber: string;
  isOnline: boolean;
  rating: number;
  totalDeliveries: number;
  joinedDate: string;
}

export interface DeliveryEarnings {
  today: number;
  todayOrders: number;
  thisWeek: number;
  weeklyOrders: number;
  thisMonth: number;
  monthlyOrders: number;
  pending: number;
}

export interface DeliveryNotification {
  id: string;
  type: 'new_order' | 'order_cancelled' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface DeliveryDataContextType {
  profile: DeliveryProfile;
  updateProfile: (updates: Partial<DeliveryProfile>) => void;
  toggleOnlineStatus: () => void;
  orders: DeliveryOrder[];
  activeOrder: DeliveryOrder | null;
  acceptOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  earnings: DeliveryEarnings;
  notifications: DeliveryNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  currentLocation: { lat: number; lng: number };
  updateLocation: (lat: number, lng: number) => void;
}

const DeliveryDataContext = createContext<DeliveryDataContextType | undefined>(undefined);

const STORAGE_KEY = 'foodswift_delivery_data';

const mockDeliveryOrders: DeliveryOrder[] = [
  {
    id: 'del-order-1',
    restaurantId: 'rest-1',
    restaurantName: 'Spice Garden',
    restaurantAddress: '123 Main Street, Food City',
    userId: 'user-1',
    items: [
      { menuItemId: 'menu-1', name: 'Butter Chicken', quantity: 2, price: 16.99 },
      { menuItemId: 'menu-3', name: 'Biryani', quantity: 1, price: 18.99 },
    ],
    status: 'ready',
    totalAmount: 52.97,
    customerName: 'John Doe',
    customerPhone: '+1 555 123 4567',
    deliveryAddress: '456 Oak Avenue, Apt 12, Food City',
    distance: '2.3 km',
    estimatedEarning: 5.50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'del-order-2',
    restaurantId: 'rest-2',
    restaurantName: 'Pizza Palace',
    restaurantAddress: '456 Pizza Lane, Food City',
    userId: 'user-2',
    items: [
      { menuItemId: 'menu-10', name: 'Margherita Pizza', quantity: 1, price: 14.99 },
      { menuItemId: 'menu-11', name: 'Garlic Bread', quantity: 2, price: 4.99 },
    ],
    status: 'ready',
    totalAmount: 24.97,
    customerName: 'Jane Smith',
    customerPhone: '+1 555 987 6543',
    deliveryAddress: '789 Pine Road, Food City',
    distance: '1.8 km',
    estimatedEarning: 4.20,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'del-order-3',
    restaurantId: 'rest-3',
    restaurantName: 'Burger Barn',
    restaurantAddress: '321 Burger Street, Food City',
    userId: 'user-3',
    items: [
      { menuItemId: 'menu-20', name: 'Classic Burger', quantity: 2, price: 12.99 },
    ],
    status: 'ready',
    totalAmount: 25.98,
    customerName: 'Mike Johnson',
    customerPhone: '+1 555 456 7890',
    deliveryAddress: '654 Elm Street, Food City',
    distance: '3.1 km',
    estimatedEarning: 6.80,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultProfile: DeliveryProfile = {
  name: 'Delivery Partner',
  phone: '+1 234 567 8900',
  email: 'delivery@foodswift.com',
  vehicleType: 'bike',
  vehicleNumber: 'XX-1234',
  isOnline: false,
  rating: 4.8,
  totalDeliveries: 156,
  joinedDate: '2024-01-15',
};

const defaultEarnings: DeliveryEarnings = {
  today: 45.50,
  todayOrders: 8,
  thisWeek: 312.75,
  weeklyOrders: 52,
  thisMonth: 1245.80,
  monthlyOrders: 198,
  pending: 67.25,
};

const mockNotifications: DeliveryNotification[] = [
  {
    id: 'notif-1',
    type: 'new_order',
    title: 'New Order Available',
    message: 'A new order from Spice Garden is ready for pickup!',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'payment',
    title: 'Payment Received',
    message: 'You earned $45.50 today! Keep going.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'Peak Hours Bonus',
    message: 'Earn 1.5x on all deliveries between 6-9 PM!',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

export function DeliveryDataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DeliveryProfile>(defaultProfile);
  const [orders, setOrders] = useState<DeliveryOrder[]>(mockDeliveryOrders);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [earnings, setEarnings] = useState<DeliveryEarnings>(defaultEarnings);
  const [notifications, setNotifications] = useState<DeliveryNotification[]>(mockNotifications);
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.006 });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.activeOrder) setActiveOrder(parsed.activeOrder);
        if (parsed.earnings) setEarnings(parsed.earnings);
        if (parsed.notifications) setNotifications(parsed.notifications);
      } catch {
        console.error('Failed to parse delivery data');
      }
    }
  }, []);

  useEffect(() => {
    const dataToStore = { profile, orders, activeOrder, earnings, notifications };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [profile, orders, activeOrder, earnings, notifications]);

  const updateProfile = (updates: Partial<DeliveryProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const toggleOnlineStatus = () => {
    setProfile(prev => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const acceptOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setActiveOrder({ ...order, status: 'picked_up' });
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    if (activeOrder && activeOrder.id === orderId) {
      if (status === 'delivered') {
        setEarnings(prev => ({
          ...prev,
          today: prev.today + activeOrder.estimatedEarning,
          todayOrders: prev.todayOrders + 1,
          thisWeek: prev.thisWeek + activeOrder.estimatedEarning,
          weeklyOrders: prev.weeklyOrders + 1,
        }));
        setActiveOrder(null);
        setProfile(prev => ({ ...prev, totalDeliveries: prev.totalDeliveries + 1 }));
      } else {
        setActiveOrder({ ...activeOrder, status });
      }
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateLocation = (lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
  };

  return (
    <DeliveryDataContext.Provider
      value={{
        profile,
        updateProfile,
        toggleOnlineStatus,
        orders,
        activeOrder,
        acceptOrder,
        updateOrderStatus,
        earnings,
        notifications,
        markNotificationRead,
        clearNotifications,
        currentLocation,
        updateLocation,
      }}
    >
      {children}
    </DeliveryDataContext.Provider>
  );
}

export function useDeliveryData() {
  const context = useContext(DeliveryDataContext);
  if (context === undefined) {
    throw new Error('useDeliveryData must be used within a DeliveryDataProvider');
  }
  return context;
}