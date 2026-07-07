const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const voteRoutes = require("./routes/voteRoutes");

const app = express();

// Initialize Firebase Admin SDK
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized via service account configuration.");
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", err);
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log("Firebase Admin SDK initialized via Application Default Credentials.");
  } catch (err) {
    console.error("Failed to initialize Firebase Admin via ADC:", err);
  }
} else {
  console.warn("==========================================================================");
  console.warn("WARNING: No Firebase Admin credentials found in environment.");
  console.warn("The backend will operate in DEVELOPMENT MOCK MODE.");
  console.warn("Please use mock auth tokens (mock_token_UID_EMAIL_NAME) to test endpoints.");
  console.warn("==========================================================================");
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiter for /api/vote
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter specifically to /api/vote route
app.use("/api/vote", voteLimiter);

// Routes
app.use("/api", voteRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Online Voting System API is running by AG39");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
