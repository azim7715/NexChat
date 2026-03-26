import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { useSocketStore } from "./useSocketStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  groupUnreadCounts: {},
  isLoadingGroups: false,
  isLoadingGroupMessages: false,
  typingUsers: {},

  fetchGroups: async () => {
    set({ isLoadingGroups: true });
    try {
      const res = await axios.get("/api/groups", { withCredentials: true });
      set({ groups: res.data });
    } catch (err) {
      console.error("Fetch groups error:", err.message);
    } finally {
      set({ isLoadingGroups: false });
    }
  },

  fetchGroupUnreadCounts: async () => {
    try {
      const res = await axios.get("/api/groups/unread-counts", { withCredentials: true });
      set({ groupUnreadCounts: res.data });
    } catch (err) {
      console.error("Group unread counts error:", err.message);
    }
  },

  selectGroup: (group) => {
    set((state) => ({
      selectedGroup: group,
      groupMessages: [],
      groupUnreadCounts: { ...state.groupUnreadCounts, [group._id]: 0 },
    }));
  },

  fetchGroupMessages: async (groupId) => {
    set({ isLoadingGroupMessages: true });
    try {
      const res = await axios.get(`/api/groups/${groupId}/messages`, { withCredentials: true });
      set({ groupMessages: res.data });
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      set({ isLoadingGroupMessages: false });
    }
  },

  sendGroupMessage: async (groupId, { text, image }) => {
    try {
      const res = await axios.post(
        `/api/groups/${groupId}/messages`,
        { text, image },
        { withCredentials: true }
      );
      set((state) => ({ groupMessages: [...state.groupMessages, res.data] }));
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
      return { success: false };
    }
  },

  createGroup: async (data) => {
    try {
      const res = await axios.post("/api/groups", data, { withCredentials: true });
      set((state) => ({ groups: [res.data, ...state.groups] }));
      toast.success(`Group "${res.data.name}" created! 🎉`);
      return { success: true, group: res.data };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
      return { success: false };
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await axios.delete(`/api/groups/${groupId}/leave`, { withCredentials: true });
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
        groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages,
      }));
      toast.success("Left group");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave group");
    }
  },

  subscribeToGroupMessages: () => {
    const { socket } = useSocketStore.getState();
    if (!socket) return;

    // Join all group rooms
    const { groups } = get();
    groups.forEach((g) => socket.emit("joinGroup", g._id));

    // Remove previous listeners to avoid duplicates
    socket.off("newGroupMessage");
    socket.off("newGroup");
    socket.off("groupUpdated");
    socket.off("memberLeft");

    socket.on("newGroupMessage", ({ groupId, message }) => {
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === groupId) {
        set((state) => ({ groupMessages: [...state.groupMessages, message] }));
      } else {
        set((state) => ({
          groupUnreadCounts: {
            ...state.groupUnreadCounts,
            [groupId]: (state.groupUnreadCounts[groupId] || 0) + 1,
          },
        }));
      }
      // Always update last message in list
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === groupId ? { ...g, lastMessage: message, updatedAt: new Date() } : g
        ),
      }));
    });

    // Handle notifications for group messages
    socket.on("messageNotification", (data) => {
      if (data.groupId) {
        const { selectedGroup } = get();
        if (!selectedGroup || selectedGroup._id !== data.groupId) {
          useSocketStore.getState().addNotification(data);
        }
      }
    });

    socket.on("newGroup", (group) => {
      set((state) => {
        const exists = state.groups.find((g) => g._id === group._id);
        if (exists) return {};
        socket.emit("joinGroup", group._id);
        return { groups: [group, ...state.groups] };
      });
    });

    socket.on("groupUpdated", (updatedGroup) => {
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        ),
        selectedGroup:
          state.selectedGroup?._id === updatedGroup._id
            ? updatedGroup
            : state.selectedGroup,
      }));
    });

    socket.on("memberLeft", ({ groupId, userId }) => {
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === groupId
            ? {
                ...g,
                members: g.members?.filter(
                  (m) => (m._id || m)?.toString() !== userId?.toString()
                ),
              }
            : g
        ),
      }));
    });

    // Group typing
    socket.off("typing");
    socket.off("stopTyping");

    socket.on("typing", ({ from, groupId }) => {
      if (groupId) {
        set((state) => ({
          typingUsers: { ...state.typingUsers, [`${groupId}-${from}`]: true },
        }));
      }
    });

    socket.on("stopTyping", ({ from, groupId }) => {
      if (groupId) {
        set((state) => {
          const updated = { ...state.typingUsers };
          delete updated[`${groupId}-${from}`];
          return { typingUsers: updated };
        });
      }
    });
  },

  unsubscribeFromGroupMessages: () => {
    const { socket } = useSocketStore.getState();
    if (!socket) return;
    socket.off("newGroupMessage");
    socket.off("newGroup");
    socket.off("groupUpdated");
    socket.off("memberLeft");
  },

  clearSelectedGroup: () => set({ selectedGroup: null, groupMessages: [] }),
}));
