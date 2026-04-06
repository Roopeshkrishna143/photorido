import {
  BookOpen,
  Camera,
  Clapperboard,
  Film,
  Frame,
  ImageIcon,
  Palette,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface ServiceCategoryVisual {
  icon: LucideIcon;
  gradient: string;
  softBackground: string;
  iconColor: string;
  description: string;
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

export function getServiceCategoryVisual(name: string): ServiceCategoryVisual {
  const normalizedName = name.toLowerCase();

  if (includesAny(normalizedName, ["video", "cinema", "film"])) {
    return {
      icon: normalizedName.includes("film") ? Film : Video,
      gradient: "from-cyan-500 to-blue-600",
      softBackground: "bg-cyan-50",
      iconColor: "text-cyan-700",
      description: "Live listings for editing, cinematic films, reels, and motion storytelling.",
    };
  }

  if (includesAny(normalizedName, ["album", "book"])) {
    return {
      icon: BookOpen,
      gradient: "from-pink-500 to-rose-600",
      softBackground: "bg-pink-50",
      iconColor: "text-pink-700",
      description: "Explore specialists for album layouts, storybooks, and print-ready design work.",
    };
  }

  if (includesAny(normalizedName, ["frame"])) {
    return {
      icon: Frame,
      gradient: "from-amber-500 to-orange-600",
      softBackground: "bg-amber-50",
      iconColor: "text-amber-700",
      description: "Discover professionals offering premium framing and finishing services.",
    };
  }

  if (includesAny(normalizedName, ["graphic", "design", "branding"])) {
    return {
      icon: Palette,
      gradient: "from-violet-500 to-fuchsia-600",
      softBackground: "bg-violet-50",
      iconColor: "text-violet-700",
      description: "Browse designers for branding, creatives, invitations, and digital assets.",
    };
  }

  if (includesAny(normalizedName, ["reel", "shorts", "social"])) {
    return {
      icon: Clapperboard,
      gradient: "from-orange-500 to-red-600",
      softBackground: "bg-orange-50",
      iconColor: "text-orange-700",
      description: "Find creators focused on fast-moving reels, shorts, and social-first edits.",
    };
  }

  if (includesAny(normalizedName, ["photo", "photography", "photographer", "portrait", "wedding"])) {
    return {
      icon: Camera,
      gradient: "from-blue-500 to-indigo-600",
      softBackground: "bg-blue-50",
      iconColor: "text-blue-700",
      description: "Connect with photographers across weddings, portraits, events, and commercial shoots.",
    };
  }

  if (includesAny(normalizedName, ["editing", "retouch", "post"])) {
    return {
      icon: ImageIcon,
      gradient: "from-emerald-500 to-teal-600",
      softBackground: "bg-emerald-50",
      iconColor: "text-emerald-700",
      description: "Search post-production experts for retouching, edits, and polished deliverables.",
    };
  }

  return {
    icon: Sparkles,
    gradient: "from-slate-500 to-slate-700",
    softBackground: "bg-slate-50",
    iconColor: "text-slate-700",
    description: "Browse the latest active marketplace listings in this creative service category.",
  };
}
