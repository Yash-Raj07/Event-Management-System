import { useState } from "react";
import { API_BASE } from "../../constants";

function UserSignup({ onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    if (!name || !email || !password) {
      setMessage("All fields are mandatory.");
      return;
    }
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      setMessage("Email is not valid.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Sign up failed.");
        return;
      }
      setMessage("Sign up successful. Please log in.");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setMessage("Unable to reach server.");
    }
  }

  return (
    <div className="screen">
      <div className="title-bar">Event Management System</div>
      <div className="role-label">USER SIGN UP</div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="label">Name</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {message && <div className="info">{message}</div>}
        <div className="button-row">
          <button type="button" className="button secondary" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="button primary">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserSignup;
