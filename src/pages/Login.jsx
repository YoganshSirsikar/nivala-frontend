import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState(null); // "buyer" or "seller"
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;
    login(name, role);
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🍲 Nivala</h1>
        <p style={styles.tagline}>Homemade food, from real kitchens</p>

        {!role ? (
          <div style={styles.roleSelect}>
            <p style={styles.roleLabel}>Continue as</p>
            <button
              style={styles.roleButton}
              onClick={() => setRole("buyer")}
            >
              🍽️ Buyer
            </button>
            <button
              style={{ ...styles.roleButton, ...styles.sellerButton }}
              onClick={() => setRole("seller")}
            >
              👩‍🍳 Seller
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
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" style={styles.continueButton}>
              Continue
            </button>
            <button
              type="button"
              style={styles.backLink}
              onClick={() => setRole(null)}
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
    backgroundColor: "var(--color-bg)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-body)",
    padding: "20px",
  },
  card: {
    backgroundColor: "var(--color-card)",
    borderRadius: "20px",
    padding: "40px 32px",
    width: "380px",
    maxWidth: "100%",
    boxShadow: "0 8px 30px rgba(43, 36, 32, 0.1)",
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
};

export default Login;