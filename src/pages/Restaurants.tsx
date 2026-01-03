import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RestaurantCard from "@/components/home/RestaurantCard";
import { Button } from "@/components/ui/button";

const allRestaurants = [
  {
    id: 1,
    name: "Burger Palace",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    cuisine: "American",
    rating: 4.8,
    reviewCount: 245,
    deliveryTime: "20-30 min",
    deliveryFee: "Free",
    distance: "1.2 km",
    featured: true,
    discount: "20% OFF",
  },
  {
    id: 2,
    name: "Tokyo Sushi House",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80",
    cuisine: "Japanese",
    rating: 4.9,
    reviewCount: 189,
    deliveryTime: "25-35 min",
    deliveryFee: "₹2.99",
    distance: "2.1 km",
  },
  {
    id: 3,
    name: "Pizza Napoli",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80",
    cuisine: "Italian",
    rating: 4.7,
    reviewCount: 312,
    deliveryTime: "15-25 min",
    deliveryFee: "Free",
    distance: "0.8 km",
    featured: true,
  },
  {
    id: 4,
    name: "Spice Route",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80",
    cuisine: "Indian",
    rating: 4.6,
    reviewCount: 156,
    deliveryTime: "30-40 min",
    deliveryFee: "₹1.99",
    distance: "3.5 km",
    discount: "15% OFF",
  },
  {
    id: 5,
    name: "Taco Loco",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80",
    cuisine: "Mexican",
    rating: 4.5,
    reviewCount: 98,
    deliveryTime: "20-30 min",
    deliveryFee: "Free",
    distance: "1.8 km",
  },
  {
    id: 6,
    name: "Dragon Wok",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=80",
    cuisine: "Chinese",
    rating: 4.7,
    reviewCount: 203,
    deliveryTime: "25-35 min",
    deliveryFee: "₹2.49",
    distance: "2.4 km",
  },
  {
    id: 7,
    name: "Sweet Tooth Bakery",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
    cuisine: "Desserts",
    rating: 4.9,
    reviewCount: 421,
    deliveryTime: "15-20 min",
    deliveryFee: "Free",
    distance: "0.5 km",
    featured: true,
  },
  {
    id: 8,
    name: "Mediterranean Grill",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    cuisine: "Mediterranean",
    rating: 4.6,
    reviewCount: 167,
    deliveryTime: "25-35 min",
    deliveryFee: "₹1.99",
    distance: "2.9 km",
  },
  {
    id: 9,
    name: "Pho Paradise",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80",
    cuisine: "Vietnamese",
    rating: 4.8,
    reviewCount: 134,
    deliveryTime: "20-30 min",
    deliveryFee: "₹1.49",
    distance: "1.6 km",
  },
  {
    id: 10,
    name: "BBQ Brothers",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80",
    cuisine: "BBQ",
    rating: 4.7,
    reviewCount: 289,
    deliveryTime: "30-45 min",
    deliveryFee: "₹2.99",
    distance: "3.2 km",
    discount: "10% OFF",
  },
  {
    id: 11,
    name: "Green Bowl",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    cuisine: "Healthy",
    rating: 4.6,
    reviewCount: 178,
    deliveryTime: "15-25 min",
    deliveryFee: "Free",
    distance: "1.1 km",
    featured: true,
  },
  {
    id: 12,
    name: "The Breakfast Club",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=80",
    cuisine: "Breakfast",
    rating: 4.8,
    reviewCount: 356,
    deliveryTime: "20-30 min",
    deliveryFee: "₹1.99",
    distance: "0.9 km",
  },
];

const cuisineFilters = [
  "All",
  "American",
  "Japanese",
  "Italian",
  "Indian",
  "Mexican",
  "Chinese",
  "Vietnamese",
  "BBQ",
  "Healthy",
];

const sortOptions = ["Recommended", "Rating", "Delivery Time", "Distance"];

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");

  const filteredRestaurants = allRestaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine =
      selectedCuisine === "All" || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <>
      <Helmet>
        <title>Browse Restaurants | FoodSwift</title>
        <meta
          name="description"
          content="Explore our wide selection of restaurants. Find your favorite cuisines and order food online for fast delivery."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 lg:pt-24">
          {/* Header */}
          <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/30 py-12">
            <div className="container mx-auto px-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
              >
                All Restaurants
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground mb-8"
              >
                {filteredRestaurants.length} restaurants available near you
              </motion.p>

              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search restaurants or cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-12 pl-4 pr-10 bg-card border border-border rounded-xl text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {sortOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  <Button variant="outline" className="h-12 gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Cuisine Filters */}
          <section className="py-6 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {cuisineFilters.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setSelectedCuisine(cuisine)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCuisine === cuisine
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Restaurant Grid */}
          <section className="py-8 lg:py-12">
            <div className="container mx-auto px-4">
              {filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} {...restaurant} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">
                    No restaurants found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Restaurants;
