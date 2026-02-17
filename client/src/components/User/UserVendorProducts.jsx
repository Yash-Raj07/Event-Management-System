import { useState, useEffect } from "react";
import { API_BASE } from "../../constants";

function UserVendorProducts({ vendor, onHome, onCart, onLogout }) {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      if (!vendor) {
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE}/vendor/${vendor.id}/products`,
          {
            credentials: "include",
          }
        );
        const body = await response.json().catch(() => []);
        if (response.ok) {
          setProducts(body);
        } else {
          setMessage(body?.message || "Unable to load products.");
        }
      } catch {
        setMessage("Unable to load products.");
      }
    }
    load();
  }, [vendor]);

  async function addToCart(productId) {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Unable to add to cart.");
        return;
      }
      setMessage("Added to cart.");
    } catch {
      setMessage("Unable to add to cart.");
    }
  }

  if (!vendor) {
    return (
      <div className="screen">
        <div className="title-bar">Vendor Products</div>
        <p>No vendor selected.</p>
        <div className="button-row">
          <button type="button" className="button secondary" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="user-vendor-top">
        <button type="button" className="button small" onClick={onHome}>
          Home
        </button>
        <button type="button" className="button small">
          Products
        </button>
        <div className="title-bar">{vendor.name}</div>
        <button type="button" className="button small" onClick={onLogout}>
          LogOut
        </button>
      </div>
      {message && <div className="info">{message}</div>}
      <div className="user-vendor-products">
        {products.map((p) => (
          <div key={p.id} className="user-product-card">
            <div className="user-product-name">{p.name}</div>
            <div className="user-product-price">Price: Rs/- {p.price}</div>
            <button
              type="button"
              className="button small"
              onClick={() => addToCart(p.id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      <div className="button-row">
        <button type="button" className="button primary" onClick={onCart}>
          Go To Cart
        </button>
      </div>
    </div>
  );
}

export default UserVendorProducts;
