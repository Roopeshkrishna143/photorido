import { ChevronLeft, MoreVertical } from "lucide-react";
import { motion } from "motion/react";

interface MobileNavBarProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function MobileNavBar({ title, onBack, rightAction, transparent = false }: MobileNavBarProps) {
  return (
    <div
      className={`sticky top-0 z-20 ${
        transparent ? "bg-transparent" : "bg-white/95 backdrop-blur-xl border-b border-gray-200"
      }`}
    >
      <div className="h-11" /> {/* Status bar spacer */}
      <div className="flex items-center justify-between px-4 h-11">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-blue-600 font-medium -ml-2 px-2 py-1 rounded-lg active:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-base">Back</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        <h1 className="font-semibold text-base text-center flex-1 truncate px-2">
          {title}
        </h1>

        {rightAction || <div className="w-16" />}
      </div>
    </div>
  );
}
