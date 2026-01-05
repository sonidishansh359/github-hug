import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { OwnerDataProvider } from "@/contexts/OwnerDataContext";
import { DeliveryDataProvider } from "@/contexts/DeliveryDataContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Restaurants from "./pages/Restaurants";
import Offers from "./pages/Offers";
import Help from "./pages/Help";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Landing from "./pages/Landing";
import OwnerDashboard from "./pages/owner/Dashboard";
import OwnerRestaurant from "./pages/owner/Restaurant";
import OwnerMenu from "./pages/owner/Menu";
import OwnerOrders from "./pages/owner/Orders";
import OwnerEarnings from "./pages/owner/Earnings";
import DeliveryDashboard from "./pages/delivery/Dashboard";
import DeliveryOrders from "./pages/delivery/Orders";
import DeliveryTracking from "./pages/delivery/Tracking";
import DeliveryEarnings from "./pages/delivery/Earnings";
import DeliveryProfile from "./pages/delivery/Profile";
import UserLayout from "./components/user/UserLayout";
import UserDashboard from "./pages/user/Dashboard";
import RestaurantDetail from "./pages/user/RestaurantDetail";
import UserCart from "./pages/user/UserCart";
import CheckoutSuccess from "./pages/user/CheckoutSuccess";
import OrderTracking from "./pages/user/OrderTracking";
import OrderHistory from "./pages/user/OrderHistory";
import UserFeedback from "./pages/user/Feedback";

const queryClient = new QueryClient();

// Protected route wrapper for owner pages
const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || user?.role !== 'owner') {
    return <Navigate to="/login" replace />;
  }
  
  return <OwnerDataProvider>{children}</OwnerDataProvider>;
};

// Protected route wrapper for delivery pages
const DeliveryRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || user?.role !== 'delivery') {
    return <Navigate to="/login" replace />;
  }
  
  return <DeliveryDataProvider>{children}</DeliveryDataProvider>;
};

// Protected route wrapper for user pages
const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || user?.role !== 'user') {
    return <Navigate to="/login" replace />;
  }
  
  return <UserDataProvider>{children}</UserDataProvider>;
};

const AppRoutes = () => (
  <Routes>
   
    <Route path="/" element={<Landing />} />
    <Route path="/restaurants" element={<Restaurants />} />
    <Route path="/offers" element={<Offers />} />
    <Route path="/help" element={<Help />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/cart" element={<Cart />} />
    
    {/* Owner Dashboard Routes */}
    <Route path="/owner/dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
    <Route path="/owner/restaurant" element={<OwnerRoute><OwnerRestaurant /></OwnerRoute>} />
    <Route path="/owner/menu" element={<OwnerRoute><OwnerMenu /></OwnerRoute>} />
    <Route path="/owner/orders" element={<OwnerRoute><OwnerOrders /></OwnerRoute>} />
    <Route path="/owner/earnings" element={<OwnerRoute><OwnerEarnings /></OwnerRoute>} />
    
    {/* Delivery Dashboard Routes */}
    <Route path="/delivery/dashboard" element={<DeliveryRoute><DeliveryDashboard /></DeliveryRoute>} />
    <Route path="/delivery/orders" element={<DeliveryRoute><DeliveryOrders /></DeliveryRoute>} />
    <Route path="/delivery/tracking" element={<DeliveryRoute><DeliveryTracking /></DeliveryRoute>} />
    <Route path="/delivery/earnings" element={<DeliveryRoute><DeliveryEarnings /></DeliveryRoute>} />
    <Route path="/delivery/profile" element={<DeliveryRoute><DeliveryProfile /></DeliveryRoute>} />
    
    {/* User Dashboard Routes */}
    <Route path="/user" element={<UserRoute><UserLayout /></UserRoute>}>
      <Route path="dashboard" element={<UserDashboard />} />
      <Route path="restaurants" element={<UserDashboard />} />
      <Route path="restaurant/:id" element={<RestaurantDetail />} />
      <Route path="cart" element={<UserCart />} />
      <Route path="checkout-success" element={<CheckoutSuccess />} />
      <Route path="tracking" element={<OrderTracking />} />
      <Route path="orders" element={<OrderHistory />} />
      <Route path="feedback" element={<UserFeedback />} />
      <Route path="profile" element={<div className="p-8 text-center text-muted-foreground">Profile page</div>} />
    </Route>
    
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;