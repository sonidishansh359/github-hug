import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  User,
  Phone,
  MapPin,
  ChevronDown,
  Search,
  Filter,
  Package,
  AlertCircle,
  CheckCheck,
  ChefHat,
  DollarSign,
  Eye,
  Plus,
  MessageSquare,
  Calendar,
  BarChart3,
  PhoneCall,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { PageHeader } from '@/components/owner/DashboardComponents';
import { useOwnerData } from '@/contexts/OwnerDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Order, OrderStatus } from '@/types/auth';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: typeof Clock; 
  textColor: string;
}> = {
  pending: { 
    label: 'Pending', 
    color: 'border-amber-500', 
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    icon: Clock, 
    textColor: 'text-amber-700 dark:text-amber-400' 
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'border-blue-500', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: CheckCircle, 
    textColor: 'text-blue-700 dark:text-blue-400' 
  },
  preparing: { 
    label: 'Preparing', 
    color: 'border-purple-500', 
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: ChefHat, 
    textColor: 'text-purple-700 dark:text-purple-400' 
  },
  ready: { 
    label: 'Ready', 
    color: 'border-emerald-500', 
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: Package, 
    textColor: 'text-emerald-700 dark:text-emerald-400' 
  },
  picked_up: { 
    label: 'Picked Up', 
    color: 'border-cyan-500', 
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    icon: Truck, 
    textColor: 'text-cyan-700 dark:text-cyan-400' 
  },
  delivered: { 
    label: 'Delivered', 
    color: 'border-green-500', 
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: CheckCheck, 
    textColor: 'text-green-700 dark:text-green-400' 
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'border-red-500', 
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: XCircle, 
    textColor: 'text-red-700 dark:text-red-400' 
  },
};

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered'];

