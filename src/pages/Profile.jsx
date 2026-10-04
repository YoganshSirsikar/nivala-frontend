import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders } from "../utils/orders";
import { api } from "../utils/api";

const STATUS_FLOW = ["Placed", "Accepted", "Preparing", "Ready", "Completed"];

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [localOrders] = useState(() => getOrders());
  const [remoteOrders, setRemoteOrders] = useState([]);
  const [buyerRemote, setBuyerRemote] = useState([]);
  const [myDishes, setMyDishes] = useState([]);
  const [kitchenMsg, setKitchenMsg] = useState("");
  const [dishMsg, setDishMsg] = useState("");
  const [trackingMsg, setTrackingMsg] = useState("");

  const isSeller = user?.role === "seller";
  const kitchenName = isSeller ? user?.name : "";
  const followed = Object.keys(localStorage)
    .filter((k) => k.startsWith("nivala-following-") && localStorage.getItem(k) === "true")
    .map((k) => k.replace("nivala-following-", ""));

  const [kitchenForm, setKitchenForm] = useState({ location: "Local home kitchen", story: "", hygieneNote: "" });
  const [dishForm, setDishForm] = useState({
    name: "", price: "", category: "Popular Today", image: "", isVegetarian: true,
    prepTime: "25–35 min", serves: "Serves 1", ingredients: "", isAvailable: true,
  });

  useEffect(() => {
    if (!isSeller || !kitchenName) return;
    api.listChannelDishes(kitchenName).then(setMyDishes).catch(() => {});
    api.listOrders({ kitchen: kitchenName }).then(setRemoteOrders).catch(() => {});
  }, [isSeller, kitchenName]);

  const refreshBuyer = () => {
    if (isSeller || !user?.name) return;
    setTrackingMsg("Checking live status...");
    api.listOrders({ buyer: user.name })
      .then((list) => { setBuyerRemote(list); setTrackingMsg(list.length ? `Live: ${list.length} order(s) from cloud.` : "No cloud orders yet for this name."); })
      .catch(() => setTrackingMsg("Backend offline — showing browser orders only."));
  };

  useEffect(() => {
    if (!isSeller && user?.name) {
      api.listOrders({ buyer: user.name }).then(setBuyerRemote).catch(() => {});
    }
  }, [isSeller, user?.name]);

  const handleSaveKitchen = async (e) => {
    e.preventDefault();
    try {
      await api.saveKitchen({ name: kitchenName, chef: kitchenName, ...kitchenForm, verified: false });
      setKitchenMsg("Kitchen profile saved (pending verification demo).");
    } catch {
      setKitchenMsg("Backend offline — saved locally for demo.");
      localStorage.setItem(`nivala-kitchen-${kitchenName}`, JSON.stringify(kitchenForm));
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!dishForm.name.trim() || !dishForm.price) return;
    const payload = {
      name: dishForm.name.trim(),
      channel: kitchenName,
      price: Number(dishForm.price),
      category: dishForm.category,
      image: dishForm.image || "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
      rating: 4.5,
      isVegetarian: dishForm.isVegetarian,
      prepTime: dishForm.prepTime,
      serves: dishForm.serves,
      ingredients: dishForm.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
      isAvailable: dishForm.isAvailable,
    };
    try {
      const created = await api.createDish(payload);
      setMyDishes((p) => [created, ...p]);
      setDishMsg(`Added “${created.name}” — live for buyers now.`);
      setDishForm({ ...dishForm, name: "", price: "", image: "", ingredients: "" });
    } catch {
      setDishMsg("Backend offline — dish kept in demo mode only.");
    }
  };

  const toggleAvailability = async (dish) => {
    try {
      const updated = await api.updateDish(dish._id, { isAvailable: !dish.isAvailable });
      setMyDishes((p) => p.map((d) => (d._id === dish._id ? updated : d)));
    } catch {
      setDishMsg("Could not update — backend offline.");
    }
  };

  const advanceStatus = async (order, next) => {
    try {
      const updated = await api.updateOrderStatus(order._id, next);
      setRemoteOrders((p) => p.map((o) => (o._id === updated._id ? updated : o)));
    } catch {
      alert("Backend offline — status change is demo-only.");
    }
  };

  const earnings = remoteOrders
    .filter((o) => o.status === "Completed")
    .reduce((s, o) => s + (o.total || 0), 0);
  const commission = Math.round(earnings * 0.1);

  return (
    <main className="app-page" style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate("/")}>🍲 Nivala</h1>
        <button style={styles.backButton} onClick={() => navigate("/")}>← Back</button>
      </header>

      <p className="eyebrow">{isSeller ? "SELLER DASHBOARD (DEMO-LIVE)" : "BUYER PROFILE"}{user?.guest ? " · GUEST" : ""}</p>
      <h1 style={styles.title}>Hi, {user?.name || "there"} 👋</h1>
      <p style={styles.sub}>{isSeller
        ? "Same homepage as buyers. Manage your kitchen, dishes and orders here. Buyers see wait times because food is homemade."
        : "Your orders, reviews and followed kitchens live here."}</p>

      {isSeller ? (
        <>
          <section style={styles.section}>
            <h2>1 · My kitchen ({kitchenName})</h2>
            <form onSubmit={handleSaveKitchen} style={styles.form}>
              <input style={styles.input} placeholder="Location" value={kitchenForm.location} onChange={(e) => setKitchenForm({ ...kitchenForm, location: e.target.value })} />
              <textarea style={styles.input} placeholder="Kitchen story — who cooks, tradition..." value={kitchenForm.story} onChange={(e) => setKitchenForm({ ...kitchenForm, story: e.target.value })} />
              <label style={styles.check}><input type="checkbox" checked={kitchenForm.hygieneNote === "declared"} onChange={(e) => setKitchenForm({ ...kitchenForm, hygieneNote: e.target.checked ? "declared" : "" })} /> I declare hygienic home preparation (demo verification)</label>
              <button style={styles.primary} type="submit">Save kitchen</button>
              {kitchenMsg && <small>{kitchenMsg}</small>}
            </form>
          </section>

          <section style={styles.section}>
            <h2>2 · Add dish — goes live instantly</h2>
            <form onSubmit={handleAddDish} style={styles.form}>
              <div style={styles.grid}>
                <input style={styles.input} placeholder="Dish name *" value={dishForm.name} onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })} />
                <input style={styles.input} type="number" placeholder="Price ₹ *" value={dishForm.price} onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })} />
                <input style={styles.input} placeholder="Photo URL (or blank)" value={dishForm.image} onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })} />
                <input style={styles.input} placeholder="Category" value={dishForm.category} onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })} />
                <input style={styles.input} placeholder="Prep time" value={dishForm.prepTime} onChange={(e) => setDishForm({ ...dishForm, prepTime: e.target.value })} />
                <input style={styles.input} placeholder="Serves" value={dishForm.serves} onChange={(e) => setDishForm({ ...dishForm, serves: e.target.value })} />
              </div>
              <input style={styles.input} placeholder="Ingredients, comma separated" value={dishForm.ingredients} onChange={(e) => setDishForm({ ...dishForm, ingredients: e.target.value })} />
              <label style={styles.check}><input type="checkbox" checked={dishForm.isVegetarian} onChange={(e) => setDishForm({ ...dishForm, isVegetarian: e.target.checked })} /> Vegetarian</label>
              <button style={styles.primary} type="submit">+ Add dish</button>
              {dishMsg && <small>{dishMsg}</small>}
            </form>
            <h3 style={{ marginTop: 16 }}>My dishes ({myDishes.length})</h3>
            {myDishes.map((d) => (
              <div key={d._id} style={styles.orderCard}>
                <strong>{d.name}</strong> · ₹{d.price} · {d.isAvailable ? "Available" : "Sold out"}{" "}
                <button style={styles.link} onClick={() => toggleAvailability(d)}>toggle availability</button>
              </div>
            ))}
          </section>

          <section style={styles.section}>
            <h2>3 · Incoming orders ({remoteOrders.length} real + {localOrders.length} local demo)</h2>
            {remoteOrders.length === 0 && <p>No real backend orders yet — place a test order as buyer.</p>}
            {remoteOrders.map((o) => (
              <div key={o._id} style={styles.orderCard}>
                <strong>{o._id.slice(-6)}</strong> · {o.buyer} · ₹{o.total} · <b>{o.status}</b> · {o.mode} · ETA ~{o.etaMinutes} min
                <br /><small>{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</small>
                <br />
                {STATUS_FLOW.filter((s) => s !== "Placed").map((s) => (
                  <button key={s} style={styles.mini} disabled={o.status === s} onClick={() => advanceStatus(o, s)}>{s}</button>
                ))}
              </div>
            ))}
          </section>

          <section style={styles.section}>
            <h2>4 · Earnings (demo)</h2>
            <p>Completed sales: ₹{earnings} · Commission 10%: ₹{commission} · You keep: ₹{earnings - commission}</p>
          </section>
        </>
      ) : (
        <>
          <section style={styles.section}>
            <h2>Live tracking ({buyerRemote.length} cloud)</h2>
            <button style={styles.mini} onClick={refreshBuyer}>Refresh live status</button>
            {trackingMsg && <p><small>{trackingMsg}</small></p>}
            {buyerRemote.length === 0 ? <p>No cloud orders yet — place an order, then seller updates will appear here.</p> :
              buyerRemote.map((o) => (
                <div key={o._id} style={styles.orderCard}>
                  <strong>{o._id.slice(-6)}</strong> · ₹{o.total} · {o.mode} · <b>{o.status}</b> · ETA ~{o.etaMinutes} min
                  <div style={styles.timeline}>
                    {STATUS_FLOW.map((s) => (
                      <span key={s} style={STATUS_FLOW.indexOf(s) <= STATUS_FLOW.indexOf(o.status) ? styles.dotOn : styles.dot}>{s}</span>
                    ))}
                  </div>
                  <small>{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</small>
                </div>
              ))}
          </section>
          <section style={styles.section}>
            <h2>Order history ({localOrders.length} on this device)</h2>
            {localOrders.length === 0 ? <p>No orders yet. <button style={styles.link} onClick={() => navigate("/")}>Browse meals →</button></p> :
              localOrders.map((o) => (
                <div key={o.id} style={styles.orderCard}>
                  <strong>{o.id}</strong> · ₹{o.total} · {o.mode} · ~{o.etaMinutes} min · {o.status}
                  <br /><small>{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</small>
                </div>
              ))}
          </section>
          <section style={styles.section}>
            <h2>Followed kitchens ({followed.length})</h2>
            {followed.length === 0 ? <p>You don’t follow any kitchen yet.</p> :
              followed.map((k) => (
                <button key={k} style={styles.link} onClick={() => navigate(`/channel/${encodeURIComponent(k)}`)}>• {k}<br /></button>
              ))}
          </section>
        </>
      )}

      <button style={styles.logout} onClick={() => { logout(); navigate("/login"); }}>Logout</button>
    </main>
  );
}

