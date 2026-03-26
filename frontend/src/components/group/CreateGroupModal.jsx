import { useState, useEffect } from "react";
import { X, Users, Search, Check } from "lucide-react";
import { useGroupStore } from "../../store/useGroupStore";
import { useChatStore } from "../../store/useChatStore";
import { motion } from "framer-motion";

export default function CreateGroupModal({ onClose }) {
  const { createGroup } = useGroupStore();
  const { users, fetchUsers } = useChatStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || selectedMembers.length === 0) return;
    setIsCreating(true);
    const result = await createGroup({
      name: name.trim(),
      description: description.trim(),
      members: selectedMembers,
    });
    setIsCreating(false);
    if (result.success) onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md mx-4 rounded-3xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)" }}
            >
              <Users size={18} color="white" />
            </div>
            <h2 className="text-lg font-bold" style={{ fontFamily: "Syne" }}>
              New Group
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Group Name <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="text"
              className="nx-input"
              placeholder="e.g. Dev Squad 🚀"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Description
            </label>
            <input
              type="text"
              className="nx-input"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Selected member chips */}
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((id) => {
                const user = users.find((u) => u._id === id);
                if (!user) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                    style={{
                      background: "rgba(108,99,255,0.2)",
                      border: "1px solid rgba(108,99,255,0.3)",
                      color: "var(--accent-secondary)",
                    }}
                  >
                    {user.firstName} {user.lastName}
                    <button onClick={() => toggleMember(id)}>
                      <X size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Member search */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Add Members <span style={{ color: "var(--danger)" }}>*</span>{" "}
              <span style={{ color: "var(--text-muted)" }}>({selectedMembers.length} selected)</span>
            </label>
            <div className="relative mb-2">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                className="nx-input"
                style={{ paddingLeft: 30, fontSize: 13, padding: "9px 12px 9px 30px" }}
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div
              className="max-h-44 overflow-y-auto rounded-xl"
              style={{ border: "1px solid var(--border)" }}
            >
              {filtered.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                  No users found
                </p>
              ) : (
                filtered.map((user) => {
                  const isSelected = selectedMembers.includes(user._id);
                  return (
                    <button
                      key={user._id}
                      onClick={() => toggleMember(user._id)}
                      className="flex items-center gap-3 w-full px-3 py-2 hover:opacity-80 transition-all"
                      style={{
                        background: isSelected ? "rgba(108,99,255,0.12)" : "transparent",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <img
                        src={
                          user.profilePic ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {user.email}
                        </p>
                      </div>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--accent-primary)" }}
                        >
                          <Check size={11} color="white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex gap-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button onClick={onClose} className="nx-btn nx-btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !name.trim() || selectedMembers.length === 0}
            className="nx-btn nx-btn-primary flex-1"
            style={{
              opacity: !name.trim() || selectedMembers.length === 0 ? 0.5 : 1,
              cursor: !name.trim() || selectedMembers.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              `Create Group (${selectedMembers.length} members)`
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
