import { createContext, useContext, useState, useEffect } from "react";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, storeAuthTokens, clearAuthTokens } from "../services/authService";
import api from "../services/api";


type User = {
  id: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  login: (data: { userId: string; username?: string; token: string; refreshToken: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore tokens from localStorage if page reloads
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userId = localStorage.getItem(USER_ID_KEY);

    if (token && refreshToken && userId) {
        api
      .get("/api/auth/me")
        .then((res) => setUser({ id: userId, username: res.data.name }))
        .catch((err) => {
            console.error("Error fetching user info:", err);
            setUser({ id: userId, username: "Unknown" });
        });
    }
  }, []);

  const login = async (data: { userId: string; username?: string; token: string; refreshToken: string }) => {
    // store tokens for API usage
    storeAuthTokens({ token: data.token, refreshToken: data.refreshToken, userId: data.userId });

    try {
      const res = await api.get("/api/auth/me");
      setUser({ id: res.data.id, username: res.data.name });
    } catch (err) {
      console.error("Failed to fetch user info after login", err);
      setUser({ id: data.userId, username: "Unknown" });
    }
};

  const logout = () => {
    clearAuthTokens(); // removes tokens from localStorage
    setUser(null);
  };
 
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}