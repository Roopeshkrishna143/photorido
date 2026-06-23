import { Router } from "express";
import { z } from "zod";
import { authorizePermissions, authorizeRoles, requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { MarketplaceBookingModel, type BookingStatus, type MarketplaceBookingDocument } from "../../models/booking.model.js";
import { MarketplaceConversationModel } from "../../models/conversation.model.js";
import { MarketplaceMessageModel } from "../../models/message.model.js";
import { MarketplaceReviewModel } from "../../models/review.model.js";
import { UserModel } from "../../models/user.model.js";
import { VendorProfileModel } from "../../models/vendor-profile.model.js";
import { normalizeAuthIdentifier } from "../auth/auth.service.js";
import { emitConversationChanged } from "../../realtime/socket.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import {
  buildBookingCreatedNotifications,
  buildBookingStatusMessage,
  buildPaginationMeta,
  createUserNotification,
  NOTIFICATION_TARGET_PATHS,
  notifyAllSuperAdmins,
  parsePagination,
  serializeBooking,
} from "./marketplace.service.js";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDateOnlyValue(value: string, fieldLabel: string) {
  const normalized = value.trim().slice(0, 10);

  if (!DATE_ONLY_PATTERN.test(normalized)) {
    throw new HttpError(400, `${fieldLabel} must use YYYY-MM-DD format.`);
  }

  return normalized;
}

const bookingCreateSchema = z.object({
  userName: z.string().trim().min(1, "User name is required."),
  userEmail: z.string().trim().min(1).optional(),
  userPhoneNumber: z.string().trim().min(1).optional(),
  vendorName: z.string().trim().optional().default(""),
  photographerId: z.string().trim().min(1, "Profile is required."),
  listingName: z.string().trim().min(1, "Listing name is required."),
  eventType: z.string().trim().min(1, "Event type is required."),
  location: z.string().trim().min(1, "Location is required."),
  date: z
    .string()
    .trim()
    .min(1, "Booking date is required.")
    .transform((value) => normalizeDateOnlyValue(value, "Booking date")),
  time: z.string().trim().min(1, "Booking time is required."),
  amount: z.string().trim().min(1, "Amount is required."),
  phoneNumber: z.string().trim().min(1).optional(),
}).refine((value) => Boolean(value.userEmail || value.userPhoneNumber || value.phoneNumber), {
  message: "Provide at least one contact field (email or phone number).",
  path: ["userEmail"],
});

