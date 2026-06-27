import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/vote" element={<Vote />} />
      <Route path="/results" element={<Results />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;