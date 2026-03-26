import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useSocketStore } from "../../store/useSocketStore";
import { Phone, Video, MoreVertical, X, ArrowLeft, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { format, isToday, isYesterday } from "date-fns";

function getDateLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM dd, yyyy");
}

export default function ChatContainer() {
  const { selectedUser, messages, fetchMessages, clearSelectedUser, typingUsers, isLoadingMessages } =
    useChatStore();
  const { authUser } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const messagesEndRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = !!typingUsers[selectedUser._id];

  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages(selectedUser._id);
      setShowInfo(false);
    }
  }, [selectedUser._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const label = getDateLabel(msg.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}
      >
        <button
          onClick={clearSelectedUser}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={18} />
        </button>

        <div className="relative flex-shrink-0">
          <img
            src={
              selectedUser.profilePic ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.firstName}`
            }
            alt={selectedUser.firstName}
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOnline && (
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
              style={{ background: "var(--online)", border: "2px solid var(--bg-secondary)" }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">
            {selectedUser.firstName} {selectedUser.lastName}
          </h3>
          <p
            className="text-xs"
            style={{ color: isOnline ? "var(--online)" : "var(--text-muted)" }}
          >
            {isTyping ? (
              <span style={{ color: "var(--accent-secondary)" }}>typing...</span>
            ) : isOnline ? (
              "● Online"
            ) : (
              "Offline"
            )}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            title="Voice call (coming soon)"
          >
            <Phone size={15} />
          </button>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            title="Video call (coming soon)"
          >
            <Video size={15} />
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{
              background: showInfo ? "var(--bg-hover)" : "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
          >
            {showInfo ? <X size={15} /> : <MoreVertical size={15} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Messages area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent-secondary)" }} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No messages yet. Say hello! 👋
                </p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                <div key={dateLabel}>
                  {/* Date separator */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    <span
                      className="text-xs px-3 py-1 rounded-full flex-shrink-0"
                      style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
                    >
                      {dateLabel}
                    </span>
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  </div>

                  {msgs.map((msg, i) => {
                    const prevMsg = msgs[i - 1];
                    const prevSenderId = prevMsg?.senderId?._id || prevMsg?.senderId;
                    const currSenderId = msg.senderId?._id || msg.senderId;
                    const showAvatar = !prevMsg || prevSenderId?.toString() !== currSenderId?.toString();
                    const isOwn =
                      currSenderId?.toString() === authUser._id?.toString();

                    return (
                      <MessageBubble
                        key={msg._id}
                        message={msg}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                      />
                    );
                  })}
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 mt-2 animate-fade-in">
                <img
                  src={
                    selectedUser.profilePic ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.firstName}`
                  }
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                  style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
                >
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <MessageInput receiverId={selectedUser._id} isGroup={false} />
        </div>

        {/* Info panel */}
        {showInfo && (
          <div
            className="w-60 flex-shrink-0 p-4 space-y-4 overflow-y-auto"
            style={{ background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)" }}
          >
            <div className="text-center pt-2">
              <img
                src={
                  selectedUser.profilePic ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.firstName}`
                }
                alt=""
                className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3"
                style={{ border: "2px solid var(--border-active)" }}
              />
              <h4 className="font-semibold text-sm" style={{ fontFamily: "Syne" }}>
                {selectedUser.firstName} {selectedUser.lastName}
              </h4>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {selectedUser.email}
              </p>
            </div>
            {selectedUser.bio && (
              <div
                className="p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Bio</p>
                <p className="text-sm leading-relaxed">{selectedUser.bio}</p>
              </div>
            )}
            <div
              className="p-3 rounded-xl"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Status</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: isOnline ? "var(--online)" : "var(--text-muted)" }}
                />
                <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
              </div>
            </div>
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              {messages.length} messages exchanged
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
