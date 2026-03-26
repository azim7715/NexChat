import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signup(form);
    if (result.success) {
      navigate("/verify-otp");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #13131f 50%, #0a0a14 100%)" }}>
        {/* Glow effects */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)" }} />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)" }}>
            <Sparkles size={20} color="white" />
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "Syne", color: "var(--text-primary)" }}>
            NexChat
          </span>
        </div>

        {/* Feature highlights */}
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight" style={{ fontFamily: "Syne", color: "var(--text-primary)" }}>
            Connect with anyone,<br />
            <span className="gradient-text">anywhere, anytime.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Experience next-generation messaging with real-time delivery, group chats, and beautiful design crafted for modern teams.
          </p>
          <div className="space-y-3">
            {["Real-time messaging with Socket.io", "Create & manage group chats", "Online presence indicators", "Emoji reactions & media sharing"].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3" style={{ color: "var(--text-secondary)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-primary)" }} />
                <span style={{ fontSize: 14 }}>{f}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Abstract decoration */}
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1 rounded-full flex-1"
              style={{ background: i === 0 ? "var(--accent-primary)" : "var(--bg-tertiary)" }} />
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)" }}>
              <Sparkles size={16} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "Syne" }}>NexChat</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Syne" }}>Create account</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Join NexChat and start connecting with your team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  First Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input type="text" placeholder="Arjun" className="nx-input" style={{ paddingLeft: 36 }}
                    value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Last Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input type="text" placeholder="Sharma" className="nx-input" style={{ paddingLeft: 36 }}
                    value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input type="email" placeholder="arjun@example.com" className="nx-input" style={{ paddingLeft: 36 }}
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
                <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                  className="nx-input" style={{ paddingLeft: 36, paddingRight: 42 }}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSigningUp}
              className="nx-btn nx-btn-primary w-full mt-2" style={{ padding: "14px 24px" }}>
              {isSigningUp ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center mt-6" style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent-secondary)", fontWeight: 600 }}
              className="hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
