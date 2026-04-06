import { showInfoAlert, showSuccessAlert } from "./alerts";

export async function shareProfessional(options: { title: string; text?: string; path: string }) {
  const url = `${window.location.origin}${options.path.startsWith("/") ? options.path : `/${options.path}`}`;
  const sharePayload = {
    title: options.title,
    text: options.text ?? `Check out ${options.title} on Photorido`,
    url,
  };

  if (navigator.share) {
    try {
      await navigator.share(sharePayload);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return false;
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    await showSuccessAlert("Share link copied", {
      text: "The profile link is ready to paste anywhere.",
      toast: true,
    });
    return true;
  }

  await showInfoAlert("Copy this link", { text: url });
  return true;
}
