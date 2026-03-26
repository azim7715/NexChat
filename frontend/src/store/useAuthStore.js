import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API = "/api/auth";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isVerifyingOTP: false,
  pendingEmail: null,

  checkAuth: async () => {
    try {
      const res = await axios.get(`${API}/check`, { withCredentials: true });
      set({ authUser: res.data });
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axios.post(`${API}/signup`, data, { withCredentials: true });
      set({ pendingEmail: data.email });
      toast.success(res.data.message || "OTP sent! Check the console 🔔");
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
      return { success: false };
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOTP: async ({ email, otp }) => {
    set({ isVerifyingOTP: true });
    try {
      const res = await axios.post(`${API}/verify-otp`, { email, otp }, { withCredentials: true });
      set({ authUser: res.data.user, pendingEmail: null });
      toast.success("Email verified! Welcome to NexChat 🎉");
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
      return { success: false };
    } finally {
      set({ isVerifyingOTP: false });
    }
  },

  resendOTP: async (email) => {
    try {
      await axios.post(`${API}/resend-otp`, { email }, { withCredentials: true });
      toast.success("New OTP sent! Check console 🔔");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axios.post(`${API}/login`, data, { withCredentials: true });
      set({ authUser: res.data });
      toast.success(`Welcome back, ${res.data.firstName}! 👋`);
      return { success: true };
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.needsVerification) {
        set({ pendingEmail: errData.email });
        toast.error("Please verify your email first");
        return { success: false, needsVerification: true, email: errData.email };
      }
      toast.error(errData?.message || "Login failed");
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API}/logout`, {}, { withCredentials: true });
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axios.put("/api/users/profile", data, { withCredentials: true });
      set({ authUser: res.data });
      toast.success("Profile updated!");
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      return { success: false };
    }
  },

  setPendingEmail: (email) => set({ pendingEmail: email }),
}));
