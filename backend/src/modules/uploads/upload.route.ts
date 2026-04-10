import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import express, { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";

const uploadRouter = Router();
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSizeBytes = 8 * 1024 * 1024;
const uploadRoot = path.resolve(process.cwd(), "uploads");
const imagesRoot = path.join(uploadRoot, "images");

async function ensureUploadFolders() {
  await fs.mkdir(imagesRoot, { recursive: true });
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function buildFileName(originalFileName: string, contentType: string) {
  const extension = contentType === "image/png"
    ? ".png"
    : contentType === "image/webp"
      ? ".webp"
      : ".jpg";
  const baseName = path.basename(originalFileName || "image").replace(path.extname(originalFileName || ""), "");
  const safeBaseName = sanitizeFileName(baseName) || "image";
  return `${Date.now()}-${crypto.randomUUID()}-${safeBaseName}${extension}`;
}

uploadRouter.use(requireAuth);

uploadRouter.post(
  "/images",
  express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: `${maxSizeBytes}` }),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = request.authUser;
    if (!authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const contentType = String(request.headers["content-type"] || "").toLowerCase();
    if (!allowedTypes.has(contentType)) {
      throw new HttpError(415, "Only JPG, PNG, and WEBP images are supported.");
    }

    const fileBuffer = Buffer.isBuffer(request.body) ? request.body : Buffer.from([]);
    if (fileBuffer.length === 0) {
      throw new HttpError(400, "Upload body is empty.");
    }

    if (fileBuffer.length > maxSizeBytes) {
      throw new HttpError(413, "Image exceeds the maximum upload size.");
    }

    const originalFileName = String(request.headers["x-file-name"] || "image");
    const fileName = buildFileName(originalFileName, contentType);
    await ensureUploadFolders();
    await fs.writeFile(path.join(imagesRoot, fileName), fileBuffer);

    response.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      data: {
        fileName,
        url: `/uploads/images/${fileName}`,
        uploadedBy: authUser.id,
      },
    });
  }),
);

export { uploadRoot, uploadRouter };
