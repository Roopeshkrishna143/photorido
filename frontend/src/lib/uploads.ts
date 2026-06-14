import { api, unwrapPayload } from "./api";
import { resolvePublicAssetUrl } from "./media";

export async function uploadImageFile(file: File) {
  const payload = await api.post("/uploads/images", file, {
    headers: {
      "Content-Type": file.type,
      "X-File-Name": file.name,
    },
  });

  const data = unwrapPayload<{ url?: string }>(payload);
  const uploadUrl = data?.url ?? "";
  if (!uploadUrl) {
    throw new Error("Image upload completed, but no image URL was returned.");
  }

  return resolvePublicAssetUrl(uploadUrl);
}

export interface UploadedDocument {
  fileName: string;
  originalName: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export async function uploadDocumentFile(file: File) {
  const payload = await api.post("/uploads/documents", file, {
    headers: {
      "Content-Type": file.type || "application/pdf",
      "X-File-Name": file.name,
    },
  });

  const data = unwrapPayload<UploadedDocument>(payload);
  if (!data?.url) {
    throw new Error("Document upload completed, but no document URL was returned.");
  }

  return {
    ...data,
  };
}
