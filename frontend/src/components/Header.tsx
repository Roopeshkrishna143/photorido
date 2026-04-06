import { Menu, User, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import logoImage from "figma:asset/1a7396ce0df98b8e9d99c9694dadb671a2b68d89.png";

interface HeaderProps {
  onLogoClick?: () => void;
  showCreateProfileButton?: boolean;
  onCreateProfile?: () => void;
}

export function Header({ onLogoClick, showCreateProfileButton = true, onCreateProfile }: HeaderProps) {
  return (
    <motion.header 
      className="sticky top-0 z-50 w-full glass-strong shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <motion.div 
            className="flex items-center cursor-pointer group"
            onClick={onLogoClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img 
              src={logoImage} 
              alt="photorido" 
              className="h-8 w-auto object-contain transition-all duration-300 group-hover:brightness-75"
            />
          </motion.div>

          <nav className="hidden lg:flex items-center gap-8">
            <motion.a 
              href="#" 
              className="text-[15px] text-[var(--foreground)] hover:text-[var(--blue-600)] transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              Find Professionals
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--blue-600)] group-hover:w-full transition-all duration-300" />
            </motion.a>
            <motion.a 
              href="#" 
              className="text-[15px] text-[var(--foreground)] hover:text-[var(--blue-600)] transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--blue-600)] group-hover:w-full transition-all duration-300" />
            </motion.a>
            <motion.a 
              href="#" 
              className="text-[15px] text-[var(--foreground)] hover:text-[var(--blue-600)] transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              Become a Pro
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--blue-600)] group-hover:w-full transition-all duration-300" />
            </motion.a>
            <motion.a 
              href="#" 
              className="text-[15px] text-[var(--foreground)] hover:text-[var(--blue-600)] transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              Help
              <span className="absolute -bottom-1 left-0 h-0.5 bg-[var(--blue-600)] group-hover:w-full transition-all duration-300" />
            </motion.a>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="hidden xl:flex gap-2 hover:bg-[var(--blue-50)] hover:text-[var(--blue-700)] transition-all"
            >
              List Your Services
            </Button>
            
            {showCreateProfileButton && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={onCreateProfile}
                  className="hidden md:flex gap-2 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] shadow-md hover:shadow-lg transition-all rounded-xl"
                >
                  Create Profile
                </Button>
              </motion.div>
            )}
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-[var(--blue-50)] hover:text-[var(--blue-600)] transition-all relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[var(--blue-600)] rounded-full border-2 border-white" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-2 hover:border-[var(--blue-600)] hover:bg-[var(--blue-50)] hover:text-[var(--blue-600)] transition-all"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="icon" 
                className="rounded-full bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-700)] hover:shadow-lg transition-all"
              >
                <User className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
