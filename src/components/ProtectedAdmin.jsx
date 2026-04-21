import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedAdmin({ children }) {
  const { isAdmin } = useContext(AuthContext);
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
