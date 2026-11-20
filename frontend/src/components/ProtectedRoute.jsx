import { Navigate } from "react-router-dom";
import { staffPath } from "../config/staffPath";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    const destination = user.role === "ADMIN" ? staffPath : user.role === "PROVIDER" ? "/provider/dashboard" : "/customer/dashboard";
    return <Navigate to={destination} replace />;
  }

  return children;
}
