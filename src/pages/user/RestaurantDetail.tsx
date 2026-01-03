import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  Plus,
  Minus,
  ShoppingCart,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/contexts/UserDataContext';
import { useToast } from '@/hooks/use-toast';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRestaurantById, getMenuByRestaurantId, addToCart, cart } = useUserData();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const restaurant = getRestaurantById(id || '');
  const menuItems = getMenuByRestaurantId(id || '');

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Restaurant not found</h2>
          <Button onClick={() => navigate('/user/restaurants')}>Browse Restaurants</Button>
        </div>
      </div>
    );
  }

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const getCartQuantity = (itemId: string) => {
    const cartItem = cart.find(c => c.menuItemId === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (item: typeof menuItems[0]) => {
    addToCart(item, restaurant.id, restaurant.name);
    toast({
      title: 'Added to cart',
      description: `${item.name} added to your cart`,
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header Image */}
      <div className="relative h-48 lg:h-64">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Restaurant Info */}
      <div className="px-4 lg:px-8 -mt-16 relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{restaurant.name}</h1>
              <p className="text-muted-foreground">{restaurant.cuisine}</p>
            </div>
            <span className={cn(
              'px-3 py-1 text-sm font-medium rounded-full',
              restaurant.isOpen
                ? 'bg-success/10 text-success'
                : 'bg-muted text-muted-foreground'
            )}>
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <span className="flex items-center gap-1 text-foreground">
              <Star className="w-4 h-4 text-warning fill-warning" />
              {restaurant.rating} Rating
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {restaurant.deliveryTime}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Phone className="w-4 h-4" />
              {restaurant.phone}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {restaurant.address}
          </div>

          <p className="text-muted-foreground mt-4 text-sm">{restaurant.description}</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mt-6 space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'bg-card border border-border rounded-xl p-4 flex gap-4',
                !item.isAvailable && 'opacity-50'
              )}
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                {item.isVeg && (
                  <span className="absolute top-1 left-1 w-5 h-5 bg-success rounded flex items-center justify-center">
                    <Leaf className="w-3 h-3 text-success-foreground" />
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-foreground">₹{item.price.toFixed(2)}</span>
                  {item.isAvailable ? (
                    getCartQuantity(item.id) > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const current = getCartQuantity(item.id);
                            if (current > 1) {
                              // Update quantity logic handled by context
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{getCartQuantity(item.id)}</span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        className="gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-80 z-50"
        >
          <Button
            onClick={() => navigate('/user/cart')}
            className="w-full h-14 gap-3 shadow-xl"
            size="lg"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{cartCount} items</span>
            </div>
            <span className="ml-auto font-bold">₹{cartTotal.toFixed(2)}</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}