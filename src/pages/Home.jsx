import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { fallbackFoodImage, getDishImage } from "../utils/dishMeta";

const categoryIcons = {
  "Sweets & Snacks": "plate", "Popular Today": "star", "Try Something New": "spark",
  Healthy: "leaf", "North Indian": "plate", "South Indian": "plate", Snacks: "plate",
};

function OfferFolder({ onRequest }) {
  const [stage, setStage] = useState(0); // 0 closed, 1 half, 2 full
  const folderClass = stage === 0 ? "" : stage === 1 ? "open-half" : "open-full";
  return (
    <>
      <div className="offer-doodle" onClick={() => setStage((s) => (s === 0 ? 1 : s === 1 ? 2 : 0))}>
        <p className="eyebrow">SHH… FIRST TREAT INSIDE</p>
        <h3>Tap the folder — dinner’s on us</h3>
        <div className={`folder ${folderClass}`}>
          <div className="folder-back" />
          <div className="folder-letter">
            <strong>NIVALA50</strong>
            <p>Flat offer + free delivery over ₹499.</p>
          </div>
          <div className="folder-front"><span>save for later</span></div>
        </div>
        <small>{stage === 0 ? "Your first treat is hiding in here" : stage === 1 ? "Click again for full view" : "Tap to close"}</small>
      </div>
      {stage === 2 && (
        <div className="letter-overlay" onClick={() => setStage(0)}>
          <div className="letter-full" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">NIVALA FIRST ORDER</p>
            <h2>NIVALA50</h2>
            <p>Flat offer on your first homemade meal. Free delivery over ₹499. Pickup always free and fresher.</p>
            <p className="muted">Can’t find your craving? Request it — home cooks accept with their price.</p>
            <div className="letter-actions">
              <button className="primary" onClick={() => { setStage(0); document.getElementById("discover-dishes")?.scrollIntoView({ behavior: "smooth" }); }}>Browse dishes →</button>
              <button className="ghost" onClick={() => setStage(0)}>Close</button>
            </div>
            <small>Tap anywhere outside to close</small>
          </div>
        </div>
      )}
    </>
  );
}

