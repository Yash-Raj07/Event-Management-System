import { useState, useEffect } from "react";
import { API_BASE } from "../../constants";

function VendorProductStatus({ onHome, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatusValue, setUpdateStatusValue] = useState("RECEIVED");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/vendor/orders`, {
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

  async function updateStatus(orderId, status) {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Unable to update status.");
        return;
      }
      const refreshed = await fetch(`${API_BASE}/vendor/orders`, {
        credentials: "include",
      });
      const refreshedBody = await refreshed.json().catch(() => []);
      if (refreshed.ok) {
        setOrders(refreshedBody);
      }
    } catch {
      setMessage("Unable to update status.");
    }
  }

  return (
    <div className="screen">
      <div className="title-bar">Product Status</div>
      <div className="product-status-top">
        <button
          type="button"
          className="button small"
          onClick={onHome}
        >
          Home
        </button>
        <button
          type="button"
          className="button small"
          onClick={onLogout}
        >
          LogOut
        </button>
      </div>
      {message && <div className="info">{message}</div>}
      <div className="product-status-table">
        <div className="product-status-header">
          <div>Name</div>
          <div>E-Mail</div>
          <div>Address</div>
          <div>Status</div>
          <div>Update</div>
          <div>Delete</div>
        </div>
        {orders.map((order) => (
          <div key={order.id} className="product-status-row">
            <div>{order.name}</div>
            <div>{order.email}</div>
            <div>{order.address}</div>
            <div>{order.status}</div>
            <div>
              <button
                type="button"
                className="button small"
                onClick={() => {
                  setSelectedOrder(order);
                  if (
                    order.status === "READY_FOR_SHIPPING" ||
                    order.status === "OUT_FOR_DELIVERY" ||
                    order.status === "RECEIVED"
                  ) {
                    setUpdateStatusValue(order.status);
                  } else {
                    setUpdateStatusValue("RECEIVED");
                  }
                }}
              >
                Update
              </button>
            </div>
            <div>
              <button
                type="button"
                className="button small"
                onClick={() => updateStatus(order.id, "CANCELLED")}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedOrder && (
        <div className="status-panel-container">
          <div className="status-panel">
            <div className="status-panel-title">Update</div>
            <div className="status-options">
              <label className="status-option">
                <span className="status-dot" />
                <button
                  type="button"
                  className={`status-chip${
                    updateStatusValue === "RECEIVED" ? " active" : ""
                  }`}
                  onClick={() => setUpdateStatusValue("RECEIVED")}
                >
                  Recieved
                </button>
              </label>
              <label className="status-option">
                <span className="status-dot" />
                <button
                  type="button"
                  className={`status-chip${
                    updateStatusValue === "READY_FOR_SHIPPING" ? " active" : ""
                  }`}
                  onClick={() => setUpdateStatusValue("READY_FOR_SHIPPING")}
                >
                  Ready for Shipping
                </button>
              </label>
              <label className="status-option">
                <span className="status-dot" />
                <button
                  type="button"
                  className={`status-chip${
                    updateStatusValue === "OUT_FOR_DELIVERY" ? " active" : ""
                  }`}
                  onClick={() => setUpdateStatusValue("OUT_FOR_DELIVERY")}
                >
                  Out For Delivery
                </button>
              </label>
            </div>
          </div>
          <div className="status-panel-actions">
            <button
              type="button"
              className="button primary"
              onClick={async () => {
                await updateStatus(selectedOrder.id, updateStatusValue);
                setSelectedOrder(null);
              }}
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorProductStatus;
