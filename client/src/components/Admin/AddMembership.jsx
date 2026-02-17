import { useState } from "react";
import { API_BASE } from "../../constants";

function AddMembership() {
  const [membershipNo, setMembershipNo] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("6");
  const [welcomeEmail, setWelcomeEmail] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!membershipNo || !name || !email || !startDate || !duration) {
      setMessage("All fields are mandatory.");
      return;
    }

    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      setMessage("Email is not valid.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/memberships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          membershipNo,
          name,
          email,
          startDate,
          duration,
          welcomeEmailYes: welcomeEmail,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Error saving membership.");
        return;
      }
      setMessage("Membership added successfully.");
      setMembershipNo("");
      setName("");
      setEmail("");
      setStartDate("");
      setDuration("6");
      setWelcomeEmail(false);
    } catch {
      setMessage("Unable to reach server.");
    }
  }

  return (
    <div className="screen">
      <div className="title-bar">Add Membership</div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="label">Membership Number</label>
          <input
            type="text"
            className="input"
            value={membershipNo}
            onChange={(e) => setMembershipNo(e.target.value)}
          />
        </div>
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
          <label className="label">Start Date</label>
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label className="label">Duration</label>
          <div className="inline-options">
            <label>
              <input
                type="radio"
                name="duration"
                value="6"
                checked={duration === "6"}
                onChange={(e) => setDuration(e.target.value)}
              />
              6 months
            </label>
            <label>
              <input
                type="radio"
                name="duration"
                value="12"
                checked={duration === "12"}
                onChange={(e) => setDuration(e.target.value)}
              />
              1 year
            </label>
            <label>
              <input
                type="radio"
                name="duration"
                value="24"
                checked={duration === "24"}
                onChange={(e) => setDuration(e.target.value)}
              />
              2 years
            </label>
          </div>
        </div>
        <div className="form-row">
          <label className="label">Send Welcome Email</label>
          <input
            type="checkbox"
            checked={welcomeEmail}
            onChange={(e) => setWelcomeEmail(e.target.checked)}
          />
          <span className="checkbox-note">
            {welcomeEmail ? "Yes" : "No"}
          </span>
        </div>
        {message && <div className="info">{message}</div>}
        <div className="button-row">
          <button type="reset" className="button secondary">
            Cancel
          </button>
          <button type="submit" className="button primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddMembership;
