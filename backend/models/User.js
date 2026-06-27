const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  hasVoted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", userSchema);