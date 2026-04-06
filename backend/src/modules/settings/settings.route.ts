import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { UserSettingsModel } from "../../models/user-setting.model.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";

const settingsRouter = Router();

const settingsSchema = z.object({
  theme: z.enum(["light", "system"]).optional(),
  language: z.string().trim().min(2).max(20).optional(),
  timezone: z.string().trim().min(2).max(80).optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  bookingAlerts: z.boolean().optional(),
  messageAlerts: z.boolean().optional(),
  reviewAlerts: z.boolean().optional(),
  profileVisible: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhoneNumber: z.boolean().optional(),
  allowDirectMessages: z.boolean().optional(),
  instantBooking: z.boolean().optional(),
  moderationAlerts: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  favoriteAlerts: z.boolean().optional(),
  digestFrequency: z.enum(["instant", "daily", "weekly"]).optional(),
}).refine((value) => Object.values(value).some((entry) => entry !== undefined), {
  message: "At least one setting field is required.",
});

function ensureAuthUser(request: AuthenticatedRequest) {
  if (!request.authUser) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.authUser;
}

async function ensureSettings(userId: string) {
  let settings = await UserSettingsModel.findOne({ userId });
  if (!settings) {
    settings = await UserSettingsModel.create({ userId });
  }

  return settings;
}

settingsRouter.use(requireAuth);

settingsRouter.get(
  "/me",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const settings = await ensureSettings(authUser.id);

    response.status(200).json({
      success: true,
      data: {
        settings,
      },
    });
  }),
);

settingsRouter.patch(
  "/me",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const updates = settingsSchema.parse(request.body);
    const settings = await ensureSettings(authUser.id);

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        (settings as unknown as Record<string, unknown>)[key] = value;
      }
    });

    await settings.save();

    response.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      data: {
        settings,
      },
    });
  }),
);

export { settingsRouter };
