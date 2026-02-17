import { useState } from "react";
import { API_BASE } from "../../constants";

function UserCheckout({ totalAmount, onBack, onOrderCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !stateValue ||
      !pinCode ||
      !paymentMethod
    ) {
      setMessage("All fields are mandatory.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          city,
          state: stateValue,
          pinCode,
          paymentMethod,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Checkout failed.");
        return;
      }
      onOrderCreated(body);
    } catch {
      setMessage("Checkout failed.");
    }
  }

  return (
    <div className="screen">
      <div className="title-bar">Item</div>
      <div className="role-label">Details</div>
      {totalAmount ? (
        <div className="checkout-total">Total: Rs/- {totalAmount}</div>
      ) : null}
      {message && <div className="info">{message}</div>}
      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="checkout-columns">
          <div className="checkout-column">
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
              <label className="label">E-mail</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="label">Address</label>
              <input
                type="text"
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="label">City</label>
              <input
                type="text"
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
          <div className="checkout-column">
            <div className="form-row">
              <label className="label">Number</label>
              <input
                type="text"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="label">Payment Method</label>
              <select
                className="input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="NetBanking">Net Banking</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
            <div className="form-row">
              <label className="label">State</label>
              <input
                type="text"
                className="input"
                value={stateValue}
                onChange={(e) => setStateValue(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="label">Pin Code</label>
              <input
                type="text"
                className="input"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="button-row">
          <button type="button" className="button secondary" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="button primary">
            Order Now
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserCheckout;