function GridMeal({ dish, onOpen, onKitchen }) {
  return (
    <div onClick={onOpen} style={{ background: "#fff", border: "1px solid #ebe9e2", borderRadius: 17, overflow: "hidden", boxShadow: "0 4px 14px rgba(43,36,32,0.06)", cursor: "pointer", minWidth: 0 }}>
      <div style={{ position: "relative", height: 140 }}>
        <img src={getDishImage(dish)} alt={dish.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackFoodImage; }} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ color: "#26362e", fontFamily: "Fraunces, Georgia, serif", fontWeight: 700, fontSize: 16, lineHeight: 1.3, margin: "0 0 4px" }}>{dish.name}</div>
        <div onClick={(e) => { e.stopPropagation(); onKitchen(); }} style={{ color: "#285c45", fontSize: 12, fontWeight: 700, textDecoration: "underline", marginBottom: 8 }}>{dish.channel}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#e56437", fontFamily: "Fraunces, Georgia, serif", fontWeight: 700, fontSize: 19 }}>₹{dish.price}</span>
          <span style={{ color: "#36754d", fontSize: 11, fontWeight: 700 }}>★ {dish.rating}</span>
        </div>
      </div>
    </div>
  );
}

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

  const chooseStaple = (term) => {
    setSelectedCategory("");
    setSearchTerm(term);
    setIsSidebarOpen(false);
    document.getElementById("discover-dishes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const staples = ["Tawa Roti", "Dal Tadka", "Pani Puri", "Aloo Tikki", "Rajma Chawal", "Veg Thali"];

  return (
    <main className="home-page">
      <header className="home-header">
        <div className="header-brand">
          <button className="menu-button" aria-label="Open menu" onClick={() => setIsSidebarOpen(true)}><Icon name="menu" /></button>
          <button className="brand-button" onClick={() => chooseCategory("")}><Icon name="plate" size={22} /> Nivala</button>
        </div>
        <label className="home-search"><Icon name="search" size={18} /><input type="search" placeholder="Search for dishes or kitchens" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setSelectedCategory(""); }} /></label>
        <div className="header-actions">
          <button className="cart-button" aria-label="View cart" onClick={() => navigate("/cart")}><Icon name="cart" size={20} />{totalItems > 0 && <span>{totalItems}</span>}</button>
          <div className="welcome-user">Hi, {user?.name || "there"}</div>
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
            <div className="hero-trust"><span className="trust-avatars"><Icon name="chef" size={20} /></span><p><strong>Made with care</strong><br />by local home chefs</p></div>
          </div>
          <div className="hero-visual" aria-label="A selection of home-cooked meals">
            {featuredDishes.slice(0, 3).map((dish, index) => <img key={dish._id} className={`hero-food hero-food-${index + 1}`} src={getDishImage(dish)} alt={dish.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackFoodImage; }} />)}
            <div className="hero-rating">★ 4.8 <span>community favourite</span></div><div className="hero-badge">✦ Freshly made<br /><strong>near you</strong></div>
          </div>
        </section>

        <section className="category-section" aria-labelledby="browse-categories">
          <div className="section-heading"><div><p className="eyebrow">FIND YOUR FAVOURITE</p><h2 id="browse-categories">What are you craving?</h2></div><button onClick={() => setIsSidebarOpen(true)}>View all categories →</button></div>
          <div className="category-pills">{categories.map((category) => <button key={category} className="category-card" onClick={() => chooseCategory(category)}><Icon name={categoryIcons[category] || "plate"} size={28} /><strong>{category}</strong><small>Explore meals →</small></button>)}</div>
        </section>

        <section className="home-section">
          <div className="section-heading"><div><p className="eyebrow">GHAR KA KHANA</p><h2>Homemade staples</h2></div><button onClick={() => chooseCategory("Homemade Staples")}>See all staples →</button></div>
          <div className="category-pills">{staples.map((s) => <button key={s} className="category-card" onClick={() => chooseStaple(s)}><Icon name="plate" size={28} /><strong>{s}</strong><small>From home kitchens →</small></button>)}</div>
        </section>

        <section className="trust-strip">
          <div><Icon name="home" size={22} /><p><strong>Local home kitchens</strong><br />Meals made in your community</p></div>
          <div><Icon name="leaf" size={22} /><p><strong>Fresh, real ingredients</strong><br />Comfort food made with care</p></div>
          <div><Icon name="heart" size={22} /><p><strong>Support home chefs</strong><br />Every order empowers a local cook</p></div>
        </section>

        <section className="home-section">
          <div className="section-heading"><div><p className="eyebrow">CAN'T FIND IT? ASK FOR IT</p><h2>Request a dish, cooks respond</h2></div><button onClick={() => navigate("/requests")}>Make a request →</button></div>
          <p className="status-message" style={{ padding: "0 0 12px" }}>Customer → Request → Home Cook → Order · Sellers see a live Demand Map of what your area craves.</p>
        </section>

        <section id="featured-kitchens" className="home-section">
          <div className="section-heading"><div><p className="eyebrow">LOVED BY THE COMMUNITY</p><h2>Popular right now</h2></div><button onClick={() => chooseCategory("")}>See all meals →</button></div>
          <div className="dish-row">{featuredDishes.map((dish) => <div key={dish._id} onClick={() => navigate(`/dish/${dish._id}`)}><FoodCard dish={dish} /></div>)}
            <OfferFolder onRequest={() => navigate("/requests")} />
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading"><div><p className="eyebrow">WHY NIVALA</p><h2>Homemade you can trust</h2></div></div>
          <div className="category-pills">
            <div className="category-card"><Icon name="shield" size={28} /><strong>Verified kitchens</strong><small>Sellers declare hygiene + kitchen details. Verified badge after review.</small></div>
            <div className="category-card"><Icon name="leaf" size={28} /><strong>Hygiene first</strong><small>Small batches, fresh ingredients, allergen notes on every dish.</small></div>
            <div className="category-card"><Icon name="chat" size={28} /><strong>Complaints + refunds</strong><small>Wrong or late order? Message kitchen from order ID. Refund in demo credits for now.</small></div>
            <div className="category-card"><Icon name="scooter" size={28} /><strong>Pickup or delivery</strong><small>Pickup free + fresher. Delivery fee shown upfront, free over ₹499.</small></div>
          </div>
          <p className="status-message" style={{ padding: "12px 0 0", fontSize: "13px" }}>Food-business note: home sellers are advised to follow FSSAI home-food guidelines. Nivala shows kitchen, ingredients and allergens before you pay.</p>
        </section>
      </>}

      <section id="discover-dishes" className="home-section discover-section">
        <div className="section-heading"><div><p className="eyebrow">{isFiltered ? "YOUR RESULTS" : "MORE TO DISCOVER"}</p><h2>{selectedCategory ? selectedCategory : searchTerm ? `Results for “${searchTerm}”` : "All homemade meals"}</h2></div>{isFiltered && <button className="clear-filter" onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}>Clear filters ×</button>}</div>
        {loading ? <p className="status-message">Preparing today’s menu…</p> : filteredDishes.length === 0 ? <p className="status-message">No meals found. Try another search or category.</p> : <div className="dish-grid">{filteredDishes.map((dish) => <GridMeal key={dish._id} dish={dish} onOpen={() => navigate(`/dish/${dish._id}`)} onKitchen={() => navigate(`/channel/${encodeURIComponent(dish.channel)}`)} />)}</div>}
      </section>

      <footer className="nivala-footer">
        <div>
          <strong><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Icon name="plate" size={20} /></span>Nivala</strong>
          <p>Homemade food from real home kitchens. Support local cooks.</p>
        </div>
        <div>
          <p className="eyebrow">TRUST</p>
          <p>Verified kitchens · Hygienic prep · Ingredients + allergens shown · FSSAI home-food guidelines advised</p>
        </div>
        <div>
          <p className="eyebrow">HELP</p>
          <p>Wrong or late order? Use your order ID in Profile → Orders. Refunds in demo credits for now.</p>
          <button onClick={() => navigate("/requests")}>Request a dish →</button>
        </div>
      </footer>
    </main>
  );
}

export default Home;
