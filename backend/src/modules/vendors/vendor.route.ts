import { Router } from "express";
import { z } from "zod";
import { requireAuth, authorizeRoles, type AuthenticatedRequest } from "../../middleware/auth.js";
import { VendorScheduleModel } from "../../models/vendor-schedule.model.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { buildVendorAnalytics, serializeVendorSchedule } from "../marketplace/marketplace.service.js";

const scheduleSchema = z.object({
  date: z.string().trim().min(1, "Date is required."),
  type: z.enum(["full", "morning", "afternoon"]),
  label: z.string().trim().min(1, "Label is required."),
  timeRange: z.string().trim().min(1, "Time range is required."),
});

const vendorRouter = Router();

vendorRouter.use(requireAuth, authorizeRoles("vendor"));

vendorRouter.get(
  "/me/schedules",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const slots = await VendorScheduleModel.find({ vendorId: request.authUser.id }).sort({ date: 1, createdAt: 1 });
    response.status(200).json({
      success: true,
      data: slots.map((slot) => serializeVendorSchedule(slot)),
    });
  }),
);

vendorRouter.post(
  "/me/schedules",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const input = scheduleSchema.parse(request.body);
    const existing = await VendorScheduleModel.findOne({
      vendorId: request.authUser.id,
      date: input.date,
      type: input.type,
    });

    if (existing) {
      throw new HttpError(409, "This availability slot already exists.");
    }

    const slot = await VendorScheduleModel.create({
      vendorId: request.authUser.id,
      ...input,
    });

    response.status(201).json({
      success: true,
      message: "Availability slot created successfully.",
      data: serializeVendorSchedule(slot),
    });
  }),
);

vendorRouter.patch(
  "/me/schedules/:slotId",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const input = scheduleSchema.parse(request.body);
    const slot = await VendorScheduleModel.findOne({
      _id: request.params.slotId,
      vendorId: request.authUser.id,
    });

    if (!slot) {
      throw new HttpError(404, "Availability slot not found.");
    }

    const duplicate = await VendorScheduleModel.findOne({
      vendorId: request.authUser.id,
      date: input.date,
      type: input.type,
      _id: { $ne: slot.id },
    });

    if (duplicate) {
      throw new HttpError(409, "This availability slot already exists.");
    }

    slot.date = input.date;
    slot.type = input.type;
    slot.label = input.label;
    slot.timeRange = input.timeRange;
    await slot.save();

    response.status(200).json({
      success: true,
      message: "Availability slot updated successfully.",
      data: serializeVendorSchedule(slot),
    });
  }),
);

vendorRouter.delete(
  "/me/schedules/:slotId",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const slot = await VendorScheduleModel.findOne({
      _id: request.params.slotId,
      vendorId: request.authUser.id,
    });

    if (!slot) {
      throw new HttpError(404, "Availability slot not found.");
    }

    await slot.deleteOne();

    response.status(200).json({
      success: true,
      message: "Availability slot deleted successfully.",
    });
  }),
);

vendorRouter.get(
  "/me/analytics",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const listingId = typeof request.query.listingId === "string" && request.query.listingId.trim() !== ""
      ? request.query.listingId
      : "all";
    const range = typeof request.query.range === "string" && request.query.range.trim() !== ""
      ? request.query.range
      : "30d";

    const analytics = await buildVendorAnalytics(request.authUser.id, listingId, range);
    response.status(200).json({
      success: true,
      data: analytics,
    });
  }),
);

export { vendorRouter };
