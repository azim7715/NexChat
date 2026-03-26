import { Sparkles } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: "var(--bg-primary)" }}>
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)",
            boxShadow: "0 20px 60px var(--accent-glow)"
          }}>
          <Sparkles size={36} color="white" />
        </div>
        {/* Spinner ring */}
        <div className="absolute -inset-2 rounded-[calc(1.5rem+8px)] border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "var(--accent-primary)",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          }} />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Syne" }}>NexChat</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Setting things up...</p>
      </div>
    </div>
  );
}
