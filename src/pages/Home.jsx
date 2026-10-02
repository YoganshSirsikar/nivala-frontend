import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import Sidebar from "../components/Sidebar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const categoryIcons = {
  "Sweets & Snacks": "🍬", "Popular Today": "🔥", "Try Something New": "✨",
  Healthy: "🥗", "North Indian": "🍛", "South Indian": "🥘", Snacks: "🥟",
};

function Home() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://nivala-backend.onrender.com/api/dishes")
      .then((res) => res.json())
      .then((data) => setDishes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch dishes:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(dishes.map((dish) => dish.category).filter(Boolean))], [dishes]);
  const searchedDishes = dishes.filter((dish) => {
    const term = searchTerm.trim().toLowerCase();
    return !term || dish.name.toLowerCase().includes(term) || dish.channel.toLowerCase().includes(term);
  });
  const filteredDishes = selectedCategory ? searchedDishes.filter((dish) => dish.category === selectedCategory) : searchedDishes;
  const featuredDishes = [...dishes].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
  const isFiltered = Boolean(searchTerm.trim() || selectedCategory);

  const chooseCategory = (category) => {
    setSelectedCategory(category);
    setSearchTerm("");
    setIsSidebarOpen(false);
    document.getElementById("discover-dishes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="home-page">
      <header className="home-header">
        <div className="header-brand">
          <button className="menu-button" aria-label="Open menu" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <button className="brand-button" onClick={() => chooseCategory("")}><span>🍲</span> Nivala</button>
        </div>
        <label className="home-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search for dishes or kitchens" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setSelectedCategory(""); }} /></label>
        <div className="header-actions">
          <button className="cart-button" aria-label="View cart" onClick={() => navigate("/cart")}>🛒{totalItems > 0 && <span>{totalItems}</span>}</button>
          <div className="welcome-user">Hi, {user?.name || "there"} <span>👋</span></div>
          <button className="logout-button" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} categories={categories} selectedCategory={selectedCategory} onCategorySelect={chooseCategory} />

      {!isFiltered && <>
        <section className="home-hero">
          <div className="hero-copy">
            <p className="eyebrow">HOME-COOKED, MADE LOCAL</p>
            <h1>Food that feels like <em>home.</em></h1>
            <p className="hero-description">Discover comforting, freshly made meals from passionate home chefs in your community.</p>
            <div className="hero-actions"><button className="primary-action" onClick={() => document.getElementById("discover-dishes")?.scrollIntoView({ behavior: "smooth" })}>Explore meals <span>→</span></button><button className="text-action" onClick={() => document.getElementById("featured-kitchens")?.scrollIntoView({ behavior: "smooth" })}>Meet our kitchens</button></div>
            <div className="hero-trust"><span className="trust-avatars">🍲 🧑‍🍳 👩‍🍳</span><p><strong>Made with care</strong><br />by local home chefs</p></div>
          </div>
          <div className="hero-visual" aria-label="A selection of home-cooked meals">
            {featuredDishes.slice(0, 3).map((dish, index) => <img key={dish._id} className={`hero-food hero-food-${index + 1}`} src={dish.image} alt={dish.name} />)}
            <div className="hero-rating">★ 4.8 <span>community favourite</span></div><div className="hero-badge">✦ Freshly made<br /><strong>near you</strong></div>
          </div>
        </section>

        <section className="category-section" aria-labelledby="browse-categories">
          <div className="section-heading"><div><p className="eyebrow">FIND YOUR FAVOURITE</p><h2 id="browse-categories">What are you craving?</h2></div><button onClick={() => setIsSidebarOpen(true)}>View all categories →</button></div>
          <div className="category-pills">{categories.map((category) => <button key={category} className="category-card" onClick={() => chooseCategory(category)}><span>{categoryIcons[category] || "🍽️"}</span><strong>{category}</strong><small>Explore meals →</small></button>)}</div>
        </section>

        <section className="trust-strip">
          <div><span>🏠</span><p><strong>Local home kitchens</strong><br />Meals made in your community</p></div>
          <div><span>🌿</span><p><strong>Fresh, real ingredients</strong><br />Comfort food made with care</p></div>
          <div><span>💛</span><p><strong>Support home chefs</strong><br />Every order empowers a local cook</p></div>
        </section>

        <section id="featured-kitchens" className="home-section">
          <div className="section-heading"><div><p className="eyebrow">LOVED BY THE COMMUNITY</p><h2>Popular right now</h2></div><button onClick={() => chooseCategory("")}>See all meals →</button></div>
          <div className="dish-row">{featuredDishes.map((dish) => <div key={dish._id} onClick={() => navigate(`/dish/${dish._id}`)}><FoodCard dish={dish} /></div>)}</div>
        </section>
      </>}

      <section id="discover-dishes" className="home-section discover-section">
        <div className="section-heading"><div><p className="eyebrow">{isFiltered ? "YOUR RESULTS" : "MORE TO DISCOVER"}</p><h2>{selectedCategory ? selectedCategory : searchTerm ? `Results for “${searchTerm}”` : "All homemade meals"}</h2></div>{isFiltered && <button className="clear-filter" onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}>Clear filters ×</button>}</div>
        {loading ? <p className="status-message">Preparing today’s menu…</p> : filteredDishes.length === 0 ? <p className="status-message">No meals found. Try another search or category.</p> : <div className="dish-grid">{filteredDishes.map((dish) => <div key={dish._id} onClick={() => navigate(`/dish/${dish._id}`)}><FoodCard dish={dish} /></div>)}</div>}
      </section>
    </main>
  );
}

export default Home;
