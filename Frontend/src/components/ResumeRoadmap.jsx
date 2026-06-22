// src/components/ResumeRoadmap.jsx
import { useState } from "react";
import API from "../services/api";

const SECTIONS = [
  {
    key: "dsaRoadmap",
    icon: "🧮",
    fullLabel: "Data Structures & Algorithms",
    color: "#6f42c1",
    bg: "#f5f3ff",
    border: "#ede9fe",
    accent: "#7c3aed",
  },
  {
    key: "systemDesignRoadmap",
    icon: "🏗️",
    fullLabel: "System Design",
    color: "#0369a1",
    bg: "#f0f9ff",
    border: "#bae6fd",
    accent: "#0284c7",
  },
  {
    key: "projectsRoadmap",
    icon: "🚀",
    fullLabel: "Projects",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    accent: "#059669",
  },
  {
    key: "csFundamentalsRoadmap",
    icon: "📚",
    fullLabel: "CS Fundamentals",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fde68a",
    accent: "#d97706",
  },
];

function parseItems(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line))
    .map((line) => {
      const withoutNum = line.replace(/^\d+\.\s*/, "");
      const match = withoutNum.match(/^(.+?)\s*\((.+)\)\s*$/);
      if (match) {
        return { topic: match[1].trim(), tip: match[2].trim() };
      }
      return { topic: withoutNum, tip: null };
    });
}

function RoadmapCard({ section, content, loading }) {
  const [expanded, setExpanded] = useState(true);
  const items = parseItems(content);

  return (
    <div
      style={{
        background: section.bg,
        border: `1.5px solid ${section.border}`,
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: "24px" }}>{section.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "800", fontSize: "15px", color: section.color }}>
            {section.fullLabel}
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>
            {loading
              ? "Generating roadmap…"
              : items.length > 0
              ? `${items.length} key topics`
              : "Waiting…"}
          </div>
        </div>
        <span style={{ fontSize: "13px", color: "#bbb" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Body */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${section.border}`,
            padding: "16px 20px",
            background: "rgba(255,255,255,0.65)",
          }}
        >
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    height: "14px",
                    background: section.border,
                    borderRadius: "6px",
                    width: `${60 + i * 7}%`,
                    animation: "pulse 1.4s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>
              No content generated yet.
            </p>
          ) : (
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {items.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    marginBottom: idx < items.length - 1 ? "12px" : 0,
                    paddingBottom: idx < items.length - 1 ? "12px" : 0,
                    borderBottom:
                      idx < items.length - 1 ? `1px solid ${section.border}` : "none",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: section.color,
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "1px",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#222",
                        lineHeight: "1.4",
                      }}
                    >
                      {item.topic}
                    </div>
                    {item.tip && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: section.accent,
                          marginTop: "2px",
                          fontStyle: "italic",
                        }}
                      >
                        💡 {item.tip}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

const EXAMPLE_ROLES = [
  "Amazon SDE Internship",
  "Google Software Engineer",
  "Microsoft New Grad SDE",
  "Meta Backend Engineer",
  "Startup Full Stack Role",
];

export default function ResumeRoadmap() {
  const [target, setTarget] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async (roleTarget) => {
    const role = (roleTarget || target).trim();
    if (!role) {
      setError("Please enter a target role or company.");
      return;
    }
    setError("");
    setLoading(true);
    setRoadmap(null);
    if (roleTarget) setTarget(roleTarget);

    try {
      const res = await API.post("/resume-roadmap/generate", { target: role });
      setRoadmap(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "12px" }}>
      {/* Header */}
      <h2 style={{ margin: "0 0 4px", fontSize: "22px" }}>📄 AI Resume Roadmaps</h2>
      <p style={{ margin: "0 0 20px", color: "#888", fontSize: "13px" }}>
        Enter your target role and get a personalised prep roadmap across DSA,
        System Design, Projects, and CS Fundamentals
      </p>

      {/* Input row */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
        <input
          type="text"
          placeholder="e.g. Amazon SDE Internship, Google L4, Startup Full Stack"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          disabled={loading}
          style={{
            flex: "1 1 300px",
            padding: "11px 16px",
            borderRadius: "8px",
            border: "1.5px solid #ddd6fe",
            fontSize: "14px",
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#6f42c1")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd6fe")}
        />
        <button
          onClick={() => generate()}
          disabled={loading || !target.trim()}
          style={{
            padding: "11px 24px",
            borderRadius: "8px",
            border: "none",
            background:
              loading || !target.trim()
                ? "#e5e7eb"
                : "linear-gradient(135deg,#6f42c1,#8a5cf7)",
            color: loading || !target.trim() ? "#9ca3af" : "white",
            fontWeight: "700",
            fontSize: "14px",
            cursor: loading || !target.trim() ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Generating…" : "Generate Roadmap ✨"}
        </button>
      </div>

      {/* Quick-pick chips */}
      {!roadmap && !loading && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
          <span style={{ fontSize: "12px", color: "#aaa", alignSelf: "center", fontWeight: "600" }}>
            Try:
          </span>
          {EXAMPLE_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => generate(role)}
              style={{
                padding: "5px 14px",
                borderRadius: "20px",
                border: "1px solid #ddd6fe",
                background: "white",
                color: "#6f42c1",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              {role}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: "#dc3545", fontSize: "13px", marginBottom: "16px" }}>{error}</p>
      )}

      {/* Target badge */}
      {(roadmap || loading) && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#f5f3ff",
            border: "1.5px solid #ede9fe",
            borderRadius: "24px",
            padding: "6px 16px",
            fontSize: "13px",
            fontWeight: "700",
            color: "#6f42c1",
            marginBottom: "20px",
          }}
        >
          🎯 Roadmap for:{" "}
          <span style={{ color: "#333" }}>{roadmap?.target || target}</span>
          {!loading && (
            <button
              onClick={() => { setRoadmap(null); setTarget(""); }}
              style={{
                marginLeft: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#aaa",
                fontSize: "14px",
                padding: 0,
                lineHeight: 1,
              }}
              title="Clear and start over"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Cards grid */}
      {(roadmap || loading) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {SECTIONS.map((section) => (
            <RoadmapCard
              key={section.key}
              section={section}
              content={roadmap ? roadmap[section.key] : null}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!roadmap && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "#aaa",
            border: "2px dashed #e0e0e0",
            borderRadius: "12px",
          }}
        >
          <p style={{ fontSize: "36px", margin: "0 0 8px" }}>📄</p>
          <p style={{ fontSize: "15px" }}>
            Enter a target role above to generate your personalised prep roadmap
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}