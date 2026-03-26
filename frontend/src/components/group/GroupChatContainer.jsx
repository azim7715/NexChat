import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Users, MoreVertical, X, LogOut, ArrowLeft, Loader2 } from "lucide-react";
import MessageBubble from "../chat/MessageBubble";
import MessageInput from "../chat/MessageInput";
import { format, isToday, isYesterday } from "date-fns";
import toast from "react-hot-toast";

function getDateLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM dd, yyyy");
}

export default function GroupChatContainer() {
  const {
    selectedGroup,
    groupMessages,
    fetchGroupMessages,
    clearSelectedGroup,
    leaveGroup,
    typingUsers,
    isLoadingGroupMessages,
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);

  // Get who is typing in this group
  const typingInGroup = Object.entries(typingUsers)
    .filter(([key, val]) => key.startsWith(selectedGroup._id) && val)
    .map(([key]) => key.split("-")[1]);

  useEffect(() => {
    if (selectedGroup?._id) {
      fetchGroupMessages(selectedGroup._id);
      setShowInfo(false);
    }
  }, [selectedGroup._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages, typingInGroup.length]);

  const groupedMessages = groupMessages.reduce((groups, msg) => {
    const label = getDateLabel(msg.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
    return groups;
  }, {});

  const handleLeave = async () => {
    if (!window.confirm(`Leave "${selectedGroup.name}"? You won't receive messages anymore.`)) return;
    setLeavingGroup(true);
    await leaveGroup(selectedGroup._id);
    setLeavingGroup(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}
      >
        <button
          onClick={clearSelectedGroup}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={18} />
        </button>

        <img
          src={
            selectedGroup.groupPic ||
            `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedGroup.name}`
          }
          alt={selectedGroup.name}
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{selectedGroup.name}</h3>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {typingInGroup.length > 0 ? (
              <span style={{ color: "var(--accent-secondary)" }}>Someone is typing...</span>
            ) : (
              `${selectedGroup.members?.length || 0} members`
            )}
          </p>
        </div>

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

      <div className="flex flex-1 min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {isLoadingGroupMessages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent-secondary)" }} />
              </div>
            ) : groupMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No messages yet. Start the conversation! 🎉
                </p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                <div key={dateLabel}>
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
                    const showAvatar =
                      !prevMsg || prevSenderId?.toString() !== currSenderId?.toString();
                    const isOwn = currSenderId?.toString() === authUser._id?.toString();
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
            {typingInGroup.length > 0 && (
              <div className="flex items-end gap-2 mt-2 animate-fade-in">
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

          <MessageInput isGroup={true} groupId={selectedGroup._id} />
        </div>

        {/* Info panel */}
        {showInfo && (
          <div
            className="w-60 flex-shrink-0 flex flex-col overflow-hidden"
            style={{ background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)" }}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center pt-2">
                <img
                  src={
                    selectedGroup.groupPic ||
                    `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedGroup.name}`
                  }
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3"
                  style={{ border: "2px solid var(--border-active)" }}
                />
                <h4 className="font-semibold text-sm" style={{ fontFamily: "Syne" }}>
                  {selectedGroup.name}
                </h4>
                {selectedGroup.description && (
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {selectedGroup.description}
                  </p>
                )}
              </div>

              <div
                className="p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Users size={13} style={{ color: "var(--accent-secondary)" }} />
                  <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    Members ({selectedGroup.members?.length || 0})
                  </p>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedGroup.members?.map((member) => {
                    const memberId = member._id || member;
                    const isAdmin = selectedGroup.admins?.some(
                      (a) => (a._id || a)?.toString() === memberId?.toString()
                    );
                    if (!member._id) return null; // skip unpopulated
                    return (
                      <div key={member._id} className="flex items-center gap-2">
                        <img
                          src={
                            member.profilePic ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}`
                          }
                          alt=""
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {member.firstName} {member.lastName}
                            {member._id === authUser._id ? " (you)" : ""}
                          </p>
                        </div>
                        {isAdmin && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{
                              background: "rgba(108,99,255,0.2)",
                              color: "var(--accent-secondary)",
                            }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={handleLeave}
                disabled={leavingGroup}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "var(--danger)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {leavingGroup ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogOut size={14} />
                )}
                Leave Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
