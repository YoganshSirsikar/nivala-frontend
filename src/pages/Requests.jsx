import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const LOCAL_KEY = "nivala-requests-v1";
const loadLocal = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; } };

function Requests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSeller = user?.role === "seller";
  const [remote, setRemote] = useState([]);
  const [local, setLocal] = useState(loadLocal);
  const [demand, setDemand] = useState([]);
  const [form, setForm] = useState({ dishName: "", category: "North Indian", locality: "College area", priceOffer: "", notes: "" });
  const [msg, setMsg] = useState("");

  const refresh = () => {
    api.listRequests().then(setRemote).catch(() => {});
    api.demand().then(setDemand).catch(() => {});
  };
  useEffect(refresh, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.dishName.trim()) return;
    const payload = { ...form, priceOffer: Number(form.priceOffer) || 0, requester: user?.name || "Guest" };
    try {
      const created = await api.createRequest(payload);
      setRemote((p) => [created, ...p]);
      setMsg("Request posted — nearby cooks can accept it.");
    } catch {
      const entry = { ...payload, _id: `local-${Date.now()}`, status: "open", createdAt: new Date().toISOString() };
      const next = [entry, ...local].slice(0, 30);
      setLocal(next);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      setMsg("Backend offline — saved in browser demo.");
    }
    setForm({ ...form, dishName: "", priceOffer: "", notes: "" });
    refresh();
  };

  const accept = async (id) => {
    if (!isSeller) return;
    try {
      const updated = await api.acceptRequest(id, user?.name || "");
      setRemote((p) => p.map((r) => (r._id === id ? updated : r)));
    } catch { alert("Backend offline."); }
  };

  const all = [...remote, ...local];
  const maxCount = Math.max(1, ...demand.map((d) => d.count));

  return (
    <main className="app-page" style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate("/")}>🍲 Nivala</h1>
        <button style={styles.back} onClick={() => navigate("/")}>← Back</button>
      </header>
      <p className="eyebrow">CUSTOMER → REQUEST → HOME COOK → ORDER</p>
      <h1 style={styles.title}>Request a Dish</h1>
      <p style={styles.sub}>Can't find it? Tell home cooks exactly what you crave. Sellers see live demand and accept with their price.</p>

      <section style={styles.grid}>
        <form onSubmit={submit} style={styles.card}>
          <h2>What do you want?</h2>
          <input style={styles.input} placeholder="Dish — e.g. Gujarati Thali *" value={form.dishName} onChange={(e) => setForm({ ...form, dishName: e.target.value })} />
          <div style={styles.row}>
            <input style={styles.input} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input style={styles.input} placeholder="Locality" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} />
          </div>
          <input style={styles.input} type="number" placeholder="Price you'll pay ₹" value={form.priceOffer} onChange={(e) => setForm({ ...form, priceOffer: e.target.value })} />
          <textarea style={styles.input} placeholder="Notes — spice, quantity, time..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button style={styles.primary} type="submit">Post request</button>
          {msg && <small>{msg}</small>}
        </form>

        <div style={styles.card}>
          <h2>📊 Demand Map — what the area wants</h2>
          {demand.length === 0 ? <p style={styles.muted}>No live backend demand yet. Post above to seed it — sellers use this to decide what to cook.</p> :
            demand.slice(0, 8).map((d) => (
              <div key={`${d.dish}-${d.locality}`} style={styles.demandRow}>
                <div><strong>{d.dish}</strong><br /><small>{d.locality} · ~₹{d.avgOffer}</small></div>
                <div style={styles.barWrap}><div style={{ ...styles.bar, width: `${(d.count / maxCount) * 100}%` }} /> <small>{d.count} want this</small></div>
              </div>
            ))}
          <p style={styles.muted}>Example: “35 people nearby want Gujarati Thali.”</p>
        </div>
      </section>

      <section style={styles.card}>
        <h2>Open requests ({all.length})</h2>
        {all.map((r) => (
          <div key={r._id} style={styles.req}>
            <div><strong>{r.dishName}</strong> · {r.category} · {r.locality} · ₹{r.priceOffer || "—"} · by {r.requester} · <b>{r.status}</b>{r.acceptedBy ? ` by ${r.acceptedBy}` : ""}<br /><small>{r.notes}</small></div>
            {isSeller && r.status === "open" && !String(r._id).startsWith("local-") && (
              <button style={styles.accept} onClick={() => accept(r._id)}>Accept as {user?.name}</button>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

const styles = {
  page: { background: "var(--color-bg)", minHeight: "100vh", padding: "24px clamp(16px,4vw,40px)", fontFamily: "var(--font-body)", color: "var(--color-text)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  logo: { color: "var(--color-green)", margin: 0, fontFamily: "var(--font-heading)", cursor: "pointer" },
  back: { background: "#fff", border: "1px solid #e5e3db", borderRadius: "999px", padding: "8px 14px", cursor: "pointer" },
  title: { fontFamily: "var(--font-heading)", color: "var(--color-green)", margin: "4px 0" },
  sub: { color: "var(--color-muted)", maxWidth: "640px", marginBottom: "14px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "14px", marginBottom: "14px" },
  card: { background: "#fff", borderRadius: "16px", padding: "18px", border: "1px solid #eee8e0" },
  input: { width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "10px", border: "1px solid rgba(43,36,32,0.2)", marginBottom: "10px" },
  row: { display: "flex", gap: "10px" },
  primary: { background: "var(--color-orange)", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 700, width: "100%" },
  muted: { color: "var(--color-muted)", fontSize: "13px" },
  demandRow: { display: "flex", justifyContent: "space-between", gap: "10px", padding: "8px 0", borderBottom: "1px solid #f0ece6", fontSize: "14px" },
  barWrap: { minWidth: "140px", textAlign: "right" },
  bar: { height: "8px", background: "var(--color-green)", borderRadius: "99px", marginBottom: "4px", marginLeft: "auto" },
  req: { display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px 0", borderBottom: "1px solid #f0ece6", fontSize: "14px", flexWrap: "wrap" },
  accept: { background: "var(--color-green)", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" },
};

export default Requests;