const bookingUpdateSchema = z.object({
  eventType: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  date: z
    .string()
    .trim()
    .min(1)
    .transform((value) => normalizeDateOnlyValue(value, "Booking date"))
    .optional(),
  time: z.string().trim().min(1).optional(),
  amount: z.string().trim().min(1).optional(),
  phoneNumber: z.string().trim().min(1).optional(),
  status: z.enum(["pending", "approved_by_vendor", "confirmed", "rejected_by_vendor", "completed", "cancelled"]).optional(),
}).refine((value) => Object.values(value).some((entry) => entry !== undefined), {
  message: "At least one booking field is required.",
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSearchValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureAuthUser(request: AuthenticatedRequest) {
  if (!request.authUser) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.authUser;
}

function normalizeOptionalContactValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function firstContactValue(...values: Array<string | undefined>) {
  for (const value of values) {
    const normalized = normalizeOptionalContactValue(value);
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

async function findUserByBookingIdentifier(identifier: string) {
  const normalizedIdentifier = normalizeOptionalContactValue(identifier);
  if (!normalizedIdentifier) {
    return null;
  }

  const userQueryCandidates: Array<Record<string, unknown>> = [];
  const lowercaseIdentifier = normalizedIdentifier.toLowerCase();

  userQueryCandidates.push({ email: lowercaseIdentifier });

  try {
    const authIdentifier = normalizeAuthIdentifier(normalizedIdentifier);
    if (authIdentifier.type === "mobile") {
      userQueryCandidates.push({ phoneNumber: authIdentifier.value });
      userQueryCandidates.push({ email: authIdentifier.value });
    } else {
      userQueryCandidates.push({ email: authIdentifier.value });
    }
  } catch {
    // Keep fallback email lookup only for non-standard identifiers.
  }

  return UserModel.findOne({
    role: "user",
    $or: userQueryCandidates,
  });
}

function applyBookingStatus(booking: MarketplaceBookingDocument, status: BookingStatus) {
  booking.status = status;

  if (status === "pending") {
    booking.paymentRequested = false;
    booking.withdrawalRequested = false;
    booking.completedAt = null;
    return;
  }

  if (status === "approved_by_vendor") {
    booking.withdrawalRequested = false;
    booking.completedAt = null;
    return;
  }

  if (status === "confirmed") {
    booking.paymentRequested = false;
    booking.withdrawalRequested = false;
    booking.completedAt = null;
    return;
  }

  if (status === "rejected_by_vendor") {
    booking.paymentRequested = false;
    booking.withdrawalRequested = false;
    booking.completedAt = null;
    return;
  }

  if (status === "completed") {
    booking.paymentRequested = false;
    booking.withdrawalRequested = false;
    booking.completedAt = new Date();
    return;
  }

  booking.withdrawalRequested = false;
}

function buildPaymentInterestMessage(booking: MarketplaceBookingDocument) {
  const contactValues = [booking.phoneNumber, booking.userEmail]
    .map((value) => value.trim())
    .filter(Boolean);
  const uniqueContacts = Array.from(new Set(contactValues));
  const contactLine = uniqueContacts.length > 0
    ? uniqueContacts.join(" or ")
    : "the app inbox";

  return [
    `Hi ${booking.vendorName}, I'm interested in your service for ${booking.listingName}.`,
    `Please contact me on ${contactLine}.`,
    `Event: ${booking.eventType}.`,
    `Date: ${booking.date} ${booking.time}.`,
    `Location: ${booking.location}.`,
  ].join(" ");
}

async function appendConversationMessage(
  booking: MarketplaceBookingDocument,
  senderId: string,
  receiverId: string,
  messageText: string,
) {
  let conversation = await MarketplaceConversationModel.findOne({
    userId: booking.userId,
    vendorId: booking.vendorId,
  });

  if (!conversation) {
    conversation = await MarketplaceConversationModel.create({
      userId: booking.userId,
      vendorId: booking.vendorId,
    });
  }

  await MarketplaceMessageModel.create({
    conversationId: conversation.id,
    senderId,
    receiverId,
    message: messageText,
    isRead: false,
  });

  const nextUpdatedAt = new Date();
  await MarketplaceConversationModel.updateOne(
    { _id: conversation.id },
    { $set: { updatedAt: nextUpdatedAt } },
  );

  emitConversationChanged([conversation.userId, conversation.vendorId], conversation.id);
}

export const marketplaceBookingRouter = Router();

marketplaceBookingRouter.use(requireAuth);

marketplaceBookingRouter.get(
  "/bookings",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const page = parsePagination(request.query.page, 1, 500);
    const limit = parsePagination(request.query.limit, 25, 100);
    const skip = (page - 1) * limit;
    const status = normalizeSearchValue(request.query.status);
    const search = normalizeSearchValue(request.query.search);
    const vendorId = normalizeSearchValue(request.query.vendorId);
    const userId = normalizeSearchValue(request.query.userId);
    const query: Record<string, unknown> = {};

    if (authUser.role === "vendor") {
      query.vendorId = authUser.id;
    } else if (authUser.role === "user") {
      query.userId = authUser.id;
    } else {
      if (vendorId) {
        query.vendorId = vendorId;
      }
      if (userId) {
        query.userId = userId;
      }
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { userName: pattern },
        { userEmail: pattern },
        { phoneNumber: pattern },
        { vendorName: pattern },
        { vendorEmail: pattern },
        { listingName: pattern },
        { eventType: pattern },
        { location: pattern },
      ];
    }

    const [bookings, total] = await Promise.all([
      MarketplaceBookingModel.find(query).sort({ updatedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
      MarketplaceBookingModel.countDocuments(query),
    ]);

    response.status(200).json({
      success: true,
      data: bookings.map((booking) => serializeBooking(booking)),
      meta: buildPaginationMeta(page, limit, total),
    });
  }),
);

marketplaceBookingRouter.post(
  "/bookings",
  authorizeRoles("user", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const input = bookingCreateSchema.parse(request.body);
    const profile = await VendorProfileModel.findById(input.photographerId);

    if (!profile) {
      throw new HttpError(404, "Profile not found.");
    }

    if (profile.status !== "approved") {
      throw new HttpError(400, "Bookings can only be created for approved profiles.");
    }

    let userRecord = authUser.role === "user"
      ? await UserModel.findOne({ _id: authUser.id, role: "user" })
      : null;

    if (!userRecord) {
      const identifiersToCheck = [
        input.userEmail,
        input.userPhoneNumber,
        input.phoneNumber,
      ]
        .map((value) => normalizeOptionalContactValue(value))
        .filter(Boolean);

      for (const identifier of identifiersToCheck) {
        userRecord = await findUserByBookingIdentifier(identifier);
        if (userRecord) {
          break;
        }
      }
    }

    if (!userRecord) {
      throw new HttpError(400, "Selected user account was not found.");
    }

    if (authUser.role === "user" && userRecord.id !== authUser.id) {
      throw new HttpError(403, "You can only create bookings for your own account.");
    }

    const resolvedUserEmail = firstContactValue(
      input.userEmail,
      userRecord.email,
      input.userPhoneNumber,
      userRecord.phoneNumber,
    );
    const resolvedPhoneNumber = firstContactValue(
      input.phoneNumber,
      input.userPhoneNumber,
      userRecord.phoneNumber,
      input.userEmail,
      userRecord.email,
    );

    if (!resolvedUserEmail || !resolvedPhoneNumber) {
      throw new HttpError(400, "Unable to resolve booking contact details. Please include email or phone.");
    }

    const vendorRecord = await UserModel.findById(profile.vendorId);
    const booking = await MarketplaceBookingModel.create({
      userId: userRecord.id,
      userName: userRecord.name,
      userEmail: resolvedUserEmail,
      vendorId: profile.vendorId,
      vendorName: profile.vendorName,
      vendorEmail: vendorRecord?.email ?? profile.vendorEmail,
      photographerId: profile.id,
      listingName: input.listingName,
      eventType: input.eventType,
      location: input.location,
      date: input.date,
      time: input.time,
      amount: input.amount,
      phoneNumber: resolvedPhoneNumber,
      status: "pending",
      paymentRequested: false,
      withdrawalRequested: false,
      reviewSubmitted: false,
      reviewId: null,
      completedAt: null,
    });

    const notifications = buildBookingCreatedNotifications(userRecord.name, input.listingName);
    await Promise.all([
      createUserNotification(userRecord.id, "user", notifications.user, {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
      createUserNotification(profile.vendorId, "vendor", notifications.vendor, {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
      notifyAllSuperAdmins(notifications.admin, {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
    ]);

    response.status(201).json({
      success: true,
      message: "Booking created successfully.",
      data: serializeBooking(booking),
    });
  }),
);

marketplaceBookingRouter.patch(
  "/bookings/:bookingId",
  authorizePermissions("manage_bookings", "reassign_booking_status", "reschedule_booking"),
  asyncHandler(async (request, response) => {
    const input = bookingUpdateSchema.parse(request.body);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) {
      throw new HttpError(404, "Booking not found.");
    }

    if (input.eventType !== undefined) booking.eventType = input.eventType;
    if (input.location !== undefined) booking.location = input.location;
    if (input.date !== undefined) booking.date = input.date;
    if (input.time !== undefined) booking.time = input.time;
    if (input.amount !== undefined) booking.amount = input.amount;
    if (input.phoneNumber !== undefined) booking.phoneNumber = input.phoneNumber;
    if (input.status !== undefined) applyBookingStatus(booking, input.status);

    await booking.save();

    if (input.status !== undefined) {
      await Promise.all([
        createUserNotification(booking.userId, "user", buildBookingStatusMessage(input.status), {
          targetPath: NOTIFICATION_TARGET_PATHS.bookings,
        }),
        createUserNotification(booking.vendorId, "vendor", buildBookingStatusMessage(input.status), {
          targetPath: NOTIFICATION_TARGET_PATHS.bookings,
        }),
      ]);
    }

    response.status(200).json({
      success: true,
      message: "Booking updated successfully.",
      data: serializeBooking(booking),
    });
  }),
);

marketplaceBookingRouter.delete(
  "/bookings/:bookingId",
  authorizePermissions("manage_bookings"),
  asyncHandler(async (request, response) => {
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) {
      throw new HttpError(404, "Booking not found.");
    }

    if (booking.reviewId) {
      await MarketplaceReviewModel.findByIdAndDelete(booking.reviewId);
    }

    await booking.deleteOne();

    response.status(200).json({
      success: true,
      message: "Booking deleted successfully.",
    });
  }),
);

marketplaceBookingRouter.post(
  "/bookings/:bookingId/approve",
  authorizeRoles("vendor", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (authUser.role === "vendor" && booking.vendorId !== authUser.id) {
      throw new HttpError(403, "You can only approve your own bookings.");
    }

    applyBookingStatus(booking, "approved_by_vendor");
    if (booking.rescheduledAt && !booking.rescheduleResolvedAt) {
      booking.rescheduleResolvedAt = new Date();
      booking.activityHistory = [
        ...(booking.activityHistory ?? []),
        {
          type: "reschedule-approval",
          note: "Vendor approved the rescheduled booking.",
          createdAt: new Date(),
        },
      ];
    }
    await booking.save();
    await createUserNotification(booking.userId, "user", buildBookingStatusMessage("approved_by_vendor"), {
      targetPath: NOTIFICATION_TARGET_PATHS.bookings,
    });

    response.status(200).json({ success: true, message: "Booking approved successfully.", data: serializeBooking(booking) });
  }),
);

marketplaceBookingRouter.post(
  "/bookings/:bookingId/reject",
  authorizeRoles("vendor", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (authUser.role === "vendor" && booking.vendorId !== authUser.id) {
      throw new HttpError(403, "You can only reject your own bookings.");
    }

    applyBookingStatus(booking, "rejected_by_vendor");
    await booking.save();
    await createUserNotification(booking.userId, "user", buildBookingStatusMessage("rejected_by_vendor"), {
      targetPath: NOTIFICATION_TARGET_PATHS.bookings,
    });

    response.status(200).json({ success: true, message: "Booking rejected successfully.", data: serializeBooking(booking) });
  }),
);

marketplaceBookingRouter.post(
  "/bookings/:bookingId/request-again",
  authorizeRoles("user", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (authUser.role === "user" && booking.userId !== authUser.id) {
      throw new HttpError(403, "You can only update your own bookings.");
    }

    applyBookingStatus(booking, "pending");
    await booking.save();
    await createUserNotification(booking.vendorId, "vendor", `Hey! ${booking.userName} requested this booking again.`, {
      targetPath: NOTIFICATION_TARGET_PATHS.bookings,
    });

    response.status(200).json({ success: true, message: "Booking requested again successfully.", data: serializeBooking(booking) });
  }),
);

marketplaceBookingRouter.post(
  "/bookings/:bookingId/request-payment",
  authorizeRoles("user", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (authUser.role === "user" && booking.userId !== authUser.id) {
      throw new HttpError(403, "You can only update your own bookings.");
    }
    if (booking.status !== "approved_by_vendor") {
      throw new HttpError(400, "Payment can only be requested after vendor approval.");
    }

    booking.paymentRequested = true;
    await booking.save();
    await Promise.all([
      createUserNotification(booking.vendorId, "vendor", `Hey! ${booking.userName} wants to proceed with this booking. Check Messages for contact details.`, {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
      appendConversationMessage(booking, booking.userId, booking.vendorId, buildPaymentInterestMessage(booking)),
    ]);

    response.status(200).json({ success: true, message: "Payment request submitted successfully.", data: serializeBooking(booking) });
  }),
);

marketplaceBookingRouter.post(
  "/bookings/:bookingId/confirm-payment",
  authorizeRoles("vendor", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (authUser.role === "vendor" && booking.vendorId !== authUser.id) {
      throw new HttpError(403, "You can only confirm your own bookings.");
    }
    if (booking.status !== "approved_by_vendor" || !booking.paymentRequested) {
      throw new HttpError(400, "Payment confirmation is not available for this booking yet.");
    }

    applyBookingStatus(booking, "confirmed");
    await booking.save();
    await Promise.all([
      createUserNotification(booking.userId, "user", buildBookingStatusMessage("confirmed"), {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
      createUserNotification(booking.vendorId, "vendor", buildBookingStatusMessage("confirmed"), {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
      appendConversationMessage(booking, booking.vendorId, booking.userId, `Payment received. Your booking for ${booking.listingName} is now confirmed.`),
    ]);

    response.status(200).json({ success: true, message: "Payment confirmed and booking marked as confirmed.", data: serializeBooking(booking) });
  }),
);

marketplaceBookingRouter.post(
  "/bookings/:bookingId/complete",
  authorizeRoles("vendor", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (authUser.role === "vendor" && booking.vendorId !== authUser.id) {
      throw new HttpError(403, "You can only complete your own bookings.");
    }
    if (booking.status !== "confirmed") {
      throw new HttpError(400, "Only confirmed bookings can be marked as completed.");
    }

    applyBookingStatus(booking, "completed");
    await booking.save();
    await Promise.all([
      createUserNotification(booking.userId, "user", buildBookingStatusMessage("completed"), {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
      createUserNotification(booking.vendorId, "vendor", buildBookingStatusMessage("completed"), {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
    ]);

    response.status(200).json({ success: true, message: "Booking completed successfully.", data: serializeBooking(booking) });
  }),
);

marketplaceBookingRouter.post(
  "/bookings/:bookingId/request-withdrawal",
  authorizeRoles("user", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (authUser.role === "user" && booking.userId !== authUser.id) {
      throw new HttpError(403, "You can only update your own bookings.");
    }
    if (booking.status !== "confirmed") {
      throw new HttpError(400, "Withdrawals are only available before a booking is completed.");
    }

    booking.withdrawalRequested = true;
    await booking.save();
    await createUserNotification(booking.vendorId, "vendor", `Hey! ${booking.userName} requested a booking withdrawal.`, {
      targetPath: NOTIFICATION_TARGET_PATHS.bookings,
    });

    response.status(200).json({ success: true, message: "Withdrawal request submitted successfully.", data: serializeBooking(booking) });
  }),
);

marketplaceBookingRouter.post(
  "/bookings/:bookingId/confirm-withdrawal",
  authorizeRoles("vendor", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (authUser.role === "vendor" && booking.vendorId !== authUser.id) {
      throw new HttpError(403, "You can only confirm your own bookings.");
    }
    if (booking.status !== "confirmed" || !booking.withdrawalRequested) {
      throw new HttpError(400, "Withdrawal confirmation is not available for this booking yet.");
    }

    applyBookingStatus(booking, "cancelled");
    await booking.save();
    await Promise.all([
      createUserNotification(booking.userId, "user", buildBookingStatusMessage("cancelled"), {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
      createUserNotification(booking.vendorId, "vendor", buildBookingStatusMessage("cancelled"), {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
    ]);

    response.status(200).json({ success: true, message: "Withdrawal confirmed successfully.", data: serializeBooking(booking) });
  }),
);




