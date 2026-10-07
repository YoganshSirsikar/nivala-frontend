import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Icon from "../components/Icon";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState(null); // "buyer" or "seller"
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", password: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    const next = { name: "", password: "" };
    const cleanName = name.trim();
    if (!cleanName) next.name = "Enter username (3–20 characters)";
    else if (cleanName.length < 3 || cleanName.length > 20) next.name = "Enter username (3–20 characters, letters / numbers / _ / .)";
    else if (!/^[A-Za-z0-9 _.'-]+$/.test(cleanName)) next.name = "Letters, numbers, space, _ . ' - only";
    if (!password) next.password = "Enter password (min 4 — use letters, numbers & special @ # . ! )";
    else if (password.length < 4) next.password = "Enter password (min 4 — use letters, numbers & special @ # . ! )";
    setErrors(next);
    if (next.name || next.password) return;
    login(cleanName, role);
    navigate("/");
  };

  const handleSkip = () => {
    login("Guest", "buyer", { guest: true });
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <video autoPlay muted loop playsInline src="/login-bg.mp4" style={styles.video} />
      <div style={styles.overlay} />
      <div style={styles.card}>
        <h1 style={styles.logo}>Nivala</h1>
        <p style={styles.tagline}>Homemade food, from real kitchens</p>

        {!role ? (
          <div style={styles.roleSelect}>
            <p style={styles.roleLabel}>Continue as</p>
            <button
              style={styles.roleButton}
              onClick={() => { setRole("buyer"); setName(""); setPassword(""); setErrors({ name: "", password: "" }); }}
            >
              <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 8 }}><Icon name="plate" size={18} /></span>Buyer
            </button>
            <button
              style={{ ...styles.roleButton, ...styles.sellerButton }}
              onClick={() => { setRole("seller"); setName(""); setPassword(""); setErrors({ name: "", password: "" }); }}
            >
              <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 8 }}><Icon name="chef" size={18} /></span>Seller
            </button>
            <button type="button" style={styles.skipButton} onClick={handleSkip}>
              Skip for now → browse as guest buyer
            </button>
          </div>
        ) : (
          <form style={styles.form} onSubmit={handleLogin}>
            <p style={styles.roleLabel}>
              Logging in as <strong>{role === "buyer" ? "Buyer" : "Seller"}</strong>
            </p>
            <input
              type="text"
              placeholder={role === "buyer" ? "Your name" : "Channel name (e.g. Sunita's Kitchen)"}
              style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            />
            {errors.name ? <p style={styles.errorText}>{errors.name}</p> : null}
            <input
              type="password"
              placeholder="Password"
              style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
            />
            {errors.password ? <p style={styles.errorText}>{errors.password}</p> : null}
            <button type="submit" style={styles.continueButton}>
              Continue
            </button>
            <button
              type="button"
              style={styles.backLink}
              onClick={() => { setRole(null); setName(""); setPassword(""); setErrors({ name: "", password: "" }); }}
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#1c2b24",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-body)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  video: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(28, 43, 36, 0.55)",
  },
  card: {
    position: "relative",
    background: "linear-gradient(180deg, #ffffff 0%, #fff9ef 100%)",
    borderRadius: "24px",
    padding: "40px 32px",
    width: "380px",
    maxWidth: "100%",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35), 0 2px 0 rgba(255, 255, 255, 0.6) inset",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    textAlign: "center",
  },
  logo: {
    color: "var(--color-green)",
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: "26px",
    margin: "0 0 6px 0",
  },
  tagline: {
    color: "var(--color-muted)",
    fontSize: "14px",
    marginBottom: "32px",
  },
  roleSelect: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  roleLabel: {
    fontSize: "13px",
    color: "var(--color-muted)",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  roleButton: {
    padding: "16px",
    borderRadius: "12px",
    border: "2px solid var(--color-green)",
    backgroundColor: "var(--color-card)",
    color: "var(--color-green)",
    fontSize: "16px",
    fontWeight: 600,
    fontFamily: "var(--font-heading)",
    cursor: "pointer",
  },
  sellerButton: {
    borderColor: "var(--color-orange)",
    color: "var(--color-orange)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(43, 36, 32, 0.15)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    outline: "none",
  },
  inputError: {
    border: "2px solid #c0392b",
  },
  errorText: {
    color: "#c0392b",
    fontSize: "13px",
    textAlign: "left",
    margin: "-4px 0 0 2px",
  },
  continueButton: {
    backgroundColor: "var(--color-orange)",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    fontFamily: "var(--font-heading)",
    cursor: "pointer",
    marginTop: "8px",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "var(--color-muted)",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "4px",
  },
  skipButton: {
    background: "transparent",
    border: "1px dashed rgba(43, 36, 32, 0.3)",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "14px",
    cursor: "pointer",
    color: "var(--color-text)",
    marginTop: "4px",
  },
  demoNote: {
    fontSize: "12px",
    color: "var(--color-muted)",
    marginTop: "8px",
  },
};

export default Login;