const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "");

function getApiOrigin() {
  if (/^https?:\/\//i.test(API_BASE_URL)) {
    return API_BASE_URL.replace(/\/api\/?$/i, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function resolvePublicAssetUrl(path: string) {
  const trimmed = path.trim();
  if (!trimmed) {
    return "";
  }

  if (/^(https?:|blob:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const origin = getApiOrigin();
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}
