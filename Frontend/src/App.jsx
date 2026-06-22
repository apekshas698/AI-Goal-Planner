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
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import StreakBadge from "./components/StreakBadge";
import ResumeRoadmap from "./components/ResumeRoadmap";
import { useAuth } from "./context/AuthContext";

const TABS = [
  { id: "goals",     label: "Goals",          icon: "📋" },
  { id: "kanban",    label: "Kanban",          icon: "🗂"  },
  { id: "planner",   label: "Daily Planner",   icon: "📅" },
  { id: "analytics", label: "Analytics",       icon: "📊" },
  { id: "resume",    label: "Resume Roadmap",  icon: "📄" },
  { id: "chat",      label: "AI Mentor",       icon: "💬" },
];

function Dashboard() {
  const [title, setTitle]           = useState("");
  const [targetDays, setTargetDays] = useState("");
  const [loading, setLoading]       = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab]   = useState("goals");
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await API.post("/goals", {
        title,
        targetDays: targetDays ? Number(targetDays) : null,
      });
      setTitle("");
      setTargetDays("");
      setRefreshKey((k) => k + 1);
      setActiveTab("goals");
    } catch (err) {
      console.error(err);
      alert("Failed to create goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="dash-root">
      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-nav-inner">
          <div className="dash-logo">
            <div className="dash-logo-icon">🤖</div>
            PlanAI
          </div>
          <div className="dash-nav-right">
            <div className="dash-user-pill">
              <span>👤</span>
              <span>My Workspace</span>
            </div>
            <button className="dash-logout-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="dash-main">
        <StreakBadge key={refreshKey} />

        {/* Goal creation card */}
        <div className="create-card">
          <div className="create-card-title">What's your next goal?</div>
          <div className="create-card-sub">
            AI will generate a full roadmap and prioritised tasks instantly
          </div>
          <div className="create-card-row">
            <input
              className="create-input"
              type="text"
              placeholder="e.g. Learn Spring Boot, Crack FAANG interview…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <input
              className="create-input create-input-days"
              type="number"
              placeholder="Target days"
              value={targetDays}
              onChange={(e) => setTargetDays(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              min={1}
            />
            <button
              className="create-submit-btn"
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
            >
              {loading ? "Creating…" : "✨ Create Goal"}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {activeTab === "goals"     && <GoalList key={refreshKey} />}
        {activeTab === "kanban"    && <KanbanBoard key={refreshKey} />}
        {activeTab === "planner"   && <DailyPlanner />}
        {activeTab === "analytics" && <AnalyticsDashboard key={refreshKey} />}
        {activeTab === "resume"    && <ResumeRoadmap />}
        {activeTab === "chat"      && <ChatWindow />}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login"  element={<Login />} />
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
