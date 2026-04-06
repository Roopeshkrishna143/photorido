import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { api, getErrorMessage, getStoredAuthToken, unwrapArray, unwrapPayload } from "../lib/api";

export type ManagedUserRole = "super-admin" | "vendor" | "user";
export type BookingStatus =
  | "pending"
  | "approved_by_vendor"
  | "confirmed"
  | "rejected_by_vendor"
  | "completed"
  | "cancelled";
export type ListingStatus = "pending" | "approved" | "rejected";
export type NotificationRole = ManagedUserRole;
export type MessageSender = "user" | "vendor";

export interface MarketplaceMessage {
  id: string;
  senderId?: string;
  receiverId?: string;
  from: MessageSender;
  text: string;
  time: string;
  createdAt?: string;
  isRead?: boolean;
}

export interface MarketplaceConversation {
  id: string;
  userId?: string;
  userName: string;
  vendorId?: string;
  vendorName: string;
  avatar: string;
  preview: string;
  date: string;
  time: string;
  tag: string;
  tagColor: string;
  userUnread: number;
  vendorUnread: number;
  lastMessageAt?: string;
  messages: MarketplaceMessage[];
}

export interface MarketplaceBooking {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  vendorId?: string;
  vendorName: string;
  vendorEmail?: string;
  photographerId: string;
  listingName: string;
  eventType: string;
  location: string;
  date: string;
  time: string;
  amount: string;
  phoneNumber: string;
  status: BookingStatus;
  paymentRequested: boolean;
  withdrawalRequested: boolean;
  reviewSubmitted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceNotification {
  id: string;
  role: NotificationRole;
  message: string;
  targetPath?: string | null;
  createdAt: string;
  read: boolean;
}

export interface MarketplaceReview {
  id: string;
  bookingId?: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  vendorId?: string;
  vendorName: string;
  photographerId?: string;
  listingName: string;
  rating: number;
  comment: string;
  vendorResponse?: string | null;
  respondedAt?: string | null;
  createdAt: string;
}

export interface MarketplacePlatformUser {
  id: string;
  name: string;
  email: string;
  role: ManagedUserRole;
  status: "active" | "invited" | "disabled";
  location: string;
  createdAt: string;
}

export interface MarketplacePermission {
  id: string;
  name: string;
  module: string;
  audience: ManagedUserRole;
  description: string;
  status: "active" | "draft";
  isProtected?: boolean;
  createdAt: string;
}

export interface MarketplaceRoleDefinition {
  id: string;
  name: string;
  scope: "platform" | "operations" | "marketplace";
  status: "active" | "draft";
  permissionIds: string[];
  isProtected?: boolean;
  systemRole?: ManagedUserRole | null;
  createdAt: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface MarketplaceSubCategory {
  id: string;
  categoryId: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  vendorId?: string;
  vendorName: string;
  vendorEmail: string;
  title: string;
  categoryId?: string;
  category: string;
  subCategoryId?: string;
  subCategory: string;
  city: string;
  state: string;
  district?: string;
  area?: string;
  address?: string;
  colony?: string;
  pincode?: string;
  price: string;
  image: string;
  featuredImageCrop?: {
    zoom: number;
    x: number;
    y: number;
  } | null;
  description: string;
  experience?: string;
  locationInput?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  portfolio?: string[];
  albums?: Array<{
    name: string;
    images: string[];
  }>;
  youtubeLinks?: Array<{
    url: string;
    thumb?: string | null;
    videoId?: string | null;
  }>;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

interface CreateBookingInput {
  userName: string;
  userEmail: string;
  vendorName: string;
  photographerId: string;
  listingName: string;
  eventType: string;
  location: string;
  date: string;
  time: string;
  amount: string;
  phoneNumber: string;
}

interface UpdateBookingInput {
  eventType?: string;
  location?: string;
  date?: string;
  time?: string;
  amount?: string;
  phoneNumber?: string;
  status?: BookingStatus;
}

interface CreateListingInput {
  title: string;
  categoryId: string;
  subCategoryId: string;
  experience: string;
  price: string;
  description: string;
  featuredImage: string;
  featuredImageCrop?: {
    zoom: number;
    x: number;
    y: number;
  } | null;
  locationInput: string;
  placeId?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  colony: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  district: string;
  portfolioImages: string[];
  albums: Array<{
    name: string;
    images: string[];
  }>;
  youtubeLinks: Array<{
    url: string;
    thumb?: string | null;
    videoId?: string | null;
  }>;
}

interface CreatePlatformUserInput {
  name: string;
  email: string;
  password?: string;
  role: ManagedUserRole;
  status: MarketplacePlatformUser["status"];
  location: string;
  phoneNumber?: string;
}

interface CreatePermissionInput {
  name: string;
  module: string;
  audience: ManagedUserRole;
  description: string;
  status: MarketplacePermission["status"];
}

interface CreateRoleInput {
  name: string;
  scope: MarketplaceRoleDefinition["scope"];
  status: MarketplaceRoleDefinition["status"];
  permissionIds: string[];
}

interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment: string;
}

interface CreateConversationInput {
  vendorId?: string;
  photographerId?: string;
}

interface CreateCategoryInput {
  name: string;
  status: MarketplaceCategory["status"];
}

interface CreateSubCategoryInput {
  categoryId: string;
  name: string;
  status: MarketplaceSubCategory["status"];
}

interface MarketplaceSnapshot {
  bookings: MarketplaceBooking[];
  conversations: MarketplaceConversation[];
  notifications: MarketplaceNotification[];
  reviews: MarketplaceReview[];
  platformUsers: MarketplacePlatformUser[];
  permissions: MarketplacePermission[];
  roles: MarketplaceRoleDefinition[];
  categories: MarketplaceCategory[];
  subCategories: MarketplaceSubCategory[];
  listings: MarketplaceListing[];
}

type MarketplaceMutationResult = Promise<boolean>;

interface MarketplaceContextValue extends MarketplaceSnapshot {
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  refreshMarketplace: () => Promise<void>;
  createBooking: (input: CreateBookingInput) => MarketplaceMutationResult;
  deleteBooking: (bookingId: string) => MarketplaceMutationResult;
  approveBooking: (bookingId: string) => MarketplaceMutationResult;
  rejectBooking: (bookingId: string) => MarketplaceMutationResult;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => MarketplaceMutationResult;
  updateBooking: (bookingId: string, input: UpdateBookingInput) => MarketplaceMutationResult;
  requestAgain: (bookingId: string) => MarketplaceMutationResult;
  requestPayment: (bookingId: string) => MarketplaceMutationResult;
  confirmPayment: (bookingId: string) => MarketplaceMutationResult;
  completeBooking: (bookingId: string) => MarketplaceMutationResult;
  requestWithdrawal: (bookingId: string) => MarketplaceMutationResult;
  confirmWithdrawal: (bookingId: string) => MarketplaceMutationResult;
  createReview: (input: CreateReviewInput) => MarketplaceMutationResult;
  respondToReview: (reviewId: string, vendorResponse: string) => MarketplaceMutationResult;
  deleteReview: (reviewId: string) => MarketplaceMutationResult;
  openConversation: (input: CreateConversationInput) => Promise<string | null>;
  sendConversationMessage: (conversationId: string, from: MessageSender, text: string) => MarketplaceMutationResult;
  markConversationRead: (role: NotificationRole, conversationId: string) => MarketplaceMutationResult;
  markAllNotificationsRead: (role: NotificationRole) => MarketplaceMutationResult;
  dismissNotification: (notificationId: string) => MarketplaceMutationResult;
  createListing: (input: CreateListingInput) => MarketplaceMutationResult;
  updateListing: (listingId: string, input: CreateListingInput) => MarketplaceMutationResult;
  approveListing: (listingId: string) => MarketplaceMutationResult;
  rejectListing: (listingId: string) => MarketplaceMutationResult;
  addPlatformUser: (input: CreatePlatformUserInput) => MarketplaceMutationResult;
  updatePlatformUser: (userId: string, input: CreatePlatformUserInput) => MarketplaceMutationResult;
  deletePlatformUser: (userId: string) => MarketplaceMutationResult;
  addPermission: (input: CreatePermissionInput) => MarketplaceMutationResult;
  updatePermission: (permissionId: string, input: CreatePermissionInput) => MarketplaceMutationResult;
  deletePermission: (permissionId: string) => MarketplaceMutationResult;
  addRole: (input: CreateRoleInput) => MarketplaceMutationResult;
  updateRole: (roleId: string, input: CreateRoleInput) => MarketplaceMutationResult;
  deleteRole: (roleId: string) => MarketplaceMutationResult;
  addCategory: (input: CreateCategoryInput) => MarketplaceMutationResult;
  updateCategory: (categoryId: string, input: CreateCategoryInput) => MarketplaceMutationResult;
  deleteCategory: (categoryId: string) => MarketplaceMutationResult;
  addSubCategory: (input: CreateSubCategoryInput) => MarketplaceMutationResult;
  updateSubCategory: (subCategoryId: string, input: CreateSubCategoryInput) => MarketplaceMutationResult;
  deleteSubCategory: (subCategoryId: string) => MarketplaceMutationResult;
}

const EMPTY_SNAPSHOT: MarketplaceSnapshot = {
  bookings: [],
  conversations: [],
  notifications: [],
  reviews: [],
  platformUsers: [],
  permissions: [],
  roles: [],
  categories: [],
  subCategories: [],
  listings: [],
};

const RESOURCE_ENDPOINTS = {
  bookings: "/marketplace/bookings",
  conversations: "/marketplace/conversations",
  notifications: "/marketplace/notifications",
  reviews: "/marketplace/reviews",
  platformUsers: "/marketplace/users",
  permissions: "/marketplace/permissions",
  roles: "/marketplace/roles",
  categories: "/marketplace/categories",
  subCategories: "/marketplace/sub-categories",
  listings: "/marketplace/listings",
} satisfies Record<keyof MarketplaceSnapshot, string>;

const ROLE_RESOURCE_MAP: Record<ManagedUserRole, (keyof MarketplaceSnapshot)[]> = {
  user: ["bookings", "conversations", "notifications", "reviews"],
  vendor: ["bookings", "conversations", "notifications", "reviews", "categories", "subCategories", "listings"],
  "super-admin": [
    "bookings",
    "conversations",
    "notifications",
    "reviews",
    "platformUsers",
    "permissions",
    "roles",
    "categories",
    "subCategories",
    "listings",
  ],
};

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined);

async function fetchCollection<T>(path: string) {
  const payload = await api.get(path, {
    query: { limit: 1000 },
  });
  return unwrapArray<T>(payload);
}

function getSocketUrl() {
  const configuredBase = import.meta.env.VITE_API_BASE_URL ?? "/api";

  if (/^https?:\/\//i.test(configuredBase)) {
    return configuredBase.replace(/\/api\/?$/i, "");
  }

  return window.location.origin;
}

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<MarketplaceSnapshot>(EMPTY_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const hydrateMarketplace = useCallback(
    async (role: ManagedUserRole, options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true);
      }

      setError(null);

      try {
        const resources = ROLE_RESOURCE_MAP[role];
        const results = await Promise.allSettled(
          resources.map(async (resourceKey) => {
            const items = await fetchCollection(RESOURCE_ENDPOINTS[resourceKey]);
            return [resourceKey, items] as const;
          }),
        );

        const nextSnapshot = { ...EMPTY_SNAPSHOT };
        const failedResources: string[] = [];

        results.forEach((result, index) => {
          const resourceKey = resources[index];

          if (result.status === "fulfilled") {
            const [, items] = result.value;
            nextSnapshot[resourceKey] = items as never;
            return;
          }

          failedResources.push(resourceKey);
        });

        setSnapshot(nextSnapshot);

        if (failedResources.length > 0) {
          setError(`Some marketplace resources could not be loaded: ${failedResources.join(", ")}.`);
        }
      } catch (nextError) {
        setSnapshot(EMPTY_SNAPSHOT);
        setError(getErrorMessage(nextError, "Unable to load marketplace data."));
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const role = user?.role;

    if (!role) {
      setSnapshot(EMPTY_SNAPSHOT);
      setError(null);
      setIsLoading(false);
      return;
    }

    void hydrateMarketplace(role);
  }, [hydrateMarketplace, user?.role]);

