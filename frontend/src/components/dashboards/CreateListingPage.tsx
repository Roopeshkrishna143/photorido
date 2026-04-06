import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Upload, X, MapPin, Plus, Youtube,
  ChevronRight, ChevronLeft, Check, Image as ImageIcon,
  FolderOpen, Link2, Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { type MarketplaceListing, useMarketplace } from "../../context/MarketplaceContext";
import { api, unwrapPayload } from "../../lib/api";
import { showErrorAlert, showSuccessAlert } from "../../lib/alerts";
import { uploadImageFile } from "../../lib/uploads";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = string;

interface UploadedImage {
  id: string;
  file?: File | null;
  url: string;
  dataUrl: string;
}

interface CropState {
  zoom: number;
  x: number;
  y: number;
}

interface Album {
  id: string;
  name: string;
  images: UploadedImage[];
}

interface LocationResolution {
  placeId?: string;
  lat: number;
  lng: number;
  address: string;
  colony: string;
  area: string;
  pincode: string;
  state: string;
  city: string;
  district: string;
  mapPreviewUrl?: string;
  message?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error(`Unable to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Location Details" },
  { id: 3, label: "Media Details" },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done    = current > step.id;
        const active  = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* circle */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 transition-all duration-300
              ${done   ? "bg-blue-600 border-blue-600 text-white"
              : active ? "bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-100"
                       : "bg-white border-gray-200 text-gray-400"}`}>
              {done ? <Check className="w-4 h-4" /> : step.id}
            </div>
            {/* label */}
            <span className={`ml-2 text-sm font-medium whitespace-nowrap ${active ? "text-blue-700" : done ? "text-blue-500" : "text-gray-400"}`}>
              {step.label}
            </span>
            {/* connector */}
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded transition-colors duration-300 ${done ? "bg-blue-500" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Rich text editor stub ────────────────────────────────────────────────────

function DescriptionEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [bold,   setBold]   = useState(false);
  const [italic, setItalic] = useState(false);
  const [ul,     setUl]     = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        {[
          { label: "B",  title: "Bold",        active: bold,   toggle: () => setBold(b => !b),   cls: "font-bold" },
          { label: "I",  title: "Italic",       active: italic, toggle: () => setItalic(i => !i), cls: "italic" },
          { label: "•—", title: "Bullet list",  active: ul,     toggle: () => setUl(u => !u),     cls: "" },
        ].map(t => (
          <button key={t.title} title={t.title} onClick={t.toggle}
            className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors
              ${t.active ? "bg-blue-600 text-white" : "hover:bg-gray-200 text-gray-600"} ${t.cls}`}>
            {t.label}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {["H1","H2","H3"].map(h => (
          <button key={h} className="w-7 h-7 flex items-center justify-center rounded-md text-[10px] font-bold hover:bg-gray-200 text-gray-600 transition-colors">
            {h}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button className="h-7 px-2 flex items-center justify-center rounded-md text-xs hover:bg-gray-200 text-gray-600 transition-colors">
          <Link2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write a detailed description of your listing — services offered, your style, experience highlights, what clients can expect..."
        rows={6}
        className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none resize-y bg-white"
      />
    </div>
  );
}

// ─── Google Maps embed stub ───────────────────────────────────────────────────

function MapEmbed({ lat, lng }: { lat: string; lng: string }) {
  const hasCoords = lat && lng;
  return (
    <div className="w-full h-56 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 relative">
      {hasCoords ? (
        <iframe
          title="location-map"
          className="w-full h-full"
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
          <MapPin className="w-8 h-8 text-gray-300" />
          <p className="text-sm">Enter coordinates or a Google Maps URL and click Locate</p>
        </div>
      )}
    </div>
  );
}

function getLocationMessageTone(message: string) {
  if (message.includes("GOOGLE_MAPS_API_KEY") || message.includes("Coordinates were parsed")) {
    return "info";
  }

  return "error";
}

function getLocationMessageText(message: string) {
  if (message.includes("GOOGLE_MAPS_API_KEY") || message.includes("Coordinates were parsed")) {
    return "Coordinates were parsed successfully. Please complete the address fields manually.";
  }

  return message;
}

// ─── Image drop zone ──────────────────────────────────────────────────────────

function ImageDropZone({
  label, multiple = true, onFiles,
}: { label: string; multiple?: boolean; onFiles: (files: File[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    onFiles(Array.from(files));
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
      className={`border-2 border-dashed rounded-2xl px-6 py-8 flex flex-col items-center gap-3 cursor-pointer transition-all
        ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Upload className="w-6 h-6 text-blue-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">Click or drag & drop · PNG, JPG, WEBP</p>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} className="hidden"
        onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}

// ─── Preview grid with delete ─────────────────────────────────────────────────

function ImagePreviewGrid({
  images, onRemove,
}: { images: { id: string; url: string; name?: string }[]; onRemove: (id: string) => void }) {
  if (images.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
      {images.map(img => (
        <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-100 bg-gray-50 shadow-sm">
          <img src={img.url} alt={img.name ?? "preview"} className="w-full h-full object-cover" />
          <button
            onClick={() => onRemove(img.id)}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function FeaturedImageEditor({
  image,
  crop,
  onChangeCrop,
  onRemove,
}: {
  image: UploadedImage | null;
  crop: CropState;
  onChangeCrop: (crop: CropState) => void;
  onRemove: () => void;
}) {
  const dragStateRef = useRef<{ startX: number; startY: number; cropX: number; cropY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragStateRef.current) {
        return;
      }

      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;

      onChangeCrop({
        ...crop,
        x: clamp(dragStateRef.current.cropX + deltaX / 2, -100, 100),
        y: clamp(dragStateRef.current.cropY + deltaY / 2, -100, 100),
      });
    };

    const stopDragging = () => {
      dragStateRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [crop, isDragging, onChangeCrop]);

  if (!image) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex flex-col items-center gap-3">
          <div
            onPointerDown={(event) => {
              dragStateRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                cropX: crop.x,
                cropY: crop.y,
              };
              setIsDragging(true);
            }}
            className="relative h-56 w-56 cursor-grab overflow-hidden rounded-full border-4 border-white shadow-xl active:cursor-grabbing"
          >
            <img
              src={image.url}
              alt="featured"
              className="h-full w-full object-cover select-none"
              draggable={false}
              style={{
                transform: `scale(${crop.zoom})`,
                objectPosition: `${50 + crop.x / 2}% ${50 + crop.y / 2}%`,
              }}
            />
          </div>
          <p className="text-center text-xs text-gray-500">
            Drag inside the circle to choose the visible area.
          </p>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Circular Featured Image</p>
              <p className="text-xs text-gray-500">Adjust zoom and position before creating the profile.</p>
            </div>
            <Button type="button" variant="outline" onClick={onRemove} className="rounded-xl text-red-600">
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Zoom</Label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={crop.zoom}
              onChange={(event) => onChangeCrop({ ...crop, zoom: Number(event.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Horizontal</Label>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={crop.x}
                onChange={(event) => onChangeCrop({ ...crop, x: Number(event.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Vertical</Label>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={crop.y}
                onChange={(event) => onChangeCrop({ ...crop, y: Number(event.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
            Featured image crop is saved with the profile, and the preview is kept circular while editing.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Personal Details ─────────────────────────────────────────────────

function Step1({
  data, setData, categories, subCategories, isCategoriesLoading,
}: {
  data: any;
  setData: (fn: (prev: any) => any) => void;
  categories: Array<{ id: string; name: string; status?: string }>;
  subCategories: Array<{ id: string; categoryId: string; name: string; status?: string }>;
  isCategoriesLoading: boolean;
}) {
  const matchingSubCategories = subCategories.filter(
    (subCategory) => subCategory.categoryId === data.categoryId && subCategory.status === "active",
  );

  const handleFeaturedImage = async (files: File[]) => {
    if (!files[0]) return;
    const dataUrl = await readFileAsDataUrl(files[0]);
    setData((prev: any) => ({
      ...prev,
      featuredImage: { file: files[0], url: dataUrl, dataUrl },
      featuredImageCrop: prev.featuredImageCrop ?? { zoom: 1.2, x: 0, y: 0 },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700">
          Featured Image <span className="text-red-500">*</span>
        </Label>
        <ImageDropZone label="Choose Featured Image" multiple={false} onFiles={handleFeaturedImage} />
        <FeaturedImageEditor
          image={data.featuredImage}
          crop={data.featuredImageCrop}
          onChangeCrop={(nextCrop) => setData((prev: any) => ({ ...prev, featuredImageCrop: nextCrop }))}
          onRemove={() =>
            setData((prev: any) => ({
              ...prev,
              featuredImage: null,
              featuredImageCrop: { zoom: 1.2, x: 0, y: 0 },
            }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="listing-name" className="text-sm font-semibold text-gray-700">Profile Title <span className="text-red-500">*</span></Label>
          <Input id="listing-name" placeholder="e.g. Premium Wedding Photography"
            value={data.name}
            onChange={e => setData((prev: any) => ({ ...prev, name: e.target.value }))}
            className="rounded-xl border-gray-200 focus:border-blue-400" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-sm font-semibold text-gray-700">Experience <span className="text-red-500">*</span></Label>
          <Input id="experience" placeholder="e.g. 8 Years"
            value={data.experience}
            onChange={e => setData((prev: any) => ({ ...prev, experience: e.target.value }))}
            className="rounded-xl border-gray-200 focus:border-blue-400" />
        </div>
      </div>

      {/* Price + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Price (per day) <span className="text-red-500">*</span></Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₹</span>
            <Input id="price" placeholder="e.g. 35,000"
              value={data.price}
              onChange={e => setData((prev: any) => ({ ...prev, price: e.target.value }))}
              className="pl-10 rounded-xl border-gray-200 focus:border-blue-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category <span className="text-red-500">*</span></Label>
          <select
            id="category"
            value={data.categoryId}
            onChange={e => setData((prev: any) => ({
              ...prev,
              categoryId: e.target.value as Category,
              subCategoryId: "",
            }))}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {isCategoriesLoading && (
            <p className="text-xs text-gray-400">Loading categories from the backend...</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sub-category" className="text-sm font-semibold text-gray-700">Sub-Category <span className="text-red-500">*</span></Label>
        <select
          id="sub-category"
          value={data.subCategoryId}
          onChange={e => setData((prev: any) => ({ ...prev, subCategoryId: e.target.value }))}
          disabled={!data.categoryId}
          className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">{data.categoryId ? "Select a sub-category" : "Select a category first"}</option>
          {matchingSubCategories.map((subCategory) => (
            <option key={subCategory.id} value={subCategory.id}>
              {subCategory.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></Label>
        <DescriptionEditor
          value={data.description}
          onChange={v => setData((prev: any) => ({ ...prev, description: v }))}
        />
      </div>
    </div>
  );
}

// ─── Step 2: Location Details ─────────────────────────────────────────────────

function Step2({
  data, setData,
}: {
  data: any;
  setData: (fn: (prev: any) => any) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleLocate = async () => {
    setLocating(true);
    setLocationError("");

    try {
      const payload = await api.post("/marketplace/location/resolve", {
        input: data.locationInput.trim(),
      });
      const location = unwrapPayload<LocationResolution>(payload);

      setData((prev: any) => ({
        ...prev,
        placeId: location.placeId ?? "",
        lat: String(location.lat ?? ""),
        lng: String(location.lng ?? ""),
        address: location.address ?? "",
        colony: location.colony ?? "",
        area: location.area ?? "",
        pincode: location.pincode ?? "",
        state: location.state ?? "",
        city: location.city ?? "",
        district: location.district ?? location.city ?? "",
      }));

      if (location.message) {
        setLocationError(location.message);
      }
    } catch (error) {
      setData((prev: any) => ({ ...prev, lat: "", lng: "" }));
      setLocationError(error instanceof Error ? error.message : "Unable to resolve location.");
    } finally {
      setLocating(false);
    }
  };

  const field = (id: string, label: string, key: string, placeholder: string, colSpan = 1) => (
    <div className={`space-y-2 ${colSpan === 2 ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={id} className="text-sm font-semibold text-gray-700">{label}</Label>
      <Input id={id} placeholder={placeholder}
        value={data[key]}
        onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))}
        className="rounded-xl border-gray-200 focus:border-blue-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Map */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">Map Preview</Label>
        <MapEmbed lat={data.lat} lng={data.lng} />
      </div>

      {/* Location input + Locate button */}
      <div className="space-y-2">
        <Label htmlFor="loc-input" className="text-sm font-semibold text-gray-700">
          Location <span className="text-gray-400 font-normal text-xs">(Lat/Lng · Place ID · Google URL)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="loc-input"
            placeholder="17.3850, 78.4867 or paste a Google Maps URL or Place ID"
            value={data.locationInput}
            onChange={e => setData((prev: any) => ({ ...prev, locationInput: e.target.value }))}
            className="rounded-xl border-gray-200 focus:border-blue-400 flex-1"
          />
          <Button onClick={handleLocate} disabled={locating || !data.locationInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl flex-shrink-0">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MapPin className="w-4 h-4 mr-1.5" />Locate</>}
          </Button>
        </div>
        {data.lat && data.lng && (
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Located at {data.lat}, {data.lng}
          </p>
        )}
        {locationError && (
          <p className={`text-xs ${getLocationMessageTone(locationError) === "info" ? "text-amber-600" : "text-red-600"}`}>
            {getLocationMessageText(locationError)}
          </p>
        )}
      </div>

      {/* Address fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("address",  "Address",         "address",  "Full address",         2)}
        {field("colony",   "Colony / Street",  "colony",   "Colony or street name")}
        {field("area",     "Area / Locality",  "area",     "Area or locality")}
        {field("pincode",  "Pincode",          "pincode",  "6-digit pincode")}
        {field("state",    "State",            "state",    "State")}
        {field("city",     "City",             "city",     "City")}
        {field("district", "District",         "district", "District")}
      </div>
    </div>
  );
}

// ─── Step 3: Media Details ────────────────────────────────────────────────────

function Step3({
  data, setData,
}: {
  data: any;
  setData: (fn: (prev: any) => any) => void;
}) {
  // ── Portfolio images ──
  const addPortfolioImages = async (files: File[]) => {
    const newImgs = await Promise.all(
      files.map(async (file) => {
        const dataUrl = await readFileAsDataUrl(file);
        return { id: `pi-${Date.now()}-${Math.random()}`, file, url: dataUrl, dataUrl };
      }),
    );
    setData((prev: any) => ({ ...prev, portfolioImages: [...prev.portfolioImages, ...newImgs] }));
  };
  const removePortfolioImage = (id: string) => {
    setData((prev: any) => ({ ...prev, portfolioImages: prev.portfolioImages.filter((i: any) => i.id !== id) }));
  };

  // ── Albums ──
  const addAlbum = () => {
    const album: Album = { id: `al-${Date.now()}`, name: "", images: [] };
    setData((prev: any) => ({ ...prev, albums: [...prev.albums, album] }));
  };
  const removeAlbum = (id: string) => {
    setData((prev: any) => ({ ...prev, albums: prev.albums.filter((a: Album) => a.id !== id) }));
  };
  const updateAlbumName = (id: string, name: string) => {
    setData((prev: any) => ({ ...prev, albums: prev.albums.map((a: Album) => a.id === id ? { ...a, name } : a) }));
  };
  const addAlbumImages = async (albumId: string, files: File[]) => {
    const newImgs = await Promise.all(
      files.map(async (file) => {
        const dataUrl = await readFileAsDataUrl(file);
        return { id: `ai-${Date.now()}-${Math.random()}`, file, url: dataUrl, dataUrl };
      }),
    );
    setData((prev: any) => ({
      ...prev,
      albums: prev.albums.map((a: Album) =>
        a.id === albumId ? { ...a, images: [...a.images, ...newImgs] } : a
      ),
    }));
  };
  const removeAlbumImage = (albumId: string, imgId: string) => {
    setData((prev: any) => ({
      ...prev,
      albums: prev.albums.map((a: Album) =>
        a.id === albumId ? { ...a, images: a.images.filter(i => i.id !== imgId) } : a
      ),
    }));
  };

  // ── YouTube links ──
  const [ytInput, setYtInput] = useState("");
  const addYoutubeLink = () => {
    const url = ytInput.trim();
    if (!url) return;
    const id = `yt-${Date.now()}`;
    // Extract video ID from URL
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    const videoId = match ? match[1] : null;
    const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    setData((prev: any) => ({ ...prev, youtubeLinks: [...prev.youtubeLinks, { id, url, thumb, videoId }] }));
    setYtInput("");
  };
  const removeYoutubeLink = (id: string) => {
    setData((prev: any) => ({ ...prev, youtubeLinks: prev.youtubeLinks.filter((l: any) => l.id !== id) }));
  };

  return (
    <div className="space-y-8">

      {/* ── Portfolio Images ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Portfolio Images</h3>
            <p className="text-xs text-gray-400">Showcase your best work — upload multiple images</p>
          </div>
        </div>
        <ImageDropZone label="Choose Portfolio Images" multiple onFiles={addPortfolioImages} />
        <ImagePreviewGrid
          images={data.portfolioImages}
          onRemove={removePortfolioImage}
        />
      </section>

      {/* ── Albums ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Albums</h3>
              <p className="text-xs text-gray-400">Group your work into named albums</p>
            </div>
          </div>
          <Button onClick={addAlbum} variant="outline"
            className="text-xs h-8 border-violet-200 text-violet-600 hover:bg-violet-50 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Album
          </Button>
        </div>

        {data.albums.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl py-8 flex flex-col items-center gap-2 text-gray-400">
            <FolderOpen className="w-8 h-8 text-gray-300" />
            <p className="text-sm">No albums yet — click "Add Album" to create one</p>
          </div>
        )}

        <div className="space-y-4">
          {data.albums.map((album: Album) => (
            <div key={album.id} className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* Album header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <FolderOpen className="w-4 h-4 text-violet-500 flex-shrink-0" />
                <input
                  type="text"
                  value={album.name}
                  onChange={e => updateAlbumName(album.id, e.target.value)}
                  placeholder="Album name (e.g. Wedding Highlights)"
                  className="flex-1 text-sm font-semibold text-gray-800 bg-transparent outline-none placeholder-gray-400"
                />
                <button onClick={() => removeAlbum(album.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Album body */}
              <div className="p-4 space-y-3">
                <ImageDropZone label="Add images to this album" multiple onFiles={f => addAlbumImages(album.id, f)} />
                <ImagePreviewGrid
                  images={album.images}
                  onRemove={imgId => removeAlbumImage(album.id, imgId)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── YouTube Links ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <Youtube className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">YouTube Links</h3>
            <p className="text-xs text-gray-400">Add video links to show your videography work</p>
          </div>
        </div>

        {/* Input row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={ytInput}
              onChange={e => setYtInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addYoutubeLink(); }}}
              placeholder="Paste YouTube video URL..."
              className="pl-9 rounded-xl border-gray-200 focus:border-red-300"
            />
          </div>
          <Button onClick={addYoutubeLink} disabled={!ytInput.trim()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-xl flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Previews */}
        {data.youtubeLinks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {data.youtubeLinks.map((link: any) => (
              <div key={link.id} className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm group">
                {link.thumb ? (
                  <div className="relative">
                    <img src={link.thumb} alt="yt-thumb" className="w-full aspect-video object-cover" />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                        <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[14px] border-transparent border-l-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-100">
                    <Youtube className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500 truncate">{link.url}</p>
                </div>
                <button
                  onClick={() => removeYoutubeLink(link.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Main CreateListingPage ───────────────────────────────────────────────────

interface CreateListingPageProps {
  onBack: () => void;
  onSubmit?: (data: any) => void;
  existingListing?: MarketplaceListing | null;
}

const initialData = {
  // Step 1
  featuredImage: null as UploadedImage | null,
  featuredImageCrop: { zoom: 1.2, x: 0, y: 0 } as CropState,
  name: "", experience: "", price: "", categoryId: "" as Category | "", subCategoryId: "",
  description: "",
  // Step 2
  locationInput: "", lat: "", lng: "",
  placeId: "", address: "", colony: "", area: "", pincode: "", state: "", city: "", district: "",
  // Step 3
  portfolioImages: [] as UploadedImage[],
  albums: [] as Album[],
  youtubeLinks: [] as { id: string; url: string; thumb: string | null; videoId: string | null }[],
};

function toUploadedImage(url: string, prefix: string): UploadedImage {
  return {
    id: `${prefix}-${Math.random().toString(36).slice(2, 10)}`,
    file: null,
    url,
    dataUrl: url,
  };
}

function createListingFormData(existingListing?: MarketplaceListing | null) {
  if (!existingListing) {
    return {
      ...initialData,
      featuredImageCrop: { ...initialData.featuredImageCrop },
      portfolioImages: [],
      albums: [],
      youtubeLinks: [],
    };
  }

  return {
    featuredImage: existingListing.image ? toUploadedImage(existingListing.image, "featured") : null,
    featuredImageCrop: existingListing.featuredImageCrop ?? { zoom: 1.2, x: 0, y: 0 },
    name: existingListing.title ?? "",
    experience: existingListing.experience ?? "",
    price: (existingListing.price ?? "").replace(/[^\d,]/g, ""),
    categoryId: existingListing.categoryId ?? "",
    subCategoryId: existingListing.subCategoryId ?? "",
    description: existingListing.description ?? "",
    locationInput: existingListing.locationInput ?? "",
    lat: existingListing.coordinates?.lat ? String(existingListing.coordinates.lat) : "",
    lng: existingListing.coordinates?.lng ? String(existingListing.coordinates.lng) : "",
    placeId: existingListing.placeId ?? "",
    address: existingListing.address ?? "",
    colony: existingListing.colony ?? "",
    area: existingListing.area ?? "",
    pincode: existingListing.pincode ?? "",
    state: existingListing.state ?? "",
    city: existingListing.city ?? "",
    district: existingListing.district ?? "",
    portfolioImages: (existingListing.portfolio ?? []).map((image, index) => toUploadedImage(image, `portfolio-${index}`)),
    albums: (existingListing.albums ?? []).map((album, index) => ({
      id: `album-${index}-${Math.random().toString(36).slice(2, 10)}`,
      name: album.name,
      images: album.images.map((image, imageIndex) => toUploadedImage(image, `album-${index}-${imageIndex}`)),
    })),
    youtubeLinks: (existingListing.youtubeLinks ?? []).map((link, index) => ({
      id: `youtube-${index}-${Math.random().toString(36).slice(2, 10)}`,
      url: link.url,
      thumb: link.thumb ?? null,
      videoId: link.videoId ?? null,
    })),
  };
}

export function CreateListingPage({ onBack, onSubmit, existingListing = null }: CreateListingPageProps) {
  const {
    categories,
    subCategories,
    createListing,
    updateListing,
    isLoading: isMarketplaceLoading,
    isMutating,
  } = useMarketplace();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(() => createListingFormData(existingListing));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const activeCategories = categories.filter((category) => category.status === "active");
  const selectedCategory = activeCategories.find((category) => category.id === data.categoryId);
  const matchingSubCategories = selectedCategory
    ? subCategories.filter(
        (subCategory) => subCategory.categoryId === selectedCategory.id && subCategory.status === "active",
      )
    : [];
  const selectedSubCategory = matchingSubCategories.find((subCategory) => subCategory.id === data.subCategoryId);
  const isEditing = Boolean(existingListing);

  useEffect(() => {
    setData(createListingFormData(existingListing));
    setStep(1);
    setSubmitted(false);
    setFormError("");
  }, [existingListing?.id]);

  const validateStep = (stepNumber: number) => {
    if (stepNumber === 1) {
      if (!data.featuredImage) return "Featured image is required.";
      if (!data.name.trim()) return "Profile title is required.";
      if (!data.experience.trim()) return "Experience is required.";
      if (!data.price.trim()) return "Price is required.";
      if (!data.categoryId) return "Category is required.";
      if (!data.subCategoryId) return "Sub-category is required.";
      if (!data.description.trim()) return "Description is required.";
      return "";
    }

    if (stepNumber === 2) {
      if (!data.locationInput.trim()) return "Location input is required.";
      if (!data.lat || !data.lng) return "Please locate the profile address before continuing.";
      if (!data.address.trim()) return "Address is required.";
      if (!data.colony.trim()) return "Colony or street is required.";
      if (!data.area.trim()) return "Area is required.";
      if (!data.pincode.trim()) return "Pincode is required.";
      if (!data.state.trim()) return "State is required.";
      if (!data.city.trim()) return "City is required.";
      if (!data.district.trim()) return "District is required.";
      return "";
    }

    if (stepNumber === 3) {
      if (data.portfolioImages.length === 0) return "At least one portfolio image is required.";
      return "";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateStep(1) || validateStep(2) || validateStep(3);
    if (validationError) {
      setFormError(validationError);
      await showErrorAlert(isEditing ? "Profile update failed" : "Profile creation failed", { text: validationError });
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      title: data.name.trim(),
      categoryId: selectedCategory?.id ?? "",
      subCategoryId: selectedSubCategory?.id ?? "",
      experience: data.experience.trim(),
      price: data.price ? `Rs. ${data.price.replace(/[^0-9,]/g, "")}` : "",
      description: data.description.trim(),
      featuredImage: data.featuredImage?.dataUrl ?? "",
      featuredImageCrop: data.featuredImageCrop,
      locationInput: data.locationInput.trim(),
      placeId: data.placeId.trim() || undefined,
      coordinates: {
        lat: Number(data.lat),
        lng: Number(data.lng),
      },
      address: data.address.trim(),
      colony: data.colony.trim(),
      area: data.area.trim(),
      pincode: data.pincode.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      district: data.district.trim(),
      portfolioImages: data.portfolioImages.map((image) => image.dataUrl),
      albums: data.albums.map((album) => ({
        name: album.name.trim(),
        images: album.images.map((image) => image.dataUrl),
      })),
      youtubeLinks: data.youtubeLinks.map((link) => ({
        url: link.url,
        thumb: link.thumb,
        videoId: link.videoId,
      })),
    };

    const didSave = existingListing
      ? await updateListing(existingListing.id, payload)
      : await createListing(payload);

    setSubmitting(false);

    if (!didSave) {
      await showErrorAlert(isEditing ? "Profile update failed" : "Profile creation failed", {
        text: isEditing
          ? "We could not update your profile right now. Please try again."
          : "We could not create your profile right now. Please try again.",
      });
      return;
    }

    await showSuccessAlert(isEditing ? "Profile updated" : "Profile created", {
      text: isEditing
        ? "Your vendor profile was updated successfully."
        : "Your profile has been submitted for super-admin review.",
    });
    onSubmit?.(data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{isEditing ? "Profile Updated!" : "Profile Created!"}</h2>
          <p className="text-gray-500 mt-2 max-w-sm">
            {isEditing
              ? "Your vendor profile changes are now saved."
              : "Your profile has been submitted for Super Admin review. You&apos;ll be notified once it&apos;s approved."}
          </p>
        </div>
        <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl">
          Back to Profiles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Profile" : "Create Profile"}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fill in your listing details — step {step} of {STEPS.length}</p>
        </div>
      </div>

      {/* Step bar */}
      <StepBar current={step} />

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
        {step === 1 && (
          <Step1
            data={data}
            setData={setData}
            categories={activeCategories}
            subCategories={subCategories}
            isCategoriesLoading={isMarketplaceLoading}
          />
        )}
        {step === 2 && <Step2 data={data} setData={setData} />}
        {step === 3 && <Step3 data={data} setData={setData} />}
      </div>

      {formError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => step === 1 ? onBack() : setStep(s => s - 1)}
          className="flex items-center gap-2 rounded-xl border-gray-200 hover:border-gray-300"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? "Cancel" : "Previous"}
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => {
              const validationError = validateStep(step);
              if (validationError) {
                setFormError(validationError);
                return;
              }

              setFormError("");
              setStep((currentStep) => currentStep + 1);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || isMutating}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 rounded-xl shadow-md"
          >
            {submitting || isMutating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? "Saving..." : "Creating..."}</>
              : <><Check className="w-4 h-4" /> {isEditing ? "Save Changes" : "Create Profile"}</>
            }
          </Button>
        )}
      </div>
    </div>
  );
}


