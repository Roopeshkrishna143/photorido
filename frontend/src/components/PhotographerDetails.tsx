import { Star, MapPin, Award, Camera, Users, Clock, CheckCircle2, ArrowLeft, Share2, MessageCircle, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";

interface PhotographerDetailsProps {
  photographer: {
    id: string;
    name: string;
    location: string;
    specialty: string;
    rating: number;
    reviews: number;
    price: string;
    image: string;
    verified?: boolean;
    bio?: string;
    experience?: string;
    languages?: string[];
    services?: string[];
    portfolio?: string[];
  };
  onBack?: () => void;
}

const sampleReviews = [
  {
    id: 1,
    author: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    date: "2 weeks ago",
    comment: "Absolutely amazing work! Captured our wedding perfectly. Highly professional and creative."
  },
  {
    id: 2,
    author: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    date: "1 month ago",
    comment: "Great experience working together. Very patient and delivered stunning photos."
  },
  {
    id: 3,
    author: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 4,
    date: "2 months ago",
    comment: "Professional service and beautiful results. Would definitely recommend!"
  }
];

export function PhotographerDetails({ photographer, onBack }: PhotographerDetailsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--blue-50)] to-white">
      {/* Sticky Action Bar */}
      <motion.div 
        className="sticky top-20 z-40 border-b glass-strong"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-4">
            <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                onClick={onBack}
                className="gap-2 hover:bg-[var(--blue-50)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
            </motion.div>
            
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image with Profile Picture Overlay */}
            <motion.div 
              className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ImageWithFallback
                src={photographer.image}
                alt={photographer.name}
                className="h-full w-full object-cover"
              />
              
              {/* Profile Picture Overlay - Bottom Left */}
              <motion.div 
                className="absolute bottom-0 left-0 z-10 translate-x-4 translate-y-1/2 sm:translate-x-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="relative">
                  {/* Enhanced Glow effect */}
                  <div className="absolute inset-0 bg-[var(--blue-500)] blur-2xl opacity-30 rounded-full scale-110"></div>
                  <div className="absolute inset-0 bg-white blur-xl opacity-50 rounded-full scale-105"></div>
                  
                  {/* Profile Picture with enhanced styling */}
                  <Avatar className="relative h-24 w-24 border-4 border-white shadow-2xl ring-2 ring-[var(--blue-200)] sm:h-32 sm:w-32">
                    <AvatarImage 
                      src={photographer.image} 
                      alt={photographer.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-700)] text-white">
                      {photographer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Verified Badge on Profile Picture */}
                  {photographer.verified && (
                    <motion.div 
                      className="absolute -bottom-1 -right-1 rounded-full border-3 border-white bg-[var(--blue-600)] p-1.5 shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <Shield className="h-5 w-5 text-white fill-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Title & Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-14 sm:pt-16"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="mb-3 text-3xl text-[var(--primary)] sm:text-4xl">{photographer.name}</h1>
                  <div className="mb-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="text-base sm:text-lg">{photographer.rating}</span>
                      <span className="text-sm text-[var(--muted-foreground)] sm:text-base">({photographer.reviews} reviews)</span>
                    </div>
                    {photographer.verified && (
                      <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 text-[var(--blue-700)]">
                        <Shield className="h-5 w-5" />
                        <span>Verified Pro</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{photographer.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[var(--blue-600)] hover:bg-[var(--blue-700)] text-white px-4 py-2 text-sm">
                  {photographer.specialty}
                </Badge>
                {photographer.languages?.map((lang) => (
                  <Badge key={lang} variant="outline" className="px-4 py-2 text-sm">
                    {lang}
                  </Badge>
                ))}
              </div>
            </motion.div>

            <Separator />

            {/* Tabs Content */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-8">
                {/* About */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="mb-4 text-2xl text-[var(--primary)]">About Me</h2>
                  <p className="text-[var(--muted-foreground)] leading-relaxed text-lg">
                    {photographer.bio || "Professional photographer with a passion for capturing life's most precious moments. Specializing in weddings, portraits, and events. With years of experience and a keen eye for detail, I strive to create timeless images that tell your unique story."}
                  </p>
                </motion.div>

                {/* Experience Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Camera, label: "Experience", value: photographer.experience || "8+ Years" },
                    { icon: Users, label: "Happy Clients", value: "500+" },
                    { icon: Clock, label: "Response Time", value: "24-48h" }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--blue-100)] bg-gradient-to-br from-white to-[var(--blue-50)] p-6 text-center shadow-sm hover:shadow-lg hover:border-[var(--blue-300)] transition-all">
                        <stat.icon className="mx-auto mb-3 h-10 w-10 text-[var(--blue-600)]" />
                        <div className="mb-1 text-2xl text-[var(--primary)]">{stat.value}</div>
                        <div className="text-sm text-[var(--muted-foreground)]">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Services Offered */}
                <div>
                  <h2 className="mb-6 text-2xl text-[var(--primary)]">Services Offered</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(photographer.services || [
                      "Wedding Photography",
                      "Portrait Sessions",
                      "Event Coverage",
                      "Product Photography",
                      "Photo Editing",
                      "Digital Album Creation"
                    ]).map((service, index) => (
                      <motion.div
                        key={service}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[var(--border)] hover:border-[var(--blue-300)] hover:shadow-md transition-all"
                      >
                        <CheckCircle2 className="h-5 w-5 text-[var(--blue-600)] flex-shrink-0" />
                        <span>{service}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="portfolio">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(photographer.portfolio || [
                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop"
                  ]).map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * idx }}
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                      className="aspect-square overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`Portfolio ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {sampleReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback>{review.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="text-lg">{review.author}</h4>
                          <span className="text-sm text-[var(--muted-foreground)]">{review.date}</span>
                        </div>
                        <div className="mb-3 flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-[var(--muted-foreground)] leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              className="space-y-6 lg:sticky lg:top-36"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Booking Card */}
              <div className="rounded-3xl border-2 border-[var(--blue-200)] bg-white p-6 shadow-xl">
                <div className="mb-6">
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-4xl text-[var(--primary)]">{photographer.price}</span>
                    <span className="text-[var(--muted-foreground)]">/ session</span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">Starting price, varies by package</p>
                </div>

                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full h-12 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] shadow-lg hover:shadow-xl transition-all rounded-xl">
                      Request Booking
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full h-12 gap-2 rounded-xl border-2 hover:border-[var(--blue-500)] hover:bg-[var(--blue-50)]">
                      <MessageCircle className="h-4 w-4" />
                      Send Message
                    </Button>
                  </motion.div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  {[
                    { label: "Response rate", value: "95%" },
                    { label: "Response time", value: "Within 24h" },
                    { label: "Languages", value: photographer.languages?.join(", ") || "English, Spanish" }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted-foreground)]">{item.label}</span>
                      <span className="text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badge */}
              <motion.div
                className="rounded-3xl bg-gradient-to-br from-[var(--blue-50)] to-[var(--blue-100)] p-6 border border-[var(--blue-200)]"
                whileHover={{ scale: 1.02 }}
              >
                <div className="mb-3 flex items-center gap-2 text-[var(--blue-700)]">
                  <Award className="h-6 w-6" />
                  <span className="text-lg">Verified Professional</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  This professional has been verified and has completed background checks.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
