import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // In demo mode, skip authentication
  if (DEMO_MODE) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}