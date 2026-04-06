import type { NextFunction, Request, Response } from "express";
import { resolvedEnv as env } from "../config/env.js";
import { MarketplacePermissionModel } from "../models/permission.model.js";
import { MarketplaceRoleDefinitionModel } from "../models/role-definition.model.js";
import { UserModel, type UserRole } from "../models/user.model.js";
import { sanitizeUser, verifyAccessToken, type AuthenticatedUser } from "../modules/auth/auth.service.js";
import { HttpError } from "../utils/http-error.js";

export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
}

function extractToken(request: Request) {
  const authorizationHeader = request.headers.authorization;
  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice(7).trim();
  }

  const cookieToken = (request as Request & { cookies?: Record<string, string> }).cookies?.[env.AUTH_COOKIE_NAME];
  return cookieToken || null;
}

export async function requireAuth(request: AuthenticatedRequest, _response: Response, next: NextFunction) {
  const token = extractToken(request);

  if (!token) {
    return next(new HttpError(401, "Authentication is required."));
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await UserModel.findById(payload.sub);

    if (!user) {
      return next(new HttpError(401, "Your session is no longer valid."));
    }

    request.authUser = sanitizeUser(user);
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired authentication token."));
  }
}

export function authorizeRoles(...roles: UserRole[]) {
  return (request: AuthenticatedRequest, _response: Response, next: NextFunction) => {
    if (!request.authUser) {
      return next(new HttpError(401, "Authentication is required."));
    }

    if (!roles.includes(request.authUser.role)) {
      return next(new HttpError(403, "You do not have permission to access this resource."));
    }

    return next();
  };
}

export function authorizePermissions(...permissionNames: string[]) {
  return async (request: AuthenticatedRequest, _response: Response, next: NextFunction) => {
    if (!request.authUser) {
      return next(new HttpError(401, "Authentication is required."));
    }

    if (request.authUser.role === "super-admin" || permissionNames.length === 0) {
      return next();
    }

    try {
      const roleDefinition = await MarketplaceRoleDefinitionModel.findOne({
        systemRole: request.authUser.role,
        status: "active",
      }).select("permissionIds");

      if (!roleDefinition || roleDefinition.permissionIds.length === 0) {
        return next(new HttpError(403, "You do not have permission to access this resource."));
      }

      const permissions = await MarketplacePermissionModel.find({
        _id: { $in: roleDefinition.permissionIds },
        status: "active",
      }).select("name");

      const grantedPermissions = new Set(permissions.map((permission) => permission.name));
      const isAllowed = permissionNames.some((permissionName) => grantedPermissions.has(permissionName));

      if (!isAllowed) {
        return next(new HttpError(403, "You do not have permission to access this resource."));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
