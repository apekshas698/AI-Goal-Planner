import { useEffect, useState } from "react";
import API from "../services/api";

function GoalList() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await API.get("/goals");
      setGoals(response.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await API.delete(`/goals/${id}`);
      fetchGoals(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting goal:", error);
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
            <h3>{goal.title}</h3>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
              }}
            >
              {goal.plan}
            </pre>

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