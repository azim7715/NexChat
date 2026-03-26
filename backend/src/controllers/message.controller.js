import mongoose from "mongoose";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getReceiverSocketId, io } from "../socket/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
      groupId: { $exists: false },
      isDeleted: false,
    })
      .populate("senderId", "firstName lastName profilePic")
      .sort({ createdAt: 1 });

    // Mark received messages as read
    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: myId,
        readBy: { $nin: [myId] },
      },
      { $addToSet: { readBy: myId } }
    );

    // Notify sender that messages were read
    const senderSocketId = getReceiverSocketId(otherUserId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        by: myId,
        from: otherUserId,
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let imageUrl = "";
    if (image && image.startsWith("data:image")) {
      const uploadsDir = path.join(__dirname, "../../uploads/messages");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const extMatch = image.match(/data:image\/(\w+);/);
      const ext = extMatch ? extMatch[1] : "png";
      const filename = `msg-${Date.now()}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      fs.writeFileSync(filepath, base64Data, "base64");
      imageUrl = `/uploads/messages/${filename}`;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
      messageType: imageUrl ? "image" : "text",
      readBy: [senderId],
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "firstName lastName profilePic"
    );

    // Emit to receiver's socket
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
      // WhatsApp-style notification
      io.to(receiverSocketId).emit("messageNotification", {
        from: {
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profilePic: req.user.profilePic,
        },
        message: text || "📷 Image",
        messageId: newMessage._id,
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      {
        senderId,
        receiverId: myId,
        readBy: { $nin: [myId] },
      },
      { $addToSet: { readBy: myId } }
    );

    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== userId.toString()
    );

    // Add new reaction (if emoji provided, not just removal)
    if (emoji) {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Notify the other party
    const otherId =
      message.senderId.toString() === userId.toString()
        ? message.receiverId?.toString()
        : message.senderId.toString();

    if (otherId) {
      const targetSocketId = getReceiverSocketId(otherId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("reactionUpdate", {
          messageId,
          reactions: message.reactions,
        });
      }
    }

    res.status(200).json(message.reactions);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    message.image = "";
    await message.save();

    // Notify receiver
    if (message.receiverId) {
      const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", messageId);
      }
    }

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
