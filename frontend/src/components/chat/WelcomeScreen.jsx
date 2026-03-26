import { MessageSquare, Users, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, label: "Real-time messaging", desc: "Instant delivery with Socket.io" },
  { icon: Users, label: "Group chats", desc: "Create and manage groups" },
  { icon: Shield, label: "Secure", desc: "JWT + httpOnly cookies" },
];

export default function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}>
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="text-center max-w-md">

        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)",
            boxShadow: "0 20px 60px var(--accent-glow)"
          }}>
          <MessageSquare size={44} color="white" />
        </div>

        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Syne" }}>
          Welcome to <span className="gradient-text">NexChat</span>
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          Select a conversation from the sidebar to start chatting,
          or create a new group to connect with multiple people.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-3">
          {features.map(({ icon: Icon, label, desc }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="p-4 rounded-2xl text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(108,99,255,0.15)" }}>
                <Icon size={18} style={{ color: "var(--accent-secondary)" }} />
              </div>
              <p className="text-xs font-semibold mb-1">{label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
