import type { Server as HttpServer } from "node:http";
import type { Socket } from "socket.io";
import { Server } from "socket.io";
import { resolvedEnv as env } from "../config/env.js";
import { UserModel } from "../models/user.model.js";
import { verifyAccessToken } from "../modules/auth/auth.service.js";

let io: Server | null = null;

function extractSocketToken(socket: Socket) {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim() !== "") {
    return authToken.trim();
  }

  const authorizationHeader = socket.handshake.headers.authorization;
  if (typeof authorizationHeader === "string" && authorizationHeader.startsWith("Bearer ")) {
    return authorizationHeader.slice(7).trim();
  }

  return null;
}

export function attachRealtimeServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    try {
      const token = extractSocketToken(socket);
      if (!token) {
        return next(new Error("Authentication is required."));
      }

      const payload = verifyAccessToken(token);
      const user = await UserModel.findById(payload.sub);
      if (!user) {
        return next(new Error("Your session is no longer valid."));
      }

      socket.data.userId = user.id;
      socket.data.role = user.role;
      socket.join(`user:${user.id}`);
      return next();
    } catch {
      return next(new Error("Invalid or expired authentication token."));
    }
  });

  io.on("connection", (socket) => {
    socket.on("conversation:join", (conversationId: unknown) => {
      if (typeof conversationId === "string" && conversationId.trim() !== "") {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("conversation:leave", (conversationId: unknown) => {
      if (typeof conversationId === "string" && conversationId.trim() !== "") {
        socket.leave(`conversation:${conversationId}`);
      }
    });
  });

  return io;
}

export function emitConversationChanged(userIds: string[], conversationId: string) {
  if (!io) {
    return;
  }

  [...new Set(userIds)].forEach((userId) => {
    io?.to(`user:${userId}`).emit("conversation:changed", { conversationId });
  });
}

export function emitConversationRead(userIds: string[], conversationId: string) {
  if (!io) {
    return;
  }

  [...new Set(userIds)].forEach((userId) => {
    io?.to(`user:${userId}`).emit("conversation:read", { conversationId });
  });
}
