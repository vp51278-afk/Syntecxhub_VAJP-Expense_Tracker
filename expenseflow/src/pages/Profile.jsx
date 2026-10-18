
import { useCallback, useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Wallet,
  Shield,
  Lock,
  Smartphone,
  Bell,
  Moon,
  CreditCard,
  Save,
  ChevronRight,
  LogOut,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import "./Profile.css";

/* =========================
   STORAGE HELPERS
========================= */

const readJSON = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const unwrapUser = (value) => {
  if (!value || typeof value !== "object") return {};

  return (
    value.user ||
    value.data?.user ||
    value.data ||
    value.profile ||
    value.currentUser ||
    value
  );
};

const getStoredUser = () => {
  const keys = [
    "user",
    "expenseflow-user",
    "currentUser",
    "authUser",
    "loggedInUser",
  ];

  for (const key of keys) {
    const stored = readJSON(key);
    const user = unwrapUser(stored);

    if (
      user.name ||
      user.fullName ||
      user.username ||
      user.displayName ||
      user.email
    ) {
      return user;
    }
  }

  return {};
};

const getAuthToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("expenseflow-token") ||
  "";

const getUserName = (user = {}) =>
  user.name ||
  user.fullName ||
  user.username ||
  user.displayName ||
  [user.firstName, user.lastName].filter(Boolean).join(" ") ||
  "";

const getUserEmail = (user = {}) =>
  user.email || user.userEmail || user.mail || "";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  return parts.length
    ? parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("")
    : "U";
};

const normalizeProfile = (user = {}) => ({
  name: getUserName(user),
  email: getUserEmail(user),
  phone: user.phone || user.phoneNumber || "",
  dob: String(user.dob || user.dateOfBirth || "").slice(0, 10),
  income: String(user.monthlyIncome ?? user.income ?? ""),
  currency: user.currency || "INR",
  savingsTarget: String(user.savingsTarget ?? ""),
  riskPreference: user.riskPreference || "Moderate",
});

const saveStoredUser = (user) => {
  const value = JSON.stringify(user);

  localStorage.setItem("user", value);
  localStorage.setItem("expenseflow-user", value);
};

/* =========================
   PROFILE COMPONENT
========================= */

