import { Router } from "express";
import { z } from "zod";
import { authorizePermissions, requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { BOOKING_STATUSES, MarketplaceBookingModel } from "../../models/booking.model.js";
import { MarketplaceReviewModel } from "../../models/review.model.js";
import { SUPPORT_TICKET_STATUSES, SupportTicketModel, type SupportTicketDocument } from "../../models/support-ticket.model.js";
import { UserModel, type UserRole } from "../../models/user.model.js";
import { VENDOR_PROFILE_STATUSES, VendorProfileModel } from "../../models/vendor-profile.model.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import {
  NOTIFICATION_TARGET_PATHS,
  createUserNotification,
  serializeBooking,
  serializeMarketplaceListing,
  serializeReview,
} from "../marketplace/marketplace.service.js";

const operationsRouter = Router();

const vendorStatusSchema = z.object({
  status: z.enum(VENDOR_PROFILE_STATUSES),
  note: z.string().trim().max(1000).optional(),
  requestedDocuments: z.array(z.string().trim().min(1).max(120)).max(12).optional().default([]),
  documentRequestMessage: z.string().trim().max(1000).optional().default(""),
  requestDocuments: z.boolean().optional().default(false),
});

const bookingWorkflowSchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().trim().min(1).optional(),
  note: z.string().trim().max(1000).optional().default(""),
  escalate: z.boolean().optional().default(false),
  resolveEscalation: z.boolean().optional().default(false),
  deescalate: z.boolean().optional().default(false),
  reopenEscalation: z.boolean().optional().default(false),
  cancelReschedule: z.boolean().optional().default(false),
}).refine((value) => Boolean(
  value.status ||
  value.date ||
  value.time ||
  value.note ||
  value.escalate ||
  value.resolveEscalation ||
  value.deescalate ||
  value.reopenEscalation ||
  value.cancelReschedule,
), {
  message: "At least one booking workflow field is required.",
});

const ticketCreateSchema = z.object({
  linkedUserId: z.string().trim().optional().default(""),
  issueTitle: z.string().trim().min(2).max(160),
  description: z.string().trim().min(3).max(2000),
  status: z.enum(SUPPORT_TICKET_STATUSES).optional().default("open"),
  assignedToUserId: z.string().trim().optional().default(""),
});

const ticketUpdateSchema = z.object({
  linkedUserId: z.string().trim().optional(),
  issueTitle: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().min(3).max(2000).optional(),
  status: z.enum(SUPPORT_TICKET_STATUSES).optional(),
  assignedToUserId: z.string().trim().optional(),
  note: z.string().trim().max(1000).optional().default(""),
  escalate: z.boolean().optional(),
  deescalate: z.boolean().optional(),
  reopen: z.boolean().optional(),
  close: z.boolean().optional(),
}).refine((value) => Object.values(value).some((entry) => entry !== undefined), {
  message: "At least one ticket field is required.",
});

const reviewModerationSchema = z.object({
  action: z.enum(["hide", "remove", "restore", "warn", "reverse-warning", "escalate-ban", "approve-ban", "reject-ban", "lift-ban"]),
  note: z.string().trim().max(1000).optional().default(""),
}).superRefine((value, context) => {
  if ((value.action === "warn" || value.action === "escalate-ban") && value.note.length < 2) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A moderation note is required for warnings and ban escalations.",
      path: ["note"],
    });
  }
});

const mediaModerationSchema = z.object({
  listingId: z.string().trim().min(1),
  url: z.string().trim().optional().default(""),
  action: z.enum(["hide", "remove", "warn", "reverse-warning", "escalate-ban", "approve-ban", "reject-ban", "lift-ban"]),
  note: z.string().trim().max(1000).optional().default(""),
}).superRefine((value, context) => {
  if ((value.action === "warn" || value.action === "escalate-ban") && value.note.length < 2) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A moderation note is required for warnings and ban escalations.",
      path: ["note"],
    });
  }
});

function ensureAuthUser(request: AuthenticatedRequest) {
  if (!request.authUser) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.authUser;
}

