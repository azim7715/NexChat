import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useSocketStore } from "./store/useSocketStore";

import SignupPage from "./pages/SignupPage";
import OTPPage from "./pages/OTPPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import LoadingScreen from "./components/ui/LoadingScreen";
import NotificationToast from "./components/ui/NotificationToast";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser?._id) {
      connect(authUser._id);
    } else {
      disconnect();
    }
  }, [authUser?._id]);

  if (isCheckingAuth) return <LoadingScreen />;

  return (
    <>
      <Routes>
        <Route path="/" element={authUser ? <ChatPage /> : <Navigate to="/login" replace />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" replace />} />
        <Route path="/verify-otp" element={!authUser ? <OTPPage /> : <Navigate to="/" replace />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
          },
        }}
      />
      <NotificationToast />
    </>
  );
}

export default App;