function Profile() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  const [profile, setProfile] = useState(() =>
    normalizeProfile(getStoredUser())
  );

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    () => readJSON("expenseflow_two_factor", false) === true
  );

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSessions, setShowSessions] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const displayName =
    profile.name || getUserName(currentUser) || "ExpenseFlow User";

  const displayEmail =
    profile.email || getUserEmail(currentUser) || "Add your email address";

  const initials = getInitials(displayName);

  /* =========================
     REFRESH USER DATA
  ========================= */

  const refreshProfile = useCallback(() => {
    const user = getStoredUser();

    setCurrentUser(user);
    setProfile(normalizeProfile(user));
  }, []);

  useEffect(() => {
    refreshProfile();

    window.addEventListener("storage", refreshProfile);
    window.addEventListener("focus", refreshProfile);

    return () => {
      window.removeEventListener("storage", refreshProfile);
      window.removeEventListener("focus", refreshProfile);
    };
  }, [refreshProfile]);

  /* =========================
     FORM HANDLERS
  ========================= */

  const handleChange = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
    setProfileError("");
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setPasswordMessage("");
    setPasswordError(false);
  };

  /* =========================
     SAVE PROFILE
  ========================= */

  const handleSave = async (event) => {
    event?.preventDefault();

    setProfileError("");
    setSaved(false);

    const token = getAuthToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!profile.name.trim()) {
      setProfileError("Please enter your full name.");
      return;
    }

    if (!profile.email.trim()) {
      setProfileError("Please enter your email address.");
      return;
    }

    if (
      (profile.income !== "" &&
        (!Number.isFinite(Number(profile.income)) ||
          Number(profile.income) < 0)) ||
      (profile.savingsTarget !== "" &&
        (!Number.isFinite(Number(profile.savingsTarget)) ||
          Number(profile.savingsTarget) < 0))
    ) {
      setProfileError(
        "Income and savings target must be valid non-negative numbers."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name.trim(),
            email: profile.email.trim(),
            phone: profile.phone.trim(),
            dob: profile.dob || "",
            monthlyIncome: Number(profile.income || 0),
            savingsTarget: Number(profile.savingsTarget || 0),
            currency: profile.currency,
            riskPreference: profile.riskPreference,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        setProfileError(
          "Your session may have expired. Please log in again."
        );
        return;
      }

      if (!response.ok) {
        setProfileError(
          data.message || "Unable to save your profile."
        );
        return;
      }

      const responseUser =
        data.user ||
        data.data?.user ||
        data.data ||
        {};

      const updatedUser = {
        ...currentUser,
        ...responseUser,
        name: responseUser.name ?? profile.name.trim(),
        email: responseUser.email ?? profile.email.trim(),
        phone: responseUser.phone ?? profile.phone.trim(),
        dob: responseUser.dob ?? profile.dob,
        monthlyIncome:
          responseUser.monthlyIncome ?? Number(profile.income || 0),
        savingsTarget:
          responseUser.savingsTarget ??
          Number(profile.savingsTarget || 0),
        currency: responseUser.currency ?? profile.currency,
        riskPreference:
          responseUser.riskPreference ?? profile.riskPreference,
      };

      saveStoredUser(updatedUser);

      setCurrentUser(updatedUser);
      setProfile(normalizeProfile(updatedUser));
      setSaved(true);
    } catch (error) {
      console.error("Profile save error:", error);

      setProfileError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     TWO-FACTOR PREFERENCE
  ========================= */

  const handleTwoFactorToggle = (event) => {
    const enabled = event.target.checked;

    setTwoFactorEnabled(enabled);

    localStorage.setItem(
      "expenseflow_two_factor",
      JSON.stringify(enabled)
    );
  };

  /* =========================
     CHANGE PASSWORD
  ========================= */

  const handlePasswordChange = async () => {
    setPasswordMessage("");
    setPasswordError(false);

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(true);
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(true);
      setPasswordMessage(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(true);
      setPasswordMessage("New passwords do not match.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPasswordError(true);
        setPasswordMessage(
          data.message ||
            "Password update failed. Check your backend endpoint."
        );
        return;
      }

      setPasswordMessage(
        data.message || "Password updated successfully."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password update error:", error);

      setPasswordError(true);
      setPasswordMessage("Unable to connect to the server.");
    } finally {
      setPasswordLoading(false);
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    [
      "token",
      "authToken",
      "expenseflow-token",
      "user",
      "expenseflow-user",
      "currentUser",
      "authUser",
      "loggedInUser",
    ].forEach((key) => localStorage.removeItem(key));

    navigate("/login", { replace: true });
  };

  /* =========================
     PAGE UI
  ========================= */

  return (
    <div className="profile-page">
      <div className="profile-topbar">
        <div>
          <Link to="/dashboard" className="profile-back">
            ← Back to Dashboard
          </Link>

          <h1>Profile</h1>

          <p>
            Manage your personal information and preferences.
          </p>
        </div>

        <button
          type="button"
          className="profile-save-button"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle size={17} className="profile-spinner" />
          ) : saved ? (
            <CheckCircle2 size={17} />
          ) : (
            <Save size={17} />
          )}

          {loading
            ? "Saving..."
            : saved
              ? "Changes Saved"
              : "Save Changes"}
        </button>
      </div>

      {profileError && (
        <div
          className="profile-feedback profile-feedback-error"
          role="alert"
        >
          <AlertCircle size={17} />
          <span>{profileError}</span>
        </div>
      )}

      {saved && (
        <div
          className="profile-feedback profile-feedback-success"
          role="status"
        >
          <CheckCircle2 size={17} />
          <span>Your profile has been updated successfully.</span>
        </div>
      )}

      {/* USER CARD */}

      <section className="profile-main-card">
        <div className="profile-avatar">{initials}</div>

        <div className="profile-main-info">
          <h2>{displayName}</h2>

          <p>
            <Mail size={14} />
            {displayEmail}
          </p>

          <span>ExpenseFlow Member</span>
        </div>

        <button
          type="button"
          className="edit-profile-button"
          onClick={() =>
            document
              .querySelector(".profile-content-grid")
              ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
          }
        >
          <Edit3 size={16} />
          Edit Profile
        </button>
      </section>

      <div className="profile-content-grid">
        {/* PERSONAL INFORMATION */}

        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-heading-icon red">
              <User size={19} />
            </div>

            <div>
              <h2>Personal Information</h2>
              <p>Your basic account information.</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="profile-name">Full Name</label>

              <div className="profile-input">
                <User size={16} />

                <input
                  id="profile-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={profile.name}
                  onChange={(event) =>
                    handleChange("name", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">Email Address</label>

              <div className="profile-input">
                <Mail size={16} />

                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={profile.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-phone">Phone Number</label>

              <div className="profile-input">
                <Phone size={16} />

                <input
                  id="profile-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  value={profile.phone}
                  onChange={(event) =>
                    handleChange("phone", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-dob">
                Date of Birth <span>(Optional)</span>
              </label>

              <div className="profile-input">
                <Calendar size={16} />

                <input
                  id="profile-dob"
                  type="date"
                  value={profile.dob}
                  onChange={(event) =>
                    handleChange("dob", event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* FINANCIAL PREFERENCES */}

        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-heading-icon green">
              <Wallet size={19} />
            </div>

            <div>
              <h2>Financial Preferences</h2>
              <p>Set your financial planning preferences.</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="profile-income">Monthly Income</label>

              <div className="profile-input">
                <span className="currency-symbol">
                  {profile.currency === "INR"
                    ? "₹"
                    : profile.currency === "USD"
                      ? "$"
                      : profile.currency === "EUR"
                        ? "€"
                        : "£"}
                </span>

                <input
                  id="profile-income"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter monthly income"
                  value={profile.income}
                  onChange={(event) =>
                    handleChange("income", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-currency">Currency</label>

              <div className="profile-input">
                <CreditCard size={16} />

                <select
                  id="profile-currency"
                  value={profile.currency}
                  onChange={(event) =>
                    handleChange("currency", event.target.value)
                  }
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>

                <ChevronRight size={15} />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-savings">
                Monthly Savings Target
              </label>

              <div className="profile-input">
                <Wallet size={16} />

                <input
                  id="profile-savings"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter savings target"
                  value={profile.savingsTarget}
                  onChange={(event) =>
                    handleChange("savingsTarget", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-risk">Risk Preference</label>

              <div className="profile-input">
                <Shield size={16} />

                <select
                  id="profile-risk"
                  value={profile.riskPreference}
                  onChange={(event) =>
                    handleChange("riskPreference", event.target.value)
                  }
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>

                <ChevronRight size={15} />
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY */}

        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-heading-icon purple">
              <Shield size={19} />
            </div>

            <div>
              <h2>Security</h2>
              <p>Protect your account and manage access.</p>
            </div>
          </div>

          <div className="security-list">
            <div className="security-item">
              <div className="security-item-left">
                <div className="security-icon">
                  <Lock size={17} />
                </div>

                <div>
                  <strong>Change Password</strong>
                  <span>Update your account password.</span>
                </div>
              </div>

              <button
                type="button"
                className="security-action"
                onClick={() => {
                  setShowPasswordForm((previous) => !previous);
                  setPasswordMessage("");
                  setPasswordError(false);
                }}
              >
                {showPasswordForm ? "Close" : "Change"}
                <ChevronRight size={16} />
              </button>
            </div>

            {showPasswordForm && (
              <form
                className="profile-password-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handlePasswordChange();
                }}
              >
                <div className="profile-field">
                  <label htmlFor="current-password">
                    Current Password
                  </label>

                  <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(event) =>
                      handlePasswordFieldChange(
                        "currentPassword",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="new-password">New Password</label>

                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    value={passwordData.newPassword}
                    onChange={(event) =>
                      handlePasswordFieldChange(
                        "newPassword",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="confirm-password">
                    Confirm New Password
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(event) =>
                      handlePasswordFieldChange(
                        "confirmPassword",
                        event.target.value
                      )
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="security-action"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <LoaderCircle
                      size={16}
                      className="profile-spinner"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {passwordLoading
                    ? "Updating..."
                    : "Update Password"}
                </button>

                {passwordMessage && (
                  <p
                    className={`profile-form-message ${
                      passwordError ? "error" : "success"
                    }`}
                    role="status"
                  >
                    {passwordMessage}
                  </p>
                )}
              </form>
            )}

            <div className="security-item">
              <div className="security-item-left">
                <div className="security-icon">
                  <Smartphone size={17} />
                </div>

                <div>
                  <strong>Two-Factor Authentication</strong>
                  <span>
                    Save your two-factor preference on this browser.
                  </span>
                </div>
              </div>

              <label className="toggle">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={handleTwoFactorToggle}
                  aria-label="Toggle two-factor authentication preference"
                />
                <span />
              </label>
            </div>

            <div className="security-item">
              <div className="security-item-left">
                <div className="security-icon">
                  <Shield size={17} />
                </div>

                <div>
                  <strong>Login &amp; Session Management</strong>
                  <span>View your current browser session.</span>
                </div>
              </div>

              <button
                type="button"
                className="security-action"
                onClick={() =>
                  setShowSessions((previous) => !previous)
                }
              >
                {showSessions ? "Close" : "Manage"}
                <ChevronRight size={16} />
              </button>
            </div>

            {showSessions && (
              <div className="profile-session-panel">
                <strong>Current Browser Session</strong>

                <p>
                  You are using ExpenseFlow in this browser.
                  Other devices require backend session support.
                </p>

                <button
                  type="button"
                  className="security-action"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </section>

        {/* APP PREFERENCES */}

        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-heading-icon orange">
              <Bell size={19} />
            </div>

            <div>
              <h2>App Preferences</h2>
              <p>Customize your ExpenseFlow experience.</p>
            </div>
          </div>

          <div className="preference-list">
            <Preference
              icon={<Bell size={17} />}
              title="Notifications"
              description="Enable or disable notifications."
              defaultChecked
            />

            <Preference
              icon={<Moon size={17} />}
              title="Dark Mode"
              description="Save your preferred theme setting."
              defaultChecked
            />

            <Preference
              icon={<Mail size={17} />}
              title="Email Alerts"
              description="Choose whether to receive email updates."
            />

            <Preference
              icon={<Wallet size={17} />}
              title="Budget Alerts"
              description="Save your budget notification preference."
              defaultChecked
            />
          </div>
        </section>
      </div>

      {/* ACCOUNT */}

      <section className="profile-danger">
        <div>
          <h3>Account</h3>
          <p>
            Log out of your current ExpenseFlow account on this browser.
          </p>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Log Out
        </button>
      </section>
    </div>
  );
}

/* =========================
   APP PREFERENCES
========================= */

function Preference({
  icon,
  title,
  description,
  defaultChecked = false,
}) {
  const storageKey = `expenseflow_${title
    .toLowerCase()
    .replace(/\s+/g, "_")}`;

  const [enabled, setEnabled] = useState(() => {
    const storedValue = readJSON(storageKey, null);

    return typeof storedValue === "boolean"
      ? storedValue
      : defaultChecked;
  });

  const handleToggle = (event) => {
    const newValue = event.target.checked;

    setEnabled(newValue);

    localStorage.setItem(
      storageKey,
      JSON.stringify(newValue)
    );
  };

  return (
    <div className="preference-item">
      <div className="preference-left">
        <div className="preference-icon">{icon}</div>

        <div>
          <strong>{title}</strong>
          <span>{description}</span>
        </div>
      </div>

      <label className="toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          aria-label={title}
        />
        <span />
      </label>
    </div>
  );
}

export default Profile;

