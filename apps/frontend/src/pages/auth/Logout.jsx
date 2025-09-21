// src/pages/auth/Logout.jsx
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await logout();
      navigate("/login", { replace: true });
    })();
  }, [logout, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Logging out...</p>
    </div>
  );
}
