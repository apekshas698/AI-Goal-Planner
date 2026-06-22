// src/components/StreakBadge.jsx
import { useEffect, useState } from "react";
import API from "../services/api";

const BADGE_META = {
  "3-DAY_STREAK":     { emoji: "🌱", label: "3-Day Streak",      desc: "3 days in a row" },
  "WEEK_WARRIOR":     { emoji: "⚔️",  label: "Week Warrior",      desc: "7 days in a row" },
  "FORTNIGHT_FIRE":   { emoji: "🔥",  label: "Fortnight Fire",    desc: "14 days in a row" },
  "MONTHLY_MASTER":   { emoji: "👑",  label: "Monthly Master",    desc: "30 days in a row" },
  "60_DAY_LEGEND":    { emoji: "🏆",  label: "60-Day Legend",     desc: "60 days in a row" },
  "CENTURY_CHAMPION": { emoji: "💎",  label: "Century Champion",  desc: "100 days in a row" },
  "10_DAYS_ACTIVE":   { emoji: "✅",  label: "10 Days Active",    desc: "10 total active days" },
  "30_DAYS_ACTIVE":   { emoji: "📅",  label: "30 Days Active",    desc: "30 total active days" },
  "HALF_CENTURY":     { emoji: "🎯",  label: "Half Century",      desc: "50 total active days" },
  "CENTURION":        { emoji: "🌟",  label: "Centurion",         desc: "100 total active days" },
};

const STATUS_CONFIG = {
  ON_FIRE: { color: "#e85d04", bg: "#fff4e6", border: "#ffb347", label: "On Fire!"  },
  ACTIVE:  { color: "#2e7d32", bg: "#f0fff4", border: "#81c784", label: "Active"    },
  AT_RISK: { color: "#b26a00", bg: "#fff8e1", border: "#ffd54f", label: "At Risk!"  },
  BROKEN:  { color: "#6c757d", bg: "#f8f9fa", border: "#dee2e6", label: "Start up"  },
};

function FlameIcon({ size = 28, color = "#e85d04" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C12 2 8 7 8 11C8 13.21 9.79 15 12 15C14.21 15 16 13.21 16 11C16 9 14 6 14 6C14 6 15 8 13 9C13 9 14 7 12 2Z"/>
      <path d="M12 15C9.79 15 8 16.79 8 19C8 20.5 8.83 21.79 10.04 22.5C9.53 21.93 9.25 21.2 9.25 20.42C9.25 18.59 10.99 17.25 12.75 17.71C13.29 17.85 13.77 18.14 14.14 18.54C14.03 16.58 13.18 15 12 15Z"/>
    </svg>
  );
}

function StreakCircle({ value, size = 72 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / 30, 1);
  const offset = circumference * (1 - pct);
  const color = value >= 7 ? "#e85d04" : value >= 3 ? "#ffc107" : "#6f42c1";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#eee" strokeWidth={6} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: "20px", fontWeight: "800", color: "#333", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: "10px", color: "#888", marginTop: "1px" }}>days</span>
      </div>
    </div>
  );
}

