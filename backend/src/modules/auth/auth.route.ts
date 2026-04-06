import { Router, type Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../../config/env.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { UserModel } from "../../models/user.model.js";
import {
  buildAuthCookieOptions,
  buildRefreshCookieOptions,
  comparePassword,
  createSession,
  extractRefreshTokenFromRequest,
  hashPassword,
  normalizeAuthIdentifier,
  refreshSession,
  requestRegistrationOtp,
  revokeRefreshToken,
  verifyRegistrationOtpAndCreateUser,
} from "./auth.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";

const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const registerRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

const registerVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please try again later.",
  },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many session refresh attempts. Please try again later.",
  },
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  password: z.string().min(1),
  role: z.enum(["super-admin", "vendor", "user"]).optional().nullable(),
}).refine((value) => Boolean(value.identifier || value.email), {
  message: "Email or mobile number is required.",
  path: ["identifier"],
});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  identifier: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  password: z.string().min(8),
  role: z.enum(["vendor", "user"]),
}).refine((value) => Boolean(value.identifier || value.email), {
  message: "Email or mobile number is required.",
  path: ["identifier"],
});

const verifyRegistrationOtpSchema = z.object({
  identifier: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  otp: z.string().trim().length(6, "OTP must be 6 digits."),
}).refine((value) => Boolean(value.identifier || value.email), {
  message: "Email or mobile number is required.",
  path: ["identifier"],
});

const avatarSchema = z.string().trim().min(1).refine(
  (value) => value.startsWith("/uploads/") || z.string().url().safeParse(value).success,
  "Avatar must be a valid image URL or uploaded image path.",
);

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phoneNumber: z.string().trim().min(7).max(20).optional(),
  location: z.string().trim().max(120).optional(),
  avatar: avatarSchema.nullable().optional(),
});

function clearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
  };
}

function setSessionCookies(response: Response, session: Awaited<ReturnType<typeof createSession>>) {
  response.cookie(env.AUTH_COOKIE_NAME, session.token, buildAuthCookieOptions());
  response.cookie(env.REFRESH_COOKIE_NAME, session.refreshToken, buildRefreshCookieOptions());
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function normalizeOptionalAvatar(value: unknown) {
  if (value === null) {
    return null;
  }

  return normalizeOptionalString(value);
}

authRouter.post(
  "/login",
  loginLimiter,
  asyncHandler(async (request, response) => {
    const { identifier: identifierInput, email, password, role } = loginSchema.parse(request.body);
    const identifier = normalizeAuthIdentifier(identifierInput ?? email ?? "");
    const user = identifier.type === "email"
      ? await UserModel.findOne({ email: identifier.value })
      : await UserModel.findOne({
        $or: [
          { phoneNumber: identifier.value },
          { email: identifier.value },
        ],
      });

    if (!user) {
      throw new HttpError(401, "Invalid email/mobile or password.");
    }

    if (user.status === "disabled") {
      throw new HttpError(403, "This account has been disabled. Please contact support.");
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new HttpError(401, "Invalid email/mobile or password.");
    }

    if (role && role !== user.role) {
      throw new HttpError(403, `This account does not belong to the ${role} role.`);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const session = await createSession(user, request);
    setSessionCookies(response, session);

    response.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: session.user,
        token: session.token,
      },
    });
  }),
);

authRouter.post(
  "/register",
  registerRequestLimiter,
  asyncHandler(async (request, response) => {
    const { name, identifier, email, password, role } = registerSchema.parse(request.body);
    const delivery = await requestRegistrationOtp({
      name,
      identifier: identifier ?? email ?? "",
      password,
      role,
    });

    response.status(202).json({
      success: true,
      message: "OTP sent successfully.",
      data: delivery,
    });
  }),
);

authRouter.post(
  "/register/request-otp",
  registerRequestLimiter,
  asyncHandler(async (request, response) => {
    const { name, identifier, email, password, role } = registerSchema.parse(request.body);
    const delivery = await requestRegistrationOtp({
      name,
      identifier: identifier ?? email ?? "",
      password,
      role,
    });

    response.status(202).json({
      success: true,
      message: "OTP sent successfully.",
      data: delivery,
    });
  }),
);

authRouter.post(
  "/register/verify-otp",
  registerVerifyLimiter,
  asyncHandler(async (request, response) => {
    const { identifier, email, otp } = verifyRegistrationOtpSchema.parse(request.body);
    const session = await verifyRegistrationOtpAndCreateUser(
      {
        identifier: identifier ?? email ?? "",
        otp,
      },
      request,
    );

    setSessionCookies(response, session);

    response.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        user: session.user,
        token: session.token,
      },
    });
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (request, response) => {
    const refreshToken = extractRefreshTokenFromRequest(request);
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    response.clearCookie(env.AUTH_COOKIE_NAME, clearCookieOptions());
    response.clearCookie(env.REFRESH_COOKIE_NAME, clearCookieOptions());
    response.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  }),
);

authRouter.post(
  "/refresh",
  refreshLimiter,
  asyncHandler(async (request, response) => {
    const refreshToken = extractRefreshTokenFromRequest(request);
    if (!refreshToken) {
      throw new HttpError(401, "Refresh token is required.");
    }

    const session = await refreshSession(refreshToken, request);
    setSessionCookies(response, session);

    response.status(200).json({
      success: true,
      message: "Session refreshed successfully.",
      data: {
        user: session.user,
        token: session.token,
      },
    });
  }),
);

authRouter.post("/google", (_request, response) => {
  response.status(501).json({
    success: false,
    message: "Google login is not configured yet.",
  });
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    response.status(200).json({
      success: true,
      data: {
        user: request.authUser,
      },
    });
  }),
);

authRouter.patch(
  "/profile",
  requireAuth,
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const updates = profileSchema.parse({
      name: normalizeOptionalString(request.body.name),
      phoneNumber: normalizeOptionalString(request.body.phoneNumber),
      location: normalizeOptionalString(request.body.location),
      avatar: normalizeOptionalAvatar(request.body.avatar),
    });

    if (Object.keys(updates).length === 0) {
      throw new HttpError(400, "Please provide at least one profile field to update.");
    }

    const user = await UserModel.findById(request.authUser?.id);
    if (!user) {
      throw new HttpError(404, "User not found.");
    }

    if (updates.name !== undefined) {
      user.name = updates.name;
    }

    if (updates.phoneNumber !== undefined) {
      user.phoneNumber = updates.phoneNumber;
    }

    if (updates.location !== undefined) {
      user.location = updates.location;
    }

    if (updates.avatar !== undefined) {
      user.avatar = updates.avatar ?? undefined;
    }

    user.profileComplete = Boolean(user.name && user.email);
    await user.save();

    const currentRefreshToken = extractRefreshTokenFromRequest(request);
    if (currentRefreshToken) {
      await revokeRefreshToken(currentRefreshToken);
    }

    const session = await createSession(user, request);
    setSessionCookies(response, session);

    response.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: session.user,
        token: session.token,
      },
    });
  }),
);

export { authRouter };
