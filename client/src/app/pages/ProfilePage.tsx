import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { getStockLogo } from "../lib/getStockLogo";
import {
  AlertCircle,
  Camera,
  Check,
  Lock,
  Mail,
  Shield,
  User,
  Wallet,
} from "lucide-react";

import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type ProfileTab = "profile" | "security";

interface ProfileForm {
  name: string;
  email: string;
  username: string;
}

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

function formatCurrency(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  if (absolute >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return `$${value.toFixed(2)}`;
}

export default function ProfilePage() {
  const {
    user,
    updateProfile,
    changePassword,
  } = useAuth();

  const {
    walletBalance,
    portfolioValue,
    transactions,
    holdings,
  } = useApp();

  const [activeTab, setActiveTab] =
    useState<ProfileTab>("profile");

  const [profileForm, setProfileForm] =
    useState<ProfileForm>({
      name: user?.name ?? "",
      email: user?.email ?? "",
      username: user?.username ?? "",
    });

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>({
      current: "",
      next: "",
      confirm: "",
    });

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [avatarLoading, setAvatarLoading] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  useEffect(() => {
    setProfileForm({
      name: user?.name ?? "",
      email: user?.email ?? "",
      username: user?.username ?? "",
    });
  }, [
    user?.name,
    user?.email,
    user?.username,
  ]);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const memberSince = user?.createdAt
    ? new Date(
        user.createdAt
      ).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Not available";

  const totalAccountValue =
    portfolioValue + walletBalance;

  const handleProfileSave = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setProfileError("");

    const name = profileForm.name.trim();
    const email = profileForm.email.trim();
    const username =
      profileForm.username.trim();

    if (!name || !email || !username) {
      setProfileError(
        "Name, email and username are required."
      );

      return;
    }

    setProfileLoading(true);

    try {
      await updateProfile({
        name,
        email,
        username,
      });

      toast.success(
        "Profile updated successfully"
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Failed to update profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setPasswordError("");

    if (
      !passwordForm.current ||
      !passwordForm.next ||
      !passwordForm.confirm
    ) {
      setPasswordError(
        "All password fields are required."
      );

      return;
    }

    if (
      passwordForm.next !==
      passwordForm.confirm
    ) {
      setPasswordError(
        "The new passwords do not match."
      );

      return;
    }

    if (passwordForm.next.length < 8) {
      setPasswordError(
        "The new password must contain at least 8 characters."
      );

      return;
    }

    if (
      passwordForm.current ===
      passwordForm.next
    ) {
      setPasswordError(
        "The new password must be different from the current password."
      );

      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(
        passwordForm.current,
        passwordForm.next
      );

      setPasswordForm({
        current: "",
        next: "",
        confirm: "",
      });

      toast.success(
        "Password changed successfully"
      );
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select a valid image file."
      );

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        "The profile image must be smaller than 2 MB."
      );

      return;
    }

    setAvatarLoading(true);

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        if (
          typeof reader.result !== "string"
        ) {
          throw new Error(
            "Unable to read the selected image"
          );
        }

        await updateProfile({
          avatar: reader.result,
        });

        toast.success(
          "Profile image updated"
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update profile image"
        );
      } finally {
        setAvatarLoading(false);
      }
    };

    reader.onerror = () => {
      setAvatarLoading(false);

      toast.error(
        "Unable to read the selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-page">
      <section className="profile-heading">
        <div>
          <span className="profile-eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h1>Profile</h1>

          <p>
            Manage your personal information,
            account identity and login security.
          </p>
        </div>
      </section>

      <section className="profile-identity-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.name} profile`}
              />
            ) : (
              <span>{initials}</span>
            )}

            {avatarLoading && (
              <div className="profile-avatar-loading">
                <span />
              </div>
            )}
          </div>

          <label
            className="profile-avatar-button"
            title="Change profile image"
          >
            <Camera size={13} />

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                void handleAvatarChange(event)
              }
              disabled={avatarLoading}
            />
          </label>
        </div>

        <div className="profile-identity-copy">
          <span>STOCKIFY INVESTOR</span>

          <h2>
            {user?.name ?? "Stockify User"}
          </h2>

          <div>
            <span>
              @{user?.username ?? "investor"}
            </span>

            <i />

            <span>
              {user?.email ??
                "No email available"}
            </span>
          </div>

          <small>
            Member since {memberSince}
          </small>
        </div>

        <div className="profile-account-value">
          <span>Total account value</span>

          <strong className="sf-number">
            {formatCurrency(
              totalAccountValue
            )}
          </strong>

          <small>
            Portfolio and available cash
          </small>
        </div>
      </section>

      <section className="profile-stats-grid">
        <article>
          <span>
            <Wallet size={15} />
            Portfolio value
          </span>

          <strong className="sf-number">
            {formatCurrency(
              portfolioValue
            )}
          </strong>

          <small>
            Current holdings value
          </small>
        </article>

        <article>
          <span>
            <Wallet size={15} />
            Cash balance
          </span>

          <strong className="sf-number">
            {formatCurrency(
              walletBalance
            )}
          </strong>

          <small>
            Available simulated funds
          </small>
        </article>

        <article>
          <span>
            <User size={15} />
            Holdings
          </span>

          <strong className="sf-number">
            {holdings.length}
          </strong>

          <small>
            Active positions
          </small>
        </article>

        <article>
          <span>
            <Check size={15} />
            Transactions
          </span>

          <strong className="sf-number">
            {transactions.length}
          </strong>

          <small>
            Completed orders
          </small>
        </article>
      </section>

      <section className="profile-settings-layout">
        <aside className="profile-tabs">
          <button
            type="button"
            className={
              activeTab === "profile"
                ? "profile-tab-active"
                : ""
            }
            onClick={() =>
              setActiveTab("profile")
            }
          >
            <span>
              <User size={16} />
            </span>

            <div>
              <strong>
                Personal information
              </strong>

              <small>
                Name, email and username
              </small>
            </div>
          </button>

          <button
            type="button"
            className={
              activeTab === "security"
                ? "profile-tab-active"
                : ""
            }
            onClick={() =>
              setActiveTab("security")
            }
          >
            <span>
              <Shield size={16} />
            </span>

            <div>
              <strong>Security</strong>

              <small>
                Update your account password
              </small>
            </div>
          </button>

          <div className="profile-security-note">
            <Shield size={16} />

            <div>
              <strong>
                Keep your account secure
              </strong>

              <p>
                Never share your password or
                authentication token with anyone.
              </p>
            </div>
          </div>
        </aside>

        <div className="profile-settings-panel">
          {activeTab === "profile" ? (
            <>
              <header className="profile-panel-heading">
                <span className="profile-panel-icon">
                  <User size={17} />
                </span>

                <div>
                  <span>
                    PROFILE DETAILS
                  </span>

                  <h2>
                    Personal information
                  </h2>

                  <p>
                    This information appears
                    throughout your Stockify
                    account.
                  </p>
                </div>
              </header>

              {profileError && (
                <div className="profile-error-banner">
                  <AlertCircle size={15} />

                  <span>
                    {profileError}
                  </span>
                </div>
              )}

              <form
                className="profile-form"
                onSubmit={handleProfileSave}
              >
                <label className="profile-field profile-field-full">
                  <span>Full name</span>

                  <div>
                    <User size={15} />

                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(event) =>
                        setProfileForm(
                          (previous) => ({
                            ...previous,
                            name:
                              event.target
                                .value,
                          })
                        )
                      }
                      autoComplete="name"
                    />
                  </div>
                </label>

                <label className="profile-field">
                  <span>Email address</span>

                  <div>
                    <Mail size={15} />

                    <input
                      type="email"
                      value={
                        profileForm.email
                      }
                      onChange={(event) =>
                        setProfileForm(
                          (previous) => ({
                            ...previous,
                            email:
                              event.target
                                .value,
                          })
                        )
                      }
                      autoComplete="email"
                    />
                  </div>
                </label>

                <label className="profile-field">
                  <span>Username</span>

                  <div>
                    <User size={15} />

                    <input
                      type="text"
                      value={
                        profileForm.username
                      }
                      onChange={(event) =>
                        setProfileForm(
                          (previous) => ({
                            ...previous,
                            username:
                              event.target
                                .value,
                          })
                        )
                      }
                      autoComplete="username"
                    />
                  </div>
                </label>

                <div className="profile-form-footer">
                  <p>
                    Your email and username
                    must remain unique across
                    Stockify.
                  </p>

                  <button
                    type="submit"
                    disabled={profileLoading}
                  >
                    {profileLoading ? (
                      <span className="profile-button-spinner" />
                    ) : (
                      <Check size={15} />
                    )}

                    Save changes
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <header className="profile-panel-heading">
                <span className="profile-panel-icon">
                  <Lock size={17} />
                </span>

                <div>
                  <span>
                    LOGIN SECURITY
                  </span>

                  <h2>Change password</h2>

                  <p>
                    Choose a strong password
                    that you do not use on
                    another service.
                  </p>
                </div>
              </header>

              {passwordError && (
                <div className="profile-error-banner">
                  <AlertCircle size={15} />

                  <span>
                    {passwordError}
                  </span>
                </div>
              )}

              <form
                className="profile-form profile-password-form"
                onSubmit={
                  handlePasswordChange
                }
              >
                <label className="profile-field profile-field-full">
                  <span>
                    Current password
                  </span>

                  <div>
                    <Lock size={15} />

                    <input
                      type="password"
                      value={
                        passwordForm.current
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (previous) => ({
                            ...previous,
                            current:
                              event.target
                                .value,
                          })
                        )
                      }
                      autoComplete="current-password"
                    />
                  </div>
                </label>

                <label className="profile-field">
                  <span>New password</span>

                  <div>
                    <Lock size={15} />

                    <input
                      type="password"
                      value={
                        passwordForm.next
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (previous) => ({
                            ...previous,
                            next:
                              event.target
                                .value,
                          })
                        )
                      }
                      autoComplete="new-password"
                    />
                  </div>
                </label>

                <label className="profile-field">
                  <span>
                    Confirm new password
                  </span>

                  <div>
                    <Shield size={15} />

                    <input
                      type="password"
                      value={
                        passwordForm.confirm
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (previous) => ({
                            ...previous,
                            confirm:
                              event.target
                                .value,
                          })
                        )
                      }
                      autoComplete="new-password"
                    />
                  </div>
                </label>

                <div className="profile-password-rules">
                  <strong>
                    Password requirements
                  </strong>

                  <span>
                    At least 8 characters
                  </span>

                  <span>
                    Different from your
                    current password
                  </span>
                </div>

                <div className="profile-form-footer">
                  <p>
                    Changing your password may
                    require you to sign in again
                    on other devices.
                  </p>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <span className="profile-button-spinner" />
                    ) : (
                      <Lock size={15} />
                    )}

                    Update password
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}