function WeekDots({ activeToday }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div>
      <div style={{
        fontSize: "12px", color: "#999", fontWeight: "600",
        textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px",
      }}>
        This Week
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {days.map((d, i) => {
          const isToday = i === todayIdx;
          const isPast  = i < todayIdx;
          const active  = isPast || (isToday && activeToday);
          return (
            <div key={d} style={{ textAlign: "center", flex: 1 }}>
              <div style={{
                width: "100%", aspectRatio: "1", borderRadius: "50%",
                background: active ? "#e85d04" : isToday ? "#fff3e0" : "#f0f0f0",
                border: isToday ? "2px solid #e85d04" : "2px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", color: active ? "white" : "#bbb",
                transition: "background 0.3s",
              }}>
                {active ? "✓" : ""}
              </div>
              <div style={{ fontSize: "10px", color: "#aaa", marginTop: "3px" }}>{d}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NextBadgeHint({ badges = [], longest, total }) {
  const MILESTONES = [
    { key: "3-DAY_STREAK",     type: "streak", threshold: 3,   label: "3-Day Streak"     },
    { key: "WEEK_WARRIOR",     type: "streak", threshold: 7,   label: "Week Warrior"     },
    { key: "FORTNIGHT_FIRE",   type: "streak", threshold: 14,  label: "Fortnight Fire"   },
    { key: "MONTHLY_MASTER",   type: "streak", threshold: 30,  label: "Monthly Master"   },
    { key: "60_DAY_LEGEND",    type: "streak", threshold: 60,  label: "60-Day Legend"    },
    { key: "CENTURY_CHAMPION", type: "streak", threshold: 100, label: "Century Champion" },
    { key: "10_DAYS_ACTIVE",   type: "total",  threshold: 10,  label: "10 Days Active"   },
    { key: "30_DAYS_ACTIVE",   type: "total",  threshold: 30,  label: "30 Days Active"   },
    { key: "HALF_CENTURY",     type: "total",  threshold: 50,  label: "Half Century"     },
    { key: "CENTURION",        type: "total",  threshold: 100, label: "Centurion"        },
  ];

  const next = MILESTONES.find((m) => !badges.includes(m.key));
  if (!next) return null;

  const current   = next.type === "streak" ? longest : total;
  const remaining = next.threshold - current;

  return (
    <div style={{
      marginTop: "14px", padding: "10px 14px",
      background: "#f5f3ff", border: "1px solid #ede9fe",
      borderRadius: "10px", fontSize: "13px", color: "#6f42c1",
    }}>
      🎯 <strong>{remaining} more {next.type === "streak" ? "consecutive days" : "active days"}</strong> to earn <strong>{next.label}</strong>
    </div>
  );
}

export default function StreakBadge() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    API.get("/streak")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  const cfg = STATUS_CONFIG[data.streakStatus] || STATUS_CONFIG.BROKEN;

  return (
    <div style={{
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: "14px",
      overflow: "hidden",
      marginBottom: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}>

      {/* Main row */}
      <div
        onClick={() => setExpanded((p) => !p)}
        style={{
          display: "flex", alignItems: "center", gap: "16px",
          padding: "14px 18px", cursor: "pointer", userSelect: "none",
        }}
      >
        <FlameIcon size={32} color={cfg.color} />

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px", fontWeight: "800", color: cfg.color }}>
              {data.currentStreak} Day Streak
            </span>
            <span style={{
              fontSize: "11px", fontWeight: "700", padding: "2px 8px",
              borderRadius: "12px", background: cfg.color, color: "white",
              textTransform: "uppercase", letterSpacing: "0.4px",
            }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ fontSize: "12.5px", color: "#777", marginTop: "2px" }}>
            {data.encouragement} · Longest: {data.longestStreak} days · {data.totalActiveDays} total active days
          </div>
        </div>

        <StreakCircle value={data.currentStreak} />

        <span style={{ fontSize: "14px", color: "#aaa" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${cfg.border}`,
          padding: "16px 18px",
          background: "rgba(255,255,255,0.6)",
        }}>

          {/* Stat cards */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            {[
              { label: "Current streak",    value: `${data.currentStreak} days`, color: cfg.color     },
              { label: "Longest streak",    value: `${data.longestStreak} days`, color: "#6f42c1"     },
              { label: "Total active days", value: data.totalActiveDays,         color: "#2e7d32"     },
              {
                label: "Active today",
                value: data.activeToday ? "✅ Yes" : "❌ Not yet",
                color: data.activeToday ? "#2e7d32" : "#b26a00",
              },
            ].map((s) => (
              <div key={s.label} style={{
                flex: "1 1 120px", background: "white",
                border: "1px solid #eee", borderRadius: "10px",
                padding: "10px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{
                  fontSize: "11px", color: "#999", textTransform: "uppercase",
                  letterSpacing: "0.4px", fontWeight: "600",
                }}>
                  {s.label}
                </div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: s.color, marginTop: "4px" }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Week dots */}
          <WeekDots activeToday={data.activeToday} />

          {/* Badges */}
          {data.badges && data.badges.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{
                fontSize: "12px", fontWeight: "700", color: "#555",
                marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.4px",
              }}>
                Earned Badges
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.badges.map((key) => {
                  const meta = BADGE_META[key] || { emoji: "🏅", label: key, desc: "" };
                  return (
                    <div key={key} title={meta.desc} style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      background: "white", border: "1.5px solid #e0d7ff",
                      borderRadius: "20px", padding: "5px 12px",
                      fontSize: "13px", fontWeight: "600", color: "#4a3f8a",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}>
                      <span>{meta.emoji}</span> {meta.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Next badge hint */}
          <NextBadgeHint
            badges={data.badges}
            longest={data.longestStreak}
            total={data.totalActiveDays}
          />
        </div>
      )}
    </div>
  );
}