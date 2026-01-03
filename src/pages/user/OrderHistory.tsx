import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';

export default function OrderHistory() {
  const { orders } = useUserData();

  return (
    <div className="pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={order.restaurantImage}
                  alt={order.restaurantName}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{order.restaurantName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items • ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'delivered'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}