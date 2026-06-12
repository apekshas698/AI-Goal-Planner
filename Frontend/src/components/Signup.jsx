import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signup(name, email, password);
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Signup failed. Email may already be registered.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", textAlign: "left" }}>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Sign Up
        </button>
      </form>

      <p style={{ marginTop: "12px" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup; 