import { useState, useEffect } from "react";
import { API_BASE } from "../../constants";

function UserOrderStatus({ onBack, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/orders/my`, {
          credentials: "include",
        });
        const body = await response.json().catch(() => []);
        if (!response.ok) {
          setMessage(body?.message || "Unable to load orders.");
          setOrders([]);
          return;
        }
        setOrders(body);
        setMessage("");
      } catch {
        setMessage("Unable to load orders.");
      }
    }
    load();
  }, []);

  return (
    <div className="screen">
      <div className="user-order-top">
        <button
          type="button"
          className="button small"
          onClick={onBack}
        >
          Home
        </button>
        <div className="title-bar">User Order Status</div>
        <button
          type="button"
          className="button small"
          onClick={onLogout}
        >
          LogOut
        </button>
      </div>
      {message && <div className="info">{message}</div>}
      <div className="order-status-table">
        <div className="order-status-header">
          <div>Name</div>
          <div>E-mail</div>
          <div>Address</div>
          <div>Status</div>
        </div>
        {orders.map((order) => (
          <div key={order.id} className="order-status-row">
            <div>{order.name}</div>
            <div>{order.email}</div>
            <div>{order.address}</div>
            <div>{order.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserOrderStatus;
