// src/components/DailyPlanner.jsx
import { useState, useEffect } from "react";
import API from "../services/api";

function DailyPlanner() {
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [availableHours, setAvailableHours] = useState(3);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/goals")
      .then((res) => setGoals(res.data))
      .catch(console.error);
  }, []);

  const generatePlan = async () => {
    if (!selectedGoalId) {
      alert("Please select a goal");
      return;
    }

    setLoading(true);
    setPlan("");

    try {
      const res = await API.get(
        `/planner/today/${selectedGoalId}?hours=${availableHours}`
      );
      setPlan(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const parseSchedule = (text) => {
    if (!text) return [];
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\d{1,2}:\d{2}/.test(line));
  };

  const scheduleRows = parseSchedule(plan);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "20px",
        marginTop: "30px",
        background: "#fafafa",
      }}
    >
      <h2 style={{ margin: "0 0 16px" }}>📅 AI Daily Planner</h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
        <select
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "200px" }}
        >
          <option value="">-- Select a Goal --</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
          Available Hours:
          <input
            type="number"
            min={1}
            max={12}
            value={availableHours}
            onChange={(e) => setAvailableHours(Number(e.target.value))}
            style={{ width: "60px", padding: "7px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </label>

        <button
          onClick={generatePlan}
          disabled={loading}
          style={{
            padding: "9px 20px",
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Planning..." : "Generate Today's Plan"}
        </button>
      </div>

      {/* Schedule Output */}
      {loading && (
        <p style={{ color: "#888", fontStyle: "italic" }}>⏳ AI is building your schedule...</p>
      )}

      {scheduleRows.length > 0 && (
        <div>
          <h3 style={{ marginBottom: "12px", color: "#333" }}>🗓 Today's Schedule</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {scheduleRows.map((row, i) => {
              const [time, ...rest] = row.split(" - ");
              const task = rest.join(" - ");
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    style={{
                      background: "#6f42c1",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      minWidth: "90px",
                      textAlign: "center",
                    }}
                  >
                    {time}
                  </span>
                  <span style={{ fontSize: "15px", color: "#333" }}>{task}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raw fallback if AI format differs */}
      {plan && scheduleRows.length === 0 && (
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", color: "#444" }}>
          {plan}
        </pre>
      )}
    </div>
  );
}

export default DailyPlanner;