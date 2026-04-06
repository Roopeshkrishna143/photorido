import { Router } from "express";
import { z } from "zod";
import { authorizeRoles, requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { MarketplaceConversationModel } from "../../models/conversation.model.js";
import { MarketplaceMessageModel } from "../../models/message.model.js";
import { UserModel } from "../../models/user.model.js";
import { VendorProfileModel } from "../../models/vendor-profile.model.js";
import { emitConversationChanged, emitConversationRead } from "../../realtime/socket.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import {
  buildConversationPayload,
  buildConversationPayloads,
  buildUnreadMessageCount,
  serializeConversationMessage,
} from "./marketplace-conversation.service.js";

const startConversationSchema = z.object({
  vendorId: z.string().trim().optional(),
  photographerId: z.string().trim().optional(),
}).refine((value) => Boolean(value.vendorId || value.photographerId), {
  message: "Vendor or photographer id is required.",
});

const messageSchema = z.object({
  text: z.string().trim().min(1, "Message is required.").max(2000, "Message is too long."),
});

function ensureAuthUser(request: AuthenticatedRequest) {
  if (!request.authUser) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.authUser;
}

function getConversationIdParam(request: AuthenticatedRequest) {
  const rawConversationId = request.params.conversationId;

  if (typeof rawConversationId === "string" && rawConversationId.trim() !== "") {
    return rawConversationId.trim();
  }

  if (Array.isArray(rawConversationId) && typeof rawConversationId[0] === "string" && rawConversationId[0].trim() !== "") {
    return rawConversationId[0].trim();
  }

  throw new HttpError(400, "Conversation id is required.");
}

async function ensureConversationAccess(request: AuthenticatedRequest, conversationId: string) {
  const authUser = ensureAuthUser(request);
  const conversation = await MarketplaceConversationModel.findById(conversationId);
  if (!conversation) {
    throw new HttpError(404, "Conversation not found.");
  }

  if (authUser.role === "user" && conversation.userId !== authUser.id) {
    throw new HttpError(403, "You do not have access to this conversation.");
  }

  if (authUser.role === "vendor" && conversation.vendorId !== authUser.id) {
    throw new HttpError(403, "You do not have access to this conversation.");
  }

  return { authUser, conversation };
}

export const marketplaceConversationRouter = Router();

marketplaceConversationRouter.get(
  "/conversations/unread-count",
  requireAuth,
  authorizeRoles("user", "vendor"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const unreadCount = await buildUnreadMessageCount(authUser.id);

    response.status(200).json({
      success: true,
      data: { unreadCount },
    });
  }),
);

marketplaceConversationRouter.get(
  "/conversations",
  requireAuth,
  authorizeRoles("user", "vendor"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const query = authUser.role === "user"
      ? { userId: authUser.id }
      : { vendorId: authUser.id };

    const conversations = await MarketplaceConversationModel.find(query).sort({ updatedAt: -1, createdAt: -1 });
    const payloads = await buildConversationPayloads(conversations);

    response.status(200).json({
      success: true,
      data: payloads.sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt)),
    });
  }),
);

marketplaceConversationRouter.post(
  "/conversations",
  requireAuth,
  authorizeRoles("user"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const input = startConversationSchema.parse(request.body);

    let vendorId = input.vendorId?.trim() ?? "";
    if (!vendorId && input.photographerId) {
      const profile = await VendorProfileModel.findById(input.photographerId);
      if (!profile) {
        throw new HttpError(404, "Vendor profile not found.");
      }
      vendorId = profile.vendorId;
    }

    if (!vendorId) {
      throw new HttpError(400, "Vendor id is required.");
    }

    const vendor = await UserModel.findOne({ _id: vendorId, role: "vendor" });
    if (!vendor) {
      throw new HttpError(404, "Vendor not found.");
    }

    let conversation = await MarketplaceConversationModel.findOne({
      userId: authUser.id,
      vendorId,
    });

    if (!conversation) {
      conversation = await MarketplaceConversationModel.create({
        userId: authUser.id,
        vendorId,
      });
    }

    const payload = await buildConversationPayload(conversation.id);
    response.status(200).json({
      success: true,
      message: "Conversation ready.",
      data: payload,
    });
  }),
);

marketplaceConversationRouter.get(
  "/conversations/:conversationId/messages",
  requireAuth,
  authorizeRoles("user", "vendor"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const conversationId = getConversationIdParam(request);
    const { conversation } = await ensureConversationAccess(request, conversationId);
    const messages = await MarketplaceMessageModel.find({ conversationId: conversation.id }).sort({ createdAt: 1 });

    response.status(200).json({
      success: true,
      data: messages.map((message) => serializeConversationMessage(message, conversation)),
    });
  }),
);

marketplaceConversationRouter.post(
  "/conversations/:conversationId/messages",
  requireAuth,
  authorizeRoles("user", "vendor"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const conversationId = getConversationIdParam(request);
    const { authUser, conversation } = await ensureConversationAccess(request, conversationId);
    const input = messageSchema.parse(request.body);

    const senderId = authUser.id;
    const receiverId = authUser.role === "user" ? conversation.vendorId : conversation.userId;

    const receiver = await UserModel.findById(receiverId);
    if (!receiver) {
      throw new HttpError(404, "Message receiver was not found.");
    }

    const message = await MarketplaceMessageModel.create({
      conversationId: conversation.id,
      senderId,
      receiverId,
      message: input.text,
      isRead: false,
    });

    const nextUpdatedAt = new Date();
    await MarketplaceConversationModel.updateOne(
      { _id: conversation.id },
      { $set: { updatedAt: nextUpdatedAt } },
    );

    emitConversationChanged([conversation.userId, conversation.vendorId], conversation.id);

    response.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: serializeConversationMessage(message, conversation),
    });
  }),
);

marketplaceConversationRouter.post(
  "/conversations/:conversationId/read",
  requireAuth,
  authorizeRoles("user", "vendor"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const conversationId = getConversationIdParam(request);
    const { authUser, conversation } = await ensureConversationAccess(request, conversationId);

    await MarketplaceMessageModel.updateMany(
      {
        conversationId: conversation.id,
        receiverId: authUser.id,
        isRead: false,
      },
      { $set: { isRead: true } },
    );

    emitConversationRead([conversation.userId, conversation.vendorId], conversation.id);

    response.status(200).json({
      success: true,
      message: "Conversation marked as read.",
    });
  }),
);
