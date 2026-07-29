import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { forgotPassword, resetPassword } from "../services/authService";
import "../styles/auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your registered email.");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword(email.trim());

      if (response.mobile) {
        setMobile(response.mobile);
        setStep("reset");
      }

      setMessage(response.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ mobile, otp: otp.trim(), newPassword });

      alert("Password reset successfully. Please log in.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form
        className="auth-card"
        onSubmit={step === "email" ? handleSendOtp : handleReset}
      >
        <div className="auth-title">Forgot Password</div>
        <div className="auth-subtitle">
          {step === "email"
            ? "Enter your registered email to receive an OTP."
            : "Enter the OTP and set a new password."}
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && !error && (
          <div className="auth-subtitle" style={{ color: "#4ade80" }}>
            {message}
          </div>
        )}

        {step === "email" ? (
          <input
            className="auth-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        ) : (
          <>
            <input
              className="auth-input"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />

            <input
              className="auth-input"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </>
        )}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : step === "email"
            ? "Send OTP"
            : "Reset Password"}
        </button>
      </form>
    </div>
  );
}