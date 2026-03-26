import { useState, useRef } from "react";
import { X, Camera, User, FileText, Save, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { motion } from "framer-motion";

export default function ProfileModal({ onClose }) {
  const { authUser, updateProfile } = useAuthStore();
  const [firstName, setFirstName] = useState(authUser.firstName || "");
  const [lastName, setLastName] = useState(authUser.lastName || "");
  const [bio, setBio] = useState(authUser.bio || "");
  const [previewPic, setPreviewPic] = useState(
    authUser.profilePic ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.firstName}`
  );
  const [picData, setPicData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPic(reader.result);
      setPicData(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setIsSaving(true);
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      bio: bio.trim(),
    };
    if (picData) payload.profilePic = picData;
    await updateProfile(payload);
    setIsSaving(false);
    onClose();
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
          <h2 className="text-lg font-bold" style={{ fontFamily: "Syne" }}>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar upload */}
          <div className="flex justify-center">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <img
                src={previewPic}
                alt="avatar"
                className="w-24 h-24 rounded-3xl object-cover transition-all group-hover:opacity-75"
                style={{ border: "3px solid var(--border-active)" }}
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.firstName}`;
                }}
              />
              <div
                className="absolute inset-0 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(108,99,255,0.5)" }}
              >
                <Camera size={24} color="white" />
              </div>
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                style={{ background: "var(--accent-primary)", color: "white" }}
              >
                Change photo
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                First Name
              </label>
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  className="nx-input"
                  style={{ paddingLeft: 30 }}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={30}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Last Name
              </label>
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  className="nx-input"
                  style={{ paddingLeft: 30 }}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={30}
                />
              </div>
            </div>
          </div>

          {/* Email readonly */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Email (read-only)
            </label>
            <input
              type="email"
              className="nx-input"
              value={authUser.email}
              readOnly
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>

          {/* Bio */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Bio{" "}
              <span style={{ color: "var(--text-muted)" }}>({bio.length}/200)</span>
            </label>
            <div className="relative">
              <FileText
                size={13}
                className="absolute left-3 top-3.5"
                style={{ color: "var(--text-muted)" }}
              />
              <textarea
                className="nx-input resize-none"
                style={{ paddingLeft: 30 }}
                placeholder="Tell people about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
              />
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
            onClick={handleSave}
            disabled={isSaving || !firstName.trim() || !lastName.trim()}
            className="nx-btn nx-btn-primary flex-1"
            style={{
              opacity: !firstName.trim() || !lastName.trim() ? 0.5 : 1,
            }}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={14} /> Save Changes
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
