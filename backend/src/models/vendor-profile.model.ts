import { Schema, model, type HydratedDocument } from "mongoose";

export const VENDOR_PROFILE_STATUSES = ["pending", "approved", "rejected"] as const;
export type VendorProfileStatus = (typeof VENDOR_PROFILE_STATUSES)[number];

export interface VendorProfileAlbum {
  name: string;
  images: string[];
}

export interface VendorProfileYoutubeLink {
  url: string;
  thumb?: string | null;
  videoId?: string | null;
}

export interface VendorProfileImageCrop {
  zoom: number;
  x: number;
  y: number;
}

export interface VendorProfile {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  title: string;
  categoryId: string;
  category: string;
  subCategoryId: string;
  subCategory: string;
  experience: string;
  price: string;
  description: string;
  featuredImage: string;
  featuredImageCrop?: VendorProfileImageCrop | null;
  locationInput: string;
  placeId?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  colony: string;
  area: string;
  pincode: string;
  state: string;
  city: string;
  district: string;
  portfolioImages: string[];
  albums: VendorProfileAlbum[];
  youtubeLinks: VendorProfileYoutubeLink[];
  status: VendorProfileStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type VendorProfileDocument = HydratedDocument<VendorProfile>;

const imageCropSchema = new Schema<VendorProfileImageCrop>(
  {
    zoom: { type: Number, required: true, min: 1, max: 4 },
    x: { type: Number, required: true, min: -100, max: 100 },
    y: { type: Number, required: true, min: -100, max: 100 },
  },
  { _id: false },
);

const albumSchema = new Schema<VendorProfileAlbum>(
  {
    name: { type: String, required: true, trim: true },
    images: [{ type: String, required: true, trim: true }],
  },
  { _id: false },
);

const youtubeLinkSchema = new Schema<VendorProfileYoutubeLink>(
  {
    url: { type: String, required: true, trim: true },
    thumb: { type: String, trim: true, default: null },
    videoId: { type: String, trim: true, default: null },
  },
  { _id: false },
);

const vendorProfileSchema = new Schema<VendorProfile>(
  {
    vendorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    vendorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategoryId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    featuredImage: {
      type: String,
      required: true,
      trim: true,
    },
    featuredImageCrop: {
      type: imageCropSchema,
      default: null,
    },
    locationInput: {
      type: String,
      required: true,
      trim: true,
    },
    placeId: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    colony: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    portfolioImages: [{ type: String, required: true, trim: true }],
    albums: {
      type: [albumSchema],
      default: [],
    },
    youtubeLinks: {
      type: [youtubeLinkSchema],
      default: [],
    },
    status: {
      type: String,
      enum: VENDOR_PROFILE_STATUSES,
      default: "pending",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

vendorProfileSchema.index({ vendorId: 1, createdAt: -1 });

export const VendorProfileModel = model<VendorProfile>("VendorProfile", vendorProfileSchema);
