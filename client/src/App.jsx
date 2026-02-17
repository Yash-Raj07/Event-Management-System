import { useEffect, useState } from "react";
import "./App.css";
import { API_BASE } from "./constants";

// Auth Components
import LoginForm from "./components/Auth/LoginForm";
import UserSignup from "./components/Auth/UserSignup";

// Admin Components
import AdminHome from "./components/Admin/AdminHome";
import AddMembership from "./components/Admin/AddMembership";
import UpdateMembership from "./components/Admin/UpdateMembership";

// User Components
import UserHome from "./components/User/UserHome";
import UserVendorList from "./components/User/UserVendorList";
import UserVendorProducts from "./components/User/UserVendorProducts";
import UserCart from "./components/User/UserCart";
import UserCheckout from "./components/User/UserCheckout";
import OrderConfirmation from "./components/User/OrderConfirmation";
import UserGuestList from "./components/User/UserGuestList";
import UserOrderStatus from "./components/User/UserOrderStatus";

// Vendor Components
import VendorHome from "./components/Vendor/VendorHome";
import VendorProducts from "./components/Vendor/VendorProducts";
import VendorProductStatus from "./components/Vendor/VendorProductStatus";
import VendorRequestItems from "./components/Vendor/VendorRequestItems";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("index");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch(`${API_BASE}/session`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setCurrentUser(data);
            setView(`${data.role}-home`);
          }
        }
      } catch (error) {
        console.error("Session check failed", error);
      }
    }
    loadSession();
  }, []);

  function handleLoginSuccess(user) {
    setCurrentUser(user);
    setView(`${user.role}-home`);
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
    setCurrentUser(null);
    setView("index");
  }

  function renderContent() {
    if (view === "login-admin") {
      return (
        <LoginForm
          role="admin"
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setView("index")}
        />
      );
    }
    if (view === "login-user") {
      return (
        <LoginForm
          role="user"
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setView("index")}
          onShowSignup={() => setView("signup-user")}
        />
      );
    }
    if (view === "login-vendor") {
      return (
        <LoginForm
          role="vendor"
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setView("index")}
        />
      );
    }
    if (view === "signup-user") {
      return <UserSignup onBack={() => setView("login-user")} />;
    }
    if (view === "admin-home") {
      return (
        <AdminHome
          onNavigate={(nextView) => setView(nextView)}
        />
      );
    }
    if (view === "user-home") {
      return (
        <UserHome
          onNavigate={(nextView) => setView(nextView)}
          onLogout={handleLogout}
        />
      );
    }
    if (view === "vendor-home") {
      return (
        <VendorHome
          onNavigate={(nextView) => setView(nextView)}
          onLogout={handleLogout}
        />
      );
    }
    if (view === "vendor-products") {
      return (
        <VendorProducts
          onLogout={handleLogout}
          onNavigate={(nextView) => setView(nextView)}
        />
      );
    }
    if (view === "vendor-requests") {
      return (
        <VendorRequestItems
          onHome={() => setView("vendor-home")}
          onLogout={handleLogout}
        />
      );
    }
    if (view === "user-vendors") {
      return (
        <UserVendorList
          onBack={() => setView("user-home")}
          onLogout={handleLogout}
          onSelectVendor={(vendor) => {
            setSelectedVendor(vendor);
            setView("user-vendor-products");
          }}
        />
      );
    }
    if (view === "user-vendor-products") {
      return (
        <UserVendorProducts
          vendor={selectedVendor}
          onHome={() => setView("user-home")}
          onCart={() => setView("user-cart")}
          onLogout={handleLogout}
        />
      );
    }
    if (view === "user-cart") {
      return (
        <UserCart
          onHome={() => setView("user-home")}
          onViewProduct={() =>
            selectedVendor ? setView("user-vendor-products") : setView("user-vendors")
          }
          onLogout={handleLogout}
          onCheckout={(total) => {
            setCartTotal(total);
            setView("user-checkout");
          }}
        />
      );
    }
    if (view === "user-guest-list") {
      return <UserGuestList onBack={() => setView("user-home")} />;
    }
    if (view === "user-order-status") {
      return (
        <UserOrderStatus
          onBack={() => setView("user-home")}
          onLogout={handleLogout}
        />
      );
    }
    if (view === "vendor-product-status") {
      return (
        <VendorProductStatus
          onHome={() => setView("vendor-home")}
          onLogout={handleLogout}
        />
      );
    }
    if (view === "user-checkout") {
      return (
        <UserCheckout
          totalAmount={cartTotal}
          onBack={() => setView("user-cart")}
          onOrderCreated={(order) => {
            setLastOrder(order);
            setView("user-order-confirmation");
          }}
        />
      );
    }
    if (view === "user-order-confirmation") {
      return (
        <OrderConfirmation
          order={lastOrder}
          onContinue={() => setView("user-home")}
        />
      );
    }
    if (view === "add-membership") {
      return <AddMembership />;
    }
    if (view === "update-membership") {
      return <UpdateMembership />;
    }
    return (
      <div className="screen">
        <div className="title-bar">Event Management System</div>
        <h2>Select Login</h2>
        <div className="button-row">
          <button
            className="button primary"
            onClick={() => setView("login-admin")}
          >
            Admin Login
          </button>
          <button
            className="button primary"
            onClick={() => setView("login-vendor")}
          >
            Vendor Login
          </button>
          <button
            className="button primary"
            onClick={() => setView("login-user")}
          >
            User Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="top-bar">
        <span>Event Management System</span>
        {currentUser && (
          <div className="top-bar-right">
            <span>
              {currentUser.username} ({currentUser.role})
            </span>
            <button className="button small" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>
      {renderContent()}
    </div>
  );
}



export default App;
