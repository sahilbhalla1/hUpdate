import { Navigate } from "react-router-dom";
import { isAuth } from "./helpers";

const ProtectedRoute = ({ children, allowedRoles }) => {
  try {
    const user = isAuth();
    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) return <Navigate to="/" replace />;
    return children;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
