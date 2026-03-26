import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import http from "http";
import express from "express";

export const app = express();
export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// userId -> socketId map
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId?.toString()];
};

export const getOnlineUsers = () => Object.keys(userSocketMap);

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`🟢 User connected: ${userId}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinGroup", (groupId) => {
    if (groupId) socket.join(groupId);
  });

  socket.on("leaveGroup", (groupId) => {
    if (groupId) socket.leave(groupId);
  });

  socket.on("typing", ({ to, groupId }) => {
    if (groupId) {
      socket.to(groupId).emit("typing", { from: userId, groupId });
    } else if (to) {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { from: userId });
      }
    }
  });

  socket.on("stopTyping", ({ to, groupId }) => {
    if (groupId) {
      socket.to(groupId).emit("stopTyping", { from: userId, groupId });
    } else if (to) {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { from: userId });
      }
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`🔴 User disconnected: ${userId}`);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io };
