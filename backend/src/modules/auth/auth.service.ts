import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { CookieOptions, Request } from "express";
import jwt from "jsonwebtoken";
import { resolvedEnv as env } from "../../config/env.js";
import { RegistrationOtpModel, type RegistrationOtpIdentifierType, type RegistrationOtpRole } from "../../models/registration-otp.model.js";
import { RefreshTokenModel } from "../../models/refresh-token.model.js";
import { USER_ROLES, UserModel } from "../../models/user.model.js";
import type { UserAccountStatus, UserDocument, UserRole } from "../../models/user.model.js";
import { HttpError } from "../../utils/http-error.js";
import { logger } from "../../utils/logger.js";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserAccountStatus;
  profileComplete: boolean;
  avatar?: string;
  phoneNumber?: string;
  location?: string;
}

export interface AccessTokenPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface RefreshTokenPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
  type: "refresh";
  jti: string;
}

interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthIdentifier {
  type: RegistrationOtpIdentifierType;
  value: string;
  maskedValue: string;
}

export interface AuthSession {
  user: AuthenticatedUser;
  token: string;
  refreshToken: string;
  refreshTokenId: string;
}

export interface RegistrationOtpDelivery {
  channel: RegistrationOtpIdentifierType;
  maskedDestination: string;
  deliveryMode: "mailtrap-email" | "mailtrap-mobile-fallback" | "preview";
  expiresInMinutes: number;
  previewOtp?: string;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isEmailVerified(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
}

interface GoogleTokenInfoResponse {
  aud?: string;
  expires_in?: string;
  scope?: string;
  sub?: string;
}

interface GoogleUserInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  given_name?: string;
  picture?: string;
}

function resolveGoogleUserName(profile: GoogleUserInfoResponse) {
  const rawName = profile.name?.trim() || profile.given_name?.trim();
  if (rawName) {
    return rawName.slice(0, 80);
  }

  if (profile.email) {
    return profile.email.split("@")[0]?.trim().slice(0, 80) || "Google User";
  }

  return "Google User";
}

async function verifyGoogleAccessToken(accessToken: string) {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new HttpError(503, "Google login is not configured.");
  }

  let tokenInfo: GoogleTokenInfoResponse;
  try {
    const tokenInfoUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
    tokenInfoUrl.searchParams.set("access_token", accessToken);

    const response = await fetch(tokenInfoUrl, { method: "GET" });
    if (!response.ok) {
      throw new HttpError(401, "Google access token is invalid or expired.");
    }

    tokenInfo = await response.json() as GoogleTokenInfoResponse;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(502, "Google token verification failed. Please try again.");
  }

  if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
    throw new HttpError(401, "Google access token audience mismatch.");
  }

  if (tokenInfo.expires_in && Number(tokenInfo.expires_in) <= 0) {
    throw new HttpError(401, "Google access token has expired.");
  }

  return tokenInfo;
}

async function fetchGoogleUserInfo(accessToken: string) {
  let profile: GoogleUserInfoResponse;
  try {
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new HttpError(401, "Unable to fetch profile details from Google.");
    }

    profile = await response.json() as GoogleUserInfoResponse;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(502, "Google profile lookup failed. Please try again.");
  }

  const normalizedEmail = profile.email?.trim().toLowerCase();
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    throw new HttpError(400, "Google account does not have a valid email address.");
  }

  if (!isEmailVerified(profile.email_verified)) {
    throw new HttpError(403, "Google email is not verified.");
  }

  const googleId = profile.sub?.trim();
  if (!googleId) {
    throw new HttpError(400, "Google account id is missing.");
  }

  return {
    googleId,
    email: normalizedEmail,
    name: resolveGoogleUserName(profile),
    avatar: profile.picture?.trim() || undefined,
  };
}

function normalizePhoneNumber(value: string) {
  const compact = value.replace(/[\s\-()]/g, "");
  const normalized = compact.startsWith("+") ? `+${compact.slice(1).replace(/\D/g, "")}` : compact.replace(/\D/g, "");

  if (!/^\+?[1-9]\d{7,14}$/.test(normalized)) {
    throw new HttpError(400, "Enter a valid email address or mobile number.");
  }

  return normalized;
}

