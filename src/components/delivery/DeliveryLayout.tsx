import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Wallet,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Power,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useDeliveryData } from '@/contexts/DeliveryDataContext';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/delivery/dashboard' },
  { icon: Package, label: 'Orders', path: '/delivery/orders' },
  { icon: MapPin, label: 'Live Tracking', path: '/delivery/tracking' },
  { icon: Wallet, label: 'Earnings', path: '/delivery/earnings' },
  { icon: User, label: 'Profile', path: '/delivery/profile' },
];

interface DeliveryLayoutProps {
  children: React.ReactNode;
}

export function DeliveryLayout({ children }: DeliveryLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { profile, toggleOnlineStatus, notifications, markNotificationRead } = useDeliveryData();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <Link to="/delivery/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-xl">🚴</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground">FoodSwift</h1>
              <p className="text-xs text-muted-foreground">Delivery Partner</p>
            </div>
          </Link>
        </div>

        {/* Online Status Toggle */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Power className={cn("w-5 h-5", profile.isOnline ? "text-green-500" : "text-muted-foreground")} />
              <span className="text-sm font-medium">{profile.isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <Switch
              checked={profile.isOnline}
              onCheckedChange={toggleOnlineStatus}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {profile.isOnline ? 'You are receiving orders' : 'Go online to receive orders'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <span className="text-xl">🚴</span>
                  </div>
                  <span className="font-bold">FoodSwift</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Online Status Toggle Mobile */}
              <div className="p-4 mx-4 mt-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Power className={cn("w-5 h-5", profile.isOnline ? "text-green-500" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">{profile.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  <Switch
                    checked={profile.isOnline}
                    onCheckedChange={toggleOnlineStatus}
                  />
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                      location.pathname === item.path
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-foreground">
                  {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  profile.isOnline ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                )} />
                <span className="text-sm font-medium">
                  {profile.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-card rounded-xl border border-border shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-border">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationRead(notif.id)}
                              className={cn(
                                "p-4 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors",
                                !notif.read && "bg-primary/5"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                  !notif.read ? "bg-primary" : "bg-muted"
                                )} />
                                <div>
                                  <p className="font-medium text-sm">{notif.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(notif.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-sm">
                    {user?.name?.charAt(0) || 'D'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user?.name || profile.name}</p>
                  <p className="text-xs text-muted-foreground">⭐ {profile.rating}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}