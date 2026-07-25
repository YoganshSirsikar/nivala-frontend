import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FoodCard from "../components/FoodCard";

function ChannelPage() {
  const { channelName } = useParams();
  const navigate = useNavigate();
  const [channelDishes, setChannelDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const decodedName = decodeURIComponent(channelName);

  useEffect(() => {
    fetch(`https://nivala-backend.onrender.com/api/channels/${encodeURIComponent(decodedName)}`)
      .then((res) => res.json())
      .then((data) => {
        setChannelDishes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch channel dishes:", err);
        setLoading(false);
      });
  }, [decodedName]);

  const handleCardClick = (id) => {
    navigate(`/dish/${id}`);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate("/")}>
          🍲 Nivala
        </h1>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ← Back
        </button>
      </header>

      <h1 style={styles.channelName}>{decodedName}</h1>
      <p style={styles.subtitle}>
        {loading
          ? "Loading..."
          : `${channelDishes.length} dish${channelDishes.length !== 1 ? "es" : ""} available`}
      </p>

      <div style={styles.grid}>
        {channelDishes.map((dish) => (
          <div key={dish._id} onClick={() => handleCardClick(dish._id)}>
            <FoodCard dish={dish} />
          </div>
        ))}
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
  channelName: {
    margin: "0 0 4px 0",
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: "28px",
    color: "var(--color-green)",
  },
  subtitle: {
    color: "var(--color-muted)",
    marginBottom: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
};

export default ChannelPage;