import { useMemo } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Megaphone, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { PhotographerSummary } from "../hooks/usePhotographers";
import { useSearchAdvertisements } from "../hooks/useSearchAdvertisements";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface SearchAdvertisementsProps {
  photographers: PhotographerSummary[];
  service?: string;
  location?: string;
}

interface DisplayAdvertisement {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badgeText: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  sponsored: boolean;
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function SearchAdvertisements({ photographers, service, location }: SearchAdvertisementsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { advertisements, isLoading } = useSearchAdvertisements({
    service,
    location,
    limit: 4,
  });

  const fallbackAdvertisements = useMemo<DisplayAdvertisement[]>(
    () =>
      photographers.slice(0, 3).map((photographer) => ({
        id: photographer.id,
        title: photographer.name,
        subtitle: photographer.specialty,
        description: `${photographer.rating.toFixed(1)} rating from ${photographer.reviews} reviews. Starting at ${photographer.price}.`,
        badgeText: "Featured Professional",
        imageUrl: photographer.image,
        ctaText: "View Profile",
        ctaUrl: `/photographer/${photographer.id}`,
        sponsored: false,
      })),
    [photographers],
  );

  const dynamicAdvertisements = useMemo<DisplayAdvertisement[]>(
    () =>
      advertisements.map((advertisement) => ({
        ...advertisement,
        sponsored: true,
      })),
    [advertisements],
  );

  const displayAdvertisements = dynamicAdvertisements.length > 0 ? dynamicAdvertisements : fallbackAdvertisements;

  const openAdvertisement = (advertisement: DisplayAdvertisement) => {
    if (isExternalUrl(advertisement.ctaUrl)) {
      window.open(advertisement.ctaUrl, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(advertisement.ctaUrl);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Sponsored</p>
          </div>
          {user?.role === "super-admin" && (
            <button
              type="button"
              onClick={() => navigate("/dashboard?tab=advertisements")}
              className="text-[11px] font-semibold text-blue-700 transition-colors hover:text-blue-900"
            >
              Manage Ads
            </button>
          )}
        </div>
        <p className="mt-1 text-sm font-semibold text-blue-900">
          {dynamicAdvertisements.length > 0 ? "Recommended Offers" : "Featured Professionals"}
        </p>
      </div>

      {isLoading && displayAdvertisements.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-[18px] border border-slate-200 bg-white" />
          ))}
        </div>
      ) : (
        displayAdvertisements.map((advertisement) => (
          <Card
            key={advertisement.id}
            className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
          >
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="relative h-28 overflow-hidden rounded-[14px] bg-slate-100">
                  <ImageWithFallback
                    src={advertisement.imageUrl}
                    alt={advertisement.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    {advertisement.sponsored ? (
                      <Megaphone className="h-3 w-3" />
                    ) : (
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    )}
                    {advertisement.badgeText || (advertisement.sponsored ? "Sponsored" : "Featured")}
                  </div>
                </div>

                <div>
                  <h3 className="line-clamp-1 text-sm font-bold text-slate-900">{advertisement.title}</h3>
                  <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-500">{advertisement.subtitle}</p>
                </div>

                <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">{advertisement.description}</p>

                <Button
                  type="button"
                  onClick={() => openAdvertisement(advertisement)}
                  className="w-full rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  {advertisement.ctaText}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs text-slate-600">
          {dynamicAdvertisements.length > 0
            ? "Campaign placements are managed by super-admin."
            : "No active ad campaigns. Showing top professionals instead."}
        </p>
      </div>
    </div>
  );
}
