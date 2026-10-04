const REVIEWS_KEY = "nivala-reviews-v1";

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAll(data) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(data));
}

export function getReviews(dishId) {
  const all = loadAll();
  return all[dishId] || [];
}

export function addReview(dishId, { name, rating, comment }) {
  const all = loadAll();
  const list = all[dishId] || [];
  const review = {
    id: `${Date.now()}`,
    name: name || "Guest",
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    comment: (comment || "").slice(0, 300),
    date: new Date().toISOString(),
    verified: true,
  };
  all[dishId] = [review, ...list].slice(0, 50);
  saveAll(all);
  return review;
}

export function getReviewSummary(dish) {
  const local = getReviews(dish._id);
  const baseCount = dish.reviewCount ?? Math.max(8, Math.round((dish.rating || 4.5) * 23));
  const baseRating = dish.rating || 4.5;
  if (local.length === 0) return { count: baseCount, avg: baseRating };
  const total = baseRating * baseCount + local.reduce((s, r) => s + r.rating, 0);
  const count = baseCount + local.length;
  return { count, avg: (total / count).toFixed(1) };
}
