import { useEffect, useState } from "react";
import API from "./services/api";

function App() {
  const [title, setTitle] = useState("");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a goal");
      return;
    }

    setLoading(true);

    try {
      await API.post("/goals", {
        title,
      });

      setTitle("");
      await fetchGoals();

      alert("Goal Created Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await API.delete(`/goals/${id}`);
      fetchGoals();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete goal");
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>🤖 AI Task Planner</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter your goal..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "10px",
            width: "70%",
            marginRight: "10px",
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Goal"}
        </button>
      </div>

      <hr />

      <h2>My Goals</h2>

      {goals.length === 0 ? (
        <p>No goals found.</p>
      ) : (
        goals.map((goal) => (
          <div
            key={goal.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: "#f9f9f9",
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

export default App;