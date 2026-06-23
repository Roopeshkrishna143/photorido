import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  MapPin,
  PencilLine,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { showErrorAlert, showSuccessAlert } from "../../lib/alerts";
import { api, getErrorMessage } from "../../lib/api";
import { resolvePublicAssetUrl } from "../../lib/media";
import { uploadImageFile } from "../../lib/uploads";
import { useSettings, type UserSettings } from "../../hooks/useSettings";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type CropState = {
  zoom: number;
  x: number;
  y: number;
};

type AvatarDraft = {
  fileName: string;
  fileType: string;
  previewUrl: string;
};

const DEFAULT_AVATAR_CROP: CropState = {
  zoom: 1,
  x: 0,
  y: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) {
    return "U";
  }

  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("We could not prepare this image for cropping."));
    image.src = source;
  });
}

async function createCroppedAvatarBlob(source: string, crop: CropState, sourceType: string) {
  const image = await loadImage(source);
  const outputSize = 640;
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image editing is not supported in this browser.");
  }

  const baseScale = Math.max(outputSize / image.width, outputSize / image.height);
  const scale = baseScale * crop.zoom;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const overflowX = Math.max(0, drawWidth - outputSize);
  const overflowY = Math.max(0, drawHeight - outputSize);
  const positionX = clamp((50 + crop.x / 2) / 100, 0, 1);
  const positionY = clamp((50 + crop.y / 2) / 100, 0, 1);
  const drawX = -overflowX * positionX;
  const drawY = -overflowY * positionY;

  context.clearRect(0, 0, outputSize, outputSize);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  const outputType = sourceType === "image/png" ? "image/png" : "image/jpeg";

  // We save the adjusted crop as the uploaded avatar so the preview stays consistent everywhere.
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("We could not finalize the cropped profile image."));
        return;
      }

      resolve(blob);
    }, outputType, outputType === "image/png" ? undefined : 0.92);
  });
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 accent-blue-600"
      />
    </label>
  );
}

