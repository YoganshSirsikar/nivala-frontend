import { useNavigate } from "react-router-dom";
import { fallbackFoodImage, getDishImage, getDishMeta } from "../utils/dishMeta";
import Icon from "../components/Icon";

export default function FoodCard({ dish }) {
  const navigate = useNavigate();
  const meta = getDishMeta(dish);
  const handleChannelClick = (e) => {
    e.stopPropagation();
    navigate(`/channel/${encodeURIComponent(dish.channel)}`);
  };

  return (
    <article className="food-card">
      <div className="food-card-image-wrap">
        <img
          src={getDishImage(dish)}
          alt={dish.name}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = fallbackFoodImage;
        }}
        />
        <span className="diet-badge">{meta.isVegetarian ? "● Veg" : "● Non-veg"}</span>
        {!meta.isAvailable && <span className="sold-out-badge">Sold out</span>}
      </div>
      <div className="food-card-info">
        <p className="meal-title" style={{ display: "block", visibility: "visible", opacity: 1, whiteSpace: "normal", overflow: "visible", textOverflow: "clip", color: "#26362e", fontFamily: "Fraunces, Georgia, serif", fontWeight: 700, fontSize: "16px", lineHeight: 1.3, margin: "0 0 4px", padding: 0, height: "auto", maxHeight: "none" }}>{dish.name}</p>
        <button className="meal-kitchen" style={{ display: "block", visibility: "visible", opacity: 1, whiteSpace: "normal", overflow: "visible", background: "transparent", border: 0, color: "#285c45", fontSize: "12px", fontWeight: 700, padding: 0, margin: "0 0 6px", textAlign: "left", textDecoration: "underline", cursor: "pointer", height: "auto" }} onClick={handleChannelClick}>
          {dish.channel}
        </button>
        <div className="food-card-meta"><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="clock" size={12} /> {meta.prepTime}</span><span>★ {dish.rating} ({meta.reviewCount})</span></div>
        <div className="food-card-bottom">
          <span className="food-card-price">₹{dish.price}</span>
          <span className={meta.isAvailable ? "availability" : "availability unavailable"}>{meta.isAvailable ? "Available" : "Unavailable"}</span>
        </div>
      </div>
    </article>
  );
}
