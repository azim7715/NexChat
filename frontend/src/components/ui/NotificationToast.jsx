import { useSocketStore } from "../../store/useSocketStore";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { X, MessageSquare } from "lucide-react";

export default function NotificationToast() {
  const { notifications, removeNotification } = useSocketStore();
  const { selectUser, users, clearSelectedUser } = useChatStore();
  const { selectGroup, groups, clearSelectedGroup } = useGroupStore();

  const handleClick = (notification) => {
    if (notification.groupId) {
      const group = groups.find((g) => g._id === notification.groupId);
      if (group) {
        clearSelectedUser();
        selectGroup(group);
      }
    } else {
      const fromId = notification.from?._id?.toString();
      const user = users.find((u) => u._id?.toString() === fromId);
      if (user) {
        clearSelectedGroup();
        selectUser(user);
      }
    }
    removeNotification(notification.id);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="animate-notification pointer-events-auto flex items-center gap-3 p-3 rounded-2xl cursor-pointer"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-active)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.2)",
            maxWidth: "320px",
            minWidth: "260px",
          }}
          onClick={() => handleClick(notif)}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={
                notif.from?.profilePic ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.from?.firstName || "user"}`
              }
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent-primary)" }}
            >
              <MessageSquare size={10} color="white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold truncate">
                {notif.groupName
                  ? notif.groupName
                  : `${notif.from?.firstName || ""} ${notif.from?.lastName || ""}`}
              </p>
              <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                now
              </span>
            </div>
            {notif.groupName && (
              <p className="text-xs" style={{ color: "var(--accent-secondary)" }}>
                {notif.from?.firstName}
              </p>
            )}
            <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {notif.message || "New message"}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notif.id);
            }}
            className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
