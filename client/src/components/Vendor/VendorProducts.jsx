import { useState, useEffect } from "react";
import { API_BASE } from "../../constants";

function VendorProducts({ onLogout, onNavigate }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const response = await fetch(`${API_BASE}/vendor/products`, {
          credentials: "include",
        });
        const body = await response.json().catch(() => []);
        if (response.ok) {
          setProducts(body);
        }
      } catch {
        setMessage("Unable to load products.");
      }
    }
    init();
  }, []);

  async function handleAddOrUpdate(event) {
    event.preventDefault();
    setMessage("");
    if (!name || !price) {
      setMessage("Product name and price are required.");
      return;
    }
    const payload = { name, price, imageUrl };
    try {
      let response;
      if (editingId) {
        response = await fetch(
          `${API_BASE}/vendor/products/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(`${API_BASE}/vendor/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Unable to save product.");
        return;
      }
      setMessage(editingId ? "Product updated." : "Product added.");
      setName("");
      setPrice("");
      setImageUrl("");
      setEditingId(null);
      try {
        const refreshed = await fetch(`${API_BASE}/vendor/products`, {
          credentials: "include",
        });
        const refreshedBody = await refreshed.json().catch(() => []);
        if (refreshed.ok) {
          setProducts(refreshedBody);
        }
      } catch {
        setMessage("Unable to reload products.");
      }
    } catch {
      setMessage("Unable to save product.");
    }
  }

  async function handleDelete(id) {
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/vendor/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(body?.message || "Delete failed.");
        return;
      }
      setMessage("Product deleted.");
      try {
        const refreshed = await fetch(`${API_BASE}/vendor/products`, {
          credentials: "include",
        });
        const refreshedBody = await refreshed.json().catch(() => []);
        if (refreshed.ok) {
          setProducts(refreshedBody);
        }
      } catch {
        setMessage("Unable to reload products.");
      }
    } catch {
      setMessage("Delete failed.");
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setImageUrl(product.image_url || "");
  }

  return (
    <div className="screen">
      <div className="title-bar">Welcome Vendor</div>
      <div className="vendor-header-row">
        <div>Vendor Item Management</div>
        <div className="inline-options">
          <button
            className="button small"
            type="button"
            onClick={() => onNavigate("vendor-product-status")}
          >
            Product Status
          </button>
          <button
            className="button small"
            type="button"
            onClick={() => onNavigate("vendor-requests")}
          >
            Request Item
          </button>
          <button className="button small">View Product</button>
          <button className="button small" onClick={onLogout}>
            Log Out
          </button>
        </div>
      </div>
      <div className="vendor-layout">
        <form className="form vendor-form" onSubmit={handleAddOrUpdate}>
          <div className="form-row">
            <label className="label">Product Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="label">Product Price</label>
            <input
              type="number"
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="label">Product Image URL</label>
            <input
              type="text"
              className="input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          {message && <div className="info">{message}</div>}
          <div className="button-row">
            <button type="submit" className="button primary">
              {editingId ? "Update Product" : "Add The Product"}
            </button>
          </div>
        </form>
        <div className="vendor-products-panel">
          <div className="products-header-row">
            <div>Product Image</div>
            <div>Product Name</div>
            <div>Product Price</div>
            <div>Action</div>
          </div>
          {products.map((p) => (
            <div key={p.id} className="products-row">
              <div className="product-image-cell">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} />
                ) : (
                  <div className="image-placeholder">Image</div>
                )}
              </div>
              <div>{p.name}</div>
              <div>Rs/- {p.price}</div>
              <div className="inline-options">
                <button
                  type="button"
                  className="button small"
                  onClick={() => startEdit(p)}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="button small"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VendorProducts;
