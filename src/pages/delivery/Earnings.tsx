import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, DollarSign, Package, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryLayout } from '@/components/delivery/DeliveryLayout';
import { useDeliveryData } from '@/contexts/DeliveryDataContext';
import { cn } from '@/lib/utils';

const mockDailyEarnings = [
  { day: 'Mon', amount: 45.50, orders: 8 },
  { day: 'Tue', amount: 62.30, orders: 11 },
  { day: 'Wed', amount: 38.90, orders: 7 },
  { day: 'Thu', amount: 71.20, orders: 13 },
  { day: 'Fri', amount: 89.40, orders: 16 },
  { day: 'Sat', amount: 52.80, orders: 9 },
  { day: 'Sun', amount: 48.65, orders: 8 },
];

const mockTransactions = [
  { id: 1, type: 'earning', description: 'Order #DEL001', amount: 5.50, time: '2 hours ago' },
  { id: 2, type: 'earning', description: 'Order #DEL002', amount: 4.20, time: '3 hours ago' },
  { id: 3, type: 'bonus', description: 'Peak Hour Bonus', amount: 10.00, time: '4 hours ago' },
  { id: 4, type: 'earning', description: 'Order #DEL003', amount: 6.80, time: '5 hours ago' },
  { id: 5, type: 'earning', description: 'Order #DEL004', amount: 5.00, time: 'Yesterday' },
  { id: 6, type: 'payout', description: 'Weekly Payout', amount: -250.00, time: '3 days ago' },
];

export default function DeliveryEarnings() {
  const { earnings, profile } = useDeliveryData();

  const maxEarning = Math.max(...mockDailyEarnings.map(d => d.amount));

  return (
    <DeliveryLayout>
      <Helmet>
        <title>Earnings | FoodSwift Delivery</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
          <p className="text-muted-foreground mt-1">
            Track your earnings and payment history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Today</p>
                    <p className="text-3xl font-bold mt-1">₹{earnings.today.toFixed(2)}</p>
                    <p className="text-sm opacity-80 mt-1">{earnings.todayOrders} deliveries</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/20">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold mt-1">₹{earnings.thisWeek.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-1">{earnings.weeklyOrders} deliveries</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold mt-1">₹{earnings.thisMonth.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-1">{earnings.monthlyOrders} deliveries</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Calendar className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold mt-1">₹{earnings.pending.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Next payout: Monday</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/10">
                    <Package className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {mockDailyEarnings.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ height: 0 }}
                    animate={{ height: `₹{(day.amount / maxEarning) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full rounded-t-lg bg-primary hover:bg-primary/80 transition-colors cursor-pointer relative group"
                      style={{ height: '100%', minHeight: '20px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-2 py-1 rounded text-xs whitespace-nowrap">
                        ₹{day.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs text-muted-foreground">{day.day}</p>
                      <p className="text-xs font-medium">{day.orders}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Deliveries</p>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </div>
                </div>
                <p className="text-xl font-bold">{profile.totalDeliveries}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <span className="text-sm">⭐</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rating</p>
                    <p className="text-xs text-muted-foreground">Customer reviews</p>
                  </div>
                </div>
                <p className="text-xl font-bold">{profile.rating}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avg. Per Delivery</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                </div>
                <p className="text-xl font-bold">
                  ₹{(earnings.thisWeek / earnings.weeklyOrders).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transaction History</span>
              <Tabs defaultValue="all" className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  <TabsTrigger value="payouts">Payouts</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTransactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      transaction.type === 'payout' ? "bg-red-500/10" : "bg-green-500/10"
                    )}>
                      {transaction.type === 'payout' ? (
                        <ArrowUp className="w-5 h-5 text-red-500" />
                      ) : (
                        <ArrowDown className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold",
                      transaction.amount < 0 ? "text-red-500" : "text-green-500"
                    )}>
                      {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DeliveryLayout>
  );
}