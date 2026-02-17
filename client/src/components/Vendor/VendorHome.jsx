function VendorHome({ onNavigate, onLogout }) {
  return (
    <div className="screen">
      <div className="title-bar">Welcome Vendor</div>
      <div className="button-row">
        <button
          className="button primary"
          onClick={() => onNavigate("vendor-products")}
        >
          Your Item
        </button>
        <button
          className="button primary"
          onClick={() => onNavigate("vendor-products")}
        >
          Add New Item
        </button>
        <button
          className="button primary"
          onClick={() => onNavigate("vendor-product-status")}
        >
          Product Status
        </button>
        <button className="button primary" onClick={onLogout}>
          LogOut
        </button>
      </div>
    </div>
  );
}

export default VendorHome;
