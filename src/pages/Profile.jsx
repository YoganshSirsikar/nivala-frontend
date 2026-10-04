import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders } from "../utils/orders";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const orders = getOrders();
  const followed = Object.keys(localStorage)
    .filter((k) => k.startsWith("nivala-following-") && localStorage.getItem(k) === "true")
    .map((k) => k.replace("nivala-following-", ""));

  const myReviewsCount = Object.keys(localStorage).filter((k) => k.startsWith("nivala-reviews")).length;

  return (
    <main className="app-page" style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate("/")}>🍲 Nivala</h1>
        <button style={styles.backButton} onClick={() => navigate("/")}>← Back</button>
      </header>

      <p className="eyebrow">{user?.role === "seller" ? "SELLER PROFILE (DEMO)" : "BUYER PROFILE"}{user?.guest ? " · GUEST" : ""}</p>
      <h1 style={styles.title}>Hi, {user?.name || "there"} 👋</h1>
      <p style={styles.sub}>{user?.role === "seller"
        ? "Same homepage as buyers for now. Seller tools live here — add dishes, track orders, earnings (demo, backend next)."
        : "Your orders, reviews and followed kitchens live here."}</p>

      {user?.role === "seller" ? (
        <>
          <section style={styles.section}>
            <h2>Seller quick actions</h2>
            <div style={styles.row}>
              <button style={styles.primary} onClick={() => navigate("/?seller-add=1")}>+ Add dish (next: seller dashboard)</button>
              <button style={styles.secondary} onClick={() => navigate("/")}>View buyer homepage</button>
            </div>
            <ul style={styles.list}>
              <li>✓ Upload dish photo, price, category, prep time, availability — coming in Seller Dashboard</li>
              <li>✓ Incoming orders will appear here with Accept → Preparing → Ready states</li>
              <li>✓ Earnings = sum of your kitchen orders minus commission (demo)</li>
            </ul>
          </section>
          <section style={styles.section}>
            <h2>Incoming orders (demo — all local orders)</h2>
            {orders.length === 0 ? <p>No orders yet. Place a test order as buyer to see seller view.</p> :
              orders.map((o) => (
                <div key={o.id} style={styles.orderCard}>
                  <strong>{o.id}</strong> · {o.items.length} items · ₹{o.total} · {o.status} · {o.mode}
                  <br /><small>{o.buyer} · ETA ~{o.etaMinutes} min · Homemade buffer included</small>
                </div>
              ))}
          </section>
        </>
      ) : (
        <>
          <section style={styles.section}>
            <h2>Order history ({orders.length})</h2>
            {orders.length === 0 ? <p>No orders yet. <button style={styles.link} onClick={() => navigate("/")}>Browse meals →</button></p> :
              orders.map((o) => (
                <div key={o.id} style={styles.orderCard}>
                  <strong>{o.id}</strong> · ₹{o.total} · {o.mode} · ~{o.etaMinutes} min · {o.status}
                  <br /><small>{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</small>
                </div>
              ))}
          </section>
          <section style={styles.section}>
            <h2>Followed kitchens ({followed.length})</h2>
            {followed.length === 0 ? <p>You don’t follow any kitchen yet. Open a kitchen → Follow.</p> :
              followed.map((k) => (
                <button key={k} style={styles.link} onClick={() => navigate(`/channel/${encodeURIComponent(k)}`)}>• {k}<br /></button>
              ))}
          </section>
          <section style={styles.section}>
            <h2>Reviews you gave</h2>
            <p>Reviews save in this browser for demo. Open any dish → post a review → it appears there with ✓ Verified order.</p>
          </section>
        </>
      )}

      <button style={styles.logout} onClick={() => { logout(); navigate("/login"); }}>Logout</button>
    </main>
  );
}

const styles = {
  page: { backgroundColor: "var(--color-bg)", minHeight: "100vh", padding: "24px 40px", fontFamily: "var(--font-body)", color: "var(--color-text)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  logo: { color: "var(--color-green)", margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", cursor: "pointer" },
  backButton: { background: "var(--color-card)", border: "1px solid rgba(43,36,32,0.15)", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" },
  title: { fontFamily: "var(--font-heading)", margin: "4px 0" },
  sub: { color: "var(--color-muted)", maxWidth: "600px" },
  section: { background: "var(--color-card)", borderRadius: "16px", padding: "20px", margin: "16px 0", maxWidth: "640px" },
  row: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" },
  primary: { background: "var(--color-green)", color: "#fff", border: "none", padding: "12px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: 600 },
  secondary: { background: "transparent", border: "1px solid rgba(43,36,32,0.2)", padding: "12px 18px", borderRadius: "10px", cursor: "pointer" },
  list: { fontSize: "14px", lineHeight: "1.7", color: "var(--color-text)" },
  orderCard: { borderBottom: "1px solid rgba(43,36,32,0.08)", padding: "10px 0", fontSize: "14px" },
  link: { background: "none", border: "none", color: "var(--color-green)", cursor: "pointer", fontSize: "14px", textAlign: "left" },
  logout: { marginTop: "12px", background: "none", border: "1px solid rgba(43,36,32,0.2)", padding: "10px 20px", borderRadius: "10px", cursor: "pointer" },
};

export default Profile;
