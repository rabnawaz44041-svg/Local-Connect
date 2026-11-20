import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const saveSession = (nextUser, token, remember = true) => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    const store = remember ? localStorage : sessionStorage;
    store.setItem("user", JSON.stringify(nextUser));
    store.setItem("token", token);
    setUser(nextUser);
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    saveSession(data.data.user, data.data.token, true);
    return data.data.user;
  };

  const signupProvider = async (payload) => {
    const { data } = await api.post("/auth/signup/provider", payload);
    saveSession(data.data.user, data.data.token, true);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    saveSession(data.data.user, data.data.token, true);
    return data.data.user;
  };

  const login = async (email, password, rememberMe) => {
    const { data } = await api.post("/auth/login", { email, password, rememberMe });
    saveSession(data.data.user, data.data.token, rememberMe);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return undefined;
    let ignore = false;
    api.get("/auth/me").then(({ data }) => {
      if (!ignore && data.data?.user) {
        const store = localStorage.getItem("token") ? localStorage : sessionStorage;
        store.setItem("user", JSON.stringify(data.data.user));
        setUser(data.data.user);
      }
    }).catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, signup, signupProvider, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