function maskEmail(email: string) {
  const [rawLocalPart = "", domain = ""] = email.split("@");
  const localPart = rawLocalPart || "u";
  const visibleLocal = localPart.slice(0, 2);
  const maskedLocal = `${visibleLocal}${"*".repeat(Math.max(2, localPart.length - visibleLocal.length))}`;
  return domain ? `${maskedLocal}@${domain}` : maskedLocal;
}

function maskPhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  const visibleTail = digits.slice(-2);
  const maskedHead = "*".repeat(Math.max(0, digits.length - 2));
  return phoneNumber.startsWith("+")
    ? `+${maskedHead}${visibleTail}`
    : `${maskedHead}${visibleTail}`;
}

export function normalizeAuthIdentifier(value: string): AuthIdentifier {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw new HttpError(400, "Email or mobile number is required.");
  }

  const normalizedEmail = trimmedValue.toLowerCase();
  if (isValidEmail(normalizedEmail)) {
    return {
      type: "email",
      value: normalizedEmail,
      maskedValue: maskEmail(normalizedEmail),
    };
  }

  const normalizedPhoneNumber = normalizePhoneNumber(trimmedValue);
  return {
    type: "mobile",
    value: normalizedPhoneNumber,
    maskedValue: maskPhoneNumber(normalizedPhoneNumber),
  };
}

function generateRegistrationOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashRegistrationOtp(otp: string) {
  return crypto.createHash("sha256").update(`registration:${otp}`).digest("hex");
}

function isOtpMatch(inputOtp: string, storedHash: string) {
  const inputBuffer = Buffer.from(hashRegistrationOtp(inputOtp));
  const storedBuffer = Buffer.from(storedHash);

  if (inputBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, storedBuffer);
}

async function findUserByIdentifier(identifier: AuthIdentifier) {
  if (identifier.type === "email") {
    return UserModel.findOne({ email: identifier.value });
  }

  return UserModel.findOne({
    $or: [
      { phoneNumber: identifier.value },
      { email: identifier.value },
    ],
  });
}

async function ensureIdentifierIsAvailable(identifier: AuthIdentifier) {
  const existingUser = await findUserByIdentifier(identifier);
  if (existingUser) {
    throw new HttpError(409, "An account with this email or mobile number already exists.");
  }
}

function getMailtrapConfigIssues() {
  const issues: string[] = [];

  if (!env.MAILTRAP_API_TOKEN) {
    issues.push("MAILTRAP_API_TOKEN");
  }

  if (!env.MAILTRAP_SENDER_EMAIL) {
    issues.push("MAILTRAP_SENDER_EMAIL");
  }

  return issues;
}

