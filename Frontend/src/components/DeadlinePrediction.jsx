// src/components/DeadlinePrediction.jsx
import { useEffect, useState } from "react";
import API from "../services/api";

function ProbabilityRing({ value }) {
  const radius = 30;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const color = value >= 70 ? "#28a745" : value >= 40 ? "#ffc107" : "#dc3545";

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#eee"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeDasharray={circumference + " " + circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${radius} ${radius})`}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.3em"
        fontSize="13"
        fontWeight="bold"
        fill="#333"
      >
        {value}%
      </text>
    </svg>
  );
}

function DeadlinePrediction({ goalId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    API.get(`/goals/${goalId}/prediction`)
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch((err) => console.error("Prediction fetch failed:", err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [goalId]);

  if (loading) {
    return (
      <p style={{ fontSize: "13px", color: "#aaa", fontStyle: "italic", margin: "10px 0" }}>
        🔮 Calculating deadline prediction...
      </p>
    );
  }

  if (!data || !data.hasEnoughData) {
    return (
      <p style={{ fontSize: "13px", color: "#aaa", margin: "10px 0" }}>
        🔮 {data?.insight || "Not enough data yet for a prediction."}
      </p>
    );
  }

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "14px 16px",
        background: "linear-gradient(135deg, #f5f3ff, #fdf4ff)",
        border: "1px solid #ede9fe",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <ProbabilityRing value={data.completionProbability} />

      <div style={{ flex: 1, minWidth: "200px" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#6f42c1", marginBottom: "2px" }}>
          🔮 Deadline Prediction
        </div>
        <div style={{ fontSize: "13.5px", color: "#333" }}>
          Predicted finish: <strong>{data.predictedFinishDate}</strong>
          {data.hasDeadline && (
            <span style={{ color: "#888" }}>&nbsp;(target: {data.deadlineDate})</span>
          )}
        </div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
          Pace: {data.paceHoursPerDay}h/day · {data.completedTasks}/{data.totalTasks} tasks done
        </div>
        {data.insight && (
          <div style={{ fontSize: "12.5px", color: "#555", marginTop: "6px", fontStyle: "italic" }}>
            💡 {data.insight}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeadlinePrediction;