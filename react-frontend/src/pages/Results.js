import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

const FILL_CLASSES = ["progress-fill--leader", "progress-fill--2nd", "progress-fill--other"];

function Results() {
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const navigate = useNavigate();

  useEffect(() => {
    const eventSource = new EventSource(`${API}/results/stream`);

    eventSource.onopen = () => setConnectionStatus("connected");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setResults(data);
        setTotalVotes(data.reduce((acc, c) => acc + c.votes, 0));
      } catch (err) {
        console.error("Failed to parse results stream:", err);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus("error");
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const leader = results[0];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar__brand">
          <div className="navbar__logo-icon">🗳️</div>
          <span className="navbar__logo-text">
            Secure<span>Vote</span>
          </span>
        </div>
        <div className="navbar__actions">
          {/* Connection status */}
          <span
            className={`live-badge live-badge--${connectionStatus}`}
          >
            <span className="live-badge__dot" />
            {connectionStatus === "connected"
              ? "Live"
              : connectionStatus === "connecting"
              ? "Connecting"
              : "Offline"}
          </span>
          <button
            className="btn btn--ghost btn--icon"
            onClick={() => navigate("/")}
          >
            ← Sign in
          </button>
        </div>
      </nav>

      {/* Main */}
      <div
        className="page-wrapper"
        style={{ paddingTop: "40px", paddingBottom: "60px", alignItems: "flex-start" }}
      >
        <div className="glass-card dashboard-card">
          {/* Top bar */}
          <div className="dash-topbar">
            <div className="dash-topbar__left">
              <div>
                <div className="dash-topbar__title">📊 Election Results</div>
                <div className="dash-topbar__sub">
                  Streaming live · verified by Firebase tokens
                </div>
              </div>
            </div>
            <div className="dash-topbar__right">
              <button
                className="btn btn--ghost btn--icon"
                onClick={() => navigate("/vote")}
              >
                🗳️ Cast vote
              </button>
              <button
                className="btn btn--ghost btn--icon"
                onClick={() => navigate("/admin")}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="dash-body">
            <div className="dashboard-layout">
              {/* Left: Leaderboard */}
              <div className="dashboard-panel">
                <div className="dashboard-panel__title">
                  <span>🏆</span> Live Standings
                </div>

                {results.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <div
                          className="skeleton skeleton--text"
                          style={{ width: "60%", marginBottom: "10px" }}
                        />
                        <div
                          className="skeleton"
                          style={{ height: "8px", borderRadius: "999px" }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="leaderboard">
                    {results.map((c, index) => {
                      const pct =
                        totalVotes > 0
                          ? Math.round((c.votes / totalVotes) * 100)
                          : 0;
                      return (
                        <div
                          key={c._id}
                          className="leaderboard-row"
                          id={`result-${c._id}`}
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          <div className="leaderboard-meta">
                            <span className="leaderboard-rank">
                              {index === 0 && totalVotes > 0 ? "🏆" : `#${index + 1}`}
                            </span>
                            <span className="leaderboard-name">{c.name}</span>
                            <span className="leaderboard-party-tag">
                              {c.party || "Independent"}
                            </span>
                            <span className="leaderboard-vote-count">
                              {c.votes} {c.votes === 1 ? "vote" : "votes"} · {pct}%
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className={`progress-fill ${
                                FILL_CLASSES[Math.min(index, FILL_CLASSES.length - 1)]
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Stats */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Total votes */}
                <div className="stat-tile">
                  <div className="stat-tile__label">Total Votes Cast</div>
                  <div className="stat-tile__value">{totalVotes}</div>
                  <div className="stat-tile__note">
                    Firebase-verified, tamper-proof
                  </div>
                </div>

                {/* Candidates */}
                <div className="stat-tile">
                  <div className="stat-tile__label">Candidates</div>
                  <div className="stat-tile__value">{results.length}</div>
                  <div className="stat-tile__note">
                    Seeded from MongoDB
                  </div>
                </div>

                {/* Current leader */}
                {leader && totalVotes > 0 && (
                  <div className="stat-tile stat-tile--winner">
                    <div className="stat-tile__label">🏆 Current Leader</div>
                    <div
                      className="winner-name"
                      style={{ fontSize: "1.05rem", fontWeight: 700, margin: "8px 0 4px" }}
                    >
                      {leader.name}
                    </div>
                    <div className="stat-tile__note">
                      {Math.round((leader.votes / totalVotes) * 100)}% of votes
                    </div>
                  </div>
                )}

                {/* Link to Admin */}
                <button
                  className="btn btn--ghost"
                  style={{ width: "100%" }}
                  onClick={() => navigate("/admin")}
                >
                  🛡️ Open Admin Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;