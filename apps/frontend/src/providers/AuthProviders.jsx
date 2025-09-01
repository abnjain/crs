import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logoutUser } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // useEffect(() => {
  //   async function fetchUser() {
  //     try {
  //       const res = await getCurrentUser();
  //       if (res.ok) {
  //         setUser(res.user);
  //       }
  //     } catch (err) {
  //       console.error(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchUser();
  // }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
