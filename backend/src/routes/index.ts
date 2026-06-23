import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route.js";
import { marketplaceBookingRouter } from "../modules/marketplace/marketplace-booking.route.js";
import { marketplaceConversationRouter } from "../modules/marketplace/marketplace-conversation.route.js";
import { favoriteRouter } from "../modules/marketplace/marketplace-favorite.route.js";
import { marketplaceReviewRouter } from "../modules/marketplace/marketplace-review.route.js";
import { marketplaceRbacRouter } from "../modules/marketplace/marketplace-rbac.route.js";
import { marketplaceRouter } from "../modules/marketplace/marketplace.route.js";
import { marketplaceUserRouter } from "../modules/marketplace/marketplace-user.route.js";
import { photographerRouter } from "../modules/photographers/photographer.route.js";
import { settingsRouter } from "../modules/settings/settings.route.js";
import { siteRouter } from "../modules/site/site.route.js";
import { uploadRouter } from "../modules/uploads/upload.route.js";
import { vendorRouter } from "../modules/vendors/vendor.route.js";
import { operationsRouter } from "../modules/operations/operations.route.js";
import { healthRouter } from "./health.route.js";

const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Photorido backend API is ready.",
  });
});

apiRouter.use("/health", healthRouter);
apiRouter.use("/site", siteRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/operations", operationsRouter);
apiRouter.use("/marketplace", marketplaceReviewRouter);
apiRouter.use("/marketplace", marketplaceConversationRouter);
apiRouter.use("/marketplace", marketplaceBookingRouter);
apiRouter.use("/marketplace", favoriteRouter);
apiRouter.use("/marketplace", marketplaceUserRouter);
apiRouter.use("/marketplace", marketplaceRbacRouter);
apiRouter.use("/marketplace", marketplaceRouter);
apiRouter.use("/vendors", vendorRouter);
apiRouter.use("/photographers", photographerRouter);

export { apiRouter };
