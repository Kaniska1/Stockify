import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  createdAt: string;
}

interface StoredUser extends User {
  passwordHash: string;
  walletBalance: number;
}

interface AuthContextValue {
  user: User | null;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  signup: (name: string, email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'email' | 'username' | 'avatar'>>) => void;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash.toString(16);
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem('smm_users') || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem('smm_users', JSON.stringify(users));
}

function getCurrentUserId(): string | null {
  return localStorage.getItem('smm_current_user');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const uid = getCurrentUserId();
    if (!uid) return null;
    const stored = getUsers().find(u => u.id === uid);
    if (!stored) return null;
    const { passwordHash: _p, walletBalance: _w, ...u } = stored;
    return u;
  });

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    await new Promise(r => setTimeout(r, 400));
    const users = getUsers();
    const lower = emailOrUsername.toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === lower || u.username.toLowerCase() === lower);
    if (!found) throw new Error('No account found with that email or username');
    if (found.passwordHash !== simpleHash(password)) throw new Error('Incorrect password');
    const { passwordHash: _p, walletBalance: _w, ...u } = found;
    localStorage.setItem('smm_current_user', found.id);
    setUser(u);
  }, []);

  const signup = useCallback(async (name: string, email: string, username: string, password: string) => {
    await new Promise(r => setTimeout(r, 500));
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already in use');
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) throw new Error('Username already taken');
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      username,
      avatar: '',
      createdAt: new Date().toISOString(),
      passwordHash: simpleHash(password),
      walletBalance: 100000,
    };
    saveUsers([...users, newUser]);
    const { passwordHash: _p, walletBalance: _w, ...u } = newUser;
    localStorage.setItem('smm_current_user', newUser.id);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('smm_current_user');
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<User, 'name' | 'email' | 'username' | 'avatar'>>) => {
    if (!user) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    Object.assign(users[idx], updates);
    saveUsers(users);
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, [user]);

  const changePassword = useCallback(async (current: string, next: string) => {
    await new Promise(r => setTimeout(r, 400));
    if (!user) throw new Error('Not logged in');
    const users = getUsers();
    const found = users.find(u => u.id === user.id);
    if (!found) throw new Error('User not found');
    if (found.passwordHash !== simpleHash(current)) throw new Error('Current password is incorrect');
    found.passwordHash = simpleHash(next);
    saveUsers(users);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