  useEffect(() => {
    const role = user?.role;
    const token = getStoredAuthToken();

    if (!role || (role !== "user" && role !== "vendor") || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(getSocketUrl(), {
      path: "/socket.io",
      auth: { token },
      withCredentials: true,
    });

    const handleConversationEvent = () => {
      void hydrateMarketplace(role, { silent: true });
    };

    socket.on("conversation:changed", handleConversationEvent);
    socket.on("conversation:read", handleConversationEvent);
    socketRef.current = socket;

    return () => {
      socket.off("conversation:changed", handleConversationEvent);
      socket.off("conversation:read", handleConversationEvent);
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [hydrateMarketplace, user?.id, user?.role]);

  const refreshMarketplace = useCallback(async () => {
    if (!user?.role) {
      setSnapshot(EMPTY_SNAPSHOT);
      return;
    }

    await hydrateMarketplace(user.role, { silent: true });
  }, [hydrateMarketplace, user?.role]);

  const runMutation = useCallback(
    async (mutation: () => Promise<unknown>) => {
      if (!user?.role) {
        setError("You must be signed in to perform this action.");
        return false;
      }

      setIsMutating(true);
      setError(null);

      try {
        await mutation();
        await hydrateMarketplace(user.role, { silent: true });
        return true;
      } catch (nextError) {
        setError(getErrorMessage(nextError, "We could not save your changes."));
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [hydrateMarketplace, user?.role],
  );

  const openConversation = useCallback(
    async (input: CreateConversationInput) => {
      if (user?.role !== "user") {
        setError("Only logged-in users can start a conversation with a vendor.");
        return null;
      }

      setIsMutating(true);
      setError(null);

      try {
        const payload = await api.post(RESOURCE_ENDPOINTS.conversations, input);
        const conversation = unwrapPayload<MarketplaceConversation>(payload);
        await hydrateMarketplace(user.role, { silent: true });

        if (conversation?.id) {
          socketRef.current?.emit("conversation:join", conversation.id);
          return conversation.id;
        }

        return null;
      } catch (nextError) {
        setError(getErrorMessage(nextError, "We could not open this conversation."));
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [hydrateMarketplace, user?.role],
  );

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      ...snapshot,
      isLoading,
      isMutating,
      error,
      refreshMarketplace,
      createBooking: (input) => runMutation(() => api.post(RESOURCE_ENDPOINTS.bookings, input)),
      deleteBooking: (bookingId) =>
        runMutation(() => api.delete(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}`)),
      approveBooking: (bookingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}/approve`)),
      rejectBooking: (bookingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}/reject`)),
      updateBookingStatus: (bookingId, status) =>
        runMutation(() => api.patch(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}`, { status })),
      updateBooking: (bookingId, input) =>
        runMutation(() => api.patch(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}`, input)),
      requestAgain: (bookingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}/request-again`)),
      requestPayment: (bookingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}/request-payment`)),
      confirmPayment: (bookingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}/confirm-payment`)),
      completeBooking: (bookingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}/complete`)),
      requestWithdrawal: (bookingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}/request-withdrawal`)),
      confirmWithdrawal: (bookingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.bookings}/${bookingId}/confirm-withdrawal`)),
      createReview: (input) =>
        runMutation(() => api.post(RESOURCE_ENDPOINTS.reviews, input)),
      respondToReview: (reviewId, vendorResponse) =>
        runMutation(() => api.patch(`${RESOURCE_ENDPOINTS.reviews}/${reviewId}/respond`, { vendorResponse })),
      deleteReview: (reviewId) =>
        runMutation(() => api.delete(`${RESOURCE_ENDPOINTS.reviews}/${reviewId}`)),
      openConversation,
      sendConversationMessage: (conversationId, from, text) =>
        runMutation(() =>
          api.post(`${RESOURCE_ENDPOINTS.conversations}/${conversationId}/messages`, { text }),
        ),
      markConversationRead: (role, conversationId) =>
        runMutation(() =>
          api.post(`${RESOURCE_ENDPOINTS.conversations}/${conversationId}/read`),
        ),
      markAllNotificationsRead: (role) =>
        runMutation(() =>
          api.post(`${RESOURCE_ENDPOINTS.notifications}/read-all`, { role }),
        ),
      dismissNotification: (notificationId) =>
        runMutation(() =>
          api.delete(`${RESOURCE_ENDPOINTS.notifications}/${notificationId}`),
        ),
      createListing: (input) => runMutation(() => api.post(RESOURCE_ENDPOINTS.listings, input)),
      updateListing: (listingId, input) =>
        runMutation(() => api.patch(`${RESOURCE_ENDPOINTS.listings}/${listingId}`, input)),
      approveListing: (listingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.listings}/${listingId}/approve`)),
      rejectListing: (listingId) =>
        runMutation(() => api.post(`${RESOURCE_ENDPOINTS.listings}/${listingId}/reject`)),
      addPlatformUser: (input) =>
        runMutation(() => api.post(RESOURCE_ENDPOINTS.platformUsers, input)),
      updatePlatformUser: (userId, input) =>
        runMutation(() => api.patch(`${RESOURCE_ENDPOINTS.platformUsers}/${userId}`, input)),
      deletePlatformUser: (userId) =>
        runMutation(() => api.delete(`${RESOURCE_ENDPOINTS.platformUsers}/${userId}`)),
      addPermission: (input) =>
        runMutation(() => api.post(RESOURCE_ENDPOINTS.permissions, input)),
      updatePermission: (permissionId, input) =>
        runMutation(() => api.patch(`${RESOURCE_ENDPOINTS.permissions}/${permissionId}`, input)),
      deletePermission: (permissionId) =>
        runMutation(() => api.delete(`${RESOURCE_ENDPOINTS.permissions}/${permissionId}`)),
      addRole: (input) => runMutation(() => api.post(RESOURCE_ENDPOINTS.roles, input)),
      updateRole: (roleId, input) =>
        runMutation(() => api.patch(`${RESOURCE_ENDPOINTS.roles}/${roleId}`, input)),
      deleteRole: (roleId) => runMutation(() => api.delete(`${RESOURCE_ENDPOINTS.roles}/${roleId}`)),
      addCategory: (input) =>
        runMutation(() => api.post(RESOURCE_ENDPOINTS.categories, input)),
      updateCategory: (categoryId, input) =>
        runMutation(() => api.patch(`${RESOURCE_ENDPOINTS.categories}/${categoryId}`, input)),
      deleteCategory: (categoryId) =>
        runMutation(() => api.delete(`${RESOURCE_ENDPOINTS.categories}/${categoryId}`)),
      addSubCategory: (input) =>
        runMutation(() => api.post(RESOURCE_ENDPOINTS.subCategories, input)),
      updateSubCategory: (subCategoryId, input) =>
        runMutation(() => api.patch(`${RESOURCE_ENDPOINTS.subCategories}/${subCategoryId}`, input)),
      deleteSubCategory: (subCategoryId) =>
        runMutation(() => api.delete(`${RESOURCE_ENDPOINTS.subCategories}/${subCategoryId}`)),
    }),
    [snapshot, isLoading, isMutating, error, refreshMarketplace, runMutation, openConversation],
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}







