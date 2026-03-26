import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { search } = req.query;

    let query = { _id: { $ne: loggedInUserId }, isVerified: true };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    const users = await User.find(query)
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp -otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, profilePic } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (firstName && firstName.trim()) updateData.firstName = firstName.trim();
    if (lastName && lastName.trim()) updateData.lastName = lastName.trim();
    if (bio !== undefined) updateData.bio = bio;

    // Handle base64 profile pic upload
    if (profilePic && profilePic.startsWith("data:image")) {
      const uploadsDir = path.join(__dirname, "../../uploads/profiles");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const base64Data = profilePic.replace(/^data:image\/\w+;base64,/, "");
      const extMatch = profilePic.match(/data:image\/(\w+);/);
      const ext = extMatch ? extMatch[1] : "png";
      const filename = `${userId}-${Date.now()}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      fs.writeFileSync(filepath, base64Data, "base64");
      updateData.profilePic = `/uploads/profiles/${filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password -otp -otpExpiry");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUnreadCounts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          readBy: { $nin: [userId] },
          isDeleted: false,
          groupId: { $exists: false },
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countsMap = {};
    unreadCounts.forEach((item) => {
      countsMap[item._id.toString()] = item.count;
    });

    res.status(200).json(countsMap);
  } catch (error) {
    console.error("Get unread counts error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
