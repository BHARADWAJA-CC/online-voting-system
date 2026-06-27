const express = require("express");
const dbHelper = require("../dbHelper");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// SSE Client list
let clients = [];

// Helper to broadcast results to all SSE clients
const broadcastResults = async () => {
  try {
    const candidates = await dbHelper.getCandidates();
    const data = JSON.stringify(candidates);
    clients.forEach(client => {
      client.write(`data: ${data}\n\n`);
    });
  } catch (error) {
    console.error("Failed to broadcast results:", error);
  }
};

// VOTE (Secured with authMiddleware)
router.post("/vote", authMiddleware, async (req, res) => {
  try {
    const { candidateId } = req.body;
    const user = req.user; // populated by authMiddleware

    if (user.hasVoted) {
      return res.status(400).json({ message: "You have already cast your vote." });
    }

    const candidate = await dbHelper.getCandidateById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    // Atomically increment the vote count and mark the user as voted
    await dbHelper.saveCandidateVote(candidate);
    await dbHelper.saveUserVoted(user);

    // Trigger SSE broadcast to update all real-time dashboards
    await broadcastResults();

    res.status(200).json({ message: "Vote cast successfully!" });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ message: "Server error during voting" });
  }
});

// GET RESULTS
router.get("/results", async (req, res) => {
  try {
    const candidates = await dbHelper.getCandidates();
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Server error retrieving results" });
  }
});

// SSE LIVE RESULTS STREAM
router.get("/results/stream", (req, res) => {
  // Set headers for Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial data immediately
  dbHelper.getCandidates()
    .then(candidates => {
      res.write(`data: ${JSON.stringify(candidates)}\n\n`);
    })
    .catch(err => {
      console.error("Error sending initial SSE data:", err);
    });

  // Add client to broadcast list
  clients.push(res);

  // Remove client when connection closes
  req.on("close", () => {
    clients = clients.filter(client => client !== res);
  });
});

module.exports = router;