import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [isPlaced, setIsPlaced] = useState(false);
  const [address, setAddress] = useState("");

  const handlePlaceOrder = () => {
    setIsPlaced(true);
    clearCart();
  };

  // If cart is empty and order hasn't just been placed, redirect feel
  if (cartItems.length === 0 && !isPlaced) {
    return (
      <div className="app-page checkout-page" style={styles.page}>
        <header style={styles.header}>
          <h1 style={styles.logo} onClick={() => navigate("/")}>
            🍲 Nivala
          </h1>
        </header>
        <div style={styles.empty}>
          <p>Your cart is empty.</p>
          <button style={styles.primaryButton} onClick={() => navigate("/")}>
            Browse Dishes
          </button>
        </div>
      </div>
    );
  }

  if (isPlaced) {
    return (
      <div className="app-page checkout-page" style={styles.page}>
        <header style={styles.header}>
          <h1 style={styles.logo} onClick={() => navigate("/")}>
            🍲 Nivala
          </h1>
        </header>
        <div style={styles.confirmation}>
          <div style={styles.checkCircle}>✓</div>
          <h2 style={styles.confirmTitle}>Order Placed!</h2>
          <p style={styles.confirmText}>
            Your homemade food is being prepared with love. This is a demo
            order — no real payment was made.
          </p>
          <button style={styles.primaryButton} onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page checkout-page" style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate("/")}>
          🍲 Nivala
        </h1>
        <button style={styles.backButton} onClick={() => navigate("/cart")}>
          ← Back to Cart
        </button>
      </header>

      <h2 style={styles.pageTitle}>Checkout</h2>

      <div className="checkout-section" style={styles.section}>
        <p style={styles.sectionLabel}>Delivery Address</p>
        <textarea
          style={styles.addressInput}
          placeholder="Enter your full delivery address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="checkout-section" style={styles.section}>
        <p style={styles.sectionLabel}>Order Summary</p>
        {cartItems.map((item) => (
          <div key={item.id} style={styles.summaryItem}>
            <span>{item.name} x{item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div style={styles.summaryTotal}>
          <span>Total</span>
          <span style={styles.totalPrice}>₹{totalPrice}</span>
        </div>
      </div>

      <button style={styles.placeOrderButton} onClick={handlePlaceOrder}>
        Place Order
      </button>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "var(--color-bg)",
    minHeight: "100vh",
    padding: "24px 40px",
    fontFamily: "var(--font-body)",
    color: "var(--color-text)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  logo: {
    color: "var(--color-green)",
    margin: 0,
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: "22px",
    cursor: "pointer",
  },
  backButton: {
    background: "var(--color-card)",
    border: "1px solid rgba(43, 36, 32, 0.15)",
    color: "var(--color-text)",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
  },
  pageTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "24px",
    marginBottom: "24px",
  },
  section: {
    backgroundColor: "var(--color-card)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    maxWidth: "500px",
  },
  sectionLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--color-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "12px",
  },
  addressInput: {
    width: "100%",
    minHeight: "80px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(43, 36, 32, 0.15)",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    resize: "vertical",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "8px",
    color: "var(--color-text)",
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "17px",
    fontWeight: 700,
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(43, 36, 32, 0.1)",
  },
  totalPrice: {
    color: "var(--color-orange)",
  },
  placeOrderButton: {
    backgroundColor: "var(--color-orange)",
    color: "#fff",
    border: "none",
    padding: "16px 32px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-heading)",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "var(--color-muted)",
  },
  confirmation: {
    textAlign: "center",
    padding: "60px 20px",
  },
  checkCircle: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    backgroundColor: "var(--color-green)",
    color: "#fff",
    fontSize: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  confirmTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "24px",
    marginBottom: "10px",
  },
  confirmText: {
    color: "var(--color-muted)",
    maxWidth: "400px",
    margin: "0 auto 24px",
    lineHeight: "1.6",
  },
  primaryButton: {
    backgroundColor: "var(--color-green)",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-heading)",
  },
};

export default Checkout;
