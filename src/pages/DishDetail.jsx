import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { fallbackFoodImage, getDishImage, getDishMeta } from "../utils/dishMeta";
import { getReviews, addReview } from "../utils/reviews";
import { api } from "../utils/api";

function DishDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdded, setShowAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    fetch(`https://nivala-backend.onrender.com/api/dishes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDish(data);
        setLoading(false);
        const local = getReviews(data._id || id);
        setReviews(local.map((r) => ({ ...r, name: r.name, source: "device" })));
        api.listReviews(data._id || id)
          .then((remote) => {
            const mapped = remote.map((r) => ({ id: r._id, name: r.reviewer, rating: r.rating, comment: r.comment, verified: r.verified, source: "cloud" }));
            setReviews((prev) => {
              const localOnly = prev.filter((p) => p.source === "device");
              return [...mapped, ...localOnly];
            });
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.error("Failed to fetch dish:", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const payload = { name: user?.name || "Guest", rating: ratingInput, comment: commentInput.trim() };
    try {
      const saved = await api.createReview({ dishId: dish._id, reviewer: payload.name, rating: payload.rating, comment: payload.comment });
      setReviews((prev) => [{ id: saved._id, name: saved.reviewer, rating: saved.rating, comment: saved.comment, verified: true, source: "cloud" }, ...prev]);
    } catch {
      const r = addReview(dish._id, payload);
      setReviews((prev) => [{ ...r, source: "device" }, ...prev]);
    }
    setCommentInput("");
  };

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

  const meta = getDishMeta(dish);
  const baseCount = meta.reviewCount;
  const baseRating = dish.rating || 4.5;
  const extra = reviews.length;
  const extraSum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
  const summary = extra === 0
    ? { count: baseCount, avg: baseRating }
    : { count: baseCount + extra, avg: ((baseRating * baseCount + extraSum) / (baseCount + extra)).toFixed(1) };

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

      <section className="dish-detail-layout">
        <div className="dish-image-panel">
          <img className="detail-image" src={getDishImage(dish)} alt={dish.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackFoodImage; }} />
          <span className="detail-diet-badge">{meta.isVegetarian ? "● 100% Vegetarian" : "● Non-vegetarian"}</span>
          <span className="detail-availability">{meta.isAvailable ? "● Available today" : "Currently unavailable"}</span>
        </div>

        <div className="dish-main-info">
          <p className="eyebrow">{dish.category || "HOME-COOKED FAVOURITE"}</p>
          <h1>{dish.name}</h1>
          <button className="chef-link" onClick={() => navigate(`/channel/${encodeURIComponent(dish.channel)}`)}>👩‍🍳 From {dish.channel} <span>→</span></button>
          <div className="dish-price-row"><strong>₹{dish.price}</strong><span>★ {summary.avg} <small>({summary.count} ratings)</small></span></div>
          <div className="dish-facts"><div><span>⏱</span><p><strong>{meta.prepTime}</strong><br />Preparation</p></div><div><span>🍽</span><p><strong>{meta.serves}</strong><br />Portion size</p></div><div><span>🏡</span><p><strong>Home made</strong><br />Made to order</p></div></div>
          <p className="dish-description">{meta.story}</p>
          <div className="dish-actions">
            <button className="add-to-cart" disabled={!meta.isAvailable} onClick={handleAddToCart}>{showAdded ? "✓ Added to cart" : "Add to cart"}</button>
            <button className="order-now" disabled={!meta.isAvailable} onClick={() => { addToCart(dish); navigate("/cart"); }}>Order now <span>→</span></button>
          </div>
          <p className="delivery-note">🕒 Freshly prepared after you order · Delivery/pickup details at checkout</p>
        </div>
      </section>

      <section className="dish-information-grid">
        <article><h2>What’s inside</h2><p>Prepared with simple, familiar ingredients by this home kitchen.</p><div className="ingredient-list">{meta.ingredients.map((ingredient) => <span key={ingredient}>✓ {ingredient}</span>)}</div></article>
        <article><h2>Allergy note</h2><p>{meta.allergens.join(" ")}</p><p className="allergen-help">For dietary requirements, confirm directly with the kitchen before placing an order.</p></article>
        <article><h2>Why Nivala?</h2><p>Support a local home chef and enjoy food made with personal care, not mass-produced in a restaurant kitchen.</p></article>
      </section>

      <section className="dish-reviews">
        <h2>★ {summary.avg} · {summary.count} ratings & reviews</h2>
        <form className="review-form" onSubmit={handleAddReview}>
          <div className="review-form-row">
            <label>Your rating
              <select value={ratingInput} onChange={(e) => setRatingInput(Number(e.target.value))}>
                <option value={5}>★★★★★ (5)</option>
                <option value={4}>★★★★ (4)</option>
                <option value={3}>★★★ (3)</option>
                <option value={2}>★★ (2)</option>
                <option value={1}>★ (1)</option>
              </select>
            </label>
          </div>
          <textarea placeholder="Share how it tasted, portion, packing..." value={commentInput} onChange={(e) => setCommentInput(e.target.value)} rows={3} />
          <button type="submit">Post review as {user?.name || "Guest"}</button>
          <small>Shared reviews save in Nivala cloud · Marked as ✓ Verified order</small>
        </form>
        <div className="review-list">
          {reviews.length === 0 ? <p className="status-message">No written reviews yet — be the first to review this home dish.</p> :
            reviews.map((r) => (
              <div key={r.id} className="review-card">
                <p><strong>{r.name}</strong> · {"★".repeat(r.rating)} <span className="verified-order">✓ Verified order</span></p>
                <p>{r.comment}</p>
              </div>
            ))}
        </div>
      </section>
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
