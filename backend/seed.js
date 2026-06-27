const mongoose = require("mongoose");
const Candidate = require("./models/Candidate");
require("dotenv").config();

const candidates = [
  { name: "Alice Smith", party: "Democratic Party", votes: 0 },
  { name: "Bob Jones", party: "Republican Party", votes: 0 },
  { name: "Charlie Brown", party: "Independent", votes: 0 }
];

async function seed() {
  const uris = [
    process.env.MONGO_URI,
    "mongodb://127.0.0.1:27017/voting-system"
  ].filter(Boolean);

  let connected = false;

  for (const uri of uris) {
    try {
      console.log(`Attempting to connect to MongoDB...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      console.log("Connected successfully!");
      connected = true;
      break;
    } catch (err) {
      console.warn(`Connection attempt failed: ${err.message}`);
    }
  }

  if (!connected) {
    console.error("\nERROR: Could not connect to any MongoDB instance.");
    console.error("Please ensure that either your remote MongoDB cluster is online and reachable,");
    console.error("or you have a local MongoDB instance running on mongodb://127.0.0.1:27017/");
    process.exit(1);
  }

  try {
    console.log("Clearing old candidates...");
    await Candidate.deleteMany({});
    
    console.log("Inserting seed candidates...");
    await Candidate.insertMany(candidates);
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error writing seed data:", error);
  } finally {
    mongoose.connection.close();
  }
}

seed();
