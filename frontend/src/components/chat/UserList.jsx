import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { useSocketStore } from "../../store/useSocketStore";

export default function UserList() {
  const { users, selectedUser, selectUser, unreadCounts, isLoadingUsers } = useChatStore();
  const { clearSelectedGroup } = useGroupStore();
  const { onlineUsers } = useSocketStore();

  const handleSelect = (user) => {
    clearSelectedGroup();
    selectUser(user);
  };

  // Sort: online first → unread count → alphabetical
  const sortedUsers = [...users].sort((a, b) => {
    const aOnline = onlineUsers.includes(a._id);
    const bOnline = onlineUsers.includes(b._id);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    const aUnread = unreadCounts[a._id] || 0;
    const bUnread = unreadCounts[b._id] || 0;
    if (bUnread !== aUnread) return bUnread - aUnread;
    return a.firstName.localeCompare(b.firstName);
  });

  if (isLoadingUsers) {
    return (
      <div className="p-3 space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
            <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ background: "var(--bg-tertiary)" }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded" style={{ background: "var(--bg-tertiary)", width: "55%" }} />
              <div className="h-2 rounded" style={{ background: "var(--bg-tertiary)", width: "75%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 p-4">
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          No users found
        </p>
      </div>
    );
  }

  return (
    <div className="py-2 px-2">
      {/* Online section label */}
      {onlineUsers.length > 0 && (
        <p className="text-xs font-semibold px-2 mb-1" style={{ color: "var(--text-muted)" }}>
          ONLINE — {sortedUsers.filter((u) => onlineUsers.includes(u._id)).length}
        </p>
      )}

      {sortedUsers.map((user) => {
        const isOnline = onlineUsers.includes(user._id);
        const unread = unreadCounts[user._id] || 0;
        const isSelected = selectedUser?._id === user._id;

        return (
          <button
            key={user._id}
            onClick={() => handleSelect(user)}
            className={`sidebar-item w-full text-left ${isSelected ? "active" : ""}`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={
                  user.profilePic ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}${user.lastName}`
                }
                alt={user.firstName}
                className="w-11 h-11 rounded-full object-cover"
              />
              {isOnline && (
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                  style={{ background: "var(--online)", border: "2px solid var(--bg-secondary)" }}
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-semibold truncate">
                  {user.firstName} {user.lastName}
                </span>
                {unread > 0 && (
                  <span className="nx-badge flex-shrink-0">{unread > 99 ? "99+" : unread}</span>
                )}
              </div>
              <p className="text-xs truncate mt-0.5" style={{ color: isOnline ? "var(--online)" : "var(--text-muted)" }}>
                {isOnline ? "● Online" : user.bio || "Hey there! I'm on NexChat 👋"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