export default function OrdersPage() {
  const { orders, deliveryBoys, updateOrderStatus, assignDeliveryBoy } = useOwnerData();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<string>('');
  const [showAssignDialog, setShowAssignDialog] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'today'>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === today
    );
    
    return {
      total: orders.length,
      today: todayOrders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    const today = new Date().toDateString();
    let filtered = orders;

    // Filter by view mode
    if (viewMode === 'today') {
      filtered = filtered.filter(order => 
        new Date(order.createdAt).toDateString() === today
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.includes(query) ||
        order.deliveryAddress.toLowerCase().includes(query)
      );
    }

    // Sort by latest first
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, filterStatus, searchQuery, viewMode]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    const config = statusConfig[newStatus];
    toast({
      title: 'Order Updated',
      description: `Order status changed to ${config.label}`,
      className: cn('border-emerald-200 bg-emerald-50 text-emerald-900'),
    });
  };

  const handleAssignDelivery = (orderId: string, deliveryBoyId: string) => {
    assignDeliveryBoy(orderId, deliveryBoyId);
    const boy = deliveryBoys.find((b) => b.id === deliveryBoyId);
    toast({
      title: 'Delivery Assigned',
      description: `Order assigned to ${boy?.name}`,
      className: cn('border-blue-200 bg-blue-50 text-blue-900'),
    });
    setShowAssignDialog(null);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex >= 0 && currentIndex < statusFlow.length - 1
      ? statusFlow[currentIndex + 1]
      : null;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const calculateItemsCount = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <>
      <Helmet>
        <title>Order Management - FoodSwift Owner</title>
      </Helmet>

      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage all customer orders in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-blue-500 mt-1">+{stats.today} today</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                <p className="text-xs text-amber-500 mt-1">Require attention</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">In Preparation</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.preparing}</p>
                <p className="text-xs text-purple-500 mt-1">In kitchen</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <ChefHat className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.revenue.toFixed(2)}</p>
                <p className="text-xs text-emerald-500 mt-1">Today: ₹{stats.todayRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search orders by ID, customer name, phone, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Tabs value={viewMode} onValueChange={(value: 'all' | 'today') => setViewMode(value)}>
              <TabsList className="h-11">
                <TabsTrigger value="all" className="px-4">
                  All Orders
                </TabsTrigger>
                <TabsTrigger value="today" className="px-4">
                  <Calendar className="h-3 w-3 mr-2" />
                  Today
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-48 h-11">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between">
                    <span>All Status</span>
                    <Badge variant="secondary">{orders.length}</Badge>
                  </div>
                </SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  const count = orders.filter(o => o.status === status).length;
                  return (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{config.label}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Active Filters */}
        {(filterStatus !== 'all' || searchQuery || viewMode !== 'all') && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {viewMode === 'today' && (
              <Badge variant="secondary" className="gap-2">
                <Calendar className="h-3 w-3" />
                Today's Orders
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => setViewMode('all')}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-2">
                Search: "{searchQuery}"
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => setSearchQuery('')}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filterStatus !== 'all' && (
              <Badge variant="secondary" className="gap-2">
                Status: {statusConfig[filterStatus as OrderStatus]?.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => setFilterStatus('all')}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
          <Button onClick={() => {
            setSearchQuery('');
            setFilterStatus('all');
            setViewMode('all');
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, index) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              const isExpanded = expandedOrder === order.id;
              const nextStatus = getNextStatus(order.status);
              const assignedBoy = deliveryBoys.find((b) => b.id === order.deliveryBoyId);
              const itemCount = calculateItemsCount(order.items);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Card className={cn(
                    "overflow-hidden transition-all duration-300 border-gray-200 dark:border-gray-800",
                    "hover:border-emerald-300 dark:hover:border-emerald-800/50 hover:shadow-lg",
                    isExpanded && "border-emerald-200 dark:border-emerald-800/50 shadow-md"
                  )}>
                    {/* Order Header */}
                    <CardContent className="p-0">
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Left Section */}
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "p-3 rounded-xl border-2",
                              config.color,
                              config.bgColor
                            )}>
                              <StatusIcon className={cn("h-6 w-6", config.textColor)} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                  Order #{order.id.slice(-8).toUpperCase()}
                                </h3>
                                <Badge 
                                  variant="secondary" 
                                  className={cn("font-semibold", config.bgColor, config.textColor)}
                                >
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {config.label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium">{order.customerName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(order.createdAt)} • {formatTime(order.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Package className="h-4 w-4" />
                                  <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="max-w-xs truncate">{order.deliveryAddress}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Section */}
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{order.totalAmount.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">Total Amount</p>
                            </div>
                            <ChevronDown
                              className={cn(
                                "h-5 w-5 text-gray-400 transition-transform duration-300",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-200 dark:border-gray-800"
                        >
                          <div className="p-6 space-y-6">
                            {/* Order Items & Customer Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Order Items */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <Package className="h-5 w-5" />
                                  Order Items ({itemCount})
                                </h4>
                                <Card className="border-gray-200 dark:border-gray-800">
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      {order.items.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                              <span className="font-bold text-gray-700 dark:text-gray-300">
                                                {item.quantity}
                                              </span>
                                            </div>
                                            <div>
                                              <p className="font-medium text-gray-900 dark:text-white">
                                                {item.name}
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                                              ₹{item.price.toFixed(2)} each
                                                                            </p>                                            </div>
                                          </div>
                                          <p className="font-bold text-gray-900 dark:text-white">
                                                                          ₹{(item.price * item.quantity).toFixed(2)}
                                                                        </p>                                        </div>
                                      ))}
                                      <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                                        <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                          <span>Total</span>
                                          <span>₹{order.totalAmount.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Customer Details */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <User className="h-5 w-5" />
                                  Customer Details
                                </h4>
                                <Card className="border-gray-200 dark:border-gray-800">
                                  <CardContent className="p-4">
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">Customer Name</p>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {order.customerName}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                          <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">Phone Number</p>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {order.customerPhone}
                                          </p>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="mt-1 h-7 text-xs"
                                            onClick={() => window.location.href = `tel:${order.customerPhone}`}
                                          >
                                            <PhoneCall className="h-3 w-3 mr-1" />
                                            Call Customer
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="p-2 bg-purple-500/10 rounded-lg">
                                          <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm text-gray-500">Delivery Address</p>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {order.deliveryAddress}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Delivery Boy Assignment */}
                                      {assignedBoy ? (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                          <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-500">Assigned Delivery</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                              {assignedBoy.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                              {assignedBoy.phone} • {assignedBoy.vehicle}
                                            </p>
                                          </div>
                                          <Badge 
                                            variant={assignedBoy.isAvailable ? "default" : "secondary"}
                                            className="ml-auto"
                                          >
                                            {assignedBoy.isAvailable ? 'Available' : 'Busy'}
                                          </Badge>
                                        </div>
                                      ) : (order.status === 'ready' || order.status === 'preparing') && (
                                        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                              No delivery assigned
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              Assign a delivery boy to complete the order
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row gap-3">
                                {/* Status Actions */}
                                {order.status === 'pending' && (
                                  <>
                                    <Button
                                      onClick={() => handleStatusChange(order.id, 'confirmed')}
                                      className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
                                    >
                                      <CheckCircle className="h-5 w-5 mr-2" />
                                      Accept Order
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                                      className="flex-1 h-12"
                                    >
                                      <XCircle className="h-5 w-5 mr-2" />
                                      Reject Order
                                    </Button>
                                  </>
                                )}

                                {nextStatus && order.status !== 'pending' && order.status !== 'cancelled' && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          onClick={() => handleStatusChange(order.id, nextStatus)}
                                          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                                        >
                                          <CheckCheck className="h-5 w-5 mr-2" />
                                          Mark as {statusConfig[nextStatus].label}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Move order to next status: {statusConfig[nextStatus].label}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}

                                {/* Delivery Assignment */}
                                {(order.status === 'ready' || order.status === 'preparing') && !assignedBoy && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          onClick={() => setShowAssignDialog(order.id)}
                                          className="flex-1 h-12"
                                        >
                                          <Truck className="h-5 w-5 mr-2" />
                                          Assign Delivery
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Assign a delivery boy to this order</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}

                                {/* Message Customer */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        onClick={() => window.location.href = `sms:${order.customerPhone}`}
                                        className="h-12"
                                      >
                                        <MessageSquare className="h-5 w-5 mr-2" />
                                        Message
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Send SMS to customer</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {/* View Details */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        onClick={() => console.log('View order details:', order)}
                                        className="h-12"
                                      >
                                        <Eye className="h-5 w-5 mr-2" />
                                        Details
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View complete order details</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              {/* Status Timeline */}
                              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                  Order Progress
                                </h5>
                                <div className="flex items-center justify-between">
                                  {statusFlow.map((status, index) => {
                                    const isCompleted = statusFlow.indexOf(order.status) >= index;
                                    const isCurrent = order.status === status;
                                    const statusConfigItem = statusConfig[status];
                                    const Icon = statusConfigItem.icon;
                                    
                                    return (
                                      <div key={status} className="flex flex-col items-center relative">
                                        <div className={cn(
                                          "w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2",
                                          isCompleted 
                                            ? statusConfigItem.color
                                            : "border-gray-300 dark:border-gray-700",
                                          isCurrent && "ring-4 ring-offset-2",
                                          isCurrent && statusConfigItem.bgColor.replace('bg-', 'ring-').replace('/20', '/20')
                                        )}>
                                          <Icon className={cn(
                                            "h-5 w-5",
                                            isCompleted ? statusConfigItem.textColor : "text-gray-400"
                                          )} />
                                        </div>
                                        <span className={cn(
                                          "text-xs font-medium",
                                          isCompleted ? "text-gray-900 dark:text-white" : "text-gray-500"
                                        )}>
                                          {statusConfigItem.label}
                                        </span>
                                        {index < statusFlow.length - 1 && (
                                          <div className={cn(
                                            "absolute top-5 left-full w-8 h-0.5 -translate-x-1/2",
                                            isCompleted ? statusConfigItem.bgColor : "bg-gray-300 dark:bg-gray-700"
                                          )} />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Assign Delivery Dialog */}
      <Dialog open={!!showAssignDialog} onOpenChange={(open) => !open && setShowAssignDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Delivery Boy</DialogTitle>
            <DialogDescription>
              Select a delivery boy to assign to this order
            </DialogDescription>
          </DialogHeader>
          
          {showAssignDialog && (
            <div className="space-y-6">
              <div className="space-y-3">
                {deliveryBoys
                  .filter(boy => boy.isAvailable)
                  .map((boy) => (
                    <div
                      key={boy.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                        selectedDeliveryBoy === boy.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                      )}
                      onClick={() => setSelectedDeliveryBoy(boy.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{boy.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" size="sm">{boy.vehicle}</Badge>
                            <span className="text-xs text-gray-500">{boy.phone}</span>
                          </div>
                        </div>
                      </div>
                      {selectedDeliveryBoy === boy.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  ))}
              </div>
              
              {deliveryBoys.filter(boy => boy.isAvailable).length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">No delivery boys available</p>
                  <p className="text-sm text-gray-500 mt-1">All delivery boys are currently busy</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowAssignDialog(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  disabled={!selectedDeliveryBoy}
                  onClick={() => handleAssignDelivery(showAssignDialog, selectedDeliveryBoy)}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Assign Delivery
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}