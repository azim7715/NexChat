import express from "express";
import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  updateGroup,
  addMember,
  leaveGroup,
  getGroupUnreadCounts,
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// IMPORTANT: specific routes MUST come before parameterized /:id routes
router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getMyGroups);
router.get("/unread-counts", protectRoute, getGroupUnreadCounts);

// Parameterized routes after
router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/messages", protectRoute, sendGroupMessage);
router.put("/:id", protectRoute, updateGroup);
router.post("/:id/members", protectRoute, addMember);
router.delete("/:id/leave", protectRoute, leaveGroup);

export default router;