function serializeTicket(ticket: SupportTicketDocument) {
  return {
    id: ticket.id,
    linkedUserId: ticket.linkedUserId ?? "",
    linkedUserName: ticket.linkedUserName ?? "",
    linkedUserRole: ticket.linkedUserRole ?? "",
    assignedToUserId: ticket.assignedToUserId ?? "",
    assignedToName: ticket.assignedToName ?? "",
    issueTitle: ticket.issueTitle,
    description: ticket.description,
    status: ticket.status,
    resolutionNote: ticket.resolutionNote ?? "",
    activityHistory: (ticket.activityHistory ?? []).map((entry) => ({
      type: entry.type,
      note: entry.note,
      createdAt: entry.createdAt.toISOString(),
      createdByName: entry.createdByName ?? "",
    })),
    escalatedAt: ticket.escalatedAt ? ticket.escalatedAt.toISOString() : null,
    resolvedAt: ticket.resolvedAt ? ticket.resolvedAt.toISOString() : null,
    closedAt: ticket.closedAt ? ticket.closedAt.toISOString() : null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

async function resolveLinkedUser(userId?: string) {
  if (!userId) {
    return null;
  }

  return UserModel.findById(userId).select("name role");
}

function isUserRole(value: unknown): value is UserRole {
  return (
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
  );
}

async function notifyOperationalRoles(roles: UserRole[], message: string, targetPath = "/dashboard") {
  const users = await UserModel.find({ role: { $in: roles }, status: "active" }).select("_id role");
  await Promise.all(
    users.map((user) => createUserNotification(user.id, user.role, message, { targetPath })),
  );
}

async function notifyAssignedUser(userId: string | undefined, message: string) {
  if (!userId) {
    return;
  }

  const user = await UserModel.findById(userId).select("_id role status");
  if (!user || user.status !== "active") {
    return;
  }

  await createUserNotification(user.id, user.role, message, {
    targetPath: "/dashboard?tab=tickets",
  });
}

async function notifyLinkedUser(ticket: SupportTicketDocument, message: string) {
  if (!ticket.linkedUserId || !isUserRole(ticket.linkedUserRole)) {
    return;
  }

  await createUserNotification(ticket.linkedUserId, ticket.linkedUserRole, message, {
    targetPath: "/dashboard?tab=settings",
  });
}

operationsRouter.use(requireAuth);

operationsRouter.get(
  "/support-tickets",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const isSelfServiceRequest = authUser.role === "user" || authUser.role === "vendor";
    const isReadOnlyMonitor = authUser.role === "admin" || authUser.role === "super-admin";

    if (!isSelfServiceRequest && !isReadOnlyMonitor) {
      await new Promise<void>((resolve, reject) => {
        authorizePermissions("view_support_tickets", "update_support_status", "escalate_support_issue")(
          request,
          response,
          (error?: unknown) => {
            if (error) reject(error);
            else resolve();
          },
        );
      });
    }

    const query = isSelfServiceRequest ? { linkedUserId: authUser.id } : {};
    const tickets = await SupportTicketModel.find(query).sort({ updatedAt: -1, createdAt: -1 }).limit(500);
    response.status(200).json({
      success: true,
      data: tickets.map((ticket) => serializeTicket(ticket)),
    });
  }),
);

