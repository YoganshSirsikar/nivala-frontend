import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import Sidebar from "../components/Sidebar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dishes, setDishes] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("https://nivala-backend.onrender.com/api/dishes")
    .then((res) => res.json())
    .then((data) => {
      setDishes(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Failed to fetch dishes:", err);
      setLoading(false);
    });
}, []);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

const handleLogout = () => {
  logout();
  navigate("/login");
}; 

  const handleCardClick = (id) => {
    navigate(`/dish/${id}`);
  };

  // Filter dishes by name OR channel, case-insensitive
  const searchedDishes = dishes.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(term) ||
      d.channel.toLowerCase().includes(term)
    );
  });

  const categories = [...new Set(dishes.map((d) => d.category).filter(Boolean))];
  const filteredDishes = selectedCategory
    ? searchedDishes.filter((dish) => dish.category === selectedCategory)
    : searchedDishes;
  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="home-page" style={styles.app}>
      {loading && <p className="home-loading">Loading dishes...</p>}
      {/* Header */}
      <header className="home-header" style={styles.header}>
  <div style={styles.headerLeft}>
    <button style={styles.hamburger} onClick={() => setIsSidebarOpen(true)}>
      ☰
    </button>
    <h1 style={styles.logo}>🍲 Nivala</h1>
  </div>
  <input
    className="home-search"
    type="text"
    placeholder="Search for dishes or channels..."
    style={styles.searchBar}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <button style={styles.cartButton} onClick={() => navigate("/cart")}>
  🛒
  {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
</button>
<div className="home-user-section" style={styles.userSection}>
  <span style={styles.userGreeting}>
    Hi, {user?.name} 👋
  </span>
  <button style={styles.logoutButton} onClick={handleLogout}>
    Logout
  </button>
</div>
</header>

<Sidebar
  isOpen={isSidebarOpen}
  onClose={() => setIsSidebarOpen(false)}
  categories={categories}
  selectedCategory={selectedCategory}
  onCategorySelect={(category) => {
    setSelectedCategory(category);
    setIsSidebarOpen(false);
  }}
/>

      {/* If searching, show flat results. Otherwise show categorized rows. */}
      {isSearching ? (
        <section className="home-section" style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {filteredDishes.length} result{filteredDishes.length !== 1 ? "s" : ""} for "{searchTerm}"
          </h2>
          {filteredDishes.length === 0 ? (
            <p style={styles.noResults}>No dishes or channels match your search.</p>
          ) : (
            <div className="dish-grid" style={styles.grid}>
              {filteredDishes.map((dish) => (
                <div key={dish._id} onClick={() => handleCardClick(dish._id)}>
                  <FoodCard dish={dish} />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {categories.filter((category) => !selectedCategory || category === selectedCategory).map((category) => (
            <section key={category} className="home-section" style={styles.section}>
              <h2 style={styles.sectionTitle}>{category}</h2>
              <div className="dish-row" style={styles.horizontalScroll}>
                {filteredDishes
                  .filter((d) => d.category === category)
                  .map((dish) => (
                    <div key={dish._id} onClick={() => handleCardClick(dish._id)}>
                      <FoodCard dish={dish} />
                    </div>
                  ))}
              </div>
            </section>
          ))}

          <section className="home-section" style={styles.section}>
            <h2 style={styles.sectionTitle}>{selectedCategory ? `${selectedCategory} Dishes` : "All Dishes"}</h2>
            {filteredDishes.length === 0 ? <p style={styles.noResults}>No dishes are available in this category.</p> : <div className="dish-grid" style={styles.grid}>
              {filteredDishes.map((dish) => (
                <div key={dish._id} onClick={() => handleCardClick(dish._id)}>
                  <FoodCard dish={dish} />
                </div>
              ))}
            </div>}
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  app: {
    backgroundColor: "var(--color-bg)",
    minHeight: "100vh",
    padding: "24px 40px",
    fontFamily: "var(--font-body)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userGreeting: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--color-text)",
  },
  logoutButton: {
    background: "none",
    border: "1px solid rgba(43, 36, 32, 0.15)",
    color: "var(--color-muted)",
    padding: "6px 14px",
    borderRadius: "16px",
    fontSize: "12px",
    cursor: "pointer",
  },
  hamburger: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "var(--color-text)",
    padding: "4px 8px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  logo: {
    color: "var(--color-green)",
    margin: 0,
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: "26px",
  },
  searchBar: {
    padding: "12px 18px",
    borderRadius: "24px",
    border: "1px solid rgba(43, 36, 32, 0.15)",
    width: "320px",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    backgroundColor: "var(--color-card)",
    color: "var(--color-text)",
    outline: "none",
  },
  section: {
    marginBottom: "36px",
  },
  sectionTitle: {
    color: "var(--color-text)",
    marginBottom: "16px",
    fontFamily: "var(--font-heading)",
    fontSize: "20px",
    fontWeight: 600,
  },
  horizontalScroll: {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    paddingBottom: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  cartButton: {
    position: "relative",
    background: "var(--color-card)",
    border: "1px solid rgba(43, 36, 32, 0.15)",
    borderRadius: "50%",
    width: "44px",
    height: "44px",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    backgroundColor: "var(--color-orange)",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noResults: {
    color: "var(--color-muted)",
  },
};
export default Home;
