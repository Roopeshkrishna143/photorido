import { api, unwrapPayload } from "./api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "");

function buildPublicUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (/^https?:\/\//i.test(API_BASE_URL)) {
    const origin = API_BASE_URL.replace(/\/api\/?$/i, "");
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  }

  return path;
}

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

  return buildPublicUrl(uploadUrl);
}
