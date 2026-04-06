import { Star, MapPin, Award, Heart, TrendingUp } from "lucide-react";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import { showErrorAlert, showSuccessAlert } from "../lib/alerts";

interface PhotographerCardProps {
  id: string;
  name: string;
  location: string;
  specialty: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  verified?: boolean;
  onClick?: (id: string) => void;
}

export function PhotographerCard({
  id,
  name,
  location,
  specialty,
  rating,
  reviews,
  price,
  image,
  verified = false,
  onClick,
}: PhotographerCardProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(id);

  const handleFavorite = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!user) {
      await showErrorAlert("Login required", {
        text: "Please login to save favorites.",
      });
      return;
    }

    const didToggle = await toggleFavorite(id, saved);
    if (didToggle) {
      await showSuccessAlert(saved ? "Removed from favorites" : "Added to favorites", {
        toast: true,
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
      <div className="group cursor-pointer overflow-hidden rounded-3xl bg-white border border-[var(--border)] transition-all hover:shadow-2xl hover:shadow-blue-100/50 hover:border-[var(--blue-200)]" onClick={() => onClick?.(id)}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[var(--blue-100)] to-[var(--blue-50)]">
          <ImageWithFallback src={image} alt={name} className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute left-3 top-3 right-3 flex items-start justify-between">
            {verified && (
              <motion.div className="rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 shadow-lg" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[var(--blue-600)]" />
                  <span className="text-xs text-[var(--blue-700)]">Verified Pro</span>
                </div>
              </motion.div>
            )}

            <motion.button className="ml-auto rounded-full bg-white/95 backdrop-blur-sm p-2 shadow-lg hover:bg-white transition-colors" onClick={(event) => void handleFavorite(event)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Heart className={`h-4 w-4 transition-colors ${saved ? "fill-red-500 text-red-500" : "text-[var(--muted-foreground)]"}`} />
            </motion.button>
          </div>

          {rating >= 4.9 && (
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 shadow-lg">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
                <span className="text-xs text-white">Trending</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="mb-3">
            <h3 className="mb-2 text-lg text-[var(--primary)] group-hover:text-[var(--blue-600)] transition-colors">{name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>

          <Badge variant="secondary" className="mb-4 bg-[var(--blue-50)] text-[var(--blue-700)] hover:bg-[var(--blue-100)] border-0">
            {specialty}
          </Badge>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm">{rating}</span>
              </div>
              <span className="text-sm text-[var(--muted-foreground)]">({reviews})</span>
            </div>
            <div className="text-right">
              <div className="text-lg text-[var(--primary)]">{price}</div>
              <div className="text-xs text-[var(--muted-foreground)]">per session</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