const styles = {
  page: { backgroundColor: "var(--color-bg)", minHeight: "100vh", padding: "24px clamp(16px,4vw,40px)", fontFamily: "var(--font-body)", color: "var(--color-text)", overflowX: "hidden" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" },
  logo: { color: "var(--color-green)", margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", cursor: "pointer" },
  backButton: { background: "var(--color-card)", border: "1px solid rgba(43,36,32,0.15)", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" },
  title: { fontFamily: "var(--font-heading)", margin: "4px 0", fontSize: "clamp(24px,5vw,32px)", wordBreak: "break-word" },
  sub: { color: "var(--color-muted)", maxWidth: "640px", fontSize: "14px", lineHeight: "1.6" },
  section: { background: "var(--color-card)", borderRadius: "16px", padding: "clamp(16px,3vw,20px)", margin: "16px 0", maxWidth: "700px", width: "100%", boxSizing: "border-box", overflow: "hidden" },
  form: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px", width: "100%" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "10px", width: "100%" },
  input: { padding: "12px", borderRadius: "10px", border: "1px solid rgba(43,36,32,0.2)", width: "100%", boxSizing: "border-box", minWidth: 0 },
  check: { fontSize: "14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  primary: { background: "var(--color-green)", color: "#fff", border: "none", padding: "12px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, width: "100%", maxWidth: "320px" },
  orderCard: { borderBottom: "1px solid rgba(43,36,32,0.08)", padding: "10px 0", fontSize: "14px", wordBreak: "break-word" },
  link: { background: "none", border: "none", color: "var(--color-green)", cursor: "pointer", fontSize: "13px", textDecoration: "underline" },
  mini: { margin: "4px 4px 0 0", padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(43,36,32,0.2)", cursor: "pointer", fontSize: "12px" },
  timeline: { display: "flex", gap: "6px", flexWrap: "wrap", margin: "8px 0" },
  dot: { fontSize: "11px", padding: "4px 8px", borderRadius: "99px", background: "#f0ece6", color: "#69746c" },
  dotOn: { fontSize: "11px", padding: "4px 8px", borderRadius: "99px", background: "#e6f3ea", color: "#2f6e4f", fontWeight: 700 },
  logout: { marginTop: "12px", background: "none", border: "1px solid rgba(43,36,32,0.2)", padding: "10px 20px", borderRadius: "10px", cursor: "pointer" },
};

export default Profile;
