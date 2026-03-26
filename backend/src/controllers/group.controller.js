import mongoose from "mongoose";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const createdBy = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }
    if (!members || members.length < 1) {
      return res.status(400).json({ message: "At least 1 member is required" });
    }

    const allMembers = [...new Set([...members, createdBy.toString()])];

    const group = await Group.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      createdBy,
      members: allMembers,
      admins: [createdBy],
      groupPic: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`,
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("members", "firstName lastName profilePic email")
      .populate("admins", "firstName lastName profilePic")
      .populate("createdBy", "firstName lastName profilePic");

    // Notify all members via socket
    allMembers.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId.toString());
      if (socketId) {
        io.to(socketId).emit("newGroup", populatedGroup);
      }
    });

    // Create system message
    await Message.create({
      senderId: createdBy,
      groupId: group._id,
      text: `${req.user.firstName} created this group`,
      messageType: "system",
      readBy: [createdBy],
    });

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Create group error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("members", "firstName lastName profilePic email")
      .populate("admins", "firstName lastName profilePic")
      .populate("createdBy", "firstName lastName profilePic")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "firstName lastName" },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Get groups error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not a group member" });
    }

    const messages = await Message.find({ groupId, isDeleted: false })
      .populate("senderId", "firstName lastName profilePic")
      .sort({ createdAt: 1 });

    // Mark all as read
    await Message.updateMany(
      { groupId, readBy: { $nin: [userId] } },
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get group messages error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === senderId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const newMessage = await Message.create({
      senderId,
      groupId,
      text: text || "",
      image: image || "",
      messageType: image ? "image" : "text",
      readBy: [senderId],
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "firstName lastName profilePic"
    );

    // Update group's lastMessage and updatedAt
    await Group.findByIdAndUpdate(groupId, {
      lastMessage: newMessage._id,
      updatedAt: new Date(),
    });

    // Emit to group room
    io.to(groupId).emit("newGroupMessage", {
      groupId,
      message: populatedMessage,
    });

    // Notify offline members
    group.members.forEach((memberId) => {
      if (memberId.toString() !== senderId.toString()) {
        const socketId = getReceiverSocketId(memberId.toString());
        if (socketId) {
          io.to(socketId).emit("messageNotification", {
            from: {
              _id: req.user._id,
              firstName: req.user.firstName,
              lastName: req.user.lastName,
              profilePic: req.user.profilePic,
            },
            message: text || "📷 Image",
            groupId,
            groupName: group.name,
          });
        }
      }
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send group message error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { name, description, groupPic } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.admins.some((a) => a.toString() === userId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can update the group" });
    }

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (groupPic) updateData.groupPic = groupPic;

    const updatedGroup = await Group.findByIdAndUpdate(groupId, updateData, { new: true })
      .populate("members", "firstName lastName profilePic email")
      .populate("admins", "firstName lastName profilePic")
      .populate("createdBy", "firstName lastName profilePic");

    io.to(groupId).emit("groupUpdated", updatedGroup);

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { userId: newMemberId } = req.body;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.admins.some((a) => a.toString() === requesterId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    const alreadyMember = group.members.some((m) => m.toString() === newMemberId);
    if (alreadyMember) {
      return res.status(400).json({ message: "User already in group" });
    }

    group.members.push(newMemberId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "firstName lastName profilePic email")
      .populate("admins", "firstName lastName profilePic")
      .populate("createdBy", "firstName lastName profilePic");

    io.to(groupId).emit("groupUpdated", updatedGroup);

    const newMemberSocketId = getReceiverSocketId(newMemberId);
    if (newMemberSocketId) {
      io.to(newMemberSocketId).emit("newGroup", updatedGroup);
    }

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some((m) => m.toString() === userId.toString());
    if (!isMember) {
      return res.status(400).json({ message: "You are not in this group" });
    }

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    group.admins = group.admins.filter((a) => a.toString() !== userId.toString());

    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      await Message.deleteMany({ groupId });
      return res.status(200).json({ message: "Group deleted as no members remain" });
    }

    // Promote first member to admin if no admins left
    if (group.admins.length === 0) {
      group.admins.push(group.members[0]);
    }

    await group.save();

    io.to(groupId).emit("memberLeft", { groupId, userId });
    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupUnreadCounts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const groups = await Group.find({ members: userId });
    const groupIds = groups.map((g) => g._id);

    if (groupIds.length === 0) {
      return res.status(200).json({});
    }

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          groupId: { $in: groupIds },
          readBy: { $nin: [userId] },
          senderId: { $ne: userId },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$groupId",
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
    console.error("Get group unread counts error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
