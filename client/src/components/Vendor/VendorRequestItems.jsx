function VendorRequestItems({ onHome, onLogout }) {
  return (
    <div className="screen">
      <div className="title-bar">Vendor</div>
      <div className="vendor-request-top">
        <button
          type="button"
          className="button small"
          onClick={onHome}
        >
          Home
        </button>
        <div className="vendor-request-center">Request Item</div>
        <button
          type="button"
          className="button small"
          onClick={onLogout}
        >
          LogOut
        </button>
      </div>
      <div className="vendor-request-items">
        <div className="vendor-request-card">Item 1</div>
        <div className="vendor-request-card">Item 2</div>
        <div className="vendor-request-card">Item 3</div>
        <div className="vendor-request-card">Item 4</div>
      </div>
    </div>
  );
}

export default VendorRequestItems;