operationsRouter.post(
  "/support-tickets",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const input = ticketCreateSchema.parse(request.body);
    const isSelfServiceRequest = authUser.role === "user" || authUser.role === "vendor";
    const [linkedUser, assignedUser] = await Promise.all([
      resolveLinkedUser(isSelfServiceRequest ? authUser.id : input.linkedUserId),
      resolveLinkedUser(isSelfServiceRequest ? "" : input.assignedToUserId),
    ]);

    const ticket = await SupportTicketModel.create({
      linkedUserId: linkedUser?.id,
      linkedUserName: linkedUser?.name,
      linkedUserRole: linkedUser?.role,
      assignedToUserId: isSelfServiceRequest ? undefined : assignedUser?.id || authUser.id,
      assignedToName: isSelfServiceRequest ? undefined : assignedUser?.name || authUser.name,
      issueTitle: input.issueTitle,
      description: input.description,
      status: isSelfServiceRequest ? "open" : input.status,
      createdByUserId: authUser.id,
      updatedByUserId: authUser.id,
    });

    await Promise.all([
      notifyLinkedUser(ticket, `Support ticket created: ${ticket.issueTitle}`),
      notifyOperationalRoles(
        ["support_executive", "staff", "admin", "super-admin"],
        `${ticket.linkedUserName || authUser.name} created a support ticket: ${ticket.issueTitle}`,
        "/dashboard?tab=tickets",
      ),
    ]);

    response.status(201).json({
      success: true,
      message: "Support ticket created.",
      data: serializeTicket(ticket),
    });
  }),
);

operationsRouter.patch(
  "/support-tickets/:ticketId",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    if (authUser.role !== "super-admin") {
      await new Promise<void>((resolve, reject) => {
        authorizePermissions("update_support_status", "escalate_support_issue")(
          request,
          response,
          (error?: unknown) => {
            if (error) reject(error);
            else resolve();
          },
        );
      });
    }

    const input = ticketUpdateSchema.parse(request.body);
    const ticket = await SupportTicketModel.findById(request.params.ticketId);
    if (!ticket) {
      throw new HttpError(404, "Support ticket not found.");
    }

    if (input.linkedUserId !== undefined) {
      const linkedUser = await resolveLinkedUser(input.linkedUserId);
      ticket.linkedUserId = linkedUser?.id;
      ticket.linkedUserName = linkedUser?.name;
      ticket.linkedUserRole = linkedUser?.role;
    }

    if (input.assignedToUserId !== undefined) {
      const assignedUser = await resolveLinkedUser(input.assignedToUserId);
      ticket.assignedToUserId = assignedUser?.id || authUser.id;
      ticket.assignedToName = assignedUser?.name || authUser.name;
    }

    if (input.issueTitle !== undefined) ticket.issueTitle = input.issueTitle;
    if (input.description !== undefined) ticket.description = input.description;
    if (input.reopen) {
      ticket.status = "open";
      ticket.resolvedAt = null;
      ticket.closedAt = null;
    }
    if (input.close) {
      ticket.status = "closed";
      ticket.closedAt = new Date();
    }
    if (input.status !== undefined) {
      ticket.status = input.status;
      if (input.status === "resolved") {
        ticket.resolvedAt = new Date();
        ticket.escalatedAt = null;
        ticket.resolutionNote = input.note || ticket.resolutionNote || "Ticket resolved.";
      }
      if (input.status === "closed") {
        ticket.closedAt = new Date();
      }
      if (input.status === "open" || input.status === "in-progress") {
        ticket.resolvedAt = null;
        ticket.closedAt = null;
      }
    }
    if (input.escalate) ticket.escalatedAt = new Date();
    if (input.deescalate) ticket.escalatedAt = null;
    if (input.note) {
      ticket.resolutionNote = input.note;
    }
    ticket.updatedByUserId = authUser.id;

    const updates: string[] = [`status is ${ticket.status}`];
    if (input.assignedToUserId !== undefined) updates.push(`assigned to ${ticket.assignedToName || authUser.name}`);
    if (input.escalate) updates.push("escalated");
    if (input.deescalate) updates.push("de-escalated");
    if (input.reopen) updates.push("reopened");
    if (input.close) updates.push("closed");
    if (input.note) updates.push("note added");

    ticket.activityHistory = [
      ...(ticket.activityHistory ?? []),
      {
        type: input.escalate
          ? "escalation"
          : input.deescalate
            ? "de-escalation"
            : input.status === "resolved"
              ? "resolution"
              : input.close
                ? "closed"
                : input.reopen
                  ? "reopened"
                  : "update",
        note: input.note || `Support ticket ${updates.join(", ")}.`,
        createdAt: new Date(),
        createdByUserId: authUser.id,
        createdByName: authUser.name,
      },
    ];
    await ticket.save();

    await Promise.all([
      notifyLinkedUser(ticket, `Support ticket updated: ${ticket.issueTitle} ${updates.join(", ")}.`),
      notifyAssignedUser(ticket.assignedToUserId, `Support ticket assigned/updated: ${ticket.issueTitle}.`),
      input.escalate
        ? notifyOperationalRoles(["support_executive", "staff", "admin", "super-admin"], `Support ticket escalated: ${ticket.issueTitle}`, "/dashboard?tab=support-escalations")
        : Promise.resolve(),
    ]);

    response.status(200).json({
      success: true,
      message: "Support ticket updated.",
      data: serializeTicket(ticket),
    });
  }),
);

