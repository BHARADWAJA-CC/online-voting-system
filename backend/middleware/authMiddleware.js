const admin = require("firebase-admin");
const dbHelper = require("../dbHelper");

// Helper to check if Firebase is initialized
const isFirebaseInitialized = () => {
  return admin.apps.length > 0;
};

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];

    let decodedToken;

    // Check if it is a mock token for local testing
    if (token.startsWith("mock_token_")) {
      // Format: mock_token_UID_EMAIL_NAME
      const parts = token.split("_");
      const uid = parts[2] || "mock-uid";
      const email = parts[3] || "mock@example.com";
      const name = parts[4] ? decodeURIComponent(parts[4]) : "Mock User";
      decodedToken = { uid, email, name };
    } else {
      if (!isFirebaseInitialized()) {
        return res.status(500).json({ 
          message: "Firebase Admin is not configured on the server. Use a mock token (mock_token_UID_EMAIL_NAME) for local development." 
        });
      }
      decodedToken = await admin.auth().verifyIdToken(token);
    }

    // Find or create the user using the dbHelper
    let user = await dbHelper.getUserByUid(decodedToken.uid);
    if (!user) {
      user = await dbHelper.createUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split("@")[0],
        hasVoted: false
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid authorization token" });
  }
};

module.exports = authMiddleware;
