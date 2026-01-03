import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Restaurant, MenuItem, Order, DeliveryBoy } from '@/types/auth';
import { mockRestaurants, mockMenuItems, mockOrders, mockDeliveryBoys } from '@/data/mockData';

interface OwnerDataContextType {
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  orders: Order[];
  deliveryBoys: DeliveryBoy[];
  
  // Restaurant actions
  updateRestaurant: (data: Partial<Restaurant>) => void;
  toggleRestaurantOpen: () => void;
  
  // Menu actions
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt'>) => void;
  updateMenuItem: (id: string, data: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  
  // Order actions
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignDeliveryBoy: (orderId: string, deliveryBoyId: string) => void;
  
  // Stats
  getTodayStats: () => { orders: number; revenue: number; pending: number };
}

const OwnerDataContext = createContext<OwnerDataContextType | undefined>(undefined);

const RESTAURANT_KEY = 'foodswift_restaurant';
const MENU_KEY = 'foodswift_menu';
const ORDERS_KEY = 'foodswift_orders';

export function OwnerDataProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const deliveryBoys = mockDeliveryBoys;

  useEffect(() => {
    // Load from localStorage or use mock data
    const storedRestaurant = localStorage.getItem(RESTAURANT_KEY);
    const storedMenu = localStorage.getItem(MENU_KEY);
    const storedOrders = localStorage.getItem(ORDERS_KEY);

    setRestaurant(storedRestaurant ? JSON.parse(storedRestaurant) : mockRestaurants[0]);
    setMenuItems(storedMenu ? JSON.parse(storedMenu) : mockMenuItems);
    setOrders(storedOrders ? JSON.parse(storedOrders) : mockOrders);
  }, []);

  // Persist changes
  useEffect(() => {
    if (restaurant) localStorage.setItem(RESTAURANT_KEY, JSON.stringify(restaurant));
  }, [restaurant]);

  useEffect(() => {
    if (menuItems.length) localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    if (orders.length) localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const updateRestaurant = (data: Partial<Restaurant>) => {
    setRestaurant(prev => prev ? { ...prev, ...data } : null);
  };

  const toggleRestaurantOpen = () => {
    setRestaurant(prev => prev ? { ...prev, isOpen: !prev.isOpen } : null);
  };

  const addMenuItem = (item: Omit<MenuItem, 'id' | 'createdAt'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (id: string, data: Partial<MenuItem>) => {
    setMenuItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  const assignDeliveryBoy = (orderId: string, deliveryBoyId: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, deliveryBoyId, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      order => new Date(order.createdAt).toDateString() === today
    );

    return {
      orders: todayOrders.length,
      revenue: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      pending: todayOrders.filter(order => order.status === 'pending').length,
    };
  };

  return (
    <OwnerDataContext.Provider
      value={{
        restaurant,
        menuItems,
        orders,
        deliveryBoys,
        updateRestaurant,
        toggleRestaurantOpen,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        updateOrderStatus,
        assignDeliveryBoy,
        getTodayStats,
      }}
    >
      {children}
    </OwnerDataContext.Provider>
  );
}

export function useOwnerData() {
  const context = useContext(OwnerDataContext);
  if (context === undefined) {
    throw new Error('useOwnerData must be used within an OwnerDataProvider');
  }
  return context;
}