operationsRouter.post(
  "/vendors/:listingId/status",
  authorizePermissions("verify_vendor", "reject_vendor", "request_vendor_documents", "change_verification_status"),
  asyncHandler(async (request, response) => {
    const input = vendorStatusSchema.parse(request.body);
    const profile = await VendorProfileModel.findById(request.params.listingId);
    if (!profile) {
      throw new HttpError(404, "Vendor profile not found.");
    }

    profile.status = input.status;
    profile.verificationNote = input.note;
    profile.verificationStatusChangedAt = new Date();

    if (input.requestDocuments) {
      profile.documentsRequestedAt = new Date();
      profile.documentsSubmittedAt = null;
      profile.requestedDocuments = input.requestedDocuments;
      profile.documentRequestMessage = input.documentRequestMessage;
      profile.verificationNote =
        input.documentRequestMessage ||
        input.note ||
        (input.requestedDocuments.length > 0
          ? `Please upload: ${input.requestedDocuments.join(", ")}.`
          : "Additional documents requested.");
      profile.status = "pending";
    } else if (input.status === "approved" || input.status === "rejected") {
      profile.documentsRequestedAt = null;
      profile.documentsSubmittedAt = null;
      profile.requestedDocuments = [];
      profile.documentRequestMessage = "";
    }

    await profile.save();

    const message = input.requestDocuments
      ? `Additional documents requested for ${profile.title}. ${profile.verificationNote || "Please update your profile documents."}`
      : input.status === "approved"
        ? `Your profile ${profile.title} was approved and is now visible in the marketplace.`
        : `Your profile ${profile.title} was rejected. ${input.note || "Please review the verification note."}`;

    await createUserNotification(profile.vendorId, "vendor", message, {
      targetPath: NOTIFICATION_TARGET_PATHS.listings,
    });

    if (input.requestDocuments) {
      await notifyOperationalRoles(
        ["vendor_verification_officer", "super-admin"],
        `Document request opened for ${profile.vendorName}: ${profile.title}.`,
        "/dashboard?tab=verification-requests",
      );
    }

    response.status(200).json({
      success: true,
      message: "Vendor verification status updated.",
      data: serializeMarketplaceListing(profile),
    });
  }),
);