async function sendMailtrapMessage(subject: string, text: string, recipientEmail: string) {
  const missingConfig = getMailtrapConfigIssues();
  if (missingConfig.length > 0) {
    logger.error("auth.otp", "Mailtrap configuration is incomplete.", {
      missingConfig,
      recipientEmail: maskEmail(recipientEmail),
    });
    throw new HttpError(
      503,
      `Mailtrap email delivery is not configured. Missing: ${missingConfig.join(", ")}.`,
    );
  }

  logger.info("auth.otp", "Sending OTP email through Mailtrap.", {
    recipientEmail: maskEmail(recipientEmail),
    apiUrl: env.MAILTRAP_API_URL,
  });

  try {
    const response = await fetch(env.MAILTRAP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MAILTRAP_API_TOKEN}`,
      },
      body: JSON.stringify({
        from: {
          email: env.MAILTRAP_SENDER_EMAIL,
          name: env.MAILTRAP_SENDER_NAME,
        },
        to: [{ email: recipientEmail }],
        subject,
        text,
        category: "registration-otp",
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      logger.error("auth.otp", "Mailtrap rejected the OTP email request.", {
        recipientEmail: maskEmail(recipientEmail),
        status: response.status,
        details: details.slice(0, 500),
      });
      throw new HttpError(502, `Mailtrap could not send the OTP. ${details || "Please try again."}`.trim());
    }

    logger.info("auth.otp", "OTP email sent successfully through Mailtrap.", {
      recipientEmail: maskEmail(recipientEmail),
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    logger.error("auth.otp", "Unexpected Mailtrap email delivery error.", {
      recipientEmail: maskEmail(recipientEmail),
      error: error instanceof Error ? error.message : "unknown-error",
    });
    throw new HttpError(502, "Mailtrap could not send the OTP. Please try again.");
  }
}

export async function requestRegistrationOtp(
  input: {
    name: string;
    identifier: string;
    password: string;
    role: RegistrationOtpRole;
  },
) {
  const identifier = normalizeAuthIdentifier(input.identifier);
  await ensureIdentifierIsAvailable(identifier);

  const existingOtpRequest = await RegistrationOtpModel.findOne({ identifier: identifier.value });
  if (existingOtpRequest && existingOtpRequest.lastSentAt.getTime() + (env.OTP_RESEND_COOLDOWN_SECONDS * 1000) > Date.now()) {
    throw new HttpError(429, `Please wait ${env.OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP.`);
  }

  const otp = generateRegistrationOtp();
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  await RegistrationOtpModel.findOneAndUpdate(
    { identifier: identifier.value },
    {
      $set: {
        name: input.name,
        identifier: identifier.value,
        identifierType: identifier.type,
        role: input.role,
        passwordHash,
        otpHash: hashRegistrationOtp(otp),
        attempts: 0,
        expiresAt,
        lastSentAt: now,
      },
    },
    {
      upsert: true,
      new: true,
    },
  );

  const delivery: RegistrationOtpDelivery = {
    channel: identifier.type,
    maskedDestination: identifier.maskedValue,
    deliveryMode: "preview",
    expiresInMinutes: env.OTP_TTL_MINUTES,
  };

  if (identifier.type === "email") {
    if (getMailtrapConfigIssues().length === 0) {
      await sendMailtrapMessage(
        "Your Photorido verification OTP",
        `Your Photorido OTP is ${otp}. It expires in ${env.OTP_TTL_MINUTES} minutes.`,
        identifier.value,
      );

      delivery.deliveryMode = "mailtrap-email";
      return delivery;
    }

    if (env.NODE_ENV === "production") {
      logger.error("auth.otp", "Email OTP delivery is unavailable in production.", {
        identifier: identifier.maskedValue,
        missingConfig: getMailtrapConfigIssues(),
      });
      throw new HttpError(503, "Email OTP delivery is not configured.");
    }

    logger.warn("auth.otp", "Falling back to preview OTP for email registration.", {
      identifier: identifier.maskedValue,
      missingConfig: getMailtrapConfigIssues(),
    });
    delivery.previewOtp = otp;
    return delivery;
  }

  if (env.OTP_MOBILE_TEST_RECIPIENT_EMAIL && getMailtrapConfigIssues().length === 0) {
    await sendMailtrapMessage(
      `Photorido mobile OTP for ${identifier.value}`,
      `Registration OTP for ${identifier.value}: ${otp}. It expires in ${env.OTP_TTL_MINUTES} minutes.`,
      env.OTP_MOBILE_TEST_RECIPIENT_EMAIL,
    );

    delivery.deliveryMode = "mailtrap-mobile-fallback";
    return delivery;
  }

  if (env.NODE_ENV === "production") {
    logger.error("auth.otp", "Mobile OTP delivery is unavailable in production.", {
      identifier: identifier.maskedValue,
      hasFallbackRecipient: Boolean(env.OTP_MOBILE_TEST_RECIPIENT_EMAIL),
      missingConfig: getMailtrapConfigIssues(),
    });
    throw new HttpError(503, "Mobile OTP delivery is not configured yet.");
  }

  logger.warn("auth.otp", "Falling back to preview OTP for mobile registration.", {
    identifier: identifier.maskedValue,
    hasFallbackRecipient: Boolean(env.OTP_MOBILE_TEST_RECIPIENT_EMAIL),
    missingConfig: getMailtrapConfigIssues(),
  });
  delivery.previewOtp = otp;
  return delivery;
}

export async function verifyRegistrationOtpAndCreateUser(
  input: {
    identifier: string;
    otp: string;
  },
  request?: Pick<Request, "ip" | "headers">,
) {
  const identifier = normalizeAuthIdentifier(input.identifier);
  const otpRequest = await RegistrationOtpModel.findOne({ identifier: identifier.value });

  if (!otpRequest) {
    throw new HttpError(404, "No registration request was found for this email or mobile number.");
  }

  if (otpRequest.expiresAt.getTime() <= Date.now()) {
    await otpRequest.deleteOne();
    throw new HttpError(400, "This OTP has expired. Please request a new one.");
  }

  if (otpRequest.attempts >= env.OTP_MAX_ATTEMPTS) {
    await otpRequest.deleteOne();
    throw new HttpError(429, "Too many invalid OTP attempts. Please request a new OTP.");
  }

  if (!isOtpMatch(input.otp, otpRequest.otpHash)) {
    otpRequest.attempts += 1;
    await otpRequest.save();
    throw new HttpError(400, "Invalid OTP. Please try again.");
  }

  await ensureIdentifierIsAvailable(identifier);

  const user = await UserModel.create({
    name: otpRequest.name,
    email: identifier.value,
    passwordHash: otpRequest.passwordHash,
    role: otpRequest.role as UserRole,
    status: "active",
    profileComplete: true,
    isSeeded: false,
    phoneNumber: identifier.type === "mobile" ? identifier.value : undefined,
  });

  await otpRequest.deleteOne();
  return createSession(user, request);
}

export async function signInWithGoogle(
  input: {
    accessToken: string;
    role?: "vendor" | "user" | null;
  },
  request?: Pick<Request, "ip" | "headers">,
) {
  const accessToken = input.accessToken.trim();
  if (!accessToken) {
    throw new HttpError(400, "Google access token is required.");
  }

  await verifyGoogleAccessToken(accessToken);
  const profile = await fetchGoogleUserInfo(accessToken);

  const [existingByEmail, existingByGoogleId] = await Promise.all([
    UserModel.findOne({ email: profile.email }),
    UserModel.findOne({ googleId: profile.googleId }),
  ]);

  if (existingByEmail && existingByGoogleId && existingByEmail.id !== existingByGoogleId.id) {
    throw new HttpError(
      409,
      "This Google account is already linked to a different user. Please contact support.",
    );
  }

  const user = existingByEmail ?? existingByGoogleId;

  if (!user) {
    const passwordHash = await hashPassword(`google-oauth:${crypto.randomUUID()}`);
    const createdUser = await UserModel.create({
      name: profile.name,
      email: profile.email,
      passwordHash,
      googleId: profile.googleId,
      role: input.role === "vendor" ? "vendor" : "user",
      status: "active",
      profileComplete: Boolean(profile.name && profile.email),
      isSeeded: false,
      avatar: profile.avatar,
      lastLoginAt: new Date(),
    });

    return createSession(createdUser, request);
  }

  if (user.status === "disabled") {
    throw new HttpError(403, "This account has been disabled. Please contact support.");
  }

  if (user.googleId && user.googleId !== profile.googleId) {
    throw new HttpError(409, "This email is already linked to another Google account.");
  }

  let hasChanges = false;

  if (!user.googleId) {
    user.googleId = profile.googleId;
    hasChanges = true;
  }

  if (!user.avatar && profile.avatar) {
    user.avatar = profile.avatar;
    hasChanges = true;
  }

  if (!user.name && profile.name) {
    user.name = profile.name;
    hasChanges = true;
  }

  user.lastLoginAt = new Date();
  user.profileComplete = Boolean(user.name && (user.email || user.phoneNumber));
  hasChanges = true;

  if (hasChanges) {
    await user.save();
  }

  return createSession(user, request);
}

export function sanitizeUser(
  user: Pick<UserDocument, "id" | "name" | "email" | "role" | "status" | "profileComplete" | "avatar" | "phoneNumber" | "location">,
): AuthenticatedUser {
  const rawRole = String(user.role);
  const normalizedRole = USER_ROLES.includes(rawRole as UserRole)
    ? rawRole as UserRole
    : rawRole === "super_admin"
      ? "super-admin"
      : rawRole === "consumer" || rawRole === "customer"
        ? "user"
        : rawRole === "professional"
          ? "vendor"
          : "user";
  const normalizedStatus = user.status === "active" || user.status === "invited" || user.status === "disabled"
    ? user.status
    : "active";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizedRole,
    status: normalizedStatus,
    profileComplete: user.profileComplete,
    avatar: user.avatar || undefined,
    phoneNumber: user.phoneNumber || undefined,
    location: user.location || undefined,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(user: AuthenticatedUser) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: `${env.ACCESS_TOKEN_TTL_HOURS}h`,
    },
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

function createRefreshToken(user: AuthenticatedUser, tokenId: string) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      type: "refresh" as const,
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`,
      jwtid: tokenId,
    },
  );
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildRequestContext(request?: Pick<Request, "ip" | "headers">): RequestContext {
  const forwardedFor = request?.headers?.["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0]
      : undefined;
  const userAgentHeader = request?.headers?.["user-agent"];
  const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader;

  return {
    ipAddress: forwardedIp?.trim() || request?.ip || undefined,
    userAgent: userAgent?.trim() || undefined,
  };
}

async function persistRefreshToken(
  user: AuthenticatedUser,
  refreshToken: string,
  tokenId: string,
  request?: Pick<Request, "ip" | "headers">,
) {
  const context = buildRequestContext(request);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    userId: user.id,
    tokenId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
  });
}

