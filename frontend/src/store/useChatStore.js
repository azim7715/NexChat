import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { useSocketStore } from "./useSocketStore";

export const useChatStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  messages: [],
  unreadCounts: {},
  isLoadingUsers: false,
  isLoadingMessages: false,
  typingUsers: {},

  fetchUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const res = await axios.get("/api/users", { withCredentials: true });
      set({ users: res.data });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load users";
      toast.error(msg);
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  searchUsers: async (query) => {
    try {
      const res = await axios.get(
        `/api/users${query ? `?search=${encodeURIComponent(query)}` : ""}`,
        { withCredentials: true }
      );
      set({ users: res.data });
    } catch (err) {
      console.error("Search error:", err.message);
    }
  },

  fetchUnreadCounts: async () => {
    try {
      const res = await axios.get("/api/users/unread-counts", { withCredentials: true });
      set({ unreadCounts: res.data });
    } catch (err) {
      console.error("Unread counts error:", err.message);
    }
  },

  selectUser: (user) => {
    set((state) => ({
      selectedUser: user,
      messages: [],
      unreadCounts: { ...state.unreadCounts, [user._id]: 0 },
    }));
  },

  fetchMessages: async (userId) => {
    set({ isLoadingMessages: true });
    try {
      const res = await axios.get(`/api/messages/${userId}`, { withCredentials: true });
      set({ messages: res.data });
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (receiverId, { text, image }) => {
    try {
      const res = await axios.post(
        `/api/messages/send/${receiverId}`,
        { text, image },
        { withCredentials: true }
      );
      set((state) => ({ messages: [...state.messages, res.data] }));
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
      return { success: false };
    }
  },

  receiveMessage: (message) => {
    const { selectedUser } = get();
    const senderId = message.senderId?._id || message.senderId;
    const isCurrentChat =
      selectedUser &&
      !selectedUser.isGroup &&
      senderId?.toString() === selectedUser._id?.toString();

    if (isCurrentChat) {
      set((state) => ({ messages: [...state.messages, message] }));
    } else {
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [senderId]: (state.unreadCounts[senderId] || 0) + 1,
        },
      }));
    }
  },

  deleteMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId
          ? { ...m, isDeleted: true, text: "This message was deleted", image: "" }
          : m
      ),
    }));
  },

  updateReaction: (messageId, reactions) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, reactions } : m
      ),
    }));
  },

  setTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    }));
  },

  subscribeToMessages: (authUserId) => {
    const { socket } = useSocketStore.getState();
    if (!socket) return;

    // Remove previous listeners to avoid duplicates
    socket.off("newMessage");
    socket.off("messageNotification");
    socket.off("messageDeleted");
    socket.off("reactionUpdate");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("messagesRead");

    socket.on("newMessage", (message) => {
      get().receiveMessage(message);
    });

    socket.on("messageNotification", (data) => {
      const { selectedUser } = get();
      const fromId = data.from?._id?.toString();
      // Don't show notification if we're already in that chat
      if (!selectedUser || selectedUser._id?.toString() !== fromId) {
        // Also skip if it's a group notification and we're in that group
        // (handled in group store)
        if (!data.groupId) {
          useSocketStore.getState().addNotification(data);
        }
      }
    });

    socket.on("messageDeleted", (messageId) => {
      get().deleteMessage(messageId);
    });

    socket.on("reactionUpdate", ({ messageId, reactions }) => {
      get().updateReaction(messageId, reactions);
    });

    socket.on("typing", ({ from, groupId }) => {
      if (!groupId) get().setTyping(from, true);
    });

    socket.on("stopTyping", ({ from, groupId }) => {
      if (!groupId) get().setTyping(from, false);
    });

    socket.on("messagesRead", ({ by }) => {
      set((state) => ({
        messages: state.messages.map((m) => {
          const sid = m.senderId?._id || m.senderId;
          if (sid?.toString() === authUserId?.toString()) {
            const alreadyRead = (m.readBy || []).some(
              (r) => r?.toString() === by?.toString()
            );
            if (!alreadyRead) {
              return { ...m, readBy: [...(m.readBy || []), by] };
            }
          }
          return m;
        }),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = useSocketStore.getState();
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageNotification");
    socket.off("messageDeleted");
    socket.off("reactionUpdate");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("messagesRead");
  },

  clearSelectedUser: () => set({ selectedUser: null, messages: [] }),
}));
