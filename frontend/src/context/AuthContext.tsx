import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, AUTH_EXPIRED_EVENT, setStoredAuthToken, unwrapPayload } from "../lib/api";
import { requestGoogleAccessToken } from "../lib/google-auth";
import { resolvePublicAssetUrl } from "../lib/media";

export type UserRole =
  | "super-admin"
  | "admin"
  | "vendor"
  | "user"
  | "staff"
  | "vendor_verification_officer"
  | "booking_coordinator"
  | "support_executive"
  | "content_moderator"
  | "finance_manager"
  | "marketing_manager"
  | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileComplete?: boolean;
  avatar?: string;
  phoneNumber?: string;
  location?: string;
  status?: "active" | "invited" | "disabled";
}

export interface RegistrationOtpResponse {
  channel: "email" | "mobile";
  maskedDestination: string;
  deliveryMode: "mailtrap-email" | "mailtrap-mobile-fallback" | "preview";
  expiresInMinutes: number;
  previewOtp?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<User>;
  loginWithGoogle: (role?: UserRole) => Promise<User>;
  requestRegistrationOtp: (name: string, identifier: string, password: string, role: UserRole) => Promise<RegistrationOtpResponse>;
  verifyRegistrationOtp: (identifier: string, otp: string) => Promise<User>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "photorido_user";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStoredUser() {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

function normalizeRole(value: unknown): UserRole {
  if (
    value === "super-admin" ||
    value === "admin" ||
    value === "vendor" ||
    value === "user" ||
    value === "staff" ||
    value === "vendor_verification_officer" ||
    value === "booking_coordinator" ||
    value === "support_executive" ||
    value === "content_moderator" ||
    value === "finance_manager" ||
    value === "marketing_manager"
  ) {
    return value;
  }

  if (value === "super_admin") {
    return "super-admin";
  }

  if (value === "consumer" || value === "customer") {
    return "user";
  }

  if (value === "professional") {
    return "vendor";
  }

  return null;
}

function getStringValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return "";
}

function normalizeUser(payload: unknown): User {
  const raw = isRecord(payload) ? payload : {};
  const name = getStringValue(raw.name, raw.fullName, raw.displayName, raw.username, raw.email);
  const email = getStringValue(raw.email);
  const avatar = getStringValue(raw.avatar, raw.profileImage, raw.image);
  const phoneNumber = getStringValue(raw.phoneNumber, raw.phone, raw.mobile);
  const location = getStringValue(raw.location, raw.city, raw.address);
  const profileCompleteValue = raw.profileComplete;
  const status = raw.status === "active" || raw.status === "invited" || raw.status === "disabled"
    ? raw.status
    : undefined;

  return {
    id: getStringValue(raw.id, raw._id) || crypto.randomUUID(),
    name,
    email,
    role: normalizeRole(raw.role),
    profileComplete:
      typeof profileCompleteValue === "boolean"
        ? profileCompleteValue
        : normalizeRole(raw.role) === "user",
    avatar: avatar ? resolvePublicAssetUrl(avatar) : undefined,
    phoneNumber: phoneNumber || undefined,
    location: location || undefined,
    status,
  };
}

function persistUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Ignore storage access failures in unsupported environments.
  }
}

function resolveSession(payload: unknown) {
  const session = unwrapPayload<unknown>(payload);
  const raw = isRecord(session) ? session : {};
  const rawUser = isRecord(raw.user) ? raw.user : raw;
  const user = normalizeUser(rawUser);
  const token = getStringValue(raw.token, raw.accessToken, raw.jwt);

  return { user, token };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      persistUser(null);
      setStoredAuthToken(null);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, []);

  const applySession = (payload: unknown) => {
    const { user: nextUser, token } = resolveSession(payload);

    setUser(nextUser);
    persistUser(nextUser);
    setStoredAuthToken(token || null);
    return nextUser;
  };

  const login = async (identifier: string, password: string) => {
    const payload = await api.post("/auth/login", {
      identifier: identifier.trim(),
      password,
    });

    return applySession(payload);
  };

  const loginWithGoogle = async (role?: UserRole) => {
    const accessToken = await requestGoogleAccessToken();
    const payload = await api.post("/auth/google", {
      accessToken,
      role: role ?? undefined,
    });
    return applySession(payload);
  };

  const requestRegistrationOtp = async (name: string, identifier: string, password: string, role: UserRole) => {
    const payload = await api.post("/auth/register/request-otp", {
      name,
      identifier: identifier.trim(),
      password,
      role: role ?? "user",
    });

    return unwrapPayload<RegistrationOtpResponse>(payload);
  };

  const verifyRegistrationOtp = async (identifier: string, otp: string) => {
    const payload = await api.post("/auth/register/verify-otp", {
      identifier: identifier.trim(),
      otp: otp.trim(),
    });

    return applySession(payload);
  };

  const logout = () => {
    void api.post("/auth/logout").catch(() => undefined);
    setUser(null);
    persistUser(null);
    setStoredAuthToken(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const payload = await api.patch("/auth/profile", updates);
    applySession(payload);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, requestRegistrationOtp, verifyRegistrationOtp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}



