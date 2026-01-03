import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Camera,
  Save,
  MapPin,
  Phone,
  Clock,
  Upload,
  Globe,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Users,
  Star,
  Award,
  Shield,
  Bell,
  CreditCard,
  Smartphone,
  Wifi,
  Coffee,
  Utensils,
  Tag,
  Palette,
  Settings,
  Calendar,
  Clock4,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Building,
  Hash,
  Map,
  Navigation,
  Package,
  Truck,
  DollarSign,
  Percent,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/owner/DashboardComponents';
import { useOwnerData } from '@/contexts/OwnerDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Cuisine options
const cuisineTypes = [
  'Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese', 
  'American', 'Mediterranean', 'Thai', 'French', 'Spanish',
  'Korean', 'Vietnamese', 'Middle Eastern', 'Fast Food', 'Vegetarian',
  'Vegan', 'Seafood', 'Barbecue', 'Breakfast', 'Desserts'
];

// Operating hours options
const timeSlots = [
  '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
];

export default function RestaurantPage() {
  const { restaurant, updateRestaurant, toggleRestaurantOpen } = useOwnerData();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState(restaurant?.image || '');
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    description: restaurant?.description || '',
    cuisine: restaurant?.cuisine || '',
    address: restaurant?.address || '',
    phone: restaurant?.phone || '',
    email: restaurant?.email || '',
    website: restaurant?.website || '',
    deliveryTime: restaurant?.deliveryTime || '30-45',
    minOrder: restaurant?.minOrder || 15,
    deliveryFee: restaurant?.deliveryFee || 2.99,
    taxRate: restaurant?.taxRate || 8.5,
    commissionRate: restaurant?.commissionRate || 15,
    
    // Social Media
    instagram: restaurant?.instagram || '',
    facebook: restaurant?.facebook || '',
    twitter: restaurant?.twitter || '',
    
    // Business Hours
    openingTime: restaurant?.openingTime || '09:00',
    closingTime: restaurant?.closingTime || '22:00',
    openOnWeekends: restaurant?.openOnWeekends ?? true,
    
    // Payment Methods
    acceptCash: restaurant?.acceptCash ?? true,
    acceptCard: restaurant?.acceptCard ?? true,
    acceptDigital: restaurant?.acceptDigital ?? true,
    
    // Features
    hasWifi: restaurant?.hasWifi ?? false,
    hasOutdoor: restaurant?.hasOutdoor ?? false,
    hasParking: restaurant?.hasParking ?? false,
    hasDelivery: restaurant?.hasDelivery ?? true,
    hasTakeaway: restaurant?.hasTakeaway ?? true,
    
    // Theme
    primaryColor: restaurant?.primaryColor || '#059669',
    secondaryColor: restaurant?.secondaryColor || '#10B981',
    
    // Security
    apiKey: restaurant?.apiKey || '',
    apiSecret: restaurant?.apiSecret || '',
  });

  // Update form when restaurant data changes
  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        cuisine: restaurant.cuisine || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        website: restaurant.website || '',
        deliveryTime: restaurant.deliveryTime || '30-45',
        minOrder: restaurant.minOrder || 15,
        deliveryFee: restaurant.deliveryFee || 2.99,
        taxRate: restaurant.taxRate || 8.5,
        commissionRate: restaurant.commissionRate || 15,
        instagram: restaurant.instagram || '',
        facebook: restaurant.facebook || '',
        twitter: restaurant.twitter || '',
        openingTime: restaurant.openingTime || '09:00',
        closingTime: restaurant.closingTime || '22:00',
        openOnWeekends: restaurant.openOnWeekends ?? true,
        acceptCash: restaurant.acceptCash ?? true,
        acceptCard: restaurant.acceptCard ?? true,
        acceptDigital: restaurant.acceptDigital ?? true,
        hasWifi: restaurant.hasWifi ?? false,
        hasOutdoor: restaurant.hasOutdoor ?? false,
        hasParking: restaurant.hasParking ?? false,
        hasDelivery: restaurant.hasDelivery ?? true,
        hasTakeaway: restaurant.hasTakeaway ?? true,
        primaryColor: restaurant.primaryColor || '#059669',
        secondaryColor: restaurant.secondaryColor || '#10B981',
        apiKey: restaurant.apiKey || '',
        apiSecret: restaurant.apiSecret || '',
      });
      setImagePreview(restaurant.image || '');
    }
  }, [restaurant]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateRestaurant({
        ...formData,
        image: imagePreview,
      });
      
      toast({
        title: 'Settings Saved',
        description: 'Your restaurant details have been updated successfully.',
        className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate restaurant metrics
  const metrics = {
    completion: 85, // Based on filled fields
    rating: restaurant?.rating || 4.5,
    reviews: 128,
    orders: 1567,
    customers: 892,
  };

  return (
    <>
      <Helmet>
        <title>Restaurant Settings - FoodSwift Owner</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Restaurant Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your restaurant profile, preferences, and business settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Profile Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.completion}%</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Progress value={metrics.completion} className="mt-3 h-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Customer Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.rating}</p>
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>
                <p className="text-xs text-amber-500 mt-1">{metrics.reviews} reviews</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.orders.toLocaleString()}</p>
                <p className="text-xs text-purple-500 mt-1">All time</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.customers.toLocaleString()}</p>
                <p className="text-xs text-emerald-500 mt-1">Regular customers</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <TabsTrigger value="general" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="hours" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg">
            <Clock className="h-4 w-4 mr-2" />
            Hours
          </TabsTrigger>
          <TabsTrigger value="delivery" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg">
            <Truck className="h-4 w-4 mr-2" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg">
            <Instagram className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg">
            <Shield className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your restaurant's basic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Restaurant Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter restaurant name"
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cuisine" className="text-sm font-medium">Cuisine Type *</Label>
                      <Select value={formData.cuisine} onValueChange={(value) => setFormData({ ...formData, cuisine: value })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                        <SelectContent>
                          {cuisineTypes.map((cuisine) => (
                            <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your restaurant, specialties, and atmosphere"
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">Brief description helps customers understand your restaurant better</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Full street address"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 234 567 8900"
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="contact@restaurant.com"
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://your-restaurant.com"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features & Amenities */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                  <CardDescription>Select what your restaurant offers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Wifi className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Free WiFi</span>
                      </div>
                      <Switch
                        checked={formData.hasWifi}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasWifi: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Utensils className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Outdoor Seating</span>
                      </div>
                      <Switch
                        checked={formData.hasOutdoor}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasOutdoor: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Navigation className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Parking Available</span>
                      </div>
                      <Switch
                        checked={formData.hasParking}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasParking: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Delivery Service</span>
                      </div>
                      <Switch
                        checked={formData.hasDelivery}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasDelivery: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Takeaway</span>
                      </div>
                      <Switch
                        checked={formData.hasTakeaway}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasTakeaway: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image & Status */}
            <div className="space-y-6">
              {/* Restaurant Image */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle>Restaurant Image</CardTitle>
                  <CardDescription>Upload a high-quality photo of your restaurant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative group">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Restaurant"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="restaurant-image"
                    />
                    <label htmlFor="restaurant-image" className="block mt-3">
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <div>
                          <Upload className="h-4 w-4" />
                          Upload New Image
                        </div>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Recommended: 1200x800px • Max 5MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Restaurant Status */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle>Restaurant Status</CardTitle>
                  <CardDescription>Control your restaurant's availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Online Status</p>
                      <p className="text-sm text-gray-500">
                        {restaurant?.isOpen ? 'Open for orders' : 'Currently closed'}
                      </p>
                    </div>
                    <Switch
                      checked={restaurant?.isOpen}
                      onCheckedChange={toggleRestaurantOpen}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Bell className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Status Alert</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Customers will see your restaurant as {restaurant?.isOpen ? 'OPEN' : 'CLOSED'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Accept payments from customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <Switch
                      checked={formData.acceptCash}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptCash: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">Credit/Debit Cards</span>
                    </div>
                    <Switch
                      checked={formData.acceptCard}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptCard: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">Digital Wallets</span>
                    </div>
                    <Switch
                      checked={formData.acceptDigital}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptDigital: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Hours & Operation Tab */}
        <TabsContent value="hours" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Set your daily operating hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Opening Time</Label>
                    <Select value={formData.openingTime} onValueChange={(value) => setFormData({ ...formData, openingTime: value })}>
                      <SelectTrigger className="h-11">
                        <Clock className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select opening time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Closing Time</Label>
                    <Select value={formData.closingTime} onValueChange={(value) => setFormData({ ...formData, closingTime: value })}>
                      <SelectTrigger className="h-11">
                        <Clock className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select closing time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Open on Weekends</p>
                      <p className="text-sm text-gray-500">Saturday & Sunday</p>
                    </div>
                    <Switch
                      checked={formData.openOnWeekends}
                      onCheckedChange={(checked) => setFormData({ ...formData, openOnWeekends: checked })}
                    />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Current Schedule</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formData.openingTime} - {formData.closingTime}
                          {formData.openOnWeekends ? ' (7 days)' : ' (Weekdays only)'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Hours */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Special Hours</CardTitle>
                <CardDescription>Set exceptions for holidays or events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">No special hours set</h4>
                  <p className="text-sm text-gray-500 mb-4">Add special hours for holidays or events</p>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Special Hours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Delivery Settings Tab */}
        <TabsContent value="delivery" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>Configure delivery options and fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime" className="text-sm font-medium">Estimated Delivery Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="deliveryTime"
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        placeholder="e.g. 30-45 min"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minOrder" className="text-sm font-medium">Minimum Order Amount (₹)</Label>
                    <Input
                      id="minOrder"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minOrder}
                      onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee" className="text-sm font-medium">Delivery Fee (₹)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.deliveryFee}
                      onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryRadius" className="text-sm font-medium">Delivery Radius (miles)</Label>
                    <Select>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select delivery radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 miles</SelectItem>
                        <SelectItem value="5">5 miles</SelectItem>
                        <SelectItem value="8">8 miles</SelectItem>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="15">15 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Settings */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Pricing & Commission</CardTitle>
                <CardDescription>Set taxes and commission rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate" className="text-sm font-medium">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate" className="text-sm font-medium">Platform Commission (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">Percentage taken by the platform per order</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Commission Note</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Commission is applied to total order amount before taxes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your restaurant's social profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-sm font-medium">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-600" />
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        placeholder="@yourrestaurant"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-sm font-medium">Facebook</Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                      <Input
                        id="facebook"
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        placeholder="facebook.com/yourrestaurant"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-sm font-medium">Twitter / X</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        placeholder="@yourrestaurant"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Customization */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Theme Colors</CardTitle>
                <CardDescription>Customize your restaurant's color scheme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-12 h-12 p-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-sm font-medium">Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-12 h-12 p-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium mb-3">Color Preview</h4>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-8 h-8 rounded-lg" 
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                    <div 
                      className="w-8 h-8 rounded-lg" 
                      style={{ backgroundColor: formData.secondaryColor }}
                    />
                    <div className="text-sm text-gray-600">
                      Primary & Secondary colors
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Advanced settings for developers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-sm font-medium">API Key</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="apiKey"
                      type={showPassword ? "text" : "password"}
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="pl-10 h-11"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiSecret" className="text-sm font-medium">API Secret</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="apiSecret"
                      type={showPassword ? "text" : "password"}
                      value={formData.apiSecret}
                      onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                      className="pl-10 h-11"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Keep these credentials secure and never share them</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Security Warning</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      These settings are for advanced users only. Incorrect changes may affect your restaurant's functionality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="destructive" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Regenerate API Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Bar */}
      <AnimatePresence>
        {true && ( // Always show for now, can add logic to detect changes
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className="border-emerald-200 dark:border-emerald-800 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Save className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Unsaved Changes</p>
                      <p className="text-sm text-gray-500">Save your changes to apply them</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Discard
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}