import { useState } from "react";
import { Search, Plus, Users, MessageSquare, LogOut, Settings, ChevronDown, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import UserList from "../chat/UserList";
import GroupList from "../group/GroupList";

export default function Sidebar({ onOpenProfile, onCreateGroup }) {
  const { authUser, logout } = useAuthStore();
  const { searchUsers, fetchUsers, clearSelectedUser } = useChatStore();
  const { clearSelectedGroup } = useGroupStore();
  const [activeTab, setActiveTab] = useState("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (activeTab === "chats") {
      if (q.trim()) {
        searchUsers(q.trim());
      } else {
        fetchUsers();
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (activeTab === "chats") fetchUsers();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    clearSelectedUser();
    clearSelectedGroup();
    if (tab === "chats") fetchUsers();
  };

  return (
    <aside
      className="w-80 flex flex-col h-screen flex-shrink-0"
      style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="p-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)" }}
            >
              <MessageSquare size={16} color="white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: "Syne" }}>
              NexChat
            </span>
          </div>

          {activeTab === "groups" && (
            <button
              onClick={onCreateGroup}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)" }}
              title="Create Group"
            >
              <Plus size={15} color="white" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "var(--bg-tertiary)" }}
        >
          {["chats", "groups"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background:
                  activeTab === tab
                    ? "linear-gradient(135deg, var(--accent-primary), #8b5cf6)"
                    : "transparent",
                color: activeTab === tab ? "white" : "var(--text-secondary)",
              }}
            >
              {tab === "chats" ? <MessageSquare size={14} /> : <Users size={14} />}
              {tab === "chats" ? "Chats" : "Groups"}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder={activeTab === "chats" ? "Search people..." : "Search groups..."}
            className="nx-input"
            style={{ paddingLeft: 32, paddingRight: searchQuery ? 32 : 12, fontSize: 13, padding: "9px 12px 9px 32px" }}
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chats" ? (
          <UserList />
        ) : (
          <GroupList onCreateGroup={onCreateGroup} />
        )}
      </div>

      {/* User footer */}
      <div className="p-3 relative flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 w-full p-2 rounded-xl hover:opacity-80 transition-opacity"
        >
          <div className="relative flex-shrink-0">
            <img
              src={
                authUser.profilePic ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.firstName}`
              }
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover"
              style={{ border: "2px solid var(--border-active)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
              style={{ background: "var(--online)", border: "2px solid var(--bg-secondary)" }}
            />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold truncate">
              {authUser.firstName} {authUser.lastName}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {authUser.email}
            </p>
          </div>
          <ChevronDown
            size={14}
            style={{
              color: "var(--text-muted)",
              transform: showUserMenu ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </button>

        {showUserMenu && (
          <div
            className="absolute bottom-full left-3 right-3 mb-1 rounded-xl overflow-hidden shadow-xl z-10"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <button
              onClick={() => {
                onOpenProfile();
                setShowUserMenu(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:opacity-80 transition-opacity"
              style={{ color: "var(--text-primary)" }}
            >
              <Settings size={15} style={{ color: "var(--accent-secondary)" }} />
              Edit Profile
            </button>
            <div style={{ height: 1, background: "var(--border)" }} />
            <button
              onClick={() => {
                setShowUserMenu(false);
                logout();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:opacity-80 transition-opacity"
              style={{ color: "var(--danger)" }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
