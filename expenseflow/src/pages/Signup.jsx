
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Wallet } from "lucide-react";
import { useState } from "react";
import "./Model.css";

const API_URL = import.meta.env.VITE_API_URL
  ?.trim()
  .replace(/\/+$/, "");

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");

    if (!API_URL) {
      setError(
        "Backend URL is missing. Set VITE_API_URL in Vercel and redeploy."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

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
              `Registration failed with status ${response.status}.`
          );
        }

        return;
      }

      if (!data.token || !data.user) {
        setError(
          "Registration response is missing the user or token. Check your backend response."
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Signup Error:", err);

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
          <span className="auth-label">GET STARTED</span>

          <h1>
            Create your
            <br />
            <span>ExpenseFlow account.</span>
          </h1>

          <p>
            Start tracking your money and making smarter
            financial decisions.
          </p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>

            <input
              id="signup-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email</label>

            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>

            <input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
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
            {loading ? "Creating Account..." : "Create Account"}

            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
