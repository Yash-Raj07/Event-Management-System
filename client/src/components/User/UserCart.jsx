import { useState, useEffect } from "react";
import { API_BASE } from "../../constants";

function UserCart({ onHome, onViewProduct, onLogout, onCheckout }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const response = await fetch(`${API_BASE}/cart`, {
          credentials: "include",
        });
        const body = await response
          .json()
          .catch(() => ({ items: [], total: 0 }));
        if (!response.ok) {
          setMessage(body?.message || "Unable to load cart.");
          setItems([]);
          setTotal(0);
          return;
        }
        setItems(body.items || []);
        setTotal(body.total || 0);
        setMessage("");
      } catch {
        setMessage("Unable to load cart.");
      }
    }
    init();
  }, []);

  async function reloadCart() {
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        credentials: "include",
      });
      const body = await response.json().catch(() => ({ items: [], total: 0 }));
      if (!response.ok) {
        setMessage(body?.message || "Unable to load cart.");
        setItems([]);
        setTotal(0);
        return;
      }
      setItems(body.items || []);
      setTotal(body.total || 0);
      setMessage("");
    } catch {
      setMessage("Unable to load cart.");
    }
  }

  async function updateQuantity(productId, quantity) {
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 0) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/cart/item/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: qty }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Unable to update quantity.");
        return;
      }
      reloadCart();
    } catch {
      setMessage("Unable to update quantity.");
    }
  }

  async function removeItem(productId) {
    try {
      const response = await fetch(`${API_BASE}/cart/item/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Unable to remove item.");
        return;
      }
      reloadCart();
    } catch {
      setMessage("Unable to remove item.");
    }
  }

  async function clearCart() {
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Unable to clear cart.");
        return;
      }
      reloadCart();
    } catch {
      setMessage("Unable to clear cart.");
    }
  }

  function handleProceed() {
    if (!items.length) {
      setMessage("Cart is empty.");
      return;
    }
    onCheckout(total);
  }

  return (
    <div className="screen">
      <div className="cart-top-row">
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
          onClick={onViewProduct}
        >
          View Product
        </button>
        <button type="button" className="button small">
          Request Item
        </button>
        <button type="button" className="button small">
          Product Status
        </button>
        <button
          type="button"
          className="button small"
          onClick={onLogout}
        >
          LogOut
        </button>
      </div>
      <div className="title-bar">Shopping Cart</div>
      {message && <div className="info">{message}</div>}
      <div className="cart-table">
        <div className="cart-header-row">
          <div>Image</div>
          <div>Name</div>
          <div>Price</div>
          <div>Quantity</div>
          <div>Total Price</div>
          <div>Action</div>
        </div>
        {items.map((item) => (
          <div key={item.product_id} className="cart-row">
            <div className="product-image-cell">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} />
              ) : (
                <div className="image-placeholder">Image</div>
              )}
            </div>
            <div>{item.name}</div>
            <div>Rs/- {item.price}</div>
            <div>
              <input
                type="number"
                min="0"
                className="cart-qty-input"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.product_id, e.target.value)
                }
              />
            </div>
            <div>Rs/- {item.line_total}</div>
            <div>
              <button
                type="button"
                className="button small"
                onClick={() => removeItem(item.product_id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total-row">
        <div className="cart-grand-label">Grand Total</div>
        <div className="cart-grand-value">Rs/- {total}</div>
        <button
          type="button"
          className="button small"
          onClick={clearCart}
        >
          Delete All
        </button>
      </div>
      <div className="button-row">
        <button
          type="button"
          className="button primary"
          onClick={handleProceed}
        >
          Proceed to CheckOut
        </button>
      </div>
    </div>
  );
}

export default UserCart;