function AvatarCropDialog({
  draft,
  crop,
  isSaving,
  onChangeCrop,
  onClose,
  onSave,
}: {
  draft: AvatarDraft | null;
  crop: CropState;
  isSaving: boolean;
  onChangeCrop: (crop: CropState) => void;
  onClose: () => void;
  onSave: () => void;
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

  return (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adjust Profile Image</DialogTitle>
          <DialogDescription>
            Drag inside the circle and fine-tune the crop before saving your profile photo.
          </DialogDescription>
        </DialogHeader>

        {draft && (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
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
                className="mx-auto h-56 w-56 cursor-grab overflow-hidden rounded-full border-[6px] border-white bg-slate-200 shadow-xl active:cursor-grabbing"
              >
                <img
                  src={draft.previewUrl}
                  alt="Avatar crop preview"
                  className="h-full w-full select-none object-cover"
                  draggable={false}
                  style={{
                    transform: `scale(${crop.zoom})`,
                    objectPosition: `${50 + crop.x / 2}% ${50 + crop.y / 2}%`,
                  }}
                />
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                Instagram-style crop preview. Drag to reposition the visible area.
              </p>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">{draft.fileName}</p>
                <p className="mt-1 text-xs text-slate-600">
                  The adjusted crop will be uploaded and used as your live profile photo.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Zoom</Label>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Horizontal</Label>
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
                  <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Vertical</Label>
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

              <div className="flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700" onClick={onSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Save Photo
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { settings, isLoading, isSaving, saveSettings } = useSettings();
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
    avatar: "",
  });
  const [settingsForm, setSettingsForm] = useState(settings);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState<AvatarDraft | null>(null);
  const [avatarCrop, setAvatarCrop] = useState<CropState>(DEFAULT_AVATAR_CROP);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [supportForm, setSupportForm] = useState({
    issueTitle: "",
    description: "",
  });
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  useEffect(() => {
    const normalizedEmail = user?.email ?? "";
    const hasEmail = isLikelyEmail(normalizedEmail);
    const fallbackPhone = user?.phoneNumber || (!hasEmail ? normalizedEmail : "");
    const normalizedAvatar = resolvePublicAssetUrl(user?.avatar ?? "");

    setProfileForm({
      name: user?.name ?? "",
      email: hasEmail ? normalizedEmail : "",
      phoneNumber: fallbackPhone,
      location: user?.location ?? "",
      avatar: normalizedAvatar,
    });
    setAvatarPreviewUrl(normalizedAvatar);
  }, [user?.avatar, user?.email, user?.location, user?.name, user?.phoneNumber]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (avatarDraft) {
        URL.revokeObjectURL(avatarDraft.previewUrl);
      }
    };
  }, [avatarDraft]);

  const roleLabel = useMemo(() => {
    if (user?.role === "super-admin") return "Super Admin";
    if (user?.role === "vendor") return "Vendor";
    return "User";
  }, [user?.role]);
  // Priority: live blob from open editor → saved preview URL → form avatar → user avatar
  const displayAvatar =
    avatarDraft?.previewUrl ||
    (avatarPreviewUrl ? resolvePublicAssetUrl(avatarPreviewUrl) : "") ||
    resolvePublicAssetUrl(profileForm.avatar || "") ||
    resolvePublicAssetUrl(user?.avatar || "");

  const profileReadiness = user?.profileComplete ? "Profile Ready" : "Needs Attention";

  const closeAvatarEditor = (nextPreviewUrl?: string) => {
    setAvatarDraft((current) => {
      if (current) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
    setAvatarCrop(DEFAULT_AVATAR_CROP);
    // Always use the explicitly provided URL if given; otherwise restore from current form/user state
    if (nextPreviewUrl !== undefined) {
      setAvatarPreviewUrl(nextPreviewUrl);
    }
    // If no URL given (user cancelled), avatarPreviewUrl was already set by handleAvatarUpload; leave it.
  };

  const handleProfileSave = async () => {
    const normalizedName = profileForm.name.trim();
    const normalizedEmail = profileForm.email.trim().toLowerCase();
    const normalizedPhone = profileForm.phoneNumber.trim();
    const normalizedLocation = profileForm.location.trim();

    if (!normalizedName) {
      await showErrorAlert("Profile update failed", {
        text: "Please add your full name before saving.",
      });
      return;
    }

    if (!normalizedEmail && !normalizedPhone) {
      await showErrorAlert("Profile update failed", {
        text: "Please add at least one contact method (email or phone).",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const updates: Partial<typeof profileForm> = {
        name: normalizedName,
        location: normalizedLocation,
        avatar: profileForm.avatar,
      };

      if (normalizedEmail) {
        updates.email = normalizedEmail;
      }

      if (normalizedPhone) {
        updates.phoneNumber = normalizedPhone;
      }

      await updateProfile(updates);
      setProfileForm((current) => ({
        ...current,
        ...updates,
      }));
      await showSuccessAlert("Profile updated", {
        text: "Your account profile settings were updated successfully.",
      });
    } catch (error) {
      await showErrorAlert("Profile update failed", {
        text: error instanceof Error ? error.message : "We could not update your profile settings.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePreferenceFieldChange = useCallback(async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const previousValue = settingsForm[key];
    setSettingsForm((current) => ({ ...current, [key]: value }));

    const didSave = await saveSettings({ [key]: value } as Partial<UserSettings>);
    if (!didSave) {
      setSettingsForm((current) => ({ ...current, [key]: previousValue }));
      await showErrorAlert("Preference update failed", {
        text: "We could not save that preference right now.",
      });
    }
  }, [saveSettings, settingsForm]);

  const handlePreferenceSave = async () => {
    const didSave = await saveSettings(settingsForm);
    if (didSave) {
      await showSuccessAlert("Preferences updated", {
        text: "Your notification and privacy preferences were updated successfully.",
      });
    } else {
      await showErrorAlert("Preferences update failed", {
        text: "We could not update your preferences.",
      });
    }
  };

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      void showErrorAlert("Invalid image format", {
        text: "Please choose a JPG, PNG, or WEBP image.",
      });
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarDraft((current) => {
      if (current) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return {
        fileName: file.name,
        fileType: file.type,
        previewUrl,
      };
    });
    setAvatarPreviewUrl(previewUrl);
    setAvatarCrop(DEFAULT_AVATAR_CROP);
    event.target.value = "";
  };

  const handleAvatarSave = async () => {
    if (!avatarDraft) {
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const croppedBlob = await createCroppedAvatarBlob(avatarDraft.previewUrl, avatarCrop, avatarDraft.fileType);
      const extension = croppedBlob.type === "image/png" ? "png" : "jpg";
      const croppedFile = new File([croppedBlob], `profile-avatar-${Date.now()}.${extension}`, {
        type: croppedBlob.type,
      });
      const uploadedUrl = await uploadImageFile(croppedFile);

      await updateProfile({ avatar: uploadedUrl });
      const resolvedAvatarUrl = resolvePublicAssetUrl(uploadedUrl);
      setProfileForm((current) => ({ ...current, avatar: uploadedUrl }));
      setAvatarPreviewUrl(resolvedAvatarUrl);
      closeAvatarEditor(resolvedAvatarUrl);
      await showSuccessAlert("Profile image updated", {
        text: "Your new profile image is live now.",
      });
    } catch (error) {
      await showErrorAlert("Avatar upload failed", {
        text: error instanceof Error ? error.message : "Avatar upload failed.",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSupportTicketCreate = async () => {
    const issueTitle = supportForm.issueTitle.trim();
    const description = supportForm.description.trim();

    if (issueTitle.length < 2 || description.length < 3) {
      await showErrorAlert("Ticket not created", {
        text: "Add a short title and a little detail before submitting.",
      });
      return;
    }

    setIsCreatingTicket(true);
    try {
      await api.post("/operations/support-tickets", {
        issueTitle,
        description,
      });
      setSupportForm({ issueTitle: "", description: "" });
      await showSuccessAlert("Support ticket created", {
        text: "The support team can now see this in their ticket queue.",
      });
    } catch (error) {
      await showErrorAlert("Ticket not created", {
        text: getErrorMessage(error, "We could not create your support ticket right now."),
      });
    } finally {
      setIsCreatingTicket(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage account, notification, privacy, and {roleLabel.toLowerCase()} preferences.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          <Settings2 className="h-3.5 w-3.5" />
          {roleLabel} settings
        </div>
      </div>

      <Card className="overflow-hidden border-0 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_42%),linear-gradient(135deg,_#eff6ff,_#ffffff_48%,_#f8fafc)] px-6 pb-6 pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="w-full max-w-[280px] rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
              <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-[6px] border-white bg-slate-100 shadow-xl">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={profileForm.name || "Avatar"}
                    className="h-full w-full object-cover"
                    onError={() => {
                      setAvatarPreviewUrl("");
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-4xl font-bold text-white">
                    {getInitials(profileForm.name || user?.name || "User")}
                  </div>
                )}
              </div>

              <div className="mt-5 text-center">
                <p className="text-lg font-semibold text-slate-900">{profileForm.name || user?.name || "Your profile"}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {profileForm.email || profileForm.phoneNumber || "Update your profile details below"}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {roleLabel}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${user?.profileComplete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                  {profileReadiness}
                </span>
              </div>

              <label className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700">
                {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {profileForm.avatar ? "Change Profile Photo" : "Upload Profile Photo"}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarUpload} />
              </label>

              <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                Upload, crop, and preview your avatar before it goes live across the platform.
              </p>
            </div>

            <div className="min-w-0 flex-1 rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-lg shadow-slate-200/40 backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                    <UserCircle2 className="h-4 w-4" />
                    Account Profile
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Keep your public identity sharp and current.</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-500">
                    Your name, contact details, and profile image are used across dashboard surfaces, conversations, and marketplace views.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <MapPin className="h-3.5 w-3.5" />
                  {profileForm.location || "Location not set"}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Full Name</Label>
                  <Input
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                    className="h-12 rounded-2xl border-slate-200"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Email</Label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                    className="h-12 rounded-2xl border-slate-200"
                    placeholder="Add your email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Phone Number</Label>
                  <Input
                    value={profileForm.phoneNumber}
                    onChange={(event) => setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                    className="h-12 rounded-2xl border-slate-200"
                    placeholder="Add your mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Location</Label>
                  <Input
                    value={profileForm.location}
                    onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))}
                    className="h-12 rounded-2xl border-slate-200"
                    placeholder="City, state, or area"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Photo URL</Label>
                  <Input
                    value={profileForm.avatar}
                    onChange={(event) => setProfileForm((current) => ({ ...current, avatar: event.target.value }))}
                    className="h-12 rounded-2xl border-slate-200"
                    placeholder="Paste a hosted image URL if needed"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <PencilLine className="h-4 w-4 text-blue-600" />
                    Profile polish
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Save text changes separately. Photo updates are stored as soon as you finish cropping.
                  </p>
                </div>
                <Button onClick={() => void handleProfileSave()} disabled={isSavingProfile || isUploadingAvatar} className="bg-blue-600 text-white hover:bg-blue-700">
                  {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {(user?.role === "user" || user?.role === "vendor") && (
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Create Support Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={supportForm.issueTitle}
              onChange={(event) =>
                setSupportForm((current) => ({
                  ...current,
                  issueTitle: event.target.value,
                }))
              }
              className="rounded-xl border-gray-200"
              placeholder="Issue title"
            />
            <Textarea
              value={supportForm.description}
              onChange={(event) =>
                setSupportForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Describe what you need help with"
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                disabled={isCreatingTicket}
                onClick={() => void handleSupportTicketCreate()}
              >
                {isCreatingTicket ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Communication Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Theme</Label>
                <select value={settingsForm.theme} onChange={(event) => setSettingsForm((current) => ({ ...current, theme: event.target.value as typeof current.theme }))} className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Language</Label>
                <Input value={settingsForm.language} onChange={(event) => setSettingsForm((current) => ({ ...current, language: event.target.value }))} className="rounded-xl border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Timezone</Label>
                <Input value={settingsForm.timezone} onChange={(event) => setSettingsForm((current) => ({ ...current, timezone: event.target.value }))} className="rounded-xl border-gray-200" />
              </div>
            </div>

            <ToggleField label="Email notifications" description="Receive important account and booking updates by email." checked={settingsForm.emailNotifications} onChange={(value) => void handlePreferenceFieldChange("emailNotifications", value)} />
            <ToggleField label="SMS notifications" description="Send critical booking alerts to your mobile number." checked={settingsForm.smsNotifications} onChange={(value) => void handlePreferenceFieldChange("smsNotifications", value)} />
            <ToggleField label="Push notifications" description="Show in-app notification prompts for new activity." checked={settingsForm.pushNotifications} onChange={(value) => void handlePreferenceFieldChange("pushNotifications", value)} />
            <ToggleField label="Booking alerts" description="Get notified when bookings change status or need action." checked={settingsForm.bookingAlerts} onChange={(value) => void handlePreferenceFieldChange("bookingAlerts", value)} />
            <ToggleField label="Message alerts" description="Get notified for new direct messages and replies." checked={settingsForm.messageAlerts} onChange={(value) => void handlePreferenceFieldChange("messageAlerts", value)} />
            <ToggleField label="Review alerts" description="See notifications when reviews are received or moderated." checked={settingsForm.reviewAlerts} onChange={(value) => void handlePreferenceFieldChange("reviewAlerts", value)} />
            <ToggleField label="Marketing updates" description="Receive product announcements, offers, and platform news." checked={settingsForm.marketingEmails} onChange={(value) => void handlePreferenceFieldChange("marketingEmails", value)} />
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4 text-blue-600" /> Privacy and Role Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleField label="Profile visible" description="Allow your account or vendor presence to remain visible across the platform." checked={settingsForm.profileVisible} onChange={(value) => void handlePreferenceFieldChange("profileVisible", value)} />
            <ToggleField label="Allow direct messages" description="Let users and vendors contact you through the messaging module." checked={settingsForm.allowDirectMessages} onChange={(value) => void handlePreferenceFieldChange("allowDirectMessages", value)} />
            <ToggleField label="Show email on profile" description="Display your email where the platform supports public contact details." checked={settingsForm.showEmail} onChange={(value) => void handlePreferenceFieldChange("showEmail", value)} />
            <ToggleField label="Show phone number" description="Display your phone number where role policies allow it." checked={settingsForm.showPhoneNumber} onChange={(value) => void handlePreferenceFieldChange("showPhoneNumber", value)} />
            {user?.role === "vendor" && (
              <ToggleField label="Instant booking readiness" description="Mark your vendor account ready for faster booking confirmation flows." checked={settingsForm.instantBooking} onChange={(value) => void handlePreferenceFieldChange("instantBooking", value)} />
            )}
            {user?.role === "user" && (
              <ToggleField label="Saved-profile reminders" description="Get reminders when your saved professionals become active or change details." checked={settingsForm.favoriteAlerts} onChange={(value) => void handlePreferenceFieldChange("favoriteAlerts", value)} />
            )}
            {user?.role === "super-admin" && (
              <>
                <ToggleField label="Moderation alerts" description="Get notified when reviews, profiles, or users require admin attention." checked={settingsForm.moderationAlerts} onChange={(value) => void handlePreferenceFieldChange("moderationAlerts", value)} />
                <ToggleField label="System alerts" description="Receive platform-level operational notices and admin summaries." checked={settingsForm.systemAlerts} onChange={(value) => void handlePreferenceFieldChange("systemAlerts", value)} />
              </>
            )}

            <div className="space-y-2 pt-2">
              <Label className="text-sm font-semibold text-gray-700">Notification digest</Label>
              <select value={settingsForm.digestFrequency} onChange={(event) => setSettingsForm((current) => ({ ...current, digestFrequency: event.target.value as typeof current.digestFrequency }))} className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <option value="instant">Instant</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => void handlePreferenceSave()} disabled={isSaving || isLoading} className="bg-blue-600 text-white hover:bg-blue-700">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AvatarCropDialog
        draft={avatarDraft}
        crop={avatarCrop}
        isSaving={isUploadingAvatar}
        onChangeCrop={setAvatarCrop}
        onClose={closeAvatarEditor}
        onSave={() => void handleAvatarSave()}
      />
    </div>
  );
}
