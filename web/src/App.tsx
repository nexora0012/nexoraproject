import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./layouts/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";

import Dashboard from "./pages/dashboard/Dashboard";
import Plans from "./pages/plans/Plans";
import Subscription from "./pages/subscription/Subscription";
import Wallet from "./pages/wallet/Wallet";
import UsdtDeposit from "./pages/usdt/UsdtDeposit";
import Payments from "./pages/payments/Payments";
import Profile from "./pages/profile/Profile";
import Announcements from "./pages/announcements/Announcements";
import Settings from "./pages/settings/Settings";
import ReferAndEarn from "./pages/referral/ReferAndEarn";
import BackgroundEffects from "./components/BackgroundEffects";
import "./styles/background.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BackgroundEffects />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Protected Routes with Layout */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/usdt-deposit" element={<UsdtDeposit />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/refer-and-earn" element={<ReferAndEarn />} />

          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;