import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Sparkles, Zap } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, setPendingEmail } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result?.needsVerification) {
      setPendingEmail(result.email);
      navigate("/verify-otp");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #13131f 50%, #0a0a14 100%)" }}>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)" }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(var(--accent-primary) 1px, transparent 1px), linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)" }}>
            <Sparkles size={20} color="white" />
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "Syne" }}>NexChat</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "var(--accent-secondary)" }}>
            <Zap size={14} /> Real-time communication
          </div>
          <h2 className="text-4xl font-bold leading-tight" style={{ fontFamily: "Syne" }}>
            Welcome back to<br />
            <span className="gradient-text">your conversations.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "380px" }}>
            Pick up right where you left off. Your messages, groups, and connections are waiting for you.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Messages/sec", value: "10K+" },
              { label: "Online Users", value: "99.9%" },
              { label: "Uptime", value: "∞" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-3 rounded-xl" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
                <div className="text-xl font-bold" style={{ fontFamily: "Syne", color: "var(--accent-secondary)" }}>
                  {stat.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs" style={{ color: "var(--text-muted)" }}>
          © 2024 NexChat. Built with MERN + Socket.io
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="w-full max-w-md">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)" }}>
              <Sparkles size={16} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "Syne" }}>NexChat</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Syne" }}>Sign in</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input type="email" placeholder="arjun@example.com" className="nx-input"
                  style={{ paddingLeft: 36 }}
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input type={showPassword ? "text" : "password"} placeholder="Your password"
                  className="nx-input" style={{ paddingLeft: 36, paddingRight: 42 }}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Demo credentials hint */}
            <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>Demo:</span> arjun@demo.com / demo1234
            </div>

            <button type="submit" disabled={isLoggingIn}
              className="nx-btn nx-btn-primary w-full" style={{ padding: "14px 24px" }}>
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p className="text-center mt-6" style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--accent-secondary)", fontWeight: 600 }}
              className="hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
