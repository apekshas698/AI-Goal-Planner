import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", textAlign: "left" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
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
          Login
        </button>
      </form>

      <p style={{ marginTop: "12px" }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;