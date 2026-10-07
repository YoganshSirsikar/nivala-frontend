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
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({ name: "", password: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    const next = { name: "", password: "" };
    const cleanName = name.trim();
    if (!cleanName) next.name = "Enter username (3–20 characters)";
    else if (cleanName.length < 3 || cleanName.length > 20) next.name = "Enter username (3–20 characters, letters / numbers / _ / .)";
    else if (!/^[A-Za-z0-9 _.'-]+$/.test(cleanName)) next.name = "Letters, numbers, space, _ . ' - only";
    if (!password) next.password = "Enter password (min 6, needs 1 number + 1 special @ # . !)";
    else if (password.length < 6) next.password = "Password needs min 6 characters";
    else if (!/[0-9]/.test(password)) next.password = "Password needs at least 1 number";
    else if (!/[@#.!$%^&*]/.test(password)) next.password = "Password needs at least 1 special character (@ # . !)";
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
            <div style={styles.pwWrap}>
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                style={{ ...styles.input, ...styles.pwInput, ...(errors.password ? styles.inputError : {}) }}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
              />
              <button type="button" aria-label={showPw ? "Hide password" : "Show password"} style={styles.eyeButton} onClick={() => setShowPw((v) => !v)}>
                {showPw ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18" /><path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.3 2.4-2.7 3.7M6.6 6.6C4 8.2 2.5 10.6 2 12c1 2.5 5 7 10 7 1.5 0 2.9-.3 4.1-.9" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7s-9-4.5-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
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
  pwWrap: {
    position: "relative",
  },
  pwInput: {
    width: "100%",
    boxSizing: "border-box",
    paddingRight: "44px",
  },
  eyeButton: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--color-muted)",
    padding: "6px",
    display: "flex",
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