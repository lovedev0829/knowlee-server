import express from "express";
import {
  createGlobalNotifications,
  createUserNotifications,
  deleteNotification,
  getUserNotifications,
  markNotificationsAsViewed,
  markNotificationsAsUnread
} from "../controllers/notifications.controller";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import { errorWrap } from "../utils/errors.util";

const router = express.Router();

// This would need an admin check
router.post(
  "/global",
  errorWrap(createGlobalNotifications, "Could not get global notification")
);
router.post(
  "/",
  errorWrap(createUserNotifications, "Could not get global notification")
);

// User interacted below
router.use(errorWrap(checkJwt, "Could not verify user"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.get(
  "/",
  errorWrap(getUserNotifications, "Could not get user notifications")
);
router.put(
  "/markAsViewed",
  errorWrap(markNotificationsAsViewed, "Could mark user notifications as viewed")
);
router.put(
  "/markAsUnread",
  errorWrap(markNotificationsAsUnread, "Could mark user notifications as unviewed")
);
router.delete(
  "/:notificationId",
  errorWrap(deleteNotification, "Could mark user notifications as viewed")
);

export default router;
