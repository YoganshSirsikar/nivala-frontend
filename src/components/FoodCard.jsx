import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FoodCard({ dish }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleChannelClick = (e) => {
    e.stopPropagation();
    navigate(`/channel/${encodeURIComponent(dish.channel)}`);
  };

  return (
    <div
    style={{
      ...styles.card,
      transform: isHovered ? "translateY(-4px)" : "translateY(0)",
      boxShadow: isHovered
        ? "0 8px 20px rgba(43, 36, 32, 0.15)"
        : "0 2px 10px rgba(43, 36, 32, 0.08)",
    }}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
  >
      <img src={dish.image} alt={dish.name} style={styles.image} />
      <div style={styles.info}>
        <h3 style={styles.name}>{dish.name}</h3>
        <p style={styles.channel} onClick={handleChannelClick}>
          {dish.channel}
        </p>
        <div style={styles.bottomRow}>
          <span style={styles.price}>₹{dish.price}</span>
          <span style={styles.rating}>⭐ {dish.rating}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: "200px",
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "var(--color-card)",
    boxShadow: "0 2px 10px rgba(43, 36, 32, 0.08)",
    cursor: "pointer",
    flexShrink: 0,
    border: "1px solid rgba(43, 36, 32, 0.06)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  image: {
    width: "100%",
    height: "130px",
    objectFit: "cover",
  },
  info: {
    padding: "12px",
  },
  name: {
    margin: "0 0 4px 0",
    fontSize: "15px",
    fontFamily: "var(--font-heading)",
    fontWeight: 600,
    color: "var(--color-text)",
  },
  channel: {
    margin: "0 0 10px 0",
    fontSize: "12px",
    color: "var(--color-green)",
    cursor: "pointer",
    fontWeight: 500,
    display: "inline-block",
  },
  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontWeight: 700,
    color: "var(--color-orange)",
    fontFamily: "var(--font-heading)",
    fontSize: "14px",
  },
  rating: {
    fontSize: "12px",
    color: "var(--color-text)",
    backgroundColor: "var(--color-yellow)",
    padding: "2px 8px",
    borderRadius: "20px",
    fontWeight: 600,
  },
};