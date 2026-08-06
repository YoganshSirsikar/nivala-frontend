import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function DishDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdded, setShowAdded] = useState(false);

  useEffect(() => {
    fetch(`https://nivala-backend.onrender.com/api/dishes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDish(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dish:", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    addToCart(dish);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1500);
  };

  if (loading) {
    return <div className="app-page" style={styles.page}>Loading...</div>;
  }

  if (!dish || dish.message === "Dish not found") {
    return (
      <div className="app-page" style={styles.notFound}>
        <p>Dish not found.</p>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="app-page detail-page" style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate("/")}>
          🍲 Nivala
        </h1>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ← Back
        </button>
      </header>

      <div className="detail-content" style={styles.content}>
        <img className="detail-image" src={dish.image} alt={dish.name} style={styles.image} />

        <div style={styles.details}>
          <h1 style={styles.name}>{dish.name}</h1>
          <p
            style={styles.channel}
            onClick={() => navigate(`/channel/${encodeURIComponent(dish.channel)}`)}
          >
            by {dish.channel}
          </p>

          <div style={styles.metaRow}>
            <span style={styles.price}>₹{dish.price}</span>
            <span style={styles.rating}>⭐ {dish.rating}</span>
          </div>

          <p style={styles.description}>
            Freshly prepared homemade {dish.name}, made with love and quality
            ingredients by {dish.channel}. Order now and enjoy authentic,
            home-style cooking delivered to you.
          </p>

          <div className="detail-button-row" style={styles.buttonRow}>
            <button style={styles.addButton} onClick={handleAddToCart}>
              {showAdded ? "✓ Added!" : "Add to Cart"}
            </button>
            <button
              style={styles.orderButton}
              onClick={() => {
                addToCart(dish);
                navigate("/cart");
              }}
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "var(--color-bg)",
    minHeight: "100vh",
    padding: "24px 40px",
    fontFamily: "var(--font-body)",
    color: "var(--color-text)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  logo: {
    color: "var(--color-green)",
    margin: 0,
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: "22px",
    cursor: "pointer",
  },
  backButton: {
    background: "var(--color-card)",
    border: "1px solid rgba(43, 36, 32, 0.15)",
    color: "var(--color-text)",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    marginBottom: "24px",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
  },
  content: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
  },
  image: {
    width: "400px",
    maxWidth: "100%",
    height: "300px",
    objectFit: "cover",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(43, 36, 32, 0.1)",
  },
  details: {
    flex: 1,
    minWidth: "280px",
  },
  name: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontFamily: "var(--font-heading)",
    fontWeight: 600,
    color: "var(--color-text)",
  },
  channel: {
    color: "var(--color-green)",
    marginBottom: "16px",
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-block",
  },
  metaRow: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "20px",
  },
  price: {
    fontSize: "24px",
    fontWeight: 700,
    color: "var(--color-orange)",
    fontFamily: "var(--font-heading)",
  },
  rating: {
    color: "var(--color-text)",
    fontSize: "14px",
    fontWeight: 600,
    backgroundColor: "var(--color-yellow)",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  description: {
    color: "var(--color-muted)",
    lineHeight: "1.6",
    marginBottom: "24px",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
  },
  addButton: {
    backgroundColor: "var(--color-card)",
    color: "var(--color-green)",
    border: "2px solid var(--color-green)",
    padding: "14px 28px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    fontFamily: "var(--font-heading)",
    cursor: "pointer",
  },
  orderButton: {
    backgroundColor: "var(--color-orange)",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    fontFamily: "var(--font-heading)",
    cursor: "pointer",
  },
  notFound: {
    color: "var(--color-text)",
    padding: "40px",
    textAlign: "center",
  },
};

export default DishDetail;
