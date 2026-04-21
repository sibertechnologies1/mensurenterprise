import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (raw) setCurrentUser(JSON.parse(raw));
      // seed a default admin user if none exist
      const usersRaw = localStorage.getItem("users");
      if (!usersRaw) {
        const seed = [{ email: "admin@local", password: "admin123", name: "Admin", role: "admin" }];
        localStorage.setItem("users", JSON.stringify(seed));
      }
    } catch (e) {}
  }, []);

  const persistCurrent = (user) => {
    try {
      if (user) localStorage.setItem("currentUser", JSON.stringify(user));
      else localStorage.removeItem("currentUser");
      window.dispatchEvent(new Event("authUpdate"));
    } catch (e) {}
  };

  const register = ({ email, password, name, role = "customer" }) => {
    try {
      const raw = localStorage.getItem("users");
      const users = raw ? JSON.parse(raw) : [];
      if (users.find((u) => u.email === email)) throw new Error("User exists");
      const user = { email, password, name, role };
      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));
      setCurrentUser({ email, name, role });
      persistCurrent({ email, name, role });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  };

  const login = ({ email, password }) => {
    try {
      const raw = localStorage.getItem("users");
      const users = raw ? JSON.parse(raw) : [];
      const found = users.find((u) => u.email === email && u.password === password);
      if (!found) return { ok: false, error: "Invalid credentials" };
      const user = { email: found.email, name: found.name, role: found.role };
      setCurrentUser(user);
      persistCurrent(user);
      return { ok: true, user };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    persistCurrent(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout, isAuthenticated: !!currentUser, isAdmin: currentUser?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