export async function createSession(user: UserDocument, request?: Pick<Request, "ip" | "headers">) {
  const safeUser = sanitizeUser(user);
  const token = createAccessToken(safeUser);
  const refreshTokenId = crypto.randomUUID();
  const refreshToken = createRefreshToken(safeUser, refreshTokenId);

  await persistRefreshToken(safeUser, refreshToken, refreshTokenId, request);

  return {
    user: safeUser,
    token,
    refreshToken,
    refreshTokenId,
  } satisfies AuthSession;
}

export function extractRefreshTokenFromRequest(request: Request) {
  return (request as Request & { cookies?: Record<string, string> }).cookies?.[env.REFRESH_COOKIE_NAME] ?? null;
}

export async function revokeRefreshToken(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await RefreshTokenModel.findOneAndUpdate(
      {
        userId: payload.sub,
        tokenId: payload.jti,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  } catch {
    // Ignore invalid refresh tokens during logout and best-effort cleanup.
  }
}

export async function refreshSession(refreshToken: string, request?: Pick<Request, "ip" | "headers">) {
  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, "Invalid or expired refresh token.");
  }

  const existingToken = await RefreshTokenModel.findOne({
    userId: payload.sub,
    tokenId: payload.jti,
  });

  if (!existingToken) {
    throw new HttpError(401, "Refresh token is not recognized.");
  }

  if (existingToken.revokedAt || existingToken.expiresAt.getTime() <= Date.now()) {
    throw new HttpError(401, "Refresh token is no longer valid.");
  }

  if (existingToken.tokenHash !== hashToken(refreshToken)) {
    throw new HttpError(401, "Refresh token validation failed.");
  }

  const user = await UserModel.findById(payload.sub);
  if (!user || user.status === "disabled") {
    existingToken.revokedAt = new Date();
    await existingToken.save();
    throw new HttpError(401, "Your session is no longer valid.");
  }

  const nextSession = await createSession(user, request);
  existingToken.revokedAt = new Date();
  existingToken.replacedByTokenId = nextSession.refreshTokenId;
  await existingToken.save();

  return nextSession;
}

export function buildAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: env.ACCESS_TOKEN_TTL_HOURS * 60 * 60 * 1000,
  };
}

export function buildRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}



