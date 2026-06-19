
const PRIORITY_CONFIG = {
  HIGH:   { label: "High",   bg: "#ffeaea", color: "#c0392b", dot: "#e74c3c" },
  MEDIUM: { label: "Medium", bg: "#fff8e1", color: "#b7770d", dot: "#f39c12" },
  LOW:    { label: "Low",    bg: "#eafaf1", color: "#1e8449", dot: "#27ae60" },
};

const DIFFICULTY_CONFIG = {
  HARD:   { label: "Hard",   bg: "#f3e8ff", color: "#6d28d9" },
  MEDIUM: { label: "Medium", bg: "#ede9fe", color: "#7c3aed" },
  EASY:   { label: "Easy",   bg: "#ecfdf5", color: "#065f46" },
};

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.LOW;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      background: cfg.bg, color: cfg.color,
      padding: "2px 8px", borderRadius: "12px",
      fontSize: "11px", fontWeight: "600",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

export function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null;
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.MEDIUM;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: "2px 8px", borderRadius: "12px",
      fontSize: "11px", fontWeight: "600",
    }}>
      {cfg.label}
    </span>
  );
}

export function HoursBadge({ hours }) {
  if (!hours) return null;
  return (
    <span style={{
      background: "#f0f4ff", color: "#3b5bdb",
      padding: "2px 8px", borderRadius: "12px",
      fontSize: "11px", fontWeight: "600",
    }}>
      ~{hours}h
    </span>
  );
}