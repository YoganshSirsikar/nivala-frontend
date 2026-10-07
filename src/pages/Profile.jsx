import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders, deriveLiveStatus, minutesLeft, STATUS_FLOW } from "../utils/orders";
import { api } from "../utils/api";
import Icon from "../components/Icon";

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

  // Tick every 30s so countdowns + live stages move in real time.
  // Auto-close: when the clock passes ETA, persist Completed once.
  const [, setNow] = useState(Date.now());
  const closedRef = useRef(new Set());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const all = [...buyerRemote, ...remoteOrders];
    all.forEach((o) => {
      if (!o._id || closedRef.current.has(o._id)) return;
      if (deriveLiveStatus(o) === "Completed" && o.status !== "Completed" && o.status !== "Cancelled") {
        closedRef.current.add(o._id);
        api.updateOrderStatus(o._id, "Completed")
          .then((u) => {
            setBuyerRemote((p) => p.map((x) => (x._id === u._id ? u : x)));
            setRemoteOrders((p) => p.map((x) => (x._id === u._id ? u : x)));
          })
          .catch(() => {});
      }
    });
  });

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

  const liveOrders = remoteOrders.map((o) => ({ ...o, live: deriveLiveStatus(o), left: minutesLeft(o) }));
  const activeCount = liveOrders.filter((o) => o.live !== "Completed" && o.live !== "Cancelled").length;

  const statusStyle = (s) => {
    switch (s) {
      case "Placed": return { bg: "#fef3e2", fg: "#9a5b00", dot: "#f4b942" };
      case "Accepted": return { bg: "#e8f0fe", fg: "#1a56db", dot: "#3b82f6" };
      case "Preparing": return { bg: "#fff0e5", fg: "#c2410c", dot: "#e56437" };
      case "Ready": return { bg: "#e6f6ec", fg: "#1c7a3d", dot: "#22c55e" };
      case "Completed": return { bg: "#dcefe3", fg: "#14532d", dot: "#14532d" };
      default: return { bg: "#f3f0ea", fg: "#69746c", dot: "#a8a29e" };
    }
  };

  return (
    <main className="app-page" style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate("/")}><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Icon name="plate" size={20} /></span>Nivala</h1>
        <button style={styles.backButton} onClick={() => navigate("/")}>← Back</button>
      </header>

      <p className="eyebrow">{isSeller ? "SELLER DASHBOARD (DEMO-LIVE)" : "BUYER PROFILE"}{user?.guest ? " · GUEST" : ""}</p>
      <h1 style={styles.title}>Hi, {user?.name || "there"}</h1>
      <p style={styles.sub}>{isSeller
        ? "Same homepage as buyers. Manage your kitchen, dishes and orders here. Buyers see wait times because food is homemade."
        : "Your orders, reviews and followed kitchens live here."}</p>

      {isSeller ? (
        <>
          <section style={styles.section}>
            <h2><span style={styles.stepBadge}>1</span> My kitchen <small style={styles.sectionSmall}>{kitchenName}</small></h2>
            <form onSubmit={handleSaveKitchen} style={styles.form}>
              <input style={styles.input} placeholder="Location" value={kitchenForm.location} onChange={(e) => setKitchenForm({ ...kitchenForm, location: e.target.value })} />
              <textarea style={styles.input} placeholder="Kitchen story — who cooks, tradition..." value={kitchenForm.story} onChange={(e) => setKitchenForm({ ...kitchenForm, story: e.target.value })} />
              <label style={styles.check}><input type="checkbox" checked={kitchenForm.hygieneNote === "declared"} onChange={(e) => setKitchenForm({ ...kitchenForm, hygieneNote: e.target.checked ? "declared" : "" })} /> I declare hygienic home preparation (demo verification)</label>
              <button style={styles.primary} type="submit">Save kitchen</button>
              {kitchenMsg && <small>{kitchenMsg}</small>}
            </form>
          </section>

          <section style={styles.section}>
            <h2><span style={styles.stepBadge}>2</span> Menu <small style={styles.sectionSmall}>{myDishes.length} live dishes</small></h2>
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
              <div key={d._id} style={styles.dishRow}>
                <div><strong>{d.name}</strong> · ₹{d.price}<br /><small>{d.category} · {d.prepTime}</small></div>
                <span style={d.isAvailable ? styles.availOn : styles.availOff}>{d.isAvailable ? "● Live" : "● Paused"}</span>
                <button style={styles.link} onClick={() => toggleAvailability(d)}>{d.isAvailable ? "Pause" : "Resume"}</button>
              </div>
            ))}
          </section>

          <section style={styles.section}>
            <h2><span style={styles.stepBadge}>3</span> Live orders {activeCount > 0 ? <span className="pulse-dot" /> : null} <small style={styles.sectionSmall}>{activeCount} cooking now · {remoteOrders.length} total</small></h2>
            {remoteOrders.length === 0 && <p>No real backend orders yet — place a test order as buyer.</p>}
            {liveOrders.map((o) => {
              const st = statusStyle(o.live);
              const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.live) + 1];
              return (
                <div key={o._id} style={{ ...styles.liveCard, borderLeft: `5px solid ${st.dot}` }}>
                  <div style={styles.liveTop}>
                    <div><strong>#{o._id.slice(-6)}</strong> · {o.buyer} · <strong>₹{o.total}</strong></div>
                    <span style={{ ...styles.statusPill, background: st.bg, color: st.fg }}>{o.live === "Placed" ? <span className="pulse-dot" /> : null}{o.live}</span>
                  </div>
                  <div style={styles.liveMeta}>{o.mode} · {o.left > 0 ? `${o.left} min left` : "time over — auto-completed"} · {o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</div>
                  <div style={styles.liveActions}>
                    {next && next !== "Placed" && (
                      <button style={styles.nextButton} onClick={() => advanceStatus(o, next)}>Mark {next} →</button>
                    )}
                    {STATUS_FLOW.filter((s) => s !== "Placed" && s !== next).map((s) => (
                      <button key={s} style={styles.mini} disabled={o.live === s} onClick={() => advanceStatus(o, s)}>{s}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <section style={styles.earnCard}>
            <p style={styles.earnEyebrow}>EARNINGS</p>
            <h2 style={styles.earnTotal}>₹{earnings - commission} <small>yours</small></h2>
            <p style={styles.earnSub}>₹{earnings} sales · ₹{commission} Nivala commission (10%) · COD collected by you</p>
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
                  <strong>{o._id.slice(-6)}</strong> · ₹{o.total} · {o.mode} · <b>{deriveLiveStatus(o)}</b> · {minutesLeft(o) > 0 ? `${minutesLeft(o)} min left` : "completed"}
                  <div style={styles.timeline}>
                    {STATUS_FLOW.map((s) => (
                      <span key={s} style={STATUS_FLOW.indexOf(s) <= STATUS_FLOW.indexOf(deriveLiveStatus(o)) ? styles.dotOn : styles.dot}>{s}</span>
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
  mini: { margin: "4px 4px 0 0", padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(43,36,32,0.2)", cursor: "pointer", fontSize: "12px", background: "#fff" },
  nextButton: { margin: "8px 8px 0 0", padding: "10px 18px", borderRadius: "999px", border: "none", background: "var(--color-green)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "13px" },
  liveCard: { background: "#fffdf8", border: "1px solid #eee3d3", borderRadius: "14px", padding: "14px", margin: "10px 0", boxShadow: "0 4px 14px rgba(43,36,32,0.06)" },
  liveTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  liveMeta: { fontSize: "13px", color: "var(--color-muted)", marginTop: "6px" },
  liveActions: { marginTop: "6px" },
  statusPill: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 800, padding: "6px 12px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.4px" },
  stepBadge: { display: "inline-grid", placeItems: "center", width: "26px", height: "26px", borderRadius: "50%", background: "var(--color-green)", color: "#fff", fontSize: "14px", marginRight: "8px", verticalAlign: "middle" },
  sectionSmall: { fontSize: "13px", color: "var(--color-muted)", fontWeight: 400, fontFamily: "var(--font-body)" },
  dishRow: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid rgba(43,36,32,0.08)", fontSize: "14px", flexWrap: "wrap" },
  availOn: { fontSize: "12px", fontWeight: 800, color: "#1c7a3d", background: "#e6f6ec", padding: "4px 10px", borderRadius: "999px" },
  availOff: { fontSize: "12px", fontWeight: 800, color: "#b3261e", background: "#fdecea", padding: "4px 10px", borderRadius: "999px" },
  earnCard: { background: "linear-gradient(135deg, #285c45 0%, #3d8a5f 60%, #e56437 130%)", color: "#fff", borderRadius: "18px", padding: "22px", margin: "16px 0", maxWidth: "700px", boxShadow: "0 12px 28px rgba(40,92,69,0.25)" },
  earnEyebrow: { fontSize: "11px", letterSpacing: "0.2em", opacity: 0.8, margin: 0 },
  earnTotal: { fontFamily: "var(--font-heading)", fontSize: "38px", margin: "6px 0" },
  earnSub: { fontSize: "13px", opacity: 0.9, margin: 0 },
  timeline: { display: "flex", gap: "6px", flexWrap: "wrap", margin: "8px 0" },
  dot: { fontSize: "11px", padding: "4px 8px", borderRadius: "99px", background: "#f0ece6", color: "#69746c" },
  dotOn: { fontSize: "11px", padding: "4px 8px", borderRadius: "99px", background: "#e6f3ea", color: "#2f6e4f", fontWeight: 700 },
  logout: { marginTop: "12px", background: "none", border: "1px solid rgba(43,36,32,0.2)", padding: "10px 20px", borderRadius: "10px", cursor: "pointer" },
};

export default Profile;
