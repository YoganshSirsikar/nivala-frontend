import { useNavigate } from "react-router-dom";
import { fallbackFoodImage, getDishImage, getDishMeta } from "../utils/dishMeta";

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
        <h3>{dish.name}</h3>
        <button className="food-card-channel" onClick={handleChannelClick}>
          {dish.channel}
        </button>
        <div className="food-card-meta"><span>⏱ {meta.prepTime}</span><span>★ {dish.rating} ({meta.reviewCount})</span></div>
        <div className="food-card-bottom">
          <span className="food-card-price">₹{dish.price}</span>
          <span className={meta.isAvailable ? "availability" : "availability unavailable"}>{meta.isAvailable ? "Available" : "Unavailable"}</span>
        </div>
      </div>
    </article>
  );
}
