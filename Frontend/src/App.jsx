// src/App.jsx
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import API from "./services/api";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import GoalList from "./components/GoalList";
import DailyPlanner from "./components/DailyPlanner";
import KanbanBoard from "./components/KanbanBoard";
import ChatWindow from "./components/ChatWindow";
import { useAuth } from "./context/AuthContext";

function Dashboard() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("goals");
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
      setRefreshKey((prev) => prev + 1);
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

  const TAB_STYLE = (active) => ({
    padding: "9px 22px",
    cursor: "pointer",
    border: "none",
    borderBottom: active ? "3px solid #6f42c1" : "3px solid transparent",
    background: "transparent",
    fontWeight: active ? "700" : "400",
    color: active ? "#6f42c1" : "#666",
    fontSize: "14px",
    transition: "all 0.2s",
  });

  return (
    <div style={{ maxWidth: "960px", margin: "40px auto", padding: "20px", fontFamily: "Arial" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>🤖 AI Task Planner</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Logout
        </button>
      </div>

      {/* Create Goal */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter your goal..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            padding: "10px",
            width: "68%",
            marginRight: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Creating..." : "Create Goal"}
        </button>
      </div>

      <hr style={{ marginBottom: 0, borderColor: "#e0e0e0" }} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #e0e0e0" }}>
        <button style={TAB_STYLE(activeTab === "goals")}   onClick={() => setActiveTab("goals")}>📋 Goals</button>
        <button style={TAB_STYLE(activeTab === "kanban")}  onClick={() => setActiveTab("kanban")}>🗂 Kanban Board</button>
        <button style={TAB_STYLE(activeTab === "planner")} onClick={() => setActiveTab("planner")}>📅 Daily Planner</button>
        <button style={TAB_STYLE(activeTab === "chat")}    onClick={() => setActiveTab("chat")}>💬 AI Mentor</button>
      </div>

      {/* Tab Content */}
      {activeTab === "goals"   && <GoalList key={refreshKey} />}
      {activeTab === "kanban"  && <KanbanBoard key={refreshKey} />}
      {activeTab === "planner" && <DailyPlanner />}
      {activeTab === "chat"    && <ChatWindow />}

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