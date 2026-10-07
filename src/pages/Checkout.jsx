import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { saveOrder, estimateDeliveryMinutes } from "../utils/orders";
import { api } from "../utils/api";
import Icon from "../components/Icon";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [placed, setPlaced] = useState(null);
  const [address, setAddress] = useState("");
  const [mode, setMode] = useState("delivery");
  const payment = "cod";

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const [promoInput, setPromoInput] = useState("");
  const promoApplied = promoInput.trim().toUpperCase() === "NIVALA50";
  const discount = promoApplied ? Math.min(50, totalPrice) : 0;
  const deliveryFee = mode === "pickup" ? 0 : totalPrice - discount > 499 ? 0 : 29;
  const serviceFee = Math.round((totalPrice - discount) * 0.02);
  const grandTotal = totalPrice - discount + deliveryFee + serviceFee;
  const eta = estimateDeliveryMinutes(itemCount, mode);

  const handlePlaceOrder = async () => {
    if (mode === "delivery" && !address.trim()) return;
    const payload = {
      buyer: user?.name || "Guest",
      items: cartItems.map((i) => ({ dishId: i._id, name: i.name, qty: i.quantity, price: i.price, channel: i.channel })),
      subtotal: totalPrice,
      deliveryFee,
      serviceFee,
      discount,
      promoCode: promoApplied ? "NIVALA50" : "",
      total: grandTotal,
      mode,
      payment: "cod",
      address: mode === "pickup" ? "Pickup from kitchen" : address,
      kitchen: cartItems[0]?.channel || "",
      etaMinutes: eta,
      status: "Placed",
    };
    let order;
    try {
      const remote = await api.createOrder(payload);
      order = saveOrder({ ...payload, id: remote._id.slice(-6), _id: remote._id });
      order = { ...remote, id: `NV-${remote._id.slice(-6)}` };
    } catch {
      order = saveOrder(payload);
    }
    clearCart();
    setPlaced(order);
  };

  if (cartItems.length === 0 && !placed) {
    return (
      <div className="app-page checkout-page" style={styles.page}>
        <header style={styles.header}>
          <h1 style={styles.logo} onClick={() => navigate("/")}><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Icon name="plate" size={20} /></span>Nivala</h1>
        </header>
        <div style={styles.empty}>
          <p>Your cart is empty.</p>
          <button style={styles.primaryButton} onClick={() => navigate("/")}>Browse Dishes</button>
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="app-page checkout-page" style={styles.page}>
        <header style={styles.header}>
          <h1 style={styles.logo} onClick={() => navigate("/")}><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Icon name="plate" size={20} /></span>Nivala</h1>
        </header>
        <div style={styles.confirmation}>
          <div style={styles.checkCircle}>✓</div>
          <h2 style={styles.confirmTitle}>Order {placed.id} placed!</h2>
          <p style={styles.confirmText}>
            {placed.mode === "pickup" ? "Pickup" : "Delivery"} in ~{placed.etaMinutes} min · Homemade food is being prepared fresh.
            Pay in cash on {placed.mode === "pickup" ? "pickup" : "delivery"}.
          </p>
          <p style={styles.confirmText}>Track it in Sidebar → Your Profile → Order history.</p>
          <button style={styles.primaryButton} onClick={() => navigate("/profile")}>View my orders</button>{" "}
          <button style={styles.primaryButton} onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page checkout-page" style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate("/")}><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Icon name="plate" size={20} /></span>Nivala</h1>
        <button style={styles.backButton} onClick={() => navigate("/cart")}>← Back to Cart</button>
      </header>

      <h2 style={styles.pageTitle}>Checkout · {user?.role === "seller" ? "Seller preview (buyer view)" : `Hi ${user?.name || "Guest"}`}</h2>

      <div style={styles.section}>
        <p style={styles.sectionLabel}>1 · Delivery or pickup (homemade = needs time)</p>
        <div style={styles.row}>
          <button style={mode === "delivery" ? styles.activeChip : styles.chip} onClick={() => setMode("delivery")}><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Icon name="scooter" size={16} /></span>Delivery ~{estimateDeliveryMinutes(itemCount, "delivery")} min</button>
          <button style={mode === "pickup" ? styles.activeChip : styles.chip} onClick={() => setMode("pickup")}><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Icon name="home" size={16} /></span>Pickup ~{estimateDeliveryMinutes(itemCount, "pickup")} min</button>
        </div>
        {mode === "delivery" ? (
          <textarea style={styles.addressInput} placeholder="Full delivery address with landmark..." value={address} onChange={(e) => setAddress(e.target.value)} />
        ) : <p style={styles.hint}>You’ll pick up directly from the home kitchen — fresher + no fee.</p>}
      </div>

      <div style={styles.section}>
        <p style={styles.sectionLabel}>2 · Payment</p>
        <p style={styles.hint}>Cash on Delivery only — pay when your food arrives.</p>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionLabel}>3 · Promo code</p>
        <div style={styles.row}>
          <input style={{ ...styles.addressInput, minHeight: "0", width: "200px" }} placeholder="Try NIVALA50" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
        </div>
        {promoInput.trim() && !promoApplied ? <p style={styles.errorHint}>Invalid code — try NIVALA50</p> : null}
        {promoApplied ? <p style={styles.successHint}>NIVALA50 applied — ₹{discount} off your first order</p> : null}
      </div>

      <div style={styles.section}>
        <p style={styles.sectionLabel}>4 · Price breakdown</p>
        {cartItems.map((item) => (
          <div key={item._id} style={styles.summaryItem}>
            <span>{item.name} x{item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div style={styles.summaryItem}><span>Subtotal</span><span>₹{totalPrice}</span></div>
        {discount > 0 && <div style={styles.summaryItem}><span>NIVALA50 discount</span><span>−₹{discount}</span></div>}
        <div style={styles.summaryItem}><span>Delivery fee {totalPrice - discount > 499 && mode === "delivery" ? "(FREE over ₹499)" : ""}</span><span>₹{deliveryFee}</span></div>
        <div style={styles.summaryItem}><span>Service fee (2% supports home chefs)</span><span>₹{serviceFee}</span></div>
        <div style={styles.summaryTotal}><span>Total (COD)</span><span style={styles.totalPrice}>₹{grandTotal}</span></div>
      </div>

      <button style={styles.placeOrderButton} onClick={handlePlaceOrder} disabled={mode === "delivery" && !address.trim()}>
        Place order · ~{eta} min
      </button>
      {mode === "delivery" && !address.trim() && <p style={styles.hint}>Add address to continue.</p>}
    </div>
  );
}

const styles = {
  page: { backgroundColor: "var(--color-bg)", minHeight: "100vh", padding: "24px 40px", fontFamily: "var(--font-body)", color: "var(--color-text)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  logo: { color: "var(--color-green)", margin: 0, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "22px", cursor: "pointer" },
  backButton: { background: "var(--color-card)", border: "1px solid rgba(43, 36, 32, 0.15)", color: "var(--color-text)", padding: "8px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "14px" },
  pageTitle: { fontFamily: "var(--font-heading)", fontSize: "24px", marginBottom: "24px" },
  section: { backgroundColor: "var(--color-card)", borderRadius: "16px", padding: "20px", marginBottom: "20px", maxWidth: "560px" },
  sectionLabel: { fontSize: "13px", fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" },
  row: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" },
  chip: { padding: "10px 16px", borderRadius: "20px", border: "1px solid rgba(43,36,32,0.2)", background: "transparent", cursor: "pointer" },
  activeChip: { padding: "10px 16px", borderRadius: "20px", border: "2px solid var(--color-green)", background: "rgba(47,110,79,0.08)", cursor: "pointer", fontWeight: 700 },
  hint: { fontSize: "13px", color: "var(--color-muted)" },
  errorHint: { fontSize: "13px", color: "#c0392b" },
  successHint: { fontSize: "13px", color: "#2f6e4f", fontWeight: 700 },
  addressInput: { width: "100%", minHeight: "80px", padding: "12px", borderRadius: "10px", border: "1px solid rgba(43, 36, 32, 0.15)", fontFamily: "var(--font-body)", fontSize: "14px", resize: "vertical" },
  summaryItem: { display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px", color: "var(--color-text)" },
  summaryTotal: { display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: 700, marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(43, 36, 32, 0.1)" },
  totalPrice: { color: "var(--color-orange)" },
  placeOrderButton: { backgroundColor: "var(--color-orange)", color: "#fff", border: "none", padding: "16px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-heading)" },
  empty: { textAlign: "center", padding: "60px 20px", color: "var(--color-muted)" },
  confirmation: { textAlign: "center", padding: "60px 20px" },
  checkCircle: { width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "var(--color-green)", color: "#fff", fontSize: "32px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
  confirmTitle: { fontFamily: "var(--font-heading)", fontSize: "24px", marginBottom: "10px" },
  confirmText: { color: "var(--color-muted)", maxWidth: "480px", margin: "0 auto 16px", lineHeight: "1.6" },
  primaryButton: { backgroundColor: "var(--color-green)", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-heading)", margin: "4px" },
};

export default Checkout;