operationsRouter.post(
  "/bookings/:bookingId/workflow",
  authorizePermissions("reassign_booking_status", "reschedule_booking", "escalate_booking_issue"),
  asyncHandler(async (request, response) => {
    const input = bookingWorkflowSchema.parse(request.body);
    const booking = await MarketplaceBookingModel.findById(request.params.bookingId);
    if (!booking) {
      throw new HttpError(404, "Booking not found.");
    }

    if (input.status) {
      booking.status = input.status;
      if (input.status === "completed") {
        booking.completedAt = new Date();
      }
      if (input.status !== "completed") {
        booking.completedAt = null;
      }
      if (input.status === "cancelled" || input.status === "completed") {
        booking.escalatedAt = null;
        booking.rescheduledAt = null;
      }
    }
    if (input.date) {
      booking.date = input.date;
      booking.rescheduledAt = new Date();
      booking.rescheduleResolvedAt = null;
      booking.status = "pending";
      booking.paymentRequested = false;
      booking.withdrawalRequested = false;
    }
    if (input.time) {
      booking.time = input.time;
      booking.rescheduledAt = new Date();
      booking.rescheduleResolvedAt = null;
      booking.status = "pending";
      booking.paymentRequested = false;
      booking.withdrawalRequested = false;
    }
    if (input.note) booking.operationsNote = input.note;
    const historyType = input.date || input.time
      ? "reschedule"
      : input.escalate || input.reopenEscalation
        ? "escalation"
        : input.resolveEscalation || input.deescalate
          ? "escalation-resolution"
          : input.status
            ? "status"
            : input.note
              ? "note"
              : "";
    if (input.note || historyType) {
      booking.activityHistory = [
        ...(booking.activityHistory ?? []),
        {
          type: historyType || "note",
          note: input.note || `Booking Coordinator Update: ${historyType.replaceAll("-", " ")}`,
          createdAt: new Date(),
        },
      ];
    }
    if (input.escalate || input.reopenEscalation) {
      booking.escalatedAt = new Date();
      booking.escalationResolvedAt = null;
    }
    if (input.resolveEscalation || input.deescalate) {
      booking.escalatedAt = null;
      booking.escalationResolvedAt = new Date();
    }
    if (input.cancelReschedule) {
      booking.rescheduledAt = null;
      booking.rescheduleResolvedAt = new Date();
    }
    await booking.save();

    const workflowMessages: string[] = [];
    if (input.status) workflowMessages.push(`status changed to ${input.status.replaceAll("_", " ")}`);
    if (input.date || input.time) workflowMessages.push(`rescheduled${input.note ? ` - ${input.note}` : ""}`);
    if (input.escalate || input.reopenEscalation) workflowMessages.push("escalated for operations review");
    if (input.resolveEscalation) workflowMessages.push("escalation resolved");
    if (input.deescalate) workflowMessages.push("escalation de-escalated");
    if (input.cancelReschedule) workflowMessages.push("reschedule workflow cancelled");

    if (workflowMessages.length > 0) {
      const message = `Booking Coordinator Update for ${booking.listingName}: ${workflowMessages.join(", ")}.`;
      await Promise.all([
        createUserNotification(booking.userId, "user", message, { targetPath: NOTIFICATION_TARGET_PATHS.bookings }),
        createUserNotification(booking.vendorId, "vendor", message, { targetPath: NOTIFICATION_TARGET_PATHS.bookings }),
        input.escalate || input.reopenEscalation
          ? notifyOperationalRoles(["booking_coordinator", "staff", "super-admin"], message, "/dashboard?tab=booking-escalations")
          : Promise.resolve(),
      ]);
    }

    response.status(200).json({
      success: true,
      message: "Booking workflow updated.",
      data: serializeBooking(booking),
    });
  }),
);

operationsRouter.post(
  "/reviews/:reviewId/moderation",
  authorizePermissions("moderate_reviews", "hide_content", "remove_content", "warn_accounts", "escalate_ban_requests"),
  asyncHandler(async (request, response) => {
    const input = reviewModerationSchema.parse(request.body);
    const review = await MarketplaceReviewModel.findById(request.params.reviewId);
    if (!review) {
      throw new HttpError(404, "Review not found.");
    }

    if (input.action === "hide") review.moderationStatus = "hidden";
    if (input.action === "remove") review.moderationStatus = "removed";
    if (input.action === "restore") review.moderationStatus = "active";
    if (input.action === "warn") {
      review.warnedAt = new Date();
      review.moderationNote = input.note;
    }
    if (input.action === "reverse-warning") {
      review.warnedAt = null;
      review.moderationNote = "";
    }
    if (input.action === "escalate-ban") {
      review.banEscalatedAt = new Date();
      review.moderationNote = input.note;
    }
    if (input.action === "approve-ban") {
      review.banEscalatedAt = null;
      await UserModel.findByIdAndUpdate(review.userId, { $set: { status: "disabled" } });
    }
    if (input.action === "reject-ban" || input.action === "lift-ban") {
      review.banEscalatedAt = null;
      review.moderationNote = "";
      await UserModel.findByIdAndUpdate(review.userId, { $set: { status: "active" } });
    }
    if (input.note) review.moderationNote = input.note;
    await review.save();

    const moderationMessage = `Review on ${review.listingName}: ${input.action.replaceAll("-", " ")}${input.note ? ` - ${input.note}` : ""}.`;
    await Promise.all([
      createUserNotification(review.userId, "user", moderationMessage, { targetPath: NOTIFICATION_TARGET_PATHS.reviews }),
      createUserNotification(review.vendorId, "vendor", moderationMessage, { targetPath: NOTIFICATION_TARGET_PATHS.reviews }),
      input.action === "escalate-ban"
        ? notifyOperationalRoles(["content_moderator", "super-admin"], moderationMessage, "/dashboard?tab=ban-requests")
        : Promise.resolve(),
    ]);

    response.status(200).json({
      success: true,
      message: "Review moderation updated.",
      data: serializeReview(review),
    });
  }),
);

