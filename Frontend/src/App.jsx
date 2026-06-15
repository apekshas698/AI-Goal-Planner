import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import API from "./services/api";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import GoalList from "./components/GoalList";
import { useAuth } from "./context/AuthContext";

function Dashboard() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a goal");
      return;
    }

    setLoading(true);

    try {
      await API.post("/goals", { title });
      setTitle("");
      setRefreshKey((prev) => prev + 1); // remounts GoalList to refetch goals/tasks
      alert("Goal Created Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>🤖 AI Task Planner</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            height: "40px",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter your goal..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "10px", width: "70%", marginRight: "10px" }}
        />

        <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 20px", cursor: "pointer" }}>
          {loading ? "Creating..." : "Create Goal"}
        </button>
      </div>

      <hr />

      <GoalList key={refreshKey} />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;