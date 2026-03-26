import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, RefreshCw, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";

export default function OTPPage() {
  const navigate = useNavigate();
  const { verifyOTP, resendOTP, isVerifyingOTP, pendingEmail } = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!pendingEmail) {
      navigate("/signup");
      return;
    }
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value.slice(-1);
    setOtp(newOtp);
    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return;
    const result = await verifyOTP({ email: pendingEmail, otp: otpString });
    if (result.success) navigate("/");
  };

  const handleResend = async () => {
    await resendOTP(pendingEmail);
    setResendTimer(60);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-primary)" }}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)" }} />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass rounded-3xl p-8 relative"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

        <button onClick={() => navigate("/signup")}
          className="flex items-center gap-2 mb-8 text-sm hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={16} /> Back to signup
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
            style={{ background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)", boxShadow: "0 8px 32px var(--accent-glow)" }}>
            <Shield size={36} color="white" />
            <div className="absolute inset-0 rounded-2xl animate-pulse-glow" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Syne" }}>
            Verify your email
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            We sent a 6-digit code to
          </p>
          <p className="font-semibold mt-1" style={{ color: "var(--accent-secondary)" }}>
            {pendingEmail}
          </p>
          <p className="text-xs mt-2 px-4 py-2 rounded-lg" style={{ color: "var(--warning)", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            🔔 Check your terminal/console for the OTP
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input key={idx} ref={(el) => (inputRefs.current[idx] = el)}
                type="text" inputMode="numeric" maxLength={1}
                className="otp-input" value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)} />
            ))}
          </div>

          <button type="submit" disabled={isVerifyingOTP || otp.join("").length !== 6}
            className="nx-btn nx-btn-primary w-full"
            style={{ padding: "14px", opacity: otp.join("").length !== 6 ? 0.5 : 1 }}>
            {isVerifyingOTP ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : "Verify & Continue →"}
          </button>
        </form>

        <div className="text-center mt-6">
          {resendTimer > 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Resend OTP in <span style={{ color: "var(--accent-secondary)" }}>{resendTimer}s</span>
            </p>
          ) : (
            <button onClick={handleResend}
              className="flex items-center gap-2 mx-auto text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "var(--accent-secondary)" }}>
              <RefreshCw size={14} /> Resend OTP
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