operationsRouter.post(
  "/media/moderation",
  authorizePermissions("moderate_uploaded_media", "hide_content", "remove_content", "warn_accounts", "escalate_ban_requests"),
  asyncHandler(async (request, response) => {
    const input = mediaModerationSchema.parse(request.body);
    const profile = await VendorProfileModel.findById(input.listingId);
    if (!profile) {
      throw new HttpError(404, "Vendor profile not found.");
    }

    if (input.action === "remove" && input.url) {
      profile.portfolioImages = profile.portfolioImages.filter((image) => image !== input.url);
      profile.albums = profile.albums.map((album) => ({
        ...album,
        images: album.images.filter((image) => image !== input.url),
      }));
      if (profile.featuredImage === input.url && profile.portfolioImages[0]) {
        profile.featuredImage = profile.portfolioImages[0];
      }
    }

    if (input.action === "hide") {
      profile.status = "rejected";
    }

    if (input.action === "warn") {
      profile.mediaWarnedAt = new Date();
      profile.mediaModerationNote = input.note;
    }

    if (input.action === "reverse-warning") {
      profile.mediaWarnedAt = null;
      profile.mediaModerationNote = profile.mediaBanEscalatedAt ? profile.mediaModerationNote : "";
    }

    if (input.action === "escalate-ban") {
      profile.mediaBanEscalatedAt = new Date();
      profile.mediaModerationNote = input.note;
    }

    if (input.action === "approve-ban") {
      profile.mediaBanEscalatedAt = null;
      profile.mediaModerationNote = input.note || "Vendor account disabled after media moderation review.";
      await UserModel.findByIdAndUpdate(profile.vendorId, { $set: { status: "disabled" } });
    }

    if (input.action === "reject-ban" || input.action === "lift-ban") {
      profile.mediaBanEscalatedAt = null;
      profile.mediaModerationNote = profile.mediaWarnedAt ? profile.mediaModerationNote : "";
      await UserModel.findByIdAndUpdate(profile.vendorId, { $set: { status: "active" } });
    }

    if (input.action !== "warn" && input.action !== "reverse-warning" && input.action !== "escalate-ban" && input.action !== "lift-ban") {
      profile.mediaModerationNote = input.note || `${input.action.replaceAll("-", " ")} requested for uploaded media.`;
    }
    profile.verificationStatusChangedAt = new Date();
    await profile.save();

    await createUserNotification(
      profile.vendorId,
      "vendor",
      `Media moderation on ${profile.title}: ${input.action.replaceAll("-", " ")}${input.note ? ` - ${input.note}` : ""}.`,
      { targetPath: NOTIFICATION_TARGET_PATHS.listings },
    );

    if (input.action === "escalate-ban") {
      await notifyOperationalRoles(
        ["content_moderator", "super-admin"],
        `Ban review requested for ${profile.vendorName}: ${profile.title}.`,
        "/dashboard?tab=ban-requests",
      );
    }

    response.status(200).json({
      success: true,
      message: "Media moderation updated.",
      data: serializeMarketplaceListing(profile),
    });
  }),
);

export { operationsRouter };
