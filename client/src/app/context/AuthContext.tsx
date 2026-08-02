import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  loginRequest,
  signupRequest,
  getCurrentUserRequest,
  updateProfileRequest,
  changePasswordRequest,
  type AuthUser,
} from "../lib/auth";

export interface User extends AuthUser {}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  authLoading: boolean;

  login: (
    emailOrUsername: string,
    password: string
  ) => Promise<void>;

  signup: (
    name: string,
    email: string,
    username: string,
    password: string
  ) => Promise<void>;

  logout: () => void;

  updateProfile: (
    updates: Partial<
      Pick<
        User,
        "name" | "email" | "username" | "avatar"
      >
    >
  ) => Promise<void>;

  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

const TOKEN_STORAGE_KEY = "stockify_token";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem(TOKEN_STORAGE_KEY)
    );

  const [authLoading, setAuthLoading] =
    useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const saveSession = useCallback(
    (nextToken: string, nextUser: User) => {
      localStorage.setItem(
        TOKEN_STORAGE_KEY,
        nextToken
      );

      setToken(nextToken);
      setUser(nextUser);
    },
    []
  );

  const refreshUser = useCallback(async () => {
    const activeToken =
      token ??
      localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!activeToken) {
      setUser(null);
      return;
    }

    try {
      const response =
        await getCurrentUserRequest(activeToken);

      setToken(activeToken);
      setUser(response.user);
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [token, clearSession]);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken =
        localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const response =
          await getCurrentUserRequest(storedToken);

        setToken(storedToken);
        setUser(response.user);
      } catch {
        clearSession();
      } finally {
        setAuthLoading(false);
      }
    };

    void restoreSession();
  }, [clearSession]);

  const login = useCallback(
    async (
      emailOrUsername: string,
      password: string
    ) => {
      const response = await loginRequest(
        emailOrUsername,
        password
      );

      saveSession(
        response.token,
        response.user
      );
    },
    [saveSession]
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      username: string,
      password: string
    ) => {
      const response = await signupRequest({
        name,
        email,
        username,
        password,
      });

      saveSession(
        response.token,
        response.user
      );
    },
    [saveSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const updateProfile = useCallback(
    async (
      updates: Partial<
        Pick<
          User,
          "name" | "email" | "username" | "avatar"
        >
      >
    ) => {
      if (!token) {
        throw new Error("You are not logged in");
      }

      const response =
        await updateProfileRequest(
          token,
          updates
        );

      setUser(response.user);
    },
    [token]
  );

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string
    ) => {
      if (!token) {
        throw new Error("You are not logged in");
      }

      await changePasswordRequest(
        token,
        currentPassword,
        newPassword
      );
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}