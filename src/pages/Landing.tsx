import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Store, Bike, Star, Clock, MapPin, 
  ChevronRight, Smartphone, Shield, Zap,
  UtensilsCrossed, TrendingUp, Users
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserRole } from '@/types/auth';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-food.jpg';
import { FeedbackSection } from '@/components/home/FeedbackSection';

const roles = [
  {
    id: 'user' as UserRole,
    title: 'Order Food',
    description: 'Browse restaurants and get food delivered to your door',
    icon: User,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'owner' as UserRole,
    title: 'Partner with Us',
    description: 'Grow your restaurant with online orders',
    icon: Store,
    color: 'bg-primary',
    gradient: 'from-primary to-accent',
  },
  {
    id: 'delivery' as UserRole,
    title: 'Become a Rider',
    description: 'Earn money delivering food on your schedule',
    icon: Bike,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-emerald-600',
  },
];

const stats = [
  { icon: Star, value: '4.9', label: 'App Rating', color: 'text-yellow-500' },
  { icon: Clock, value: '25min', label: 'Avg Delivery', color: 'text-blue-500' },
  { icon: MapPin, value: '500+', label: 'Cities', color: 'text-green-500' },
  { icon: Users, value: '50K+', label: 'Happy Customers', color: 'text-primary' },
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get your food delivered in under 30 minutes',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Contactless delivery with safety protocols',
  },
  {
    icon: Smartphone,
    title: 'Live Tracking',
    description: 'Track your order in real-time on the map',
  },
  {
    icon: UtensilsCrossed,
    title: '1000+ Restaurants',
    description: 'From local favorites to popular chains',
  },
];

const foodCategories = [
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🍔', name: 'Burgers' },
  { emoji: '🍜', name: 'Asian' },
  { emoji: '🌮', name: 'Mexican' },
  { emoji: '🍱', name: 'Sushi' },
  { emoji: '🥗', name: 'Healthy' },
  { emoji: '🍰', name: 'Desserts' },
  { emoji: '☕', name: 'Coffee' },
];

export default function Landing() {
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    role: UserRole;
    mode: 'login' | 'signup';
  }>({
    isOpen: false,
    role: 'user',
    mode: 'login',
  });

  const openAuth = (role: UserRole, mode: 'login' | 'signup' = 'login') => {
    setAuthModal({ isOpen: true, role, mode });
  };

  const closeAuth = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <Helmet>
        <title>FoodSwift - Fast Food Delivery | Order Online</title>
        <meta name="description" content="Order food, manage your restaurant, or deliver happiness. Join FoodSwift today - the fastest growing food delivery platform." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-xl">🍕</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Food<span className="text-primary">Swift</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => openAuth('owner', 'signup')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Partner with us
              </button>
              <button 
                onClick={() => openAuth('delivery', 'signup')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Become a rider
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => openAuth('user', 'login')}
              >
                Log in
              </Button>
              <Button 
                onClick={() => openAuth('user', 'signup')}
              >
                Sign up
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Delicious food"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10 py-12 lg:py-0">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6"
                >
                  <Zap className="w-4 h-4" />
                  Free delivery on your first order
                </motion.span>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Delicious Food,{' '}
                  <span className="text-gradient bg-gradient-primary">
                    Delivered Fast
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                  Order from the best local restaurants with easy, on-demand delivery. 
                  Fresh meals at your doorstep in minutes.
                </p>

                {/* Search / CTA */}
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-base gap-2"
                    onClick={() => openAuth('user', 'signup')}
                  >
                    Start Ordering
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-base"
                    onClick={() => openAuth('user', 'login')}
                  >
                    Sign in to continue
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right side - Food categories floating */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="hidden lg:block relative"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-4">
                    {foodCategories.map((cat, index) => (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        className="w-20 h-20 bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col items-center justify-center cursor-pointer border border-border/50 hover:border-primary/50 transition-colors"
                        onClick={() => openAuth('user', 'login')}
                      >
                        <span className="text-2xl mb-1">{cat.emoji}</span>
                        <span className="text-xs text-muted-foreground">{cat.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose <span className="text-primary">FoodSwift</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're not just another food delivery app. We're your gateway to the best dining experience.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Role Selection Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Join the FoodSwift Family
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Whether you want to order food, grow your restaurant, or earn as a delivery partner - we've got you covered.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="relative group"
                >
                  <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary shadow-sm hover:shadow-xl transition-all h-full">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-5`}>
                      <role.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{role.title}</h3>
                    <p className="text-muted-foreground text-sm mb-5">{role.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openAuth(role.id, 'login')}
                        className="flex-1"
                      >
                        Sign in
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => openAuth(role.id, 'signup')}
                        className="flex-1"
                      >
                        Sign up
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* App Download CTA */}
        <section className="py-20 bg-gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0tNC00aC0ydi0yaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                Join thousands of customers enjoying delicious food delivered right to their doorstep.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="h-14 px-8 text-base gap-2"
                  onClick={() => openAuth('user', 'signup')}
                >
                  <Smartphone className="w-5 h-5" />
                  Get Started Now
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feedback Section */}
        <FeedbackSection />

        {/* Footer */}
        <footer className="py-12 bg-secondary/50 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <span className="text-xl">🍕</span>
                </div>
                <span className="text-xl font-bold text-foreground">
                  Food<span className="text-primary">Swift</span>
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <button 
                  onClick={() => openAuth('owner', 'signup')}
                  className="hover:text-foreground transition-colors"
                >
                  Partner with us
                </button>
                <button 
                  onClick={() => openAuth('delivery', 'signup')}
                  className="hover:text-foreground transition-colors"
                >
                  Become a rider
                </button>
                <Link to="/help" className="hover:text-foreground transition-colors">
                  Help
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground">
                © 2024 FoodSwift. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuth}
        role={authModal.role}
        initialMode={authModal.mode}
      />
    </>
  );
}
