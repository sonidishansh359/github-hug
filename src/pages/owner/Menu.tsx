import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Camera,
  Filter,
  Tag,
  ChefHat,
  DollarSign,
  Eye,
  EyeOff,
  Package,
  Grid,
  List,
  AlertCircle,
  Sparkles,
  Upload,
} from 'lucide-react';
import { PageHeader } from '@/components/owner/DashboardComponents';
import { useOwnerData } from '@/contexts/OwnerDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/types/auth';
import { menuCategories } from '@/data/mockData';
import { cn } from '@/lib/utils';

const initialFormState = {
  name: '',
  description: '',
  price: 0,
  category: '',
  image: '',
  isVeg: true,
  isAvailable: true,
  restaurantId: 'rest-1',
  preparationTime: 15,
  calories: 0,
  ingredients: '',
};

export default function MenuPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability, restaurant } = useOwnerData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [imagePreview, setImagePreview] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const stats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.isAvailable).length,
    vegetarian: menuItems.filter(item => item.isVeg).length,
    avgPrice: menuItems.length > 0 
      ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length 
      : 0,
  };

  // Category stats
  const categoryStats = menuCategories.reduce((acc, category) => {
    acc[category] = menuItems.filter(item => item.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        restaurantId: item.restaurantId,
        preparationTime: item.preparationTime || 15,
        calories: item.calories || 0,
        ingredients: item.ingredients || '',
      });
      setImagePreview(item.image);
    } else {
      setEditingItem(null);
      setFormData(initialFormState);
      setImagePreview('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setEditingItem(null);
      setFormData(initialFormState);
      setImagePreview('');
    }, 300);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

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
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.price <= 0) {
      toast({
        title: 'Invalid input',
        description: 'Please fill all required fields correctly',
        variant: 'destructive',
      });
      return;
    }

    if (editingItem) {
      updateMenuItem(editingItem.id, formData);
      toast({ 
        title: 'Item Updated', 
        description: `${formData.name} has been updated successfully.`,
        className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      });
    } else {
      addMenuItem(formData);
      toast({ 
        title: 'Item Added', 
        description: `${formData.name} has been added to the menu.`,
        className: 'bg-blue-50 text-blue-900 border-blue-200',
      });
    }
    
    handleCloseDialog();
  };

  const handleDelete = (id: string, name: string) => {
    deleteMenuItem(id);
    setShowDeleteConfirm(null);
    toast({ 
      title: 'Item Deleted', 
      description: `${name} has been removed from the menu.`,
      className: 'bg-red-50 text-red-900 border-red-200',
    });
  };

  return (
    <>
      <Helmet>
        <title>Menu Management - FoodSwift Owner</title>
      </Helmet>

      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage {menuItems.length} items across {menuCategories.length} categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Suggestions
          </Button>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
          >
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Available Now</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.available}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Vegetarian Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.vegetarian}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <ChefHat className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Average Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.avgPrice.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                placeholder="Search menu items by name or description..."
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
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 h-11">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between">
                    <span>All Categories</span>
                    <Badge variant="secondary">{menuItems.length}</Badge>
                  </div>
                </SelectItem>
                {menuCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center justify-between">
                      <span>{cat}</span>
                      <Badge variant="secondary">{categoryStats[cat] || 0}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Tabs value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
              <TabsList className="h-11">
                <TabsTrigger value="grid" className="px-3">
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Active Filters */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-2">
                Search: "{searchQuery}"
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-2">
                Category: {selectedCategory}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => setSelectedCategory('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Menu Items Display */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}>
            Clear Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className={cn(
                  'h-full overflow-hidden transition-all duration-300 border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-800/50 hover:shadow-lg',
                  !item.isAvailable && 'opacity-70'
                )}>
                  {/* Image Section */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className={cn(
                        'font-semibold',
                        item.isVeg 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      )}>
                        {item.isVeg ? 'VEG' : 'NON-VEG'}
                      </Badge>
                      {!item.isAvailable && (
                        <Badge variant="secondary" className="font-semibold">
                          <EyeOff className="h-3 w-3 mr-1" />
                          UNAVAILABLE
                        </Badge>
                      )}
                    </div>
                    
                    {/* Price Tag */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                        ₹{item.price.toFixed(2)}
                                                      </span>                      </div>
                    </div>
                    
                    {/* Category */}
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="outline" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                        <Tag className="h-3 w-3 mr-1" />
                        {item.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={item.isAvailable}
                                    onCheckedChange={() => toggleItemAvailability(item.id)}
                                    className={item.isAvailable ? 'data-[state=checked]:bg-emerald-500' : ''}
                                  />
                                  <span className="text-sm font-medium">
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Toggle item availability</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleOpenDialog(item)}
                                  className="h-9 w-9 border-gray-300 dark:border-gray-700"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit item</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setShowDeleteConfirm(item.id)}
                                  className="h-9 w-9 border-red-200 dark:border-red-800 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete item</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ x: 4 }}
              >
                <Card className="border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-800/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className={cn(
                          'absolute top-1 left-1 w-3 h-3 rounded-full',
                          item.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                        )} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" size="sm">{item.category}</Badge>
                              <span className="text-sm text-gray-500">
                                ₹{item.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-2">
                              {item.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Switch
                              checked={item.isAvailable}
                              onCheckedChange={() => toggleItemAvailability(item.id)}
                              className={item.isAvailable ? 'data-[state=checked]:bg-emerald-500' : ''}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowDeleteConfirm(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? 'Update the details of your menu item' 
                : 'Add a new item to your restaurant menu'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Item Image</Label>
              <div className="relative group">
                <div 
                  onClick={handleImageClick}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:border-emerald-400 transition-colors flex items-center justify-center"
                >
                  {imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">Click to upload image</p>
                      <p className="text-sm text-gray-500">Recommended: 800x600px • Max 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="itemName" className="text-sm font-medium">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Spicy Chicken Burger"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemDesc" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="itemDesc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the item"
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemIngredients" className="text-sm font-medium">Ingredients</Label>
                  <Textarea
                    id="itemIngredients"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="List main ingredients, separated by commas"
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemPrice" className="text-sm font-medium">Price (₹) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <Input
                        id="itemPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="pl-8 h-11"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="itemCategory" className="text-sm font-medium">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime" className="text-sm font-medium">Prep Time (min)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      min="1"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="calories" className="text-sm font-medium">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      min="0"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Vegetarian</Label>
                      <p className="text-xs text-gray-500">Is this item vegetarian?</p>
                    </div>
                    <Switch
                      checked={formData.isVeg}
                      onCheckedChange={(checked) => setFormData({ ...formData, isVeg: checked })}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Available</Label>
                      <p className="text-xs text-gray-500">Show this item to customers</p>
                    </div>
                    <Switch
                      checked={formData.isAvailable}
                      onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12" 
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
              >
                {editingItem ? 'Update Item' : 'Add to Menu'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Menu Item</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the menu item and remove it from all orders.
            </DialogDescription>
          </DialogHeader>
          
          {showDeleteConfirm && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {menuItems.find(item => item.id === showDeleteConfirm)?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Category: {menuItems.find(item => item.id === showDeleteConfirm)?.category}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleDelete(
                    showDeleteConfirm, 
                    menuItems.find(item => item.id === showDeleteConfirm)?.name || 'Item'
                  )}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}