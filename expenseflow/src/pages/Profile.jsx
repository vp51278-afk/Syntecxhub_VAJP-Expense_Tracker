import { useState } from "react";

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
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Vaishnavi Pandey",
    email: "vaishnavi@example.com",
    phone: "+91 98765 43210",
    dob: "2003-05-15",
    income: "60000",
    currency: "INR",
    savingsTarget: "15000",
    riskPreference: "Moderate",
  });

  // =====================================================
  // SECURITY STATE
  // =====================================================

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    const saved2FA = localStorage.getItem("expenseflow_two_factor");

    return saved2FA !== null
      ? JSON.parse(saved2FA)
      : false;
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [showSessions, setShowSessions] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");

  // =====================================================
  // PROFILE CHANGE
  // =====================================================

  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
  
      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name,
            email: profile.email,
            monthlyIncome: profile.income,
            savingsTarget: profile.savingsTarget,
            riskPreference: profile.riskPreference,
            currency: profile.currency,
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Unable to update profile.");
        return;
      }
  
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
  
      setSaved(true);
  
      setTimeout(() => {
        setSaved(false);
      }, 2500);
  
    } catch (error) {
      console.error("Profile Update Error:", error);
  
      alert(
        "Unable to connect to server. Please make sure backend is running."
      );
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handlePasswordChange = () => {
    setPasswordMessage("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordMessage(
        "Please fill all password fields."
      );
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setPasswordMessage(
        "New passwords do not match."
      );
      return;
    }

    /*
      Backend integration will be added later.

      Actual flow will be:

      Profile
          ↓
      PUT /api/auth/change-password
          ↓
      JWT verification
          ↓
      Verify old password
          ↓
      Hash new password
          ↓
      MongoDB
    */

    setPasswordMessage(
      "Password details validated. Backend connection will update your password."
    );

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // =====================================================
  // TWO FACTOR AUTHENTICATION
  // =====================================================

  const handleTwoFactorToggle = (event) => {
    const enabled = event.target.checked;

    setTwoFactorEnabled(enabled);

    localStorage.setItem(
      "expenseflow_two_factor",
      JSON.stringify(enabled)
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="profile-page">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="profile-topbar">

        <div>

          <Link
            to="/dashboard"
            className="profile-back"
          >
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
        >
          <Save size={17} />

          {saved
            ? "Changes Saved"
            : "Save Changes"}
        </button>

      </div>

      {/* =================================================
          PROFILE MAIN CARD
      ================================================= */}

      <section className="profile-main-card">

        <div className="profile-avatar">
          {profile.name.charAt(0).toUpperCase()}
        </div>

        <div className="profile-main-info">

          <h2>
            {profile.name}
          </h2>

          <p>
            <Mail size={14} />
            {profile.email}
          </p>

          <span>
            ExpenseFlow Member
          </span>

        </div>

        <button
          type="button"
          className="edit-profile-button"
          onClick={() => {
            document
              .querySelector(".profile-content-grid")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          <Edit3 size={16} />
          Edit Profile
        </button>

      </section>

      {/* =================================================
          CONTENT GRID
      ================================================= */}

      <div className="profile-content-grid">

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <section className="profile-card">

          <div className="profile-card-heading">

            <div className="profile-heading-icon red">
              <User size={19} />
            </div>

            <div>
              <h2>
                Personal Information
              </h2>

              <p>
                Your basic account information.
              </p>
            </div>

          </div>

          <div className="profile-form-grid">

            {/* NAME */}

            <div className="profile-field">

              <label>
                Full Name
              </label>

              <div className="profile-input">

                <User size={16} />

                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    handleChange(
                      "name",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="profile-field">

              <label>
                Email Address
              </label>

              <div className="profile-input">

                <Mail size={16} />

                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    handleChange(
                      "email",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* PHONE */}

            <div className="profile-field">

              <label>
                Phone Number
              </label>

              <div className="profile-input">

                <Phone size={16} />

                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    handleChange(
                      "phone",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* DOB */}

            <div className="profile-field">

              <label>
                Date of Birth{" "}
                <span>(Optional)</span>
              </label>

              <div className="profile-input">

                <Calendar size={16} />

                <input
                  type="date"
                  value={profile.dob}
                  onChange={(e) =>
                    handleChange(
                      "dob",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            FINANCIAL PREFERENCES
        ================================================= */}

        <section className="profile-card">

          <div className="profile-card-heading">

            <div className="profile-heading-icon green">
              <Wallet size={19} />
            </div>

            <div>

              <h2>
                Financial Preferences
              </h2>

              <p>
                Set your financial planning preferences.
              </p>

            </div>

          </div>

          <div className="profile-form-grid">

            {/* INCOME */}

            <div className="profile-field">

              <label>
                Monthly Income
              </label>

              <div className="profile-input">

                <span className="currency-symbol">
                  ₹
                </span>

                <input
                  type="number"
                  value={profile.income}
                  onChange={(e) =>
                    handleChange(
                      "income",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* CURRENCY */}

            <div className="profile-field">

              <label>
                Currency
              </label>

              <div className="profile-input">

                <CreditCard size={16} />

                <select
                  value={profile.currency}
                  onChange={(e) =>
                    handleChange(
                      "currency",
                      e.target.value
                    )
                  }
                >

                  <option value="INR">
                    INR - Indian Rupee
                  </option>

                  <option value="USD">
                    USD - US Dollar
                  </option>

                  <option value="EUR">
                    EUR - Euro
                  </option>

                  <option value="GBP">
                    GBP - British Pound
                  </option>

                </select>

                <ChevronRight size={15} />

              </div>

            </div>

            {/* SAVINGS TARGET */}

            <div className="profile-field">

              <label>
                Monthly Savings Target
              </label>

              <div className="profile-input">

                <Wallet size={16} />

                <input
                  type="number"
                  value={profile.savingsTarget}
                  onChange={(e) =>
                    handleChange(
                      "savingsTarget",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* RISK */}

            <div className="profile-field">

              <label>
                Risk Preference
              </label>

              <div className="profile-input">

                <Shield size={16} />

                <select
                  value={profile.riskPreference}
                  onChange={(e) =>
                    handleChange(
                      "riskPreference",
                      e.target.value
                    )
                  }
                >

                  <option value="Conservative">
                    Conservative
                  </option>

                  <option value="Moderate">
                    Moderate
                  </option>

                  <option value="Aggressive">
                    Aggressive
                  </option>

                </select>

                <ChevronRight size={15} />

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            SECURITY
        ================================================= */}

        <section className="profile-card">

          <div className="profile-card-heading">

            <div className="profile-heading-icon purple">
              <Shield size={19} />
            </div>

            <div>

              <h2>
                Security
              </h2>

              <p>
                Protect your account and manage access.
              </p>

            </div>

          </div>

          <div className="security-list">

            {/* ============================================
                CHANGE PASSWORD
            ============================================ */}

            <div className="security-item">

              <div className="security-item-left">

                <div className="security-icon">
                  <Lock size={17} />
                </div>

                <div>

                  <strong>
                    Change Password
                  </strong>

                  <span>
                    Update your account password.
                  </span>

                </div>

              </div>

              <button
                type="button"
                className="security-action"
                onClick={() => {
                  setShowPasswordForm(
                    !showPasswordForm
                  );

                  setPasswordMessage("");
                }}
              >
                {showPasswordForm
                  ? "Close"
                  : "Change"}

                <ChevronRight size={16} />

              </button>

            </div>

            {/* PASSWORD FORM */}

            {showPasswordForm && (

              <div
                style={{
                  padding: "20px",
                  margin: "0 0 10px",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,0.03)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >

                  <input
                    type="password"
                    placeholder="Current password"
                    value={
                      passwordData.currentPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword:
                          e.target.value,
                      })
                    }
                  />

                  <input
                    type="password"
                    placeholder="New password"
                    value={
                      passwordData.newPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword:
                          e.target.value,
                      })
                    }
                  />

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={
                      passwordData.confirmPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword:
                          e.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    className="security-action"
                    onClick={
                      handlePasswordChange
                    }
                    style={{
                      width: "fit-content",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >

                    <Save size={16} />

                    Update Password

                  </button>

                  {passwordMessage && (

                    <span
                      style={{
                        color: "#ff4d67",
                        fontSize: "13px",
                      }}
                    >
                      {passwordMessage}
                    </span>

                  )}

                </div>

              </div>

            )}

            {/* ============================================
                TWO FACTOR AUTHENTICATION
            ============================================ */}

            <div className="security-item">

              <div className="security-item-left">

                <div className="security-icon">
                  <Smartphone size={17} />
                </div>

                <div>

                  <strong>
                    Two-Factor Authentication
                  </strong>

                  <span>
                    Add an extra layer of security.
                  </span>

                </div>

              </div>

              <label className="toggle">

                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={
                    handleTwoFactorToggle
                  }
                />

                <span></span>

              </label>

            </div>

            {/* ============================================
                SESSION MANAGEMENT
            ============================================ */}

            <div className="security-item">

              <div className="security-item-left">

                <div className="security-icon">
                  <Shield size={17} />
                </div>

                <div>

                  <strong>
                    Login & Session Management
                  </strong>

                  <span>
                    Manage devices signed into your account.
                  </span>

                </div>

              </div>

              <button
                type="button"
                className="security-action"
                onClick={() =>
                  setShowSessions(
                    !showSessions
                  )
                }
              >

                {showSessions
                  ? "Close"
                  : "Manage"}

                <ChevronRight size={16} />

              </button>

            </div>

            {/* SESSION PANEL */}

            {showSessions && (

              <div
                style={{
                  padding: "18px 20px",
                  background:
                    "rgba(255,255,255,0.03)",
                  borderRadius: "12px",
                  marginTop: "10px",
                }}
              >

                <strong>
                  Active Session
                </strong>

                <p
                  style={{
                    margin: "6px 0 0",
                    opacity: 0.7,
                  }}
                >
                  Chrome • Windows • Current device
                </p>

                <button
                  type="button"
                  className="security-action"
                  style={{
                    marginTop: "12px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    localStorage.removeItem(
                      "token"
                    );

                    localStorage.removeItem(
                      "user"
                    );

                    navigate("/login", {
                      replace: true,
                    });
                  }}
                >

                  Sign out of this device

                </button>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            APP PREFERENCES
        ================================================= */}

        <section className="profile-card">

          <div className="profile-card-heading">

            <div className="profile-heading-icon orange">
              <Bell size={19} />
            </div>

            <div>

              <h2>
                App Preferences
              </h2>

              <p>
                Customize your ExpenseFlow experience.
              </p>

            </div>

          </div>

          <div className="preference-list">

            <Preference
              icon={<Bell size={17} />}
              title="Notifications"
              description="Receive notifications about your finances."
              checked={true}
            />

            <Preference
              icon={<Moon size={17} />}
              title="Dark Mode"
              description="Use the dark theme across ExpenseFlow."
              checked={true}
            />

            <Preference
              icon={<Mail size={17} />}
              title="Email Alerts"
              description="Receive important financial updates by email."
              checked={false}
            />

            <Preference
              icon={<Wallet size={17} />}
              title="Budget Alerts"
              description="Get notified when you are close to your budget."
              checked={true}
            />

          </div>

        </section>

      </div>

      {/* =================================================
          ACCOUNT / LOGOUT
      ================================================= */}

      <section className="profile-danger">

        <div>

          <h3>
            Account
          </h3>

          <p>
            Need to leave ExpenseFlow? You can log out
            from your account.
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

// =========================================================
// PREFERENCE COMPONENT
// =========================================================

function Preference({
  icon,
  title,
  description,
  checked,
}) {
  const storageKey = `expenseflow_${title
    .toLowerCase()
    .replace(/\s+/g, "_")}`;

  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem(
      storageKey
    );

    if (saved !== null) {
      return JSON.parse(saved);
    }

    return checked;
  });

  const handleToggle = () => {
    const newValue = !enabled;

    setEnabled(newValue);

    localStorage.setItem(
      storageKey,
      JSON.stringify(newValue)
    );
  };

  return (
    <div className="preference-item">

      <div className="preference-left">

        <div className="preference-icon">
          {icon}
        </div>

        <div>

          <strong>
            {title}
          </strong>

          <span>
            {description}
          </span>

        </div>

      </div>

      <label className="toggle">

        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
        />

        <span></span>

      </label>

    </div>
  );
}

export default Profile;