import { BrowseServiceCardModel } from "../models/browse-service-card.model.js";

const DEFAULT_BROWSE_SERVICE_CARDS = [
  {
    name: "Photographers",
    description: "Professional photography services",
    badgeText: "12.5K+ pros",
    sortOrder: 1,
  },
  {
    name: "Video Editors",
    description: "Expert video editing",
    badgeText: "8.3K+ pros",
    sortOrder: 2,
  },
  {
    name: "Album Designers",
    description: "Beautiful album designs",
    badgeText: "5.2K+ pros",
    sortOrder: 3,
  },
  {
    name: "Reel Makers",
    description: "Creative reel production",
    badgeText: "6.7K+ pros",
    sortOrder: 4,
  },
  {
    name: "Photo Frames",
    description: "Custom framing services",
    badgeText: "3.1K+ pros",
    sortOrder: 5,
  },
  {
    name: "Graphic Design",
    description: "Creative visual design",
    badgeText: "9.4K+ pros",
    sortOrder: 6,
  },
] as const;

export async function seedBrowseServices() {
  const existingCount = await BrowseServiceCardModel.countDocuments();
  if (existingCount > 0) {
    return;
  }

  await BrowseServiceCardModel.insertMany(
    DEFAULT_BROWSE_SERVICE_CARDS.map((card) => ({
      ...card,
      status: "active" as const,
      createdByUserId: "system-seed",
    })),
  );
}
