import { SearchAdvertisementModel } from "../models/search-advertisement.model.js";

const DEFAULT_ADVERTISEMENTS = [
  {
    title: "Professional Wedding Photography",
    subtitle: "Capture Your Special Day",
    description: "Expert wedding photographers with years of experience. From intimate ceremonies to grand celebrations, we make your memories last forever.",
    badgeText: "Premium Service",
    imageUrl: "/uploads/images/1774870708107-541b3beb-7580-4e49-82ea-e357f9ba10e0-portfolio_img_4.jpg",
    ctaText: "Book Now",
    ctaUrl: "/search?service=wedding",
    serviceTags: ["wedding", "photography"],
    locationTags: ["all"],
    sortOrder: 1,
    status: "active" as const,
  },
  {
    title: "Corporate Event Coverage",
    subtitle: "Professional Business Photography",
    description: "Elevate your brand with stunning corporate photography. From headshots to event coverage, we deliver professional results.",
    badgeText: "Business Focused",
    imageUrl: "/uploads/images/1774936465581-a9532e9a-0a3f-40a5-bf1e-c0c7fa78cb79-profile_image_1_test.jpg",
    ctaText: "Learn More",
    ctaUrl: "/search?service=corporate",
    serviceTags: ["corporate", "event", "photography"],
    locationTags: ["all"],
    sortOrder: 2,
    status: "active" as const,
  },
  {
    title: "Portrait Sessions",
    subtitle: "Beautiful Portrait Photography",
    description: "Transform your photos into works of art. Professional portrait sessions for individuals, families, and groups.",
    badgeText: "Artistic",
    imageUrl: "/uploads/images/1774870708107-541b3beb-7580-4e49-82ea-e357f9ba10e0-portfolio_img_4.jpg",
    ctaText: "Schedule Session",
    ctaUrl: "/search?service=portrait",
    serviceTags: ["portrait", "photography"],
    locationTags: ["all"],
    sortOrder: 3,
    status: "active" as const,
  },
];

export async function seedSearchAdvertisements() {
  const superAdmin = await import("../models/user.model.js").then(({ UserModel }) =>
    UserModel.findOne({ role: "super-admin" })
  );

  if (!superAdmin) {
    console.log("Super admin not found, skipping advertisement seeding.");
    return;
  }

  for (const ad of DEFAULT_ADVERTISEMENTS) {
    const existingAd = await SearchAdvertisementModel.findOne({ title: ad.title });
    if (existingAd) {
      continue;
    }

    await SearchAdvertisementModel.create({
      ...ad,
      createdByUserId: superAdmin.id,
      updatedByUserId: superAdmin.id,
    });

    console.log(`Seeded advertisement: ${ad.title}`);
  }
}