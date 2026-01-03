import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ChefHat,
  Users,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  ExternalLink,
  BellRing,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react';
import { StatCard, PageHeader } from '@/components/owner/DashboardComponents';
import { useOwnerData } from '@/contexts/OwnerDataContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// Mock notifications data
const mockNotifications = [
  { id: 1, message: "New order #ORD-7892 received", time: "2 min ago", unread: true },
  { id: 2, message: "Order #ORD-7891 is ready for pickup", time: "15 min ago", unread: true },
  { id: 3, message: "Weekly earnings report is available", time: "1 hour ago", unread: false },
  { id: 4, message: "Low inventory alert: Chicken Breast", time: "3 hours ago", unread: false },
];

// Mock peak hours data
const mockPeakHours = [
  { hour: '12:00 PM', orders: 45, avgWait: '15 min' },
  { hour: '1:00 PM', orders: 52, avgWait: '18 min' },
  { hour: '7:00 PM', orders: 48, avgWait: '20 min' },
  { hour: '8:00 PM', orders: 38, avgWait: '17 min' },
];

export default function OwnerDashboard() {
  const { orders, restaurant, getTodayStats, updateRestaurantStatus } = useOwnerData();
  const stats = getTodayStats();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showPeakHours, setShowPeakHours] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const recentOrders = orders
    .filter((order) => order.status !== 'delivered' && order.status !== 'cancelled')
    .slice(0, 5);

  // Calculate order completion percentage
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const completionRate = orders.length > 0 
    ? ((deliveredOrders / orders.length) * 100)
    : 0;

  // Mock data for daily trends
  const hourlyData = [65, 78, 45, 92, 68, 89, 76, 95, 88, 72, 85, 90];
  const maxHourly = Math.max(...hourlyData);

  // Handle restaurant status toggle
  const handleToggleStatus = async () => {
    if (!restaurant || isTogglingStatus) return;
    
    setIsTogglingStatus(true);
    try {
      await updateRestaurantStatus(!restaurant.isOpen);
    } catch (error) {
      console.error('Failed to update restaurant status:', error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
  };

  // Get unread count
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <Helmet>
        <title>Dashboard - FoodSwift Owner</title>
      </Helmet>

      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl" />

        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
                <ChefHat className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back! Here's what's happening at 
                  <span className="font-semibold text-foreground ml-1">
                    {restaurant?.name || 'your restaurant'}.
                  </span>
                </p>
              </div>
            </div>
          }
          actions={
            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full relative hover:bg-muted transition-all duration-200"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllAsRead}
                        className="h-6 text-xs"
                      >
                        Mark all as read
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "flex flex-col items-start p-3 cursor-pointer hover:bg-muted/50",
                          notification.unread && "bg-primary/5"
                        )}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 rounded-full bg-primary ml-2 flex-shrink-0" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <BellRing className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No notifications</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings Button */}
              <Link to="/owner/settings">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full hover:bg-muted transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <StatCard
              title="Today's Orders"
              value={stats.orders}
              icon={ShoppingBag}
              trend={{ value: 12, isPositive: true }}
              gradient="from-blue-500/10 to-blue-500/5"
              iconColor="text-blue-600"
              className="group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <StatCard
              title="Today's Revenue"
              value={`₹${stats.revenue.toFixed(2)}`}
              icon={DollarSign}
              trend={{ value: 8, isPositive: true }}
              gradient="from-emerald-500/10 to-emerald-500/5"
              iconColor="text-emerald-600"
              className="group hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <StatCard
              title="Pending Orders"
              value={stats.pending}
              icon={Clock}
              gradient="from-amber-500/10 to-amber-500/5"
              iconColor="text-amber-600"
              className="group hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <StatCard
              title="Order Completion"
              value={`${completionRate.toFixed(1)}%`}
              icon={TrendingUp}
              trend={{ value: 5.2, isPositive: completionRate > 70 }}
              gradient="from-purple-500/10 to-purple-500/5"
              iconColor="text-purple-600"
              className="group hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
            />
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-gradient-to-br from-card to-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
                    <p className="text-sm text-muted-foreground">Active orders needing attention</p>
                  </div>
                </div>
                <Link to="/owner/orders">
                  <Button variant="ghost" size="sm" className="group">
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-transparent rounded-xl border hover:border-primary/20 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          order.status === 'pending' && "bg-warning/20",
                          order.status === 'preparing' && "bg-primary/20",
                          order.status === 'ready' && "bg-success/20"
                        )}>
                          {order.status === 'pending' && <Clock className="w-4 h-4 text-warning" />}
                          {order.status === 'preparing' && <ChefHat className="w-4 h-4 text-primary" />}
                          {order.status === 'ready' && <ShoppingBag className="w-4 h-4 text-success" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Order #{order.id.slice(-6)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                        <Badge
                          className={cn(
                            "mt-2",
                            order.status === 'pending' && "bg-warning/20 text-warning hover:bg-warning/30",
                            order.status === 'preparing' && "bg-primary/20 text-primary hover:bg-primary/30",
                            order.status === 'ready' && "bg-success/20 text-success hover:bg-success/30"
                          )}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full" />
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 relative" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No active orders</h3>
                  <p className="text-muted-foreground mb-6">All caught up! New orders will appear here.</p>
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Refresh Orders
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Daily Trends */}
            <div className="bg-gradient-to-br from-card to-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Today's Trends</h2>
                    <p className="text-sm text-muted-foreground">Order volume by hour</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between h-32 gap-1">
                {hourlyData.map((value, hour) => (
                  <motion.div
                    key={hour}
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / maxHourly) * 100}%` }}
                    transition={{ delay: 0.7 + hour * 0.02, duration: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                    className="relative flex-1 group"
                  >
                    <div 
                      className={cn(
                        "w-full rounded-t-lg bg-gradient-to-t transition-all duration-300",
                        hour >= 8 && hour <= 20 
                          ? "from-primary to-primary/60" 
                          : "from-muted-foreground/30 to-muted-foreground/20"
                      )}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                      {value} orders
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-foreground" />
                    </div>
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                      {hour}:00
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Restaurant Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-card to-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
              </div>
              
              <div className="space-y-3">
                {[
                  { icon: "🍽️", label: "Add Menu Item", path: "/owner/menu", color: "from-blue-500/10 to-blue-500/5" },
                  { icon: "⚙️", label: "Edit Restaurant", path: "/owner/restaurant", color: "from-emerald-500/10 to-emerald-500/5" },
                  { icon: "📋", label: "Manage Orders", path: "/owner/orders", color: "from-purple-500/10 to-purple-500/5" },
                  { icon: "📊", label: "View Earnings", path: "/owner/earnings", color: "from-amber-500/10 to-amber-500/5" },
                ].map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <Link to={action.path}>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start h-12 bg-gradient-to-r hover:shadow-md transition-all duration-300 group",
                          action.color
                        )}
                      >
                        <span className="text-lg mr-3 group-hover:scale-110 transition-transform">
                          {action.icon}
                        </span>
                        <span className="font-medium">{action.label}</span>
                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all" />
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Restaurant Status Section */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      restaurant?.isOpen 
                        ? "bg-success/20" 
                        : "bg-destructive/20"
                    )}>
                      {restaurant?.isOpen ? (
                        <ShoppingBag className="w-5 h-5 text-success" />
                      ) : (
                        <Clock className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Restaurant Status</h3>
                      <p className="text-sm text-muted-foreground">Currently {restaurant?.isOpen ? 'accepting' : 'not accepting'} orders</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={restaurant?.isOpen ? "default" : "destructive"}
                    className="rounded-full min-w-[80px]"
                    onClick={handleToggleStatus}
                    disabled={isTogglingStatus}
                  >
                    {isTogglingStatus ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      </span>
                    ) : restaurant?.isOpen ? "Open" : "Closed"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Order Completion */}
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Order Completion</span>
                      <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={completionRate} 
                      className="h-2"
                      indicatorClassName={cn(
                        completionRate >= 70 ? "bg-success" :
                        completionRate >= 40 ? "bg-warning" :
                        "bg-destructive"
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {deliveredOrders} of {orders.length} orders completed
                    </p>
                  </div>
                  
                  {/* Total Orders */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Orders</span>
                    </div>
                    <span className="font-bold text-lg">{orders.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Performance Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-5 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-foreground">Performance Tip</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Peak hours are approaching! Consider preparing popular menu items in advance to reduce wait times.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-blue-500/20 text-blue-600 hover:bg-blue-500/10"
                onClick={() => setShowPeakHours(true)}
              >
                View Peak Hours
              </Button>
            </motion.div>

            {/* Peak Hours Modal */}
            {showPeakHours && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Peak Hours</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPeakHours(false)}
                      className="rounded-full"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {mockPeakHours.map((hour) => (
                      <div
                        key={hour.hour}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{hour.hour}</p>
                          <p className="text-sm text-muted-foreground">Average wait: {hour.avgWait}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{hour.orders}</p>
                          <p className="text-xs text-muted-foreground">orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowPeakHours(false)}
                    >
                      Close
                    </Button>
                    <Button className="flex-1">
                      View Full Report
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
