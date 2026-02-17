import { useState } from "react";
import { API_BASE } from "../../constants";

function LoginForm({ role, onLoginSuccess, onBack, onShowSignup }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!userId || !password) {
      setError("User Id and Password are required.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: userId, password, role }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.message || "Login failed.");
        return;
      }
      const user = await response.json();
      onLoginSuccess(user);
      setUserId("");
      setPassword("");
    } catch {
      setError("Unable to reach server.");
    }
  }

  return (
    <div className="screen">
      <div className="title-bar">Event Management System</div>
      <div className="role-label">{role.toUpperCase()} LOGIN</div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="label">User Id</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="input"
          />
        </div>
        <div className="form-row">
          <label className="label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="button-row">
          <button type="button" className="button secondary" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            Login
          </button>
        </div>
        {role === "user" && (
          <div className="button-row">
            <button
              type="button"
              className="link-button"
              onClick={onShowSignup}
            >
              New user? Sign Up
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default LoginForm;
