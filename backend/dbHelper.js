const mongoose = require("mongoose");
const Candidate = require("./models/Candidate");
const User = require("./models/User");

// Disable Mongoose buffering so that operations fail fast instead of hanging when disconnected
mongoose.set("bufferCommands", false);

// In-memory fallbacks
let memoryCandidates = [
  { _id: "cand_alice", name: "Alice Smith", party: "Democratic Party", votes: 0 },
  { _id: "cand_bob", name: "Bob Jones", party: "Republican Party", votes: 0 },
  { _id: "cand_charlie", name: "Charlie Brown", party: "Independent", votes: 0 }
];

let memoryUsers = [];

const isConnected = () => mongoose.connection.readyState === 1;

const getCandidates = async () => {
  if (isConnected()) {
    try {
      return await Candidate.find().sort({ votes: -1, name: 1 });
    } catch (err) {
      console.warn("MongoDB query failed, falling back to in-memory candidates:", err.message);
    }
  }
  return [...memoryCandidates].sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));
};

const getCandidateById = async (id) => {
  if (isConnected()) {
    try {
      return await Candidate.findById(id);
    } catch (err) {
      console.warn("MongoDB query failed, falling back to in-memory candidate lookup:", err.message);
    }
  }
  return memoryCandidates.find(c => c._id === id);
};

const saveCandidateVote = async (candidate) => {
  if (isConnected() && typeof candidate.save === "function") {
    try {
      candidate.votes += 1;
      await candidate.save();
      return candidate;
    } catch (err) {
      console.warn("MongoDB write failed, falling back to in-memory vote increment:", err.message);
    }
  }
  candidate.votes += 1;
  return candidate;
};

const getUserByUid = async (uid) => {
  if (isConnected()) {
    try {
      return await User.findOne({ uid });
    } catch (err) {
      console.warn("MongoDB query failed, falling back to in-memory user lookup:", err.message);
    }
  }
  return memoryUsers.find(u => u.uid === uid);
};

const createUser = async (userData) => {
  if (isConnected()) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (err) {
      console.warn("MongoDB user creation failed, falling back to in-memory user registration:", err.message);
    }
  }
  const user = { ...userData, _id: "user_" + Date.now(), hasVoted: false };
  memoryUsers.push(user);
  return user;
};

const saveUserVoted = async (user) => {
  if (isConnected() && typeof user.save === "function") {
    try {
      user.hasVoted = true;
      await user.save();
      return user;
    } catch (err) {
      console.warn("MongoDB write failed, falling back to in-memory user update:", err.message);
    }
  }
  user.hasVoted = true;
  return user;
};

module.exports = {
  isConnected,
  getCandidates,
  getCandidateById,
  saveCandidateVote,
  getUserByUid,
  createUser,
  saveUserVoted
};
