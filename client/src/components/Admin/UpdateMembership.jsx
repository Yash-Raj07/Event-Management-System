import { useState } from "react";
import { API_BASE } from "../../constants";

function UpdateMembership() {
  const [step, setStep] = useState("find");
  const [membershipNo, setMembershipNo] = useState("");
  const [membership, setMembership] = useState(null);
  const [action, setAction] = useState("extend");
  const [extension, setExtension] = useState("6");
  const [message, setMessage] = useState("");

  async function findMembership(event) {
    event.preventDefault();
    setMessage("");
    if (!membershipNo) {
      setMessage("Membership Number is mandatory.");
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE}/memberships/${encodeURIComponent(membershipNo)}`,
        {
          credentials: "include",
        }
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Error finding membership.");
        setMembership(null);
        setStep("find");
        return;
      }
      setMembership(body);
      setStep("update");
      setAction("extend");
      setExtension("6");
    } catch {
      setMessage("Unable to reach server.");
    }
  }

  async function applyUpdate(event) {
    event.preventDefault();
    setMessage("");
    if (!membershipNo) {
      setMessage("Membership Number is mandatory.");
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
        setMessage(body?.message || "Update failed.");
      } else {
        setMessage(body?.message || "Update successful.");
        const refreshed = await fetch(
          `${API_BASE}/memberships/${encodeURIComponent(membershipNo)}`,
          {
            credentials: "include",
          }
        );
        if (refreshed.ok) {
          const data = await refreshed.json();
          setMembership(data);
        }
      }
    } catch {
      setMessage("Unable to reach server.");
    }
  }

  return (
    <div className="screen">
      <div className="title-bar">Update Membership</div>
      <form
        className="form"
        onSubmit={step === "find" ? findMembership : applyUpdate}
      >
        <div className="form-row">
          <label className="label">Membership Number</label>
          <input
            type="text"
            className="input"
            value={membershipNo}
            onChange={(e) => setMembershipNo(e.target.value)}
          />
        </div>

        {membership && (
          <>
            <div className="membership-details">
              <div>
                <strong>Name:</strong> {membership.name}
              </div>
              <div>
                <strong>Email:</strong> {membership.email}
              </div>
              <div>
                <strong>Start Date:</strong> {membership.start_date}
              </div>
              <div>
                <strong>End Date:</strong> {membership.end_date}
              </div>
              <div>
                <strong>Status:</strong> {membership.status}
              </div>
            </div>
            <div className="form-row">
              <label className="label">Action</label>
              <div className="inline-options">
                <label>
                  <input
                    type="radio"
                    name="action"
                    value="extend"
                    checked={action === "extend"}
                    onChange={(e) => setAction(e.target.value)}
                  />
                  Extend
                </label>
                <label>
                  <input
                    type="radio"
                    name="action"
                    value="cancel"
                    checked={action === "cancel"}
                    onChange={(e) => setAction(e.target.value)}
                  />
                  Cancel
                </label>
              </div>
            </div>
            {action === "extend" && (
              <div className="form-row">
                <label className="label">Extension Duration</label>
                <div className="inline-options">
                  <label>
                    <input
                      type="radio"
                      name="extension"
                      value="6"
                      checked={extension === "6"}
                      onChange={(e) => setExtension(e.target.value)}
                    />
                    6 months
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="extension"
                      value="12"
                      checked={extension === "12"}
                      onChange={(e) => setExtension(e.target.value)}
                    />
                    1 year
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="extension"
                      value="24"
                      checked={extension === "24"}
                      onChange={(e) => setExtension(e.target.value)}
                    />
                    2 years
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        {message && <div className="info">{message}</div>}

        <div className="button-row">
          <button type="submit" className="button primary">
            {step === "find" ? "Find Membership" : "Apply"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateMembership;
