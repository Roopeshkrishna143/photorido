const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_OAUTH_SCOPE = "openid email profile";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "");

let googleScriptPromise: Promise<void> | null = null;
let googleClientIdPromise: Promise<string> | null = null;
let googleTokenClient: GoogleTokenClient | null = null;
let googleTokenClientId: string | null = null;

function getClientIdFromEnv() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
  return clientId || null;
}

async function getClientIdFromBackend() {
  const response = await fetch(`${API_BASE_URL}/auth/google/config`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Google login configuration could not be loaded from backend.");
  }

  const payload = await response.json() as { data?: { clientId?: string | null } };
  const clientId = payload.data?.clientId?.trim() || "";
  if (!clientId) {
    throw new Error("Google login is not configured. Please set GOOGLE_CLIENT_ID in backend/.env.");
  }

  return clientId;
}

async function getGoogleClientId() {
  const envClientId = getClientIdFromEnv();
  if (envClientId) {
    return envClientId;
  }

  if (!googleClientIdPromise) {
    googleClientIdPromise = getClientIdFromBackend();
  }

  try {
    return await googleClientIdPromise;
  } catch {
    googleClientIdPromise = null;
    throw new Error("Google login is not configured. Please set VITE_GOOGLE_CLIENT_ID or backend GOOGLE_CLIENT_ID.");
  }
}

function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google login is only available in the browser."));
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`);
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Unable to load Google login.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load Google login."));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

async function getGoogleTokenClient() {
  const googleOauth = window.google?.accounts?.oauth2;
  if (!googleOauth) {
    throw new Error("Google login is currently unavailable.");
  }

  const clientId = await getGoogleClientId();

  if (!googleTokenClient || googleTokenClientId !== clientId) {
    googleTokenClient = googleOauth.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_OAUTH_SCOPE,
      callback: () => undefined,
    });
    googleTokenClientId = clientId;
  }

  return googleTokenClient;
}

export async function requestGoogleAccessToken() {
  await loadGoogleIdentityScript();
  const tokenClient = await getGoogleTokenClient();

  return new Promise<string>((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error_description || "Google login was cancelled or failed."));
        return;
      }

      if (!response.access_token) {
        reject(new Error("Google login did not return an access token."));
        return;
      }

      resolve(response.access_token);
    };

    tokenClient.requestAccessToken({
      prompt: "select_account",
    });
  });
}
