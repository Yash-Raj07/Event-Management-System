import { useState, useEffect } from "react";
import { API_BASE } from "../../constants";

function UserVendorList({ onBack, onLogout, onSelectVendor }) {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/vendors`, {
          credentials: "include",
        });
        const body = await response.json().catch(() => []);
        if (response.ok) {
          setVendors(body);
        }
      } catch {
        setVendors([]);
      }
    }
    load();
  }, []);

  return (
    <div className="screen">
      <div className="vendor-list-top">
        <button className="button small" onClick={onBack}>
          Home
        </button>
        <div className="title-bar">Vendor Florist</div>
        <button className="button small" onClick={onLogout}>
          LogOut
        </button>
      </div>
      <div className="vendor-cards">
        {vendors.map((v) => (
          <div key={v.id} className="vendor-card">
            <div>{v.name}</div>
            <div className="vendor-contact">{v.contact_details}</div>
            <button
              className="button small"
              type="button"
              onClick={() => onSelectVendor(v)}
            >
              Shop Item
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserVendorList;
