import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  const raw = localStorage.getItem("user");
  let isLoggedIn = false;

  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user?.email) isLoggedIn = true;
    } catch {
      isLoggedIn = false;
    }
  }

  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
