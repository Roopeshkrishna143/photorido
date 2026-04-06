import { PhotographerCard } from "./PhotographerCard";
import { Button } from "./ui/button";
import { SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";

interface Photographer {
  id: string;
  name: string;
  location: string;
  specialty: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  verified?: boolean;
}

interface PhotographerGridProps {
  photographers: Photographer[];
  onPhotographerClick?: (id: string) => void;
}

export function PhotographerGrid({ photographers, onPhotographerClick }: PhotographerGridProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-[var(--blue-50)] to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="mb-3 text-3xl sm:text-4xl text-[var(--primary)]">
              Featured Professionals
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              Discover top-rated photographers and creative professionals
            </p>
          </div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="gap-2 rounded-full border-2 hover:border-[var(--blue-500)] hover:bg-[var(--blue-50)] hover:text-[var(--blue-700)] transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photographers.map((photographer, index) => (
            <motion.div
              key={photographer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <PhotographerCard
                {...photographer}
                onClick={onPhotographerClick}
              />
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="lg"
              variant="outline"
              className="rounded-full border-2 px-8 hover:border-[var(--blue-500)] hover:bg-[var(--blue-50)] hover:text-[var(--blue-700)] transition-all"
            >
              Load More Professionals
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
