import { useEffect, useState } from "react";
import API from "../services/api";
import { PriorityBadge, DifficultyBadge, HoursBadge } from "./TaskPriorityBadge";
import DeadlinePrediction from "./DeadlinePrediction";

function GoalList() {
  const [goals, setGoals] = useState([]);
  const [tasksByGoal, setTasksByGoal] = useState({});

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await API.get("/goals");
      setGoals(response.data);
      response.data.forEach((goal) => fetchTasks(goal.id));
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const fetchTasks = async (goalId) => {
    try {
      const response = await API.get(`/tasks/goal/${goalId}/sorted`);
      setTasksByGoal((prev) => ({ ...prev, [goalId]: response.data }));
    } catch (error) {
      console.error("Error fetching tasks for goal", goalId, error);
    }
  };

  const toggleTask = async (task) => {
    try {
      const endpoint = task.completed
        ? `/tasks/${task.id}/incomplete`
        : `/tasks/${task.id}/complete`;

      await API.put(endpoint);

      await fetchTasks(task.goalId);
      await fetchGoals();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await API.delete(`/goals/${id}`);
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "COMPLETED":  return "#28a745";
      case "IN_PROGRESS": return "#ffc107";
      default:           return "#6c757d";
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Saved Goals</h2>

      {goals.length === 0 ? (
        <p>No goals found.</p>
      ) : (
        goals.map((goal) => (
          <div
            key={goal.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{goal.title}</h3>
              <span
                style={{
                  backgroundColor: statusColor(goal.status),
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {goal.status}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ margin: "10px 0" }}>
              <div
                style={{
                  height: "8px",
                  width: "100%",
                  backgroundColor: "#eee",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${goal.progress || 0}%`,
                    backgroundColor: "#28a745",
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <small>{goal.progress || 0}% complete</small>
            </div>

            {/* Deadline Prediction Agent */}
            <DeadlinePrediction goalId={goal.id} />

            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
              {goal.plan}
            </pre>

            {/* Task checklist */}
            {tasksByGoal[goal.id] && tasksByGoal[goal.id].length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong>Tasks</strong>
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {tasksByGoal[goal.id].map((task) => (
                    <li key={task.id} style={{ margin: "8px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task)}
                          />
                          <span
                            style={{
                              textDecoration: task.completed ? "line-through" : "none",
                              color: task.completed ? "#888" : "inherit",
                              fontSize: "14px",
                            }}
                          >
                            {task.taskName}
                          </span>
                        </label>
                        <PriorityBadge priority={task.aiPriority} />
                        <DifficultyBadge difficulty={task.difficulty} />
                        <HoursBadge hours={task.estimatedHours} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => deleteGoal(goal.id)}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Delete Goal
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default GoalList;