const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "");

const AUTH_TOKEN_STORAGE_KEY = "photorido_auth_token";
export const AUTH_EXPIRED_EVENT = "photorido:auth-expired";

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path: string, query?: QueryParams) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;

  if (!query) {
    return base;
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    ArrayBuffer.isView(value)
  );
}

function getResponseMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim() !== "") {
    return payload;
  }

  if (!isPlainObject(payload)) {
    return fallback;
  }

  const candidates = [payload.message, payload.error, payload.detail];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "") {
      return candidate;
    }
  }

  return fallback;
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? text : null;
}

export function getStoredAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token?: string | null) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      return;
    }

    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage access failures in unsupported environments.
  }
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
}

export function unwrapPayload<T>(payload: unknown): T {
  if (isPlainObject(payload)) {
    if ("data" in payload) {
      return payload.data as T;
    }

    if ("result" in payload) {
      return payload.result as T;
    }
  }

  return payload as T;
}

export function unwrapArray<T>(payload: unknown): T[] {
  const data = unwrapPayload<unknown>(payload);

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (!isPlainObject(data)) {
    return [];
  }

  const candidates = [data.items, data.results, data.records, data.rows];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | Record<string, unknown> | null;
  query?: QueryParams;
  skipAuthRefresh?: boolean;
  skipAuthToken?: boolean;
}

let refreshRequestPromise: Promise<string | null> | null = null;

function shouldAttemptAuthRefresh(path: string) {
  return ![
    "/auth/login",
    "/auth/register",
    "/auth/google",
    "/auth/logout",
    "/auth/refresh",
  ].some((authPath) => path.startsWith(authPath));
}

function extractSessionToken(payload: unknown) {
  const session = unwrapPayload<unknown>(payload);

  if (!isPlainObject(session)) {
    return null;
  }

  const candidates = [session.token, session.accessToken, session.jwt];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "") {
      return candidate;
    }
  }

  return null;
}

function emitAuthExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}

async function performRequest(path: string, options: RequestOptions = {}) {
  const { body, headers, query, skipAuthToken, ...rest } = options;
  const token = getStoredAuthToken();
  const finalHeaders = new Headers(headers ?? {});
  const shouldSendBodyDirectly = isBodyInit(body);

  if (!shouldSendBodyDirectly && body && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuthToken && token && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, query), {
    credentials: "include",
    ...rest,
    headers: finalHeaders,
    body: shouldSendBodyDirectly || body === undefined || body === null
      ? (body as BodyInit | null | undefined)
      : JSON.stringify(body),
  });

  const payload = await parseResponseBody(response);
  return { response, payload };
}

async function refreshAccessToken() {
  if (!refreshRequestPromise) {
    refreshRequestPromise = (async () => {
      try {
        const { response, payload } = await performRequest("/auth/refresh", {
          method: "POST",
          skipAuthToken: true,
        });

        if (!response.ok) {
          throw new ApiError(
            getResponseMessage(payload, `Request failed with status ${response.status}`),
            response.status,
            payload,
          );
        }

        const nextToken = extractSessionToken(payload);
        setStoredAuthToken(nextToken);
        return nextToken;
      } catch {
        setStoredAuthToken(null);
        emitAuthExpired();
        return null;
      } finally {
        refreshRequestPromise = null;
      }
    })();
  }

  return refreshRequestPromise;
}

async function request<T>(path: string, options: RequestOptions = {}, hasRetried = false) {
  const { skipAuthRefresh, ...rest } = options;
  const { response, payload } = await performRequest(path, rest);

  if (response.status === 401 && !skipAuthRefresh && !hasRetried && shouldAttemptAuthRefresh(path)) {
    const nextToken = await refreshAccessToken();

    if (nextToken) {
      return request<T>(path, options, true);
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getResponseMessage(payload, `Request failed with status ${response.status}`),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: RequestOptions["body"], options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: RequestOptions["body"], options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: RequestOptions["body"], options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
