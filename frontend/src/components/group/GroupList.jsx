import { useGroupStore } from "../../store/useGroupStore";
import { useChatStore } from "../../store/useChatStore";
import { Users, Plus } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

function timeLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "dd/MM/yy");
}

export default function GroupList({ onCreateGroup }) {
  const { groups, selectedGroup, selectGroup, groupUnreadCounts, isLoadingGroups } = useGroupStore();
  const { clearSelectedUser } = useChatStore();

  const handleSelect = (group) => {
    clearSelectedUser();
    selectGroup(group);
  };

  if (isLoadingGroups) {
    return (
      <div className="p-3 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
            <div className="w-11 h-11 rounded-xl flex-shrink-0" style={{ background: "var(--bg-tertiary)" }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded" style={{ background: "var(--bg-tertiary)", width: "50%" }} />
              <div className="h-2 rounded" style={{ background: "var(--bg-tertiary)", width: "70%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3 p-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <Users size={24} style={{ color: "var(--text-muted)" }} />
        </div>
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          No groups yet.
          <br />
          Create one to get started!
        </p>
        <button
          onClick={onCreateGroup}
          className="nx-btn nx-btn-primary"
          style={{ padding: "8px 16px", fontSize: 13 }}
        >
          <Plus size={13} /> New Group
        </button>
      </div>
    );
  }

  return (
    <div className="py-2 px-2">
      {groups.map((group) => {
        const unread = groupUnreadCounts[group._id] || 0;
        const isSelected = selectedGroup?._id === group._id;
        const lastMsg = group.lastMessage;
        const lastMsgText = lastMsg?.text
          ? lastMsg.text.slice(0, 30) + (lastMsg.text.length > 30 ? "…" : "")
          : "No messages yet";

        return (
          <button
            key={group._id}
            onClick={() => handleSelect(group)}
            className={`sidebar-item w-full text-left ${isSelected ? "active" : ""}`}
          >
            {/* Group avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={
                  group.groupPic ||
                  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(group.name)}`
                }
                alt={group.name}
                className="w-11 h-11 rounded-xl object-cover"
              />
              <div
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
              >
                <Users size={10} style={{ color: "var(--accent-secondary)" }} />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-semibold truncate">{group.name}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {lastMsg?.createdAt && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {timeLabel(lastMsg.createdAt)}
                    </span>
                  )}
                  {unread > 0 && (
                    <span className="nx-badge">{unread > 99 ? "99+" : unread}</span>
                  )}
                </div>
              </div>
              <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                {group.members?.length} members · {lastMsgText}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
