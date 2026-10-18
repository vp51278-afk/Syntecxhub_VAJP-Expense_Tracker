
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Wallet } from "lucide-react";
import { useState } from "react";
import "./Model.css";

const API_URL = import.meta.env.VITE_API_URL
  ?.trim()
  .replace(/\/+$/, "");

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!API_URL) {
      setError(
        "Backend URL is missing. Set VITE_API_URL in Vercel and redeploy."
      );
      return;
    }

    const loginEmail = email.trim().toLowerCase();

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 403) {
          setError(
            data.message ||
              "Request blocked. Check backend CORS settings."
          );
        } else if (response.status === 503) {
          setError(
            data.message ||
              "Database unavailable. Check MongoDB Atlas and backend logs."
          );
        } else {
          setError(
            data.message ||
              `Login failed with status ${response.status}.`
          );
        }

        return;
      }

      // Confirm that the backend returned a token and user.
      if (!data.token || !data.user || typeof data.user !== "object") {
        setError(
          "Login response is missing the user or token. Check your backend response."
        );
        return;
      }

      const backendUser = data.user;

      // Use the user returned by the backend.
      // Only use the login email as a fallback if the response omits email.
      const loggedInUser = {
        ...backendUser,
        email: backendUser.email || loginEmail,
        name:
          backendUser.name ||
          backendUser.fullName ||
          backendUser.username ||
          backendUser.displayName ||
          "",
      };

      // Save authentication and user details for Profile.jsx.
      localStorage.setItem("token", data.token);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("expenseflow-token", data.token);

      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem(
        "expenseflow-user",
        JSON.stringify(loggedInUser)
      );

      // Navigate only after storing the logged-in user's data.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login Error:", err);

      setError(
        "Could not reach the backend. Check VITE_API_URL, CORS, and the browser Network tab."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow"></div>

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <Wallet size={26} />

          <span>
            Expense<span>Flow</span>
          </span>
        </Link>

        <div className="auth-heading">
          <span className="auth-label">WELCOME BACK</span>

          <h1>
            Login to your
            <br />
            <span>financial dashboard.</span>
          </h1>

          <p>
            Continue your journey toward smarter financial
            decisions.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="forgot-row">
            <span></span>

            <button type="button" disabled>
              Forgot Password?
            </button>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}

            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?
          <Link to="/signup"> Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
