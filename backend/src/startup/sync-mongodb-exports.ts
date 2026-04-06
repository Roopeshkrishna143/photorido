import fs from "node:fs/promises";
import path from "node:path";
import { Types } from "mongoose";
import { BrowseServiceCardModel } from "../models/browse-service-card.model.js";
import { CategoryModel } from "../models/category.model.js";
import { ContactInquiryModel } from "../models/contact-inquiry.model.js";
import { FavoriteModel } from "../models/favorite.model.js";
import { MarketplaceBookingModel } from "../models/booking.model.js";
import { MarketplaceConversationModel } from "../models/conversation.model.js";
import { MarketplaceMessageModel } from "../models/message.model.js";
import { MarketplaceNotificationModel } from "../models/notification.model.js";
import { MarketplacePermissionModel } from "../models/permission.model.js";
import { MarketplaceReviewModel } from "../models/review.model.js";
import { MarketplaceRoleDefinitionModel } from "../models/role-definition.model.js";
import { NewsletterSubscriptionModel } from "../models/newsletter-subscription.model.js";
import { RefreshTokenModel } from "../models/refresh-token.model.js";
import { SubCategoryModel } from "../models/sub-category.model.js";
import { UserSettingsModel } from "../models/user-setting.model.js";
import { UserModel } from "../models/user.model.js";
import { VendorProfileModel } from "../models/vendor-profile.model.js";
import { VendorScheduleModel } from "../models/vendor-schedule.model.js";

type ExportDocument = Record<string, unknown>;

interface ExportSyncTarget {
  fileName: string;
  model: unknown;
}

const DEFAULT_EXPORTS_DIR = "d:\\MongoDB Exports";

const EXPORT_SYNC_TARGETS: ExportSyncTarget[] = [
  { fileName: "photorido.users.json", model: UserModel },
  { fileName: "photorido.marketplacepermissions.json", model: MarketplacePermissionModel },
  { fileName: "photorido.marketplaceroledefinitions.json", model: MarketplaceRoleDefinitionModel },
  { fileName: "photorido.categories.json", model: CategoryModel },
  { fileName: "photorido.browseservicecards.json", model: BrowseServiceCardModel },
  { fileName: "photorido.subcategories.json", model: SubCategoryModel },
  { fileName: "photorido.vendorprofiles.json", model: VendorProfileModel },
  { fileName: "photorido.marketplacebookings.json", model: MarketplaceBookingModel },
  { fileName: "photorido.marketplacereviews.json", model: MarketplaceReviewModel },
  { fileName: "photorido.marketplacenotifications.json", model: MarketplaceNotificationModel },
  { fileName: "photorido.marketplaceconversations.json", model: MarketplaceConversationModel },
  { fileName: "photorido.marketplacemessages.json", model: MarketplaceMessageModel },
  { fileName: "photorido.favorites.json", model: FavoriteModel },
  { fileName: "photorido.usersettings.json", model: UserSettingsModel },
  { fileName: "photorido.vendorschedules.json", model: VendorScheduleModel },
  { fileName: "photorido.contactinquiries.json", model: ContactInquiryModel },
  { fileName: "photorido.newslettersubscriptions.json", model: NewsletterSubscriptionModel },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeExtendedJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeExtendedJson(entry));
  }

  if (!isRecord(value)) {
    return value;
  }

  const keys = Object.keys(value);

  if (keys.length === 1 && typeof value.$oid === "string") {
    return new Types.ObjectId(value.$oid);
  }

  if (keys.length === 1 && "$date" in value) {
    const dateValue = value.$date;

    if (typeof dateValue === "string" || typeof dateValue === "number") {
      return new Date(dateValue);
    }

    if (isRecord(dateValue) && typeof dateValue.$numberLong === "string") {
      return new Date(Number(dateValue.$numberLong));
    }
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, normalizeExtendedJson(entry)]),
  );
}

async function loadExportDocuments(filePath: string) {
  const rawContent = await fs.readFile(filePath, "utf8");
  if (rawContent.trim() === "") {
    return [];
  }

  const parsed = JSON.parse(rawContent) as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((entry) => normalizeExtendedJson(entry))
    .filter((entry): entry is ExportDocument => isRecord(entry));
}

async function syncExportTarget(exportsDir: string, target: ExportSyncTarget) {
  const filePath = path.join(exportsDir, target.fileName);

  try {
    await fs.access(filePath);
  } catch {
    return 0;
  }

  const documents = await loadExportDocuments(filePath);
  if (documents.length === 0) {
    return 0;
  }

  const collection = (target.model as {
    collection: {
      bulkWrite: (operations: unknown[], options?: { ordered?: boolean }) => Promise<unknown>;
    };
  }).collection;

  const operations = documents
    .filter((document): document is ExportDocument & { _id: unknown } => "_id" in document)
    .map((document) => ({
      replaceOne: {
        filter: { _id: document._id },
        replacement: document,
        upsert: true,
      },
    }));

  if (operations.length === 0) {
    return 0;
  }

  await collection.bulkWrite(operations, { ordered: false });

  return documents.length;
}

export async function syncMongoDbExportsOnBoot() {
  const exportsDir = DEFAULT_EXPORTS_DIR;

  try {
    const stats = await fs.stat(exportsDir);
    if (!stats.isDirectory()) {
      return;
    }
  } catch {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.log(`Syncing MongoDB exports from ${exportsDir}...`);

  for (const target of EXPORT_SYNC_TARGETS) {
    const syncedCount = await syncExportTarget(exportsDir, target);
    if (syncedCount > 0) {
      console.log(`Synced ${syncedCount} records from ${target.fileName}`);
    }
  }

  await RefreshTokenModel.deleteMany({});
}
