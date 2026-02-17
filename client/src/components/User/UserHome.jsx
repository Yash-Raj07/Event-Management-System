function UserHome({ onNavigate, onLogout }) {
  return (
    <div className="screen">
      <div className="title-bar">WELCOME USER</div>
      <div className="button-row">
        <button
          className="button primary"
          onClick={() => onNavigate("user-vendors")}
        >
          Vendor
        </button>
        <button
          className="button primary"
          onClick={() => onNavigate("user-cart")}
        >
          Cart
        </button>
        <button
          className="button primary"
          onClick={() => onNavigate("user-guest-list")}
        >
          Guest List
        </button>
        <button
          className="button primary"
          onClick={() => onNavigate("user-order-status")}
        >
          Order Status
        </button>
      </div>
      <div className="button-row">
        <button className="button primary" onClick={onLogout}>
          LogOut
        </button>
      </div>
    </div>
  );
}

export default UserHome;
