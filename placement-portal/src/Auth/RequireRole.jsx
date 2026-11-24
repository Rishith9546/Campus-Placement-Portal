import { Navigate } from "react-router-dom";

const roleHome = {
  ROLE_ADMIN: "/admin",
  ROLE_RECRUITER: "/recruiterDashboard",
  ROLE_STUDENT: "/dashboard",
};

export default function RequireRole({ role, loginPath, children }) {
  const token = localStorage.getItem("token");
  const currentRole = localStorage.getItem("role");

  if (!token) return <Navigate to={loginPath} replace />;
  if (currentRole !== role) {
    return <Navigate to={roleHome[currentRole] || loginPath} replace />;
  }
  return children;
}
