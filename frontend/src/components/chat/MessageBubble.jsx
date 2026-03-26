import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Smile, Check, CheckCheck } from "lucide-react";
import axios from "axios";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

const EMOJIS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

export default function MessageBubble({ message, isOwn, showAvatar }) {
  const { authUser } = useAuthStore();
  const { deleteMessage, updateReaction } = useChatStore();
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (message.messageType === "system") {
    return (
      <div className="flex justify-center my-2">
        <span
          className="text-xs px-3 py-1 rounded-full"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
        >
          {message.text}
        </span>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/messages/${message._id}`, { withCredentials: true });
      deleteMessage(message._id);
    } catch (err) {
      console.error("Delete error:", err.message);
    }
    setShowActions(false);
  };

  const handleReact = async (emoji) => {
    try {
      const res = await axios.put(
        `/api/messages/react/${message._id}`,
        { emoji },
        { withCredentials: true }
      );
      updateReaction(message._id, res.data);
    } catch (err) {
      console.error("Reaction error:", err.message);
    }
    setShowEmojiPicker(false);
  };

  // Aggregate reactions by emoji
  const reactionCounts = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const isRead = (message.readBy || []).length > 1;

  return (
    <div
      className={`flex items-end gap-2 mb-1 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowEmojiPicker(false);
      }}
    >
      {/* Sender avatar (only for received messages) */}
      {!isOwn && (
        <div className="w-7 flex-shrink-0">
          {showAvatar && (
            <img
              src={
                message.senderId?.profilePic ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId?.firstName || "user"}`
              }
              alt=""
              className="w-7 h-7 rounded-full object-cover"
            />
          )}
        </div>
      )}

      <div
        className={`flex flex-col max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? "items-end" : "items-start"}`}
      >
        {/* Sender name in group chats */}
        {!isOwn && showAvatar && message.senderId?.firstName && (
          <span className="text-xs mb-1 px-1" style={{ color: "var(--accent-secondary)" }}>
            {message.senderId.firstName} {message.senderId.lastName}
          </span>
        )}

        {/* Bubble */}
        <div className="relative">
          <div
            className={isOwn ? "msg-bubble-out" : "msg-bubble-in"}
            style={{ padding: "10px 14px", wordBreak: "break-word" }}
          >
            {message.isDeleted ? (
              <span className="italic text-sm opacity-60">🚫 This message was deleted</span>
            ) : (
              <>
                {message.image && (
                  <img
                    src={message.image}
                    alt="attachment"
                    className="rounded-xl mb-2 max-w-full cursor-pointer"
                    style={{ maxHeight: 200, display: "block" }}
                    onClick={() => window.open(message.image, "_blank")}
                  />
                )}
                {message.text && (
                  <p className="text-sm leading-relaxed">{message.text}</p>
                )}
              </>
            )}
          </div>

          {/* Reactions */}
          {Object.keys(reactionCounts).length > 0 && (
            <div
              className={`flex gap-0.5 mt-1 flex-wrap ${isOwn ? "justify-end" : "justify-start"}`}
            >
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-xs px-1.5 py-0.5 rounded-full hover:scale-110 transition-transform"
                  style={{
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {emoji} {count > 1 ? count : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp + read receipt */}
        <div
          className={`flex items-center gap-1 mt-0.5 ${isOwn ? "flex-row-reverse" : ""}`}
        >
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
          {isOwn && !message.isDeleted && (
            isRead
              ? <CheckCheck size={13} style={{ color: "var(--accent-cyan)" }} />
              : <Check size={13} style={{ color: "var(--text-muted)" }} />
          )}
        </div>
      </div>

      {/* Hover action buttons */}
      {!message.isDeleted && (
        <div
          className={`flex items-center gap-1 transition-opacity ${showActions ? "opacity-100" : "opacity-0"} ${isOwn ? "flex-row-reverse" : ""}`}
        >
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            >
              <Smile size={13} />
            </button>
            {showEmojiPicker && (
              <div
                className={`absolute bottom-9 ${isOwn ? "right-0" : "left-0"} flex gap-1 p-2 rounded-xl z-20`}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                  whiteSpace: "nowrap",
                }}
              >
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => handleReact(e)}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isOwn && (
            <button
              onClick={handleDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ background: "var(--bg-tertiary)", color: "var(--danger)" }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
