import { MarketplaceConversationModel, type MarketplaceConversationDocument } from "../../models/conversation.model.js";
import { MarketplaceMessageModel, type MarketplaceMessageDocument } from "../../models/message.model.js";
import { UserModel, type UserDocument } from "../../models/user.model.js";
import { HttpError } from "../../utils/http-error.js";

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function formatListDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(value);
}

function formatListTime(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function buildInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
}

export function serializeConversationMessage(
  message: MarketplaceMessageDocument,
  conversation: Pick<MarketplaceConversationDocument, "userId" | "vendorId">,
) {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    from: message.senderId === conversation.userId ? "user" as const : "vendor" as const,
    text: message.message,
    time: formatListTime(message.createdAt),
    createdAt: toIsoString(message.createdAt),
    isRead: message.isRead,
  };
}

function serializeConversation(
  conversation: MarketplaceConversationDocument,
  user: UserDocument,
  vendor: UserDocument,
  messages: MarketplaceMessageDocument[],
) {
  const sortedMessages = [...messages].sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
  const lastMessage = sortedMessages[sortedMessages.length - 1] ?? null;
  const lastActivityAt = lastMessage?.createdAt ?? conversation.updatedAt;

  return {
    id: conversation.id,
    userId: conversation.userId,
    userName: user.name,
    vendorId: conversation.vendorId,
    vendorName: vendor.name,
    avatar: buildInitials(vendor.name),
    preview: lastMessage?.message ?? "Start your conversation",
    date: formatListDate(lastActivityAt),
    time: formatListTime(lastActivityAt),
    tag: "Direct",
    tagColor: "bg-blue-100 text-blue-700",
    userUnread: messages.filter((message) => message.receiverId === conversation.userId && !message.isRead).length,
    vendorUnread: messages.filter((message) => message.receiverId === conversation.vendorId && !message.isRead).length,
    lastMessageAt: toIsoString(lastActivityAt),
    messages: sortedMessages.map((message) => serializeConversationMessage(message, conversation)),
  };
}

export async function buildConversationPayloads(conversations: MarketplaceConversationDocument[]) {
  if (conversations.length === 0) {
    return [];
  }

  const conversationIds = conversations.map((conversation) => conversation.id);
  const userIds = Array.from(new Set(conversations.flatMap((conversation) => [conversation.userId, conversation.vendorId])));

  const [participants, messages] = await Promise.all([
    UserModel.find({ _id: { $in: userIds } }),
    MarketplaceMessageModel.find({ conversationId: { $in: conversationIds } }).sort({ createdAt: 1 }),
  ]);

  const participantById = new Map(participants.map((participant) => [participant.id, participant]));
  const messagesByConversationId = new Map<string, MarketplaceMessageDocument[]>();

  messages.forEach((message) => {
    const existing = messagesByConversationId.get(message.conversationId) ?? [];
    existing.push(message);
    messagesByConversationId.set(message.conversationId, existing);
  });

  return conversations
    .map((conversation) => {
      const user = participantById.get(conversation.userId);
      const vendor = participantById.get(conversation.vendorId);

      if (!user || !vendor) {
        return null;
      }

      return serializeConversation(
        conversation,
        user,
        vendor,
        messagesByConversationId.get(conversation.id) ?? [],
      );
    })
    .filter((conversation): conversation is NonNullable<typeof conversation> => Boolean(conversation));
}

export async function buildConversationPayload(conversationId: string) {
  const conversation = await MarketplaceConversationModel.findById(conversationId);
  if (!conversation) {
    throw new HttpError(404, "Conversation not found.");
  }

  const payloads = await buildConversationPayloads([conversation]);
  const payload = payloads[0];
  if (!payload) {
    throw new HttpError(404, "Conversation participants were not found.");
  }

  return payload;
}

export async function buildUnreadMessageCount(userId: string) {
  return MarketplaceMessageModel.countDocuments({
    receiverId: userId,
    isRead: false,
  });
}
