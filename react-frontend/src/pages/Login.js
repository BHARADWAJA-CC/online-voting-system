import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, registerWithEmail } from "../firebase";

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || (isRegistering && !name)) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      let user;
      if (isRegistering) {
        user = await registerWithEmail(name, email, password);
      } else {
        user = await loginWithEmail(email, password);
      }

      const idToken = await user.getIdToken();
      localStorage.setItem("token", idToken);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem(
        "userName",
        user.displayName || name || user.email.split("@")[0]
      );
      navigate("/vote");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="page-wrapper">
      <div className="glass-card auth-card">
        {/* Brand mark */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              margin: "0 auto 16px",
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.35)",
            }}
          >
            🗳️
          </div>
          <p className="page-eyebrow">SecureVote Platform</p>
          <h1 className="page-title page-title--gradient">
            {isRegistering ? "Create Account" : "Welcome back"}
          </h1>
          <p className="page-subtitle" style={{ marginBottom: "0" }}>
            {isRegistering
              ? "Join the platform and cast your verified vote."
              : "Sign in to access your secure voting session."}
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="alert alert--error" style={{ marginBottom: "20px" }}>
            <span className="alert__icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleAuth}>
          <div className="form-stack">
            {isRegistering && (
              <div className="form-field">
                <label className="form-label" htmlFor="name-input">
                  Full Name
                </label>
                <input
                  id="name-input"
                  className="form-input"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="email-input">
                Email Address
              </label>
              <input
                id="email-input"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password-input">
                Password
              </label>
              <input
                id="password-input"
                className="form-input"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegistering ? "new-password" : "current-password"}
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className={`btn btn--primary ${loading ? "btn--loading" : ""}`}
            disabled={loading}
          >
            {loading
              ? "Verifying identity…"
              : isRegistering
              ? "Create Account"
              : "Sign In Securely"}
          </button>
        </form>

        {/* Trust badges */}
        <div className="trust-row">
          <span className="trust-badge">
            <span className="trust-badge__icon">🔒</span> End-to-end encrypted
          </span>
          <span className="trust-badge">
            <span className="trust-badge__icon">✅</span> Firebase verified
          </span>
          <span className="trust-badge">
            <span className="trust-badge__icon">📋</span> One vote per user
          </span>
        </div>

        <div className="divider" />

        {/* Auth toggle */}
        <div className="auth-toggle">
          {isRegistering ? (
            <>
              Already have an account?{" "}
              <span
                id="switch-to-login"
                className="auth-toggle__link"
                onClick={switchMode}
              >
                Sign in
              </span>
            </>
          ) : (
            <>
              New to SecureVote?{" "}
              <span
                id="switch-to-register"
                className="auth-toggle__link"
                onClick={switchMode}
              >
                Create an account
              </span>
            </>
          )}
        </div>

        <div className="link-row" style={{ marginTop: "16px" }}>
          <span
            className="link-row__item"
            onClick={() => navigate("/results")}
          >
            📊 View live results
          </span>
          <span
            className="link-row__item"
            onClick={() => navigate("/admin")}
          >
            🛡️ Admin dashboard
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;