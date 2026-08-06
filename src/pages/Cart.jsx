import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  return (
    <div className="app-page cart-page" style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate("/")}>
          🍲 Nivala
        </h1>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ← Back
        </button>
      </header>

      <h2 style={styles.pageTitle}>Your Cart</h2>

      {cartItems.length === 0 ? (
        <div style={styles.empty}>
          <p>Your cart is empty.</p>
          <button style={styles.browseButton} onClick={() => navigate("/")}>
            Browse Dishes
          </button>
        </div>
      ) : (
        <>
          <div style={styles.itemList}>
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item" style={styles.cartItem}>
                <img src={item.image} alt={item.name} style={styles.itemImage} />
                <div style={styles.itemInfo}>
                  <p style={styles.itemName}>{item.name}</p>
                  <p style={styles.itemChannel}>{item.channel}</p>
                  <p style={styles.itemPrice}>₹{item.price}</p>
                </div>
                <div style={styles.quantityControls}>
                  <button
                    style={styles.qtyButton}
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span style={styles.qtyNumber}>{item.quantity}</span>
                  <button
                    style={styles.qtyButton}
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  style={styles.removeButton}
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Total</span>
              <span style={styles.totalPrice}>₹{totalPrice}</span>
            </div>
            <button
              style={styles.checkoutButton}
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
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
    fontFamily: "var(--font-body)",
  },
  pageTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "24px",
    marginBottom: "20px",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "var(--color-muted)",
  },
  browseButton: {
    marginTop: "16px",
    backgroundColor: "var(--color-green)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-heading)",
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "32px",
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "var(--color-card)",
    borderRadius: "16px",
    padding: "12px",
    boxShadow: "0 2px 10px rgba(43, 36, 32, 0.06)",
    flexWrap: "wrap",
  },
  itemImage: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  itemInfo: {
    flex: 1,
    minWidth: "150px",
  },
  itemName: {
    fontWeight: 600,
    fontSize: "15px",
    margin: "0 0 2px 0",
  },
  itemChannel: {
    fontSize: "12px",
    color: "var(--color-green)",
    margin: "0 0 4px 0",
  },
  itemPrice: {
    fontSize: "14px",
    fontWeight: 700,
    color: "var(--color-orange)",
    margin: 0,
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "var(--color-bg)",
    borderRadius: "20px",
    padding: "4px 10px",
  },
  qtyButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "var(--color-green)",
    fontWeight: 700,
  },
  qtyNumber: {
    minWidth: "20px",
    textAlign: "center",
    fontWeight: 600,
  },
  removeButton: {
    background: "none",
    border: "none",
    color: "var(--color-muted)",
    fontSize: "13px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  summary: {
    backgroundColor: "var(--color-card)",
    borderRadius: "16px",
    padding: "20px",
    maxWidth: "400px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "16px",
  },
  totalPrice: {
    color: "var(--color-orange)",
    fontFamily: "var(--font-heading)",
  },
  checkoutButton: {
    width: "100%",
    backgroundColor: "var(--color-orange)",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-heading)",
  },
};

export default Cart;
