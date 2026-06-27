import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../firebase";

const API = "http://localhost:5000/api";

function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "Voter";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API}/results`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load candidates");
        return res.json();
      })
      .then((data) => setCandidates(data))
      .catch(() => {
        setMessage("Cannot reach the server. Please ensure the backend is running.");
        setIsSuccess(false);
      });
  }, [token, navigate]);

  const vote = async (candidateId) => {
    if (loading || voted) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId }),
      });

      const data = await res.json();

      if (res.ok) {
        setVoted(true);
        setIsSuccess(true);
        setMessage("Your vote has been recorded. Thank you for participating!");
        setTimeout(() => navigate("/results"), 2200);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Vote submission failed. Please try again.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="page-wrapper--top" style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar__brand">
          <div className="navbar__logo-icon">🗳️</div>
          <span className="navbar__logo-text">
            Secure<span>Vote</span>
          </span>
        </div>
        <div className="navbar__actions">
          <div className="navbar__user-chip">
            <div className="navbar__user-avatar">{userInitial}</div>
            <span>{userName}</span>
          </div>
          <button
            id="signout-btn"
            className="btn btn--danger-ghost"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div
        className="page-wrapper"
        style={{ paddingTop: "40px", paddingBottom: "60px" }}
      >
        <div
          className="glass-card"
          style={{ maxWidth: "600px", padding: "40px 36px" }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p className="page-eyebrow">Authenticated Session</p>
            <h1 className="page-title page-title--gradient">Cast Your Vote</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Select your preferred candidate below. Each verified voter may
              cast exactly one ballot.
            </p>
          </div>

          {/* Alert */}
          {message && (
            <div
              className={`alert ${isSuccess ? "alert--success" : "alert--error"}`}
              style={{ marginBottom: "24px" }}
            >
              <span className="alert__icon">{isSuccess ? "✅" : "⚠️"}</span>
              <span>{message}</span>
            </div>
          )}

          {/* Success redirect note */}
          {voted && (
            <div className="alert alert--info" style={{ marginBottom: "24px" }}>
              <span className="alert__icon">📊</span>
              <span>Redirecting you to live results…</span>
            </div>
          )}

          {/* Candidate List */}
          {candidates.length === 0 && !message && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: "82px", borderRadius: "14px" }}
                />
              ))}
            </div>
          )}

          <div className="candidate-list">
            {candidates.map((c, index) => (
              <div
                id={`candidate-${c._id}`}
                key={c._id}
                className="candidate-item"
                onClick={() => !voted && !loading && vote(c._id)}
                style={{ cursor: voted ? "default" : "pointer" }}
              >
                {/* Avatar */}
                <div
                  className={`candidate-avatar candidate-avatar--${index % 4}`}
                >
                  {c.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="candidate-details">
                  <div className="candidate-name">{c.name}</div>
                  <div className="candidate-party">
                    {c.party || "Independent"}
                  </div>
                </div>

                {/* Vote button */}
                <button
                  className="candidate-vote-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    vote(c._id);
                  }}
                  disabled={loading || voted}
                >
                  {loading ? "…" : voted ? "✓" : "Vote"}
                </button>
              </div>
            ))}
          </div>

          {/* Divider & links */}
          {candidates.length > 0 && <div className="divider" />}

          <div className="link-row">
            <span
              className="link-row__item"
              onClick={() => navigate("/results")}
            >
              📊 Live results
            </span>
            <span
              className="link-row__item"
              onClick={() => navigate("/admin")}
            >
              🛡️ Admin panel
            </span>
          </div>

          {/* Trust note */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.78rem",
              color: "var(--clr-text-muted)",
            }}
          >
            <span>🔒</span>
            Your vote is cryptographically signed and permanently immutable.
            Double-voting is prevented server-side via Firebase UID.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vote;