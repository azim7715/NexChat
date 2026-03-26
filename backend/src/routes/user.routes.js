import express from "express";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  getUnreadCounts,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// IMPORTANT: specific routes MUST come before parameterized /:id routes
router.get("/", protectRoute, getAllUsers);
router.get("/unread-counts", protectRoute, getUnreadCounts);
router.put("/profile", protectRoute, updateProfile);
router.get("/:id", protectRoute, getUserById);

export default router;
