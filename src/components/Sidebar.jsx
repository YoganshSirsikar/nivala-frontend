import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

export default function Sidebar({ isOpen, onClose, categories, selectedCategory, onCategorySelect }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* Dark overlay behind sidebar - clicking it closes the menu */}
      {isOpen && <div style={styles.overlay} onClick={onClose} aria-hidden="true" />}

      {/* Sidebar panel */}
      <aside
        style={{
          ...styles.sidebar,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>Menu</h2>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        {/* Profile section */}
        <div
          style={styles.profileSection}
          onClick={() => {
            onClose();
            navigate("/profile");
          }}
        >
          <div style={styles.avatar}><Icon name={user?.role === "seller" ? "chef" : "user"} size={20} /></div>
          <div>
            <p style={styles.profileName}>{user?.name || "Your Profile"} {user?.guest ? "(Guest)" : ""}</p>
            <p style={styles.profileSub}>{user?.role === "seller" ? "Seller · orders, earnings, add dish" : "Buyer · orders, reviews, follows"}</p>
          </div>
        </div>

        {/* Category list */}
        <div style={styles.categorySection}>
          <p style={styles.sectionLabel}>Browse by Category</p>
          <button
            type="button"
            style={{ ...styles.categoryItem, ...(selectedCategory === "" ? styles.activeCategoryItem : {}) }}
            onClick={() => onCategorySelect("")}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              style={{ ...styles.categoryItem, ...(selectedCategory === cat ? styles.activeCategoryItem : {}) }}
              onClick={() => onCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(43, 36, 32, 0.4)",
    zIndex: 100,
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100%",
    width: "280px",
    backgroundColor: "var(--color-card)",
    zIndex: 101,
    boxShadow: "4px 0 20px rgba(43, 36, 32, 0.15)",
    transition: "transform 0.25s ease",
    padding: "20px",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontFamily: "var(--font-heading)",
    fontSize: "18px",
    color: "var(--color-text)",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "var(--color-muted)",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "var(--color-bg)",
    borderRadius: "12px",
    cursor: "pointer",
    marginBottom: "24px",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "var(--color-green)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  profileName: {
    margin: 0,
    fontWeight: 600,
    fontSize: "14px",
    color: "var(--color-text)",
  },
  profileSub: {
    margin: 0,
    fontSize: "12px",
    color: "var(--color-muted)",
  },
  categorySection: {
    display: "flex",
    flexDirection: "column",
  },
  sectionLabel: {
    fontSize: "12px",
    color: "var(--color-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
    fontWeight: 600,
  },
  categoryItem: {
    appearance: "none",
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    textAlign: "left",
    padding: "12px 10px",
    fontSize: "15px",
    color: "var(--color-text)",
    borderBottom: "1px solid rgba(43, 36, 32, 0.06)",
    cursor: "pointer",
  },
  activeCategoryItem: {
    color: "var(--color-green)",
    backgroundColor: "rgba(47, 110, 79, 0.08)",
    borderRadius: "8px",
    fontWeight: 700,
  },
};
