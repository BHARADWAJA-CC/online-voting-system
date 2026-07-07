# 🗳️ SecureVote: Real-Time Online Voting System

## 📌 Architecture Overview
A production-ready, full-stack voting platform engineered for high data integrity, secure session management, and real-time synchronization. Built with a decoupled React frontend and an Express backend, the system guarantees a strict one-vote-per-user constraint backed by cryptographic token verification.

## 🚀 Key Features (System Capabilities)

•Secure Frontend Dashboard: A responsive, state-driven user interface built in React, featuring a live administrative control panel for real-time election monitoring.*

•Cryptographic Token Verification: Integrated with Firebase Authentication to issue secure JWTs. The Node.js backend intercepts and validates these tokens via middleware, ensuring endpoints are entirely protected against unauthorized access.*

•Strict Voting Constraints: Utilizes a custom MongoDB datastore layer to atomically verify and update user voting statuses, absolutely preventing double-voting and race conditions.*

•Live Event Streaming: Implements Server-Sent Events (SSE) to establish a persistent keep-alive connection, dynamically pushing vote updates to all connected clients in real-time without continuous polling.*

## 🛠️ Local Development Setup
### 1. Prerequisites
Ensure you have the following installed in your development environment:

•Node.js (v16+)*

•npm or yarn*

•A MongoDB Atlas Cluster*

•A Firebase Project with Email/Password authentication enabled*

### 2. Environment Variables
Create a .env file in the backend directory and configure the following:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/votingSystem
PORT=5000

### 3. Installation & Execution
Bootstrapping the Backend:
cd backend
npm install
npm start

Bootstrapping the Frontend:
cd frontend
npm install
npm start
