import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbCreateUser,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || ""
};

// Check if we have Firebase keys configured. If not, run in mock mode
const hasKeys = firebaseConfig.apiKey && firebaseConfig.projectId;
export const isMockFirebase = !hasKeys || process.env.REACT_APP_FIREBASE_MOCK === "true";

let app;
let realAuth;

if (!isMockFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    realAuth = getAuth(app);
    console.log("Firebase initialized successfully in production mode.");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to mock mode:", error);
    realAuth = null;
  }
}

// Global mock state
let mockCurrentUser = null;
const mockListeners = [];

const mockAuth = {
  get currentUser() {
    return mockCurrentUser;
  },
  onAuthStateChanged(callback) {
    mockListeners.push(callback);
    // Initial call
    setTimeout(() => callback(mockCurrentUser), 0);
    return () => {
      const idx = mockListeners.indexOf(callback);
      if (idx !== -1) mockListeners.splice(idx, 1);
    };
  }
};

const triggerAuthChange = () => {
  mockListeners.forEach(cb => cb(mockCurrentUser));
};

export const auth = !isMockFirebase && realAuth ? realAuth : mockAuth;

// Helper: Sign In
export const loginWithEmail = async (email, password) => {
  if (!isMockFirebase && realAuth) {
    const credential = await fbSignIn(realAuth, email, password);
    return credential.user;
  } else {
    // Mock Login
    console.log("[MOCK] Logging in with:", email);
    const uid = "mock_uid_" + email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    mockCurrentUser = {
      uid,
      email,
      displayName: email.split("@")[0],
      getIdToken: async () => `mock_token_${uid}_${email}_${encodeURIComponent(email.split("@")[0])}`
    };
    triggerAuthChange();
    return mockCurrentUser;
  }
};

// Helper: Register
export const registerWithEmail = async (name, email, password) => {
  if (!isMockFirebase && realAuth) {
    const credential = await fbCreateUser(realAuth, email, password);
    await fbUpdateProfile(credential.user, { displayName: name });
    return credential.user;
  } else {
    // Mock Register
    console.log("[MOCK] Registering user:", name, email);
    const uid = "mock_uid_" + email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    mockCurrentUser = {
      uid,
      email,
      displayName: name,
      getIdToken: async () => `mock_token_${uid}_${email}_${encodeURIComponent(name)}`
    };
    triggerAuthChange();
    return mockCurrentUser;
  }
};

// Helper: Sign Out
export const logout = async () => {
  if (!isMockFirebase && realAuth) {
    await fbSignOut(realAuth);
  } else {
    console.log("[MOCK] Signing out");
    mockCurrentUser = null;
    triggerAuthChange();
  }
};

// Helper: Get token
export const getUserToken = async (user) => {
  if (!user) return null;
  if (typeof user.getIdToken === "function") {
    return await user.getIdToken();
  }
  return null;
};
