import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedRestaurants from "@/components/home/FeaturedRestaurants";
import HowItWorks from "@/components/home/HowItWorks";
import AppDownload from "@/components/home/AppDownload";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>FoodSwift - Fast Food Delivery | Order Online</title>
        <meta
          name="description"
          content="Order food online from the best local restaurants. Fast delivery, great prices, and delicious meals delivered to your doorstep in minutes."
        />
        <meta
          name="keywords"
          content="food delivery, online food order, restaurant delivery, fast food, pizza delivery, burger delivery"
        />
        <link rel="canonical" href="https://foodswift.com" />
        
        {/* Open Graph */}
        <meta property="og:title" content="FoodSwift - Fast Food Delivery" />
        <meta
          property="og:description"
          content="Order food online from the best local restaurants. Fast delivery to your doorstep."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://foodswift.com" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FoodSwift - Fast Food Delivery" />
        <meta
          name="twitter:description"
          content="Order food online from the best local restaurants."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <CategoriesSection />
          <FeaturedRestaurants />
          <HowItWorks />
          <AppDownload />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
