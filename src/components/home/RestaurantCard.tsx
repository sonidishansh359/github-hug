import { motion } from "framer-motion";
import { Star, Clock, Bike, Heart } from "lucide-react";
import { useState } from "react";

interface RestaurantCardProps {
  id: number;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: string;
  distance: string;
  featured?: boolean;
  discount?: string;
}

const RestaurantCard = ({
  id,
  name,
  image,
  cuisine,
  rating,
  reviewCount,
  deliveryTime,
  deliveryFee,
  distance,
  featured,
  discount,
}: RestaurantCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </button>

        {/* Featured Badge */}
        {featured && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
            Featured
          </span>
        )}

        {/* Discount Badge */}
        {discount && (
          <span className="absolute bottom-3 left-3 px-3 py-1 bg-success text-success-foreground text-xs font-semibold rounded-full">
            {discount}
          </span>
        )}

        {/* Delivery Time */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-card/90 backdrop-blur-sm rounded-lg">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{deliveryTime}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 bg-success/10 px-2 py-1 rounded-lg flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-success text-success" />
            <span className="text-sm font-semibold text-success">{rating}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {cuisine} • {reviewCount}+ reviews
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bike className="w-4 h-4" />
            <span>{deliveryFee}</span>
          </div>
          <span>•</span>
          <span>{distance}</span>
        </div>
      </div>
    </motion.article>
  );
};

export default RestaurantCard;
