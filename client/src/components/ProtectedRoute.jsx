import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredToken, getStoredUser } from "../utils/authStorage.js";

export default function ProtectedRoute({ children }) {
  const token = getStoredToken();
  const user = getStoredUser();

  return token && user._id ? children : <Navigate to="/auth" replace />;
}
