export const API_BASE = "https://nivala-backend.onrender.com";

async function req(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const api = {
  createOrder: (order) => req("/api/orders", { method: "POST", body: JSON.stringify(order) }),
  listOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req(`/api/orders${q ? `?${q}` : ""}`);
  },
  updateOrderStatus: (id, status) =>
    req(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  createDish: (dish) => req("/api/dishes", { method: "POST", body: JSON.stringify(dish) }),
  updateDish: (id, patch) => req(`/api/dishes/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  listChannelDishes: (channel) => req(`/api/channels/${encodeURIComponent(channel)}`),
  saveKitchen: (kitchen) => req("/api/kitchens", { method: "POST", body: JSON.stringify(kitchen) }),
  createRequest: (r) => req("/api/requests", { method: "POST", body: JSON.stringify(r) }),
  listRequests: () => req("/api/requests"),
  acceptRequest: (id, kitchen) => req(`/api/requests/${id}/accept`, { method: "PATCH", body: JSON.stringify({ kitchen }) }),
  demand: () => req("/api/demand"),
};
