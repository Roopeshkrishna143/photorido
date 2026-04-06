import Swal, { type SweetAlertIcon } from "sweetalert2";

interface AlertOptions {
  text?: string;
  toast?: boolean;
  timer?: number;
  position?: "top" | "top-start" | "top-end" | "center" | "center-start" | "center-end" | "bottom" | "bottom-start" | "bottom-end";
  confirmButtonText?: string;
}

interface ConfirmOptions {
  title: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
}

function buildAlertOptions(icon: SweetAlertIcon, title: string, options?: AlertOptions) {
  return {
    icon,
    title,
    text: options?.text,
    confirmButtonColor: "#2563eb",
    confirmButtonText: options?.confirmButtonText ?? "OK",
    toast: options?.toast ?? false,
    timer: options?.toast ? (options?.timer ?? 2400) : undefined,
    timerProgressBar: Boolean(options?.toast),
    position: options?.position ?? (options?.toast ? "top-end" : "center"),
    showConfirmButton: options?.toast ? false : true,
  };
}

export function showSuccessAlert(title: string, options?: AlertOptions) {
  return Swal.fire(buildAlertOptions("success", title, options));
}

export function showErrorAlert(title: string, options?: AlertOptions) {
  return Swal.fire(buildAlertOptions("error", title, options));
}

export function showInfoAlert(title: string, options?: AlertOptions) {
  return Swal.fire(buildAlertOptions("info", title, options));
}

export async function showConfirmAlert(options: ConfirmOptions) {
  const result = await Swal.fire({
    icon: options.icon ?? "warning",
    title: options.title,
    text: options.text,
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText ?? "Continue",
    cancelButtonText: options.cancelButtonText ?? "Cancel",
    confirmButtonColor: options.confirmButtonColor ?? "#dc2626",
    cancelButtonColor: "#94a3b8",
  });

  return result.isConfirmed;
}
