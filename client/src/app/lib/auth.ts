import api from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  walletBalance: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface UserResponse {
  user: AuthUser;
}

export const loginRequest = (
  emailOrUsername: string,
  password: string
) =>
  api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: emailOrUsername,
      password,
    }),
  });

export const signupRequest = (data: {
  name: string;
  email: string;
  username: string;
  password: string;
}) =>
  api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getCurrentUserRequest = (
  token: string
) =>
  api<UserResponse>("/auth/me", {
    token,
  });

export const updateProfileRequest = (
  token: string,
  updates: Partial<
    Pick<
      AuthUser,
      "name" | "email" | "username" | "avatar"
    >
  >
) =>
  api<UserResponse>("/auth/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(updates),
  });

export const changePasswordRequest = (
  token: string,
  currentPassword: string,
  newPassword: string
) =>
  api<{ message: string }>("/auth/password", {
    method: "PATCH",
    token,
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  export const depositFundsRequest = (
  token: string,
  amount: number
) =>
  api<UserResponse>('/auth/wallet/deposit', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ amount }),
  });