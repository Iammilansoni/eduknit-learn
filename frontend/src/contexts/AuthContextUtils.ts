// Utility types and hooks for AuthContext
import { useContext } from "react";
import { AuthContext } from "./AuthContextContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
