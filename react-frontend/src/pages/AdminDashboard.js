import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

const FILL_CLASSES = ["progress-fill--leader", "progress-fill--2nd", "progress-fill--other"];

function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [totalVotes, setTotalVotes] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const eventSource = new EventSource(`${API}/results/stream`);

    eventSource.onopen = () => setConnectionStatus("connected");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setCandidates(data);
        setTotalVotes(data.reduce((acc, c) => acc + c.votes, 0));
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus("error");
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const leader = candidates[0];
  const leadPct =
    leader && totalVotes > 0
      ? Math.round((leader.votes / totalVotes) * 100)
      : 0;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar__brand">
          <div className="navbar__logo-icon">🛡️</div>
          <span className="navbar__logo-text">
            Secure<span>Vote</span> Admin
          </span>
        </div>
        <div className="navbar__actions">
          <span className={`live-badge live-badge--${connectionStatus}`}>
            <span className="live-badge__dot" />
            {connectionStatus === "connected"
              ? "Stream Active"
              : connectionStatus === "connecting"
              ? "Connecting…"
              : "Disconnected"}
          </span>
          <button
            id="go-to-vote-btn"
            className="btn btn--ghost btn--icon"
            onClick={() => navigate("/vote")}
          >
            🗳️ Vote
          </button>
          <button
            className="btn btn--ghost btn--icon"
            onClick={() => navigate("/results")}
          >
            📊 Results
          </button>
        </div>
      </nav>

      {/* Page body */}
      <div
        className="page-wrapper"
        style={{ paddingTop: "40px", paddingBottom: "60px", alignItems: "flex-start" }}
      >
        <div className="glass-card dashboard-card">
          {/* Top bar */}
          <div className="dash-topbar">
            <div className="dash-topbar__left">
              <div>
                <div className="dash-topbar__title">
                  🛡️ Election Control Panel
                </div>
                <div className="dash-topbar__sub">
                  {lastUpdate
                    ? `Last updated: ${lastUpdate}`
                    : "Waiting for stream data…"}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="dash-body">
            {/* KPI row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "14px",
                marginBottom: "28px",
              }}
            >
              {/* Total votes KPI */}
              <div className="stat-tile">
                <div className="stat-tile__label">Total Votes</div>
                <div className="stat-tile__value">{totalVotes}</div>
                <div className="stat-tile__note">Authenticated & unique</div>
              </div>

              {/* Candidates KPI */}
              <div className="stat-tile">
                <div className="stat-tile__label">Candidates</div>
                <div className="stat-tile__value">{candidates.length}</div>
                <div className="stat-tile__note">On the ballot</div>
              </div>

              {/* Leader KPI */}
              {leader && (
                <div className="stat-tile stat-tile--winner">
                  <div className="stat-tile__label">🏆 Leading</div>
                  <div
                    className="winner-name"
                    style={{ fontSize: "0.95rem", margin: "8px 0 4px" }}
                  >
                    {leader.name}
                  </div>
                  <div className="stat-tile__note">{leadPct}% of all votes</div>
                </div>
              )}

              {/* Stream health KPI */}
              <div className="stat-tile">
                <div className="stat-tile__label">Stream Health</div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    marginTop: "6px",
                    marginBottom: "6px",
                  }}
                >
                  {connectionStatus === "connected"
                    ? "🟢"
                    : connectionStatus === "connecting"
                    ? "🟡"
                    : "🔴"}
                </div>
                <div className="stat-tile__note" style={{ textTransform: "capitalize" }}>
                  {connectionStatus}
                </div>
              </div>
            </div>

            {/* Leaderboard section */}
            <div className="dashboard-panel">
              <div className="dashboard-panel__title">
                <span>📈</span> Real-time Standings
              </div>

              {candidates.length === 0 ? (
                <div
                  className="alert alert--info"
                  style={{ marginBottom: 0 }}
                >
                  <span className="alert__icon">🔄</span>
                  <span>
                    Waiting for live data from the SSE stream…
                  </span>
                </div>
              ) : (
                <div className="leaderboard">
                  {candidates.map((c, index) => {
                    const pct =
                      totalVotes > 0
                        ? Math.round((c.votes / totalVotes) * 100)
                        : 0;

                    return (
                      <div
                        key={c._id}
                        className="leaderboard-row"
                        id={`admin-result-${c._id}`}
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

                        {/* Dual progress bar: filled vs track */}
                        <div className="progress-track">
                          <div
                            className={`progress-fill ${
                              FILL_CLASSES[
                                Math.min(index, FILL_CLASSES.length - 1)
                              ]
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

            {/* Security info panel */}
            <div
              style={{
                marginTop: "20px",
                padding: "16px 20px",
                borderRadius: "12px",
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.15)",
                fontSize: "0.8rem",
                color: "var(--clr-text-muted)",
                lineHeight: "1.6",
              }}
            >
              <strong style={{ color: "var(--clr-accent-light)" }}>
                🔐 Security Guarantees
              </strong>
              <br />
              All votes are uniquely tied to a Firebase UID verified by the
              Admin SDK. The{" "}
              <code
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}
              >
                hasVoted
              </code>{" "}
              flag is set atomically on the user document in MongoDB, preventing
              double-voting even under concurrent requests. Results are pushed
              over a persistent SSE connection — no polling required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
