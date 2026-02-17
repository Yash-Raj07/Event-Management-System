function AdminHome({ onNavigate }) {
  return (
    <div className="screen">
      <div className="title-bar">WELCOME ADMIN</div>
      <div className="admin-home-buttons">
        <button
          className="button primary"
          onClick={() => onNavigate("add-membership")}
        >
          Maintain Membership
        </button>
        <button className="button primary">Maintain User</button>
        <button className="button primary">Maintain Vendor</button>
      </div>
    </div>
  );
}

export default AdminHome;
