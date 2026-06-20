// src/components/AnalyticsDashboard.jsx
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import API from "../services/api";

const PURPLE = "#6f42c1";
const PURPLE_LIGHT = "#a78bfa";
const GREEN = "#28a745";
const AMBER = "#ffc107";
const RED = "#dc3545";
const GREY = "#e5e7eb";

function StatCard({ label, value, sub, color }) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        background: "white",
        border: "1px solid #ede9fe",
        borderRadius: "12px",
        padding: "16px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: "12px", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "28px", fontWeight: "800", color: color || "#333", marginTop: "4px" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function DonutStat({ title, percent, color, completedLabel, totalLabel }) {
  const data = [
    { name: "done", value: percent },
    { name: "rest", value: Math.max(100 - percent, 0) },
  ];

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ede9fe",
        borderRadius: "12px",
        padding: "18px 20px",
        flex: "1 1 240px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div style={{ width: 100, height: 100, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={32}
              outerRadius={48}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill={GREY} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "17px",
            fontWeight: "800",
            color: "#333",
          }}
        >
          {percent}%
        </div>
      </div>
      <div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#333" }}>{title}</div>
        <div style={{ fontSize: "12.5px", color: "#888", marginTop: "4px" }}>{completedLabel}</div>
        <div style={{ fontSize: "12.5px", color: "#888" }}>{totalLabel}</div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, suffix }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ede9fe",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12.5px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontWeight: "700", color: "#333" }}>{label}</div>
      <div style={{ color: PURPLE }}>
        {payload[0].value}
        {suffix}
      </div>
    </div>
  );
}

function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    API.get("/analytics")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#888", fontStyle: "italic" }}>
        📊 Crunching your numbers...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#aaa" }}>
        Couldn't load analytics right now.
      </div>
    );
  }

  if (data.totalGoals === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 20px",
          color: "#aaa",
          border: "2px dashed #e0e0e0",
          borderRadius: "12px",
        }}
      >
        <p style={{ fontSize: "32px", margin: "0 0 8px" }}>📊</p>
        <p style={{ fontSize: "15px" }}>Create a goal to start seeing analytics here</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "12px" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: "22px" }}>📊 Analytics Dashboard</h2>
      <p style={{ margin: "0 0 20px", color: "#888", fontSize: "13px" }}>
        A snapshot of how your goals and tasks are trending
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
        <StatCard label="Total Goals" value={data.totalGoals} color={PURPLE} />
        <StatCard label="Total Tasks" value={data.totalTasks} color={PURPLE} />
        <StatCard label="Tasks Completed" value={data.completedTasks} sub={`of ${data.totalTasks}`} color={GREEN} />
        <StatCard label="Goals Completed" value={data.completedGoals} sub={`of ${data.totalGoals}`} color={GREEN} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "24px" }}>
        <DonutStat
          title="Task Completion Rate"
          percent={data.taskCompletionRate}
          color={data.taskCompletionRate >= 70 ? GREEN : data.taskCompletionRate >= 40 ? AMBER : RED}
          completedLabel={`${data.completedTasks} completed`}
          totalLabel={`${data.totalTasks - data.completedTasks} remaining`}
        />
        <DonutStat
          title="Goal Success Rate"
          percent={data.goalSuccessRate}
          color={data.goalSuccessRate >= 70 ? GREEN : data.goalSuccessRate >= 40 ? AMBER : RED}
          completedLabel={`${data.completedGoals} goals completed`}
          totalLabel={`${data.totalGoals - data.completedGoals} in progress`}
        />
      </div>

      <div style={{ background: "white", border: "1px solid #ede9fe", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "15px", color: "#333" }}>📈 Progress Over Time</h3>
        <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#999" }}>
          Cumulative share of all tasks completed, week over week
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.weeklyProgress} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PURPLE} stopOpacity={0.35} />
                <stop offset="95%" stopColor={PURPLE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0eefa" vertical={false} />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: "#999" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip suffix="% complete" />} />
            <Area type="monotone" dataKey="completionPercent" stroke={PURPLE} strokeWidth={2.5} fill="url(#progressFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "white", border: "1px solid #ede9fe", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "15px", color: "#333" }}>⚡ Productivity Trend</h3>
        <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#999" }}>
          Tasks completed per day over the last 14 days
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.productivityTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0eefa" vertical={false} />
            <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip suffix=" tasks" />} />
            <Bar dataKey="tasksCompleted" fill={PURPLE_LIGHT} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.priorityBreakdown && data.priorityBreakdown.some((p) => p.count > 0) && (
        <div style={{ background: "white", border: "1px solid #ede9fe", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: "#333" }}>🎯 Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart layout="vertical" data={data.priorityBreakdown} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eefa" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="priority" tick={{ fontSize: 12, fill: "#666", fontWeight: 600 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip suffix=" tasks" />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.priorityBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.priority === "HIGH" ? RED : entry.priority === "MEDIUM" ? AMBER : GREEN} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;