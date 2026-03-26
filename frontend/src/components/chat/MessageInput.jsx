import { useState, useRef, useCallback } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { useSocketStore } from "../../store/useSocketStore";

export default function MessageInput({ receiverId, isGroup = false, groupId }) {
  const { sendMessage } = useChatStore();
  const { sendGroupMessage } = useGroupStore();
  const { socket } = useSocketStore();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const emitTyping = useCallback(() => {
    if (!socket) return;
    if (isGroup) {
      socket.emit("typing", { groupId });
    } else {
      socket.emit("typing", { to: receiverId });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isGroup) {
        socket.emit("stopTyping", { groupId });
      } else {
        socket.emit("stopTyping", { to: receiverId });
      }
    }, 1500);
  }, [socket, receiverId, isGroup, groupId]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
    // reset so same file can be selected again
    e.target.value = "";
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageData(null);
  };

  const handleSend = async () => {
    if (isSending) return;
    if (!text.trim() && !imageData) return;

    setIsSending(true);
    const payload = { text: text.trim(), image: imageData || "" };

    if (isGroup) {
      await sendGroupMessage(groupId, payload);
    } else {
      await sendMessage(receiverId, payload);
    }

    setText("");
    clearImage();
    setIsSending(false);

    // Stop typing indicator
    if (socket) {
      if (isGroup) socket.emit("stopTyping", { groupId });
      else socket.emit("stopTyping", { to: receiverId });
    }
    clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (text.trim() || imageData) && !isSending;

  return (
    <div
      className="px-4 pb-4 pt-3 flex-shrink-0"
      style={{ borderTop: "1px solid var(--border)", background: "var(--bg-primary)" }}
    >
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="preview"
            className="h-24 rounded-xl object-cover"
            style={{ border: "2px solid var(--border-active)" }}
          />
          <button
            onClick={clearImage}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "var(--danger)", color: "white" }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Image attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          title="Attach image"
        >
          <ImagePlus size={17} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            emitTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className="nx-input flex-1 resize-none"
          style={{
            lineHeight: "1.5",
            maxHeight: "120px",
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: canSend
              ? "linear-gradient(135deg, var(--accent-primary), #8b5cf6)"
              : "var(--bg-tertiary)",
            color: canSend ? "white" : "var(--text-muted)",
            opacity: isSending ? 0.7 : 1,
            cursor: canSend ? "pointer" : "default",
            boxShadow: canSend ? "0 4px 15px var(--accent-glow)" : "none",
          }}
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
