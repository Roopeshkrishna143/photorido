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
