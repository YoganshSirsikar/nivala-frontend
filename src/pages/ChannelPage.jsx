import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import Icon from "../components/Icon";
import { fallbackFoodImage, getDishImage } from "../utils/dishMeta";

const getKitchenDetails = (channel, dishes) => {
  const specialties = [...new Set(dishes.map((dish) => dish.category).filter(Boolean))].slice(0, 3);
  const firstName = channel.split("'")[0].split(" ")[0];
  return {
    chefName: channel.includes("Kitchen") ? channel.replace("'s Kitchen", "") : firstName,
    specialties,
    years: channel.includes("Sweets") ? "8+ years" : "5+ years",
    location: "Local home kitchen",
    story: `${channel} brings the comfort of familiar, home-cooked food to the neighbourhood. Every meal is prepared in small batches with care, fresh ingredients, and recipes made to be shared.`,
  };
};

function ChannelPage() {
  const { channelName } = useParams();
  const navigate = useNavigate();
  const [channelDishes, setChannelDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const decodedName = decodeURIComponent(channelName);
  const followKey = `nivala-following-${decodedName}`;
  const [isFollowing, setIsFollowing] = useState(() => localStorage.getItem(followKey) === "true");

  useEffect(() => {
    fetch(`https://nivala-backend.onrender.com/api/channels/${encodeURIComponent(decodedName)}`)
      .then((res) => res.json())
      .then((data) => setChannelDishes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch channel dishes:", err))
      .finally(() => setLoading(false));
  }, [decodedName]);

  const kitchen = useMemo(() => getKitchenDetails(decodedName, channelDishes), [decodedName, channelDishes]);
  const averageRating = channelDishes.length
    ? (channelDishes.reduce((total, dish) => total + (dish.rating || 0), 0) / channelDishes.length).toFixed(1)
    : "–";
  const menuImage = channelDishes[0] ? getDishImage(channelDishes[0]) : fallbackFoodImage;

  const toggleFollow = () => {
    const nextValue = !isFollowing;
    setIsFollowing(nextValue);
    localStorage.setItem(followKey, String(nextValue));
  };

  return (
    <main className="app-page kitchen-page">
      <header className="kitchen-header">
        <button className="brand-button" onClick={() => navigate("/")}><Icon name="plate" size={20} /> Nivala</button>
        <button className="back-home" onClick={() => navigate("/")}>← Back to home</button>
      </header>

      {loading ? <p className="status-message">Opening this kitchen…</p> : <>
        <section className="kitchen-hero">
          <div className="kitchen-hero-image"><img src={menuImage} alt={`${decodedName} food`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackFoodImage; }} /></div>
          <div className="kitchen-hero-content">
            <p className="eyebrow">HOME KITCHEN PROFILE</p>
            <div className="kitchen-title-row"><h1>{decodedName}</h1><span className="verified-kitchen">✓ Verified kitchen</span></div>
            <p className="kitchen-location">⌖ {kitchen.location} · Made fresh to order</p>
            <p className="kitchen-intro">{kitchen.story}</p>
            <div className="kitchen-specialties">{kitchen.specialties.map((specialty) => <span key={specialty}>{specialty}</span>)}</div>
            <div className="kitchen-actions"><button className={isFollowing ? "following-button" : "follow-button"} onClick={toggleFollow}>{isFollowing ? "✓ Following" : "+ Follow this kitchen"}</button><button className="view-menu-button" onClick={() => document.getElementById("kitchen-menu")?.scrollIntoView({ behavior: "smooth" })}>View menu ↓</button></div>
          </div>
        </section>

        <section className="kitchen-stats">
          <div><Icon name="star" size={20} /><p><strong>{averageRating}</strong><br />Average rating</p></div>
          <div><Icon name="plate" size={20} /><p><strong>{channelDishes.length}</strong><br />Dishes available</p></div>
          <div><Icon name="heart" size={20} /><p><strong>{isFollowing ? "You follow" : "Follow"}</strong><br />for menu updates</p></div>
          <div><Icon name="clock" size={20} /><p><strong>{kitchen.years}</strong><br />Cooking experience</p></div>
        </section>

        <section className="kitchen-story-section">
          <article className="chef-note"><p className="eyebrow">FROM THE KITCHEN</p><h2>“Every meal should feel like someone cared enough to make it for you.”</h2><p>— {kitchen.chefName}, home chef at {decodedName}</p></article>
          <article className="kitchen-promise"><h2>What to expect</h2><ul><li>✓ Prepared in small batches</li><li>✓ Fresh ingredients and home-style flavour</li><li>✓ Clear dish information before you order</li></ul></article>
        </section>

        <section id="kitchen-menu" className="kitchen-menu">
          <div className="section-heading"><div><p className="eyebrow">TODAY’S MENU</p><h2>Made by {kitchen.chefName}</h2></div><p className="menu-note">Tap a dish to see details</p></div>
          {channelDishes.length === 0 ? <p className="status-message">This kitchen has no dishes listed yet.</p> : <div className="dish-grid">{channelDishes.map((dish) => <div key={dish._id} onClick={() => navigate(`/dish/${dish._id}`)}><FoodCard dish={dish} /></div>)}</div>}
        </section>
      </>}
    </main>
  );
}

export default ChannelPage;
