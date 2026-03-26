import express from "express";
import {
  getMessages,
  sendMessage,
  markAsRead,
  addReaction,
  deleteMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/read/:id", protectRoute, markAsRead);
router.put("/react/:id", protectRoute, addReaction);
router.delete("/:id", protectRoute, deleteMessage);

export default router;
